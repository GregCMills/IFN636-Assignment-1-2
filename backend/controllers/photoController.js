/**
 * @module photoController
 * Higher-order controller functions for photo upload and delete endpoints.
 *
 * Each entity type (group, type, asset) reuses the same handler logic with a
 * different entityType string passed to PhotoService.  Rather than duplicating
 * three near-identical handler functions, we export factory functions that
 * produce type-specific handlers.
 *
 * Express 5 automatically catches rejected promises from async handlers — no
 * try/catch needed.
 */
const photoService = require('../services/photo/PhotoService');
const { ValidationError, NotFoundError } = require('../services/errors/AppError');

/**
 * Creates an upload handler for a specific entity type.
 *
 * POST /api/<entity>/:id/photo
 *
 * Expects multer to have placed the file at `req.file`.  Throws
 * ValidationError (400) if no file was attached.
 *
 * @param {'group'|'type'|'asset'} entityType
 * @returns {import('express').RequestHandler}
 */
const uploadPhoto = (entityType) => async (req, res) => {
  if (!req.file) throw new ValidationError('No file uploaded');
  const result = await photoService.uploadPhoto(entityType, req.params.id, req.file);
  res.json(result);
};

/**
 * Creates a delete handler for a specific entity type.
 *
 * DELETE /api/<entity>/:id/photo
 *
 * @param {'group'|'type'|'asset'} entityType
 * @returns {import('express').RequestHandler}
 */
const deletePhoto = (entityType) => async (req, res) => {
  await photoService.deletePhoto(entityType, req.params.id);
  res.json({ success: true });
};

/**
 * Creates an update handler for a specific entity type.
 *
 * PATCH /api/<entity>/:id
 *
 * Only updates fields that are present in the request body.  Validates that
 * the name (if provided) is non-empty after trimming.
 *
 * @param {'group'|'type'|'asset'} entityType
 * @returns {import('express').RequestHandler}
 */
const updateEntity = (entityType) => async (req, res) => {
  const { name, description } = req.body;
  if (name !== undefined && !name?.trim()) {
    throw new ValidationError('Name cannot be empty');
  }
  const result = await photoService.updateEntity(entityType, req.params.id, {
    ...(name !== undefined && { name: name.trim() }),
    ...(description !== undefined && { description }),
  });
  if (!result) throw new NotFoundError(`${entityType} not found`);
  res.json(result);
};

module.exports = { uploadPhoto, deletePhoto, updateEntity };
