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
router.post('/add', authMiddleware, addToCart);
router.get('/', authMiddleware, getCart);
router.delete('/remove', authMiddleware, removeFromCart);
router.post('/clear', authMiddleware, clearCart);

// New routes for increasing and decreasing quantity
router.post('/increase', authMiddleware, increaseQuantity);
router.post('/decrease', authMiddleware, decreaseQuantity);

module.exports = router;
