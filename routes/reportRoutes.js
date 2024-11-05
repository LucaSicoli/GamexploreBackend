const express = require('express');
const { getSalesReport, getWishlistReport, getConversionRate } = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware'); // Verifica autenticación

const router = express.Router();

// Rutas de Reportes
router.get('/sales', authMiddleware, getSalesReport);
router.get('/wishlists', authMiddleware, getWishlistReport);
router.get('/conversion-rate', authMiddleware, getConversionRate);

module.exports = router;
