/**
 * @module AssetPhotoHandler
 * Concrete photo handler for Asset entities.
 *
 * Sets `model = Asset` and `subdirectory = 'assets'`.  All behaviour
 * is inherited from EntityPhotoHandler.
 *
 * @extends EntityPhotoHandler
 */
import EntityPhotoHandler from './EntityPhotoHandler';
import Asset from '../../../models/Asset';
import { Model } from 'mongoose';

export class AssetPhotoHandler extends EntityPhotoHandler {
  get model(): Model<any> { return Asset; }
  get subdirectory(): string { return 'assets'; }
}

export default AssetPhotoHandler;
