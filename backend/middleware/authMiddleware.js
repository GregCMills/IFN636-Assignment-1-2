const { requireAuth } = require('@clerk/express');

const protect = requireAuth();

module.exports = { protect };