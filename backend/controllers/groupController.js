/**
 * @module groupController
 * CRUD handlers for ProductGroup resources.
 * Deleting a group performs a cascading delete: all AssetTypes belonging to
 * the group and all Assets belonging to those types are removed first so that
 * no orphaned documents remain in the database.
 */

const ProductGroup = require('../models/ProductGroup');
const AssetType    = require('../models/AssetType');
const Asset        = require('../models/Asset');

/**
 * GET /api/groups
 * Returns all product groups sorted alphabetically by name.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
const listGroups = async (req, res) => {
  try {
    const groups = await ProductGroup.find().sort({ name: 1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/groups
 * Creates a new product group. Requires a non-empty `name` in the request body.
 *
 * @param {import('express').Request}  req - body: { name: string }
 * @param {import('express').Response} res - 201 with the created group, or 400 if name missing
 */
const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });
    const group = await ProductGroup.create({ name: name.trim() });
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE /api/groups/:id
 * Deletes a product group and all of its child AssetTypes and Assets in order,
 * preventing orphaned documents. The three-step cascade must be sequential:
 *   1. Collect type IDs belonging to the group
 *   2. Delete all assets that reference those type IDs
 *   3. Delete the types, then the group itself
 *
 * @param {import('express').Request}  req - params: { id: string }
 * @param {import('express').Response} res - { success: true } on success
 */
const deleteGroup = async (req, res) => {
  try {
    const types   = await AssetType.find({ groupId: req.params.id });
    const typeIds = types.map(t => t._id);
    await Asset.deleteMany({ typeId: { $in: typeIds } });
    await AssetType.deleteMany({ groupId: req.params.id });
    await ProductGroup.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listGroups, createGroup, deleteGroup };
