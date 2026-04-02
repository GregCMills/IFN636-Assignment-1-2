const chai = require('chai');
const request = require('supertest');
const sinon = require('sinon');

const { expect } = chai;

// Inject a fake @clerk/express into the module cache BEFORE loading the app.
// This lets requireAuth() hand control to our stub so we can toggle auth on/off per test.
let fakeAuthMiddleware = (req, res, next) => {
  req.auth = { userId: 'test_clerk_user_id' };
  next();
};

require.cache[require.resolve('@clerk/express')] = {
  id: require.resolve('@clerk/express'),
  filename: require.resolve('@clerk/express'),
  loaded: true,
  exports: {
    clerkMiddleware: () => (req, res, next) => next(),
    requireAuth: () => (req, res, next) => fakeAuthMiddleware(req, res, next),
  },
};

const User = require('../models/User');
const app = require('../server');

describe('Profile Routes', () => {
  afterEach(() => {
    sinon.restore();
    // Restore authenticated middleware after each test
    fakeAuthMiddleware = (req, res, next) => {
      req.auth = { userId: 'test_clerk_user_id' };
      next();
    };
  });

  describe('GET /api/auth/profile', () => {
    it('should return 401 when no Clerk session is present', async () => {
      fakeAuthMiddleware = (req, res, next) => {
        res.status(401).json({ message: 'Unauthenticated' });
      };

      const res = await request(app).get('/api/auth/profile');

      expect(res.status).to.equal(401);
    });

    it('should return 404 when the authenticated user has no profile in the database', async () => {
      sinon.stub(User, 'findOne').resolves(null);

      const res = await request(app).get('/api/auth/profile');

      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal('Profile not found');
    });

    it('should return the profile for an authenticated user', async () => {
      sinon.stub(User, 'findOne').resolves({ university: 'QUT', address: '123 Main St' });

      const res = await request(app).get('/api/auth/profile');

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ university: 'QUT', address: '123 Main St' });
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should return 401 when no Clerk session is present', async () => {
      fakeAuthMiddleware = (req, res, next) => {
        res.status(401).json({ message: 'Unauthenticated' });
      };

      const res = await request(app).put('/api/auth/profile').send({ university: 'QUT', address: '123 Main St' });

      expect(res.status).to.equal(401);
    });

    it('should update and return the profile for an authenticated user', async () => {
      sinon.stub(User, 'findOneAndUpdate').resolves({ university: 'QUT', address: '456 New St' });

      const res = await request(app)
        .put('/api/auth/profile')
        .send({ university: 'QUT', address: '456 New St' });

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ university: 'QUT', address: '456 New St' });
    });
  });
});
