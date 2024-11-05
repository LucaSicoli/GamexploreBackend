// controllers/commentController.js
const Comment = require('../models/Comment');
const Game = require('../models/Game');

// Método para agregar un comentario
// controllers/commentController.js

// controllers/commentController.js

exports.addComment = async (req, res) => {
    const { gameId } = req.params;
    const { text, rating } = req.body;

    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Usuario no autenticado.' });
        }

        const comment = new Comment({
            user: req.user._id,
            game: gameId,
            text,
            rating,
        });

        await comment.save();

        // Realizar populate para obtener el nombre y logo del usuario
        const populatedComment = await Comment.findById(comment._id).populate('user', 'name logo');

        // Agregar el comentario al juego
        await Game.findByIdAndUpdate(gameId, { $push: { comments: comment._id } }, { new: true });

        // Obtener todos los comentarios del juego
        const allComments = await Comment.find({ game: gameId });
        const ratings = allComments.map(c => c.rating);
        
        // Calcular el nuevo promedio de calificaciones
        const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

        // Actualizar el promedio de calificación y la cantidad de reseñas en el documento del juego
        await Game.findByIdAndUpdate(gameId, { 
            rating: averageRating,
            ratingCount: ratings.length 
        });

        res.status(201).json({ message: 'Comentario agregado exitosamente', comment: populatedComment });
    } catch (error) {
        console.error('Error al agregar comentario:', error.message);
        res.status(500).json({ message: 'No se pudo agregar el comentario.', error: error.message });
    }
};



// Método para obtener los comentarios de un juego
// controllers/commentController.js
exports.getComments = async (req, res) => {
    const { gameId } = req.params;

    try {
        const comments = await Comment.find({ game: gameId })
            .populate('user', 'name logo') // Asegúrate de que "name" y "logo" son los campos correctos en el modelo User
            .sort({ createdAt: -1 }); // Ordena los comentarios del más reciente al más antiguo
        res.json(comments);
    } catch (error) {
        console.error('Error al obtener comentarios:', error);
        res.status(500).json({ message: 'Error al cargar los comentarios.' });
    }
};

