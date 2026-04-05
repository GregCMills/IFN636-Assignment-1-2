'use strict';

// setup.js (loaded via --require in .mocharc.cjs) has already injected the
// @clerk/express stub and exposed global.clerkMock for per-test auth control.

const chai    = require('chai');
const request = require('supertest');
const sinon   = require('sinon');

const { expect } = chai;

const User = require('../models/User');
const app  = require('../server');

describe('Profile Routes', () => {
  afterEach(() => {
    sinon.restore();
    clerkMock.reset();
  });

  // ── GET /api/auth/profile ──────────────────────────────────────────────────

  describe('GET /api/auth/profile', () => {
    it('should return 401 when no Clerk session is present', async () => {
      clerkMock.setAuth(null);
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
      sinon.stub(User, 'findOne').resolves({ address: '123 Main St', phone: '0400000000' });
      const res = await request(app).get('/api/auth/profile');
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ address: '123 Main St', phone: '0400000000' });
    });
  });

  // ── PUT /api/auth/profile ──────────────────────────────────────────────────

  describe('PUT /api/auth/profile', () => {
    it('should return 401 when no Clerk session is present', async () => {
      clerkMock.setAuth(null);
      const res = await request(app)
        .put('/api/auth/profile')
        .send({ university: 'QUT', address: '123 Main St' });
      expect(res.status).to.equal(401);
    });

    it('should update and return the profile for an authenticated user', async () => {
      sinon.stub(User, 'findOneAndUpdate').resolves({ address: '456 New St', phone: '0411111111' });
      const res = await request(app)
        .put('/api/auth/profile')
        .send({ address: '456 New St', phone: '0411111111' });
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ address: '456 New St', phone: '0411111111' });
    });
  });
});
