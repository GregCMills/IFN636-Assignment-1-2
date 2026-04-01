const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const User = require('../models/User');
const app = require('../server');

const { expect } = chai;
chai.use(chaiHttp);

describe('Auth Routes', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return 400 when registering with an email that already exists', (done) => {
    sinon.stub(User, 'findOne').resolves({ email: 'test@test.com' });

    chai.request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: 'password123' })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal('User already exists');
        done();
      });
  });

  it('should return 401 when logging in with invalid credentials', (done) => {
    sinon.stub(User, 'findOne').resolves(null);

    chai.request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@test.com', password: 'wrongpassword' })
      .end((err, res) => {
        expect(res.status).to.equal(401);
        expect(res.body.message).to.equal('Invalid email or password');
        done();
      });
  });
});
