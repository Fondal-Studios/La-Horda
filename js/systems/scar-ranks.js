/* RANGOS DE CICATRIZ — motor y pantalla (datos y balance: js/data/scar-ranks.js).
   Se monta sobre la Horda Infinita sin duplicarla: los mutadores del rango se mezclan en EN.mutators al empezar la partida
   (así viajan solos por la red con `enMu` y el invitado juega lo mismo), y el puntaje suma el bono del rango. */
function scarSave(){
  const S = endlessSave();
  if(!S.scar || typeof S.scar !== "object") S.scar = {};
  const C = S.scar;
  C.max = scarClamp(C.max); C.sel = Math.min(scarClamp(C.sel), C.max);
  // best/cleared vienen del guardado (editable): solo rangos 0..max y enteros no negativos
  const clean = (o, f)=>{ const r = {}; if(o && typeof o === "object") for(let k = 0; k <= SCAR_CFG.maxRank; k++){ const v = f(o[k]); if(v) r[k] = v; } return r; };
  C.best = clean(C.best, v=>{ v = +v; return isFinite(v) && v > 0 ? Math.min(Math.floor(v), 1e6) : 0; });
  C.cleared = clean(C.cleared, v=>v ? 1 : 0);
  scarFrameSync(C);
  return C;
}
function scarRank(){ return scarClamp(EN.scar); }
// Marco propio del Rango V. Los datos (js/data/scar-ranks.js) todavía dicen `cicatriz`, que es el id del marco del top 10 del
// ranking (js/net/leaderboard.js): acá se traduce al marco exclusivo `cicatriz_v`. Si los datos pasan a decir `cicatriz_v`, sigue igual.
function scarFrameId(id){
  if(id === "cicatriz" && typeof QUEST_FRAMES !== "undefined" && QUEST_FRAMES.cicatriz_v) return "cicatriz_v";
  return id || null;
}
// Quien ya había completado el Rango V antes del marco propio lo recibe (conserva el que tenía).
function scarFrameSync(C){
  try{
    const top = SCAR_CFG.maxRank, id = scarFrameId((SCAR_RANKS[top] || {}).frame);
    const q = C && C.cleared && C.cleared[top] && id && typeof questsState === "function" ? questsState() : null;
    if(q && Array.isArray(q.frames) && QUEST_FRAMES[id] && !q.frames.includes(id)) q.frames.push(id);
  }catch(e){}
}
// Se llama al armar la partida (endlessBeginRun): fija el rango elegido y mezcla sus mutadores.
function scarApplyToRun(){
  const C = scarSave();
  EN.scar = C.sel;
  EN.mutators = scarMergeMutators(EN.mutators, EN.scar);
}
function scarSelect(rank){
  const C = scarSave();
  if(!scarCanPick(rank, C.max)) return false;
  C.sel = scarClamp(rank); persist();
  return true;
}
// Al terminar la partida (endlessEndRun, dentro del bloque de récords): desbloqueo, récord por rango y recompensas de identidad.
function scarOnRunEnd(round, L){
  const C = scarSave(), rank = scarRank();
  const o = scarOutcome(rank, round, C.max);
  const prevBest = C.best[rank] || 0, newBest = o.eligible && round > prevBest;   // el récord por rango solo cuenta rangos abiertos
  if(newBest) C.best[rank] = round;
  const res = {rank, round, cleared:o.cleared, eligible:o.eligible, newBest, unlocked:null, title:null, frame:null};
  if(o.cleared) C.cleared[rank] = 1;
  if(o.unlock){ C.max = o.unlock; res.unlocked = o.unlock; if(C.sel < C.max && rank === C.sel) C.sel = C.max; }
  try{
    const q = typeof questsState === "function" ? questsState() : null;
    if(q){
      if(o.title && q.titles && !q.titles.includes(o.title)){ q.titles.push(o.title); res.title = o.title; }
      const fr = scarFrameId(o.frame);
      if(fr && q.frames && !q.frames.includes(fr)){ q.frames.push(fr); res.frame = fr; }
    }
  }catch(e){ console.error(e); }
  if(L) L.scar = res;
  return res;
}

