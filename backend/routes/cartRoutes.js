const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');

// Cart routes now use a guest fallback so frontend add-to-cart works without a token.
router.get('/', getCart);
router.post('/', addToCart);
router.delete('/:id', removeFromCart);
router.delete('/', clearCart);

module.exports = router;
