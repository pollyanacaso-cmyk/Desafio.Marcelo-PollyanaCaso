const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

module.exports = function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Envie o token no header Authorization: Bearer <token>.' });
  }

  try {
    req.auth = jwt.verify(token, jwtSecret);
    next();
  } catch (err) {
    const expired = err.name === 'TokenExpiredError';
    res.status(401).json({
      error: expired ? 'Token expirado. Faça login novamente.' : 'Token inválido.',
    });
  }
};
