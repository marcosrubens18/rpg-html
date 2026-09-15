let adminTab = 'eventos';

function openAdminModal() {
  adminTab = 'eventos';
  renderAdminModal();
}

function renderAdminModal() {
  openModal(`
    <button class="modal-close" onclick="closeModal()">✕</button>
    <h2>Administração</h2>
    <div class="tabs-row">
      <button data-admin-tab="eventos" class="${adminTab === 'eventos' ? 'active' : ''}">Eventos</button>
      <button data-admin-tab="jogadores" class="${adminTab === 'jogadores' ? 'active' : ''}">Jogadores</button>
    </div>
    <div id="admin-tab-content"><p>Carregando...</p></div>
  `);

  document.querySelectorAll('#modal-box [data-admin-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      adminTab = btn.dataset.adminTab;
      renderAdminModal();
    });
  });

  const content = document.getElementById('admin-tab-content');
  if (adminTab === 'eventos') renderAdminEventsTab(content);
  if (adminTab === 'jogadores') renderAdminUsersTab(content);
}

async function renderAdminEventsTab(container) {
  try {
    const { events } = await Api.get('/api/admin/events');
    container.innerHTML = `
      <form id="form-new-event" class="auth-form">
        <label>Título<input type="text" id="event-title" required></label>
        <label>Descrição<input type="text" id="event-description"></label>
        <label>Recompensa em Ouro<input type="number" id="event-gold" value="0"></label>
        <label>Recompensa em XP<input type="number" id="event-xp" value="0"></label>
        <button type="submit" class="btn-primary">Criar Evento</button>
      </form>
      <div class="shop-list" style="margin-top:16px">
        ${events.map((ev) => `
          <div class="shop-item">
            <div class="info">
              <strong>${ev.title} ${ev.active ? '' : '(inativo)'}</strong>
              <span class="desc">${ev.description || ''}</span>
              <span class="desc">${ev.reward_gold} 🪙 · ${ev.reward_xp} XP</span>
            </div>
            <div>
              <button data-toggle-event="${ev.id}" data-active="${ev.active}">${ev.active ? 'Encerrar' : 'Reativar'}</button>
              <button data-delete-event="${ev.id}">Excluir</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    document.getElementById('form-new-event').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await Api.post('/api/admin/events', {
          title: document.getElementById('event-title').value,
          description: document.getElementById('event-description').value,
          rewardGold: Number(document.getElementById('event-gold').value),
          rewardXp: Number(document.getElementById('event-xp').value)
        });
        toast('Evento criado.');
        renderAdminEventsTab(container);
      } catch (err) {
        toast(err.message, 'error');
      }
    });

    container.querySelectorAll('[data-toggle-event]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await Api.patch(`/api/admin/events/${btn.dataset.toggleEvent}`, { active: btn.dataset.active === '0' });
          renderAdminEventsTab(container);
        } catch (err) {
          toast(err.message, 'error');
        }
      });
    });

    container.querySelectorAll('[data-delete-event]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await Api.del(`/api/admin/events/${btn.dataset.deleteEvent}`);
          renderAdminEventsTab(container);
        } catch (err) {
          toast(err.message, 'error');
        }
      });
    });
  } catch (err) {
    toast(err.message, 'error');
  }
}

async function renderAdminUsersTab(container) {
  try {
    const { users } = await Api.get('/api/admin/users');
    container.innerHTML = `<div class="shop-list">
      ${users.map((u) => `
        <div class="shop-item">
          <div class="info">
            <strong>${u.username} ${u.role === 'admin' ? '(admin)' : ''}</strong>
            <span class="desc">${u.character_name ? `${u.character_name} · Nível ${u.level}` : 'Sem personagem'}</span>
            <span class="desc">${u.banned_permanently ? 'BANIDO PERMANENTE' : (u.banned_until ? `Banido até ${u.banned_until}` : 'Ativo')}</span>
          </div>
          <div>
            ${u.role !== 'admin' ? `
              <select data-punish-type="${u.id}">
                <option value="aviso">Aviso</option>
                <option value="mute">Mute</option>
                <option value="ban_temp">Ban Temporário (24h)</option>
                <option value="ban_perm">Ban Permanente</option>
              </select>
              <button data-punish="${u.id}">Aplicar</button>
              ${(u.banned_until || u.banned_permanently) ? `<button data-pardon="${u.id}">Perdoar</button>` : ''}
            ` : ''}
          </div>
        </div>
      `).join('')}
    </div>`;

    container.querySelectorAll('[data-punish]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.punish;
        const type = container.querySelector(`[data-punish-type="${id}"]`).value;
        const reason = prompt('Motivo da punição:') || '';
        try {
          await Api.post(`/api/admin/users/${id}/punish`, { type, reason, durationHours: 24 });
          toast('Punição aplicada.');
          renderAdminUsersTab(container);
        } catch (err) {
          toast(err.message, 'error');
        }
      });
    });

    container.querySelectorAll('[data-pardon]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await Api.post(`/api/admin/users/${btn.dataset.pardon}/pardon`);
          toast('Usuário perdoado.');
          renderAdminUsersTab(container);
        } catch (err) {
          toast(err.message, 'error');
        }
      });
    });
  } catch (err) {
    toast(err.message, 'error');
  }
}
