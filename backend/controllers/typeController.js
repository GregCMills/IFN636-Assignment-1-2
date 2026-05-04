/**
 * @module typeController
 * CRUD handlers for AssetType resources.
 * Deleting a type uses the Composite pattern: an InventoryTreeBuilder builds
 * the subtree and delete() cascades recursively through all child Assets,
 * preventing orphaned documents when a product model is retired.
 */

const AssetType = require('../models/AssetType');
const InventoryTreeBuilder = require('../services/inventory/InventoryTreeBuilder');
const photoService = require('../services/photo/PhotoService');
const { ValidationError, NotFoundError } = require('../services/errors/AppError');

/**
 * GET /api/types
 * Returns all asset types sorted alphabetically by name.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
const listTypes = async (req, res) => {
  const types = await AssetType.find().sort({ name: 1 });
  res.json(types);
};

/**
 * POST /api/types
 * Creates a new asset type. Both `groupId` and a non-empty `name` are required.
 *
 * @param {import('express').Request}  req - body: { groupId: string, name: string }
 * @param {import('express').Response} res - 201 with the created type, or 400 if fields missing
 */
const createType = async (req, res) => {
  const { groupId, name } = req.body;
  if (!groupId || !name?.trim()) throw new ValidationError('groupId and name are required');
  const type = await AssetType.create({ groupId, name: name.trim() });
  res.status(201).json(type);
};

/**
 * DELETE /api/types/:id
 * Builds the inventory subtree rooted at this type via InventoryTreeBuilder,
 * then calls delete() to recursively remove all child Assets before removing
 * the type itself. Passes the PhotoService's storageStrategy so any photo
 * files are cleaned up from disk during the cascading delete.
 *
 * @param {import('express').Request}  req - params: { id: string }
 * @param {import('express').Response} res - { success: true } or 404 if not found
 */
const deleteType = async (req, res) => {
  const root = await InventoryTreeBuilder.fromTypeId(req.params.id);
  if (!root) throw new NotFoundError('Type not found');
  await root.delete(photoService.storageStrategy);
  res.json({ success: true });
};

module.exports = { listTypes, createType, deleteType };
