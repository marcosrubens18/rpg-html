const LOCATION_ICONS = {
  praca: '🏛️', taverna: '🍺', loja: '🛒', ferreiro: '⚒️',
  treinamento: '🥋', guilda: '📜', arena: '⚔️', hospital: '➕',
  floresta: '🌲', ruinas: '🏚️'
};

function initLobbyScreen() {
  document.getElementById('nav-perfil').addEventListener('click', openProfileModal);
  document.getElementById('nav-eventos').addEventListener('click', openEventsModal);
  document.getElementById('nav-admin').addEventListener('click', openAdminModal);
  document.getElementById('nav-logout').addEventListener('click', logout);
}

function enterLobby() {
  showScreen('screen-lobby');
  document.getElementById('nav-admin').classList.toggle('hidden', !isAdmin());
  clearLog('lobby-log');
  updateHudMini();
  renderCityView();
}

function updateHudMini() {
  const c = App.character;
  document.getElementById('hud-mini-name').textContent = `${c.name} (Nv. ${c.level})`;
  setBar('hud-mini-hp-fill', null, c.hp, c.maxHp);
  setBar('hud-mini-mp-fill', null, c.mp, c.maxMp);
  document.getElementById('hud-mini-gold').textContent = `${c.gold} 🪙`;
}

function renderCityView() {
  const mapEl = document.getElementById('city-map');
  const panelEl = document.getElementById('location-panel');
  const locations = App.meta.locations;
  const current = locations[App.character.location];

  if (current.type === 'hub') {
    panelEl.classList.add('hidden');
    panelEl.innerHTML = '';
    mapEl.classList.remove('hidden');

    document.getElementById('location-title').textContent = `${LOCATION_ICONS[current.id] || ''} ${current.name}`;
    document.getElementById('location-description').textContent = current.description;

    const grid = document.getElementById('location-grid');
    grid.innerHTML = '';
    current.connections.forEach((targetId) => {
      const target = locations[targetId];
      const card = document.createElement('div');
      card.className = 'location-card';
      card.innerHTML = `<span class="icon">${LOCATION_ICONS[targetId] || '📍'}</span><span class="name">${target.name}</span>`;
      card.addEventListener('click', () => travelTo(targetId));
      grid.appendChild(card);
    });
  } else {
    mapEl.classList.add('hidden');
    panelEl.classList.remove('hidden');
    renderLocationPanel(current);
  }
}

async function travelTo(targetId) {
  try {
    const data = await Api.post('/api/location/travel', { to: targetId });
    App.character = data.character;
    updateHudMini();
    logTo('lobby-log', `Você viajou para ${data.location.name}.`);
    renderCityView();
  } catch (err) {
    toast(err.message, 'error');
  }
}

function backToPraca() {
  travelTo('praca');
}

function refreshCharacter(character) {
  App.character = character;
  updateHudMini();
}
