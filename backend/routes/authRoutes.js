const express = require('express');
const { updateUserProfile, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;