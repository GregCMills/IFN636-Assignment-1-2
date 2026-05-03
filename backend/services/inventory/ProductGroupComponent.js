/**
 * @module ProductGroupComponent
 * Root composite node in the inventory tree. Wraps a ProductGroup document
 * and holds an array of AssetTypeComponent children. Delegates delete() and
 * getPhotoPaths() recursively through the entire subtree via Template Methods
 * inherited from InventoryComponent.
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

  async _deleteSelf() {
    await ProductGroup.findByIdAndDelete(this.doc._id);
  }
}

module.exports = ProductGroupComponent;
