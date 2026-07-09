const Product = require('../models/Product');

// GET /api/products?category=&search=&page=&limit=
exports.getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      Product.countDocuments(filter)
    ]);

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

// GET /api/products/categories - distinct list for filter UI
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories', error: err.message });
  }
};

// GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product', error: err.message });
  }
};

// POST /api/products (admin only)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, unit, stock } = req.body;
    if (!name || price == null || !category) {
      return res.status(400).json({ message: 'name, price and category are required' });
    }
    const product = await Product.create({ name, description, price, category, image, unit, stock });
    res.status(201).json({ product });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create product', error: err.message });
  }
};

// PUT /api/products/:id (admin only)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product', error: err.message });
  }
};

// DELETE /api/products/:id (admin only) - soft delete
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
};
