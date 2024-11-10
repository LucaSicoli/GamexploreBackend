const { storage } = require('../config/firebase'); // Firebase Storage
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage'); // Funciones de Firebase Storage
const { v4: uuidv4 } = require('uuid'); // Generar identificador único
const Game = require('../models/Game'); // Modelo de Juego
const mongoose = require('mongoose');
const User = require('../models/User');

// Crear un nuevo videojuego con imagen (solo empresas)
exports.createGame = async (req, res) => {
    const { name, category, description, systemRequirements, price, players, language, platform } = req.body;
    const image = req.file;

    try {
        // Validación: Solo empresas pueden crear juegos
        if (req.user.role !== 'empresa') {
            return res.status(403).json({ message: 'No tienes permiso para crear un juego.' });
        }

        // Validación: La imagen es obligatoria
        if (!image) {
            return res.status(400).json({ message: 'La imagen del juego es obligatoria.' });
        }

        // Validación: El precio debe ser 0 o mayor
        if (price < 0) {
            return res.status(400).json({ message: 'El precio no puede ser negativo. Debe ser 0 para juegos gratuitos o mayor a 0.' });
        }

        // Validación: Las plataformas deben ser válidas
        const platformsArray = typeof platform === 'string' ? platform.split(',').map(p => p.trim()) : platform;
        const validPlatforms = ['Windows', 'Mac', 'Linux'];
        const invalidPlatforms = platformsArray.filter(p => !validPlatforms.includes(p));
        if (invalidPlatforms.length > 0) {
            return res.status(400).json({ message: `Las siguientes plataformas no son válidas: ${invalidPlatforms.join(', ')}` });
        }

        // Validación: Los idiomas deben ser válidos
        const languagesArray = typeof language === 'string' ? language.split(',').map(lang => lang.trim()) : language;
        const validLanguages = ['Inglés', 'Español', 'Francés', 'Alemán', 'Chino', 'Japonés', 'Italiano', 'Portugués'];
        const invalidLanguages = languagesArray.filter(lang => !validLanguages.includes(lang));
        if (invalidLanguages.length > 0) {
            return res.status(400).json({ message: `Los siguientes idiomas no son válidos: ${invalidLanguages.join(', ')}` });
        }

        // Subir la imagen a Firebase Storage
        const storageRef = ref(storage, `games/${uuidv4()}_${image.originalname}`);
        await uploadBytes(storageRef, image.buffer);
        const imageUrl = await getDownloadURL(storageRef);

        // Validación y estructura de los requisitos del sistema
        const { minimum, recommended } = systemRequirements;

        if (!minimum || !recommended) {
            return res.status(400).json({ message: 'Los requisitos mínimos y recomendados son obligatorios.' });
        }

        const structuredSystemRequirements = {
            minimum: {
                cpu: minimum.cpu || '',
                gpu: minimum.gpu || '',
                ram: minimum.ram || '',
                storage: minimum.storage || '',
            },
            recommended: {
                cpu: recommended.cpu || '',
                gpu: recommended.gpu || '',
                ram: recommended.ram || '',
                storage: recommended.storage || '',
            }
        };

        // Crear y guardar el juego
        const game = new Game({
            name,
            category,
            description,
            systemRequirements: structuredSystemRequirements,
            price,
            players,
            language: languagesArray, // Utilizar el array de idiomas procesado
            platform: platformsArray,
            imageUrl,
            developer: req.user._id,
        });

        await game.save();

        // Agregar el ID del juego al usuario (empresa)
        await User.findByIdAndUpdate(req.user._id, { $push: { games: game._id } });

        res.status(201).json({ message: 'Juego creado con éxito y asociado al usuario.', game });
    } catch (error) {
        console.error('Error al crear el juego:', error);
        res.status(500).json({ message: 'Ha ocurrido un error al crear el juego. Inténtalo de nuevo más tarde.' });
    }
};



// Obtener todos los videojuegos
exports.getGames = async (req, res) => {
    try {
        const games = await Game.find().select('name category price rating imageUrl'); // Selección de campos útiles
        res.json(games); // Responder con los juegos encontrados
    } catch (error) {
        res.status(500).json({ message: error.message }); // Manejo de errores
    }
};

