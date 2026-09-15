const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'valdora-dev-secret-troque-em-producao';

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Não autenticado.' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
  }

  const dbUser = db.prepare('SELECT banned_until, banned_permanently FROM users WHERE id = ?').get(req.user.id);
  if (!dbUser) return res.status(401).json({ error: 'Usuário não encontrado.' });
  if (dbUser.banned_permanently || (dbUser.banned_until && new Date(dbUser.banned_until) > new Date())) {
    return res.status(403).json({ error: 'Sua conta está banida.' });
  }

  next();
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores.' });
  }
  next();
}

module.exports = { JWT_SECRET, requireAuth, requireAdmin };
