const ITEMS = {
  pocao_vida: {
    id: 'pocao_vida',
    name: 'Poção de Vida',
    description: 'Restaura 20 pontos de vida.',
    heal: 20,
    price: 10
  },
  pocao_mana: {
    id: 'pocao_mana',
    name: 'Poção de Mana',
    description: 'Restaura 15 pontos de mana.',
    restoreMp: 15,
    price: 12
  },
  antidoto: {
    id: 'antidoto',
    name: 'Antídoto',
    description: 'Remove venenos e maldições leves.',
    cureStatus: true,
    price: 15
  }
};

const EQUIPMENT = {
  espada_curta: { id: 'espada_curta', name: 'Espada Curta', slot: 'weapon', attack: 3, price: 25 },
  armadura_couro: { id: 'armadura_couro', name: 'Armadura de Couro', slot: 'armor', defense: 2, price: 25 },
  amuleto_simples: { id: 'amuleto_simples', name: 'Amuleto Simples', slot: 'accessory', maxHp: 5, price: 20 }
};

module.exports = { ITEMS, EQUIPMENT };
