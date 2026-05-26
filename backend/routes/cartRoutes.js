const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/auth');
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');

// All cart routes require customer role
router.get('/', verifyToken, authorizeRole('customer'), getCart);
router.post('/', verifyToken, authorizeRole('customer'), addToCart);
router.delete('/:id', verifyToken, authorizeRole('customer'), removeFromCart);
router.delete('/', verifyToken, authorizeRole('customer'), clearCart);

module.exports = router;
