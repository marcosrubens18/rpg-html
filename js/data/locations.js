const LOCATIONS = {
  praca: {
    id: 'praca',
    name: 'Praça Central',
    description: 'O coração de Valdora. Ruas de pedra se espalham em todas as direções.',
    wild: false,
    connections: ['mercado', 'taverna', 'floresta', 'ruinas']
  },
  mercado: {
    id: 'mercado',
    name: 'Mercado',
    description: 'Barracas coloridas vendem de tudo, de poções a espadas enferrujadas.',
    wild: false,
    connections: ['praca']
  },
  taverna: {
    id: 'taverna',
    name: 'Taverna do Javali Dourado',
    description: 'O cheiro de cerveja e lenha queimando enche o ar. Um bom lugar para descansar.',
    wild: false,
    connections: ['praca']
  },
  floresta: {
    id: 'floresta',
    name: 'Floresta Sombria',
    description: 'Árvores retorcidas bloqueiam a luz do sol. Algo se move entre as sombras.',
    wild: true,
    enemies: ['goblin', 'lobo'],
    connections: ['praca']
  },
  ruinas: {
    id: 'ruinas',
    name: 'Ruínas Antigas',
    description: 'Pedras cobertas de musgo guardam segredos de uma civilização esquecida.',
    wild: true,
    enemies: ['esqueleto', 'lobo'],
    connections: ['praca']
  }
};
