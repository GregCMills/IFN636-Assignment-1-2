/**
 * @module assetRoutes
 * Routes for managing Assets (individual equipment units).
 * Read access requires authentication; write/delete/batch operations are
 * restricted to admins.  Status transitions (bulk-status, request-rental)
 * have additional role-based rules enforced in the controller.
 *
 *   GET    /api/assets                — list all assets with user enrichment
 *   GET    /api/assets/reports/overview — admin reporting dashboard data (FR-04)
 *   POST   /api/assets                — create a single asset (admin)
 *   POST   /api/assets/batch          — create multiple assets at once (admin)
 *   PATCH  /api/assets/bulk-status    — update status for one or more assets
 *   POST   /api/assets/request-rental — request rental (authenticated users)
 *   POST   /api/assets/calculate-cost — calculate rental cost via decorator chain (FR-05)
 *   POST   /api/assets/reset-seed     — wipe and re-seed all data (admin)
 *   POST   /api/assets/:id/photo      — upload a photo for an asset (admin)
 *   DELETE /api/assets/:id/photo      — delete an asset's photo (admin)
 *   DELETE /api/assets/:id            — delete an asset (admin)
 */

import express from 'express';
import auth from '../services/auth/ClerkAuthAdapter';
import {
  listAssets, createAsset, batchCreateAssets, deleteAsset, bulkUpdateStatus,
  requestRental, resetSeedAssets, getReportsOverview, calculateRentalCost,
} from '../controllers/assetController';
import { uploadPhoto, deletePhoto } from '../controllers/photoController';
import { updateEntity }             from '../controllers/entityController';
import { upload, validateFileType   } from '../middleware/uploadMiddleware';

const router = express.Router();

// Note: specific paths must come before /:id
router.get('/',                          auth.requireAuth(),                    listAssets);
router.get('/reports/overview',          auth.requireAuth(), auth.adminOnly(),  getReportsOverview);
router.post('/',                         auth.requireAuth(), auth.adminOnly(),  createAsset);
router.post('/batch',                    auth.requireAuth(), auth.adminOnly(),  batchCreateAssets);
router.patch('/bulk-status',             auth.requireAuth(),                    bulkUpdateStatus);
router.post('/request-rental',           auth.requireAuth(),                    requestRental);
router.post('/calculate-cost',           auth.requireAuth(),                    calculateRentalCost);
router.post('/reset-seed',               auth.requireAuth(), auth.adminOnly(),  resetSeedAssets);
router.post('/:id/photo',                auth.requireAuth(), auth.adminOnly(),  upload.single('photo'), validateFileType, uploadPhoto('asset'));
router.delete('/:id/photo',              auth.requireAuth(), auth.adminOnly(),  deletePhoto('asset'));
router.patch('/:id',                     auth.requireAuth(), auth.adminOnly(),  updateEntity('asset'));
router.delete('/:id',                    auth.requireAuth(), auth.adminOnly(),  deleteAsset);

export default router;