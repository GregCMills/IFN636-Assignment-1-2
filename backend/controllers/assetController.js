const Asset = require('../models/Asset');

const listAssets = async (req, res) => {
  try {
    const assets = await Asset.find().sort({ name: 1 });
    res.json(assets);
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
    const clerkUser = await clerkClient.users.getUser(req.auth.userId);
    const isAdmin   = clerkUser.publicMetadata?.role === 'admin';

    if (!isAdmin) {
      const allowed = ['Rented', 'Pending Return'];
      if (!allowed.includes(status)) {
        return res.status(403).json({ message: 'Not authorised for this status transition' });
      }
      const owned = await Asset.find({ _id: { $in: ids }, rentedByUserId: req.auth.userId });
      if (owned.length !== ids.length) {
        return res.status(403).json({ message: 'You can only update your own assets' });
      }
    }

    const update = clearRentalData
      ? { status, $unset: { rentedByUserId: 1, returnDate: 1 } }
      : { status };

    await Asset.updateMany({ _id: { $in: ids } }, update);
    const updated = await Asset.find({ _id: { $in: ids } });
    res.json(updated);
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
        asset.rentedByUserId = req.auth.userId;
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

module.exports = { listAssets, createAsset, batchCreateAssets, deleteAsset, bulkUpdateStatus, requestRental };
