function goToLocation(locationId) {
  state.player.currentLocation = locationId;
  renderExploration();
}

function renderExploration() {
  const location = LOCATIONS[state.player.currentLocation];
  showScreen('screen-exploration');
  updateHud(state.player);

  document.getElementById('location-name').textContent = location.name;
  document.getElementById('location-description').textContent = location.description;

  const actionsEl = document.getElementById('location-actions');
  actionsEl.innerHTML = '';

  location.connections.forEach(targetId => {
    const target = LOCATIONS[targetId];
    const btn = document.createElement('button');
    btn.textContent = `Ir para ${target.name}`;
    btn.addEventListener('click', () => {
      goToLocation(targetId);
      logTo('exploration-log', `Você viajou para ${target.name}.`);
      if (target.wild) {
        maybeTriggerEncounter(target);
      }
    });
    actionsEl.appendChild(btn);
  });

  if (location.id === 'taverna') {
    const restBtn = document.createElement('button');
    restBtn.textContent = 'Descansar (recupera vida e mana)';
    restBtn.addEventListener('click', () => {
      state.player.hp = state.player.maxHp;
      state.player.mp = state.player.maxMp;
      updateHud(state.player);
      logTo('exploration-log', 'Você descansou e recuperou suas forças.');
    });
    actionsEl.appendChild(restBtn);
  }
}

function maybeTriggerEncounter(location) {
  const chance = 0.55;
  if (Math.random() > chance) return;
  const enemyId = location.enemies[Math.floor(Math.random() * location.enemies.length)];
  startCombat(enemyId, (victory) => {
    renderExploration();
  });
}
