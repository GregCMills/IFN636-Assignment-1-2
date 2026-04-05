/**
 * @module groupRoutes
 * Routes for managing ProductGroups (top-level asset categories).
 * Read access requires authentication; write/delete operations are restricted to admins.
 *
 *   GET    /api/groups      — list all groups (authenticated users)
 *   POST   /api/groups      — create a new group (admin only)
 *   DELETE /api/groups/:id  — delete a group and cascade-delete its types & assets (admin only)
 */

const express = require('express');
const { protect }   = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { listGroups, createGroup, deleteGroup } = require('../controllers/groupController');

const router = express.Router();

router.get('/',    protect,             listGroups);
router.post('/',   protect, adminOnly,  createGroup);
router.delete('/:id', protect, adminOnly, deleteGroup);

module.exports = router;
