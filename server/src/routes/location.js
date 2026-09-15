const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { LOCATIONS } = require('../data/locations');
const { toPublicCharacter } = require('../data/characterUtils');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  res.json({ locations: LOCATIONS });
});

router.post('/travel', requireAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM characters WHERE user_id = ?').get(req.user.id);
  if (!row) return res.status(404).json({ error: 'Personagem não encontrado.' });

  const { to } = req.body || {};
  const current = LOCATIONS[row.location];
  const target = LOCATIONS[to];

  if (!target) return res.status(400).json({ error: 'Local desconhecido.' });
  if (!current.connections.includes(to)) {
    return res.status(400).json({ error: 'Esse local não é acessível a partir daqui.' });
  }

  db.prepare('UPDATE characters SET location = ? WHERE user_id = ?').run(to, req.user.id);
  const updated = db.prepare('SELECT * FROM characters WHERE user_id = ?').get(req.user.id);
  res.json({ character: toPublicCharacter(updated), location: target });
});

router.post('/rest', requireAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM characters WHERE user_id = ?').get(req.user.id);
  if (!row) return res.status(404).json({ error: 'Personagem não encontrado.' });
  if (LOCATIONS[row.location].type !== 'rest') {
    return res.status(400).json({ error: 'Você só pode descansar na Taverna.' });
  }

  db.prepare('UPDATE characters SET hp = max_hp, mp = max_mp WHERE user_id = ?').run(req.user.id);
  const updated = db.prepare('SELECT * FROM characters WHERE user_id = ?').get(req.user.id);
  res.json({ character: toPublicCharacter(updated) });
});

module.exports = router;
