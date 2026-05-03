/**
 * @module authController
 * Handles reading and updating a user's supplementary profile data (address and
 * phone number). Authentication is provided by Clerk; this module only manages
 * the extra fields stored in our own MongoDB User collection.
 */

const User = require('../models/User');
const auth = require('../services/auth/ClerkAuthAdapter');

/**
 * GET /api/auth/profile
 * Returns the address and phone number stored for the authenticated user.
 * Responds with 404 if no profile document exists yet.
 *
 * @param {import('express').Request}  req - Clerk-authenticated request
 * @param {import('express').Response} res - { address: string, phone: string }
 */
const getProfile = async (req, res) => {
  try {
    const clerkUserId = auth.getUserId(req);
    const user = await User.findOne({ clerkId: clerkUserId });
    if (!user) return res.status(404).json({ message: 'Profile not found' });
    res.status(200).json({ address: user.address, phone: user.phone });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * PUT /api/auth/profile
 * Creates or updates the address and phone number for the authenticated user.
 * Uses upsert so a document is created on first save without a prior GET.
 *
 * @param {import('express').Request}  req - body: { address?: string, phone?: string }
 * @param {import('express').Response} res - { address: string, phone: string }
 */
const updateUserProfile = async (req, res) => {
  try {
    const clerkUserId = auth.getUserId(req);
    const { address, phone } = req.body;
    const user = await User.findOneAndUpdate(
      { clerkId: clerkUserId },
      { address, phone },
      { new: true, upsert: true }
    );
    res.json({ address: user.address, phone: user.phone });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateUserProfile };
