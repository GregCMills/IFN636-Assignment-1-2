'use strict';

/**
 * @module composite.test
 * Integration tests for the Composite pattern inventory classes.
 *
 * These tests exercise the InventoryTreeBuilder and the three component
 * classes (ProductGroupComponent, AssetTypeComponent, AssetComponent)
 * directly, without going through the Express API layer.
 *
 * setup.js handles Clerk stubbing and MongoDB lifecycle — the auth mock
 * from setup.js is NOT used here since these tests call the composite
 * classes directly rather than going through Express routes.
 */

// setup.js handles @clerk/express stubbing and DB connection.
// Use global.clerkMock to control auth state per-test.

const chai = require('chai');
const { expect } = chai;

const ProductGroup = require('../models/ProductGroup');
const AssetType    = require('../models/AssetType');
const Asset        = require('../models/Asset');

const InventoryTreeBuilder = require('../services/inventory/InventoryTreeBuilder');

// ── Seed helpers ──────────────────────────────────────────────────────────────

/** Creates a ProductGroup with the given name. */
const mkGroup = (name = 'Laptops') =>
  ProductGroup.create({ name });

/** Creates an AssetType linked to the given group. */
const mkType = (groupId, name = 'MacBook Pro') =>
  AssetType.create({ groupId, name });

/** Creates an Asset linked to the given type. */
const mkAsset = (typeId, name = 'Unit 001', status = 'Available') =>
  Asset.create({ typeId, name, status });

// ─────────────────────────────────────────────────────────────────────────────

