/**
 * @module ProductGroupComponent
 * Root composite node in the inventory tree. Wraps a ProductGroup document
 * and holds an array of AssetTypeComponent children. Delegates delete() and
 * getPhotoPaths() recursively through the entire subtree.
 */

const InventoryComponent = require('./InventoryComponent');
const ProductGroup = require('../../models/ProductGroup');

class ProductGroupComponent extends InventoryComponent {
  /**
   * @param {import('mongoose').Document} groupDoc - A Mongoose ProductGroup document.
   */
  constructor(groupDoc) {
    super();
    /** The raw Mongoose document backing this node. */
    this.doc = groupDoc;
    /** @type {import('./AssetTypeComponent')[]} Child type composite nodes. */
    this.children = [];
  }

  /** @returns {string} */
  getId()       { return this.doc._id.toString(); }
  /** @returns {string} */
  getName()     { return this.doc.name; }
  /** @returns {InventoryComponent[]} */
  getChildren() { return this.children; }

  /**
   * Collects photo URLs from this group and recursively from all descendant
   * types and assets.
   * @returns {string[]}
   */
  getPhotoPaths() {
    const paths = [];
    if (this.doc.imageUrl)     paths.push(this.doc.imageUrl);
    if (this.doc.thumbnailUrl) paths.push(this.doc.thumbnailUrl);
    for (const child of this.children) {
      paths.push(...child.getPhotoPaths());
    }
    return paths;
  }

  /**
   * Deletes all child types and their assets first (recursively), then this
   * group's photos (if a storage strategy is supplied), and finally the
   * database document. Delete order is bottom-up so no orphaned documents
   * remain if a descendant deletion fails.
   *
   * @param {object|null} storageStrategy - Must expose async delete(url).
   * @returns {Promise<void>}
   */
  async delete(storageStrategy) {
    // Delete children first so types and assets are removed before the group.
    for (const child of this.children) {
      await child.delete(storageStrategy);
    }
    if (storageStrategy) {
      if (this.doc.imageUrl)     await storageStrategy.delete(this.doc.imageUrl);
      if (this.doc.thumbnailUrl) await storageStrategy.delete(this.doc.thumbnailUrl);
    }
    await ProductGroup.findByIdAndDelete(this.doc._id);
  }
}

module.exports = ProductGroupComponent;
