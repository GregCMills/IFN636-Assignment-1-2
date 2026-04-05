const User = require('../models/User');

/** Clerk v2 exposes req.auth as a function; v1 / test stubs expose it as a plain object. */
const getAuthUserId = (req) =>
  typeof req.auth === 'function' ? req.auth()?.userId : req.auth?.userId;

const getProfile = async (req, res) => {
  try {
    const clerkUserId = getAuthUserId(req);
    const user = await User.findOne({ clerkId: clerkUserId });
    if (!user) return res.status(404).json({ message: 'Profile not found' });
    res.status(200).json({ address: user.address, phone: user.phone });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const clerkUserId = getAuthUserId(req);
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
