const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { LOCATIONS } = require('../data/locations');
const { ITEMS } = require('../data/items');
const { CLASSES, DESTINIES } = require('../data/gameData');
const { gainXp } = require('../data/leveling');
const { toPublicCharacter, parseJsonField } = require('../data/characterUtils');
const combatEngine = require('../combatEngine');

const router = express.Router();

function getRow(userId) {
  return db.prepare('SELECT * FROM characters WHERE user_id = ?').get(userId);
}

function saveRow(userId, fields) {
  const keys = Object.keys(fields);
  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => fields[k]);
  db.prepare(`UPDATE characters SET ${setClause} WHERE user_id = ?`).run(...values, userId);
}

router.post('/encounter', requireAuth, (req, res) => {
  const row = getRow(req.user.id);
  if (!row) return res.status(404).json({ error: 'Personagem não encontrado.' });
  if (combatEngine.getCombat(req.user.id)) {
    return res.status(409).json({ error: 'Você já está em combate.' });
  }

  const location = LOCATIONS[row.location];
  if (!location || location.type !== 'wild') {
    return res.status(400).json({ error: 'Não há inimigos por aqui.' });
  }

  const combat = combatEngine.startCombat(req.user.id, location, row.destiny_id);
  if (!combat) {
    return res.json({ inCombat: false });
  }

  res.json({ inCombat: true, enemy: combat.enemy, log: combat.log, character: toPublicCharacter(row) });
});

router.get('/state', requireAuth, (req, res) => {
  const combat = combatEngine.getCombat(req.user.id);
  const row = getRow(req.user.id);
  res.json({
    inCombat: !!combat,
    enemy: combat ? combat.enemy : null,
    character: row ? toPublicCharacter(row) : null
  });
});

router.post('/action', requireAuth, (req, res) => {
  const row = getRow(req.user.id);
  if (!row) return res.status(404).json({ error: 'Personagem não encontrado.' });

  const combat = combatEngine.getCombat(req.user.id);
  if (!combat) return res.status(400).json({ error: 'Você não está em combate.' });

  const { action, itemId } = req.body || {};
  const character = toPublicCharacter(row);
  const enemy = combat.enemy;
  const log = [];

  let hp = row.hp;
  let mp = row.mp;
  let gold = row.gold;
  let inventory = parseJsonField(row.inventory, {});
  let combatOver = false;
  let victory = false;
  let fled = false;

  function playerAttack() {
    const damage = Math.max(1, Math.round(combatEngine.effectiveAttackDamage(character, row.destiny_id) - enemy.defense + combatEngine.rollVariance()));
    enemy.hp -= damage;
    log.push(`${character.name} atacou e causou ${damage} de dano.`);
  }

  function playerSkill() {
    const clazz = CLASSES[row.class_id];
    const skill = clazz.skill;
    if (mp < skill.mpCost) {
      log.push('Mana insuficiente.');
      return;
    }
    mp -= skill.mpCost;
    const damage = Math.max(1, Math.round(combatEngine.effectiveAttackDamage(character, row.destiny_id, skill.multiplier || 1.5) - enemy.defense + combatEngine.rollVariance()));
    enemy.hp -= damage;
    log.push(`${character.name} usou ${skill.name} e causou ${damage} de dano.`);
  }

  function playerItem() {
    const item = ITEMS[itemId];
    if (!item || !inventory[itemId]) {
      log.push('Item indisponível.');
      return;
    }
    inventory = { ...inventory, [itemId]: inventory[itemId] - 1 };
    if (inventory[itemId] <= 0) delete inventory[itemId];
    if (item.heal) hp = Math.min(character.maxHp, hp + item.heal);
    if (item.restoreMp) mp = Math.min(character.maxMp, mp + item.restoreMp);
    log.push(`${character.name} usou ${item.name}.`);
  }

  function enemyTurn() {
    if (Math.random() < character.evasionChance) {
      log.push(`${character.name} esquivou do ataque de ${enemy.name}.`);
      return;
    }
    const damage = Math.max(1, enemy.attack - character.defense + combatEngine.rollVariance());
    hp -= damage;
    log.push(`${enemy.name} atacou e causou ${damage} de dano.`);
  }

  if (action === 'attack') {
    playerAttack();
  } else if (action === 'skill') {
    playerSkill();
  } else if (action === 'item') {
    playerItem();
  } else if (action === 'flee') {
    if (Math.random() < 0.6) {
      log.push(`${character.name} fugiu do combate.`);
      fled = true;
      combatOver = true;
    } else {
      log.push(`${character.name} tentou fugir, mas não conseguiu.`);
    }
  } else {
    return res.status(400).json({ error: 'Ação inválida.' });
  }

  if (!combatOver && enemy.hp <= 0) {
    victory = true;
    combatOver = true;
    gold += enemy.gold;
    log.push(`Você derrotou ${enemy.name}!`);
    log.push(`Ganhou ${enemy.xp} de XP e ${enemy.gold} de ouro.`);

    const destiny = DESTINIES[row.destiny_id] || {};
    if (destiny.rareDropBonus && Math.random() < destiny.rareDropBonus) {
      inventory = { ...inventory, pocao_vida: (inventory.pocao_vida || 0) + 1 };
      log.push('Você encontrou uma Poção de Vida extra entre os pertences do inimigo.');
    }
  } else if (!combatOver) {
    enemyTurn();
    if (hp <= 0) {
      combatOver = true;
      log.push(`${character.name} foi derrotado e precisou ser resgatado de volta à Praça Central.`);
      hp = Math.max(1, Math.round(character.maxHp * 0.3));
    }
  }

  const updates = {
    hp: Math.max(0, Math.min(character.maxHp, hp)),
    mp: Math.max(0, Math.min(character.maxMp, mp)),
    gold,
    inventory: JSON.stringify(inventory)
  };

  let levelUpMessages = [];
  if (victory) {
    const leveled = gainXp(row, enemy.xp);
    updates.xp = leveled.xp;
    updates.xp_to_next = leveled.xpToNext;
    updates.level = leveled.level;
    updates.max_hp = leveled.maxHp;
    updates.max_mp = leveled.maxMp;
    updates.attack = leveled.attack;
    updates.defense = leveled.defense;
    updates.attribute_points = leveled.attributePoints;
    if (leveled.leveledUp) {
      updates.hp = leveled.maxHp;
      updates.mp = leveled.maxMp;
    }
    levelUpMessages = leveled.messages;
  }

  if (combatOver && !victory && hp <= 0) {
    updates.location = 'praca';
  }

  saveRow(req.user.id, updates);

  if (combatOver) combatEngine.endCombat(req.user.id);

  const updatedRow = getRow(req.user.id);
  res.json({
    log: [...log, ...levelUpMessages],
    enemy: combatOver ? null : enemy,
    inCombat: !combatOver,
    victory,
    fled,
    character: toPublicCharacter(updatedRow)
  });
});

module.exports = router;
