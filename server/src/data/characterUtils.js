const { EQUIPMENT } = require('./items');

function parseJsonField(value, fallback) {
  try {
    return JSON.parse(value);
  } catch (err) {
    return fallback;
  }
}

function toPublicCharacter(row) {
  const equipment = parseJsonField(row.equipment, {});
  const inventory = parseJsonField(row.inventory, {});
  const statusEffects = parseJsonField(row.status_effects, []);

  let bonusAttack = 0;
  let bonusDefense = 0;
  let bonusMaxHp = 0;
  let bonusMaxMp = 0;

  Object.values(equipment).forEach((itemId) => {
    const item = EQUIPMENT[itemId];
    if (!item) return;
    bonusAttack += item.attack || 0;
    bonusDefense += item.defense || 0;
    bonusMaxHp += item.maxHp || 0;
    bonusMaxMp += item.maxMp || 0;
  });

  return {
    id: row.id,
    name: row.name,
    age: row.age,
    gender: row.gender,
    raceId: row.race_id,
    classId: row.class_id,
    destinyId: row.destiny_id,
    level: row.level,
    xp: row.xp,
    xpToNext: row.xp_to_next,
    maxHp: row.max_hp + bonusMaxHp,
    hp: Math.min(row.hp, row.max_hp + bonusMaxHp),
    maxMp: row.max_mp + bonusMaxMp,
    mp: Math.min(row.mp, row.max_mp + bonusMaxMp),
    attack: row.attack + bonusAttack,
    defense: row.defense + bonusDefense,
    critChance: row.crit_chance,
    evasionChance: row.evasion_chance,
    gold: row.gold,
    attributePoints: row.attribute_points,
    location: row.location,
    inventory,
    equipment,
    statusEffects,
    history: row.history
  };
}

module.exports = { toPublicCharacter, parseJsonField };
