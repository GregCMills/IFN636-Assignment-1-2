/**
 * @module AssetTypeComponent
 * Composite node in the inventory tree. Wraps an AssetType document and
 * holds an array of AssetComponent children. Delegates delete() and
 * getPhotoPaths() recursively to its children via Template Methods
 * inherited from InventoryComponent.
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

  async _deleteSelf() {
    await AssetType.findByIdAndDelete(this.doc._id);
  }
}

module.exports = AssetTypeComponent;
