const express = require('express');
const { addToWishlist, getWishlist, removeFromWishlist, countGameInWishlists } = require('../controllers/wishlistController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Ruta para obtener la wishlist del usuario autenticado
router.get('/', authMiddleware, getWishlist);

// Ruta para agregar un videojuego a la wishlist
router.post('/', authMiddleware, addToWishlist);

// Ruta para eliminar un videojuego de la wishlist
router.delete('/', authMiddleware, removeFromWishlist);

// Ruta para contar cuántas wishlists contienen un videojuego
router.get('/:gameId/count', countGameInWishlists);

module.exports = router;
