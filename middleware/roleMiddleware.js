module.exports = (role) => {
    return (req, res, next) => {
        try {
            // Verificar si el usuario autenticado tiene el rol requerido
            if (req.user.role !== role) {
                return res.status(403).json({ message: 'Acceso denegado. No tienes permisos.' });
            }
            next(); // Continuar si el rol es correcto
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
};
