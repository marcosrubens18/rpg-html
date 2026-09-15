const express = require('express');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get('/events', (req, res) => {
  const events = db.prepare('SELECT * FROM events ORDER BY created_at DESC').all();
  res.json({ events });
});

router.post('/events', (req, res) => {
  const { title, description, rewardGold, rewardXp, startsAt, endsAt } = req.body || {};
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Título do evento é obrigatório.' });
  }

  const result = db.prepare(`
    INSERT INTO events (title, description, reward_gold, reward_xp, starts_at, ends_at, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    title.trim(),
    description || '',
    Number(rewardGold) || 0,
    Number(rewardXp) || 0,
    startsAt || null,
    endsAt || null,
    req.user.id
  );

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(Number(result.lastInsertRowid));
  res.status(201).json({ event });
});

router.patch('/events/:id', (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Evento não encontrado.' });

  const { title, description, rewardGold, rewardXp, startsAt, endsAt, active } = req.body || {};
  db.prepare(`
    UPDATE events SET
      title = ?, description = ?, reward_gold = ?, reward_xp = ?,
      starts_at = ?, ends_at = ?, active = ?
    WHERE id = ?
  `).run(
    title !== undefined ? title : event.title,
    description !== undefined ? description : event.description,
    rewardGold !== undefined ? Number(rewardGold) : event.reward_gold,
    rewardXp !== undefined ? Number(rewardXp) : event.reward_xp,
    startsAt !== undefined ? startsAt : event.starts_at,
    endsAt !== undefined ? endsAt : event.ends_at,
    active !== undefined ? (active ? 1 : 0) : event.active,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  res.json({ event: updated });
});

router.delete('/events/:id', (req, res) => {
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

router.get('/users', (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.username, u.role, u.banned_until, u.banned_permanently, u.created_at,
           c.name AS character_name, c.level, c.race_id, c.class_id, c.location
    FROM users u
    LEFT JOIN characters c ON c.user_id = u.id
    ORDER BY u.created_at DESC
  `).all();
  res.json({ users });
});

router.post('/users/:id/punish', (req, res) => {
  const targetId = Number(req.params.id);
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(targetId);
  if (!target) return res.status(404).json({ error: 'Usuário não encontrado.' });
  if (target.role === 'admin') return res.status(400).json({ error: 'Não é possível punir outro administrador.' });

  const { type, reason, durationHours } = req.body || {};
  const validTypes = ['aviso', 'mute', 'ban_temp', 'ban_perm'];
  if (!validTypes.includes(type)) return res.status(400).json({ error: 'Tipo de punição inválido.' });

  let bannedUntil = null;
  let bannedPermanently = 0;

  if (type === 'ban_temp') {
    const hours = Number(durationHours) || 24;
    bannedUntil = new Date(Date.now() + hours * 3600 * 1000).toISOString();
  } else if (type === 'ban_perm') {
    bannedPermanently = 1;
  }

  if (type === 'ban_temp' || type === 'ban_perm') {
    db.prepare('UPDATE users SET banned_until = ?, banned_permanently = ? WHERE id = ?')
      .run(bannedUntil, bannedPermanently, targetId);
  }

  db.prepare('INSERT INTO punishments (user_id, type, reason, admin_id, expires_at) VALUES (?, ?, ?, ?, ?)')
    .run(targetId, type, reason || '', req.user.id, bannedUntil);

  res.status(201).json({ ok: true });
});

router.post('/users/:id/pardon', (req, res) => {
  const targetId = Number(req.params.id);
  db.prepare('UPDATE users SET banned_until = NULL, banned_permanently = 0 WHERE id = ?').run(targetId);
  res.json({ ok: true });
});

router.get('/users/:id/punishments', (req, res) => {
  const punishments = db.prepare('SELECT * FROM punishments WHERE user_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json({ punishments });
});

module.exports = router;
