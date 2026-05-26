const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/auth');
const {
  getUsers,
  deleteUser,
  getAllOrders,
  getDashboardStats
} = require('../controllers/adminController');

// All admin routes require admin role
router.get('/users', verifyToken, authorizeRole('admin'), getUsers);
router.delete('/users/:id', verifyToken, authorizeRole('admin'), deleteUser);

router.get('/orders', verifyToken, authorizeRole('admin'), getAllOrders);
router.get('/stats', verifyToken, authorizeRole('admin'), getDashboardStats);

module.exports = router;
