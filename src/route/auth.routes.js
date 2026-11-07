const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config');
const { findByEmail, findById } = require('../data/users');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Informe e-mail e senha.' });
  }

  const user = findByEmail(email);
  // Mesma resposta para e-mail inexistente e senha errada: não revela qual dos dois falhou.
  const valid = user && (await bcrypt.compare(password, user.passwordHash));

  if (!valid) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  }

  const access_token = jwt.sign({ sub: user.id, name: user.name }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });

  res.json({
    access_token,
    token_type: 'Bearer',
    expires_in: jwtExpiresIn,
  });
});

router.get('/me', requireAuth, (req, res) => {
  const user = findById(req.auth.sub);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    token_expires_at: new Date(req.auth.exp * 1000).toISOString(),
  });
});

module.exports = router;
