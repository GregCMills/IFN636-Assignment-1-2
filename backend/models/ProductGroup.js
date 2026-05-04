/**
 * @module ProductGroup
 * Represents a high-level product category (e.g. "Laptops", "Cameras").
 * A ProductGroup contains one or more AssetTypes. Deleting a group cascades
 * to its types and their assets via groupController.
 *
 * The custom toJSON transform replaces Mongoose's `_id` / `__v` fields with a
 * plain string `id`, keeping API responses consistent and frontend-friendly.
 */

const mongoose = require('mongoose');

const productGroupSchema = new mongoose.Schema({
  /** Human-readable category name (e.g. "Laptops"). */
  name:         { type: String },
  /** Optional description of this product group. */
  description:  { type: String, default: '' },
  /** Photo URLs (populated by the photo service when uploads are enabled). */
  imageUrl:     { type: String },
  thumbnailUrl: { type: String },
});

/** Normalise output: expose `id` as a plain string; strip Mongoose internals. */
productGroupSchema.set('toJSON', {
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('ProductGroup', productGroupSchema);
