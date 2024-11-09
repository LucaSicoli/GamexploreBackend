const Cart = require('../models/Cart');
const Game = require('../models/Game');

// Verificar si el carrito ha expirado
const isCartExpired = (cart) => {
    const now = new Date();
    const cartAge = now - new Date(cart.updatedAt);
    const expirationTime = 20 * 60 * 1000; // 20 minutos en milisegundos
    return cartAge > expirationTime;
};

// Obtener el carrito del usuario
exports.getCart = async (req, res) => {
    try {

        
        // Attempt to find the cart for the user
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.game', 'name price imageUrl');

        // If the cart exists and has expired, delete it and recreate it
        if (cart && isCartExpired(cart)) {
            await Cart.findByIdAndDelete(cart._id);
            cart = new Cart({
                user: req.user._id,
                items: [],
                totalPrice: 0,
                updatedAt: new Date(),
            });
            await cart.save();
        }

        // If no cart exists, create a new one
        if (!cart) {
            cart = new Cart({
                user: req.user._id,
                items: [],
                totalPrice: 0,
                updatedAt: new Date(),
            });
            await cart.save();
        }

        // Return the cart data in a formatted response
        res.status(200).json(formatCartResponse(cart));
    } catch (error) {
        res.status(500).json({ message: "An error occurred while retrieving the cart." });
    }
};


// Agregar un juego al carrito
exports.addToCart = async (req, res) => {
    const { gameId, quantity } = req.body;

    try {
        const game = await Game.findById(gameId);
        if (!game) return res.status(404).json({ message: 'Juego no encontrado.' });

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = new Cart({
                user: req.user._id,
                items: [{ game: gameId, quantity, subtotal: game.price * quantity }],
                totalPrice: game.price * quantity
            });
        } else {
            const itemIndex = cart.items.findIndex(item => item.game.toString() === gameId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
                cart.items[itemIndex].subtotal = cart.items[itemIndex].quantity * game.price;
            } else {
                cart.items.push({ game: gameId, quantity, subtotal: game.price * quantity });
            }

            cart.totalPrice = calculateTotalPrice(cart.items);
        }

        cart.updatedAt = Date.now();
        await cart.save();

        const populatedCart = await Cart.findById(cart._id).populate('items.game', 'name price imageUrl'); // Asegúrate de incluir la imagen
        res.status(201).json({ message: 'Juego agregado al carrito.', cart: formatCartResponse(populatedCart) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Eliminar un juego del carrito
exports.removeFromCart = async (req, res) => {
    const { gameId } = req.body;

    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.game', 'name price imageUrl'); // Poblamos los elementos del carrito
        if (!cart || cart.items.length === 0) {
            return res.status(404).json({ message: 'El carrito está vacío.' });
        }

        const itemIndex = cart.items.findIndex(item => item.game._id.toString() === gameId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'El juego no se encuentra en el carrito.' });
        }

        cart.items.splice(itemIndex, 1);
        cart.totalPrice = calculateTotalPrice(cart.items);
        cart.updatedAt = Date.now();
        await cart.save();

        const updatedCart = await Cart.findById(cart._id).populate('items.game', 'name price imageUrl'); // Volvemos a poblar el carrito
        res.json({ message: 'Juego eliminado del carrito.', cart: formatCartResponse(updatedCart) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Vaciar completamente el carrito
exports.clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart || cart.items.length === 0) {
            return res.status(404).json({ message: 'El carrito ya está vacío.' });
        }

        cart.items = [];
        cart.totalPrice = 0;
        cart.updatedAt = Date.now();
        await cart.save();

        // Return an empty cart response for the frontend
        res.json({
            message: 'Carrito vaciado correctamente.',
            cart: formatCartResponse(cart) // This now returns an empty cart with updated fields
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Increase the quantity of a game in the cart
exports.increaseQuantity = async (req, res) => {
    const { gameId } = req.body;

    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: 'Carrito no encontrado.' });

        const itemIndex = cart.items.findIndex(item => item.game.toString() === gameId);
        if (itemIndex === -1) return res.status(404).json({ message: 'El juego no se encuentra en el carrito.' });

        cart.items[itemIndex].quantity += 1;
        const game = await Game.findById(gameId);
        cart.items[itemIndex].subtotal = cart.items[itemIndex].quantity * game.price;
        cart.totalPrice = calculateTotalPrice(cart.items);
        cart.updatedAt = Date.now();

        await cart.save();
        const updatedCart = await Cart.findById(cart._id).populate('items.game', 'name price imageUrl');
        res.json({ message: 'Cantidad aumentada.', cart: formatCartResponse(updatedCart) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Decrease the quantity of a game in the cart
exports.decreaseQuantity = async (req, res) => {
    const { gameId } = req.body;

    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: 'Carrito no encontrado.' });

        const itemIndex = cart.items.findIndex(item => item.game.toString() === gameId);
        if (itemIndex === -1) return res.status(404).json({ message: 'El juego no se encuentra en el carrito.' });

        // Only decrease if quantity is greater than 1
        if (cart.items[itemIndex].quantity > 1) {
            cart.items[itemIndex].quantity -= 1;
            const game = await Game.findById(gameId);
            cart.items[itemIndex].subtotal = cart.items[itemIndex].quantity * game.price;
            cart.totalPrice = calculateTotalPrice(cart.items);
            cart.updatedAt = Date.now();

            await cart.save();
            const updatedCart = await Cart.findById(cart._id).populate('items.game', 'name price imageUrl');
            res.json({ message: 'Cantidad disminuida.', cart: formatCartResponse(updatedCart) });
        } else {
            res.status(400).json({ message: 'La cantidad no puede ser menor a 1.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Calcular el precio total del carrito
const calculateTotalPrice = (items) => {
    return items.reduce((total, item) => total + item.subtotal, 0);
};

// Formatear la respuesta del carrito para mayor claridad
const formatCartResponse = (cart) => ({
    userId: cart.user,
    items: cart.items.map(item => ({
        gameId: item.game._id,
        name: item.game.name,
        price: item.game.price,
        imageUrl: item.game.imageUrl, // Agregando la URL de la imagen
        quantity: item.quantity,
        subtotal: item.subtotal
    })),
    totalItems: cart.items.length,
    totalPrice: cart.totalPrice,
    updatedAt: cart.updatedAt
});
