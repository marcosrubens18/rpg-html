const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const now = new Date().toISOString();
  const events = db.prepare(`
    SELECT id, title, description, reward_gold, reward_xp, starts_at, ends_at
    FROM events
    WHERE active = 1
      AND (starts_at IS NULL OR starts_at <= ?)
      AND (ends_at IS NULL OR ends_at >= ?)
    ORDER BY created_at DESC
  `).all(now, now);
  res.json({ events });
});

module.exports = router;
