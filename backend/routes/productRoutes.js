const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/auth');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Merchant only routes
router.post('/', verifyToken, authorizeRole('merchant', 'admin'), createProduct);
router.put('/:id', verifyToken, authorizeRole('merchant', 'admin'), updateProduct);
router.delete('/:id', verifyToken, authorizeRole('merchant', 'admin'), deleteProduct);

module.exports = router;
