/**
 * @module AssetTypeComponent
 * Composite node in the inventory tree. Wraps an AssetType document and
 * holds an array of AssetComponent children. Delegates delete() and
 * getPhotoPaths() recursively to its children via Template Methods
 * inherited from InventoryComponent.
 */

import InventoryComponent from './InventoryComponent';
import AssetType, { AssetTypeDocument } from '../../models/AssetType';
import AssetComponent from './AssetComponent';

export class AssetTypeComponent extends InventoryComponent {
  public children: AssetComponent[] = [];

  /**
   * @param {AssetTypeDocument} typeDoc - A Mongoose AssetType document.
   */
  constructor(typeDoc: AssetTypeDocument) {
    super();
    /** The raw Mongoose document backing this node. */
    this.doc = typeDoc;
  }

  /** @returns {string} */
  getName(): string     { return this.doc.name; }
  /** @returns {InventoryComponent[]} */
  override getChildren(): InventoryComponent[] { return this.children; }

  protected async _deleteSelf(): Promise<void> {
    await AssetType.findByIdAndDelete(this.doc._id);
  }
}

export default AssetTypeComponent;
