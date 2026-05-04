/**
 * @module InventoryTreeBuilder
 * Stateless factory class that assembles Composite trees from MongoDB.
 * Each static method queries the database and recursively builds the
 * minimum subtree needed for the requested operation.
 *
 * Query counts:
 *   fromGroupId  → 1 group + 1 type find + 1 asset find = 3 queries
 *   fromTypeId   → 1 type  + 1 asset find               = 2 queries
 *   fromAssetId  → 1 asset                               = 1 query
 */

const ProductGroup = require('../../models/ProductGroup');
const AssetType    = require('../../models/AssetType');
const Asset        = require('../../models/Asset');

const ProductGroupComponent = require('./ProductGroupComponent');
const AssetTypeComponent    = require('./AssetTypeComponent');
const AssetComponent        = require('./AssetComponent');

class InventoryTreeBuilder {

  /**
   * Builds a full subtree rooted at the given ProductGroup. The returned
   * node contains all child AssetTypes and their descendant Assets.
   *
   * @param {string} groupId - MongoDB ObjectId of the ProductGroup.
   * @returns {Promise<ProductGroupComponent|null>} The root node, or null if not found.
   */
  static async fromGroupId(groupId) {
    const groupDoc = await ProductGroup.findById(groupId);
    if (!groupDoc) return null;

    const group = new ProductGroupComponent(groupDoc);

    // Attach all child types (each with their own assets).
    const typeDocs = await AssetType.find({ groupId });
    for (const typeDoc of typeDocs) {
      const typeNode = await InventoryTreeBuilder._buildTypeNode(typeDoc);
      group.children.push(typeNode);
    }

    return group;
  }

  /**
   * Builds a subtree rooted at the given AssetType. The returned node
   * contains all child Assets.
   *
   * @param {string} typeId - MongoDB ObjectId of the AssetType.
   * @returns {Promise<AssetTypeComponent|null>} The type node, or null if not found.
   */
  static async fromTypeId(typeId) {
    const typeDoc = await AssetType.findById(typeId);
    if (!typeDoc) return null;

    return InventoryTreeBuilder._buildTypeNode(typeDoc);
  }

  /**
   * Builds a leaf node for the given Asset. No children are loaded.
   *
   * @param {string} assetId - MongoDB ObjectId of the Asset.
   * @returns {Promise<AssetComponent|null>} The leaf node, or null if not found.
   */
  static async fromAssetId(assetId) {
    const assetDoc = await Asset.findById(assetId);
    if (!assetDoc) return null;

    return new AssetComponent(assetDoc);
  }

  /**
   * Internal helper: creates an AssetTypeComponent and attaches all of its
   * child Asset leaves. Shared by fromGroupId and fromTypeId.
   *
   * @param {import('mongoose').Document} typeDoc - A Mongoose AssetType document.
   * @returns {Promise<AssetTypeComponent>}
   */
  static async _buildTypeNode(typeDoc) {
    const typeNode = new AssetTypeComponent(typeDoc);

    const assetDocs = await Asset.find({ typeId: typeDoc._id });
    for (const assetDoc of assetDocs) {
      typeNode.children.push(new AssetComponent(assetDoc));
    }

    return typeNode;
  }
}

module.exports = InventoryTreeBuilder;
