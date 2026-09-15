const BASE_STATS = {
  maxHp: 40,
  maxMp: 15,
  attack: 7,
  defense: 2,
  gold: 20
};

const RACES = {
  humano: {
    name: 'Humano',
    mods: { maxHp: 0, maxMp: 0, attack: 0, defense: 0 },
    xpBonus: 0.05,
    lore: 'Nascido entre as ruas movimentadas de Valdora, filho do povo mais numeroso e adaptável da cidade.'
  },
  elfo: {
    name: 'Elfo',
    mods: { maxHp: -8, maxMp: 10, attack: 0, defense: 0 },
    magicPowerBonus: 0.15,
    lore: 'Descendente dos guardiões antigos da Floresta Sombria, com o dom natural para a magia correndo no sangue.'
  },
  anao: {
    name: 'Anão',
    mods: { maxHp: 12, maxMp: -6, attack: 0, defense: 3 },
    lore: 'Criado nas galerias escavadas sob as Ruínas Antigas, forjado para resistir onde outros se quebrariam.'
  },
  orc: {
    name: 'Orc',
    mods: { maxHp: 5, maxMp: -8, attack: 4, defense: 0 },
    magicAccuracyPenalty: 0.2,
    lore: 'Herdeiro de antigas tribos guerreiras, hoje sobrevive como mercenário nas ruas de Valdora.'
  },
  halfling: {
    name: 'Halfling',
    mods: { maxHp: -4, maxMp: 0, attack: -2, defense: 0 },
    evasionBonus: 0.1,
    critBonus: 0.05,
    lore: 'Pequeno, ágil e de passos silenciosos, cresceu esquivando-se de problemas maiores que ele mesmo.'
  },
  sombrio: {
    name: 'Sangue das Sombras',
    mods: { maxHp: -5, maxMp: 0, attack: 0, defense: -2 },
    critBonus: 0.12,
    reputationPenalty: 10,
    lore: 'Descendente de um povo banido, carrega o peso de olhares desconfiados por onde passa.'
  }
};

const CLASSES = {
  guerreiro: {
    name: 'Guerreiro',
    mods: { maxHp: 15, maxMp: -5, attack: 6, defense: 3 },
    startingWeapon: 'Espada e Escudo',
    skill: { id: 'investida', name: 'Investida', mpCost: 5, multiplier: 1.6 },
    lore: 'Aprendeu a empunhar espada e escudo desde jovem, sempre na linha de frente da batalha.'
  },
  mago: {
    name: 'Mago',
    mods: { maxHp: -10, maxMp: 20, attack: 2, defense: -2 },
    startingWeapon: 'Cajado Arcano',
    skill: { id: 'bola_de_fogo', name: 'Bola de Fogo', mpCost: 8, multiplier: 2.2 },
    lore: 'Dedicou anos ao estudo das artes arcanas, trocando força bruta por poder destrutivo.'
  },
  ladino: {
    name: 'Ladino',
    mods: { maxHp: 0, maxMp: 0, attack: 4, defense: -1 },
    critBonus: 0.15,
    evasionBonus: 0.1,
    startingWeapon: 'Adagas Gêmeas',
    skill: { id: 'golpe_furtivo', name: 'Golpe Furtivo', mpCost: 4, multiplier: 1.8 },
    lore: 'Aprendeu a sobreviver nas sombras do Mercado, rápido com as mãos e mais rápido ainda com as adagas.'
  },
  clerigo: {
    name: 'Clérigo',
    mods: { maxHp: 5, maxMp: 10, attack: -2, defense: 2 },
    startingWeapon: 'Cajado Sagrado',
    skill: { id: 'luz_sagrada', name: 'Luz Sagrada', mpCost: 6, healMultiplier: 1.5 },
    lore: 'Devotado aos templos de Valdora, aprendeu a canalizar luz para curar os feridos.'
  },
  cacador: {
    name: 'Caçador',
    mods: { maxHp: 0, maxMp: 5, attack: 5, defense: -1 },
    critBonus: 0.1,
    startingWeapon: 'Arco Longo',
    skill: { id: 'tiro_certeiro', name: 'Tiro Certeiro', mpCost: 5, multiplier: 1.7 },
    lore: 'Treinado nas trilhas ao redor da cidade, confia mais em precisão do que em força bruta.'
  },
  barbaro: {
    name: 'Bárbaro',
    mods: { maxHp: 20, maxMp: -10, attack: 7, defense: -3 },
    startingWeapon: 'Machado de Guerra',
    skill: { id: 'furia', name: 'Fúria', mpCost: 0, multiplier: 1.3, bonusOnLowHp: 1.0 },
    lore: 'Cresceu longe dos muros de Valdora, guiado pela fúria e pela força bruta em cada combate.'
  }
};

