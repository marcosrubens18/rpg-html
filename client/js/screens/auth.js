function initAuthScreen() {
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const errorEl = document.getElementById('auth-error');

  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    formLogin.classList.remove('hidden');
    formRegister.classList.add('hidden');
    errorEl.textContent = '';
  });

  tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    formRegister.classList.remove('hidden');
    formLogin.classList.add('hidden');
    errorEl.textContent = '';
  });

  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    try {
      const data = await Api.post('/api/auth/login', { username, password });
      setToken(data.token);
      App.user = data.user;
      await afterLogin(data.hasCharacter);
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });

  formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const adminCode = document.getElementById('register-admin-code').value;
    try {
      const data = await Api.post('/api/auth/register', { username, password, adminCode: adminCode || undefined });
      setToken(data.token);
      App.user = data.user;
      await afterLogin(false);
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
}

async function afterLogin(hasCharacter) {
  App.meta = (await Api.get('/api/meta'));
  if (hasCharacter) {
    const data = await Api.get('/api/character/me');
    App.character = data.character;
    enterLobby();
  } else {
    showScreen('screen-character-creation');
  }
}

async function tryAutoLogin() {
  if (!App.token) return false;
  try {
    const me = await Api.get('/api/auth/me');
    App.user = me.user;
    App.meta = await Api.get('/api/meta');

    if (me.hasCharacter) {
      const data = await Api.get('/api/character/me');
      App.character = data.character;
      enterLobby();
    } else {
      showScreen('screen-character-creation');
    }
    return true;
  } catch (err) {
    setToken(null);
    return false;
  }
}

function logout() {
  setToken(null);
  App.user = null;
  App.character = null;
  showScreen('screen-auth');
}
