const { verifyToken } = require('../services/auth.service');

// Protects any route it's attached to: requires a valid JWT in the
// Authorization header, in the standard "Bearer <token>" format.
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.admin = payload;
  next();
}

module.exports = requireAdmin;