const DESTINIES = {
  orfao_guerra: {
    name: 'Órfão de Guerra',
    lowHpDamageBonus: 0.25,
    lore: 'Perdeu tudo ainda criança em um conflito esquecido. Quando a vida se esvai, algo dentro dele desperta com ainda mais força.'
  },
  sangue_nobre: {
    name: 'Sangue Nobre',
    goldBonus: 30,
    shopPriceMultiplier: 1.1,
    lore: 'Nasceu em berço de ouro, mas trocou os salões da nobreza pelas ruas incertas de Valdora.'
  },
  marcado_deuses: {
    name: 'Marcado pelos Deuses',
    rareDropBonus: 0.15,
    strongerEncounterChance: 0.1,
    lore: 'Uma marca estranha em sua pele intriga sacerdotes e assusta supersticiosos. Algo maior o observa.'
  },
  fugitivo: {
    name: 'Fugitivo',
    encounterChanceReduction: 0.15,
    lore: 'Foge de um passado que prefere não revelar. Aprendeu a passar despercebido onde quer que vá.'
  },
  sobrevivente_praga: {
    name: 'Sobrevivente da Praga',
    statusResistance: 0.5,
    maxHpPenalty: 5,
    lore: 'Sobreviveu a uma doença que dizimou sua vila. O corpo ficou mais fraco, mas quase imune a venenos e maldições.'
  },
  escolhido_profecia: {
    name: 'Escolhido da Profecia',
    allStatsBonus: 0.05,
    lore: 'Uma lenda antiga fala de alguém com seu destino. Ele não sabe se deve temer ou abraçar essa profecia.'
  }
};

function ageBracket(age) {
  if (age <= 25) return 'jovem';
  if (age <= 45) return 'adulto';
  return 'idoso';
}

const AGE_MODS = {
  jovem: { maxMp: -3, evasionBonus: 0.02 },
  adulto: {},
  idoso: { maxMp: 5, maxHp: -5 }
};

const GENDER_MODS = {
  masculino: { attack: 1, defense: -1 },
  feminino: { defense: 1, attack: -1 },
  outro: { critBonus: 0.02, attack: -1 }
};

function randomKey(obj) {
  const keys = Object.keys(obj);
  return keys[Math.floor(Math.random() * keys.length)];
}

function rollCharacterTraits() {
  return {
    raceId: randomKey(RACES),
    classId: randomKey(CLASSES),
    destinyId: randomKey(DESTINIES)
  };
}

function computeStats({ raceId, classId, destinyId, age, gender }) {
  const race = RACES[raceId];
  const clazz = CLASSES[classId];
  const destiny = DESTINIES[destinyId];
  const bracket = ageBracket(age);
  const ageMod = AGE_MODS[bracket] || {};
  const genderMod = GENDER_MODS[gender] || {};

  let maxHp = BASE_STATS.maxHp + race.mods.maxHp + clazz.mods.maxHp + (ageMod.maxHp || 0);
  let maxMp = BASE_STATS.maxMp + race.mods.maxMp + clazz.mods.maxMp + (ageMod.maxMp || 0);
  let attack = BASE_STATS.attack + race.mods.attack + clazz.mods.attack + (genderMod.attack || 0);
  let defense = BASE_STATS.defense + race.mods.defense + clazz.mods.defense + (genderMod.defense || 0);
  let gold = BASE_STATS.gold + (destiny.goldBonus || 0);

  if (destiny.maxHpPenalty) maxHp -= destiny.maxHpPenalty;

  const critChance = 0.05 + (race.critBonus || 0) + (clazz.critBonus || 0) + (ageMod.evasionBonus || 0) + (genderMod.critBonus || 0);
  const evasionChance = 0.05 + (race.evasionBonus || 0) + (clazz.evasionBonus || 0);

  if (destiny.allStatsBonus) {
    const mult = 1 + destiny.allStatsBonus;
    maxHp = Math.round(maxHp * mult);
    maxMp = Math.round(maxMp * mult);
    attack = Math.round(attack * mult);
    defense = Math.round(defense * mult);
  }

  maxHp = Math.max(10, Math.round(maxHp));
  maxMp = Math.max(0, Math.round(maxMp));
  attack = Math.max(1, Math.round(attack));
  defense = Math.max(0, Math.round(defense));
  gold = Math.round(gold);

  return { maxHp, maxMp, attack, defense, gold, critChance, evasionChance };
}

function buildHistory({ name, age, gender, raceId, classId, destinyId }) {
  const race = RACES[raceId];
  const clazz = CLASSES[classId];
  const destiny = DESTINIES[destinyId];
  return [
    `${name}, ${age} anos. ${race.lore}`,
    clazz.lore,
    destiny.lore
  ].join(' ');
}

module.exports = {
  BASE_STATS,
  RACES,
  CLASSES,
  DESTINIES,
  ageBracket,
  rollCharacterTraits,
  computeStats,
  buildHistory
};
