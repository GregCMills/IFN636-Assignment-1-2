/**
 * @module ProcessedPhotoBuilder
 * Builder pattern — constructs a processed photo step by step.
 *
 * The builder accumulates state through setOriginal(), resize(), and
 * generateThumbnail() calls, then produces the final result via getResult().
 * Each step is independent and testable in isolation.
 *
 * Uses the `sharp` library for all image processing.  Sharp is a high-performance
 * Node.js module for resizing, format conversion, and metadata extraction.
 */
const sharp = require('sharp');

class ProcessedPhotoBuilder {
  constructor() {
    /** @type {Buffer|null} The original (or resized) image buffer. */
    this._originalBuffer = null;
    /** @type {Buffer|null} The thumbnail image buffer. */
    this._thumbnailBuffer = null;
    /** @type {string|null} The image MIME type. */
    this._mimetype = null;
  }

  /**
   * Stores the raw uploaded file data as the starting point for processing.
   * @param {Buffer} buffer   - Raw file bytes from multer
   * @param {string} mimetype - MIME type (e.g. 'image/jpeg')
   * @returns {ProcessedPhotoBuilder} this (for chaining)
   */
  setOriginal(buffer, mimetype) {
    this._originalBuffer = buffer;
    this._mimetype = mimetype;
    return this;
  }

  /**
   * Resizes the original image to fit within the given maximum dimensions
   * while preserving aspect ratio.  Uses sharp's `resize()` with `fit: 'inside'`
   * so the image is never upscaled or distorted.
   *
   * @param {number} maxWidth  - Maximum width in pixels
   * @param {number} maxHeight - Maximum height in pixels
   * @returns {ProcessedPhotoBuilder} this (for chaining)
   */
  async resize(maxWidth, maxHeight) {
    if (!this._originalBuffer) throw new Error('setOriginal() must be called before resize()');

    this._originalBuffer = await sharp(this._originalBuffer)
      .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
      .toBuffer();
    return this;
  }

  /**
   * Generates a square thumbnail from the resized image.  Uses sharp's
   * `resize()` with `fit: 'cover'` and `position: 'centre'` to crop a square
   * from the centre of the image.
   *
   * @param {number} size - Thumbnail width and height in pixels (square)
   * @returns {ProcessedPhotoBuilder} this (for chaining)
   */
  async generateThumbnail(size) {
    if (!this._originalBuffer) throw new Error('setOriginal() must be called before generateThumbnail()');

    this._thumbnailBuffer = await sharp(this._originalBuffer)
      .resize(size, size, { fit: 'cover', position: 'centre' })
      .toBuffer();
    return this;
  }

  /**
   * Produces the final processed photo object with metadata.
   *
   * @returns {Promise<{originalBuffer: Buffer, thumbnailBuffer: Buffer, width: number, height: number, mimetype: string}>}
   */
  async getResult() {
    if (!this._originalBuffer) throw new Error('setOriginal() must be called before getResult()');

    const metadata = await sharp(this._originalBuffer).metadata();
    return {
      originalBuffer:  this._originalBuffer,
      thumbnailBuffer: this._thumbnailBuffer,
      width:           metadata.width,
      height:          metadata.height,
      mimetype:        this._mimetype,
    };
  }
}

module.exports = ProcessedPhotoBuilder;
