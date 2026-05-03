/**
 * @module InventoryComponent
 * Abstract base class defining the Composite pattern interface for the
 * inventory tree (ProductGroup → AssetType → Asset).
 *
 * Concrete subclasses must override getId, getName, and _deleteSelf.
 * getChildren() defaults to an empty array so leaf nodes don't need to override it.
 * getPhotoPaths() and delete() are Template Methods that delegate to
 * the helper methods _collectOwnPhotoPaths, _deleteOwnPhotos, and _deleteSelf.
 */
class InventoryComponent {
  /** @returns {string} The entity's MongoDB ID as a plain string. */
  getId()         { throw new Error('Not implemented'); }

  /** @returns {string} The entity's human-readable display name. */
  getName()       { throw new Error('Not implemented'); }

  /** @returns {InventoryComponent[]} Child components; empty for leaf nodes. */
  getChildren()   { return []; }

  // ── Helper methods (shared by all subclasses) ─────────────────────────────

  /**
   * Collects this node's own photo paths from the wrapped document.
   * All three subclasses share this pattern (imageUrl + thumbnailUrl).
   * @returns {string[]}
   */
  _collectOwnPhotoPaths() {
    const paths = [];
    if (this.doc.imageUrl)     paths.push(this.doc.imageUrl);
    if (this.doc.thumbnailUrl) paths.push(this.doc.thumbnailUrl);
    return paths;
  }

  /**
   * Deletes this node's own photos via the storage strategy.
   * All three subclasses share this pattern.
   * @param {object|null} storageStrategy
   * @returns {Promise<void>}
   */
  async _deleteOwnPhotos(storageStrategy) {
    if (storageStrategy) {
      if (this.doc.imageUrl)     await storageStrategy.delete(this.doc.imageUrl);
      if (this.doc.thumbnailUrl) await storageStrategy.delete(this.doc.thumbnailUrl);
    }
  }

  // ── Template Methods ──────────────────────────────────────────────────────

  /**
   * Template Method for collecting photo paths.
   * Collects own photos, then recurses into children.
   * Leaves inherit this as-is (getChildren() returns []).
   * @returns {string[]}
   */
  getPhotoPaths() {
    const paths = this._collectOwnPhotoPaths();
    for (const child of this.getChildren()) {
      paths.push(...child.getPhotoPaths());
    }
    return paths;
  }

  /**
   * Template Method for deletion.
   * Deletes children first (bottom-up), then own photos, then self.
   * Composites inherit this as-is; leaves override without the children loop
   * because getChildren() returns [].
   * @param {object|null} storageStrategy - Must expose an async delete(url) method.
   *        Pass null to skip photo file deletion.
   * @returns {Promise<void>}
   */
  async delete(storageStrategy) {
    for (const child of this.getChildren()) {
      await child.delete(storageStrategy);
    }
    await this._deleteOwnPhotos(storageStrategy);
    await this._deleteSelf();
  }

  /**
   * Deletes this node's own database document.
   * Subclasses must override to call the appropriate Mongoose model's
   * findByIdAndDelete (ProductGroup, AssetType, or Asset).
   * @returns {Promise<void>}
   */
  async _deleteSelf() {
    throw new Error('Not implemented');
  }
}

module.exports = InventoryComponent;
