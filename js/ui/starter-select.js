"use strict";
/* ============================================================
   js/ui/starter-select.js
   MODO CAMPAÑA (prueba): "Tu primer guardián". Al entrar por primera vez (o al abrir un enlace de
   invitación sin guardián propio) cada jugador elige UN guardián de regalo. Los demás quedan
   bloqueados y se compran en la Tienda (CHAMPION_PRICE_GOLD). Se muestran todos animados,
   quietos y respirando. `onDone` sigue el camino que se había interrumpido (menú o unirse a sala).
   REGALO INICIAL (js/systems/starter-gift.js): después del guardián viene el paso 2, "Tu skin de
   regalo": sus skins (de set y cromas) animadas como en la Tienda, la primera ya marcada (un toque
   en "¡La quiero!" alcanza). Al elegirla: "¡Es tuya!", queda equipada y sigue `onDone`.
   ============================================================ */
let _starterJoins = false; // el camino que sigue es entrar a la sala de otro: el Libro no lo demora (queda en el Códice)
let _starterPick = null, _starterDone = null, _starterSkinPick = null, _starterSkinBusy = false, _starterJustGot = null;
const STARTER_ROLE_LABEL = {tanque:"Tanque", asesino:"Asesino", mago:"Mago", soporte:"Soporte"};

