/**
 * @module photoController
 * Higher-order controller functions for photo upload and delete endpoints.
 * Entity data updates (name/description) have been moved to entityController.
 *
 * Each entity type (group, type, asset) reuses the same handler logic with a
 * different entityType string passed to PhotoService.  Rather than duplicating
 * three near-identical handler functions, we export factory functions that
 * produce type-specific handlers.
 *
 * Express 5 automatically catches rejected promises from async handlers — no
 * try/catch needed.
 */
import { Request, Response, RequestHandler } from 'express';
import photoService from '../services/photo/PhotoService';
import { ValidationError } from '../services/errors/AppError';

/**
 * Creates an upload handler for a specific entity type.
 *
 * POST /api/<entity>/:id/photo
 *
 * Expects multer to have placed the file at `req.file`.  Throws
 * ValidationError (400) if no file was attached.
 *
 * @param {'group'|'type'|'asset'} entityType
 * @returns {RequestHandler}
 */
export const uploadPhoto = (entityType: 'group' | 'type' | 'asset'): RequestHandler => async (req: Request, res: Response) => {
  if (!req.file) throw new ValidationError('No file uploaded');
  const result = await photoService.uploadPhoto(entityType, req.params.id as string, req.file);
  res.json(result);
};

/**
 * Creates a delete handler for a specific entity type.
 *
 * DELETE /api/<entity>/:id/photo
 *
 * @param {'group'|'type'|'asset'} entityType
 * @returns {RequestHandler}
 */
export const deletePhoto = (entityType: 'group' | 'type' | 'asset'): RequestHandler => async (req: Request, res: Response) => {
  await photoService.deletePhoto(entityType, req.params.id as string);
  res.json({ success: true });
};
