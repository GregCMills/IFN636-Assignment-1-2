const User = require('../models/User');

const getProfile = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;
    const user = await User.findOne({ clerkId: clerkUserId });
    if (!user) return res.status(404).json({ message: 'Profile not found' });
    res.status(200).json({ address: user.address, phone: user.phone });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;
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
