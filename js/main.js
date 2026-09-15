const SAVE_KEY = 'valdora-save';

const state = {
  player: null
};

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state.player));
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function startNewGame() {
  state.player = createPlayer('Aventureiro');
  clearLog('exploration-log');
  logTo('exploration-log', 'Sua jornada em Valdora começa.');
  renderExploration();
  saveGame();
}

function continueGame() {
  const saved = loadGame();
  if (!saved) return;
  state.player = saved;
  clearLog('exploration-log');
  logTo('exploration-log', 'Bem-vindo de volta a Valdora.');
  renderExploration();
}

document.getElementById('btn-new-game').addEventListener('click', startNewGame);
document.getElementById('btn-continue').addEventListener('click', continueGame);
document.getElementById('btn-continue').disabled = !loadGame();

document.getElementById('btn-attack').addEventListener('click', playerAttack);
document.getElementById('btn-skill').addEventListener('click', playerSkill);
document.getElementById('btn-item').addEventListener('click', playerUseItem);
document.getElementById('btn-flee').addEventListener('click', playerFlee);

window.addEventListener('beforeunload', () => {
  if (state.player) saveGame();
});
