const mongoose = require('mongoose');

/** Status strings used by the asset lifecycle state machine. Frozen to prevent mutation. */
const STATUSES = Object.freeze(['Available', 'Rented', 'Pending Rental', 'Pending Return', 'Maintenance']);

const assetSchema = new mongoose.Schema({
  typeId:          { type: mongoose.Schema.Types.ObjectId, ref: 'AssetType', required: true },
  name:            { type: String, required: true },
  description:     { type: String, default: '' },
  status:          { type: String, enum: STATUSES, default: 'Available' },
  rentedByUserId:  { type: String },   // Clerk user ID
  returnDate:      { type: String },   // YYYY-MM-DD string
  imageUrl:        { type: String },   // Photo URL (populated by the photo service)
  thumbnailUrl:    { type: String },   // Thumbnail URL (populated by the photo service)
});

assetSchema.set('toJSON', {
  transform: (_, ret) => {
    ret.id     = ret._id.toString();
    ret.typeId = ret.typeId.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const AssetModel = mongoose.model('Asset', assetSchema);
module.exports = AssetModel;
module.exports.STATUSES = STATUSES;
