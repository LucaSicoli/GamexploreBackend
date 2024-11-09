const express = require('express');
const {
    addToCart,
    getCart,
    removeFromCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity
} = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Cart routes
router.post('/items', authMiddleware, addToCart);
router.get('/', authMiddleware, getCart);
router.delete('/items', authMiddleware, removeFromCart);
router.post('/', authMiddleware, clearCart);

// New routes for increasing and decreasing quantity
router.post('/increase', authMiddleware, increaseQuantity);
router.post('/decrease', authMiddleware, decreaseQuantity);

module.exports = router;
