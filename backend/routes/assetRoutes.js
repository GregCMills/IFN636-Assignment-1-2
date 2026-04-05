const express = require('express');
const { protect }   = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const {
  listAssets, createAsset, batchCreateAssets, deleteAsset, bulkUpdateStatus, requestRental, resetSeedAssets,
} = require('../controllers/assetController');

const router = express.Router();

// Note: specific paths must come before /:id
router.get('/',                 protect,            listAssets);
router.post('/',                protect, adminOnly, createAsset);
router.post('/batch',           protect, adminOnly, batchCreateAssets);
router.patch('/bulk-status',    protect,            bulkUpdateStatus);
router.post('/request-rental',  protect,            requestRental);
router.post('/reset-seed',      protect, adminOnly, resetSeedAssets);
router.delete('/:id',           protect, adminOnly, deleteAsset);

module.exports = router;
