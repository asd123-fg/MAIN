const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/auth');
const {
  getOrders,
  createOrder,
  updateOrderStatus
} = require('../controllers/orderController');

// Customer can see their orders and create orders
router.get('/', verifyToken, authorizeRole('customer', 'merchant', 'admin'), getOrders);
router.post('/', verifyToken, authorizeRole('customer'), createOrder);

// Merchant and admin can update order status
router.put('/:id', verifyToken, authorizeRole('merchant', 'admin'), updateOrderStatus);

module.exports = router;
