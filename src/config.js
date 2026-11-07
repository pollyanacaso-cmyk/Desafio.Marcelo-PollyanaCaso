if (!process.env.JWT_SECRET) {
  console.error('Defina JWT_SECRET no arquivo .env (veja .env.example).');
  process.exit(1);
}

module.exports = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
};
