/**
 * @module EntityService
 * Singleton service for entity data mutations (name, description updates).
 *
 * Uses a simple model map instead of the photo handler hierarchy — entity
 * updates don't involve storage strategies, image processing, or thumbnails.
 */
import ProductGroup from '../../models/ProductGroup';
import AssetType from '../../models/AssetType';
import Asset from '../../models/Asset';
import { Model } from 'mongoose';

const models: Record<string, Model<any>> = {
  group: ProductGroup,
  type:  AssetType,
  asset: Asset,
};

export class EntityService {
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
   * @returns {Promise<any|null>} The updated document as JSON, or null if not found
   */
  async updateEntity(entityType: 'group' | 'type' | 'asset', entityId: string, updates: { name?: string; description?: string }): Promise<any | null> {
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

export default new EntityService();
