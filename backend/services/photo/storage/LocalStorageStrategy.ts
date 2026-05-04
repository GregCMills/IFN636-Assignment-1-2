/**
 * @module LocalStorageStrategy
 * Concrete storage strategy that writes files to the local filesystem.
 *
 * Files are stored under backend/uploads/<directory>/<filename> and served
 * via express.static at /uploads/<directory>/<filename>.
 *
 * @extends StorageStrategy
 */
import fs from 'fs/promises';
import path from 'path';
import StorageStrategy from './StorageStrategy';

/** Root directory for uploaded files, relative to the server entry point. */
const UPLOADS_ROOT = path.join(__dirname, '..', '..', '..', 'uploads');

export class LocalStorageStrategy extends StorageStrategy {
  /**
   * Ensures the target directory exists, then writes the buffer to disk.
   *
   * @param {string} directory - Subdirectory (e.g. 'groups', 'types', 'assets')
   * @param {string} filename  - File name including extension (e.g. 'abc123.jpg')
   * @param {Buffer} buffer    - Binary file contents
   * @returns {Promise<string>} The relative URL path for this file
   */
  async save(directory: string, filename: string, buffer: Buffer): Promise<string> {
    const dirPath = path.join(UPLOADS_ROOT, directory);
    await fs.mkdir(dirPath, { recursive: true });

    const filePath = path.join(dirPath, filename);
    await fs.writeFile(filePath, buffer);

    return `/uploads/${directory}/${filename}`;
  }

  /**
   * Deletes a file from the local filesystem.  Silently succeeds if the
   * file doesn't exist (ENOENT is ignored) — this matches the expected
   * behaviour when cleaning up photos that may have already been removed.
   *
   * @param {string | null} relativePath - URL path relative to the server root
   * @returns {Promise<void>}
   */
  async delete(relativePath: string | null): Promise<void> {
    if (!relativePath) return;

    // Convert URL path (e.g. /uploads/groups/abc.jpg) to absolute filesystem path
    const filePath = path.join(UPLOADS_ROOT, path.basename(path.dirname(relativePath)), path.basename(relativePath));
    try {
      await fs.unlink(filePath);
    } catch (err: any) {
      // Ignore ENOENT — file already doesn't exist
      if (err.code !== 'ENOENT') throw err;
    }
  }

  /**
   * Returns the URL path unchanged — local files are served directly.
   * @param {string} relativePath
   * @returns {string}
   */
  getUrl(relativePath: string): string {
    return relativePath;
  }
}

export default LocalStorageStrategy;
