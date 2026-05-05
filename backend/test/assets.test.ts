import { expect } from 'chai';
import request from 'supertest';

import ProductGroup from '../models/ProductGroup';
import AssetType from '../models/AssetType';
import Asset from '../models/Asset';
import app from '../server';

// ── Seed helpers ──────────────────────────────────────────────────────────────

const mkGroup = (name = 'Laptops') =>
  ProductGroup.create({ name });

const mkType = (groupId: any, name = 'MacBook Pro') =>
  AssetType.create({ groupId, name });

const mkAsset = (typeId: any, name = 'Unit 001', status = 'Available') =>
  Asset.create({ typeId, name, status });

// ─────────────────────────────────────────────────────────────────────────────

describe('Asset Management API', () => {

  afterEach(async () => {
    await Promise.all([
      ProductGroup.deleteMany({}),
      AssetType.deleteMany({}),
      Asset.deleteMany({}),
    ]);
    clerkMock.reset();
  });

  // ── Product Groups ──────────────────────────────────────────────────────────

  describe('GET /api/groups', () => {
    it('returns an empty array when no groups exist', async () => {
      const res = await request(app).get('/api/groups');
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal([]);
    });

    it('returns groups sorted alphabetically by name', async () => {
      await mkGroup('Projectors');
      await mkGroup('Laptops');
      const res = await request(app).get('/api/groups');
      expect(res.status).to.equal(200);
      expect(res.body.map((g: any) => g.name)).to.deep.equal(['Laptops', 'Projectors']);
    });

    it('returns 401 when unauthenticated', async () => {
      clerkMock.setAuth(null);
      const res = await request(app).get('/api/groups');
      expect(res.status).to.equal(401);
    });
  });

  describe('POST /api/groups', () => {
    it('creates a group and returns it with an id', async () => {
      const res = await request(app).post('/api/groups').send({ name: 'Cameras' });
      expect(res.status).to.equal(201);
      expect(res.body.name).to.equal('Cameras');
      expect(res.body).to.have.property('id');
      expect(await ProductGroup.countDocuments()).to.equal(1);
    });

    it('trims whitespace from the name', async () => {
      const res = await request(app).post('/api/groups').send({ name: '  Audio  ' });
      expect(res.status).to.equal(201);
      expect(res.body.name).to.equal('Audio');
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/groups').send({});
      expect(res.status).to.equal(400);
    });

    it('returns 400 when name is blank whitespace', async () => {
      const res = await request(app).post('/api/groups').send({ name: '   ' });
      expect(res.status).to.equal(400);
    });

    it('returns 403 when user is not admin', async () => {
      clerkMock.setRole('customer');
      const res = await request(app).post('/api/groups').send({ name: 'Test' });
      expect(res.status).to.equal(403);
    });

    it('returns 401 when unauthenticated', async () => {
      clerkMock.setAuth(null);
      const res = await request(app).post('/api/groups').send({ name: 'Test' });
      expect(res.status).to.equal(401);
    });
  });

  describe('DELETE /api/groups/:id', () => {
    it('deletes a group that has no children', async () => {
      const group = await mkGroup();
      const res   = await request(app).delete(`/api/groups/${group.id}`);
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(await ProductGroup.countDocuments()).to.equal(0);
    });

    it('cascade-deletes child types and their assets', async () => {
      const group = await mkGroup();
      const type  = await mkType(group.id);
      await mkAsset(type.id, 'Unit 001');
      await mkAsset(type.id, 'Unit 002');

      const res = await request(app).delete(`/api/groups/${group.id}`);
      expect(res.status).to.equal(200);
      expect(await ProductGroup.countDocuments()).to.equal(0);
      expect(await AssetType.countDocuments()).to.equal(0);
      expect(await Asset.countDocuments()).to.equal(0);
    });

    it('only removes children belonging to the deleted group', async () => {
      const groupA = await mkGroup('A');
      const groupB = await mkGroup('B');
      const typeA  = await mkType(groupA.id, 'Type A');
      const typeB  = await mkType(groupB.id, 'Type B');
      await mkAsset(typeA.id);
      await mkAsset(typeB.id);

      await request(app).delete(`/api/groups/${groupA.id}`);

      expect(await ProductGroup.countDocuments()).to.equal(1);
      expect(await AssetType.countDocuments()).to.equal(1);
      expect(await Asset.countDocuments()).to.equal(1);
    });

    it('returns 403 when user is not admin', async () => {
      clerkMock.setRole('customer');
      const group = await mkGroup();
      const res   = await request(app).delete(`/api/groups/${group.id}`);
      expect(res.status).to.equal(403);
    });

    it('returns 401 when unauthenticated', async () => {
      clerkMock.setAuth(null);
      const group = await mkGroup();
      const res   = await request(app).delete(`/api/groups/${group.id}`);
      expect(res.status).to.equal(401);
    });
  });

  // ── Asset Types ─────────────────────────────────────────────────────────────

  describe('GET /api/types', () => {
    it('returns an empty array when no types exist', async () => {
      const res = await request(app).get('/api/types');
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal([]);
    });

    it('returns types sorted alphabetically', async () => {
      const group = await mkGroup();
      await mkType(group.id, 'MacBook Pro');
      await mkType(group.id, 'Dell XPS');
      const res = await request(app).get('/api/types');
      expect(res.body.map((t: any) => t.name)).to.deep.equal(['Dell XPS', 'MacBook Pro']);
    });
  });

  describe('POST /api/types', () => {
    it('creates a type and returns it with id and groupId', async () => {
      const group = await mkGroup();
      const res   = await request(app).post('/api/types').send({ groupId: group.id, name: 'Projector X' });
      expect(res.status).to.equal(201);
      expect(res.body.name).to.equal('Projector X');
      expect(res.body.groupId).to.equal(group.id);
      expect(res.body).to.have.property('id');
    });

    it('returns 400 when groupId is missing', async () => {
      const res = await request(app).post('/api/types').send({ name: 'Test' });
      expect(res.status).to.equal(400);
    });

    it('returns 400 when name is missing', async () => {
      const group = await mkGroup();
      const res   = await request(app).post('/api/types').send({ groupId: group.id });
      expect(res.status).to.equal(400);
    });

    it('returns 403 when user is not admin', async () => {
      clerkMock.setRole('customer');
      const group = await mkGroup();
      const res   = await request(app).post('/api/types').send({ groupId: group.id, name: 'Test' });
      expect(res.status).to.equal(403);
    });
  });

  describe('DELETE /api/types/:id', () => {
    it('deletes a type with no assets', async () => {
      const group = await mkGroup();
      const type  = await mkType(group.id);
      const res   = await request(app).delete(`/api/types/${type.id}`);
      expect(res.status).to.equal(200);
      expect(await AssetType.countDocuments()).to.equal(0);
    });

    it('cascade-deletes all assets belonging to the type', async () => {
      const group = await mkGroup();
      const type  = await mkType(group.id);
      await mkAsset(type.id, 'Unit 001');
      await mkAsset(type.id, 'Unit 002');
      await mkAsset(type.id, 'Unit 003');

      const res = await request(app).delete(`/api/types/${type.id}`);
      expect(res.status).to.equal(200);
      expect(await Asset.countDocuments()).to.equal(0);
    });

    it('only removes assets belonging to the deleted type', async () => {
      const group = await mkGroup();
      const typeA = await mkType(group.id, 'Type A');
      const typeB = await mkType(group.id, 'Type B');
      await mkAsset(typeA.id);
      await mkAsset(typeB.id);

      await request(app).delete(`/api/types/${typeA.id}`);

      expect(await AssetType.countDocuments()).to.equal(1);
      expect(await Asset.countDocuments()).to.equal(1);
    });

    it('returns 403 when user is not admin', async () => {
      clerkMock.setRole('customer');
      const group = await mkGroup();
      const type  = await mkType(group.id);
      const res   = await request(app).delete(`/api/types/${type.id}`);
      expect(res.status).to.equal(403);
    });
  });

  // ── Assets ──────────────────────────────────────────────────────────────────

  describe('GET /api/assets', () => {
    it('returns an empty array when no assets exist', async () => {
      const res = await request(app).get('/api/assets');
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal([]);
    });

    it('returns all assets', async () => {
      const group = await mkGroup();
      const type  = await mkType(group.id);
      await mkAsset(type.id, 'Unit 001');
      await mkAsset(type.id, 'Unit 002');
      const res = await request(app).get('/api/assets');
      expect(res.body).to.have.length(2);
    });
  });

  describe('POST /api/assets', () => {
    it('creates an asset with status Available by default', async () => {
      const group = await mkGroup();
      const type  = await mkType(group.id);
      const res   = await request(app).post('/api/assets').send({ typeId: type.id, name: 'Unit 001' });
      expect(res.status).to.equal(201);
      expect(res.body.name).to.equal('Unit 001');
      expect(res.body.status).to.equal('Available');
      expect(res.body.typeId).to.equal(type.id);
    });

    it('returns 400 when typeId is missing', async () => {
      const res = await request(app).post('/api/assets').send({ name: 'Unit 001' });
      expect(res.status).to.equal(400);
    });

    it('returns 400 when name is missing', async () => {
      const group = await mkGroup();
      const type  = await mkType(group.id);
      const res   = await request(app).post('/api/assets').send({ typeId: type.id });
      expect(res.status).to.equal(400);
    });

    it('returns 403 when user is not admin', async () => {
      clerkMock.setRole('customer');
      const group = await mkGroup();
      const type  = await mkType(group.id);
      const res   = await request(app).post('/api/assets').send({ typeId: type.id, name: 'Unit 001' });
      expect(res.status).to.equal(403);
    });
  });

  describe('POST /api/assets/batch', () => {
    it('creates multiple assets in one request', async () => {
      const group = await mkGroup();
      const type  = await mkType(group.id);
      const names = ['MAC 001', 'MAC 002', 'MAC 003'];

      const res = await request(app).post('/api/assets/batch').send({ typeId: type.id, names });
      expect(res.status).to.equal(201);
      expect(res.body).to.have.length(3);
      expect(res.body.map((a: any) => a.name)).to.deep.equal(names);
      expect(await Asset.countDocuments()).to.equal(3);
    });

    it('all batch-created assets are Available and belong to the correct type', async () => {
      const group = await mkGroup();
      const type  = await mkType(group.id);

      const res = await request(app).post('/api/assets/batch').send({ typeId: type.id, names: ['A', 'B'] });
      expect(res.body.every((a: any) => a.status === 'Available')).to.be.true;
      expect(res.body.every((a: any) => a.typeId === type.id)).to.be.true;
    });

    it('returns 400 when names array is empty', async () => {
      const group = await mkGroup();
      const type  = await mkType(group.id);
      const res = await request(app).post('/api/assets/batch').send({ typeId: type.id, names: [] });
      expect(res.status).to.equal(400);
    });

    it('returns 400 when typeId is missing', async () => {
      const res = await request(app).post('/api/assets/batch').send({ names: ['A'] });
      expect(res.status).to.equal(400);
    });

    it('returns 403 when user is not admin', async () => {
      clerkMock.setRole('customer');
      const group = await mkGroup();
      const type  = await mkType(group.id);
      const res = await request(app).post('/api/assets/batch').send({ typeId: type.id, names: ['A'] });
      expect(res.status).to.equal(403);
    });
  });

  describe('DELETE /api/assets/:id', () => {
    it('deletes an asset', async () => {
      const group = await mkGroup();
      const type  = await mkType(group.id);
      const asset = await mkAsset(type.id);

      const res = await request(app).delete(`/api/assets/${asset.id}`);
      expect(res.status).to.equal(200);
      expect(await Asset.countDocuments()).to.equal(0);
    });

    it('returns 403 when user is not admin', async () => {
      clerkMock.setRole('customer');
      const group = await mkGroup();
      const type  = await mkType(group.id);
      const asset = await mkAsset(type.id);

      const res = await request(app).delete(`/api/assets/${asset.id}`);
      expect(res.status).to.equal(403);
    });
  });

  describe('PATCH /api/assets/bulk-status', () => {
    it('admin can update status for multiple assets at once', async () => {
      const group  = await mkGroup();
      const type   = await mkType(group.id);
      // Must start in Pending Rental because Available → Rented is not a valid
      // transition under the State pattern — assets must go through the rental
      // request → approve workflow.
      const assetA = await Asset.create({
        typeId: type.id, name: 'Unit 001', status: 'Pending Rental',
        rentedByUserId: 'test_user_id', returnDate: '2026-05-01',
      });
      const assetB = await Asset.create({
        typeId: type.id, name: 'Unit 002', status: 'Pending Rental',
        rentedByUserId: 'test_user_id', returnDate: '2026-05-01',
      });

      const res = await request(app).patch('/api/assets/bulk-status')
        .send({ ids: [assetA.id, assetB.id], status: 'Rented' });
      expect(res.status).to.equal(200);
      const updated = await Asset.find({});
      expect(updated.every(a => a.status === 'Rented')).to.be.true;
    });

    it('clears rentedByUserId and returnDate when clearRentalData is true', async () => {
      const group = await mkGroup();
      const type  = await mkType(group.id);
      // Must start in Pending Return because Rented → Available is not a valid
      // transition under the State pattern — returns must be approved first.
      const asset = await Asset.create({
        typeId: type.id, name: 'Unit 001', status: 'Pending Return',
        rentedByUserId: 'test_user_id', returnDate: '2026-04-15',
      });

      await request(app).patch('/api/assets/bulk-status')
        .send({ ids: [asset.id], status: 'Available', clearRentalData: true });

      const updated = await Asset.findById(asset.id);
      expect(updated!.status).to.equal('Available');
      expect(updated!.rentedByUserId).to.be.undefined;
      expect(updated!.returnDate).to.be.undefined;
    });

    it('preserves rental data when clearRentalData is false', async () => {
      const group = await mkGroup();
      const type  = await mkType(group.id);
      const asset = await Asset.create({
        typeId: type.id, name: 'Unit 001', status: 'Rented',
        rentedByUserId: 'test_user_id', returnDate: '2026-04-15',
      });

      await request(app).patch('/api/assets/bulk-status')
        .send({ ids: [asset.id], status: 'Pending Return', clearRentalData: false });

      const updated = await Asset.findById(asset.id);
      expect(updated!.rentedByUserId).to.equal('test_user_id');
      expect(updated!.returnDate).to.equal('2026-04-15');
    });

    it('clears rental data by default when state machine says so (no clearRentalData flag)', async () => {
      // Set up an asset in "Pending Return" with rental data.
      // PendingReturnState.shouldClearRentalData('Available') returns true,
      // so rental data should be cleared without the client needing to send
      // the clearRentalData flag.
      const group = await mkGroup();
      const type  = await mkType(group.id);
      const asset = await Asset.create({
        typeId: type.id,
        name: 'Rented Unit',
        status: 'Pending Return',
        rentedByUserId: 'user-123',
        returnDate: '2025-01-01',
      });

      // Transition to Available WITHOUT sending clearRentalData
      const res = await request(app)
        .patch('/api/assets/bulk-status')
        .set('Authorization', 'Bearer valid')
        .send({ ids: [asset.id], status: 'Available' });

      expect(res.status).to.equal(200);
      const updated = res.body[0];
      expect(updated.status).to.equal('Available');
      expect(updated.rentedByUserId).to.be.undefined;
      expect(updated.returnDate).to.be.undefined;
    });

    it('returns 400 when ids array is missing', async () => {
      const res = await request(app).patch('/api/assets/bulk-status').send({ status: 'Available' });
      expect(res.status).to.equal(400);
    });

    it('customer can transition their own asset Rented → Pending Return', async () => {
      clerkMock.setRole('customer');
      const group = await mkGroup();
      const type  = await mkType(group.id);
      const asset = await Asset.create({
        typeId: type.id, name: 'Unit 001',
        status: 'Rented', rentedByUserId: 'test_user_id',
      });

      const res = await request(app).patch('/api/assets/bulk-status')
        .send({ ids: [asset.id], status: 'Pending Return' });
      expect(res.status).to.equal(200);
    });

    it('customer cannot set status to Maintenance', async () => {
      clerkMock.setRole('customer');
      const group = await mkGroup();
      const type  = await mkType(group.id);
      const asset = await mkAsset(type.id);

      const res = await request(app).patch('/api/assets/bulk-status')
        .send({ ids: [asset.id], status: 'Maintenance' });
      expect(res.status).to.equal(403);
    });

    it('customer cannot update assets they do not own', async () => {
      clerkMock.setRole('customer');
      const group = await mkGroup();
      const type  = await mkType(group.id);
      const asset = await Asset.create({
        typeId: type.id, name: 'Unit 001',
        status: 'Rented', rentedByUserId: 'another_user_id',
      });

      const res = await request(app).patch('/api/assets/bulk-status')
        .send({ ids: [asset.id], status: 'Pending Return' });
      expect(res.status).to.equal(403);
    });
  });

  // ── Pending Return workflow ──────────────────────────────────────────────────

  describe('Pending Return workflow', () => {
    const mkPendingReturn = async () => {
      const group = await mkGroup();
      const type  = await mkType(group.id);
      return Asset.create({
        typeId: type.id, name: 'Unit 001',
        status: 'Pending Return',
        rentedByUserId: 'test_user_id',
        returnDate: '2026-04-20',
      });
    };

    it('admin can approve a return — asset transitions to Available and rental data is cleared', async () => {
      const asset = await mkPendingReturn();

      const res = await request(app).patch('/api/assets/bulk-status')
        .send({ ids: [asset.id], status: 'Available', clearRentalData: true });

      expect(res.status).to.equal(200);
      const updated = await Asset.findById(asset.id);
      expect(updated!.status).to.equal('Available');
      expect(updated!.rentedByUserId).to.be.undefined;
      expect(updated!.returnDate).to.be.undefined;
    });

    it('admin can send a returned asset to Maintenance — rental data is cleared', async () => {
      const asset = await mkPendingReturn();

      const res = await request(app).patch('/api/assets/bulk-status')
        .send({ ids: [asset.id], status: 'Maintenance', clearRentalData: true });

      expect(res.status).to.equal(200);
      const updated = await Asset.findById(asset.id);
      expect(updated!.status).to.equal('Maintenance');
      expect(updated!.rentedByUserId).to.be.undefined;
      expect(updated!.returnDate).to.be.undefined;
    });

    it('admin can deny a return — asset goes back to Rented and rental data is preserved', async () => {
      const asset = await mkPendingReturn();

      const res = await request(app).patch('/api/assets/bulk-status')
        .send({ ids: [asset.id], status: 'Rented', clearRentalData: false });

      expect(res.status).to.equal(200);
      const updated = await Asset.findById(asset.id);
      expect(updated!.status).to.equal('Rented');
      expect(updated!.rentedByUserId).to.equal('test_user_id');
      expect(updated!.returnDate).to.equal('2026-04-20');
    });

    it('admin can approve multiple Pending Return assets in a single request', async () => {
      const group  = await mkGroup();
      const type   = await mkType(group.id);
      const assetA = await Asset.create({ typeId: type.id, name: 'Unit 001', status: 'Pending Return', rentedByUserId: 'test_user_id', returnDate: '2026-04-20' });
      const assetB = await Asset.create({ typeId: type.id, name: 'Unit 002', status: 'Pending Return', rentedByUserId: 'test_user_id', returnDate: '2026-04-20' });

      const res = await request(app).patch('/api/assets/bulk-status')
        .send({ ids: [assetA.id, assetB.id], status: 'Available', clearRentalData: true });

      expect(res.status).to.equal(200);
      const updated = await Asset.find({ _id: { $in: [assetA.id, assetB.id] } });
      expect(updated.every(a => a.status === 'Available')).to.be.true;
      expect(updated.every(a => !a.rentedByUserId)).to.be.true;
    });

    it('customer can cancel their own Pending Return (back to Rented)', async () => {
      clerkMock.setRole('customer');
      const group = await mkGroup();
      const type  = await mkType(group.id);
      const asset = await Asset.create({
        typeId: type.id, name: 'Unit 001',
        status: 'Pending Return', rentedByUserId: 'test_user_id',
      });

      const res = await request(app).patch('/api/assets/bulk-status')
        .send({ ids: [asset.id], status: 'Rented' });

      expect(res.status).to.equal(200);
      const updated = await Asset.findById(asset.id);
      expect(updated!.status).to.equal('Rented');
    });

    it('customer cannot approve or deny a Pending Return (admin-only transition to Available)', async () => {
      clerkMock.setRole('customer');
      const asset = await mkPendingReturn();

      const res = await request(app).patch('/api/assets/bulk-status')
        .send({ ids: [asset.id], status: 'Available' });

      expect(res.status).to.equal(403);
    });

    it('customer cannot send a Pending Return to Maintenance', async () => {
      clerkMock.setRole('customer');
      const asset = await mkPendingReturn();

      const res = await request(app).patch('/api/assets/bulk-status')
        .send({ ids: [asset.id], status: 'Maintenance' });

      expect(res.status).to.equal(403);
    });
  });

  // ── Rental Request workflow ──────────────────────────────────────────────────

  describe('POST /api/assets/request-rental', () => {
    it('marks available assets as Pending Rental for the requesting customer', async () => {
      clerkMock.setRole('customer');
      const group = await mkGroup();
      const type  = await mkType(group.id);
      await mkAsset(type.id, 'Unit 001', 'Available');
      await mkAsset(type.id, 'Unit 002', 'Available');

      const res = await request(app).post('/api/assets/request-rental')
        .send({ items: [{ typeId: type.id, quantity: 2 }], returnDate: '2026-05-20' });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.length(2);
      expect(res.body.every((a: any) => a.status === 'Pending Rental')).to.be.true;
      expect(res.body.every((a: any) => a.rentedByUserId === 'test_user_id')).to.be.true;
      expect(res.body.every((a: any) => a.returnDate === '2026-05-20')).to.be.true;
    });

    it('returns 409 when not enough units are available', async () => {
      clerkMock.setRole('customer');
      const group = await mkGroup();
      const type  = await mkType(group.id);
      await mkAsset(type.id, 'Unit 001', 'Available'); // only 1 available

      const res = await request(app).post('/api/assets/request-rental')
        .send({ items: [{ typeId: type.id, quantity: 3 }], returnDate: '2026-05-20' });

      expect(res.status).to.equal(409);
    });

    it('only picks up Available assets (not Rented, Maintenance, etc.)', async () => {
      clerkMock.setRole('customer');
      const group = await mkGroup();
      const type  = await mkType(group.id);
      await Asset.create({ typeId: type.id, name: 'Unit 001', status: 'Available' });
      await Asset.create({ typeId: type.id, name: 'Unit 002', status: 'Rented', rentedByUserId: 'other_user_id' });
      await Asset.create({ typeId: type.id, name: 'Unit 003', status: 'Maintenance' });

      const res = await request(app).post('/api/assets/request-rental')
        .send({ items: [{ typeId: type.id, quantity: 2 }], returnDate: '2026-05-20' });

      // Only 1 available, requesting 2 → conflict
      expect(res.status).to.equal(409);
    });

    it('returns 400 when items array is missing', async () => {
      const res = await request(app).post('/api/assets/request-rental')
        .send({ returnDate: '2026-05-20' });
      expect(res.status).to.equal(400);
    });

    it('returns 400 when returnDate is missing', async () => {
      const group = await mkGroup();
      const type  = await mkType(group.id);
      const res = await request(app).post('/api/assets/request-rental')
        .send({ items: [{ typeId: type.id, quantity: 1 }] });
      expect(res.status).to.equal(400);
    });
  });

});
