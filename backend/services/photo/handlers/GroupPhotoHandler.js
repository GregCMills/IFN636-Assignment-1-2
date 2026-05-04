/**
 * @module GroupPhotoHandler
 * Concrete photo handler for ProductGroup entities.
 *
 * Sets `model = ProductGroup` and `subdirectory = 'groups'`.  All behaviour
 * is inherited from EntityPhotoHandler — the model and subdirectory
 * properties are the only variation.
 *
 * @extends EntityPhotoHandler
 */
const EntityPhotoHandler = require('./EntityPhotoHandler');
const ProductGroup = require('../../../models/ProductGroup');

class GroupPhotoHandler extends EntityPhotoHandler {
  get model() { return ProductGroup; }
  get subdirectory() { return 'groups'; }
}

module.exports = GroupPhotoHandler;
