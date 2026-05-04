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
import EntityPhotoHandler from './EntityPhotoHandler';
import ProductGroup from '../../../models/ProductGroup';
import { Model } from 'mongoose';

export class GroupPhotoHandler extends EntityPhotoHandler {
  get model(): Model<any> { return ProductGroup; }
  get subdirectory(): string { return 'groups'; }
}

export default GroupPhotoHandler;
