const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET, requireAuth } = require('../middleware/auth');

const router = express.Router();

const ADMIN_SIGNUP_CODE = process.env.ADMIN_SIGNUP_CODE || null;

function signToken(user) {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', (req, res) => {
  const { username, password, adminCode } = req.body || {};

  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    return res.status(400).json({ error: 'Nome de usuário precisa ter ao menos 3 caracteres.' });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Senha precisa ter ao menos 6 caracteres.' });
  }

  const cleanUsername = username.trim();
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(cleanUsername);
  if (existing) {
    return res.status(409).json({ error: 'Esse nome de usuário já está em uso.' });
  }

  const role = (ADMIN_SIGNUP_CODE && adminCode === ADMIN_SIGNUP_CODE) ? 'admin' : 'player';
  const passwordHash = bcrypt.hashSync(password, 10);

  const result = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run(cleanUsername, passwordHash, role);
  const user = { id: Number(result.lastInsertRowid), username: cleanUsername, role };

  const token = signToken(user);
  res.status(201).json({ token, user });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Informe usuário e senha.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
  }

  if (user.banned_permanently || (user.banned_until && new Date(user.banned_until) > new Date())) {
    return res.status(403).json({ error: 'Sua conta está banida.', bannedUntil: user.banned_until, permanent: !!user.banned_permanently });
  }

  const token = signToken(user);
  const hasCharacter = !!db.prepare('SELECT id FROM characters WHERE user_id = ?').get(user.id);

  res.json({
    token,
    user: { id: user.id, username: user.username, role: user.role },
    hasCharacter
  });
});

router.get('/me', requireAuth, (req, res) => {
  const hasCharacter = !!db.prepare('SELECT id FROM characters WHERE user_id = ?').get(req.user.id);
  res.json({ user: { id: req.user.id, username: req.user.username, role: req.user.role }, hasCharacter });
});

module.exports = router;
