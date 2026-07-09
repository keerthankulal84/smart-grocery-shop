const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    image: { type: String, default: '' }, // URL to image
    unit: { type: String, default: '1 pc' }, // e.g. "1 kg", "500 ml", "1 dozen"
    stock: { type: Number, required: true, default: 0, min: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
