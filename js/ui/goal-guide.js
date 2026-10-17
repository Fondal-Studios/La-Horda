"use strict";
/* ============================================================
   js/ui/goal-guide.js
   OBJETIVO CLARO — "sobrevivir". Reseña de jugadores: nadie entendía qué había que hacer.
   Todo en lenguaje simple (pensado para que lo entienda un chico de 10 años):
   - Cartel fijo en el HUD (#goal-chip) que dice QUÉ hacer ahora y cuánto falta.
   - Tarjeta de MISIÓN antes de la primera arena (páginas de la ficha del Hechicero).
   - Motivo de la derrota ("por qué perdí") y resumen al ganar la primera arena.
   Solo lee estado del juego; no cambia reglas, daño ni recompensas.
   ============================================================ */
const GOAL_LEVELS = 10;
// Páginas de la tarjeta de misión (la primera vez que se entra a una arena de campaña).
const GOAL_MISSION_PAGES = [
  {who:"CÓDICE · 1 / 3", title:"¿QUÉ ES LA HORDA?",
   text:"Un juego de acción y supervivencia: elegís un guardián, enfrentás oleadas de monstruos y lo hacés más fuerte. Tu gran objetivo en la campaña es atravesar diez arenas, recuperar los cristales de los Guardianes y vencer al Rey de la Horda."},
  {who:"CÓDICE · 2 / 3", title:"TU PRIMERA VICTORIA",
   text:"Empezá en la Ciudad Maldita. Sobreviví a sus 10 niveles, protegé las estructuras importantes y derrotá al jefe final. Movete, esquivá las marcas de peligro y usá tus habilidades. Rescatá civiles para ganar oro y experiencia. Si cae toda la ciudad o todo tu equipo, perdés."},
  {who:"CÓDICE · 3 / 3", title:"CADA INCURSIÓN TE PREPARA",
   text:"Conseguí experiencia, oro y equipo; al volver, revisá tu guardián y prepará la próxima arena. Los niveles de la incursión empiezan de nuevo en cada intento. El progreso de tu guardián es distinto y se guarda; una derrota puede descontar parte de lo ganado en esa incursión. Consultá este libro desde CÓDICE cuando lo necesites."}
];
function goalNeedsMission(){
  if(typeof save==="undefined" || !save) return false;
  if((typeof divinaMode!=="undefined" && divinaMode) || (typeof endlessOn==="function" && endlessOn())) return false;
  const t = save.tut || {};
  return !t.goalBookV1;
}
function goalMissionPages(){
  if(!goalNeedsMission()) return [];
  save.tut = save.tut || {}; save.tut.goalMission = 1; save.tut.goalBookV1 = 1;
  return GOAL_MISSION_PAGES.map(p=>Object.assign({}, p));
}
// Texto del cartel fijo según el momento de la partida (null = no mostrar).
function goalChipText(){
  if(typeof state==="undefined" || state!=="playing" || !player) return null;
  if(typeof lanesOn==="function" && lanesOn()) return LN.mode==="coliseo" ? "OBJETIVO: ganá duelos 2v2 · primero a "+COL.WIN_POINTS+" puntos" : "OBJETIVO: derribá torres y cristal rival · cuidá el tuyo"; // Guerra de Cristales / Coliseo
  if(typeof ALPHA_TRAINING!=="undefined" && ALPHA_TRAINING.active) return null;
  if(typeof endlessOn==="function" && endlessOn()) return null;
  if(typeof divinaMode!=="undefined" && divinaMode) return null;
  if(!player.alive) return "Caíste · un compañero puede levantarte";
  if(typeof runEnding!=="undefined" && runEnding) return null;
  const civ = currentArena==="ciudad" ? " y protegé la ciudad" : "";
  if(bossActive || runLevel>=GOAL_LEVELS) return "OBJETIVO: ¡derrotá al jefe!" + (civ ? "" : "");
  const left = Math.max(0, Math.ceil((levelDuration - levelTimer)/1000));
  const mm = Math.floor(left/60) + ":" + String(left%60).padStart(2,"0");
  return "OBJETIVO: sobrevivir" + civ + " · " + mm;
}
function goalChipTick(){
  const el = document.getElementById("goal-chip"); if(!el) return;
  const t = goalChipText();
  el.classList.toggle("hidden", t===null);
  if(t!==null && el.textContent!==t) el.textContent = t;
}
// Por qué se perdió (derrota normal de campaña).
function goalDefeatWhy(){
  if(typeof currentArena!=="undefined" && currentArena==="ciudad" && typeof CM_STRUCTS!=="undefined" && typeof cmS!=="undefined" && cmS && cmS.st &&
     !CM_STRUCTS.some((q,j)=>q.critical && cmS.st[j].st!==CM_ST.DESTROYED))
    return "Cayeron todas las estructuras importantes de la ciudad, y por eso se terminó la partida.";
  const n = typeof heroes!=="undefined" ? heroes.length : 1;
  return n>1 ? "Todos los guardianes de tu equipo se quedaron sin vida a la vez. Si un compañero cae, mantené ✚ a su lado para levantarlo antes de que caigan todos."
             : "Te quedaste sin vida. La barra roja es tu vida: cuando se vacía, perdés.";
}
function goalDefeatHtml(level){
  return `<div class="go-why"><b>¿Qué pasó?</b> ${goalDefeatWhy()}<br><b>Llegaste al nivel ${level} de ${GOAL_LEVELS}.</b> Probá de nuevo: cada intento te acerca al jefe.</div>`;
}
// Resumen al ganar la primera arena: todo lo que hay que saber, en pocas líneas.
function goalVictoryRecapHtml(data){
  if(!data) return "";
  return `<div class="go-recap"><b>¡Lo lograste: sobreviviste!</b>
    <ul>
      <li><b>Tu campaña:</b> avanzar por diez arenas, recuperar los cristales y vencer al Rey de la Horda.</li>
      <li><b>10 niveles:</b> en el último hay un jefe. Lo derrotaste y ganaste la arena.</li>
      <li><b>Ganaste:</b> experiencia (tu guardián sube de nivel), oro y objetos.</li>
      <li><b>Ahora:</b> la próxima arena es más difícil. Podés equiparte y mejorar a tu guardián antes de entrar.</li>
    </ul></div>`;
}
