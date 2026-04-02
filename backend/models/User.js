const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  university: { type: String },
  address: { type: String },
});

module.exports = mongoose.model('User', userSchema);