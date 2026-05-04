/**
 * @module typeRoutes
 * Routes for managing AssetTypes (product models within a group, e.g. "MacBook Air M2").
 * Read access requires authentication; write/delete operations are restricted to admins.
 *
 *   GET    /api/types           — list all asset types (authenticated users)
 *   POST   /api/types           — create a new type (admin only)
 *   POST   /api/types/:id/photo — upload a photo for a type (admin only)
 *   DELETE /api/types/:id/photo — delete a type's photo (admin only)
 *   DELETE /api/types/:id       — delete a type and cascade-delete its assets (admin only)
 */

const express = require('express');
const auth = require('../services/auth/ClerkAuthAdapter');
const { listTypes, createType, deleteType } = require('../controllers/typeController');
const { uploadPhoto, deletePhoto    } = require('../controllers/photoController');
const { upload, validateFileType   } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/',               auth.requireAuth(),                                           listTypes);
router.post('/',              auth.requireAuth(), auth.adminOnly(),                          createType);
router.post('/:id/photo',     auth.requireAuth(), auth.adminOnly(), upload.single('photo'),  validateFileType, uploadPhoto('type'));
router.delete('/:id/photo',   auth.requireAuth(), auth.adminOnly(),                          deletePhoto('type'));
router.delete('/:id',         auth.requireAuth(), auth.adminOnly(),                          deleteType);

module.exports = router;
