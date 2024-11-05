const express = require('express');
const { addToWishlist, getWishlist, removeFromWishlist } = require('../controllers/wishlistController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Ruta para obtener la wishlist del usuario autenticado
router.get('/', authMiddleware, getWishlist);

// Ruta para agregar un videojuego a la wishlist
router.post('/', authMiddleware, addToWishlist);

// Ruta para eliminar un videojuego de la wishlist
router.delete('/', authMiddleware, removeFromWishlist);

module.exports = router;
