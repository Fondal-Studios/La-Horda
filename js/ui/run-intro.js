"use strict";
/* ============================================================
   js/ui/run-intro.js
   PANTALLA PREVIA A LA PARTIDA — el Hechicero Supremo, todavía "angelical".
   Antes de cada partida (modo solo) aparece el guía: tapado, dorado, con alas de luz (dibujadas
   en vivo, estilo "alas de luz" de los ángeles de Diablo) y una FICHA CLARA de la arena:
   qué es, qué te mata, qué te ayuda y cuál es el objetivo. Sin acertijos: frases cortas que se
   entienden a la primera. Se toca en cualquier lado (o el botón) para empezar.
   En cooperativo online no se muestra (bloquearía a los demás): ahí el Hechicero habla en
   el panel del tutorial, como siempre.
   Ojo de la historia: acá parece un ángel. En la Arena Infernal se revela (inf-hechicero.js).
   ============================================================ */
const ARENA_BRIEF = {
  ciudad: {
    say:"Esta es tu ciudad, guardián, y la Horda volvió. No podés salvarlos a todos, pero vas a intentarlo. Cuando esto termine, te voy a mostrar el camino.",
    kill:"La horda que derriba las ESTRUCTURAS: si caen todas las críticas, la ciudad cae y perdés. En el nivel 9, los subjefes; en el 10, El Presentador.",
    help:"Los CIVILES escondidos: acercate y MANTENÉ RESCATAR, y llevalos a un refugio (escudo verde). Cada rescate da oro y XP.",
    goal:"Sobreviví 10 niveles, protegé la ciudad y derrotá a El Presentador."},
  fortaleza: {
    say:"La Ciudad Maldita resistió, pero la Horda dejó una CICATRIZ. Seguila: empieza en esta fábrica que no para nunca. Los que la construyeron desaparecieron; sus máquinas todavía no se enteraron.",
    kill:"Trampas (vapor, rejillas al rojo, prensas y cadenas), puentes que se mueven, el Dragón de la Forja y el Caballero Oxidado.",
    help:"Mirá el piso: las marcas avisan. Al Caballero NO le pegues cuando brilla azul (contraataca).",
    goal:"Cruzá la Fábrica Sin Fin y derrotá al Caballero de la Armadura Oxidada."},
  bosque: {
    say:"Acá duerme el más viejo de los Cuatro Guardianes, el de la NIEBLA, y lo que duerme ya no es él. Liberalo y traé su cristal. Yo sé cómo cuidarlo.",
    kill:"Enemigos que se regeneran, emboscadas en la maleza que se sacude y el Guardián Ancestral, que se corrompe en la Bestia del Bosque.",
    help:"Las RUNAS de piedra: mantené ✚ junto a una que brille y las raíces atrapan a la horda.",
    goal:"Sobreviví 10 niveles, vencé al Guardián Ancestral y recuperá el PRIMER CRISTAL."},
  micelial: {
    say:"Una caverna viva, que crece y repite voces que escuchó hace siglos. Si la dejás, la infección se come el mapa. No escuches a las esporas: mienten con voces conocidas.",
    kill:"Esporas, zonas infectadas que te debilitan, el Micelio Primigenio y la Madre Espora en el centro.",
    help:"Rompé los NÚCLEOS MICELIALES: cada uno que cae limpia la infección de su zona.",
    goal:"Frená la colonia y derrotá a la Madre Espora."},
  hielo: {
    say:"Acá espera el SEGUNDO Guardián. Resistió solo más que nadie, esperando a alguien que no volvió. No le debas nada: tomá el cristal.",
    kill:"El frío que se acumula si no te movés, las novas de hielo y el Mago Gélido, que se corrompe en su forma demoníaca.",
    help:"Los BRASEROS: mantené 🔥 junto a uno (o prendelo con fuego) y el frío baja. Seguí moviéndote.",
    goal:"Derrotá al Mago Gélido en sus dos formas y recuperá el SEGUNDO CRISTAL."},
  acuatica: {
    say:"Este mar no estaba acá antes de que tomaras el segundo cristal. Es el precio: la realidad se dobla alrededor de ellos. Protegelos. Son lo único que importa.",
    kill:"Charcos que brillan antes de dar una descarga, el Kraken Joven (nivel 6) y el Leviatán que ataca desde el borde.",
    help:"Las CORRIENTES: seguilas para moverte rápido o para arrastrar a la horda lejos de vos.",
    goal:"Llegá al nivel 10 y vencé al Leviatán en sus 3 fases."},
  laberinto: {
    say:"El TERCER Guardián levantó estos muros para esconderse de la Horda… y de otros. Si te habla, no le creas: la piedra le comió el juicio. Traeme… traé el tercer cristal.",
    kill:"Quedarte encerrado entre muros, los sismos, el Guardián del Laberinto (nivel 6) y el Minotauro.",
    help:"Los SELLOS del piso, en orden I → II → III: aturden a la horda y te curan. Hacé chocar al Minotauro contra un muro.",
    goal:"Activá los sellos, derrotá al Minotauro y recuperá el TERCER CRISTAL."},
  abismo: {
    say:"Tres cristales, y el mundo ya no los aguanta: se abre debajo tuyo. Es el punto de no retorno. Tuviste dudas, es natural. Seguí igual.",
    kill:"El borde (si caés, quedás colgado: un compañero te sube), el Jinete que carga en línea, el Carcelero y sus cadenas y lo que vive debajo.",
    help:"Mirá las GRIETAS: una plataforma crítica tiembla y larga piedras antes de caer. Empujá a la horda al vacío y usá al Jinete como arma.",
    goal:"Sobreviví a las ruinas, vencé al Carcelero del Vacío y enfrentá a El Que Mora Debajo."},
  minas: {
    say:"Debajo del Abismo hay minas, y debajo de las minas, una puerta. Acá la LUZ ES TERRITORIO. Otros bajaron antes que vos: no leas lo que dejaron escrito.",
    kill:"La oscuridad (recibís más daño y te emboscan), el Devoraluz que apaga las lámparas, el Titán de Piedra (nivel 8) y Cerbero.",
    help:"Si una luz se apaga, acercate y MANTENÉ ENCENDER. Cerbero se expone a la luz y se enfurece en la oscuridad.",
    goal:"Derrotá a Cerbero y ATRAVESÁ el Portal Infernal que se abre: recién ahí termina la arena."},
  infernal: {
    say:"La dimensión de la Horda. Tus habilidades pegan menos acá: jugá con cuidado. Alguien está encadenado en el fondo; no le hagas caso. Y traeme los cristales.",
    kill:"Las FISURAS de donde sale la horda, el fuego del piso y lo que te espera en el nivel 9.",
    help:"Cerrá las fisuras: mantené ✖ junto a una (quema un poco, pero corta la horda). Alguien está encadenado en el fondo.",
    goal:"Llegá al corazón del Infierno. Ahí te voy a estar esperando."}
};
// Aviso (solo texto, sin sistema que adjudique): "completar el juego" = vencer al Rey de la Horda en la Arena Infernal, la misma condición
// que abre a Aurelia (js/systems/ascension-unlocks.js). Mismo texto que la tarjeta de Campaña (#campaign-first-notice en index.html).
const FIRST_FINISH_NOTICE = "El primer jugador en completar el juego puede pedir un campeón con diseño propio.";
const RUN_INTRO = { open:false, raf:0, t0:0, onGo:null, prologue:false, pages:[], arena:null, turning:false };

