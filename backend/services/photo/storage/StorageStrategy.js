/**
 * @module StorageStrategy
 * Defines the interface for pluggable file storage backends.
 *
 * This is the Strategy pattern interface — concrete implementations (e.g.
 * LocalStorageStrategy, S3StorageStrategy) must implement all three methods.
 * The PhotoService (Facade) holds a reference to a StorageStrategy and
 * delegates all file I/O through it.
 *
 * The same StorageStrategy instance is also passed to the Composite's
 * delete(storageStrategy) method when deleting entities that have photos,
 * allowing the Template Method to delete photo files from the same backend.
 */
class StorageStrategy {
  /**
   * Persists binary data to the storage backend.
   * @param {string} directory - Subdirectory name (e.g. 'groups', 'types', 'assets')
   * @param {string} filename  - File name (e.g. 'abc123.jpg')
   * @param {Buffer} buffer    - Binary file contents
   * @returns {Promise<string>} Relative URL path (e.g. '/uploads/groups/abc123.jpg')
   */
  async save(directory, filename, buffer) {
    throw new Error('Not implemented');
  }

  /**
   * Removes a file from the storage backend.
   * @param {string} relativePath - The URL path returned by save()
   * @returns {Promise<void>}
   */
  async delete(relativePath) {
    throw new Error('Not implemented');
  }

  /**
   * Returns the public URL for a stored file.
   * @param {string} relativePath - The URL path returned by save()
   * @returns {string} Full URL path
   */
  getUrl(relativePath) {
    throw new Error('Not implemented');
  }
}

module.exports = StorageStrategy;
