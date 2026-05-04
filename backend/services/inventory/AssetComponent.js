/**
 * @module AssetComponent
 * Leaf node in the inventory Composite tree. Wraps a single Asset document.
 * Has no children — getChildren() returns an empty array (inherited default).
 * getPhotoPaths() and delete() are inherited from InventoryComponent as
 * Template Methods; the leaf behaviour (collect own photos, skip children,
 * delete self) is the natural consequence of getChildren() returning [].
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

  async _deleteSelf() {
    await Asset.findByIdAndDelete(this.doc._id);
  }
}

module.exports = AssetComponent;
