/**
 * @module entityController
 * Higher-order controller functions for entity data updates.
 *
 * Each entity type reuses the same handler logic with a different entityType
 * string.  This follows the same factory-function pattern as photoController.
 */
import { Request, Response, RequestHandler } from 'express';
import entityService from '../services/entity/EntityService';
import { ValidationError, NotFoundError } from '../services/errors/AppError';

/**
 * Creates an update handler for a specific entity type.
 *
 * PATCH /api/<entity>/:id
 *
 * Only updates fields present in the request body.  Validates that name
 * (if provided) is non-empty after trimming.
 *
 * @param {'group'|'type'|'asset'} entityType
 * @returns {RequestHandler}
 */
export const updateEntity = (entityType: 'group' | 'type' | 'asset'): RequestHandler => async (req: Request, res: Response) => {
  const { name, description } = req.body;
  if (name !== undefined && !name?.trim()) {
    throw new ValidationError('Name cannot be empty');
  }
  const result = await entityService.updateEntity(entityType, req.params.id as string, {
    ...(name !== undefined && { name: name.trim() }),
    ...(description !== undefined && { description }),
  });
  if (!result) throw new NotFoundError(`${entityType} not found`);
  res.json(result);
};
