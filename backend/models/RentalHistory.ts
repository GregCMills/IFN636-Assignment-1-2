import mongoose, { Schema, model, InferSchemaType, HydratedDocument, Types } from 'mongoose';

const rentalHistorySchema = new Schema({
  assetId:       { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
  typeId:        { type: Schema.Types.ObjectId, ref: 'AssetType', required: true },
  assetName:     { type: String, required: true },
  assetTypeName: { type: String, required: true },
  rentedByUserId: { type: String, required: true }, // Clerk user ID
  returnDate:    { type: String, required: true },  // YYYY-MM-DD string
  finalStatus:   { type: String, enum: ['Available', 'Maintenance'], required: true },
  completedAt:   { type: String, required: true },  // ISO string timestamp
}, { timestamps: true });

rentalHistorySchema.set('toJSON', {
  transform: (_, ret: any) => {
    ret.id       = ret._id.toString();
    ret.assetId  = ret.assetId.toString();
    ret.typeId   = ret.typeId.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

export type IRentalHistory = InferSchemaType<typeof rentalHistorySchema> & {
  assetId: Types.ObjectId;
  typeId: Types.ObjectId;
};
export type RentalHistoryDocument = HydratedDocument<IRentalHistory>;

const RentalHistoryModel = model<IRentalHistory>('RentalHistory', rentalHistorySchema);
export default RentalHistoryModel;
