/**
 * @module authRoutes
 * Routes for reading and updating a user's supplementary profile data.
 * All routes require a valid Clerk session (protect middleware).
 *
 *   GET  /api/auth/profile  — retrieve the authenticated user's address & phone
 *   PUT  /api/auth/profile  — create or update the authenticated user's address & phone
 */

const express = require('express');
const { updateUserProfile, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;