/* ---------------- pantalla de preparación: selector de rango ---------------- */
function scarPrepHTML(guest){
  const C = scarSave(), sel = guest ? scarClamp(EN.scar) : C.sel;
  const chips = SCAR_RANKS.map(R=>{
    const open = scarCanPick(R.rank, C.max), on = R.rank === sel;
    return `<button class="en-scar-chip${on?" on":""}${open?"":" locked"}" data-scar="${R.rank}" ${open && !guest ? "" : "disabled"} aria-pressed="${on}" title="${R.desc}">${(open || on) ? R.short : "🔒"}</button>`;
  }).join("");
  const R = SCAR_RANKS[sel] || SCAR_RANKS[0];
  const goal = SCAR_CFG.clearRound[sel];
  const next = sel < SCAR_CFG.maxRank ? `Llegá a la ronda ${goal} para abrir ${SCAR_RANKS[sel+1].name}.` : `Llegá a la ronda ${goal} para el marco Cicatriz.`;
  // una frase por nodo de texto: así cada una se traduce sola (js/i18n/i18n.js traduce por nodo, con los números como {n})
  return `<div class="la-desc en-scar" id="en-scar"><b>Rango de Cicatriz:</b> <span class="en-scar-chips">${chips}</span>
    <div class="en-scar-info"><b>${R.name}</b> <span>${R.desc}</span> <span>Puntaje ×${scarScoreBonus(sel).toFixed(2)}</span> <span>${next}</span>${guest ? ' <span>(lo elige el anfitrión)</span>' : ""}</div></div>`;
}
(function scarWire(){
  if(typeof endlessDecoratePrep === "function"){
    const _dp = endlessDecoratePrep;
    endlessDecoratePrep = function(){
      const r = _dp.apply(this, arguments);
      if(!endlessPending) return r;
      const box = document.getElementById("lobby-arena"); if(!box) return r;
      const guest = typeof netInRoom==="function" && netInRoom() && net.role==="guest";
      box.insertAdjacentHTML("beforeend", scarPrepHTML(guest));
      box.querySelectorAll(".en-scar-chip:not([disabled])").forEach(b=>b.addEventListener("click", ev=>{
        ev.stopPropagation();
        if(scarSelect(+b.dataset.scar)) endlessDecoratePrep();
      }));
      return r;
    };
  }
  if(typeof endlessShowResults === "function"){
    const _sr = endlessShowResults;
    endlessShowResults = function(){
      const r = _sr.apply(this, arguments);
      try{
        const L = EN.local || {}, S = L.scar, el = document.getElementById("endless-screen"), host = el && el.querySelector(".en-res-badges");
        if(S && host && S.eligible && !S.cleared && !S.unlocked){
          const goal = SCAR_CFG.clearRound[S.rank], left = Math.max(1, goal - (S.round|0));
          const what = S.rank < SCAR_CFG.maxRank ? SCAR_RANKS[S.rank+1].name : "el marco Cicatriz";
          host.insertAdjacentHTML("beforeend", `<span class="en-new" id="en-scar-goal">Te faltaron ${left} ${left===1?"ronda":"rondas"} para ${what}</span>`);
        }
        if(S && host && (S.rank > 0 || S.unlocked)){
          const bits = [`<span class="en-new">${SCAR_RANKS[S.rank].name}</span>`];
          if(S.cleared && S.rank > 0) bits.push(`<span class="en-new">¡${SCAR_RANKS[S.rank].name} completada!</span>`);
          if(S.unlocked) bits.push(`<span class="en-new">¡Se abrió ${SCAR_RANKS[S.unlocked].name}!</span>`);
          if(S.title && QUEST_TITLES[S.title]) bits.push(`<span class="en-new">Título «${QUEST_TITLES[S.title].name}»</span>`);
          if(S.frame && QUEST_FRAMES[S.frame]) bits.push(`<span class="en-new">Marco ${QUEST_FRAMES[S.frame].name}</span>`);
          host.insertAdjacentHTML("beforeend", bits.join(""));
        }
      }catch(e){ console.error(e); }
      return r;
    };
  }
})();
