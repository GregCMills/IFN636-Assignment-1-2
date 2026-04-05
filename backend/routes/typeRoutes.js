const express = require('express');
const { protect }   = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { listTypes, createType, deleteType } = require('../controllers/typeController');

const router = express.Router();

router.get('/',       protect,             listTypes);
router.post('/',      protect, adminOnly,  createType);
router.delete('/:id', protect, adminOnly,  deleteType);

module.exports = router;
