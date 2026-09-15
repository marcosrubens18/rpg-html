function gainXp(row, amount) {
  const messages = [];
  let xp = row.xp + amount;
  let xpToNext = row.xp_to_next;
  let level = row.level;
  let maxHp = row.max_hp;
  let maxMp = row.max_mp;
  let attack = row.attack;
  let defense = row.defense;
  let attributePoints = row.attribute_points;

  while (xp >= xpToNext) {
    xp -= xpToNext;
    level += 1;
    xpToNext = Math.round(xpToNext * 1.35);
    maxHp += 8;
    maxMp += 3;
    attack += 1;
    defense += 1;
    attributePoints += 2;
    messages.push(`Subiu para o nível ${level}!`);
  }

  return {
    xp, xpToNext, level, maxHp, maxMp, attack, defense, attributePoints,
    leveledUp: level > row.level,
    messages
  };
}

module.exports = { gainXp };
