const User = require('../models/User');

// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Controlador: src/controllers/userController.js
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate({
            path: 'games',
            select: 'name category price imageUrl wishlistCount rating ratingCount views',
            populate: {
                path: 'comments',
                select: 'rating text user createdAt',
                populate: {
                    path: 'user',
                    select: 'name'
                }
            }
        });
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

