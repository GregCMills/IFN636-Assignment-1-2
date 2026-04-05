const mongoose = require('mongoose');

const STATUSES = ['Available', 'Rented', 'Pending Rental', 'Pending Return', 'Maintenance'];

const assetSchema = new mongoose.Schema({
  typeId:          { type: mongoose.Schema.Types.ObjectId, ref: 'AssetType', required: true },
  name:            { type: String, required: true },
  status:          { type: String, enum: STATUSES, default: 'Available' },
  rentedByUserId:  { type: String },   // Clerk user ID
  returnDate:      { type: String },   // YYYY-MM-DD string
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

module.exports = mongoose.model('Asset', assetSchema);
