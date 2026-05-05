/**
 * @module ProductGroupComponent
 * Root composite node in the inventory tree. Wraps a ProductGroup document
 * and holds an array of AssetTypeComponent children. Delegates delete() and
 * getPhotoPaths() recursively through the entire subtree via Template Methods
 * inherited from InventoryComponent.
 */

import InventoryComponent from './InventoryComponent';
import ProductGroup, { ProductGroupDocument } from '../../models/ProductGroup';
import AssetTypeComponent from './AssetTypeComponent';

export class ProductGroupComponent extends InventoryComponent {
  public children: AssetTypeComponent[] = [];

  /**
   * @param {ProductGroupDocument} groupDoc - A Mongoose ProductGroup document.
   */
  constructor(groupDoc: ProductGroupDocument) {
    super();
    /** The raw Mongoose document backing this node. */
    this.doc = groupDoc;
  }

  /** @returns {string} */
  getName(): string     { return this.doc.name; }
  /** @returns {InventoryComponent[]} */
  override getChildren(): InventoryComponent[] { return this.children; }

  protected async _deleteSelf(): Promise<void> {
    await ProductGroup.findByIdAndDelete(this.doc._id);
  }
}

export default ProductGroupComponent;
