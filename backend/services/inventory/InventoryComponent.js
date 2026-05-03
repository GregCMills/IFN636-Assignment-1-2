/**
 * @module InventoryComponent
 * Abstract base class defining the Composite pattern interface for the
 * inventory tree (ProductGroup → AssetType → Asset).
 *
 * Concrete subclasses must override getId, getName, getPhotoPaths, and delete.
 * getChildren() defaults to an empty array so leaf nodes don't need to override it.
 */
class InventoryComponent {
  /** @returns {string} The entity's MongoDB ID as a plain string. */
  getId()         { throw new Error('Not implemented'); }

  /** @returns {string} The entity's human-readable display name. */
  getName()       { throw new Error('Not implemented'); }

  /** @returns {InventoryComponent[]} Child components; empty for leaf nodes. */
  getChildren()   { return []; }

  /**
   * Collects photo file paths (imageUrl + thumbnailUrl) for this entity and
   * all descendants in the subtree.
   * @returns {string[]}
   */
  getPhotoPaths() { throw new Error('Not implemented'); }

  /**
   * Deletes this entity and all descendants from the database and,
   * if a storageStrategy is provided, from external storage (S3 / disk).
   * @param {object|null} storageStrategy - Must expose an async delete(url) method.
   *        Pass null to skip photo file deletion.
   * @returns {Promise<void>}
   */
  async delete(storageStrategy) { throw new Error('Not implemented'); }
}

module.exports = InventoryComponent;
