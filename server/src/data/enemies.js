const ENEMY_TEMPLATES = {
  goblin: { name: 'Goblin', hp: 18, attack: 4, defense: 1, xp: 12, gold: 5 },
  lobo: { name: 'Lobo Selvagem', hp: 24, attack: 6, defense: 0, xp: 16, gold: 4 },
  esqueleto: { name: 'Esqueleto Guardião', hp: 30, attack: 5, defense: 3, xp: 22, gold: 9 }
};

function createEnemy(templateId) {
  const template = ENEMY_TEMPLATES[templateId];
  return {
    templateId,
    name: template.name,
    hp: template.hp,
    maxHp: template.hp,
    attack: template.attack,
    defense: template.defense,
    xp: template.xp,
    gold: template.gold
  };
}

module.exports = { ENEMY_TEMPLATES, createEnemy };
