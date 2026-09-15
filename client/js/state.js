const App = {
  token: localStorage.getItem('valdora_token') || null,
  user: null,
  character: null,
  meta: null,
  currentLocationId: 'praca',
  inCombat: false
};

function setToken(token) {
  App.token = token;
  if (token) localStorage.setItem('valdora_token', token);
  else localStorage.removeItem('valdora_token');
}

function isAdmin() {
  return App.user && App.user.role === 'admin';
}
