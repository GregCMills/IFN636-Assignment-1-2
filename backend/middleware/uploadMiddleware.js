/**
 * @module uploadMiddleware
 * Chain of Responsibility — file upload validators in the Express middleware chain.
 *
 * Two handlers in the chain:
 *   1. `multer`   — parses multipart/form-data; enforces 5MB file size limit.
 *                   Memory storage so the file buffer is available as `req.file.buffer`.
 *   2. `validateFileType` — checks MIME type is an allowed image format.
 *                   Throws ValidationError if not, which Express 5 catches and
 *                   the global error handler converts to a 400 response.
 *
 * Usage in routes:
 *   router.post('/:id/photo', auth.requireAuth(), auth.adminOnly(),
 *               upload.single('photo'), validateFileType, controller);
 */
const multer = require('multer');
const { ValidationError } = require('../services/errors/AppError');

/** Maximum file size: 5 MB. */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Allowed image MIME types. */
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Multer instance configured for memory storage.
 * The file is held in `req.file.buffer` — never written to disk by multer.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});

/**
 * Validates that the uploaded file's MIME type is an allowed image format.
 * Throws ValidationError (400) if the type is not permitted, short-circuiting
 * the chain.  This follows the project convention of throwing typed errors
 * rather than calling res.status().json() directly.
 *
 * Must be placed AFTER multer in the chain so `req.file` is populated.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const validateFileType = (req, res, next) => {
  if (!req.file) return next(); // no file attached — let the controller handle validation
  if (!ALLOWED_MIMETYPES.includes(req.file.mimetype)) {
    throw new ValidationError(
      `Invalid file type: ${req.file.mimetype}. Allowed types: ${ALLOWED_MIMETYPES.join(', ')}`,
    );
  }
  next();
};

module.exports = { upload, validateFileType };
