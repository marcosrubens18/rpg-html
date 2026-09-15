const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { toPublicCharacter } = require('../data/characterUtils');

const router = express.Router();
const TREATMENT_COST = 15;

router.post('/treat', requireAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM characters WHERE user_id = ?').get(req.user.id);
  if (!row) return res.status(404).json({ error: 'Personagem não encontrado.' });
  if (row.gold < TREATMENT_COST) {
    return res.status(400).json({ error: `Tratamento custa ${TREATMENT_COST} de ouro.` });
  }

  db.prepare(`
    UPDATE characters
    SET hp = max_hp, mp = max_mp, gold = gold - ?, status_effects = '[]'
    WHERE user_id = ?
  `).run(TREATMENT_COST, req.user.id);

  const updated = db.prepare('SELECT * FROM characters WHERE user_id = ?').get(req.user.id);
  res.json({ character: toPublicCharacter(updated) });
});

module.exports = router;
