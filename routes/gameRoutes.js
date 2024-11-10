const express = require('express');
const { createGame, getGames, getGamesByName, deleteGameByName, filterGames, getGameById, togglePublishGame, getCompanyGames, incrementGameViews } = require('../controllers/gameController');
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
    getGameById,
    togglePublishGame,
    getCompanyGames,
    incrementGameViews,
    
);

// Ruta para obtener todos los juegos
router.get('/', authMiddleware, getGames);
// Ruta para buscar juegos por nombre
router.get('/game', authMiddleware, getGamesByName);
// Ruta para eliminar un juego por nombre
router.delete('/', authMiddleware, deleteGameByName);
// Ruta para filtrar los juegos
router.get('/filter', authMiddleware, filterGames);
// Ruta para obtener un juego por ID
router.get('/:gameId', authMiddleware, getGameById);
// Ruta para publicar/despublicar un juego
router.put('/publish/:gameId', authMiddleware, roleMiddleware('empresa'), togglePublishGame);
// Ruta para obtener los juegos de una empresa
router.get('/company', authMiddleware, roleMiddleware('empresa'), getCompanyGames);
// Ruta para incrementar las vistas de un juego
router.put('/:gameId/views', incrementGameViews);


module.exports = router;
