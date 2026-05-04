/**
 * @module PhotoProcessingDirector
 * Director in the Builder pattern — defines the standard photo processing sequence.
 *
 * The Director knows the order in which to call builder steps but doesn't know
 * the implementation details of each step.  A different Director could define a
 * different sequence (e.g. skip thumbnails for icons) while reusing the same
 * builder.
 *
 * Standard sequence:
 *   1. setOriginal(fileBuffer, mimetype)  — capture raw upload
 *   2. resize(800, 800)                   — fit within 800×800
 *   3. generateThumbnail(200)             — 200×200 square crop
 *   4. getResult()                        — return { originalBuffer, thumbnailBuffer, width, height, mimetype }
 */
const ProcessedPhotoBuilder = require('./ProcessedPhotoBuilder');

/** Default maximum dimensions for resized images. */
const MAX_WIDTH  = 800;
const MAX_HEIGHT = 800;
/** Default thumbnail size (square). */
const THUMB_SIZE = 200;

class PhotoProcessingDirector {
  /**
   * Runs the standard processing pipeline on a raw uploaded file buffer.
   *
   * @param {Buffer} buffer   - Raw file bytes from multer
   * @param {string} mimetype - MIME type (e.g. 'image/jpeg')
   * @returns {Promise<{originalBuffer: Buffer, thumbnailBuffer: Buffer, width: number, height: number, mimetype: string}>}
   */
  async process(buffer, mimetype) {
    const builder = new ProcessedPhotoBuilder();
    builder.setOriginal(buffer, mimetype);
    await builder.resize(MAX_WIDTH, MAX_HEIGHT);
    await builder.generateThumbnail(THUMB_SIZE);
    return builder.getResult();
  }
}

module.exports = PhotoProcessingDirector;
