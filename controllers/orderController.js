const Cart = require('../models/cart');
const Order = require('../models/order');
const Game = require('../models/Game'); // Importa el modelo Game

// Helper functions for validation
const isValidCardNumber = (number) => /^\d{16}$/.test(number.replace(/-/g, ''));
const formatCardNumber = (number) => number.replace(/(\d{4})(?=\d)/g, '$1-');
const isValidCVV = (cvv) => /^\d{3,4}$/.test(cvv);
const isFutureExpiryDate = (expiry) => {
    const [month, year] = expiry.split('/');
    const now = new Date();
    const expiryDate = new Date(`20${year}`, month - 1); // Ajuste de año y mes
    return expiryDate > now;
};

exports.createOrder = async (req, res) => {
    try {
        const {
            cardName,
            cardNumber,
            cardCVC,
            cardExpiry,
            address,
            country,
            province,
            city,
            postalCode,
        } = req.body;

        // Validate cardholder name
        if (!cardName || !/^[a-zA-Z\s]+$/.test(cardName)) {
            return res.status(400).json({ message: 'Nombre en la tarjeta inválido.' });
        }

        // Validate and format card number
        if (!isValidCardNumber(cardNumber)) {
            return res.status(400).json({ message: 'Número de tarjeta inválido. Debe tener 16 dígitos.' });
        }
        const formattedCardNumber = formatCardNumber(cardNumber.replace(/-/g, ''));

        // Validate CVV
        if (!isValidCVV(cardCVC)) {
            return res.status(400).json({ message: 'Código CVV inválido. Debe tener 3 o 4 dígitos.' });
        }

        // Validate card expiry date
        if (!cardExpiry || !isFutureExpiryDate(cardExpiry)) {
            return res.status(400).json({ message: 'Fecha de vencimiento inválida o expirada. Use el formato MM/YY.' });
        }

        // Validate address
        if (!address || address.length < 5) {
            return res.status(400).json({ message: 'Dirección inválida.' });
        }

        // Validate country
        if (!country || country.length < 3) {
            return res.status(400).json({ message: 'Nombre de país inválido.' });
        }

        // Validate province
        if (!province || province.length < 2) {
            return res.status(400).json({ message: 'Nombre de provincia inválido.' });
        }

        // Validate city
        if (!city || city.length < 2) {
            return res.status(400).json({ message: 'Nombre de ciudad inválido.' });
        }

        // Validate postal code
        if (!postalCode || !/^[a-zA-Z0-9]{5,10}$/.test(postalCode)) {
            return res.status(400).json({ message: 'Código postal inválido.' });
        }

        // Check if cart exists
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.game', 'price');
        if (!cart) return res.status(404).json({ message: 'Carrito no encontrado.' });

        const totalPrice = cart.items.reduce((total, item) => total + item.game.price * item.quantity, 0);

        // Create the order
        const order = new Order({
            user: req.user._id,
            items: cart.items,
            totalPrice,
            status: 'completed',
            paymentDetails: {
                cardName,
                cardNumber: formattedCardNumber.slice(-4), // Almacena solo los últimos 4 dígitos por seguridad
                cardExpiry,
            },
            address: { address, country, province, city, postalCode },
        });

        await order.save();

        for (const item of cart.items) {
            await Game.findByIdAndUpdate(item.game._id, {
                $inc: { purchases: item.quantity } // Incrementa la cantidad de compras
            });
        }

        await Cart.findByIdAndDelete(cart._id); // Vacía el carrito

        res.status(201).json({ message: 'Orden creada exitosamente.', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
