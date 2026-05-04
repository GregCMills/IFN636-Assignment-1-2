/**
 * @module EntityService
 * Singleton service for entity data mutations (name, description updates).
 *
 * Uses a simple model map instead of the photo handler hierarchy — entity
 * updates don't involve storage strategies, image processing, or thumbnails.
 */
const ProductGroup = require('../../models/ProductGroup');
const AssetType    = require('../../models/AssetType');
const Asset        = require('../../models/Asset');

const models = {
  group: ProductGroup,
  type:  AssetType,
  asset: Asset,
};

class EntityService {
  /**
   * Partially updates an entity's name and/or description.
   *
   * Only the fields present in `updates` are modified.  Uses findById + save
   * (rather than findByIdAndUpdate) so Mongoose validation runs on the
   * modified document.
   *
   * @param {'group'|'type'|'asset'} entityType
   * @param {string} entityId - MongoDB ObjectId as a string
   * @param {object} updates   - { name?: string, description?: string }
   * @returns {Promise<object|null>} The updated document as JSON, or null if not found
   */
  async updateEntity(entityType, entityId, updates) {
    const Model = models[entityType];
    if (!Model) throw new Error(`Unknown entity type: ${entityType}`);
    const doc = await Model.findById(entityId);
    if (!doc) return null;
    if (updates.name !== undefined) doc.name = updates.name;
    if (updates.description !== undefined) doc.description = updates.description;
    await doc.save();
    return doc.toJSON();
  }
}

module.exports = new EntityService();
