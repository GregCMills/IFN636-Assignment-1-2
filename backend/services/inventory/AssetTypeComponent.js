/**
 * @module AssetTypeComponent
 * Composite node in the inventory tree. Wraps an AssetType document and
 * holds an array of AssetComponent children. Delegates delete() and
 * getPhotoPaths() recursively to its children.
 */

const InventoryComponent = require('./InventoryComponent');
const AssetType = require('../../models/AssetType');

class AssetTypeComponent extends InventoryComponent {
  /**
   * @param {import('mongoose').Document} typeDoc - A Mongoose AssetType document.
   */
  constructor(typeDoc) {
    super();
    /** The raw Mongoose document backing this node. */
    this.doc = typeDoc;
    /** @type {import('./AssetComponent')[]} Child asset leaf nodes. */
    this.children = [];
  }

  /** @returns {string} */
  getId()       { return this.doc._id.toString(); }
  /** @returns {string} */
  getName()     { return this.doc.name; }
  /** @returns {InventoryComponent[]} */
  getChildren() { return this.children; }

  /**
   * Collects photo URLs from this type and recursively from all descendant
   * assets.
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
   * Deletes all child assets first (recursively), then this type's photos
   * (if a storage strategy is supplied), and finally the database document.
   * Children are deleted bottom-up to match the old cascade behaviour and
   * to avoid orphaned documents if a child deletion fails partway through.
   *
   * @param {object|null} storageStrategy - Must expose async delete(url).
   * @returns {Promise<void>}
   */
  async delete(storageStrategy) {
    // Delete children first so no orphaned assets remain.
    for (const child of this.children) {
      await child.delete(storageStrategy);
    }
    if (storageStrategy) {
      if (this.doc.imageUrl)     await storageStrategy.delete(this.doc.imageUrl);
      if (this.doc.thumbnailUrl) await storageStrategy.delete(this.doc.thumbnailUrl);
    }
    await AssetType.findByIdAndDelete(this.doc._id);
  }
}

module.exports = AssetTypeComponent;
