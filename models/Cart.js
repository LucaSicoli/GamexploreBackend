const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [
        {
            game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
            quantity: { type: Number, default: 1 },
            subtotal: { type: Number, default: 0 }
        },
    ],
    totalPrice: { type: Number, default: 0 },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

module.exports = Cart;
