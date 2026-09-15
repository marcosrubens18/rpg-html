let profileTab = 'ficha';

function openProfileModal() {
  profileTab = 'ficha';
  renderProfileModal();
}

function renderProfileModal() {
  openModal(`
    <button class="modal-close" onclick="closeModal()">✕</button>
    <h2>Perfil</h2>
    <div class="tabs-row">
      <button data-tab="ficha" class="${profileTab === 'ficha' ? 'active' : ''}">Ficha</button>
      <button data-tab="inventario" class="${profileTab === 'inventario' ? 'active' : ''}">Inventário</button>
      <button data-tab="setup" class="${profileTab === 'setup' ? 'active' : ''}">Setup</button>
    </div>
    <div id="profile-tab-content"></div>
  `);

  document.querySelectorAll('#modal-box [data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      profileTab = btn.dataset.tab;
      renderProfileModal();
    });
  });

  const content = document.getElementById('profile-tab-content');
  if (profileTab === 'ficha') renderFichaTab(content);
  if (profileTab === 'inventario') renderInventarioTab(content);
  if (profileTab === 'setup') renderSetupTab(content);
}

function renderFichaTab(container) {
  const c = App.character;
  const race = App.meta.races[c.raceId];
  const clazz = App.meta.classes[c.classId];
  const destiny = App.meta.destinies[c.destinyId];

  container.innerHTML = `
    <h3>${c.name}</h3>
    <p>${race.name} ${clazz.name} · Nível ${c.level} · Destino: ${destiny.name}</p>
    <div class="stat-grid">
      <div>❤️ Vida: ${c.hp} / ${c.maxHp}</div>
      <div>🔵 Mana: ${c.mp} / ${c.maxMp}</div>
      <div>⚔️ Ataque: ${c.attack}</div>
      <div>🛡️ Defesa: ${c.defense}</div>
      <div>🎯 Crítico: ${Math.round(c.critChance * 100)}%</div>
      <div>💨 Esquiva: ${Math.round(c.evasionChance * 100)}%</div>
      <div>✨ XP: ${c.xp} / ${c.xpToNext}</div>
      <div>🪙 Ouro: ${c.gold}</div>
      <div>🧬 Pontos de atributo: ${c.attributePoints}</div>
    </div>
    <p class="history-text">${c.history}</p>
  `;
}

function renderInventarioTab(container) {
  const c = App.character;
  const entries = Object.entries(c.inventory);
  if (entries.length === 0) {
    container.innerHTML = '<p>Seu inventário está vazio.</p>';
    return;
  }
  container.innerHTML = `<div class="inventory-grid">
    ${entries.map(([id, qty]) => {
      const item = App.meta.items[id] || App.meta.equipment[id];
      if (!item) return '';
      return `<div class="inventory-slot"><strong>${item.name}</strong><br>x${qty}</div>`;
    }).join('')}
  </div>`;
}

function renderSetupTab(container) {
  const c = App.character;
  const slots = ['weapon', 'armor', 'accessory'];
  const slotLabels = { weapon: 'Arma', armor: 'Armadura', accessory: 'Acessório' };

  container.innerHTML = `<div class="equip-slots">
    ${slots.map((slot) => {
      const equippedId = c.equipment[slot];
      const equippedItem = equippedId ? App.meta.equipment[equippedId] : null;
      const options = Object.values(App.meta.equipment)
        .filter((item) => item.slot === slot && c.inventory[item.id] > 0);

      return `
        <div class="equip-slot">
          <strong>${slotLabels[slot]}</strong>
          <p>${equippedItem ? equippedItem.name : 'Vazio'}</p>
          <select data-slot="${slot}">
            <option value="">Nenhum</option>
            ${options.map((item) => `<option value="${item.id}" ${equippedId === item.id ? 'selected' : ''}>${item.name}</option>`).join('')}
          </select>
        </div>
      `;
    }).join('')}
  </div>
  <button id="btn-save-setup" class="btn-primary">Salvar Equipamento</button>`;

  document.getElementById('btn-save-setup').addEventListener('click', async () => {
    const equipment = {};
    container.querySelectorAll('[data-slot]').forEach((select) => {
      if (select.value) equipment[select.dataset.slot] = select.value;
    });
    try {
      const data = await Api.patch('/api/character/setup', { equipment });
      refreshCharacter(data.character);
      toast('Equipamento atualizado.');
      renderProfileModal();
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}
