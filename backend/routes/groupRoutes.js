/**
 * @module groupRoutes
 * Routes for managing ProductGroups (top-level asset categories).
 * Read access requires authentication; write/delete operations are restricted to admins.
 *
 *   GET    /api/groups           — list all groups (authenticated users)
 *   POST   /api/groups           — create a new group (admin only)
 *   POST   /api/groups/:id/photo — upload a photo for a group (admin only)
 *   DELETE /api/groups/:id/photo — delete a group's photo (admin only)
 *   DELETE /api/groups/:id       — delete a group and cascade-delete its types & assets (admin only)
 */

const express = require('express');
const auth = require('../services/auth/ClerkAuthAdapter');
const { listGroups, createGroup, deleteGroup } = require('../controllers/groupController');
const { uploadPhoto, deletePhoto    } = require('../controllers/photoController');
const { upload, validateFileType   } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/',               auth.requireAuth(),                                           listGroups);
router.post('/',              auth.requireAuth(), auth.adminOnly(),                          createGroup);
router.post('/:id/photo',     auth.requireAuth(), auth.adminOnly(), upload.single('photo'),  validateFileType, uploadPhoto('group'));
router.delete('/:id/photo',   auth.requireAuth(), auth.adminOnly(),                          deletePhoto('group'));
router.delete('/:id',         auth.requireAuth(), auth.adminOnly(),                          deleteGroup);

module.exports = router;
