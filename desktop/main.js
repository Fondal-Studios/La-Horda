'use strict';
/* Contenedor de escritorio de La Horda (Electron) para Steam.
 * ESTADO: escrito y revisado con `node --check`; el binario NO se construyó ni se probó (ni Windows, ni Linux, ni Steam Deck).
 * Ver LEEME.md y docs/steam/README.md.
 *
 *  - Origen fijo app://lahorda/ (url-policy.js): ni file:// ni localhost; el guardado (localStorage) depende del origen.
 *  - Ventana 1280x720 redimensionable; F11 y Alt+Enter alternan pantalla completa; sin menú de aplicación.
 *  - En producción (app.isPackaged) no hay DevTools ni recarga, y los parámetros de desarrollo no se pueden activar.
 *  - Navegación externa (https / mailto) -> navegador del sistema. Todo lo demás se niega.
 *  - Guardado: espejo de localStorage a userData/saves/ (save-mirror.js) para Steam Cloud.
 */
const {app, BrowserWindow, protocol, net, shell, ipcMain, Menu, session} = require('electron');
const path = require('node:path'), fs = require('node:fs'), os = require('node:os'), {pathToFileURL} = require('node:url');
const P = require('./url-policy'), M = require('./save-mirror');

// Empaquetado: el juego va SUELTO en resources/game (extraResources); en desarrollo, desktop/game (lo arma stage.mjs).
const GAME_ROOT = app.isPackaged ? path.join(process.resourcesPath, 'game') : path.join(__dirname, 'game');
const SAVE_DIR = () => path.join(app.getPath('userData'), 'saves');
const PROD = app.isPackaged;

protocol.registerSchemesAsPrivileged([{scheme: P.SCHEME, privileges: {standard: true, secure: true, supportFetchAPI: true, stream: true, codeCache: true}}]);
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');   // WebAudio sin esperar un clic
// Overlay de Steam sobre Chromium (NO VERIFICADO): solo si el proceso fue lanzado por Steam o se pide a mano.
if (process.env.SteamAppId || process.env.LAHORDA_STEAM_OVERLAY === '1') {
  app.commandLine.appendSwitch('in-process-gpu');
  app.commandLine.appendSwitch('disable-direct-composition');
}

if (!app.requestSingleInstanceLock()) { app.quit(); process.exit(0); }

let steam = null;
function initSteam() {
  try {
    const sw = require('steamworks.js');            // dependencia OPCIONAL: sin ella (o sin Steam abierto) se juega igual
    steam = sw.init();                               // en desarrollo lee steam_appid.txt; desde Steam, el AppID del lanzador
    try { sw.electronEnableSteamOverlay(); } catch (e) {}
  } catch (e) { steam = null; console.warn('[steam] sin Steam (se juega igual, sin logros ni overlay):', e && e.message); }
}

function openExternal(u) { const c = P.classifyNavigation(u); if (c.action === 'external') shell.openExternal(c.url).catch(() => {}); }

// Reglas comunes a TODA webContents (ventana principal y las de páginas legales).
app.on('web-contents-created', (ev, wc) => {
  wc.on('will-navigate', (e, url) => {
    const c = P.classifyNavigation(url);
    if (c.action === 'allow') return;
    e.preventDefault();
    if (c.action === 'rewrite') wc.loadURL(c.url); else if (c.action === 'external') openExternal(url);
  });
  wc.on('will-redirect', (e, url) => { if (P.classifyNavigation(url).action !== 'allow') e.preventDefault(); });
  wc.on('will-attach-webview', e => e.preventDefault());
  wc.setWindowOpenHandler(({url}) => {
    const c = P.classifyNavigation(url);
    if (c.action === 'external') { openExternal(url); return {action: 'deny'}; }
    // páginas propias (legales): ventana hija sin puente, con las mismas reglas
    if (c.action === 'allow' && new URL(c.url).pathname.startsWith('/legal/'))
      return {action: 'allow', overrideBrowserWindowOptions: {width: 900, height: 700, autoHideMenuBar: true, backgroundColor: '#0b0705',
        webPreferences: {contextIsolation: true, nodeIntegration: false, sandbox: true, devTools: !PROD, spellcheck: false}}};
    return {action: 'deny'};
  });
  wc.on('before-input-event', (e, input) => {
    const a = P.keyAction(input, PROD); if (!a) return;
    e.preventDefault();
    if (a === 'fullscreen') { const w = BrowserWindow.fromWebContents(wc); if (w) w.setFullScreen(!w.isFullScreen()); }
  });
  if (PROD) wc.on('devtools-opened', () => wc.closeDevTools());
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 720, useContentSize: true, minWidth: 960, minHeight: 540, resizable: true, fullscreenable: true,
    backgroundColor: '#0b0705', show: false, autoHideMenuBar: true, title: 'La Horda',
    webPreferences: {preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true,
      backgroundThrottling: false, devTools: !PROD, spellcheck: false, webviewTag: false}
  });
  win.removeMenu();
  win.once('ready-to-show', () => win.show());
  win.on('blur', () => win.webContents.send('lahorda:focus', false));
  win.on('focus', () => win.webContents.send('lahorda:focus', true));
  win.on('enter-full-screen', () => win.webContents.send('lahorda:fullscreen', true));
  win.on('leave-full-screen', () => win.webContents.send('lahorda:fullscreen', false));
  win.loadURL(P.START_URL);
  return win;
}

