const express = require('express');
const auth = require('../services/auth/ClerkAuthAdapter');
const {
  listAssets, createAsset, batchCreateAssets, deleteAsset, bulkUpdateStatus, requestRental, resetSeedAssets,
} = require('../controllers/assetController');

const router = express.Router();

// Note: specific paths must come before /:id
router.get('/',                 auth.requireAuth(),              listAssets);
router.post('/',                auth.requireAuth(), auth.adminOnly(), createAsset);
router.post('/batch',           auth.requireAuth(), auth.adminOnly(), batchCreateAssets);
router.patch('/bulk-status',    auth.requireAuth(),              bulkUpdateStatus);
router.post('/request-rental',  auth.requireAuth(),              requestRental);
router.post('/reset-seed',      auth.requireAuth(), auth.adminOnly(), resetSeedAssets);
router.delete('/:id',           auth.requireAuth(), auth.adminOnly(), deleteAsset);

module.exports = router;
