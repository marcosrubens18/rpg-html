const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { toPublicCharacter } = require('../data/characterUtils');

const router = express.Router();
const REWARD_GOLD = 15;

router.get('/opponents', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT c.user_id, c.name, c.level, c.race_id, c.class_id, c.pvp_wins, c.pvp_losses
    FROM characters c
    WHERE c.user_id != ?
    ORDER BY c.level DESC
    LIMIT 20
  `).all(req.user.id);
  res.json({ opponents: rows });
});

function simulateDuel(a, b) {
  const log = [];
  let hpA = a.maxHp;
  let hpB = b.maxHp;
  let turn = 0;

  while (hpA > 0 && hpB > 0 && turn < 40) {
    turn += 1;
    if (Math.random() >= b.evasionChance) {
      const dmg = Math.max(1, Math.round(a.attack - b.defense + (Math.random() * 3 - 1)));
      hpB -= dmg;
      log.push(`${a.name} acertou ${b.name} em ${dmg}.`);
      if (hpB <= 0) break;
    } else {
      log.push(`${b.name} esquivou do ataque de ${a.name}.`);
    }

    if (Math.random() >= a.evasionChance) {
      const dmg = Math.max(1, Math.round(b.attack - a.defense + (Math.random() * 3 - 1)));
      hpA -= dmg;
      log.push(`${b.name} acertou ${a.name} em ${dmg}.`);
    } else {
      log.push(`${a.name} esquivou do ataque de ${b.name}.`);
    }
  }

  const winner = hpA <= 0 && hpB <= 0 ? null : hpA <= 0 ? b.name : hpB <= 0 ? a.name : (hpA >= hpB ? a.name : b.name);
  return { log, winner };
}

router.post('/challenge', requireAuth, (req, res) => {
  const { opponentUserId } = req.body || {};
  const myRow = db.prepare('SELECT * FROM characters WHERE user_id = ?').get(req.user.id);
  const opponentRow = db.prepare('SELECT * FROM characters WHERE user_id = ?').get(opponentUserId);

  if (!myRow) return res.status(404).json({ error: 'Personagem não encontrado.' });
  if (!opponentRow) return res.status(404).json({ error: 'Oponente não encontrado.' });
  if (Number(opponentUserId) === req.user.id) return res.status(400).json({ error: 'Você não pode duelar consigo mesmo.' });

  const me = toPublicCharacter(myRow);
  const opponent = toPublicCharacter(opponentRow);

  const result = simulateDuel(me, opponent);
  const iWon = result.winner === me.name;

  db.prepare('UPDATE characters SET pvp_wins = pvp_wins + ?, pvp_losses = pvp_losses + ?, gold = gold + ? WHERE user_id = ?')
    .run(iWon ? 1 : 0, iWon ? 0 : 1, iWon ? REWARD_GOLD : 0, req.user.id);
  db.prepare('UPDATE characters SET pvp_wins = pvp_wins + ?, pvp_losses = pvp_losses + ? WHERE user_id = ?')
    .run(iWon ? 0 : 1, iWon ? 1 : 0, opponentUserId);

  const updated = db.prepare('SELECT * FROM characters WHERE user_id = ?').get(req.user.id);
  res.json({
    log: result.log,
    winnerName: result.winner,
    youWon: iWon,
    rewardGold: iWon ? REWARD_GOLD : 0,
    character: toPublicCharacter(updated)
  });
});

module.exports = router;
