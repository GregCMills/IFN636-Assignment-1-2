import mongoose, { Schema, model, InferSchemaType, HydratedDocument, Types } from 'mongoose';

/** Status strings used by the asset lifecycle state machine. Frozen to prevent mutation. */
export const STATUSES = ['Available', 'Rented', 'Pending Rental', 'Pending Return', 'Maintenance'] as const;
export type AssetStatus = typeof STATUSES[number];

const assetSchema = new Schema({
  typeId:          { type: Schema.Types.ObjectId, ref: 'AssetType', required: true },
  name:            { type: String, required: true },
  description:     { type: String, default: '' },
  status:          { type: String, enum: STATUSES, default: 'Available' },
  rentedByUserId:  { type: String },   // Clerk user ID
  returnDate:      { type: String },   // YYYY-MM-DD string
  imageUrl:        { type: String },   // Photo URL (populated by the photo service)
  thumbnailUrl:    { type: String },   // Thumbnail URL (populated by the photo service)
});

assetSchema.set('toJSON', {
  transform: (_, ret: any) => {
    ret.id     = ret._id.toString();
    ret.typeId = ret.typeId.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export type IAsset = InferSchemaType<typeof assetSchema> & {
  typeId: Types.ObjectId;
};
export type AssetDocument = HydratedDocument<IAsset>;

const AssetModel = model<IAsset>('Asset', assetSchema);
export default AssetModel;
