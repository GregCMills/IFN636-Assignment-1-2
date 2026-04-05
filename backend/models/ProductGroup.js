const mongoose = require('mongoose');

const productGroupSchema = new mongoose.Schema({ name: { type: String, required: true } });

productGroupSchema.set('toJSON', {
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('ProductGroup', productGroupSchema);
