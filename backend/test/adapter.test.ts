/**
 * Unit tests for ClerkAuthAdapter.
 *
 * setup.js (loaded first via --require) injects a mock ClerkAuthAdapter into
 * the require cache for integration tests.  These unit tests clear that mock,
 * replace it with the real adapter backed by a stubbed @clerk/express, and
 * restore the mock on teardown so integration tests are unaffected.
 */

import { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response } from 'express';

describe('ClerkAuthAdapter (unit)', () => {
  let auth: any;
  let _savedAdapterCache: any;
  let _savedClerkCache: any;
  let _clerkStub: any;

  // ── Clerk response stubs ──────────────────────────────────────────────────

  const mkClerkUser = (overrides = {}) => ({
    id:             'user_2abc123',
    emailAddresses: [{ emailAddress: 'alice@example.com' }],
    firstName:      'Alice',
    lastName:       'Smith',
    publicMetadata: { role: 'admin' },
    ...overrides,
  });

  // ── Before / After ────────────────────────────────────────────────────────

  before(() => {
    const adapterKey = require.resolve('../services/auth/ClerkAuthAdapter');
    const clerkKey   = require.resolve('@clerk/express');

    // Save the mock that setup.js injected
    _savedAdapterCache = require.cache[adapterKey];
    _savedClerkCache   = require.cache[clerkKey];

    // Remove the adapter mock so the real module loads
    delete require.cache[adapterKey];

    // Inject an @clerk/express stub — the real adapter calls it lazily
    _clerkStub = {
      clerkMiddleware: () => (req: any, res: any, next: any) => next(),
      requireAuth:     () => (req: any, res: any, next: any) => { req.auth = { userId: 'stubbed_user' }; next(); },
      clerkClient: {
        users: {
          getUser:     sinon.stub().resolves(mkClerkUser()),
          getUserList: sinon.stub().resolves({ data: [mkClerkUser()] }),
        },
      },
    };

    require.cache[clerkKey] = {
      id:       clerkKey,
      filename: clerkKey,
      loaded:   true,
      exports:  _clerkStub,
    } as any;

    // Now load the real adapter singleton
    auth = require('../services/auth/ClerkAuthAdapter').default;
  });

  after(() => {
    const adapterKey = require.resolve('../services/auth/ClerkAuthAdapter');
    const clerkKey   = require.resolve('@clerk/express');

    // Restore the mock adapter so integration tests see what they expect
    delete require.cache[adapterKey];
    delete require.cache[clerkKey];

    if (_savedAdapterCache) {
      require.cache[adapterKey] = _savedAdapterCache;
    }
    if (_savedClerkCache) {
      require.cache[clerkKey] = _savedClerkCache;
    }

    sinon.restore();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //  _normaliseUser
  // ═══════════════════════════════════════════════════════════════════════════

  describe('_normaliseUser', () => {
    it('maps all fields from a complete Clerk user', () => {
      const result = auth._normaliseUser(mkClerkUser());
      expect(result).to.deep.equal({
        id:    'user_2abc123',
        email: 'alice@example.com',
        name:  'Alice Smith',
        role:  'admin',
      });
    });

    it('returns empty string for email when emailAddresses is empty', () => {
      const result = auth._normaliseUser(mkClerkUser({ emailAddresses: [] }));
      expect(result.email).to.equal('');
    });

    it('returns empty string for email when emailAddress is missing', () => {
      const result = auth._normaliseUser(
        mkClerkUser({ emailAddresses: [{}] })
      );
      expect(result.email).to.equal('');
    });

    it('returns null for name when both first and last are null', () => {
      const result = auth._normaliseUser(
        mkClerkUser({ firstName: null, lastName: null })
      );
      expect(result.name).to.equal(null);
    });

    it('returns firstName alone when lastName is missing', () => {
      const result = auth._normaliseUser(
        mkClerkUser({ firstName: 'Alice', lastName: null })
      );
      expect(result.name).to.equal('Alice');
    });

    it('returns lastName alone when firstName is missing', () => {
      const result = auth._normaliseUser(
        mkClerkUser({ firstName: null, lastName: 'Smith' })
      );
      expect(result.name).to.equal('Smith');
    });

    it('filters out empty-string name parts (filter(Boolean))', () => {
      const result = auth._normaliseUser(
        mkClerkUser({ firstName: '', lastName: 'Smith' })
      );
      expect(result.name).to.equal('Smith');
    });

    it('returns null for role when publicMetadata is missing', () => {
      const result = auth._normaliseUser(
        mkClerkUser({ publicMetadata: undefined })
      );
      expect(result.role).to.equal(null);
    });

    it('returns null for role when publicMetadata has no role field', () => {
      const result = auth._normaliseUser(
        mkClerkUser({ publicMetadata: {} })
      );
      expect(result.role).to.equal(null);
    });

    it('preserves the original Clerk user id', () => {
      const result = auth._normaliseUser(mkClerkUser({ id: 'user_custom' }));
      expect(result.id).to.equal('user_custom');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //  getUserId
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getUserId', () => {
    it('handles Clerk v2 style — req.auth as function returning object', () => {
      const req = { auth: () => ({ userId: 'user_v2' }) };
      expect(auth.getUserId(req as any)).to.equal('user_v2');
    });

    it('returns undefined when req.auth() returns null (v2, logged out)', () => {
      const req = { auth: () => null };
      expect(auth.getUserId(req as any)).to.be.undefined;
    });

    it('handles Clerk v1 style — req.auth as a plain object', () => {
      const req = { auth: { userId: 'user_v1' } };
      expect(auth.getUserId(req as any)).to.equal('user_v1');
    });

    it('returns undefined when req.auth is an object without userId', () => {
      const req = { auth: {} };
      expect(auth.getUserId(req as any)).to.be.undefined;
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //  getUser
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getUser', () => {
    it('returns a normalised user for a valid ID', async () => {
      const user = await auth.getUser('user_2abc123');
      expect(user).to.deep.equal({
        id:    'user_2abc123',
        email: 'alice@example.com',
        name:  'Alice Smith',
        role:  'admin',
      });
    });

    it('calls clerkClient.users.getUser with the correct ID', async () => {
      await auth.getUser('specific_user');
      sinon.assert.calledWith(_clerkStub.clerkClient.users.getUser, 'specific_user');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //  getUsers
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getUsers', () => {
    beforeEach(() => {
      // Reset call history but keep the default resolve behaviour
      _clerkStub.clerkClient.users.getUserList.resetHistory();
    });

    it('returns empty object for an empty array', async () => {
      const result = await auth.getUsers([]);
      expect(result).to.deep.equal({});
    });

    it('returns empty object for null', async () => {
      const result = await auth.getUsers(null);
      expect(result).to.deep.equal({});
    });

    it('returns empty object for undefined', async () => {
      const result = await auth.getUsers(undefined);
      expect(result).to.deep.equal({});
    });

    it('returns a map keyed by user ID for valid IDs', async () => {
      // ensure default behaviour is set
      _clerkStub.clerkClient.users.getUserList.resolves(
        { data: [mkClerkUser()] }
      );
      const result = await auth.getUsers(['user_2abc123']);
      expect(result).to.have.property('user_2abc123');
      expect(result['user_2abc123']).to.deep.equal({
        id:    'user_2abc123',
        email: 'alice@example.com',
        name:  'Alice Smith',
        role:  'admin',
      });
    });

    it('returns empty object when clerkClient throws', async () => {
      _clerkStub.clerkClient.users.getUserList.rejects(new Error('Clerk down'));
      const result = await auth.getUsers(['any']);
      expect(result).to.deep.equal({});
    });

    it('calls getUserList with the provided userIds', async () => {
      _clerkStub.clerkClient.users.getUserList.resolves(
        { data: [mkClerkUser()] }
      );
      await auth.getUsers(['a', 'b', 'c']);
      sinon.assert.calledWith(_clerkStub.clerkClient.users.getUserList, {
        userId: ['a', 'b', 'c'],
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //  adminOnly middleware
  // ═══════════════════════════════════════════════════════════════════════════

  describe('adminOnly middleware', () => {
    let req: any, res: any, next: any;

    beforeEach(() => {
      req  = { auth: { userId: 'test_user' } };
      res  = { status: sinon.stub().returnsThis(), json: sinon.stub() };
      next = sinon.stub();
    });

    it('calls next() when user role is admin', async () => {
      // default mock returns role: 'admin'
      const mw = auth.adminOnly();
      await mw(req, res, next);
      expect(next.calledOnce).to.be.true;
      expect(res.status.called).to.be.false;
    });

    it('responds 403 when user role is not admin', async () => {
      // override the getUser stub temporarily
      _clerkStub.clerkClient.users.getUser.resolves(
        mkClerkUser({ publicMetadata: { role: 'customer' } })
      );

      const mw = auth.adminOnly();
      await mw(req, res, next);

      expect(res.status.calledWith(403)).to.be.true;
      expect(res.json.calledWith({ message: 'Admin access required' })).to.be.true;
      expect(next.called).to.be.false;

      // reset for other tests
      _clerkStub.clerkClient.users.getUser.resolves(mkClerkUser());
    });

    it('responds 403 when getUser throws', async () => {
      _clerkStub.clerkClient.users.getUser.rejects(new Error('boom'));

      const mw = auth.adminOnly();
      await mw(req, res, next);

      expect(res.status.calledWith(403)).to.be.true;
      expect(next.called).to.be.false;

      _clerkStub.clerkClient.users.getUser.resolves(mkClerkUser());
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //  requireAuth & contextMiddleware (basic smoke)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('requireAuth', () => {
    it('returns a function (middleware)', () => {
      const mw = auth.requireAuth();
      expect(mw).to.be.a('function');
    });
  });

  describe('contextMiddleware', () => {
    it('returns a function (middleware)', () => {
      const mw = auth.contextMiddleware();
      expect(mw).to.be.a('function');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  AuthAdapter base class
// ═══════════════════════════════════════════════════════════════════════════════

import AuthAdapter from '../services/auth/AuthAdapter';

describe('AuthAdapter (base class)', () => {
  let adapter: any;

  beforeEach(() => {
    // @ts-ignore - abstract class
    adapter = new (class extends AuthAdapter {
      contextMiddleware(): any {}
      requireAuth(): any {}
      adminOnly(): any {}
      getUserId(): any {}
      async getUser(): Promise<any> {}
      async getUsers(): Promise<any> {}
    })();
  });

  // Base class methods are abstract in TS, so we don't need to test "Not implemented"
  // since it won't even compile if not implemented.
});
