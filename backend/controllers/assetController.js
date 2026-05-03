const Asset = require('../models/Asset');
const { SEED_GROUPS, SEED_TYPES, SEED_ASSETS } = require('../data/seedData');
const auth = require('../services/auth/ClerkAuthAdapter');
const InventoryTreeBuilder = require('../services/inventory/InventoryTreeBuilder');
const AssetStateMachine = require('../services/asset-states/AssetStateMachine');
const { AdminAuthoriser, CustomerAuthoriser } = require('../services/asset-states/TransitionAuthoriser');
const { ValidationError, NotFoundError, AuthorisationError, AppError } = require('../services/errors/AppError');

// Destructure status constants for readability and to eliminate hardcoded strings
// The order must match Asset.STATUSES: ['Available','Rented','Pending Rental','Pending Return','Maintenance']
const [AVAILABLE, RENTED, PENDING_RENTAL, PENDING_RETURN, MAINTENANCE] = Asset.STATUSES;

/**
 * Enriches an array of Mongoose Asset documents with Clerk user name / email.
 * Returns plain objects ready to serialise.
 */
const enrichWithClerkUsers = async (assets) => {
  const uniqueUserIds = [...new Set(assets.map(a => {
    const plain = typeof a.toJSON === 'function' ? a.toJSON() : a;
    return plain.rentedByUserId;
  }).filter(Boolean))];

  let userMap = {};
  if (uniqueUserIds.length > 0) {
    userMap = await auth.getUsers(uniqueUserIds);
  }

  return assets.map(a => {
    const plain = typeof a.toJSON === 'function' ? a.toJSON() : { ...a };
    const info  = plain.rentedByUserId ? userMap[plain.rentedByUserId] : null;
    if (info) {
      plain.rentedByUserEmail = info.email;
      if (info.name) plain.rentedByUserName = info.name;
    }
    return plain;
  });
};

const listAssets = async (req, res) => {
  const assets = await Asset.find().sort({ name: 1 });
  res.json(await enrichWithClerkUsers(assets));
};

const createAsset = async (req, res) => {
  const { typeId, name } = req.body;
  if (!typeId || !name?.trim()) throw new ValidationError('typeId and name are required');
  const asset = await Asset.create({ typeId, name: name.trim(), status: AVAILABLE });
  res.status(201).json(asset);
};

/**
 * DELETE /api/assets/:id
 * Builds a leaf node via InventoryTreeBuilder, then calls delete() to
 * remove the asset from the database. Passes null as the storageStrategy
 * so photo file deletion is skipped (placeholder for the future photo plan).
 *
 * @param {import('express').Request}  req - params: { id: string }
 * @param {import('express').Response} res - { success: true } or 404 if not found
 */
const deleteAsset = async (req, res) => {
  const root = await InventoryTreeBuilder.fromAssetId(req.params.id);
  if (!root) throw new NotFoundError('Asset not found');
  await root.delete(null);
  res.json({ success: true });
};

/**
 * PATCH /api/assets/bulk-status
 * Body: { ids: string[], status: string, clearRentalData?: boolean }
 *
 * Uses the AssetStateMachine (State pattern) to validate that every
 * requested transition is structurally valid for the asset's current
 * status, then uses the TransitionAuthoriser (Strategy pattern) to
 * check whether the user's role permits the transition.
 *
 * Two-phase validation:
 * 1. State machine checks structural validity (e.g. Available → Rented is invalid)
 * 2. Authoriser checks role permissions (e.g. customer cannot set Maintenance)
 *
 * Admins can perform any structurally valid transition.
 * Customers may only transition Rented ↔ Pending Return on their own assets.
 */