// PRIMER MINUTO: la pantalla muestra 4 guardianes recomendados para quien nunca jugó (uno por rol) y "Ver todos" detrás
// (antes eran 34 tarjetas en scroll). NADA viene preseleccionado: antes se marcaba el Mago solo (y un toque del botón del
// título (o un doble toque) que "atravesaba" a la pantalla nueva dejaba una carta marcada sin querer). Por eso, además, las
// cartas ignoran toques en los primeros STARTER_TAP_GUARD_MS después de abrir la pantalla.
const STARTER_RECOMMENDED = [
  {id:"tanque",   why:"Aguanta y protege. Perdona errores: ideal para aprender."},
  {id:"mago",     why:"Pega de lejos con fuego, escarcha y rayos. Fácil de entender."},
  {id:"soporte",  why:"Cura y protege al equipo. Juega en segunda línea."},
  {id:"guerrero", why:"Rápido y letal, con trampas. Pide algo más de puntería."}
];
const STARTER_TAP_GUARD_MS = 400;
let _starterOpenedAt = 0, _starterAll = false;
function _starterOptions(){ return CHAMPION_CATALOG.filter(c=>championMeta(c.id).starterEligible && shopChampionPurchasable(c.id)); }
// Recomendados primero (en el orden de arriba), después el resto del catálogo.
function _starterOrdered(){
  const opts = _starterOptions(), rec = STARTER_RECOMMENDED.map(r=>opts.find(c=>c.id===r.id)).filter(Boolean);
  return {rec, all: rec.concat(opts.filter(c=>!rec.includes(c)))};
}
function _starterWhy(id){ const r = STARTER_RECOMMENDED.find(x=>x.id===id); return r ? r.why : ""; }
function openStarterSelect(onDone, opts){
  _starterJoins = !!(opts && opts.joinsRoom);
  _starterPick = null; _starterDone = onDone || null; _starterAll = false; _starterOpenedAt = performance.now() + 1e6; // se fija al terminar de dibujar (abajo)
  setState("starter");
  // ya tiene guardián y le falta la skin de regalo (cerró el juego en el medio): directo al paso 2
  if(!needsStarterChampion() && typeof needsStarterSkin==="function" && needsStarterSkin()){ openStarterSkinStep(); _starterOpenedAt = performance.now(); return; }
  _starterShowStep("champ");
  renderStarterSelect();
  // la marca va DESPUÉS de dibujar: si la máquina se trabó dibujando, los toques que ya estaban en cola (y su ev.timeStamp es anterior)
  // siguen contando como "recién abierta la pantalla"
  _starterOpenedAt = performance.now();
}
function _starterShowStep(step){
  const a = document.getElementById("starter-step-champ"), b = document.getElementById("starter-step-skin");
  if(a) a.classList.toggle("hidden", step!=="champ");
  if(b) b.classList.toggle("hidden", step!=="skin");
  const sc = document.getElementById("starter-screen"); if(sc) sc.scrollTop = 0;
}
function _starterFinish(){
  const next = _starterDone; _starterDone = null;
  const go = next || (()=>{ setState("mainmenu"); renderMainMenu(); });
  // EL LIBRO DE LA HORDA ya no se abre acá (eran 8 páginas antes de jugar): se OFRECE al volver de la primera arena
  // (codexBookOffer, js/ui/codex/codex-book.js) y queda siempre en Códice › El Libro.
  if(typeof firstMinuteMark==="function" && !_starterJoins) firstMinuteMark(); // recién eligió guardián: toca la historia corta antes del tutorial
  go();
}
function renderStarterSelect(){
  const pr = document.getElementById("starter-price"); if(pr) pr.textContent = fmtGold(CHAMPION_PRICE_GOLD);
  const grid = document.getElementById("starter-grid"); if(!grid) return;
  const ord = _starterOrdered(), recIds = new Set(ord.rec.map(c=>c.id));
  grid.classList.toggle("all", _starterAll);
  const allBtn = document.getElementById("starter-all-btn");
  if(allBtn){
    allBtn.classList.toggle("hidden", ord.all.length <= ord.rec.length);
    allBtn.textContent = _starterAll ? "‹ Solo los recomendados" : `Ver los ${ord.all.length} guardianes`;
  }
  grid.innerHTML = ord.all.map(c=>{
    const cls = CLASSES[c.id], reco = recIds.has(c.id);
    return `<button class="gallery-card starter-card ${reco?"reco":"more"} ${_starterPick===c.id?"sel":""}" data-champ="${c.id}">
      <canvas class="champ-anim starter-anim" width="110" height="110" data-class-key="${c.id}" data-idle="1" style="background:${cls.color}1c;"></canvas>
      <div class="gallery-card-name">${championShortName(c.id)}</div><div class="champ-title">${championTitle(c.id)}</div>
      ${(STARTER_ROLE_LABEL[cls.roleCategory]||"") && STARTER_ROLE_LABEL[cls.roleCategory]!==championShortName(c.id) ? `<div class="mychamp-meta">${STARTER_ROLE_LABEL[cls.roleCategory]}</div>` : ""}
      <div class="starter-lore">${reco ? _starterWhy(c.id) : c.lore}</div>
    </button>`;
  }).join("");
  grid.querySelectorAll(".starter-card").forEach(card=>{
    card.addEventListener("click", ev=>{
      // doble toque en el botón del título: el segundo caía sobre la carta que quedaba debajo (el Mago, justo al centro). Las pruebas
      // automáticas con webdriver (que clickean enseguida) no pasan por acá, igual que el resto de lo nuevo del primer minuto.
      if(typeof firstMinuteEnabled==="function" && firstMinuteEnabled() && (ev.timeStamp || performance.now()) - _starterOpenedAt < STARTER_TAP_GUARD_MS) return;
      _starterPick = card.getAttribute("data-champ");
      grid.querySelectorAll(".starter-card").forEach(c2=>c2.classList.toggle("sel", c2===card));
      _starterShowConfirm();
      // el cartel de confirmar es pegajoso (abajo): se baja todo lo posible sin perder de vista la carta
      // elegida, así el cartel queda en su lugar debajo de las cartas y no tapa la etiqueta de otras
      const sc = document.getElementById("starter-screen");
      if(sc){
        const top = card.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 8;
        sc.scrollTo({top:Math.max(0, Math.min(sc.scrollHeight - sc.clientHeight, top)), behavior:"smooth"});
      }
    });
  });
  const box = document.getElementById("starter-confirm"); if(box && !_starterPick) box.classList.add("hidden");
  if(_starterPick) _starterShowConfirm();
  startChampAnimLoop();
}
function _starterShowConfirm(){
  const box = document.getElementById("starter-confirm"), txt = document.getElementById("starter-confirm-text");
  if(!box || !txt || !_starterPick || !CLASSES[_starterPick]) return;
  txt.innerHTML = `¿Elegir a <b>${CLASSES[_starterPick].name}</b>? <details><summary>Ver habilidades</summary>${championGuideHTML(_starterPick)}</details>`;
  box.classList.remove("hidden");
}
function grantStarterChampion(key){
  if(!CLASSES[key] || !save.champions[key]) return false;
  save.champions[key].unlocked = true;
  save.starterChosen = true;
  selectedClass = key; save.lastChamp = key;
  // REGALO INICIAL: ahora le toca elegir la skin de regalo de este guardián
  if(typeof starterGiftEnabled==="function" && starterGiftEnabled() && !save.starterSkin) save.starterSkinPending = true;
  persistNow();
  return true;
}
document.getElementById("starter-all-btn").addEventListener("click", ()=>{
  _starterAll = !_starterAll;
  renderStarterSelect();
  const sc = document.getElementById("starter-screen"); if(sc) sc.scrollTop = 0;
});
document.getElementById("starter-yes-btn").addEventListener("click", ()=>{
  if(!_starterPick || !grantStarterChampion(_starterPick)) return;
  // el "¡X se une a tu equipo!" (neutro: hay guardianas) va en el subtítulo del paso 2 (antes era un aviso arriba a la derecha que tapaba el final
  // del subtítulo); si no hay paso 2, un aviso normal (la pantalla que sigue no tiene nada arriba a la derecha)
  if(typeof needsStarterSkin==="function" && needsStarterSkin()){ _starterJustGot = _starterPick; openStarterSkinStep(); return; }
  if(typeof showNetToast==="function") showNetToast(`🎁 ${CLASSES[_starterPick].name} se une a tu equipo`);
  _starterFinish();
});
document.getElementById("starter-no-btn").addEventListener("click", ()=>{
  _starterPick = null;
  document.getElementById("starter-confirm").classList.add("hidden");
  document.querySelectorAll(".starter-card").forEach(c=>c.classList.remove("sel"));
});
// El guardián seleccionado siempre tiene que ser uno PROPIO: si no, el Mago si es tuyo, y si no el primero
// que tengas. Sin ningún guardián propio (perfil nuevo o reiniciado: todavía falta el de regalo) queda el
// Mago por defecto y devuelve false; nunca queda apuntando a otro guardián bloqueado (ej. el Asesino).
function ensureOwnedSelection(){
  const usable = k=>save.champions[k] && save.champions[k].unlocked && (typeof championPlayable!=="function" || championPlayable(k));
  if(usable(selectedClass)) return true;
  const own = usable(DEFAULT_CHAMPION) ? DEFAULT_CHAMPION : Object.keys(CLASSES).find(usable);
  if(own){ selectedClass = own; return true; }
  if(CLASSES[DEFAULT_CHAMPION]) selectedClass = DEFAULT_CHAMPION;
  return false;
}

