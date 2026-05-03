/**
 * @module authRoutes
 * Routes for reading and updating a user's supplementary profile data.
 * All routes require authentication (requireAuth middleware).
 *
 *   GET  /api/auth/profile  — retrieve the authenticated user's address & phone
 *   PUT  /api/auth/profile  — create or update the authenticated user's address & phone
 */

const express = require('express');
const { updateUserProfile, getProfile } = require('../controllers/authController');
const auth = require('../services/auth/ClerkAuthAdapter');
const router = express.Router();

router.get('/profile', auth.requireAuth(), getProfile);
router.put('/profile', auth.requireAuth(), updateUserProfile);

module.exports = router;