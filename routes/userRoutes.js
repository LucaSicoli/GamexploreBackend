// routes/userRoutes.js
const express = require('express');
const { getUserProfile, getAllUsers } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Ruta para obtener todos los usuarios
router.get('/', authMiddleware, getAllUsers);

// Ruta para obtener el perfil de un usuario por ID
router.get('/:userId', authMiddleware, getUserProfile);

module.exports = router;
