function createPlayer(name) {
  return {
    name,
    level: 1,
    xp: 0,
    xpToNext: 30,
    maxHp: 40,
    hp: 40,
    maxMp: 15,
    mp: 15,
    attack: 7,
    defense: 2,
    gold: 20,
    inventory: { pocao_vida: 2 },
    currentLocation: 'praca'
  };
}

function gainXp(player, amount) {
  const messages = [];
  player.xp += amount;
  while (player.xp >= player.xpToNext) {
    player.xp -= player.xpToNext;
    player.level += 1;
    player.xpToNext = Math.round(player.xpToNext * 1.35);
    player.maxHp += 8;
    player.maxMp += 3;
    player.attack += 2;
    player.defense += 1;
    player.hp = player.maxHp;
    player.mp = player.maxMp;
    messages.push(`${player.name} subiu para o nível ${player.level}!`);
  }
  return messages;
}

function useItem(player, itemId) {
  const owned = player.inventory[itemId] || 0;
  if (owned <= 0) return null;
  const item = ITEMS[itemId];
  if (item.heal) {
    player.hp = Math.min(player.maxHp, player.hp + item.heal);
  }
  player.inventory[itemId] -= 1;
  return item;
}
