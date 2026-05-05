/**
 * @module PhotoHandlerFactory
 * Factory Method — produces the correct EntityPhotoHandler subclass for a given
 * entity type string.
 *
 * Client code (PhotoService) calls `create(entityType)` and receives a handler
 * that implements the EntityPhotoHandler interface, without knowing which
 * concrete class it got.
 *
 * Supported types: 'group', 'type', 'asset'
 */
import GroupPhotoHandler from './GroupPhotoHandler';
import TypePhotoHandler from './TypePhotoHandler';
import AssetPhotoHandler from './AssetPhotoHandler';
import EntityPhotoHandler from './EntityPhotoHandler';

// Cache handler instances — stateless, so singletons are fine
const handlers: Record<string, EntityPhotoHandler> = {
  group: new GroupPhotoHandler(),
  type:  new TypePhotoHandler(),
  asset: new AssetPhotoHandler(),
};

export class PhotoHandlerFactory {
  /**
   * Returns the photo handler for the given entity type.
   *
   * @param {'group'|'type'|'asset'} entityType
   * @returns {EntityPhotoHandler}
   * @throws {Error} If the entity type is not recognised
   */
  static create(entityType: 'group' | 'type' | 'asset'): EntityPhotoHandler {
    const handler = handlers[entityType];
    if (!handler) throw new Error(`Unknown entity type: ${entityType}`);
    return handler;
  }
}

export default PhotoHandlerFactory;
