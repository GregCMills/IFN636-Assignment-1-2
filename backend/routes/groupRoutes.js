const express = require('express');
const { protect }   = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { listGroups, createGroup, deleteGroup } = require('../controllers/groupController');

const router = express.Router();

router.get('/',    protect,             listGroups);
router.post('/',   protect, adminOnly,  createGroup);
router.delete('/:id', protect, adminOnly, deleteGroup);

module.exports = router;
