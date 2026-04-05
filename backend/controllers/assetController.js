const Asset = require('../models/Asset');

/** Clerk v2 exposes req.auth as a function; v1 / test stubs expose it as a plain object. */
const getAuthUserId = (req) =>
  typeof req.auth === 'function' ? req.auth()?.userId : req.auth?.userId;

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
    const { clerkClient } = require('@clerk/express');
    try {
      const { data: clerkUsers } = await clerkClient.users.getUserList({ userId: uniqueUserIds });
      clerkUsers.forEach(u => {
        userMap[u.id] = {
          email: u.emailAddresses[0]?.emailAddress ?? '',
          name:  [u.firstName, u.lastName].filter(Boolean).join(' ') || null,
        };
      });
    } catch {
      // Clerk unavailable — return assets without enrichment rather than failing
    }
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
  try {
    const assets = await Asset.find().sort({ name: 1 });
    res.json(await enrichWithClerkUsers(assets));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createAsset = async (req, res) => {
  try {
    const { typeId, name } = req.body;
    if (!typeId || !name?.trim()) return res.status(400).json({ message: 'typeId and name are required' });
    const asset = await Asset.create({ typeId, name: name.trim(), status: 'Available' });
    res.status(201).json(asset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAsset = async (req, res) => {
  try {
    await Asset.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * PATCH /api/assets/bulk-status
 * Body: { ids: string[], status: string, clearRentalData?: boolean }
 * Admins can set any status. Customers may only transition Rented ↔ Pending Return
 * on assets they own.
 */
const bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status, clearRentalData } = req.body;
    if (!ids?.length || !status) return res.status(400).json({ message: 'ids and status are required' });

    const { clerkClient } = require('@clerk/express');
    const clerkUser = await clerkClient.users.getUser(getAuthUserId(req));
    const isAdmin   = clerkUser.publicMetadata?.role === 'admin';

    if (!isAdmin) {
      const allowed = ['Rented', 'Pending Return'];
      if (!allowed.includes(status)) {
        return res.status(403).json({ message: 'Not authorised for this status transition' });
      }
      const owned = await Asset.find({ _id: { $in: ids }, rentedByUserId: getAuthUserId(req) });
      if (owned.length !== ids.length) {
        return res.status(403).json({ message: 'You can only update your own assets' });
      }
    }

    const update = clearRentalData
      ? { status, $unset: { rentedByUserId: 1, returnDate: 1 } }
      : { status };

    await Asset.updateMany({ _id: { $in: ids } }, update);
    const updated = await Asset.find({ _id: { $in: ids } });
    res.json(await enrichWithClerkUsers(updated));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/assets/request-rental
 * Body: { items: [{ typeId, quantity }], returnDate: 'YYYY-MM-DD' }
 * Marks available units as 'Pending Rental' for the authenticated user.
 */
const requestRental = async (req, res) => {
  try {
    const { items, returnDate } = req.body;
    if (!items?.length || !returnDate) return res.status(400).json({ message: 'items and returnDate are required' });

    const updatedAssets = [];

    for (const { typeId, quantity } of items) {
      const available = await Asset.find({ typeId, status: 'Available' }).limit(quantity);
      if (available.length < quantity) {
        return res.status(409).json({ message: `Not enough units available` });
      }
      for (const asset of available) {
        asset.status         = 'Pending Rental';
        asset.rentedByUserId = getAuthUserId(req);
        asset.returnDate     = returnDate;
        await asset.save();
        updatedAssets.push(asset);
      }
    }

    res.json(updatedAssets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/assets/batch
 * Body: { typeId: string, names: string[] }
 * Creates all units in a single insertMany call and returns the created documents.
 */
const batchCreateAssets = async (req, res) => {
  try {
    const { typeId, names } = req.body;
    if (!typeId || !Array.isArray(names) || names.length === 0) {
      return res.status(400).json({ message: 'typeId and a non-empty names array are required' });
    }
    const docs    = names.map(name => ({ typeId, name: name.trim(), status: 'Available' }));
    const created = await Asset.insertMany(docs);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/assets/reset-seed  (admin only — enforced by adminMiddleware on the route)
 * Full reset: deletes all Assets, AssetTypes, and ProductGroups, then re-creates
 * everything from the standard seed set so the type-name lookup always succeeds.
 */
const SEED_GROUPS = [
  { name: 'Laptops' },
  { name: 'Projectors' },
  { name: 'Cameras' },
  { name: 'Audio' },
];

const SEED_TYPES = [
  { groupName: 'Laptops',    name: 'MacBook Air M2' },
  { groupName: 'Laptops',    name: 'Dell XPS 15' },
  { groupName: 'Projectors', name: 'Epson 4K Projector' },
  { groupName: 'Cameras',    name: 'Sony A7III Camera' },
  { groupName: 'Audio',      name: 'Rode Wireless GO II' },
];

const SEED_ASSETS = [
  { typeName: 'MacBook Air M2',      name: 'Unit 001',  status: 'Available' },
  { typeName: 'MacBook Air M2',      name: 'Unit 002',  status: 'Available' },
  { typeName: 'MacBook Air M2',      name: 'Unit 003',  status: 'Rented',         rentedByUserId: 'John Ranch', returnDate: '2026-04-15' },
  { typeName: 'Dell XPS 15',         name: 'Unit 001',  status: 'Available' },
  { typeName: 'Epson 4K Projector',  name: 'Unit 001',  status: 'Pending Rental', rentedByUserId: 'Sally Benedict', returnDate: '2026-03-30' },
  { typeName: 'Epson 4K Projector',  name: 'Unit 002',  status: 'Maintenance' },
  { typeName: 'Sony A7III Camera',   name: 'Unit 001',  status: 'Available' },
  { typeName: 'Sony A7III Camera',   name: 'Unit 002',  status: 'Pending Return', rentedByUserId: 'John Ranch', returnDate: '2026-03-20' },
  { typeName: 'Rode Wireless GO II', name: 'Mic Set 1', status: 'Available' },
];

const resetSeedAssets = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listAssets, createAsset, batchCreateAssets, deleteAsset, bulkUpdateStatus, requestRental, resetSeedAssets };
