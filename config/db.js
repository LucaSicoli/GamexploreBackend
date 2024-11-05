const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Conectado a la base de datos');
    } catch (error) {
        console.error('Error conectando a la base de datos:', error.message);
        process.exit(1);  // Termina el proceso si hay un error
    }
};

module.exports = connectDB;

