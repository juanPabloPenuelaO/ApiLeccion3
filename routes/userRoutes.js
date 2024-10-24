// Importar dependencias necesarias
const express = require('express');
const User = require('../models/User');

module.exports = (redisClient) => {
    const router = express.Router();

    // Crear un nuevo usuario
    router.post('/users', async (req, res) => {
        const { name, email, password } = req.body;

        try {
            const newUser = new User({ name, email, password });
            await newUser.save();

            // Guardar en Redis
            await redisClient.set(email, JSON.stringify(newUser), {
                EX: 60 // Expira en 60 segundos
            });

            // Verificar lo que se ha guardado
            const savedUser = await redisClient.get(email);
            console.log('Usuario guardado en Redis:', savedUser);

            // Enviar la respuesta al cliente
            res.status(201).json(newUser);
        } catch (error) {
            console.error('Error creando usuario:', error); // Log de error en la consola
            res.status(500).json({ error: 'Error creando usuario' });
        }
    });

    // Obtener todos los usuarios
    router.get('/users', async (req, res) => {
        const cacheKey = 'users';

        try {
            // Intentar obtener usuarios del cache Redis
            const cachedUsers = await redisClient.get(cacheKey);

            if (cachedUsers) {
                return res.json(JSON.parse(cachedUsers));
            }

            // Si no hay cache, obtener de MongoDB
            const users = await User.find();

            // Guardar en cache Redis
            await redisClient.set(cacheKey, JSON.stringify(users), {
                EX: 60 // Expira en 60 segundos
            });

            res.json(users);
        } catch (error) {
            console.error('Error obteniendo usuarios:', error); // Log de error en la consola
            res.status(500).json({ error: 'Error obteniendo usuarios' });
        }
    });

    return router;
};
