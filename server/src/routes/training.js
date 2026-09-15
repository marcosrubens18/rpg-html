const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { toPublicCharacter } = require('../data/characterUtils');

const router = express.Router();

const STAT_COST = {
  attack: { column: 'attack', gain: 1 },
  defense: { column: 'defense', gain: 1 },
  maxHp: { column: 'max_hp', gain: 3 },
  maxMp: { column: 'max_mp', gain: 2 }
};

router.post('/allocate', requireAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM characters WHERE user_id = ?').get(req.user.id);
  if (!row) return res.status(404).json({ error: 'Personagem não encontrado.' });

  const { stat } = req.body || {};
  const config = STAT_COST[stat];
  if (!config) return res.status(400).json({ error: 'Atributo inválido.' });
  if (row.attribute_points < 1) return res.status(400).json({ error: 'Você não tem pontos de atributo disponíveis.' });

  const alsoRestore = config.column === 'max_hp' ? 'hp' : config.column === 'max_mp' ? 'mp' : null;

  db.prepare(`
    UPDATE characters
    SET ${config.column} = ${config.column} + ?,
        attribute_points = attribute_points - 1
        ${alsoRestore ? `, ${alsoRestore} = ${alsoRestore} + ?` : ''}
    WHERE user_id = ?
  `).run(...(alsoRestore ? [config.gain, config.gain, req.user.id] : [config.gain, req.user.id]));

  const updated = db.prepare('SELECT * FROM characters WHERE user_id = ?').get(req.user.id);
  res.json({ character: toPublicCharacter(updated) });
});

module.exports = router;
