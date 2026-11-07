const path = require('path');
const express = require('express');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api/auth', authRoutes);

app.use('/api', (req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));

module.exports = app;