function runIntroShow(arena, onGo){
  const el = document.getElementById("run-intro"); const B = ARENA_BRIEF[arena];
  if(!el || !B){
    // sin ficha: igual se espera a que termine de bajar el arte de las arenas (preload.js)
    if(typeof assetsAllReady==="function" && !assetsAllReady()){ if(typeof showNetToast==="function") showNetToast("Preparando la arena…"); whenAssetsReady(onGo); }
    else onGo();
    return;
  }
  // Pantallas de historia antes de la ficha (con la partida todavía sin empezar, en vez de taparte la
  // pantalla en pleno combate): el PRÓLOGO la primera vez en la primera arena, y el cartel de cada ACTO
  // la primera vez que entrás a la arena que lo abre (STORY_ACTS, js/data/story-text.js).
  const pages = [];
  if(typeof save!=="undefined" && !save.storyPrologueSeen && typeof ARENA_ORDER!=="undefined" && arena===ARENA_ORDER[0] && typeof CAMPAIGN_PROLOGUE==="string"){
    save.storyPrologueSeen = true;
    pages.push(...(typeof CAMPAIGN_PROLOGUE_PAGES!=="undefined" ? CAMPAIGN_PROLOGUE_PAGES : [{who:"PRÓLOGO", title:"LA NOCHE EN QUE VOLVIÓ LA HORDA", text:CAMPAIGN_PROLOGUE}]));
  }
  if(typeof goalMissionPages==="function") pages.unshift(...goalMissionPages()); // misión: SOBREVIVIR, antes de la historia
  const act = typeof storyActOf==="function" ? storyActOf(arena) : null;
  if(act && act.arenas[0]===arena && typeof save!=="undefined" && !(save.storyActsSeen && save.storyActsSeen[act.n])){
    save.storyActsSeen = save.storyActsSeen || {}; save.storyActsSeen[act.n] = 1;
    pages.push({who:"ACTO " + act.n, title:act.name, text:act.intro});
  }
  if(pages.length && typeof persist==="function") persist();
  RUN_INTRO.pages = pages; RUN_INTRO.prologue = pages.length > 0;
  runIntroFill(el, arena, B);
  el.classList.remove("hidden");
  RUN_INTRO.open = true; RUN_INTRO.onGo = onGo; RUN_INTRO.t0 = performance.now(); RUN_INTRO.arena = arena;
  cancelAnimationFrame(RUN_INTRO.raf);
  const cv = el.querySelector("canvas");
  const draw = ()=>runIntroDraw(cv);
  draw();
  if(typeof playSfx==="function") playSfx("ready");
}
function runIntroFill(el, arena, B){
  const M = ARENA_MODS[arena] || {};
  const pro = !!RUN_INTRO.prologue;
  el.classList.toggle("ri-prologue", pro);
  const go = el.querySelector(".ri-go");
  go.textContent = pro ? "SEGUIR ▸" : "¡A LA BATALLA!"; go.disabled = false;
  // todavía baja el arte de las arenas: el botón lo dice y se habilita solo al terminar
  if(!pro && typeof assetsAllReady==="function" && !assetsAllReady()){
    go.disabled = true; go.textContent = "Preparando la arena… " + assetsRestPct() + "%";
    whenAssetsReady(()=>{ if(!RUN_INTRO.prologue){ go.disabled = false; go.textContent = "¡A LA BATALLA!"; } },
      pct=>{ if(!RUN_INTRO.prologue && go.disabled) go.textContent = "Preparando la arena… " + pct + "%"; });
  }
  const tap = el.querySelector(".ri-tap"); if(tap) tap.textContent = pro ? "tocá SEGUIR para pasar de página" : "tocá ¡A LA BATALLA! para empezar";
  // "Saltar ▸▸" (arriba a la izquierda, sobre el arte): con la historia en pantalla, un toque lleva directo a la
  // ficha de la arena (primer arranque corto)
  let skip = el.querySelector(".ri-skip");
  if(!skip){
    skip = document.createElement("button"); skip.type = "button"; skip.className = "btn secondary small ri-skip"; skip.textContent = "Saltar ▸▸";
    skip.setAttribute("aria-label", "Saltar la historia");
    skip.addEventListener("click", ev=>{
      ev.stopPropagation(); if(!RUN_INTRO.open || !RUN_INTRO.prologue || RUN_INTRO.turning) return;
      RUN_INTRO.pages = []; RUN_INTRO.prologue = false; RUN_INTRO.t0 = performance.now();
      runIntroFill(el, RUN_INTRO.arena, ARENA_BRIEF[RUN_INTRO.arena]);
    });
    el.appendChild(skip);
  }
  skip.classList.toggle("hidden", !pro);
  const who = el.querySelector(".ri-who"), hero = runIntroHeroEl(el), actEl = el.querySelector(".ri-act");
  if(pro){
    const P = RUN_INTRO.pages[0];
    if(who) who.textContent = P.who;
    el.querySelector(".ri-arena").textContent = P.title;
    el.querySelector(".ri-say").textContent = P.text;
    hero.textContent = ""; hero.style.display = "none"; if(actEl) actEl.textContent = "";
    return;
  }
  if(who) who.textContent = "CÓDICE · TU PRÓXIMA INCURSIÓN";
  // en qué acto de la historia estás, y lo que dice tu guardián al entrar (HERO_VOICES, story-text.js)
  const act = typeof storyActOf==="function" ? storyActOf(arena) : null;
  if(actEl) actEl.textContent = act ? "ACTO " + act.n + " · " + act.name : "";
  const HV = typeof HERO_VOICES!=="undefined" && typeof selectedClass!=="undefined" ? HERO_VOICES[selectedClass] : null;
  const cls = typeof CLASSES!=="undefined" && typeof selectedClass!=="undefined" ? CLASSES[selectedClass] : null;
  if(HV && HV.pick && cls){ hero.innerHTML = ""; const b = document.createElement("b"); b.textContent = cls.name; b.style.color = cls.color || ""; hero.appendChild(b); hero.appendChild(document.createTextNode(" «" + HV.pick + "»")); hero.style.display = ""; }
  else { hero.textContent = ""; hero.style.display = "none"; }
  el.querySelector(".ri-arena").textContent = (M.icon ? M.icon + " " : "") + (typeof campaignNumberLabel==="function" && campaignNumberLabel(arena) ? campaignNumberLabel(arena) + " — " : "") + (M.label || arena).toUpperCase();
  el.querySelector(".ri-say").textContent = "Avanzá por la campaña, recuperá los cristales y enfrentá al Rey de la Horda. Esta página te muestra cómo superar la arena que elegiste.";
  el.querySelector(".ri-kill").textContent = B.kill;
  el.querySelector(".ri-help").textContent = B.help;
  el.querySelector(".ri-goal").textContent = (/^Sobreviv/.test(B.goal) ? "" : "SOBREVIVÍ: aguantá 10 niveles con vida. ") + B.goal;
  const first = el.querySelector(".ri-first");
  if(first){ first.hidden = arena !== "infernal"; first.textContent = arena === "infernal" ? "🏆 " + FIRST_FINISH_NOTICE : ""; }
  const cr = el.querySelector(".ri-crystals");
  if(cr){ const show = typeof crystalRowHtml==="function" && (crystalsOwned().length > 0 || CRYSTAL_BY_ARENA[arena] || arena==="infernal"); cr.innerHTML = show ? crystalRowHtml() + (typeof resonancePickerHtml==="function" ? '<div class="res-wrap">' + resonancePickerHtml() + '</div>' : "") : ""; if(show && typeof resonanceBindPicker==="function") resonanceBindPicker(cr); cr.style.display = show ? "" : "none"; }
}
// Línea del guardián elegido y rótulo del acto (se crean una vez dentro de la tarjeta de la ficha).
function runIntroHeroEl(el){
  let h = el.querySelector(".ri-hero");
  if(!h){
    h = document.createElement("div"); h.className = "ri-hero";
    const say = el.querySelector(".ri-say"); say.parentNode.insertBefore(h, say.nextSibling);
    const a = document.createElement("div"); a.className = "ri-act";
    const ar = el.querySelector(".ri-arena"); ar.parentNode.insertBefore(a, ar);
  }
  return h;
}
function runIntroGo(){
  if(!RUN_INTRO.open || RUN_INTRO.turning) return;
  if(performance.now() - RUN_INTRO.t0 < 450) return; // un toque apurado del botón "Comenzar" no la saltea
  if(RUN_INTRO.prologue){ // pantalla de historia → la siguiente, y al final la ficha de la arena
    runIntroTurnPage(()=>{
      RUN_INTRO.pages.shift(); RUN_INTRO.prologue = RUN_INTRO.pages.length > 0; RUN_INTRO.t0 = performance.now();
      runIntroFill(document.getElementById("run-intro"), RUN_INTRO.arena, ARENA_BRIEF[RUN_INTRO.arena]);
    });
    return;
  }
  if(typeof assetsAllReady==="function" && !assetsAllReady()) return; // "Preparando la arena…"
  RUN_INTRO.open = false; cancelAnimationFrame(RUN_INTRO.raf);
  document.getElementById("run-intro").classList.add("hidden");
  const fn = RUN_INTRO.onGo; RUN_INTRO.onGo = null; if(fn) fn();
}
// El libro solo anima al pasar página; permanece quieto durante la lectura.
const RUN_BOOK_ART = new Image();
RUN_BOOK_ART.src = "assets/ui/codex/grimoire.webp";
RUN_BOOK_ART.onload = ()=>{ if(RUN_INTRO.open) runIntroDraw(document.querySelector("#run-intro canvas")); };
function runIntroDraw(cv){
  if(!cv) return;
  const dpr = Math.min(2, window.devicePixelRatio||1);
  const W=cv.clientWidth, H=cv.clientHeight;
  cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr);
  const c=cv.getContext("2d"); c.setTransform(dpr,0,0,dpr,0,0);
  if(RUN_BOOK_ART.complete && RUN_BOOK_ART.naturalWidth){
    const scale=Math.min(W/RUN_BOOK_ART.naturalWidth,H/RUN_BOOK_ART.naturalHeight);
    const w=RUN_BOOK_ART.naturalWidth*scale,h=RUN_BOOK_ART.naturalHeight*scale;
    c.imageSmoothingEnabled=false;c.drawImage(RUN_BOOK_ART,(W-w)/2,(H-h)/2,w,h);
  }
}
function runIntroTurnPage(done){
  const el=document.getElementById("run-intro"),cv=el.querySelector("canvas");
  if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches){done();return;}
  RUN_INTRO.turning=true; el.classList.add("ri-turning");
  const start=performance.now(), duration=520;
  function frame(now){
    if(!RUN_INTRO.open){RUN_INTRO.turning=false;el.classList.remove("ri-turning");return;}
    const p=Math.min(1,(now-start)/duration),ease=(1-Math.cos(p*Math.PI))/2;
    runIntroDraw(cv);
    const c=cv.getContext("2d"),W=cv.clientWidth,H=cv.clientHeight;
    const size=Math.min(W,H),cx=W/2,top=(H-size)/2+size*.12, bottom=top+size*.64;
    // Une feuille tourne autour de la reliure: son bord traverse de droite à gauche.
    const edge=cx+Math.cos(ease*Math.PI)*size*.39, lift=Math.sin(ease*Math.PI)*size*.13;
    c.save(); c.beginPath();c.moveTo(cx,top);c.lineTo(edge,top-lift);c.lineTo(edge,bottom-lift*.4);c.lineTo(cx,bottom);c.closePath();
    const g=c.createLinearGradient(Math.min(cx,edge),0,Math.max(cx,edge)+.1,0);
    g.addColorStop(0,ease<.5?"#ac7941":"#e8cd91");g.addColorStop(1,ease<.5?"#f3dfa8":"#9a6936");c.fillStyle=g;c.shadowColor="#0009";c.shadowBlur=12;c.fill();c.shadowBlur=0;c.strokeStyle="#9b733e";c.stroke();
    c.clip();c.globalAlpha=.35;c.strokeStyle="#805b2e";
    for(let i=1;i<9;i++){c.beginPath();c.moveTo(cx+(edge-cx)*.12,top+size*.1+i*size*.045);c.lineTo(cx+(edge-cx)*.85,top+size*.1+i*size*.045-lift*.5);c.stroke();}
    c.restore();
    if(p<1){RUN_INTRO.raf=requestAnimationFrame(frame);}else{RUN_INTRO.turning=false;el.classList.remove("ri-turning");runIntroDraw(cv);done();}
  }
  RUN_INTRO.raf=requestAnimationFrame(frame);
}
window.addEventListener("resize",()=>{if(RUN_INTRO.open)runIntroDraw(document.querySelector("#run-intro canvas"));});
(()=>{
  const el = document.getElementById("run-intro"); if(!el) return;
  el.addEventListener("click", (e)=>{ // en la ficha larga, deslizar/tocar el texto NO empieza la partida: solo el botón (o el fondo)
    if(!e.target.closest || !e.target.closest(".ri-go")) return;
    runIntroGo();
  });
  document.addEventListener("keydown", (e)=>{ if(RUN_INTRO.open && (e.key==="Enter" || e.key===" ") && !e.target.closest("button")){ e.preventDefault(); runIntroGo(); } });
})();
