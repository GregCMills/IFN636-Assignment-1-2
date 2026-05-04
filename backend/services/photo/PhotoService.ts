/**
 * @module PhotoService
 * Facade pattern — provides a simplified interface for all photo operations.
 *
 * Hides the complexity of storage strategies, image processing, and entity
 * handlers behind three clean methods: uploadPhoto(), deletePhoto(), and
 * getPhotoUrl().  Controllers know nothing about sharp, multer buffers, or
 * filesystem paths.
 *
 * ## Singleton
 * Exported as `new PhotoService()` so all modules share the same instance
 * (same pattern as ClerkAuthAdapter).  The storage strategy is selected once
 * at construction time based on environment config.
 *
 * ## Internal coordination
 * uploadPhoto() orchestrates:
 *   1. PhotoProcessingDirector.process(file)          → Builder
 *   2. storageStrategy.save(subdir, filename, buffer)  → Strategy (×2)
 *   3. handler.updatePhoto(id, imageUrl, thumbnailUrl) → Factory Method
 */
import PhotoProcessingDirector from './PhotoProcessingDirector';
import PhotoHandlerFactory from './handlers/PhotoHandlerFactory';
import LocalStorageStrategy from './storage/LocalStorageStrategy';
import { StorageStrategy } from './storage/StorageStrategy';

class PhotoService {
  private storageStrategy: StorageStrategy;

  constructor() {
    /**
     * The storage strategy instance.  Selected once at startup.
     * Currently always LocalStorageStrategy; could be switched to S3 etc.
     * based on an environment variable.
     */
    this.storageStrategy = new LocalStorageStrategy();
  }

  /**
   * Processes and saves a photo for the given entity.
   *
   * If the entity already has a photo, the old files are deleted before
   * saving the new ones — prevents orphaned files on the filesystem.
   *
   * @param {'group'|'type'|'asset'} entityType
   * @param {string} entityId - MongoDB ObjectId as a string
   * @param {any} file     - Multer file object: { buffer, mimetype, originalname }
   * @returns {Promise<{imageUrl: string, thumbnailUrl: string}>}
   */
  async uploadPhoto(entityType: 'group' | 'type' | 'asset', entityId: string, file: any): Promise<{ imageUrl: string; thumbnailUrl: string }> {
    const handler = PhotoHandlerFactory.create(entityType);

    // 1. Delete any existing photo files before saving new ones
    await handler.deleteEntityPhotoFiles(entityId, this.storageStrategy);

    // 2. Process the uploaded file: resize + thumbnail
    const director = new PhotoProcessingDirector();
    const result = await director.process(file.buffer, file.mimetype);

    // 3. Save processed images to storage
    const ext = file.mimetype === 'image/png' ? '.png'
      : file.mimetype === 'image/webp' ? '.webp'
      : '.jpg';

    const imageUrl     = await this.storageStrategy.save(handler.subdirectory, `${entityId}${ext}`, result.originalBuffer);
    const thumbnailUrl = await this.storageStrategy.save(handler.subdirectory, `${entityId}_thumb${ext}`, result.thumbnailBuffer);

    // 4. Update the entity document with the new URLs
    await handler.updatePhoto(entityId, imageUrl, thumbnailUrl);

    return { imageUrl, thumbnailUrl };
  }

  /**
   * Deletes a photo for the given entity — removes files from storage and
   * clears the imageUrl/thumbnailUrl fields in the database.
   *
   * @param {'group'|'type'|'asset'} entityType
   * @param {string} entityId - MongoDB ObjectId as a string
   * @returns {Promise<void>}
   */
  async deletePhoto(entityType: 'group' | 'type' | 'asset', entityId: string): Promise<void> {
    const handler = PhotoHandlerFactory.create(entityType);

    // Delete files from storage
    await handler.deleteEntityPhotoFiles(entityId, this.storageStrategy);

    // Clear the URL fields in the database
    await handler.updatePhoto(entityId, null, null);
  }

  /**
   * Retrieves the photo URLs for an entity, or null if no photo exists.
   *
   * @param {'group'|'type'|'asset'} entityType
   * @param {string} entityId - MongoDB ObjectId as a string
   * @returns {Promise<{imageUrl: string, thumbnailUrl: string} | null>}
   */
  async getPhotoUrl(entityType: 'group' | 'type' | 'asset', entityId: string): Promise<{ imageUrl: string; thumbnailUrl: string } | null> {
    const handler = PhotoHandlerFactory.create(entityType);
    const paths = await handler.getPhotoPaths(entityId);
    if (!paths || !paths.imageUrl) return null;
    return { imageUrl: paths.imageUrl, thumbnailUrl: paths.thumbnailUrl! };
  }

}

export default new PhotoService();
