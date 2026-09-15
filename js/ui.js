function showScreen(id) {
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function logTo(containerId, message) {
  const container = document.getElementById(containerId);
  const line = document.createElement('p');
  line.textContent = message;
  container.appendChild(line);
  container.scrollTop = container.scrollHeight;
}

function clearLog(containerId) {
  document.getElementById(containerId).innerHTML = '';
}

function setBar(fillId, textId, current, max) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  document.getElementById(fillId).style.width = pct + '%';
  document.getElementById(textId).textContent = `${Math.max(0, current)} / ${max}`;
}

function updateHud(player) {
  document.getElementById('hud-name').textContent = player.name;
  document.getElementById('hud-level').textContent = `Nível ${player.level}`;
  setBar('hud-hp-fill', 'hud-hp-text', player.hp, player.maxHp);
  setBar('hud-mp-fill', 'hud-mp-text', player.mp, player.maxMp);
}
