function renderLocationPanel(location) {
  const panel = document.getElementById('location-panel');
  const renderers = {
    rest: renderTaverna,
    shop: renderLoja,
    blacksmith: renderFerreiro,
    training: renderTreinamento,
    guild: renderGuilda,
    pvp: renderArena,
    hospital: renderHospital,
    wild: renderWild
  };

  const renderer = renderers[location.type] || renderGeneric;
  panel.innerHTML = `
    <button class="back-btn" onclick="backToPraca()">← Voltar à Praça Central</button>
    <h2>${LOCATION_ICONS[location.id] || ''} ${location.name}</h2>
    <p>${location.description}</p>
    <div id="location-content"></div>
  `;
  renderer(location, document.getElementById('location-content'));
}

function renderGeneric(location, container) {
  container.innerHTML = '<p>Em construção...</p>';
}

function renderTaverna(location, container) {
  container.innerHTML = `<button id="btn-rest" class="btn-primary">Descansar (recupera vida e mana)</button>`;
  document.getElementById('btn-rest').addEventListener('click', async () => {
    try {
      const data = await Api.post('/api/location/rest');
      refreshCharacter(data.character);
      toast('Você descansou e recuperou suas forças.');
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}

async function renderLoja(location, container) {
  container.innerHTML = '<p>Carregando mercadorias...</p>';
  try {
    const { items } = await Api.get('/api/shop/catalog');
    container.innerHTML = `<div class="shop-list">${items.map(itemRowHtml).join('')}</div>`;
    wireShopButtons(container);
  } catch (err) {
    toast(err.message, 'error');
  }
}

async function renderFerreiro(location, container) {
  container.innerHTML = '<p>Carregando equipamentos...</p>';
  try {
    const { equipment } = await Api.get('/api/shop/catalog');
    container.innerHTML = `<div class="shop-list">${equipment.map(itemRowHtml).join('')}</div>`;
    wireShopButtons(container);
  } catch (err) {
    toast(err.message, 'error');
  }
}

function itemRowHtml(item) {
  const owned = App.character.inventory[item.id] || 0;
  return `
    <div class="shop-item">
      <div class="info">
        <strong>${item.name}</strong>
        <span class="desc">${item.description || ''} ${item.attack ? `+${item.attack} Ataque` : ''}${item.defense ? `+${item.defense} Defesa` : ''}${item.maxHp ? `+${item.maxHp} Vida` : ''}</span>
        <span class="desc">Você tem: ${owned}</span>
      </div>
      <div>
        <button data-buy="${item.id}">Comprar (${item.price} 🪙)</button>
        ${owned > 0 ? `<button data-sell="${item.id}">Vender</button>` : ''}
      </div>
    </div>
  `;
}

function wireShopButtons(container) {
  container.querySelectorAll('[data-buy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        const data = await Api.post('/api/shop/buy', { itemId: btn.dataset.buy });
        refreshCharacter(data.character);
        toast(`Comprou ${data.bought}.`);
        renderCityView();
      } catch (err) {
        toast(err.message, 'error');
      }
    });
  });
  container.querySelectorAll('[data-sell]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        const data = await Api.post('/api/shop/sell', { itemId: btn.dataset.sell });
        refreshCharacter(data.character);
        toast(`Vendeu ${data.sold} por ${data.sellPrice} 🪙.`);
        renderCityView();
      } catch (err) {
        toast(err.message, 'error');
      }
    });
  });
}

function renderTreinamento(location, container) {
  const c = App.character;
  container.innerHTML = `
    <p>Pontos de atributo disponíveis: <strong>${c.attributePoints}</strong></p>
    <div class="shop-list">
      ${trainingRowHtml('attack', 'Ataque (+1)')}
      ${trainingRowHtml('defense', 'Defesa (+1)')}
      ${trainingRowHtml('maxHp', 'Vida Máxima (+3)')}
      ${trainingRowHtml('maxMp', 'Mana Máxima (+2)')}
    </div>
  `;
  container.querySelectorAll('[data-stat]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        const data = await Api.post('/api/training/allocate', { stat: btn.dataset.stat });
        refreshCharacter(data.character);
        renderCityView();
      } catch (err) {
        toast(err.message, 'error');
      }
    });
  });
}

function trainingRowHtml(stat, label) {
  const disabled = App.character.attributePoints < 1 ? 'disabled' : '';
  return `
    <div class="shop-item">
      <div class="info"><strong>${label}</strong></div>
      <button data-stat="${stat}" ${disabled}>Treinar</button>
    </div>
  `;
}

async function renderGuilda(location, container) {
  container.innerHTML = '<p>Carregando ranking...</p>';
  try {
    const { ranking } = await Api.get('/api/guild/ranking');
    container.innerHTML = `
      <h3>Ranking de Aventureiros</h3>
      <div class="shop-list">
        ${ranking.map((r, i) => `
          <div class="shop-item">
            <div class="info">
              <strong>#${i + 1} ${r.name}</strong>
              <span class="desc">${r.race} ${r.class} — Nível ${r.level}</span>
            </div>
            <div>${r.gold} 🪙</div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    toast(err.message, 'error');
  }
}

async function renderArena(location, container) {
  container.innerHTML = '<p>Buscando oponentes...</p>';
  try {
    const { opponents } = await Api.get('/api/pvp/opponents');
    if (opponents.length === 0) {
      container.innerHTML = '<p>Nenhum outro aventureiro disponível para duelo agora.</p>';
      return;
    }
    container.innerHTML = `
      <div class="shop-list">
        ${opponents.map((o) => `
          <div class="shop-item">
            <div class="info">
              <strong>${o.name}</strong>
              <span class="desc">Nível ${o.level} · ${o.pvp_wins}V / ${o.pvp_losses}D</span>
            </div>
            <button data-challenge="${o.user_id}">Desafiar</button>
          </div>
        `).join('')}
      </div>
    `;
    container.querySelectorAll('[data-challenge]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          const data = await Api.post('/api/pvp/challenge', { opponentUserId: Number(btn.dataset.challenge) });
          refreshCharacter(data.character);
          openModal(`
            <h2>${data.youWon ? 'Vitória!' : 'Derrota'}</h2>
            <div class="log" style="height:180px">${data.log.map(l => `<p>${l}</p>`).join('')}</div>
            ${data.youWon ? `<p>Você ganhou ${data.rewardGold} 🪙</p>` : ''}
            <button class="btn-primary modal-close" onclick="closeModal()">Fechar</button>
          `);
        } catch (err) {
          toast(err.message, 'error');
        }
      });
    });
  } catch (err) {
    toast(err.message, 'error');
  }
}

function renderHospital(location, container) {
  container.innerHTML = `
    <p>Tratamento completo: cura toda a vida, mana e remove efeitos negativos por 15 🪙.</p>
    <button id="btn-treat" class="btn-primary">Tratar-se</button>
  `;
  document.getElementById('btn-treat').addEventListener('click', async () => {
    try {
      const data = await Api.post('/api/hospital/treat');
      refreshCharacter(data.character);
      toast('Você foi tratado pelos curandeiros.');
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}

function renderWild(location, container) {
  container.innerHTML = `<button id="btn-explore" class="btn-primary">🗡️ Explorar</button>`;
  document.getElementById('btn-explore').addEventListener('click', async () => {
    try {
      const data = await Api.post('/api/combat/encounter');
      if (data.inCombat) {
        enterCombat(data.enemy, data.log);
      } else {
        toast('Você explorou a área, mas nada aconteceu desta vez.');
      }
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}
