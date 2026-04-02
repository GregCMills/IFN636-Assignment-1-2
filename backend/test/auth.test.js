const chai = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const User = require('../models/User');
const app = require('../server');

const { expect } = chai;

describe('Auth Routes', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return 400 when registering with an email that already exists', async () => {
    sinon.stub(User, 'findOne').resolves({ email: 'test@test.com' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: 'password123' });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal('User already exists');
  });

  it('should return 401 when logging in with invalid credentials', async () => {
    sinon.stub(User, 'findOne').resolves(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@test.com', password: 'wrongpassword' });

    expect(res.status).to.equal(401);
    expect(res.body.message).to.equal('Invalid email or password');
  });
});