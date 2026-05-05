/**
 * @module AssetComponent
 * Leaf node in the inventory Composite tree. Wraps a single Asset document.
 * Has no children — getChildren() returns an empty array (inherited default).
 * getPhotoPaths() and delete() are inherited from InventoryComponent as
 * Template Methods; the leaf behaviour (collect own photos, skip children,
 * delete self) is the natural consequence of getChildren() returning [].
 */

import InventoryComponent from './InventoryComponent';
import Asset, { AssetDocument } from '../../models/Asset';

export class AssetComponent extends InventoryComponent {
  /**
   * @param {AssetDocument} assetDoc - A Mongoose Asset document.
   */
  constructor(assetDoc: AssetDocument) {
    super();
    /** The raw Mongoose document backing this node. */
    this.doc = assetDoc;
  }

  /** @returns {string} */
  getName(): string     { return this.doc.name; }

  protected async _deleteSelf(): Promise<void> {
    await Asset.findByIdAndDelete(this.doc._id);
  }
}

export default AssetComponent;
