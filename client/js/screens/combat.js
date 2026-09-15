let currentEnemy = null;

function initCombatScreen() {
  document.getElementById('btn-attack').addEventListener('click', () => sendCombatAction('attack'));
  document.getElementById('btn-skill').addEventListener('click', () => sendCombatAction('skill'));
  document.getElementById('btn-item').addEventListener('click', () => sendCombatAction('item', 'pocao_vida'));
  document.getElementById('btn-flee').addEventListener('click', () => sendCombatAction('flee'));
}

function enterCombat(enemy, initialLog) {
  currentEnemy = enemy;
  App.inCombat = true;
  showScreen('screen-combat');
  clearLog('combat-log');
  document.getElementById('combat-player-name').textContent = App.character.name;
  document.getElementById('enemy-name').textContent = enemy.name;
  renderCombatBars();
  (initialLog || []).forEach((msg) => logTo('combat-log', msg));
}

function renderCombatBars() {
  const c = App.character;
  setBar('enemy-hp-fill', 'enemy-hp-text', currentEnemy.hp, currentEnemy.maxHp);
  setBar('combat-hp-fill', 'combat-hp-text', c.hp, c.maxHp);
  setBar('combat-mp-fill', 'combat-mp-text', c.mp, c.maxMp);
}

async function sendCombatAction(action, itemId) {
  if (!App.inCombat) return;
  setCombatButtonsDisabled(true);
  const prevHp = App.character.hp;
  const prevEnemyHp = currentEnemy ? currentEnemy.hp : 0;

  try {
    const data = await Api.post('/api/combat/action', { action, itemId });
    (data.log || []).forEach((msg) => logTo('combat-log', msg));

    if (data.enemy) currentEnemy = data.enemy;
    App.character = data.character;

    if (data.enemy && data.enemy.hp < prevEnemyHp) {
      floatingNumber(document.getElementById('enemy-block'), `-${prevEnemyHp - data.enemy.hp}`, false);
      shakeElement(document.getElementById('enemy-block'));
    }
    if (data.character.hp < prevHp) {
      floatingNumber(document.getElementById('player-combat-block'), `-${prevHp - data.character.hp}`, false);
      shakeElement(document.getElementById('player-combat-block'));
    } else if (data.character.hp > prevHp) {
      floatingNumber(document.getElementById('player-combat-block'), `+${data.character.hp - prevHp}`, true);
    }

    renderCombatBars();
    updateHudMini();

    if (!data.inCombat) {
      App.inCombat = false;
      setTimeout(() => {
        showScreen('screen-lobby');
        renderCityView();
      }, 1200);
    }
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    if (App.inCombat) setCombatButtonsDisabled(false);
  }
}

function setCombatButtonsDisabled(disabled) {
  ['btn-attack', 'btn-skill', 'btn-item', 'btn-flee'].forEach((id) => {
    document.getElementById(id).disabled = disabled;
  });
}
