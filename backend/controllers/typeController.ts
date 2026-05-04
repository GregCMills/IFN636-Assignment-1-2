/**
 * @module typeController
 * CRUD handlers for AssetType resources.
 * Deleting a type uses the Composite pattern: an InventoryTreeBuilder builds
 * the subtree and delete() cascades recursively through all child Assets,
 * preventing orphaned documents when a product model is retired.
 */

import { Request, Response } from 'express';
import AssetType from '../models/AssetType';
import InventoryTreeBuilder from '../services/inventory/InventoryTreeBuilder';
import photoService from '../services/photo/PhotoService';
import { ValidationError, NotFoundError } from '../services/errors/AppError';

/**
 * GET /api/types
 * Returns all asset types sorted alphabetically by name.
 *
 * @param {Request}  req
 * @param {Response} res
 */
export const listTypes = async (req: Request, res: Response) => {
  const types = await AssetType.find().sort({ name: 1 });
  res.json(types);
};

/**
 * POST /api/types
 * Creates a new asset type. Both `groupId` and a non-empty `name` are required.
 *
 * @param {Request}  req - body: { groupId: string, name: string }
 * @param {Response} res - 201 with the created type, or 400 if fields missing
 */
export const createType = async (req: Request, res: Response) => {
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
 * @param {Request}  req - params: { id: string }
 * @param {Response} res - { success: true } or 404 if not found
 */
export const deleteType = async (req: Request, res: Response) => {
  const root = await InventoryTreeBuilder.fromTypeId(req.params.id as string);
  if (!root) throw new NotFoundError('Type not found');
  await root.delete((photoService as any).storageStrategy);
  res.json({ success: true });
};
