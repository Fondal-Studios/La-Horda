"use strict";
/* ============================================================
   js/net/mandos.js — CELULARES COMO MANDO + VISTA DE SALA (pantalla grande en la compu)

   Con «lan.bat» (tools/lan/host.js) la compu levanta además el servidor privado de mandos (tools/lan/mandos.js,
   puerto del juego + 1). Esta página (la partida en la compu) se conecta como PANTALLA; cada celular que escanea
   el QR maneja a un guardián del equipo:
     · el primer celular maneja al jugador 1 (el teclado o un mando USB siguen andando cuando el celular no toca);
     · los siguientes toman a los aliados (los que hoy maneja la IA). Si un celular se va, su aliado vuelve a la IA.
   Se usa exactamente el mismo código que mueve al jugador (updateControlledHero con joyVec/basicHeld prestados,
   igual que netWithHero en cooperativo): misma velocidad, colisión, ataques y habilidades.
   VISTA DE SALA: con mandos conectados la cámara sigue al grupo y se abre hasta que entran todos (casi toda la
   arena). Tecla V: prender/apagar. Tecla M: mostrar/ocultar el QR. ?sala=0 la apaga; ?mandos=PUERTO:CLAVE para
   probar sin host.js.
   No se mezcla con las salas en red (si hay netMatch, los mandos quedan en pausa).
   ============================================================ */
const MANDOS = { ws:null, cfg:null, lista:new Map(), sala:{on:false, auto:true, sub:{x:0, y:0}, z:0, activa:false}, url:"", ui:null, ultEstado:0, ultLista:0 };
const MANDO_COLORES = ["#f2c14e", "#4ea3f2", "#5fd17a", "#f26fb0", "#b48cf2", "#f28b4e", "#4ef2e0", "#e0e0e0"];

function mandosCfg(){
  try{
    const q = new URLSearchParams(location.search);
    if(q.get("sala") === "0") MANDOS.sala.auto = false;
    const p = q.get("mandos");
    if(p && /^\d{2,5}:[a-z0-9]{4,32}$/i.test(p)){ const [port, k] = p.split(":"); return {port:+port, k}; }
  }catch(e){}
  const w = typeof window !== "undefined" && window.__HORDA_MANDOS__;
  return (w && w.port && w.k) ? {port:+w.port, k:String(w.k)} : null;
}
function mandosActivos(){ return !(typeof netMatch !== "undefined" && netMatch); }
function mandosConectar(){
  const c = MANDOS.cfg; if(!c) return;
  let ws;
  try{ ws = new WebSocket(`ws://${location.hostname || "localhost"}:${c.port}/ws?rol=pantalla&k=${encodeURIComponent(c.k)}`); }catch(e){ return; }
  MANDOS.ws = ws;
  ws.onmessage = ev => { let m; try{ m = JSON.parse(ev.data); }catch(e){ return; } mandosRecibir(m); };
  ws.onclose = ev => { if(MANDOS.ws === ws) MANDOS.ws = null; if(ev.code !== 4000 && ev.code !== 4003) setTimeout(mandosConectar, 2000); };
}
function mandosEnviar(o){ const ws = MANDOS.ws; if(ws && ws.readyState === 1) ws.send(JSON.stringify(o)); }

