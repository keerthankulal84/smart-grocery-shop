const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// POST /api/orders  { shippingAddress }
// Creates an order from the user's current cart. Stock is checked and decremented.
exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    if (!shippingAddress || !shippingAddress.line1 || !shippingAddress.phone) {
      return res.status(400).json({ message: 'Shipping address with line1 and phone is required' });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate stock and build order line items
    const orderItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = item.product;
      if (!product || !product.isActive) {
        return res.status(400).json({ message: `Product no longer available: ${item.product?._id}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });
      totalAmount += product.price * item.quantity;
    }

    // Decrement stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress
    });

    // Empty the cart now that the order has been placed
    cart.items = [];
    await cart.save();

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
};

// GET /api/orders - current user's orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};

// GET /api/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order', error: err.message });
  }
};

// GET /api/orders/admin/all (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};

// PUT /api/orders/:id/status (admin only)  { orderStatus }
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order', error: err.message });
  }
};
