const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.get('/admin/all', adminOnly, getAllOrders);
router.put('/:id/status', adminOnly, updateOrderStatus);

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrder);

module.exports = router;
