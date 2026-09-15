let pendingCreationResult = null;

function initCharacterCreationScreen() {
  const form = document.getElementById('form-character');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    const name = document.getElementById('char-name').value.trim();
    const age = Number(document.getElementById('char-age').value);
    const gender = document.getElementById('char-gender').value;

    try {
      const data = await Api.post('/api/character', { name, age, gender });
      pendingCreationResult = data;
      form.classList.add('hidden');
      await runRevealSequence(data);
    } catch (err) {
      toast(err.message, 'error');
      submitBtn.disabled = false;
    }
  });

  document.getElementById('btn-start-journey').addEventListener('click', () => {
    App.character = pendingCreationResult.character;
    enterLobby();
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runRevealSequence(data) {
  const sequence = document.getElementById('reveal-sequence');
  sequence.classList.remove('hidden');

  const steps = [
    { cardId: 'reveal-race', label: 'Raça', value: data.race.name },
    { cardId: 'reveal-class', label: 'Classe', value: data.class.name },
    { cardId: 'reveal-destiny', label: 'Destino', value: data.destiny.name }
  ];

  for (const step of steps) {
    await wait(550);
    const card = document.getElementById(step.cardId);
    card.querySelector('.reveal-value').textContent = step.value;
    card.classList.add('revealing');
  }

  await wait(900);
  showCharacterResult(data);
}

function showCharacterResult(data) {
  document.getElementById('reveal-sequence').classList.add('hidden');
  const resultEl = document.getElementById('character-result');
  resultEl.classList.remove('hidden');

  const c = data.character;
  document.getElementById('result-title').textContent =
    `${c.name} — ${data.race.name} ${data.class.name}`;

  document.getElementById('result-stats').innerHTML = `
    <div>❤️ Vida: ${c.maxHp}</div>
    <div>🔵 Mana: ${c.maxMp}</div>
    <div>⚔️ Ataque: ${c.attack}</div>
    <div>🛡️ Defesa: ${c.defense}</div>
    <div>🎯 Crítico: ${Math.round(c.critChance * 100)}%</div>
    <div>💨 Esquiva: ${Math.round(c.evasionChance * 100)}%</div>
    <div>🪙 Ouro: ${c.gold}</div>
    <div>🗡️ Arma: ${data.class.startingWeapon}</div>
  `;

  document.getElementById('result-history').textContent = c.history;
}
