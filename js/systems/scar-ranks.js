/* RANGOS DE CICATRIZ — motor y pantalla (datos y balance: js/data/scar-ranks.js).
   Se monta sobre la Horda Infinita sin duplicarla: los mutadores del rango se mezclan en EN.mutators al empezar la partida
   (así viajan solos por la red con `enMu` y el invitado juega lo mismo), y el puntaje suma el bono del rango. */
function scarSave(){
  const S = endlessSave();
  if(!S.scar || typeof S.scar !== "object") S.scar = {};
  const C = S.scar;
  C.max = scarClamp(C.max); C.sel = Math.min(scarClamp(C.sel), C.max);
  if(!C.best || typeof C.best !== "object") C.best = {};
  if(!C.cleared || typeof C.cleared !== "object") C.cleared = {};
  return C;
}
function scarRank(){ return scarClamp(EN.scar); }
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
  const prevBest = C.best[rank] || 0, newBest = round > prevBest;
  if(newBest) C.best[rank] = round;
  const o = scarOutcome(rank, round, C.max);
  const res = {rank, round, cleared:o.cleared, newBest, unlocked:null, title:null, frame:null};
  if(o.cleared) C.cleared[rank] = 1;
  if(o.unlock){ C.max = o.unlock; res.unlocked = o.unlock; if(C.sel < C.max && rank === C.sel) C.sel = C.max; }
  try{
    const q = typeof questsState === "function" ? questsState() : null;
    if(q){
      if(o.title && q.titles && !q.titles.includes(o.title)){ q.titles.push(o.title); res.title = o.title; }
      if(o.frame && q.frames && !q.frames.includes(o.frame)){ q.frames.push(o.frame); res.frame = o.frame; }
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
    const best = C.best[R.rank] ? ` · mejor ronda ${C.best[R.rank]}` : "";
    const lock = open ? "" : ` · se abre llegando a la ronda ${SCAR_CFG.clearRound[R.rank-1]} en ${SCAR_RANKS[R.rank-1].name}`;
    return `<button class="en-scar-chip${on?" on":""}${open?"":" locked"}" data-scar="${R.rank}" ${open && !guest ? "" : "disabled"} aria-pressed="${on}" title="${R.desc}${best}${lock}">${open ? R.short : "🔒"}</button>`;
  }).join("");
  const R = SCAR_RANKS[sel] || SCAR_RANKS[0];
  const goal = SCAR_CFG.clearRound[sel];
  const next = sel < SCAR_CFG.maxRank ? ` Llegá a la ronda <b>${goal}</b> para abrir ${SCAR_RANKS[sel+1].name}.` : ` Llegá a la ronda <b>${goal}</b> para el marco Cicatriz.`;
  return `<div class="la-desc en-scar" id="en-scar"><b>Rango de Cicatriz:</b> <span class="en-scar-chips">${chips}</span>
    <div class="en-scar-info"><b>${R.name}</b> · ${R.desc} Puntaje ×${scarScoreBonus(sel).toFixed(2)}.${next}${guest ? " (lo elige el anfitrión)" : ""}</div></div>`;
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
