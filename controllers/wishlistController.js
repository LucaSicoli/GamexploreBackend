const Wishlist = require('../models/Wishlist');
const Game = require('../models/Game');

// Agregar un videojuego a la wishlist por nombre
exports.addToWishlist = async (req, res) => {
    const { name } = req.body;

    try {
        const game = await Game.findOne({ name });
        if (!game) {
            return res.status(404).json({ message: 'Videojuego no encontrado.' });
        }

        let wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            wishlist = new Wishlist({
                user: req.user._id,
                games: [game._id],
            });
            await wishlist.save();
            // Incrementar wishlistCount en el documento de Game
            game.wishlistCount = (game.wishlistCount || 0) + 1;
            await game.save();

            return res.status(201).json({ message: `El juego '${name}' se ha agregado correctamente a la wishlist.` });
        }

        const gameExists = wishlist.games.some(gameId => gameId.toString() === game._id.toString());
        if (gameExists) {
            return res.status(200).json({ message: `El juego '${name}' ya está en la wishlist.` }); // Cambiado a 200
        }

        wishlist.games.push(game._id);
        await wishlist.save();

        // Incrementar wishlistCount en el documento de Game
        game.wishlistCount = (game.wishlistCount || 0) + 1;
        await game.save();

        const updatedWishlist = await Wishlist.findById(wishlist._id).populate('games', 'name category imageUrl');
        res.status(201).json({
            message: `El juego '${name}' se ha agregado correctamente a la wishlist.`,
            wishlist: updatedWishlist,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener la wishlist del usuario autenticado
exports.getWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('games', 'name category imageUrl price');

        if (!wishlist) {
            return res.status(404).json({ message: 'No se encontró una wishlist para este usuario.' });
        }

        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Eliminar un videojuego de la wishlist por ID
exports.removeFromWishlist = async (req, res) => {
    const { gameId } = req.body;

    try {
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: 'Videojuego no encontrado.' });
        }

        const wishlist = await Wishlist.findOne({ user: req.user._id });
        if (!wishlist) {
            return res.status(404).json({ message: 'No se encontró una wishlist para este usuario.' });
        }

        const gameExists = wishlist.games.some(id => id.toString() === gameId);
        if (!gameExists) {
            return res.status(404).json({ message: 'El juego no está en la wishlist.' });
        }

        wishlist.games = wishlist.games.filter(id => id.toString() !== gameId);
        await wishlist.save();

        // Decrementar wishlistCount en el documento de Game
        game.wishlistCount = Math.max((game.wishlistCount || 0) - 1, 0); // Evitar valores negativos
        await game.save();

        const updatedWishlist = await Wishlist.findById(wishlist._id).populate('games', 'name category imageUrl');
        res.json({
            message: 'El juego ha sido eliminado correctamente de la wishlist.',
            wishlist: updatedWishlist,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Controlador para contar cuántos usuarios tienen un juego en su wishlist
exports.countGameInWishlists = async (req, res) => {
    const { gameId } = req.params;
    try {
        const count = await Wishlist.countDocuments({ games: gameId });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