const fromGame = ev => { try { return !!ev.senderFrame && P.isGameUrl(ev.senderFrame.url) && ev.senderFrame === ev.sender.mainFrame; } catch (e) { return false; } };

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  // Protocolo propio, encerrado en GAME_ROOT. Un documento pedido con parámetros fuera de la lista blanca se redirige a la URL limpia.
  protocol.handle(P.SCHEME, req => {
    const c = P.classifyNavigation(req.url);
    if (c.action === 'rewrite') return new Response(null, {status: 302, headers: {Location: c.url}});
    if (c.action !== 'allow') return new Response('forbidden', {status: 403});
    const file = P.resolveGameFile(GAME_ROOT, req.url);
    if (!file) return new Response('forbidden', {status: 403});
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return new Response('not found', {status: 404});
    return net.fetch(pathToFileURL(file).toString(), {headers: req.headers});
  });
  const ses = session.defaultSession;
  // Permisos: solo pantalla completa y captura del puntero. Nada de cámara, micrófono, notificaciones, captura de pantalla...
  const okPerm = p => p === 'fullscreen' || p === 'pointerLock';
  ses.setPermissionRequestHandler((wc, perm, cb) => cb(okPerm(perm)));
  ses.setPermissionCheckHandler((wc, perm) => okPerm(perm));
  // Nada de CÓDIGO remoto dentro del cliente: scripts, workers y marcos solo desde app://lahorda (p. ej. el SDK de "Jugar en la
  // tele" que el juego baja de la web queda bloqueado: falla en silencio). Las conexiones de datos (multijugador) no se tocan.
  ses.webRequest.onBeforeRequest((d, cb) => {
    const code = d.resourceType === 'script' || d.resourceType === 'subFrame' || d.resourceType === 'mainFrame' || d.resourceType === 'object';
    cb({cancel: code && !P.isGameUrl(d.url) && !/^devtools:/.test(d.url)});
  });
  ses.on('will-download', e => e.preventDefault());

  initSteam();
  try { fs.mkdirSync(SAVE_DIR(), {recursive: true}); } catch (e) {}

  // --- espejo del guardado (ver save-mirror.js). Solo acepta pedidos del marco principal del juego. ---
  ipcMain.on('lahorda:save-plan', (ev, locals, marks) => {      // síncrono: corre antes del primer script del juego
    try { ev.returnValue = fromGame(ev) ? M.startupPlan(SAVE_DIR(), locals || {}, marks || {}) : null; }
    catch (e) { console.warn('[save] plan:', e.message); ev.returnValue = null; }
  });
  ipcMain.on('lahorda:save-write', (ev, key, value, baseRev) => { // síncrono: el preload necesita la revisión para su marca
    try { ev.returnValue = fromGame(ev) ? M.writeEnvelope(SAVE_DIR(), String(key), value === null ? null : String(value), baseRev | 0, os.hostname()) : null; }
    catch (e) { console.warn('[save] write:', e.message); ev.returnValue = null; }
  });
  // --- Steam (NO VERIFICADO): logros 1:1 con ACHIEVEMENTS (js/data/quests.js), presencia. El juego todavía no llama a este puente. ---
  ipcMain.on('lahorda:achievement', (ev, id) => { try { if (steam && fromGame(ev) && /^[a-z0-9_]{1,40}$/.test(id)) steam.achievement.activate(id); } catch (e) {} });
  ipcMain.on('lahorda:presence', (ev, k, v) => { try { if (steam && fromGame(ev)) steam.localplayer.setRichPresence(String(k).slice(0, 32), String(v).slice(0, 120)); } catch (e) {} });
  ipcMain.handle('lahorda:steam-info', ev => { try { return steam && fromGame(ev) ? {name: steam.localplayer.getName(), lang: steam.apps.currentGameLanguage()} : null; } catch (e) { return null; } });
  ipcMain.on('lahorda:quit', ev => { if (fromGame(ev)) app.quit(); });
  ipcMain.on('lahorda:fullscreen', (ev, on) => { if (!fromGame(ev)) return; const w = BrowserWindow.fromWebContents(ev.sender); if (w) w.setFullScreen(on == null ? !w.isFullScreen() : !!on); });

  createWindow();
});
app.on('second-instance', () => { const w = BrowserWindow.getAllWindows()[0]; if (w) { if (w.isMinimized()) w.restore(); w.focus(); } });
// Salir limpio: al cerrar la ventana termina el proceso en todas las plataformas (Steam debe ver que el juego cerró).
// El último guardado lo empuja el preload en "pagehide", que corre antes de que la ventana se destruya.
app.on('window-all-closed', () => app.quit());
