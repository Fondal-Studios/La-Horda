'use strict';
/* Mando simulado para pruebas con Playwright (sin hardware).
 *   const G = require('../lib/gamepad-sim');
 *   await G.install(ctxOrPage);                 // ANTES de page.goto: redefine navigator.getGamepads
 *   await G.connect(page, 'standard');          // 'standard' | 'generic' | 'ps' (mapping '' con ejes/botones distintos)
 *   await G.tap(page, 'A');                     // nombre lógico (A B X Y LB RB LT RT BACK START L3 R3 UP DOWN LEFT RIGHT) según el perfil
 *   await G.stick(page, 'L', 1, 0);             // stick izquierdo / derecho
 * La Gamepad API real no publica el mando hasta que se aprieta un botón; connect() emula eso: el mando recién
 * aparece en getGamepads() y dispara 'gamepadconnected' cuando se llama a wake() o al primer tap().
 */
const PROFILES = {
  // mapping "standard" (Xbox / Chrome con DualShock-DualSense mapeado): 17 botones, 4 ejes
  standard: { mapping:'standard', id:'Xbox 360 Controller (STANDARD GAMEPAD Vendor: 045e Product: 028e)', nButtons:17, nAxes:4,
    btn:{A:0,B:1,X:2,Y:3,LB:4,RB:5,LT:6,RT:7,BACK:8,START:9,L3:10,R3:11,UP:12,DOWN:13,LEFT:14,RIGHT:15}, axL:[0,1], axR:[2,3], hat:-1, ltAx:-1, rtAx:-1 },
  // genérico sin mapeo (mapping ""): 12 botones, 10 ejes (palanca de dirección en el eje 9), stick derecho en 3/4, gatillos analógicos en 2/5
  generic: { mapping:'', id:'USB Gamepad (Vendor: 0079 Product: 0011)', nButtons:12, nAxes:10,
    btn:{A:0,B:1,X:2,Y:3,LB:4,RB:5,LT:6,RT:7,BACK:8,START:9,L3:10,R3:11}, axL:[0,1], axR:[3,4], hat:9, ltAx:2, rtAx:5 },
  // DualShock 4 sin mapeo (Firefox/Windows típico): cuadrado=0 cruz=1 círculo=2 triángulo=3; ejes 0,1 izquierdo, 2 y 5 derecho
  ps: { mapping:'', id:'054c-09cc-Wireless Controller', nButtons:14, nAxes:10,
    btn:{X:0,A:1,B:2,Y:3,LB:4,RB:5,LT:6,RT:7,BACK:8,START:9,L3:10,R3:11}, axL:[0,1], axR:[2,5], hat:9, ltAx:3, rtAx:4 }
};
const INIT = (profiles) => {
  const P = profiles;
  const st = window.__gp = { profile:'standard', connected:false, exposed:false, buttons:[], axes:[], ts:0 };
  const reset = () => { const p = P[st.profile]; st.buttons = Array.from({length:p.nButtons}, () => ({pressed:false, touched:false, value:0}));
    st.axes = Array.from({length:p.nAxes}, () => 0); if(p.hat >= 0) st.axes[p.hat] = 1.2857; if(p.ltAx >= 0){ st.axes[p.ltAx] = -1; st.axes[p.rtAx] = -1; } };
  reset();
  const snap = () => { const p = P[st.profile]; return { id:p.id, index:0, connected:true, mapping:p.mapping, timestamp:++st.ts, axes:st.axes.slice(),
    buttons:st.buttons.map(b => ({pressed:b.pressed, touched:b.pressed, value:b.value})), vibrationActuator:null }; };
  const real = navigator.getGamepads && navigator.getGamepads.bind(navigator);
  Object.defineProperty(navigator, 'getGamepads', { configurable:true, value: () => (st.connected && st.exposed) ? [snap(), null, null, null] : [null, null, null, null] });
  st.setProfile = (name) => { st.profile = name; reset(); };
  st.expose = () => { if(st.exposed) return; st.exposed = true; const ev = new Event('gamepadconnected'); ev.gamepad = snap(); window.dispatchEvent(ev); };
  st.set = (o) => { const p = P[st.profile]; const wasAny = st.buttons.some(b => b.pressed);
    if(o.btn) for(const k in o.btn){ const b = st.buttons[p.btn[k] !== undefined ? p.btn[k] : +k]; if(b){ b.pressed = !!o.btn[k]; b.value = o.btn[k] ? 1 : 0; } }
    if(o.hatDir !== undefined && p.hat >= 0){ const idx = {UP:0,UPRIGHT:1,RIGHT:2,DOWNRIGHT:3,DOWN:4,DOWNLEFT:5,LEFT:6,UPLEFT:7}[o.hatDir]; st.axes[p.hat] = idx === undefined ? 1.2857 : -1 + idx*2/7; }
    if(o.axL){ st.axes[p.axL[0]] = o.axL[0]; st.axes[p.axL[1]] = o.axL[1]; }
    if(o.axR){ st.axes[p.axR[0]] = o.axR[0]; st.axes[p.axR[1]] = o.axR[1]; }
    // la API real publica el mando recién con el primer botón apretado
    if(st.connected && !st.exposed && (st.buttons.some(b => b.pressed) || (o.hatDir && o.hatDir !== 'NONE') || (o.axL && Math.hypot(o.axL[0], o.axL[1]) > 0.5))) st.expose();
  };
};
async function install(target){ await target.addInitScript(INIT, PROFILES); }
async function connect(page, profile = 'standard', opts = {}){
  await page.evaluate(([p, expose]) => { __gp.setProfile(p); __gp.connected = true; __gp.exposed = false; if(expose) __gp.expose(); }, [profile, !!opts.expose]);
}
async function disconnect(page){ await page.evaluate(() => { __gp.connected = false; __gp.exposed = false; const ev = new Event('gamepaddisconnected'); window.dispatchEvent(ev); }); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
const DIRS = { UP:[0,-1], DOWN:[0,1], LEFT:[-1,0], RIGHT:[1,0] };
async function down(page, name){
  const prof = await page.evaluate(() => __gp.profile), p = PROFILES[prof];
  if(DIRS[name] && p.btn[name] === undefined) await page.evaluate(n => __gp.set({hatDir:n}), name);
  else await page.evaluate(n => __gp.set({btn:{[n]:1}}), name);
}
async function up(page, name){
  const prof = await page.evaluate(() => __gp.profile), p = PROFILES[prof];
  if(DIRS[name] && p.btn[name] === undefined) await page.evaluate(() => __gp.set({hatDir:'NONE'}));
  else await page.evaluate(n => __gp.set({btn:{[n]:0}}), name);
}
async function tap(page, name, hold = 110){ await down(page, name); await sleep(hold); await up(page, name); await sleep(90); }
async function hold(page, name, ms){ await down(page, name); await sleep(ms); await up(page, name); await sleep(90); }
async function stick(page, which, x, y){ await page.evaluate(([w, x, y]) => __gp.set(w === 'L' ? {axL:[x, y]} : {axR:[x, y]}), [which, x, y]); }
module.exports = { PROFILES, install, connect, disconnect, tap, hold, down, up, stick, sleep };
