const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartcontroller');

const router = express.Router();

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.put('/update/:itemId', protect, updateCartItem);
router.delete('/remove/:itemId', protect, removeFromCart);
router.delete('/clear', protect, clearCart);

module.exports = router;