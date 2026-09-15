const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { rollCharacterTraits, computeStats, buildHistory, RACES, CLASSES, DESTINIES } = require('../data/gameData');
const { toPublicCharacter } = require('../data/characterUtils');

const router = express.Router();

const VALID_GENDERS = ['masculino', 'feminino', 'outro'];

function getCharacterRow(userId) {
  return db.prepare('SELECT * FROM characters WHERE user_id = ?').get(userId);
}

router.get('/me', requireAuth, (req, res) => {
  const row = getCharacterRow(req.user.id);
  if (!row) return res.status(404).json({ error: 'Personagem não encontrado.' });
  res.json({ character: toPublicCharacter(row) });
});

router.post('/', requireAuth, (req, res) => {
  const existing = getCharacterRow(req.user.id);
  if (existing) {
    return res.status(409).json({ error: 'Você já tem um personagem criado.' });
  }

  const { name, age, gender } = req.body || {};
  const cleanName = typeof name === 'string' ? name.trim().slice(0, 24) : '';
  const numericAge = Number(age);
  const cleanGender = VALID_GENDERS.includes(gender) ? gender : 'outro';

  if (cleanName.length < 2) {
    return res.status(400).json({ error: 'Digite um nome com ao menos 2 caracteres.' });
  }
  if (!Number.isFinite(numericAge) || numericAge < 16 || numericAge > 80) {
    return res.status(400).json({ error: 'Idade precisa estar entre 16 e 80.' });
  }

  const traits = rollCharacterTraits();
  const stats = computeStats({ ...traits, age: numericAge, gender: cleanGender });
  const history = buildHistory({ name: cleanName, age: numericAge, gender: cleanGender, ...traits });

  const inventory = JSON.stringify({ pocao_vida: 2 });
  const equipment = JSON.stringify({});

  db.prepare(`
    INSERT INTO characters (
      user_id, name, age, gender, race_id, class_id, destiny_id,
      max_hp, hp, max_mp, mp, attack, defense, crit_chance, evasion_chance,
      gold, inventory, equipment, history
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.user.id, cleanName, numericAge, cleanGender, traits.raceId, traits.classId, traits.destinyId,
    stats.maxHp, stats.maxHp, stats.maxMp, stats.maxMp, stats.attack, stats.defense, stats.critChance, stats.evasionChance,
    stats.gold, inventory, equipment, history
  );

  const row = getCharacterRow(req.user.id);
  res.status(201).json({
    character: toPublicCharacter(row),
    race: { id: traits.raceId, ...RACES[traits.raceId] },
    class: { id: traits.classId, ...CLASSES[traits.classId] },
    destiny: { id: traits.destinyId, ...DESTINIES[traits.destinyId] }
  });
});

router.patch('/setup', requireAuth, (req, res) => {
  const row = getCharacterRow(req.user.id);
  if (!row) return res.status(404).json({ error: 'Personagem não encontrado.' });

  const { equipment } = req.body || {};
  if (!equipment || typeof equipment !== 'object') {
    return res.status(400).json({ error: 'Setup de equipamento inválido.' });
  }

  const { EQUIPMENT } = require('../data/items');
  const currentInventory = JSON.parse(row.inventory);
  const validSlots = ['weapon', 'armor', 'accessory'];
  const newEquipment = {};

  for (const slot of validSlots) {
    const itemId = equipment[slot];
    if (!itemId) continue;
    const item = EQUIPMENT[itemId];
    if (!item || item.slot !== slot) {
      return res.status(400).json({ error: `Item inválido para o slot ${slot}.` });
    }
    if (!currentInventory[itemId] || currentInventory[itemId] < 1) {
      return res.status(400).json({ error: `Você não possui ${item.name} no inventário.` });
    }
    newEquipment[slot] = itemId;
  }

  db.prepare('UPDATE characters SET equipment = ? WHERE user_id = ?').run(JSON.stringify(newEquipment), req.user.id);
  const updated = getCharacterRow(req.user.id);
  res.json({ character: toPublicCharacter(updated) });
});

module.exports = router;
