/**
 * @module typeRoutes
 * Routes for managing AssetTypes (product models within a group, e.g. "MacBook Air M2").
 * Read access requires authentication; write/delete operations are restricted to admins.
 *
 *   GET    /api/types      — list all asset types (authenticated users)
 *   POST   /api/types      — create a new type (admin only)
 *   DELETE /api/types/:id  — delete a type and cascade-delete its assets (admin only)
 */

const express = require('express');
const { protect }   = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { listTypes, createType, deleteType } = require('../controllers/typeController');

const router = express.Router();

router.get('/',       protect,             listTypes);
router.post('/',      protect, adminOnly,  createType);
router.delete('/:id', protect, adminOnly,  deleteType);

module.exports = router;
