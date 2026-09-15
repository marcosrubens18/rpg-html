async function openEventsModal() {
  openModal(`
    <button class="modal-close" onclick="closeModal()">✕</button>
    <h2>Eventos Ativos</h2>
    <div id="events-content"><p>Carregando...</p></div>
  `);

  try {
    const { events } = await Api.get('/api/events');
    const content = document.getElementById('events-content');
    if (!content) return;
    if (events.length === 0) {
      content.innerHTML = '<p>Nenhum evento ativo no momento. Volte mais tarde!</p>';
      return;
    }
    content.innerHTML = `<div class="shop-list">
      ${events.map((ev) => `
        <div class="shop-item">
          <div class="info">
            <strong>${ev.title}</strong>
            <span class="desc">${ev.description || ''}</span>
            <span class="desc">Recompensa: ${ev.reward_gold} 🪙 · ${ev.reward_xp} XP</span>
          </div>
        </div>
      `).join('')}
    </div>`;
  } catch (err) {
    toast(err.message, 'error');
  }
}
