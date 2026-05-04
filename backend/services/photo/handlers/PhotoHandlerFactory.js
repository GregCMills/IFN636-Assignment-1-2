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
const GroupPhotoHandler  = require('./GroupPhotoHandler');
const TypePhotoHandler   = require('./TypePhotoHandler');
const AssetPhotoHandler  = require('./AssetPhotoHandler');

// Cache handler instances — stateless, so singletons are fine
const handlers = {
  group: new GroupPhotoHandler(),
  type:  new TypePhotoHandler(),
  asset: new AssetPhotoHandler(),
};

class PhotoHandlerFactory {
  /**
   * Returns the photo handler for the given entity type.
   *
   * @param {'group'|'type'|'asset'} entityType
   * @returns {import('./EntityPhotoHandler')}
   * @throws {Error} If the entity type is not recognised
   */
  static create(entityType) {
    const handler = handlers[entityType];
    if (!handler) throw new Error(`Unknown entity type: ${entityType}`);
    return handler;
  }
}

module.exports = PhotoHandlerFactory;
