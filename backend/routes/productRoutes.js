const express = require('express');
const router = express.Router();
const {
  getProducts,
  getCategories,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProduct);

router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
