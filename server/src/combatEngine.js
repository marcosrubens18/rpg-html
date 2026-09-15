const { createEnemy } = require('./data/enemies');
const { CLASSES, DESTINIES } = require('./data/gameData');

const activeCombats = new Map();

function rollVariance() {
  return Math.floor(Math.random() * 3) - 1;
}

function rollEncounter(location, destinyId) {
  const destiny = DESTINIES[destinyId] || {};
  const baseChance = 0.55;
  const chance = Math.max(0.1, baseChance - (destiny.encounterChanceReduction || 0));
  if (Math.random() > chance) return null;

  const enemyId = location.enemies[Math.floor(Math.random() * location.enemies.length)];
  const enemy = createEnemy(enemyId);

  const eliteChance = destiny.strongerEncounterChance || 0;
  if (Math.random() < eliteChance) {
    enemy.name = `${enemy.name} Elite`;
    enemy.hp = Math.round(enemy.hp * 1.4);
    enemy.maxHp = enemy.hp;
    enemy.attack = Math.round(enemy.attack * 1.25);
    enemy.xp = Math.round(enemy.xp * 1.5);
    enemy.gold = Math.round(enemy.gold * 1.5);
    enemy.elite = true;
  }

  return enemy;
}

function startCombat(userId, location, destinyId) {
  const enemy = rollEncounter(location, destinyId);
  if (!enemy) return null;
  const combat = { enemy, log: [] };
  activeCombats.set(userId, combat);
  combat.log.push(`Um ${enemy.name} apareceu!`);
  return combat;
}

function getCombat(userId) {
  return activeCombats.get(userId) || null;
}

function endCombat(userId) {
  activeCombats.delete(userId);
}

function effectiveAttackDamage(character, destinyId, bonusMultiplier = 1) {
  const destiny = DESTINIES[destinyId] || {};
  let damage = character.attack * bonusMultiplier;
  const isLowHp = character.hp / character.maxHp <= 0.25;
  if (isLowHp && destiny.lowHpDamageBonus) {
    damage *= (1 + destiny.lowHpDamageBonus);
  }
  return damage;
}

module.exports = {
  activeCombats,
  rollVariance,
  startCombat,
  getCombat,
  endCombat,
  effectiveAttackDamage
};
