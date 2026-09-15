const AudioManager = (() => {
  let started = false;
  let muted = localStorage.getItem('valdora_muted') === 'true';
  let usingFile = false;
  let ctx = null;
  let masterGain = null;
  const bgmEl = document.getElementById('bgm');
  const btn = document.getElementById('btn-music-toggle');

  function updateButton() {
    btn.textContent = muted ? '🔇' : '🔈';
  }

  function tryLoadFile() {
    return new Promise((resolve) => {
      bgmEl.src = 'assets/audio/bgm.mp3';
      bgmEl.volume = 0.35;
      const onError = () => { bgmEl.removeEventListener('error', onError); resolve(false); };
      const onCanPlay = () => { bgmEl.removeEventListener('canplaythrough', onCanPlay); resolve(true); };
      bgmEl.addEventListener('error', onError, { once: true });
      bgmEl.addEventListener('canplaythrough', onCanPlay, { once: true });
      bgmEl.load();
    });
  }

  function startAmbientSynth() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : 0.05;
    masterGain.connect(ctx.destination);

    const notes = [98, 123.47, 146.83, 196];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      gain.gain.value = 0.25;

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05 + i * 0.02;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.12;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
    });
  }

  async function start() {
    if (started) return;
    started = true;
    usingFile = await tryLoadFile();
    if (usingFile) {
      bgmEl.muted = muted;
      bgmEl.play().catch(() => {});
    } else {
      startAmbientSynth();
    }
    updateButton();
  }

  function toggleMute() {
    muted = !muted;
    localStorage.setItem('valdora_muted', String(muted));
    if (usingFile) {
      bgmEl.muted = muted;
    } else if (masterGain) {
      masterGain.gain.value = muted ? 0 : 0.05;
    }
    updateButton();
  }

  btn.addEventListener('click', async () => {
    await start();
    toggleMute();
  });

  updateButton();

  return { start };
})();

document.addEventListener('click', () => AudioManager.start(), { once: true });
