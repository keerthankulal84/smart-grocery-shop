const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to return cart populated with product details
const getPopulatedCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// GET /api/cart
exports.getCart = async (req, res) => {
  try {
    const cart = await getPopulatedCart(req.user._id);
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch cart', error: err.message });
  }
};

// POST /api/cart  { productId, quantity }
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const existingItem = cart.items.find((i) => i.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity) });
    }

    await cart.save();
    const populated = await getPopulatedCart(req.user._id);
    res.json({ cart: populated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add to cart', error: err.message });
  }
};

// PUT /api/cart/:productId  { quantity }
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find((i) => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ message: 'Item not in cart' });

    if (Number(quantity) <= 0) {
      cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    } else {
      item.quantity = Number(quantity);
    }

    await cart.save();
    const populated = await getPopulatedCart(req.user._id);
    res.json({ cart: populated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update cart item', error: err.message });
  }
};

// DELETE /api/cart/:productId
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    await cart.save();

    const populated = await getPopulatedCart(req.user._id);
    res.json({ cart: populated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove item', error: err.message });
  }
};

// DELETE /api/cart
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] }, { upsert: true });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear cart', error: err.message });
  }
};
