'use strict';
/* Puente mínimo contenedor <-> juego. Corre ANTES del primer script del juego, en un mundo aislado (contextIsolation) y con sandbox:
 * solo puede usar contextBridge / ipcRenderer. NO toca prototipos de la página (en un mundo aislado no tendría efecto).
 *
 * 1) Al arrancar, de forma SÍNCRONA (antes de que js/main.js llame a loadSave): le pregunta al proceso principal si conviene traer
 *    el guardado del disco (PC nueva, reinstalación, otra máquina por Steam Cloud). Las reglas están en save-mirror.js: nunca se
 *    pisa un guardado local con cambios sin espejar, y un archivo dañado se ignora.
 * 2) Mientras se juega: cada 2 s (y al ocultar/cerrar la ventana) compara las claves de guardado con lo último espejado y, si
 *    cambiaron, las manda a disco (escritura atómica en el proceso principal). No intercepta localStorage.setItem.
 * 3) Expone window.HORDA_DESKTOP (el juego todavía no lo usa: ver docs/steam/README.md).
 */
const {contextBridge, ipcRenderer} = require('electron');
const KEYS = ['laHordaSave_v1', 'horda_prefs', 'horda_vol', 'horda_mute', 'horda_motion', 'horda_fx', 'horda_name'];   // = save-mirror.js SAVE_KEYS
const MARK_KEY = 'lahordaDesktopMirror';
const isGame = location.protocol === 'app:' && location.host === 'lahorda' && !/^\/legal\//.test(location.pathname);

if (isGame) {
  let marks = {}; const last = {};
  const readMarks = () => { try { const o = JSON.parse(localStorage.getItem(MARK_KEY) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } };
  const writeMarks = () => { try { localStorage.setItem(MARK_KEY, JSON.stringify(marks)); } catch (e) {} };
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  try {
    marks = readMarks();
    const locals = {}; for (const k of KEYS) locals[k] = get(k);
    const plan = ipcRenderer.sendSync('lahorda:save-plan', locals, marks);
    if (plan) {
      for (const k of Object.keys(plan.set || {})) if (KEYS.includes(k) && typeof plan.set[k] === 'string') {
        try { const cur = localStorage.getItem(k); if (cur != null && cur !== plan.set[k]) localStorage.setItem(k + '_antesDeEspejo', cur); } catch (e) {}   // lo local que se reemplaza queda aparte, nunca se pierde
        try { localStorage.setItem(k, plan.set[k]); } catch (e) {}
      }
      marks = plan.marks || marks; writeMarks();
      if (plan.conflicts && plan.conflicts.length) console.warn('[save] guardado de otra máquina en conflicto; se conserva el local:', plan.conflicts.join(', '));
    }
    for (const k of KEYS) last[k] = get(k);
  } catch (e) { console.warn('[save] sin espejo en disco:', e && e.message); }

  // Lo que ya coincide con la marca no se reescribe. `last` evita calcular nada cuando la cadena es la misma referencia de valor.
  let dirtyMarks = false;
  function mirror() {
    for (const k of KEYS) {
      const v = get(k), m = marks[k];
      if (v === last[k] && m) continue;                      // sin cambios desde la última pasada y ya espejado
      if (v === null && !m) { last[k] = v; continue; }       // nunca existió: nada que espejar
      const r = ipcRenderer.sendSync('lahorda:save-write', k, v, m && m.rev | 0);
      if (r && r.rev) { marks[k] = r; dirtyMarks = true; last[k] = v; }
    }
    if (dirtyMarks) { dirtyMarks = false; writeMarks(); }
  }
  const safe = () => { try { mirror(); } catch (e) {} };
  setInterval(safe, 2000);
  window.addEventListener('pagehide', safe);
  window.addEventListener('beforeunload', safe);
  document.addEventListener('visibilitychange', () => { if (document.hidden) safe(); });

  contextBridge.exposeInMainWorld('HORDA_DESKTOP', {
    platform: process.platform, desktop: true,
    quit: () => { safe(); ipcRenderer.send('lahorda:quit'); },
    setFullscreen: on => ipcRenderer.send('lahorda:fullscreen', on),
    unlockAchievement: id => ipcRenderer.send('lahorda:achievement', String(id)),
    setPresence: (k, v) => ipcRenderer.send('lahorda:presence', String(k), String(v)),
    steamInfo: () => ipcRenderer.invoke('lahorda:steam-info'),
    flushSave: () => safe()
  });
  ipcRenderer.on('lahorda:focus', (e, on) => { if (!on) safe(); window.dispatchEvent(new CustomEvent(on ? 'lahorda-focus' : 'lahorda-blur')); });
  ipcRenderer.on('lahorda:fullscreen', (e, on) => window.dispatchEvent(new CustomEvent('lahorda-fullscreen', {detail: !!on})));
}
