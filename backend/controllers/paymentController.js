const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// POST /api/payment/create-order  { orderId }
// Creates a Razorpay order for an existing (unpaid) Order document
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    // Razorpay expects amount in the smallest currency unit (paise for INR)
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'INR',
      receipt: order._id.toString()
    });

    order.razorpayOrderId = rzpOrder.id;
    await order.save();

    res.json({
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID // public key, safe to expose to frontend
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create payment order', error: err.message });
  }
};

// POST /api/payment/verify
// { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed - signature mismatch' });
    }

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpay_payment_id;
    order.orderStatus = 'processing';
    await order.save();

    res.json({ message: 'Payment verified successfully', order });
  } catch (err) {
    res.status(500).json({ message: 'Payment verification failed', error: err.message });
  }
};
