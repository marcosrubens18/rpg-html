const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { RACES, CLASSES } = require('../data/gameData');

const router = express.Router();

router.get('/ranking', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT name, level, xp, race_id, class_id, gold
    FROM characters
    ORDER BY level DESC, xp DESC
    LIMIT 20
  `).all();

  const ranking = rows.map((row) => ({
    name: row.name,
    level: row.level,
    xp: row.xp,
    gold: row.gold,
    race: RACES[row.race_id] ? RACES[row.race_id].name : row.race_id,
    class: CLASSES[row.class_id] ? CLASSES[row.class_id].name : row.class_id
  }));

  res.json({ ranking });
});

module.exports = router;
