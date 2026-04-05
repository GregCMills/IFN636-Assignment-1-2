/**
 * @module typeController
 * CRUD handlers for AssetType resources.
 * Deleting a type also deletes all Assets that reference it, preventing orphaned
 * asset documents when a product model is retired.
 */

const AssetType = require('../models/AssetType');
const Asset     = require('../models/Asset');

/**
 * GET /api/types
 * Returns all asset types sorted alphabetically by name.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
const listTypes = async (req, res) => {
  try {
    const types = await AssetType.find().sort({ name: 1 });
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/types
 * Creates a new asset type. Both `groupId` and a non-empty `name` are required.
 *
 * @param {import('express').Request}  req - body: { groupId: string, name: string }
 * @param {import('express').Response} res - 201 with the created type, or 400 if fields missing
 */
const createType = async (req, res) => {
  try {
    const { groupId, name } = req.body;
    if (!groupId || !name?.trim()) return res.status(400).json({ message: 'groupId and name are required' });
    const type = await AssetType.create({ groupId, name: name.trim() });
    res.status(201).json(type);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE /api/types/:id
 * Deletes an asset type and all Assets that reference it, in order:
 *   1. Delete all assets with matching typeId
 *   2. Delete the type itself
 *
 * @param {import('express').Request}  req - params: { id: string }
 * @param {import('express').Response} res - { success: true } on success
 */
const deleteType = async (req, res) => {
  try {
    await Asset.deleteMany({ typeId: req.params.id });
    await AssetType.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listTypes, createType, deleteType };
