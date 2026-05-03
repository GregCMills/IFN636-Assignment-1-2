/**
 * @module groupController
 * CRUD handlers for ProductGroup resources.
 * Deleting a group uses the Composite pattern: an InventoryTreeBuilder builds
 * the full subtree and delete() cascades recursively through all child
 * AssetTypes and Assets, preventing orphaned documents.
 */

const ProductGroup = require('../models/ProductGroup');
const InventoryTreeBuilder = require('../services/inventory/InventoryTreeBuilder');

/**
 * GET /api/groups
 * Returns all product groups sorted alphabetically by name.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
const listGroups = async (req, res) => {
  const groups = await ProductGroup.find().sort({ name: 1 });
  res.json(groups);
};

/**
 * POST /api/groups
 * Creates a new product group. Requires a non-empty `name` in the request body.
 *
 * @param {import('express').Request}  req - body: { name: string }
 * @param {import('express').Response} res - 201 with the created group, or 400 if name missing
 */
const createGroup = async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });
  const group = await ProductGroup.create({ name: name.trim() });
  res.status(201).json(group);
};

/**
 * DELETE /api/groups/:id
 * Builds the full inventory tree rooted at this group via InventoryTreeBuilder,
 * then calls delete() to recursively remove all child AssetTypes and Assets
 * before removing the group itself. Passes null as the storageStrategy so
 * photo file deletion is skipped (placeholder for the future photo plan).
 *
 * @param {import('express').Request}  req - params: { id: string }
 * @param {import('express').Response} res - { success: true } or 404 if not found
 */
const deleteGroup = async (req, res) => {
  const root = await InventoryTreeBuilder.fromGroupId(req.params.id);
  if (!root) return res.status(404).json({ message: 'Group not found' });
  await root.delete(null);
  res.json({ success: true });
};

module.exports = { listGroups, createGroup, deleteGroup };
