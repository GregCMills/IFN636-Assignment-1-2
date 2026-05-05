/**
 * @module groupController
 * CRUD handlers for ProductGroup resources.
 * Deleting a group uses the Composite pattern: an InventoryTreeBuilder builds
 * the full subtree and delete() cascades recursively through all child
 * AssetTypes and Assets, preventing orphaned documents.
 */

import { Request, Response } from 'express';
import ProductGroup from '../models/ProductGroup';
import InventoryTreeBuilder from '../services/inventory/InventoryTreeBuilder';
import photoService from '../services/photo/PhotoService';
import { ValidationError, NotFoundError } from '../services/errors/AppError';

/**
 * GET /api/groups
 * Returns all product groups sorted alphabetically by name.
 *
 * @param {Request}  req
 * @param {Response} res
 */
export const listGroups = async (req: Request, res: Response) => {
  const groups = await ProductGroup.find().sort({ name: 1 });
  res.json(groups);
};

/**
 * POST /api/groups
 * Creates a new product group. Requires a non-empty `name` in the request body.
 *
 * @param {Request}  req - body: { name: string }
 * @param {Response} res - 201 with the created group, or 400 if name missing
 */
export const createGroup = async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name?.trim()) throw new ValidationError('Name is required');
  const group = await ProductGroup.create({ name: name.trim() });
  res.status(201).json(group);
};

/**
 * DELETE /api/groups/:id
 * Builds the full inventory tree rooted at this group via InventoryTreeBuilder,
 * then calls delete() to recursively remove all child AssetTypes and Assets
 * before removing the group itself. Passes the PhotoService's storageStrategy
 * so any photo files are cleaned up from disk during the cascading delete.
 *
 * @param {Request}  req - params: { id: string }
 * @param {Response} res - { success: true } or 404 if not found
 */
export const deleteGroup = async (req: Request, res: Response) => {
  const root = await InventoryTreeBuilder.fromGroupId(req.params.id as string);
  if (!root) throw new NotFoundError('Group not found');
  await root.delete((photoService as any).storageStrategy);
  res.json({ success: true });
};