/* ---------------- paso 2: la skin de regalo ---------------- */
function _starterEsc(t){ return String(t==null ? "" : t).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function openStarterSkinStep(){
  ensureOwnedSelection(); // la skin es para el guardián de regalo (el único tuyo en un perfil nuevo)
  const opts = starterSkinOptions(selectedClass);
  _starterSkinPick = null; _starterSkinBusy = false; // saltable por defecto: nada marcado, el botón principal es "Elegir después"
  if(state!=="starter") setState("starter");
  _starterShowStep("skin");
  renderStarterSkinStep();
  if(typeof playSfx==="function") playSfx("ready");
}
function renderStarterSkinStep(){
  const k = selectedClass, cls = CLASSES[k] || {}, opts = starterSkinOptions(k);
  const sub = document.getElementById("starter-skin-sub"), grid = document.getElementById("starter-skin-grid");
  const yes = document.getElementById("starter-skin-yes-btn"), later = document.getElementById("starter-skin-later-btn");
  const txt = document.getElementById("starter-skin-confirm-text");
  if(!grid) return;
  if(!opts.length){
    // guardián sin skins todavía: un vale para la Tienda (cubre cualquier skin o croma)
    if(sub) sub.innerHTML = `<b style="color:${cls.color||"#ffcf5c"}">${_starterEsc(cls.name)}</b> todavía no tiene skins: te guardamos un <b>vale de skin</b>.`;
    grid.innerHTML = `<div class="gallery-card starter-skin-card starter-skin-vale">
      <canvas class="champ-anim starter-anim" width="110" height="110" data-class-key="${k}" data-idle="1" data-skin="" style="background:${cls.color||"#888"}1c;"></canvas>
      <div class="gallery-card-name">🎟 Vale de skin</div>
      <div class="starter-lore">Canjealo cuando quieras en la Tienda por cualquier skin o croma: el precio queda cubierto.</div></div>`;
    if(txt) txt.innerHTML = "Tu vale te espera en la Tienda.";
    if(yes){ yes.textContent = "¡Seguir!"; yes.classList.remove("hidden"); yes.disabled = false; if(yes.parentElement) yes.parentElement.classList.remove("hidden"); }
    if(later) later.classList.add("hidden");
    startChampAnimLoop();
    return;
  }
  const nm = `<b style="color:${cls.color||"#ffcf5c"}">${_starterEsc(cls.name)}</b>`;
  if(sub) sub.innerHTML = _starterJustGot===k
    ? `🎁 ¡${nm} se une a tu equipo! Si querés, elegí su skin (es tuya y la llevás puesta). Si no, seguí: te guardamos un vale para la Tienda.`
    : `Si querés, elegí una skin para ${nm} (es tuya y la llevás puesta). Si no, seguí: te guardamos un vale para la Tienda.`;
  grid.innerHTML = opts.map(o=>`<button class="gallery-card starter-skin-card ${_starterSkinPick===o.id?"sel":""}" data-skin-gift="${o.id}">
      <span class="starter-skin-own hidden">¡Es tuya!</span>
      <canvas class="champ-anim starter-anim" width="110" height="110" data-class-key="${k}" data-skin="${o.id}" data-idle="1" style="background:${cls.color||"#888"}1c;"></canvas>
      <div class="gallery-card-name">${_starterEsc(o.name)}</div>
      <div class="mychamp-meta starter-skin-tag" style="color:${o.color}">${o.kind==="croma" ? "◆" : "✦"} ${_starterEsc(o.tag)}</div>
      <div class="starter-lore">${_starterEsc(o.lore)}</div>
    </button>`).join("");
  const setTxt = ()=>{
    const o = opts.find(x=>x.id===_starterSkinPick);
    if(txt) txt.innerHTML = o ? `¿Te quedás con <b>${_starterEsc(o.name)}</b>?` : "Sin apuro: la skin se puede elegir cuando quieras en la Tienda.";
    if(yes){ yes.textContent = "¡La quiero!"; yes.classList.toggle("hidden", !o); }
    if(later){ later.textContent = o ? "Elegir después" : "Seguir sin skin ›"; later.classList.toggle("secondary", !!o); }
  };
  if(yes){ yes.disabled = false; if(yes.parentElement) yes.parentElement.classList.remove("hidden"); }
  if(later){ later.classList.remove("hidden"); later.disabled = false; }
  setTxt();
  grid.querySelectorAll("[data-skin-gift]").forEach(card=> card.addEventListener("click", ()=>{
    if(_starterSkinBusy) return;
    _starterSkinPick = card.getAttribute("data-skin-gift");
    grid.querySelectorAll("[data-skin-gift]").forEach(c2=>c2.classList.toggle("sel", c2===card));
    setTxt();
  }));
  startChampAnimLoop();
}
document.getElementById("starter-skin-yes-btn").addEventListener("click", ()=>{
  if(_starterSkinBusy) return;
  const k = selectedClass;
  if(!starterSkinOptions(k).length){ starterSkinVoucher(); _starterFinish(); return; }
  const id = _starterSkinPick; if(!id) return;
  const r = starterSkinGrant(k, id);
  if(!r.ok){ gameAlert(r.reason); return; }
  _starterSkinBusy = true;
  const d = typeof skinDefOf==="function" ? skinDefOf(id) : null, nm = (d && d.name) || id;
  const card = document.querySelector(`#starter-skin-grid [data-skin-gift="${id}"]`);
  if(card){ card.classList.add("owned"); const st = card.querySelector(".starter-skin-own"); if(st) st.classList.remove("hidden"); }
  const txt = document.getElementById("starter-skin-confirm-text");
  if(txt) txt.innerHTML = `🎨 <b>¡Es tuya!</b> ${_starterEsc(nm)}${r.equipped ? " · equipada en " + _starterEsc(CLASSES[k].name) : ""}`;
  const yes = document.getElementById("starter-skin-yes-btn"), row = yes.parentElement;
  yes.disabled = true; document.getElementById("starter-skin-later-btn").disabled = true;
  if(row) row.classList.add("hidden"); // un instante de festejo y sigue solo
  if(typeof playSfx==="function") playSfx("levelup");
  // sin aviso arriba a la derecha: el cartel de confirmar ya dice "¡Es tuya!" (el aviso tapaba el subtítulo)
  setTimeout(()=>{ _starterSkinBusy = false; _starterJustGot = null; if(state==="starter") _starterFinish(); }, 1100);
});
document.getElementById("starter-skin-later-btn").addEventListener("click", ()=>{
  if(_starterSkinBusy) return;
  starterSkinVoucher();
  if(typeof showNetToast==="function") showNetToast("🎟 Te guardamos un vale de skin: canjealo en la Tienda cuando quieras");
  _starterFinish();
});
