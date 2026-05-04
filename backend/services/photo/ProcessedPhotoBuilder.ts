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
import sharp from 'sharp';

export class ProcessedPhotoBuilder {
  private _originalBuffer: Buffer | null = null;
  private _thumbnailBuffer: Buffer | null = null;
  private _mimetype: string | null = null;

  /**
   * Stores the raw uploaded file data as the starting point for processing.
   * @param {Buffer} buffer   - Raw file bytes from multer
   * @param {string} mimetype - MIME type (e.g. 'image/jpeg')
   * @returns {ProcessedPhotoBuilder} this (for chaining)
   */
  setOriginal(buffer: Buffer, mimetype: string): ProcessedPhotoBuilder {
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
  async resize(maxWidth: number, maxHeight: number): Promise<ProcessedPhotoBuilder> {
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
  async generateThumbnail(size: number): Promise<ProcessedPhotoBuilder> {
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
  async getResult(): Promise<{ originalBuffer: Buffer; thumbnailBuffer: Buffer; width: number; height: number; mimetype: string }> {
    if (!this._originalBuffer || !this._thumbnailBuffer || !this._mimetype) {
      throw new Error('setOriginal() and processing steps must be called before getResult()');
    }

    const metadata = await sharp(this._originalBuffer).metadata();
    return {
      originalBuffer:  this._originalBuffer,
      thumbnailBuffer: this._thumbnailBuffer,
      width:           metadata.width || 0,
      height:          metadata.height || 0,
      mimetype:        this._mimetype,
    };
  }
}

export default ProcessedPhotoBuilder;
