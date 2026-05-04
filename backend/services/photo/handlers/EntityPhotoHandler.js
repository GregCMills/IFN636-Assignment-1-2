/**
 * @module EntityPhotoHandler
 * Base class for entity-specific photo handlers (Factory Method pattern).
 *
 * Each concrete subclass knows its own Mongoose model and subdirectory name.
 * The base class provides common implementations for findById, updatePhoto,
 * getPhotoPaths, and deleteEntityPhotoFiles.  Concrete subclasses only need
 * to define their `model` and `subdirectory`.
 *
 * Client code (PhotoService) works through this base interface without knowing
 * which concrete handler it received — the Factory Method pattern in action.
 */
class EntityPhotoHandler {
  /**
   * @returns {import('mongoose').Model} The Mongoose model for this entity.
   */
  get model() { throw new Error('Not implemented'); }

  /**
   * @returns {string} The subdirectory name for this entity's photos
   *         (e.g. 'groups', 'types', 'assets').
   */
  get subdirectory() { throw new Error('Not implemented'); }

  /**
   * Finds the entity document by its MongoDB ID.
   * @param {string} id - MongoDB ObjectId as a string
   * @returns {Promise<object|null>} The Mongoose document or null
   */
  async findById(id) {
    return this.model.findById(id);
  }

  /**
   * Updates the photo URLs on the entity document.
   * @param {string} id           - MongoDB ObjectId as a string
   * @param {string} imageUrl     - Full relative URL for the main photo
   * @param {string} thumbnailUrl - Full relative URL for the thumbnail
   * @returns {Promise<object>} The updated document
   */
  async updatePhoto(id, imageUrl, thumbnailUrl) {
    return this.model.findByIdAndUpdate(
      id,
      { imageUrl, thumbnailUrl },
      { new: true },
    );
  }

  /**
   * Retrieves the current photo URL fields from the entity.
   * @param {string} id - MongoDB ObjectId as a string
   * @returns {Promise<{imageUrl: string|null, thumbnailUrl: string|null}>}
   */
  async getPhotoPaths(id) {
    const doc = await this.model.findById(id).select('imageUrl thumbnailUrl');
    if (!doc) return { imageUrl: null, thumbnailUrl: null };
    return { imageUrl: doc.imageUrl || null, thumbnailUrl: doc.thumbnailUrl || null };
  }

  /**
   * Deletes the photo files for an entity from storage.
   * Used during cascading delete and when replacing an existing photo.
   *
   * @param {string} id              - MongoDB ObjectId as a string
   * @param {object} storageStrategy - Must expose async delete(relativePath)
   * @returns {Promise<void>}
   */
  async deleteEntityPhotoFiles(id, storageStrategy) {
    if (!storageStrategy) return;
    const paths = await this.getPhotoPaths(id);
    if (paths.imageUrl)     await storageStrategy.delete(paths.imageUrl);
    if (paths.thumbnailUrl) await storageStrategy.delete(paths.thumbnailUrl);
  }

}

module.exports = EntityPhotoHandler;
