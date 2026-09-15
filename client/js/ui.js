function showScreen(id) {
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function logTo(containerId, message) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const line = document.createElement('p');
  line.textContent = message;
  container.appendChild(line);
  container.scrollTop = container.scrollHeight;
}

function clearLog(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = '';
}

function setBar(fillId, textId, current, max) {
  const fill = document.getElementById(fillId);
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  fill.style.width = pct + '%';
  fill.classList.remove('pulse');
  void fill.offsetWidth;
  fill.classList.add('pulse');
  if (textId) {
    document.getElementById(textId).textContent = `${Math.max(0, Math.round(current))} / ${Math.round(max)}`;
  }
}

function toast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type === 'error' ? 'error' : ''}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3800);
}

function shakeElement(el) {
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
}

function floatingNumber(anchorEl, text, isHeal) {
  if (!anchorEl) return;
  const el = document.createElement('span');
  el.className = `floating-damage ${isHeal ? 'heal' : ''}`;
  el.textContent = text;
  const rect = anchorEl.getBoundingClientRect();
  el.style.position = 'fixed';
  el.style.left = `${rect.left + rect.width / 2 - 10}px`;
  el.style.top = `${rect.top}px`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('animate'));
  setTimeout(() => el.remove(), 950);
}

function spawnEmbers() {
  const layer = document.getElementById('ember-layer');
  if (!layer) return;
  const count = 18;
  for (let i = 0; i < count; i++) {
    const ember = document.createElement('div');
    ember.className = 'ember';
    ember.style.left = Math.random() * 100 + 'vw';
    ember.style.animationDuration = (8 + Math.random() * 10) + 's';
    ember.style.animationDelay = (Math.random() * 12) + 's';
    ember.style.opacity = String(0.3 + Math.random() * 0.5);
    layer.appendChild(ember);
  }
}

function openModal(html) {
  document.getElementById('modal-box').innerHTML = html;
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('modal-box').innerHTML = '';
}

document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target.id === 'modal-overlay') closeModal();
});
