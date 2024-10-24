const express = require('express');
const mongoose = require('mongoose');
const { createClient } = require('redis'); // Asegúrate de importar createClient
const dotenv = require('dotenv');

dotenv.config(); // Carga las variables de entorno desde el archivo .env

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para manejar JSON
app.use(express.json());

// Conexión a MongoDB usando Mongoose
mongoose.connect('mongodb+srv://root:123@cluster-2.0pffj.mongodb.net/practica2?retryWrites=true&w=majority&appName=Cluster-2')
    .then(() => console.log('Conectado a MongoDB'))
    .catch((error) => console.error('Error conectando a MongoDB:', error));

// Conexión a Redis
const redisClient = createClient({
    password: 'JIYa1h6VzjDpCqwPfQ4r9B8AFCW2Knp0', // Tu contraseña aquí
    socket: {
        host: 'redis-17524.c124.us-central1-1.gce.redns.redis-cloud.com',
        port: 17524
    }
});

redisClient.connect()
    .then(() => console.log('Conectado a Redis'))
    .catch((err) => console.error('Error conectando a Redis:', err));

// Rutas básicas
app.get('/', (req, res) => {
    res.send('Bienvenido a la API REST');
});

// Asegúrate de que tus rutas estén configuradas después de haber establecido la conexión
const userRoutes = require('./routes/userRoutes')(redisClient); // Pasa el cliente Redis
app.use('/api', userRoutes);

// Escuchar en el puerto
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
