const Game = require('../models/Game');
const Order = require('../models/order');
const Wishlist = require('../models/Wishlist');

// Reporte de Ventas por Juego
exports.getSalesReport = async (req, res) => {
    try {
        const report = await Order.aggregate([
            { $group: { _id: "$game", totalSales: { $sum: 1 } } },
            {
                $lookup: {
                    from: 'games',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'game',
                },
            },
            { $unwind: "$game" },
            { $project: { gameName: "$game.name", totalSales: 1 } },
        ]);

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reporte de Wishlists por Juego
exports.getWishlistReport = async (req, res) => {
    try {
        const report = await Wishlist.aggregate([
            { $unwind: "$games" },
            { $group: { _id: "$games", count: { $sum: 1 } } },
            {
                $lookup: {
                    from: 'games',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'game',
                },
            },
            { $unwind: "$game" },
            { $project: { gameName: "$game.name", wishlists: "$count" } },
        ]);

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tasa de Conversión (Visualizaciones vs Ventas)
exports.getConversionRate = async (req, res) => {
    try {
        const games = await Game.find().select('name views');
        const orders = await Order.aggregate([{ $group: { _id: "$game", totalSales: { $sum: 1 } } }]);

        const report = games.map(game => {
            const order = orders.find(o => o._id.toString() === game._id.toString());
            const totalSales = order ? order.totalSales : 0;
            const conversionRate = game.views ? (totalSales / game.views) * 100 : 0;

            return {
                gameName: game.name,
                views: game.views,
                totalSales: totalSales,
                conversionRate: conversionRate.toFixed(2) + '%',
            };
        });

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
