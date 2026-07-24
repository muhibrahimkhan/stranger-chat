const express = require('express');
const { verifyAdminCredentials, generateToken } = require('../services/auth.service');
const requireAdmin = require('../middleware/requireAdmin');
const Report = require('../models/Report');
const Ban = require('../models/Ban');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Basic input validation: don't trust the shape of incoming data.
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const valid = await verifyAdminCredentials(username, password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(username);
  res.json({ token });
});

router.get('/reports', requireAdmin, async (req, res) => {
  const reports = await Report.find().sort({ createdAt: -1 }).limit(200);
  res.json(reports);
});

router.get('/bans', requireAdmin, async (req, res) => {
  const bans = await Ban.find().sort({ createdAt: -1 }).limit(200);
  res.json(bans);
});

module.exports = router;