describe('InventoryComponent Composite', () => {

  // Clean the database after every test so tests don't leak state.
  afterEach(async () => {
    await Promise.all([
      ProductGroup.deleteMany({}),
      AssetType.deleteMany({}),
      Asset.deleteMany({}),
    ]);
  });

  // ── Tree builder: fromGroupId ────────────────────────────────────────────

  describe('InventoryTreeBuilder.fromGroupId', () => {
    it('builds a tree with the correct parent-child relationships', async () => {
      const group = await mkGroup();
      const type  = await mkType(group.id);
      await mkAsset(type.id, 'Unit 001');
      await mkAsset(type.id, 'Unit 002');

      const root = await InventoryTreeBuilder.fromGroupId(group.id);
      expect(root.getName()).to.equal(group.name);
      expect(root.getChildren()).to.have.length(1);
      expect(root.getChildren()[0].getChildren()).to.have.length(2);
    });

    it('returns null for a non-existent group', async () => {
      const root = await InventoryTreeBuilder.fromGroupId('507f1f77bcf86cd799439011');
      expect(root).to.be.null;
    });

    it('builds a tree where group delete cascades to all descendants', async () => {
      const group = await mkGroup();
      const type  = await mkType(group.id);
      await mkAsset(type.id, 'Unit 001');
      await mkAsset(type.id, 'Unit 002');

      const root = await InventoryTreeBuilder.fromGroupId(group.id);
      await root.delete(null);

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

      const root = await InventoryTreeBuilder.fromGroupId(groupA.id);
      await root.delete(null);

      expect(await ProductGroup.countDocuments()).to.equal(1);
      expect(await AssetType.countDocuments()).to.equal(1);
      expect(await Asset.countDocuments()).to.equal(1);
    });
  });

  // ── Tree builder: fromTypeId ─────────────────────────────────────────────

  describe('InventoryTreeBuilder.fromTypeId', () => {
    it('builds a tree with the correct child count', async () => {
      const group = await mkGroup();
      const type  = await mkType(group.id);
      await mkAsset(type.id, 'Unit 001');
      await mkAsset(type.id, 'Unit 002');

      const root = await InventoryTreeBuilder.fromTypeId(type.id);
      expect(root.getName()).to.equal(type.name);
      expect(root.getChildren()).to.have.length(2);
    });

    it('returns null for a non-existent type', async () => {
      const root = await InventoryTreeBuilder.fromTypeId('507f1f77bcf86cd799439011');
      expect(root).to.be.null;
    });

    it('cascade-deletes all assets belonging to the type', async () => {
      const group = await mkGroup();
      const type  = await mkType(group.id);
      await mkAsset(type.id, 'Unit 001');
      await mkAsset(type.id, 'Unit 002');
      await mkAsset(type.id, 'Unit 003');

      const root = await InventoryTreeBuilder.fromTypeId(type.id);
      await root.delete(null);

      expect(await Asset.countDocuments()).to.equal(0);
      expect(await AssetType.countDocuments()).to.equal(0);
    });

    it('only removes assets belonging to the deleted type', async () => {
      const group = await mkGroup();
      const typeA = await mkType(group.id, 'Type A');
      const typeB = await mkType(group.id, 'Type B');
      await mkAsset(typeA.id);
      await mkAsset(typeB.id);

      const root = await InventoryTreeBuilder.fromTypeId(typeA.id);
      await root.delete(null);

      expect(await AssetType.countDocuments()).to.equal(1);
      expect(await Asset.countDocuments()).to.equal(1);
    });
  });

  // ── Tree builder: fromAssetId ────────────────────────────────────────────

  describe('InventoryTreeBuilder.fromAssetId', () => {
    it('builds a leaf node with no children', async () => {
      const group = await mkGroup();
      const type  = await mkType(group.id);
      const asset = await mkAsset(type.id, 'Unit 001');

      const root = await InventoryTreeBuilder.fromAssetId(asset.id);
      expect(root.getName()).to.equal('Unit 001');
      expect(root.getChildren()).to.be.an('array').that.is.empty;
    });

    it('returns null for a non-existent asset', async () => {
      const root = await InventoryTreeBuilder.fromAssetId('507f1f77bcf86cd799439011');
      expect(root).to.be.null;
    });

    it('deletes the asset', async () => {
      const group = await mkGroup();
      const type  = await mkType(group.id);
      const asset = await mkAsset(type.id, 'Unit 001');

      const root = await InventoryTreeBuilder.fromAssetId(asset.id);
      await root.delete(null);

      expect(await Asset.countDocuments()).to.equal(0);
    });
  });

  // ── Photo path collection ────────────────────────────────────────────────

  describe('getPhotoPaths', () => {
    it('returns an empty array when no photo fields are set', async () => {
      const group = await mkGroup();
      const type  = await mkType(group.id);
      await mkAsset(type.id, 'Unit 001');

      const root = await InventoryTreeBuilder.fromGroupId(group.id);
      expect(root.getPhotoPaths()).to.be.an('array').that.is.empty;
    });

    it('collects photo paths from all levels of the tree', async () => {
      const group = await ProductGroup.create({ name: 'Test', imageUrl: 'groups/test.jpg' });
      const type  = await AssetType.create({ groupId: group.id, name: 'Type', thumbnailUrl: 'types/thumb.jpg' });
      const asset = await Asset.create({ typeId: type.id, name: 'Unit', imageUrl: 'assets/img.jpg' });

      const root = await InventoryTreeBuilder.fromGroupId(group.id);
      const paths = root.getPhotoPaths();

      expect(paths).to.include('groups/test.jpg');
      expect(paths).to.include('types/thumb.jpg');
      expect(paths).to.include('assets/img.jpg');
    });
  });

  // ── Storage strategy integration ─────────────────────────────────────────

  describe('delete with storageStrategy', () => {
    it('calls storageStrategy.delete for each photo', async () => {
      const deletedUrls = [];

      const mockStrategy = {
        delete: async (url) => { deletedUrls.push(url); },
      };

      const group = await ProductGroup.create({
        name: 'Test', imageUrl: 'g.jpg', thumbnailUrl: 'gt.jpg',
      });
      const type  = await AssetType.create({
        groupId: group.id, name: 'Type', thumbnailUrl: 't.jpg',
      });
      const asset = await Asset.create({
        typeId: type.id, name: 'Unit', imageUrl: 'a.jpg',
      });

      const root = await InventoryTreeBuilder.fromGroupId(group.id);
      await root.delete(mockStrategy);

      expect(deletedUrls).to.have.length(4);
      expect(deletedUrls).to.include('a.jpg');
      expect(deletedUrls).to.include('t.jpg');
      expect(deletedUrls).to.include('g.jpg');
      expect(deletedUrls).to.include('gt.jpg');
    });

    it('skips photo deletion when storageStrategy is null', async () => {
      const group = await ProductGroup.create({ name: 'Test', imageUrl: 'g.jpg' });
      await mkType(group.id, 'Type');
      await mkAsset((await AssetType.findOne()).id, 'Unit');

      const root = await InventoryTreeBuilder.fromGroupId(group.id);
      // null strategy — should delete DB docs without touching photos
      await root.delete(null);

      expect(await ProductGroup.countDocuments()).to.equal(0);
      expect(await AssetType.countDocuments()).to.equal(0);
      expect(await Asset.countDocuments()).to.equal(0);
    });
  });

});
