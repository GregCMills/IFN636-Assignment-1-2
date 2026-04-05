const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  address: { type: String },
  phone:   { type: String },
});

module.exports = mongoose.model('User', userSchema);