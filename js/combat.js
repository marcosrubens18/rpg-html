let combatState = null;

function startCombat(enemyTemplateId, onEnd) {
  combatState = {
    enemy: createEnemy(enemyTemplateId),
    onEnd,
    playerTurn: true
  };
  clearLog('combat-log');
  showScreen('screen-combat');
  document.getElementById('combat-player-name').textContent = state.player.name;
  document.getElementById('enemy-name').textContent = combatState.enemy.name;
  renderCombat();
  logTo('combat-log', `Um ${combatState.enemy.name} apareceu!`);
}

function renderCombat() {
  const player = state.player;
  const enemy = combatState.enemy;
  setBar('enemy-hp-fill', 'enemy-hp-text', enemy.hp, enemy.maxHp);
  setBar('combat-hp-fill', 'combat-hp-text', player.hp, player.maxHp);
  setBar('combat-mp-fill', 'combat-mp-text', player.mp, player.maxMp);
  document.getElementById('btn-skill').disabled = player.mp < 5;
}

function playerAttack() {
  if (!combatState) return;
  const player = state.player;
  const enemy = combatState.enemy;
  const damage = Math.max(1, player.attack - enemy.defense + rollVariance());
  enemy.hp -= damage;
  logTo('combat-log', `${player.name} atacou e causou ${damage} de dano.`);
  afterPlayerAction();
}

function playerSkill() {
  if (!combatState) return;
  const player = state.player;
  const enemy = combatState.enemy;
  if (player.mp < 5) return;
  player.mp -= 5;
  const damage = Math.max(1, Math.round(player.attack * 1.8) - enemy.defense + rollVariance());
  enemy.hp -= damage;
  logTo('combat-log', `${player.name} usou Golpe Poderoso e causou ${damage} de dano.`);
  afterPlayerAction();
}

function playerUseItem() {
  if (!combatState) return;
  const player = state.player;
  const item = useItem(player, 'pocao_vida');
  if (!item) {
    logTo('combat-log', 'Você não tem Poções de Vida.');
    return;
  }
  logTo('combat-log', `${player.name} usou ${item.name} e recuperou vida.`);
  afterPlayerAction();
}

function playerFlee() {
  if (!combatState) return;
  const success = Math.random() < 0.6;
  if (success) {
    logTo('combat-log', 'Você fugiu do combate.');
    endCombat(false);
  } else {
    logTo('combat-log', 'Você tentou fugir, mas não conseguiu.');
    enemyTurn();
  }
}

function afterPlayerAction() {
  renderCombat();
  if (combatState.enemy.hp <= 0) {
    winCombat();
    return;
  }
  enemyTurn();
}

function enemyTurn() {
  const player = state.player;
  const enemy = combatState.enemy;
  const damage = Math.max(1, enemy.attack - player.defense + rollVariance());
  player.hp -= damage;
  logTo('combat-log', `${enemy.name} atacou e causou ${damage} de dano.`);
  renderCombat();
  updateHud(player);
  if (player.hp <= 0) {
    loseCombat();
  }
}

function rollVariance() {
  return Math.floor(Math.random() * 3) - 1;
}

function winCombat() {
  const player = state.player;
  const enemy = combatState.enemy;
  logTo('combat-log', `Você derrotou ${enemy.name}!`);
  logTo('combat-log', `Ganhou ${enemy.xp} de XP e ${enemy.gold} de ouro.`);
  player.gold += enemy.gold;
  const levelUpMessages = gainXp(player, enemy.xp);
  levelUpMessages.forEach(msg => logTo('combat-log', msg));
  updateHud(player);
  endCombat(true);
}

function loseCombat() {
  logTo('combat-log', `${state.player.name} foi derrotado...`);
  state.player.hp = Math.max(1, Math.round(state.player.maxHp * 0.3));
  state.player.currentLocation = 'praca';
  updateHud(state.player);
  endCombat(false);
}

function endCombat(victory) {
  const callback = combatState.onEnd;
  combatState = null;
  setTimeout(() => {
    if (callback) callback(victory);
  }, 1200);
}
