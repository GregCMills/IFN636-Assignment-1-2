/**
 * @module TypePhotoHandler
 * Concrete photo handler for AssetType entities.
 *
 * Sets `model = AssetType` and `subdirectory = 'types'`.  All behaviour
 * is inherited from EntityPhotoHandler.
 *
 * @extends EntityPhotoHandler
 */
const EntityPhotoHandler = require('./EntityPhotoHandler');
const AssetType = require('../../../models/AssetType');

class TypePhotoHandler extends EntityPhotoHandler {
  get model() { return AssetType; }
  get subdirectory() { return 'types'; }
}

module.exports = TypePhotoHandler;
