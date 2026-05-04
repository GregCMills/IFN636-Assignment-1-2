/**
 * @module AssetPhotoHandler
 * Concrete photo handler for Asset entities.
 *
 * Sets `model = Asset` and `subdirectory = 'assets'`.  All behaviour
 * is inherited from EntityPhotoHandler.
 *
 * @extends EntityPhotoHandler
 */
const EntityPhotoHandler = require('./EntityPhotoHandler');
const Asset = require('../../../models/Asset');

class AssetPhotoHandler extends EntityPhotoHandler {
  get model() { return Asset; }
  get subdirectory() { return 'assets'; }
}

module.exports = AssetPhotoHandler;