// lugares: 0 = jugador 1, 1..3 = aliados (en el orden de heroes)
function mandosLugarLibre(){
  const usados = new Set([...MANDOS.lista.values()].map(m => m.slot));
  for(let s = 0; s < 4; s++) if(!usados.has(s)) return s;
  return null;
}
function mandosHeroe(m){ return (m && m.slot != null && typeof heroes !== "undefined" && heroes) ? heroes[m.slot] || null : null; }
function mandosRecibir(m){
  if(m.t === "hola"){ for(const id of m.mandos || []) if(!MANDOS.lista.has(id)) mandosRecibir({t:"entra", de:id}); return; }
  const id = m.de; if(!id) return;
  if(m.t === "entra"){
    if(!MANDOS.lista.has(id)){ const slot = mandosLugarLibre(); MANDOS.lista.set(id, {id, slot, nombre:"", joy:{x:0, y:0}, b:0, color:MANDO_COLORES[slot == null ? 7 : slot], hp:-1}); }
    const mm = MANDOS.lista.get(id);
    if(typeof showNetToast === "function") showNetToast(mm.slot == null ? "Mando conectado (sin lugar libre)" : `Mando conectado: jugador ${mm.slot + 1}`);
    if(MANDOS.sala.auto) MANDOS.sala.on = true;
    mandosEstadoA(mm, true); mandosUiPintar(); return;
  }
  const mm = MANDOS.lista.get(id); if(!mm) return;
  if(m.t === "sale"){
    const h = mandosHeroe(mm); if(h && mm.slot > 0){ h.isRemote = false; }
    MANDOS.lista.delete(id); mandosUiPintar();
    if(typeof showNetToast === "function") showNetToast(`Se desconectó el mando del jugador ${mm.slot == null ? "?" : mm.slot + 1}`);
    return;
  }
  if(m.t === "in"){
    const x = Math.max(-1, Math.min(1, +m.x || 0)), y = Math.max(-1, Math.min(1, +m.y || 0));
    mm.joy = {x, y}; mm.b = m.b ? 1 : 0; return;
  }
  if(m.t === "nombre"){ mm.nombre = String(m.n || "").replace(/[<>&"]/g, "").slice(0, 14); const h = mandosHeroe(mm); if(h && mm.slot > 0) h.netName = mm.nombre || h.netName; mandosUiPintar(); return; }
  if(!mandosActivos()) return;
  if(m.t === "hab" || m.t === "ulti"){
    if(state !== "playing") return;
    const h = mandosHeroe(mm); if(!h || !h.alive) return;
    const fn = () => m.t === "ulti" ? useUltimate() : useSkill(Math.max(0, Math.min(2, m.i | 0)), null);
    if(mm.slot === 0) fn(); else mandosCon(h, mm, fn);
    return;
  }
  if(m.t === "pausa"){
    const b = document.getElementById(state === "playing" ? "pause-btn" : "resume-btn");
    if(b) b.click(); return;
  }
  if(m.t === "elegir"){ mandosElegir(mm, String(m.c || "")); return; }
}
// Elegir guardián para la próxima partida: el jugador 1 cambia su campeón (si lo tiene desbloqueado);
// los demás cambian el aliado de su lugar.
function mandosElegir(mm, k){
  if(typeof CLASSES === "undefined" || !CLASSES[k] || mm.slot == null) return;
  if(mm.slot === 0){
    if(!(save.champions[k] && save.champions[k].unlocked)) return;
    selectedClass = k;
    if(Array.isArray(lobbyAllies)) lobbyAllies = lobbyAllies.map(a => a === k ? null : a);
  } else {
    if(k === selectedClass) return;
    if(!(typeof lobbyAlliesValid === "function" && lobbyAlliesValid(selectedClass))) lobbyAllies = pickLobbyAllies(selectedClass);
    const i = mm.slot - 1, j = lobbyAllies.indexOf(k);
    if(j >= 0 && j !== i) lobbyAllies[j] = lobbyAllies[i]; // cambio de lugar con el que lo tenía
    lobbyAllies[i] = k;
  }
  if(Array.isArray(lobbyAllies) && lobbyAllies.some(a => !a)){ const nuevos = pickLobbyAllies(selectedClass); lobbyAllies = lobbyAllies.map((a, i) => a || nuevos.find(n => !lobbyAllies.includes(n) && n !== selectedClass) || nuevos[i]); }
  try{ if(typeof persist === "function") persist(); }catch(e){}
  if(typeof showNetToast === "function") showNetToast(`Jugador ${mm.slot + 1} eligió ${CLASSES[k].name} (próxima partida)`);
  for(const x of MANDOS.lista.values()) mandosEstadoA(x, true);
}
// Presta la identidad de jugador a un aliado manejado por un celular (como netWithHero).
function mandosCon(h, mm, fn){
  const s = {player, joyVec, basicHeld, facing};
  player = h; joyVec = {x:mm.joy.x, y:mm.joy.y}; basicHeld = !!(mm.b && h.alive); facing = {x:h.fx || 0, y:h.fy || 1};
  try{ return fn(); } finally { player = s.player; joyVec = s.joyVec; basicHeld = s.basicHeld; facing = s.facing; }
}
// update.js: justo antes de mover al jugador 1. Devuelve lo que hay que restaurar después.
function mandosJugadorIn(){
  if(!mandosActivos()) return null;
  for(const mm of MANDOS.lista.values()){
    if(mm.slot !== 0) continue;
    if(Math.hypot(mm.joy.x, mm.joy.y) < 0.08 && !mm.b) return null; // el celular no toca: manda el teclado / mando USB
    const s = {joyVec, basicHeld};
    joyVec = {x:mm.joy.x, y:mm.joy.y}; basicHeld = basicHeld || !!mm.b;
    return s;
  }
  return null;
}
function mandosJugadorOut(s){ if(s){ joyVec = s.joyVec; basicHeld = s.basicHeld; } }
// update.js: después del jugador 1. Mueve a los aliados que maneja un celular.
// JOYSTICKS EXTRA (pedido del doctor, 26/11): cada joystick conectado a la compu ademas del primero maneja a un aliado,
// igual que un celular de sala.bat. Sirve con mandos USB y con la "sala de joysticks" de Anakin (los celulares de los
// amigos aparecen en Windows como controles de Xbox). El primer joystick sigue siendo el jugador 1 (input-desk.js).
// Mapeo como el del jugador 1: palanca izquierda o cruz = mover, A = ataque, X / Y / B = habilidades 1 / 2 / 3,
// RB o RT = ultimate, Start = pausa. Si el joystick se desconecta, su aliado vuelve a la IA.
function mandosPads(){
  let pads = [];
  try{ pads = [...(navigator.getGamepads ? navigator.getGamepads() : [])].filter(g => g && g.connected); }catch(e){ return; }
  if(!pads.length && ![...MANDOS.lista.values()].some(m => m.pad)) return;
  const p1 = typeof _gpPad === "function" ? _gpPad() : null;
  const vivos = new Set();
  for(const g of pads){
    if(p1 && g.index === p1.index) continue;
    const id = "pad" + g.index; vivos.add(id);
    let mm = MANDOS.lista.get(id);
    if(!mm){
      const usados = new Set([...MANDOS.lista.values()].map(m => m.slot)); let slot = null;
      for(let k = 1; k < 4; k++) if(!usados.has(k)){ slot = k; break; }
      if(slot == null) continue;
      mm = {id, slot, nombre:"Joystick " + (slot + 1), joy:{x:0, y:0}, b:0, color:MANDO_COLORES[slot], hp:-1, pad:true, prev:{}};
      MANDOS.lista.set(id, mm);
      if(MANDOS.sala.auto) MANDOS.sala.on = true;
      if(typeof showNetToast === "function") showNetToast(`Joystick conectado: jugador ${slot + 1}`);
      mandosUiPintar();
    }
    const r = gpRead(g), now = r.b, prev = mm.prev || {}, edge = n => now[n] && !prev[n];
    mm.prev = now;
    let x = r.lx || 0, y = r.ly || 0;
    if(now.LEFT) x = -1; if(now.RIGHT) x = 1; if(now.UP) y = -1; if(now.DOWN) y = 1;
    const l = Math.hypot(x, y); if(l > 1){ x /= l; y /= l; }
    mm.joy = {x, y}; mm.b = now.A ? 1 : 0;
    if(mandosActivos() && state === "playing"){
      const h = mandosHeroe(mm);
      if(h && h.alive){
        [["X", 0], ["Y", 1], ["B", 2]].forEach(([b, i]) => { if(edge(b)) mandosCon(h, mm, () => useSkill(i, null)); });
        if(edge("RB") || edge("RT")) mandosCon(h, mm, () => useUltimate());
      }
    }
    if(edge("START")) mandosRecibir({t:"pausa", de:id});
  }
  for(const [id, mm] of [...MANDOS.lista]) if(mm.pad && !vivos.has(id)) mandosRecibir({t:"sale", de:id});
}
function mandosUpdate(dt){
  mandosPads();
  if(!MANDOS.lista.size) return;
  const ahora = performance.now();
  const activos = mandosActivos();
  for(const mm of MANDOS.lista.values()){
    const h = mandosHeroe(mm);
    if(activos && h && mm.slot > 0){
      h.isRemote = true; // la IA de aliados lo saltea (allies.js)
      if(mm.nombre) h.netName = mm.nombre;
      if(state === "playing") mandosCon(h, mm, () => updateControlledHero(dt));
    }
    if(h){
      if(mm.hp >= 0 && h.hp < mm.hp - 0.5) mandosEnviar({para:mm.id, t:"vibrar", ms:h.hp <= 0 ? 300 : 35});
      mm.hp = h.hp;
    }
  }
  if(ahora - MANDOS.ultEstado > 250){
    MANDOS.ultEstado = ahora;
    const lista = ahora - MANDOS.ultLista > 5000; if(lista) MANDOS.ultLista = ahora;
    for(const mm of MANDOS.lista.values()) mandosEstadoA(mm, lista);
  }
}
function mandosEstadoA(mm, conLista){
  const h = mandosHeroe(mm);
  const o = {para:mm.id, t:"estado", slot:mm.slot, color:mm.color};
  if(h){
    o.heroe = (h.cls && h.cls.name) || h.classKey; o.vida = h.maxHp ? h.hp / h.maxHp : 0; o.vivo = !!h.alive;
    o.habs = ((h.cls && h.cls.skills) || []).slice(0, 3).map(s => String((s && (s.short || s.name)) || "").slice(0, 10));
  } else if(mm.slot != null){
    const k = mm.slot === 0 ? selectedClass : (Array.isArray(lobbyAllies) ? lobbyAllies[mm.slot - 1] : null);
    o.heroe = (k && CLASSES[k] && CLASSES[k].name) || "(en el menú)";
  }
  if(conLista && typeof CLASSES !== "undefined"){
    o.elegido = mm.slot === 0 ? selectedClass : (Array.isArray(lobbyAllies) ? lobbyAllies[mm.slot - 1] : null);
    o.campeones = Object.keys(CLASSES).map(k => ({k, n:CLASSES[k].name, no: mm.slot === 0 && !(save.champions[k] && save.champions[k].unlocked)}));
  }
  mandosEnviar(o);
}

/* ---------------- VISTA DE SALA (cámara) ---------------- */
// camera.js la llama al principio de updateArenaCameraZoom(); true = ya puso la cámara.
function mandosCamara(){
  const S = MANDOS.sala;
  const sirve = S.on && state === "playing" && typeof heroes !== "undefined" && heroes && heroes.length && player && !player.duelActive
    && currentArena !== "coliseo" && currentArena !== "convergencia";
  if(!sirve){
    if(S.activa){ S.activa = false; if(CAM_SUBJECT === S.sub) CAM_SUBJECT = null; CAM_ZOOM = computeCamZoom(VW, VH); CAM_Y_ANCHOR = camFitAnchor(VW, VH, CAM_ZOOM); }
    return false;
  }
  const vivos = heroes.filter(h => h.alive); const g = vivos.length ? vivos : heroes;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for(const h of g){ x0 = Math.min(x0, h.x); x1 = Math.max(x1, h.x); y0 = Math.min(y0, h.y); y1 = Math.max(y1, h.y); }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const normal = computeCamZoom(VW, VH);
  const ajuste = Math.min(VW / (x1 - x0 + 760), VH / (y1 - y0 + 620));
  const minimo = Math.min(VW / 2300, VH / 1700); // casi toda la arena octogonal
  const z = Math.max(minimo, Math.min(normal * 0.8, ajuste));
  if(!S.activa){ S.activa = true; S.sub = {x:player.x, y:player.y}; S.z = CAM_ZOOM; }
  S.sub.x += (cx - S.sub.x) * 0.08; S.sub.y += (cy - S.sub.y) * 0.08;
  S.z += (z - S.z) * 0.05;
  CAM_SUBJECT = S.sub; CAM_ZOOM = S.z; CAM_Y_ANCHOR = 0;
  return true;
}

/* ---------------- panel en la compu: QR y jugadores ---------------- */
function mandosUi(){
  if(MANDOS.ui || typeof document === "undefined") return MANDOS.ui;
  const d = document.createElement("div"); d.id = "mandos-panel";
  d.style.cssText = "position:fixed;left:10px;bottom:10px;z-index:9000;background:#140f12e6;color:#f2e6d8;border:1px solid #fff3;border-radius:12px;padding:10px 12px;font:600 13px/1.3 system-ui,sans-serif;max-width:260px;pointer-events:none";
  document.body.appendChild(d); MANDOS.ui = d; return d;
}
function mandosUiPintar(){
  const d = mandosUi(); if(!d) return;
  const jugando = typeof state !== "undefined" && state === "playing";
  const filas = [...MANDOS.lista.values()].sort((a, b) => (a.slot ?? 9) - (b.slot ?? 9)).map(mm =>
    `<div><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${mm.color};margin-right:6px"></span>J${mm.slot == null ? "-" : mm.slot + 1} ${mm.nombre || "celular"}</div>`).join("");
  const qr = (!jugando || MANDOS.verQr) && MANDOS.url && typeof LanQR !== "undefined"
    ? `<div style="background:#fff;border-radius:6px;padding:4px;width:150px;margin:6px 0">${LanQR.svg(MANDOS.url, {scale:3, margin:2}).replace(/width="\d+" height="\d+"/, 'width="142" height="142"')}</div><div style="font-size:11px;color:#bba">${MANDOS.url.replace(/\?k=.*/, "")}</div>` : "";
  d.innerHTML = `<div style="color:#f2c14e">📱 Celulares como mando</div>${qr}${filas || '<div style="color:#bba">Escaneá el QR con la cámara</div>'}<div style="font-size:11px;color:#998;margin-top:4px">M: QR · V: vista de sala ${MANDOS.sala.on ? "(prendida)" : "(apagada)"}</div>`;
  d.style.display = (!jugando || MANDOS.verQr || !MANDOS.lista.size) ? "block" : (MANDOS.lista.size ? "block" : "none");
  if(jugando && !MANDOS.verQr) d.style.opacity = "0.75";
  else d.style.opacity = "1";
}
async function mandosUrl(){
  const c = MANDOS.cfg; let base = `http://${location.hostname}:${c.port}/`;
  try{
    const r = await fetch("/lan.json", {cache:"no-store"});
    if(r.ok){ const j = await r.json(); if(j && j.primary){ const u = new URL(j.primary); base = `http://${u.hostname}:${c.port}/`; } }
  }catch(e){}
  MANDOS.url = base + "?k=" + c.k; mandosUiPintar();
}
function mandosIniciar(){
  MANDOS.cfg = mandosCfg(); if(!MANDOS.cfg) return;
  mandosConectar(); mandosUrl();
  window.addEventListener("keydown", e => {
    if(e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    if(e.key === "v" || e.key === "V"){ MANDOS.sala.on = !MANDOS.sala.on; MANDOS.sala.auto = false; mandosUiPintar(); if(typeof showNetToast === "function") showNetToast(MANDOS.sala.on ? "Vista de sala: se ve todo el grupo" : "Vista normal"); }
    if(e.key === "m" || e.key === "M"){ MANDOS.verQr = !MANDOS.verQr; mandosUiPintar(); }
  });
  let antes = "";
  setInterval(() => { const s = typeof state !== "undefined" ? state : ""; if(s !== antes){ antes = s; mandosUiPintar(); } }, 500);
}
// index.html puede cargar los scripts después del «load»: si ya pasó, se arranca ahora.
if(typeof window !== "undefined"){ if(document.readyState === "complete") setTimeout(mandosIniciar, 0); else window.addEventListener("load", mandosIniciar); }
