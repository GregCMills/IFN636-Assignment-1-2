/**
 * @module AssetType
 * Represents a specific product model (e.g. "MacBook Air M2") that belongs to
 * a ProductGroup. Individual physical assets are linked to an AssetType via
 * their `typeId` field.
 *
 * The custom toJSON transform replaces Mongoose's `_id` / `__v` fields with a
 * plain string `id`, keeping API responses consistent and frontend-friendly.
 */

const mongoose = require('mongoose');

const assetTypeSchema = new mongoose.Schema({
  /** Reference to the parent ProductGroup this type belongs to. */
  groupId:      { type: mongoose.Schema.Types.ObjectId, ref: 'ProductGroup', required: true },
  /** Human-readable product model name (e.g. "MacBook Air M2"). */
  name:         { type: String, required: true },
  /** Optional description of this product type. */
  description:  { type: String, default: '' },
  /** Photo URLs (populated by the photo service when uploads are enabled). */
  imageUrl:     { type: String },
  thumbnailUrl: { type: String },
});

/** Normalise output: expose `id` and `groupId` as plain strings; strip Mongoose internals. */
assetTypeSchema.set('toJSON', {
  transform: (_, ret) => {
    ret.id      = ret._id.toString();
    ret.groupId = ret.groupId.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('AssetType', assetTypeSchema);
