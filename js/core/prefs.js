"use strict";
/* ============================================================
   js/core/prefs.js
   Opciones de accesibilidad y de controles, POR DISPOSITIVO (como el volumen, "horda_vol", y
   "Reducir movimiento", "horda_motion"): son del celular o de la compu, no de la cuenta. En una
   feria el mismo aparato lo agarra gente distinta y el guardado de la partida no se toca.
   - vibrate:  vibración corta al recibir un golpe fuerte y al lanzar la Definitiva (Android; iPhone
               no deja vibrar desde una página y la opción no hace nada ahí).
   - shake:    sacudida de pantalla "normal" | "reducida" (40%) | "off".
   - textLg:   texto grande en lo que se lee jugando (Hechicero, carteles, números flotantes, diálogos).
   - lefty:    modo zurdo: joystick a la derecha y botones a la izquierda.
   - contrast: avisos de peligro de alto contraste (borde negro + filo blanco punteado + rayado),
               que se distinguen por la FORMA y no solo por el color (daltonismo).
   - cvd:      paleta para daltonismo: "off" | "rg" (rojo-verde: deuteranopia/protanopia) | "by" (azul-amarillo:
               tritanopia). Cambia equipos, barras, avisos y zonas de peligro, y SUMA forma (rayado, marcas).
   - atkMode:  ataque: "hold" (mantener el botón, como siempre) | "toggle" (un toque prende/apaga el ataque
               continuo) | "auto" (ataca solo cuando hay un enemigo a tu alcance, sin tocar el botón).
   - bossAssist: ayuda adaptativa del jefe de campaña tras derrotas (js/systems/boss-assist.js); apagada = jefe de siempre.
   - ctlSize:  tamaño de los controles táctiles en % (90-150, 100 = como siempre).
   - ctlOp:    opacidad de los controles táctiles en % (40-100, 100 = como siempre).
   Clave: localStorage "horda_prefs" (JSON). Sin localStorage (modo privado) se usa lo de fábrica.
   ============================================================ */
const PREFS_KEY = "horda_prefs";
const PREFS_DEFAULT = { vibrate:true, shake:"normal", textLg:false, lefty:false, contrast:false, botCallouts:false, bossAssist:true, cvd:"off", atkMode:"hold", ctlSize:100, ctlOp:100 };
const PREFS = (function(){
  const p = Object.assign({}, PREFS_DEFAULT);
  try{
    const v = JSON.parse(localStorage.getItem(PREFS_KEY) || "null");
    if(v && typeof v==="object"){
      if(typeof v.vibrate==="boolean") p.vibrate = v.vibrate;
      if(v.shake==="normal" || v.shake==="reducida" || v.shake==="off") p.shake = v.shake;
      if(typeof v.textLg==="boolean") p.textLg = v.textLg;
      if(typeof v.lefty==="boolean") p.lefty = v.lefty;
      if(typeof v.contrast==="boolean") p.contrast = v.contrast;
      if(typeof v.botCallouts==="boolean") p.botCallouts = v.botCallouts;
      if(typeof v.bossAssist==="boolean") p.bossAssist = v.bossAssist;
      if(v.cvd==="off" || v.cvd==="rg" || v.cvd==="by") p.cvd = v.cvd;
      if(v.atkMode==="hold" || v.atkMode==="toggle" || v.atkMode==="auto") p.atkMode = v.atkMode;
      if(typeof v.ctlSize==="number" && isFinite(v.ctlSize)) p.ctlSize = Math.max(90, Math.min(150, Math.round(v.ctlSize/10)*10));
      if(typeof v.ctlOp==="number" && isFinite(v.ctlOp)) p.ctlOp = Math.max(40, Math.min(100, Math.round(v.ctlOp/10)*10));
    }
  }catch(e){}
  return p;
})();
function prefsSave(){ try{ localStorage.setItem(PREFS_KEY, JSON.stringify(PREFS)); }catch(e){} }
// Aplica las clases de <body> que usan css/controls.css (zurdo, texto grande, alto contraste).
function prefsApply(changed){
  const b = document.body; if(!b) return;
  b.classList.toggle("lefty", !!PREFS.lefty);
  b.classList.toggle("text-lg", !!PREFS.textLg);
  b.classList.toggle("hi-contrast", !!PREFS.contrast);
  b.classList.toggle("cvd-rg", PREFS.cvd==="rg");
  b.classList.toggle("cvd-by", PREFS.cvd==="by");
  // controles táctiles: solo se tocan si el valor se aparta del de fábrica (así el 100% no crea transform ni opacity)
  const custom = PREFS.ctlSize!==100 || PREFS.ctlOp!==100;
  b.classList.toggle("ctl-custom", custom);
  b.style.setProperty("--ctl-sc", String(PREFS.ctlSize/100));
  b.style.setProperty("--ctl-inv", String(100/PREFS.ctlSize));
  b.style.setProperty("--ctl-op", String(PREFS.ctlOp/100));
  b.classList.toggle("atk-toggle", PREFS.atkMode==="toggle");
  b.classList.toggle("atk-auto", PREFS.atkMode==="auto");
  // los "+" de subir habilidad y el apuntado se ubican con el rect del botón: que se vuelvan a medir
  if(changed===true){ try{ window.dispatchEvent(new Event("resize")); }catch(e){} }
}
function prefSet(key, val){
  if(!(key in PREFS_DEFAULT)) return;
  if(key==="ctlSize") val = Math.max(90, Math.min(150, Math.round(+val/10)*10)) || 100;
  if(key==="ctlOp") val = Math.max(40, Math.min(100, Math.round(+val/10)*10)) || 100;
  PREFS[key] = val;
  prefsSave(); prefsApply(true);
  if(typeof optionsSync==="function") optionsSync();
}
/* ---------------- paleta para daltonismo ----------------
   Colores "rgb" (formato "r,g,b" como usa vfx.js) y hex. Nunca es lo único que distingue algo: las zonas de
   peligro suman rayado y borde punteado, el equipo enemigo anillo discontinuo y las barras marcas. Basada en
   la paleta de Okabe-Ito (azul / naranja / amarillo para rojo-verde; verde / rosa para azul-amarillo). */
