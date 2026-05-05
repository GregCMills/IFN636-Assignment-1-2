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

import express from 'express';
import auth from '../services/auth/ClerkAuthAdapter';
import { listGroups, createGroup, deleteGroup } from '../controllers/groupController';
import { uploadPhoto, deletePhoto } from '../controllers/photoController';
import { updateEntity }             from '../controllers/entityController';
import { upload, validateFileType   } from '../middleware/uploadMiddleware';

const router = express.Router();

router.get('/',               auth.requireAuth(),                                           listGroups);
router.post('/',              auth.requireAuth(), auth.adminOnly(),                          createGroup);
router.post('/:id/photo',     auth.requireAuth(), auth.adminOnly(), upload.single('photo'),  validateFileType, uploadPhoto('group'));
router.delete('/:id/photo',   auth.requireAuth(), auth.adminOnly(),                          deletePhoto('group'));
router.patch('/:id',          auth.requireAuth(), auth.adminOnly(),                          updateEntity('group'));
router.delete('/:id',         auth.requireAuth(), auth.adminOnly(),                          deleteGroup);

export default router;
