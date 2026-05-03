/**
 * @module AssetComponent
 * Leaf node in the inventory Composite tree. Wraps a single Asset document.
 * Has no children — getChildren() always returns an empty array.
 */

const InventoryComponent = require('./InventoryComponent');
const Asset = require('../../models/Asset');

class AssetComponent extends InventoryComponent {
  /**
   * @param {import('mongoose').Document} assetDoc - A Mongoose Asset document.
   */
  constructor(assetDoc) {
    super();
    /** The raw Mongoose document backing this node. */
    this.doc = assetDoc;
  }

  /** @returns {string} */
  getId()       { return this.doc._id.toString(); }
  /** @returns {string} */
  getName()     { return this.doc.name; }
  /** @returns {InventoryComponent[]} Always empty — this is a leaf. */
  getChildren() { return []; }

  /**
   * Collects this asset's photo URLs. Since this is a leaf there are no
   * descendants to recurse into.
   * @returns {string[]}
   */
  getPhotoPaths() {
    const paths = [];
    if (this.doc.imageUrl)     paths.push(this.doc.imageUrl);
    if (this.doc.thumbnailUrl) paths.push(this.doc.thumbnailUrl);
    return paths;
  }

  /**
   * Deletes this asset's photos (if a storage strategy is supplied) then
   * removes the database document.
   * @param {object|null} storageStrategy - Must expose async delete(url).
   * @returns {Promise<void>}
   */
  async delete(storageStrategy) {
    if (storageStrategy) {
      if (this.doc.imageUrl)     await storageStrategy.delete(this.doc.imageUrl);
      if (this.doc.thumbnailUrl) await storageStrategy.delete(this.doc.thumbnailUrl);
    }
    await Asset.findByIdAndDelete(this.doc._id);
  }
}

module.exports = AssetComponent;
