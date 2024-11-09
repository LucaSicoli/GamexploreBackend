const express = require('express');
const { createGame, getGames, getGamesByName, deleteGameByName, filterGames, getGameById, getGamesByDeveloper } = require('../controllers/gameController');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware de autenticación
const roleMiddleware = require('../middleware/roleMiddleware'); // Middleware de roles
const upload = require('../middleware/upload'); // Middleware de Multer

const router = express.Router();

// Ruta para crear un juego (Solo para usuarios con rol 'empresa')
router.post(
    '/',
    authMiddleware,            // Verificar que el usuario esté autenticado
    roleMiddleware('empresa'),  // Verificar que el usuario tenga el rol 'empresa'
    upload.single('image'),     // Procesar la imagen con Multer
    createGame,
    filterGames,                  // Ejecutar el controlador
    getGameById
    
);

// Ruta para obtener todos los juegos
router.get('/', authMiddleware, getGames);
// Ruta para buscar juegos por nombre
router.get('/search', authMiddleware, getGamesByName);
// Ruta para eliminar un juego por nombre
router.delete('/', authMiddleware, deleteGameByName);
// Ruta para filtrar los juegos
router.get('/filter', authMiddleware, filterGames);
// Ruta para obtener un juego por ID
router.get('/:gameId', authMiddleware, getGameById);
// Ruta para obtener los juegos de un desarrollador
router.get('/developer/:developerId', authMiddleware, getGamesByDeveloper);

module.exports = router;
