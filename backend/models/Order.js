const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String, // snapshot at time of order, in case product changes later
    price: Number,
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    shippingAddress: {
      line1: String,
      city: String,
      state: String,
      pincode: String,
      phone: String
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    orderStatus: {
      type: String,
      enum: ['placed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'placed'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
