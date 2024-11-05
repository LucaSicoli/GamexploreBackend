const Cart = require('../models/cart');
const Order = require('../models/order');

// Crear una orden desde el carrito
exports.createOrder = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.game', 'price');
        if (!cart) return res.status(404).json({ message: 'Carrito no encontrado.' });

        const totalPrice = cart.items.reduce((total, item) => total + item.game.price * item.quantity, 0);

        const order = new Order({
            user: req.user._id,
            items: cart.items,
            totalPrice,
        });

        await order.save();
        await Cart.findByIdAndDelete(cart._id); // Vaciar el carrito

        res.status(201).json({ message: 'Orden creada exitosamente.', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener las órdenes del usuario
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate('items.game', 'name price');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
