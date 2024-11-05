const express = require('express');
const { getAllUsers } = require('../controllers/userController'); // Asegúrate de importar la función correctamente
const authMiddleware = require('../middleware/authMiddleware');  // Si usas autenticación, asegúrate de incluir este middleware
const router = express.Router();

// Ruta para obtener todos los usuarios
router.get('/', authMiddleware, getAllUsers);

module.exports = router;
