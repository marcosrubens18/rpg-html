(async function bootstrap() {
  spawnEmbers();
  initAuthScreen();
  initCharacterCreationScreen();
  initLobbyScreen();
  initCombatScreen();

  const loggedIn = await tryAutoLogin();
  if (!loggedIn) {
    showScreen('screen-auth');
  }
})();
