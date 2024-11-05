const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware de autenticación
const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No se proporcionó un token de autenticación' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        req.user = user; // Almacenamos los datos del usuario en req.user
        next(); // Continuar si el usuario es válido
    } catch (error) {
        res.status(401).json({ message: 'Token no válido' });
    }
};

module.exports = authMiddleware;