// Obtener un videojuego por ID con detalles completos y comentarios
// Obtener un videojuego por ID con detalles completos y comentarios
exports.getGameById = async (req, res) => {
    const { gameId } = req.params;

    try {
        const game = await Game.findById(gameId)
            .populate('developer', 'name logo description') // Información del desarrollador
            .populate({
                path: 'comments',
                populate: { path: 'user', select: 'name logo' } // Popula los comentarios y los datos del usuario
            });

        if (!game) {
            return res.status(404).json({ message: 'Juego no encontrado.' });
        }

        res.json(game); // Enviar el juego como respuesta
    } catch (error) {
        res.status(500).json({ message: error.message }); // Manejo de errores
    }
};


// Buscar videojuegos por nombre
exports.getGamesByName = async (req, res) => {
    const { name } = req.query; // Usar query params para la búsqueda

    try {
        const games = await Game.find({ name: { $regex: name, $options: 'i' } });

        if (games.length === 0) {
            return res.status(404).json({ message: 'No se encontraron videojuegos con ese nombre.' });
        }

        res.json(games); // Responder con los juegos encontrados
    } catch (error) {
        res.status(500).json({ message: error.message }); // Manejo de errores
    }
};

// Eliminar un videojuego por nombre
exports.deleteGameByName = async (req, res) => {
    const { name } = req.body; // Obtener el nombre del body

    try {
        const game = await Game.findOneAndDelete({ name });

        if (!game) {
            return res.status(404).json({ message: 'Videojuego no encontrado.' });
        }

        res.json({ message: `El juego "${name}" ha sido eliminado con éxito.` });
    } catch (error) {
        res.status(500).json({ message: error.message }); // Manejo de errores
    }
};

// Actualizar un videojuego por ID
exports.updateGame = async (req, res) => {
    const { gameId } = req.params;
    const updates = req.body;

    try {
        const game = await Game.findByIdAndUpdate(gameId, updates, { new: true });

        if (!game) {
            return res.status(404).json({ message: 'Juego no encontrado.' });
        }

        res.json({ message: 'Juego actualizado con éxito.', game });
    } catch (error) {
        res.status(500).json({ message: error.message }); // Manejo de errores
    }
};

// Controlador de filtrado de juegos
exports.filterGames = async (req, res) => {
    const { category, platform, maxPrice, search, language, players, rating } = req.query;

    try {
        const query = {};

        if (category) query.category = { $regex: new RegExp(category, 'i') };
        if (platform) query.platform = { $in: platform.split(',') };
        if (language) query.language = { $regex: new RegExp(language, 'i') };
        if (players) query.players = { $regex: new RegExp(players, 'i') };
        if (rating) query.rating = { $regex: new RegExp(rating, 'i') };

        if (maxPrice !== undefined) {
            const maxPriceNum = parseFloat(maxPrice);
            if (maxPriceNum === 0) {
                query.price = 0;
            } else if (!isNaN(maxPriceNum)) {
                query.price = { $lte: maxPriceNum };
            }
        }

        if (search) query.name = { $regex: new RegExp(search, 'i') };

        const games = await Game.find(query).limit(50);
        res.json(games);

    } catch (error) {
        console.error('Error en el filtrado de juegos:', error);
        res.status(500).json({ message: 'Error al filtrar los juegos. Inténtelo de nuevo.' });
    }
};

// src/controllers/gameController.js
exports.togglePublishGame = async (req, res) => {
    const { gameId } = req.params;
    
    try {
        const game = await Game.findById(gameId);
        if (!game) return res.status(404).json({ message: 'Game not found.' });

        game.isPublished = !game.isPublished;
        await game.save();

        res.json({ message: `Game ${game.isPublished ? 'published' : 'unpublished'} successfully.`, game });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Fetch games created by the logged-in company user
exports.getCompanyGames = async (req, res) => {
    try {
        const games = await Game.aggregate([
            {
                $match: {
                    developer: { $eq: mongoose.Types.ObjectId(req.user._id) } // Convierte y compara en la agregación
                }
            }
        ]);
        res.json(games);
    } catch (error) {
        console.error('Error obteniendo los juegos de la empresa:', error);
        res.status(500).json({ message: error.message });
    }
};






