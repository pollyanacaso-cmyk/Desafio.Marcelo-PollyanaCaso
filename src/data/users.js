const bcrypt = require('bcryptjs');

// Usuário de demonstração. A senha fica guardada como hash, nunca em texto puro.
const users = [
  {
    id: 1,
    name: 'Usuária Demo',
    email: 'demo@exemplo.com',
    passwordHash: bcrypt.hashSync('senha123', 10),
  },
];

const findByEmail = (email) =>
  users.find((u) => u.email === String(email).trim().toLowerCase());

const findById = (id) => users.find((u) => u.id === id);

module.exports = { findByEmail, findById };
