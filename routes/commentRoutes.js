const express = require('express');
const { addComment, getComments } = require('../controllers/commentController'); // Importación correcta
const authMiddleware = require('../middleware/authMiddleware'); // Middleware de autenticación

const router = express.Router();

// Ruta para agregar un comentario
router.post('/:gameId/comment', authMiddleware, addComment);

// Ruta para obtener los comentarios de un juego
router.get('/:gameId', getComments);

module.exports = router;
