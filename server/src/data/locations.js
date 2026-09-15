const LOCATIONS = {
  praca: {
    id: 'praca',
    name: 'Praça Central',
    description: 'O coração de Valdora. Ruas de pedra se espalham em todas as direções.',
    type: 'hub',
    connections: ['taverna', 'loja', 'ferreiro', 'treinamento', 'guilda', 'arena', 'hospital', 'floresta', 'ruinas']
  },
  taverna: {
    id: 'taverna',
    name: 'Taverna do Javali Dourado',
    description: 'O cheiro de cerveja e lenha queimando enche o ar. Um bom lugar para descansar e ouvir rumores.',
    type: 'rest',
    connections: ['praca']
  },
  loja: {
    id: 'loja',
    name: 'Mercado',
    description: 'Barracas coloridas vendem poções, pergaminhos e suprimentos de aventura.',
    type: 'shop',
    connections: ['praca']
  },
  ferreiro: {
    id: 'ferreiro',
    name: 'Ferreiro',
    description: 'O calor da forja e o som do martelo contra o metal preenchem a oficina.',
    type: 'blacksmith',
    connections: ['praca']
  },
  treinamento: {
    id: 'treinamento',
    name: 'Centro de Treinamento',
    description: 'Bonecos de treino e instrutores experientes ajudam aventureiros a aprimorar suas técnicas.',
    type: 'training',
    connections: ['praca']
  },
  guilda: {
    id: 'guilda',
    name: 'Guilda de Aventureiros',
    description: 'Um mural repleto de contratos e um placar com os aventureiros mais renomados de Valdora.',
    type: 'guild',
    connections: ['praca']
  },
  arena: {
    id: 'arena',
    name: 'Arena PvP',
    description: 'Arquibancadas cercam a arena onde aventureiros provam seu valor uns contra os outros.',
    type: 'pvp',
    connections: ['praca']
  },
  hospital: {
    id: 'hospital',
    name: 'Hospital',
    description: 'Curandeiros tratam ferimentos graves e purgam maldições de quem retorna mal das aventuras.',
    type: 'hospital',
    connections: ['praca']
  },
  floresta: {
    id: 'floresta',
    name: 'Floresta Sombria',
    description: 'Árvores retorcidas bloqueiam a luz do sol. Algo se move entre as sombras.',
    type: 'wild',
    enemies: ['goblin', 'lobo'],
    connections: ['praca']
  },
  ruinas: {
    id: 'ruinas',
    name: 'Ruínas Antigas',
    description: 'Pedras cobertas de musgo guardam segredos de uma civilização esquecida.',
    type: 'wild',
    enemies: ['esqueleto', 'lobo'],
    connections: ['praca']
  }
};

module.exports = { LOCATIONS };
