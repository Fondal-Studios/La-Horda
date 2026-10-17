(function () {
  'use strict';
  var pendingPrompt = null;
  var button = document.getElementById('install-app');
  var status = document.getElementById('install-status');
  function installed() {
    pendingPrompt = null;
    button.hidden = true;
    status.textContent = 'La Horda está instalada. Abrila desde su ícono o tocá «Jugar ahora».';
  }
  if (window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches || window.navigator.standalone) installed();
  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    pendingPrompt = event;
    button.hidden = false;
  });
  window.addEventListener('appinstalled', installed);
  button.addEventListener('click', async function () {
    var prompt = pendingPrompt;
    if (!prompt) return;
    pendingPrompt = null;
    button.hidden = true;
    try {
      await prompt.prompt();
      var choice = await prompt.userChoice;
      status.textContent = choice.outcome === 'accepted'
        ? 'Solicitud aceptada. El navegador completará la instalación.'
        : 'Podés seguir jugando desde el navegador e instalarla después desde su menú.';
    } catch (_) {
      status.textContent = 'Usá la opción de instalación del menú del navegador o seguí jugando en la web.';
    }
  });
}());
