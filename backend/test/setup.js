'use strict';

const mongoose = require('mongoose');

// ── Auth adapter mock ─────────────────────────────────────────────────────────
// Injected into the require cache BEFORE any test file loads the app,
// so every require('../server') receives the stubbed adapter instead of real Clerk.

let _mockAuth = { userId: 'test_user_id' }; // set to null to simulate unauthenticated
let _mockRole = 'admin';

const mockAuthAdapter = {
  contextMiddleware: () => (req, res, next) => next(),

  requireAuth: () => (req, res, next) => {
    if (!_mockAuth) return res.status(401).json({ message: 'Unauthenticated' });
    req.auth = _mockAuth;
    next();
  },

  adminOnly: () => async (req, res, next) => {
    if (_mockRole !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  },

  getUserId: (req) => _mockAuth?.userId ?? null,

  getUser: async () => ({
    id:    'test_user_id',
    email: 'test@example.com',
    name:  'Test User',
    role:  _mockRole,
  }),

  getUsers: async () => ({}),
};

require.cache[require.resolve('../services/auth/ClerkAuthAdapter')] = {
  id:       require.resolve('../services/auth/ClerkAuthAdapter'),
  filename: require.resolve('../services/auth/ClerkAuthAdapter'),
  loaded:   true,
  exports:  mockAuthAdapter,
};

// Exposed as global.clerkMock so any test file can control auth state per-test
global.clerkMock = {
  setAuth: (auth) => { _mockAuth = auth; },
  setRole: (role) => { _mockRole = role; },
  reset:   ()     => { _mockAuth = { userId: 'test_user_id' }; _mockRole = 'admin'; },
};

// ── Root hooks — MongoDB lifecycle ────────────────────────────────────────────
// beforeAll runs once before the entire test suite; afterAll once at the end.
// Individual test files handle per-test cleanup in their own afterEach blocks.

const connectDB = require('../config/db');

exports.mochaHooks = {
  async beforeAll() {
    if (!process.env.TEST_MONGO_URI) {
      console.warn(
        '\n⚠️  TEST_MONGO_URI is not set — tests will run against MONGO_URI.\n' +
        '   Set TEST_MONGO_URI to a dedicated test database to avoid polluting production data.\n'
      );
    } else {
      process.env.MONGO_URI = process.env.TEST_MONGO_URI;
    }
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
  },

  async afterAll() {
    await mongoose.disconnect();
  },
};
