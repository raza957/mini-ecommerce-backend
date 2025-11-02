const express = require('express');
const { protect, admin } = require('../middleware/auth');
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/ordercontroller'); // ✅ 'ordercontroller' (without 's')

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id', protect, admin, updateOrderStatus);

module.exports = router;