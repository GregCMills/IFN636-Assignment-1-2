import mongoose from 'mongoose';
import chai from 'chai';

// ── Assertion tracking ────────────────────────────────────────────────────────
// A chai plugin that records every passing assertion's expected and actual
// values into a global Map keyed by the current test's full title.  The custom
// Mocha reporter reads this map to populate the table columns.

declare global {
  // eslint-disable-next-line no-var
  var _assertionLog: Map<string, Array<{ expected: string; actual: string }>>;
  // eslint-disable-next-line no-var
  var _currentTestTitle: string;
}

if (!global._assertionLog) {
  global._assertionLog = new Map();
}

function truncate(val: any, maxLen = 120): string {
  let s: string;
  if (val === undefined) s = 'undefined';
  else if (val === null) s = 'null';
  else if (typeof val === 'string') s = val;
  else if (typeof val === 'function') s = '[Function]';
  else {
    try { s = JSON.stringify(val) ?? String(val); } catch { s = String(val); }
  }
  return s.length > maxLen ? s.substring(0, maxLen) + '...' : s;
}

chai.use((_chai: any, utils: any) => {
  const origAssert = _chai.Assertion.prototype.assert;

  _chai.Assertion.prototype.assert = function assert(
    ...args: [boolean, any, any, any, any, any]
  ) {
    const passed = args[0];
    const expectedVal = args[3];
    const actualVal = args[4];

    if (passed && global._assertionLog) {
      const testTitle = global._currentTestTitle || '';

      if (testTitle) {
        if (!global._assertionLog.has(testTitle)) {
          global._assertionLog.set(testTitle, []);
        }
        const entries = global._assertionLog.get(testTitle)!;

        if (arguments.length >= 5 && actualVal !== undefined) {
          entries.push({
            expected: truncate(expectedVal),
            actual: truncate(actualVal),
          });
        } else {
          const obj = utils.flag(this, 'object');
          const display = truncate(obj);
          entries.push({ expected: display, actual: display });
        }
      }
    }

    return origAssert.apply(this, args);
  };
});

// ── Auth adapter mock ─────────────────────────────────────────────────────────
// Injected into the require cache BEFORE any test file loads the app,
// so every require('../server') receives the stubbed adapter instead of real Clerk.

let _mockAuth: { userId: string } | null = { userId: 'test_user_id' }; // set to null to simulate unauthenticated
let _mockRole = 'admin';

const mockAuthAdapter = {
  contextMiddleware: () => (req: any, res: any, next: any) => next(),

  requireAuth: () => (req: any, res: any, next: any) => {
    if (!_mockAuth) return res.status(401).json({ message: 'Unauthenticated' });
    req.auth = _mockAuth;
    next();
  },

  adminOnly: () => async (req: any, res: any, next: any) => {
    if (_mockRole !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  },

  getUserId: (req: any) => _mockAuth?.userId ?? null,

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
} as any;

// Exposed as global.clerkMock so any test file can control auth state per-test
global.clerkMock = {
  setAuth: (auth: any) => { _mockAuth = auth; },
  setRole: (role: string) => { _mockRole = role; },
  reset:   ()     => { _mockAuth = { userId: 'test_user_id' }; _mockRole = 'admin'; },
};

// ── Root hooks — MongoDB lifecycle ────────────────────────────────────────────
// beforeAll runs once before the entire test suite; afterAll once at the end.
// Individual test files handle per-test cleanup in their own afterEach blocks.

import connectDB from '../config/db';

export const mochaHooks = {
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

  beforeEach(this: any) {
    const title = this.currentTest?.fullTitle?.() ?? '';
    global._currentTestTitle = title;
  },

  afterEach() {
    global._currentTestTitle = '';
  },

  async afterAll() {
    await mongoose.disconnect();
  },
};
