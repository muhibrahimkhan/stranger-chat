const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Single-admin auth: there's only ever one admin (you, the site owner), so
// credentials live in environment variables rather than a full user
// collection in the database. The password is stored as a bcrypt hash, never
// in plain text.
async function verifyAdminCredentials(username, password) {
  if (username !== process.env.ADMIN_USERNAME) return false;
  return bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
}

function generateToken(username) {
  return jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '2h' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = { verifyAdminCredentials, generateToken, verifyToken };