const bulkUpdateStatus = async (req, res) => {
  const { ids, status, clearRentalData } = req.body;
  if (!ids?.length || !status) throw new ValidationError('ids and status are required');

  // Fetch assets before updating so we can validate against current statuses
  const assets = await Asset.find({ _id: { $in: ids } });

  // Determine the user's role and select the appropriate authoriser strategy
  const authUser = await auth.getUser(auth.getUserId(req));
  const isAdmin   = authUser.role === 'admin';
  const authoriser = isAdmin ? new AdminAuthoriser() : new CustomerAuthoriser();

  // Validate each asset's transition before making any changes
  for (const asset of assets) {
    const machine = new AssetStateMachine(asset.status);

    // Phase 1 & 2: structural + authorisational validation
    if (!machine.canTransitionTo(status, authoriser)) {
      throw new AuthorisationError(
        `Not authorised to transition "${asset.name}" from ${asset.status} to ${status}`
      );
    }

    // Ownership check — delegated to the authoriser strategy
    if (!authoriser.verifyOwnership(asset, auth.getUserId(req))) {
      throw new AuthorisationError('You can only update your own assets');
    }
  }

  // Determine whether to clear rental data.  Use the state machine's
  // shouldClearRentalData() as the default.  The explicit clearRentalData
  // flag in the request body can override it (force-clear or force-preserve).
  let shouldClear;
  if (clearRentalData !== undefined) {
    // Client explicitly specified — use their value
    shouldClear = clearRentalData === true;
  } else {
    // No client preference — ask the first asset's state machine.
    // All assets share the same transition so any machine gives the same answer.
    const machine = new AssetStateMachine(assets[0].status);
    shouldClear = machine.shouldClearRentalData(status);
  }

  const update = shouldClear
    ? { status, $unset: { rentedByUserId: 1, returnDate: 1 } }
    : { status };

  await Asset.updateMany({ _id: { $in: ids } }, update);
  const updated = await Asset.find({ _id: { $in: ids } });
  res.json(await enrichWithClerkUsers(updated));
};

/**
 * POST /api/assets/request-rental
 * Body: { items: [{ typeId, quantity }], returnDate: 'YYYY-MM-DD' }
 * Marks available units as 'Pending Rental' for the authenticated user.
 */
const requestRental = async (req, res) => {
  const { items, returnDate } = req.body;
  if (!items?.length || !returnDate) throw new ValidationError('items and returnDate are required');

  const updatedAssets = [];

  for (const { typeId, quantity } of items) {
    const available = await Asset.find({ typeId, status: AVAILABLE }).limit(quantity);
    if (available.length < quantity) {
      throw new AppError('Not enough units available', 409);
    }
    for (const asset of available) {
      asset.status         = PENDING_RENTAL;
      asset.rentedByUserId = auth.getUserId(req);
      asset.returnDate     = returnDate;
      await asset.save();
      updatedAssets.push(asset);
    }
  }

  res.json(updatedAssets);
};

/**
 * POST /api/assets/batch
 * Body: { typeId: string, names: string[] }
 * Creates all units in a single insertMany call and returns the created documents.
 */
const batchCreateAssets = async (req, res) => {
  const { typeId, names } = req.body;
  if (!typeId || !Array.isArray(names) || names.length === 0) {
    throw new ValidationError('typeId and a non-empty names array are required');
  }
  const docs    = names.map(name => ({ typeId, name: name.trim(), status: AVAILABLE }));
  const created = await Asset.insertMany(docs);
  res.status(201).json(created);
};

/**
 * POST /api/assets/reset-seed  (admin only — enforced by adminMiddleware on the route)
 * Full reset: deletes all Assets, AssetTypes, and ProductGroups, then re-creates
 * everything from the standard seed set so the type-name lookup always succeeds.
 */
const resetSeedAssets = async (req, res) => {
  const ProductGroup = require('../models/ProductGroup');
  const AssetType    = require('../models/AssetType');

  // Wipe all three collections
  await Asset.deleteMany({});
  await AssetType.deleteMany({});
  await ProductGroup.deleteMany({});

  // Re-create groups and build name→id map
  const createdGroups = await ProductGroup.insertMany(SEED_GROUPS);
  const groupNameToId = {};
  createdGroups.forEach(g => { groupNameToId[g.name] = g._id; });

  // Re-create types and build name→id map
  const typeDocs = SEED_TYPES.map(t => ({ groupId: groupNameToId[t.groupName], name: t.name }));
  const createdTypes = await AssetType.insertMany(typeDocs);
  const typeNameToId = {};
  createdTypes.forEach(t => { typeNameToId[t.name] = t._id; });

  // Re-create assets
  const assetDocs = SEED_ASSETS.map(s => ({
    typeId: typeNameToId[s.typeName],
    name:   s.name,
    status: s.status,
    ...(s.rentedByUserId ? { rentedByUserId: s.rentedByUserId } : {}),
    ...(s.returnDate     ? { returnDate:     s.returnDate }     : {}),
  }));
  const createdAssets = await Asset.insertMany(assetDocs);

  res.json({
    assets:        createdAssets.map(a => a.toJSON()),
    assetTypes:    createdTypes.map(t => t.toJSON()),
    productGroups: createdGroups.map(g => g.toJSON()),
    skipped:       [],
  });
};

module.exports = { listAssets, createAsset, batchCreateAssets, deleteAsset, bulkUpdateStatus, requestRental, resetSeedAssets };
