const mongoose = require('mongoose');

const assetTypeSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductGroup', required: true },
  name:    { type: String, required: true },
});

assetTypeSchema.set('toJSON', {
  transform: (_, ret) => {
    ret.id      = ret._id.toString();
    ret.groupId = ret.groupId.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('AssetType', assetTypeSchema);