const CVD_PAL = {
  rg:{ ally:"86,180,233", enemy:"255,176,0", danger:"255,176,0", safe:"86,180,233", good:"86,180,233", warn:"240,228,66", goodHex:"#7fd0ff", enemyHex:"#ffb000" },
  by:{ ally:"60,220,120", enemy:"255,60,110", danger:"255,60,110", safe:"60,220,120", good:"60,220,120", warn:"255,130,210", goodHex:"#5fe590", enemyHex:"#ff4d82" }
};
function cvdPal(){ return CVD_PAL[PREFS.cvd] || null; }

// Modo zurdo: TODO el HUD se espeja (lo de la izquierda pasa a la derecha y al revés), así los botones
// no caen encima de la vida/arena y el joystick no tapa la Definitiva. Lo que se dibuja en el canvas
// pegado a un costado (minimapas, racha) usa hudMirrorX: x de una caja de ancho w, del lado que toca.
function hudLefty(){ return !!PREFS.lefty; }
function hudMirrorX(x, w){ return PREFS.lefty ? VW - x - (w||0) : x; }
// Multiplicador de la sacudida de pantalla (lo usan juice.js y vfx.js). "Reducir movimiento" la apaga igual.
function prefShakeMult(){ return PREFS.shake==="off" ? 0 : PREFS.shake==="reducida" ? 0.4 : 1; }
// Vibración corta (ms o patrón). Con tope de frecuencia para que no zumbe sin parar en una pelea.
let _hapticLast = 0;
function hapticPulse(ms, force){
  if(!PREFS.vibrate) return false;
  const now = performance.now();
  if(!force && now - _hapticLast < 380) return false;
  try{
    if(typeof navigator!=="undefined" && typeof navigator.vibrate==="function"){ _hapticLast = now; return navigator.vibrate(ms) !== false; }
  }catch(e){}
  return false;
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", ()=>prefsApply()); else prefsApply();

/* ---------------- pantalla de Opciones (index.html #hub-options; también se abre desde la pausa) ---------------- */
// Refleja PREFS (y "Reducir movimiento", que vive en juice.js) en los interruptores y selectores.
function optionsSync(){
  const box = document.getElementById("hub-options"); if(!box) return;
  box.querySelectorAll(".opt-switch[data-pref]").forEach(b=>{
    const k = b.dataset.pref;
    const on = k==="motion" ? !!(typeof JUICE!=="undefined" && JUICE.reduceMotion) : !!PREFS[k];
    b.setAttribute("aria-checked", on ? "true" : "false");
    b.textContent = on ? "Sí" : "No";
  });
  box.querySelectorAll(".opt-seg[data-pref]").forEach(g=>{
    const k = g.dataset.pref, cur = k==="textLg" ? (PREFS.textLg ? "1" : "0") : String(PREFS[k]);
    g.querySelectorAll("button[data-v]").forEach(b=> b.setAttribute("aria-pressed", b.dataset.v===cur ? "true" : "false"));
  });
  box.querySelectorAll("input[data-pref-range]").forEach(r=>{
    const k = r.dataset.prefRange; if(+r.value!==PREFS[k]) r.value = PREFS[k];
    const out = box.querySelector('[data-pref-out="'+k+'"]'); if(out) out.textContent = PREFS[k]+"%";
  });
}
(function(){
  const bind = ()=>{
    const box = document.getElementById("hub-options"); if(!box) return;
    box.querySelectorAll(".opt-switch[data-pref]").forEach(b=> b.addEventListener("click", ()=>{
      const k = b.dataset.pref;
      if(k==="motion"){ if(typeof setReduceMotion==="function") setReduceMotion(!JUICE.reduceMotion); optionsSync(); return; }
      prefSet(k, !PREFS[k]);
      if(k==="vibrate" && PREFS.vibrate) hapticPulse(40, true); // se siente al prenderla (si el aparato puede)
    }));
    box.querySelectorAll(".opt-seg[data-pref]").forEach(g=> g.querySelectorAll("button[data-v]").forEach(b=> b.addEventListener("click", ()=>{
      const k = g.dataset.pref;
      prefSet(k, k==="textLg" ? b.dataset.v==="1" : b.dataset.v);
    })));
    box.querySelectorAll("input[data-pref-range]").forEach(r=> r.addEventListener("input", ()=> prefSet(r.dataset.prefRange, +r.value)));
    // la casilla "Reducir movimiento" de la pausa y la de Opciones muestran lo mismo
    const pm = document.getElementById("opt-reduce-motion"); if(pm) pm.addEventListener("change", ()=> setTimeout(optionsSync, 0));
    const po = document.getElementById("pause-opts-btn");
    if(po) po.addEventListener("click", ()=>{ if(typeof openHubOptions==="function") openHubOptions(); });
    optionsSync();
  };
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", bind); else bind();
})();
