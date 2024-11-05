const express = require('express');
const dotenv = require('dotenv').config();
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');
const commentRoutes = require('./routes/commentRoutes');
const reportRoutes = require('./routes/reportRoutes'); // Rutas de reportes
const cartRoutes = require('./routes/cartRoutes'); // Importa correctamente las rutas del carrito
const authMiddleware = require('./middleware/authMiddleware'); // Importa correctamente el middleware
const cors = require('cors'); // Importa el módulo de CORS


const app = express();

app.use(cors(
    {
        origin: 'http://localhost:3000', // Permite el acceso desde el puerto 3000
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos HTTP permitidos
        credentials: true // Permitir credenciales
    }
)) // Habilita CORS con los distintos metodos HTTP

// Middleware para parsear JSON
app.use(express.json());

// Conectar a la base de datos
connectDB();

// Rutas públicas (no requieren autenticación)
app.use('/api/auth', authRoutes);

// Rutas protegidas (requieren autenticación)
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/games', authMiddleware, gameRoutes);
app.use('/api/wishlist', authMiddleware, wishlistRoutes);
app.use('/api/comments', authMiddleware, commentRoutes);
app.use('/api/orders', authMiddleware, orderRoutes);
app.use('/api/reports', authMiddleware, reportRoutes); // Ruta corregida para reportes
app.use('/api/cart', authMiddleware, cartRoutes);

// Verificar estado del servidor
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
