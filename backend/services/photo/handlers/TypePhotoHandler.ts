/**
 * @module TypePhotoHandler
 * Concrete photo handler for AssetType entities.
 *
 * Sets `model = AssetType` and `subdirectory = 'types'`.  All behaviour
 * is inherited from EntityPhotoHandler.
 *
 * @extends EntityPhotoHandler
 */
import EntityPhotoHandler from './EntityPhotoHandler';
import AssetType from '../../../models/AssetType';
import { Model } from 'mongoose';

export class TypePhotoHandler extends EntityPhotoHandler {
  get model(): Model<any> { return AssetType; }
  get subdirectory(): string { return 'types'; }
}

export default TypePhotoHandler;
