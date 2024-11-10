const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    systemRequirements: {
        minimum: {
            cpu: { type: String, required: true },
            gpu: { type: String, required: true },
            ram: { type: String, required: true },
            storage: { type: String, required: true },
        },
        recommended: {
            cpu: { type: String, required: true },
            gpu: { type: String, required: true },
            ram: { type: String, required: true },
            storage: { type: String, required: true },
        }
    },
    price: { type: Number, required: true },
    developer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    players: {
        type: String,
        enum: ['Single-player', 'Multi-player'],
    },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    language: {
        type: [String],
        enum: ['Inglés', 'Español', 'Francés', 'Alemán', 'Chino', 'Japonés', 'Italiano', 'Portugués'],
        required: true,
    },
    platform: {
        type: [String], 
        enum: ['Windows', 'Mac', 'Linux'], 
        required: true,
    },
    imageUrl: { type: String, required: true }, // Guardar URL de imagen
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment', 
    }],
    isPublished: { type: Boolean, default: false },
    views: { type: Number, default: 0 }, // Nuevo campo para las visualizaciones
    wishlistCount: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
}, { timestamps: true });

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
