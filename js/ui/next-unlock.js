"use strict";
/* ============================================================
   js/ui/next-unlock.js — «LO PRÓXIMO QUE DESBLOQUEÁS»
   Panel de 2-3 metas concretas, calculadas con los datos reales del guardado. SOLO LECTURA: no otorga nada, no llama a
   persist() y no cambia el guardado; solo lee lo que ya exponen los sistemas (desafíos, Horda, Tienda).
   Metas posibles (se muestran las más cercanas a cumplirse):
     · pase      siguiente nivel del Pase de temporada gratis y su premio          (questsSeason, SEASON_REWARDS)
     · racha     próximo hito de la racha diaria                                   (questsStreakInfo)
     · cuenta    próximo título por nivel de cuenta                                (QUEST_TITLES[*].accountLevel)
     · cicatriz  siguiente Rango de Cicatriz (o su marco) y las rondas que faltan  (SCAR_CFG, save.endless.scar)
     · guardian  el guardián más barato que todavía no tenés, contra tu oro        (shopChampionPrice)
   Dónde aparece: resultados de la Horda Infinita y fin de partida de la Campaña (victoria y derrota). Se engancha
   envolviendo las funciones globales que dibujan esas pantallas, igual que js/systems/scar-ranks.js.
   Para el menú: window.nextUnlockHTML() devuelve el HTML ("" si no hay metas) y window.nextUnlockGoals() los datos.
   Cargar DESPUÉS de js/systems/scar-ranks.js. Estilos: css/next-unlock.css.
   ============================================================ */
const NEXT_UNLOCK_MAX = 3;
const _nuEsc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const _nuFmt = n => Math.round(n || 0).toLocaleString("es-AR");
function _nuGoal(id, tag, name, cur, need, unit){
  need = Math.max(1, Math.round(need || 0)); cur = Math.max(0, Math.min(need, Math.round(cur || 0)));
  return { id, tag, name, cur, need, unit: unit || "", pct: Math.max(0, Math.min(100, Math.round(cur * 100 / need))) };
}
// Cada meta se calcula aparte y protegida: si un sistema no está cargado, esa meta no sale y las demás sí.
const NEXT_UNLOCK_SOURCES = {
  pase(){
    if(typeof questsSeason !== "function" || typeof SEASON_REWARDS === "undefined") return null;
    const S = questsSeason();
    if(!S.need || S.level >= SEASON_DEF.levels) return null;
    const txt = questsRewardText(SEASON_REWARDS[S.level + 1]);
    if(!txt) return null;
    return _nuGoal("pase", `Pase gratis · nivel ${S.level + 1}`, txt, S.into, S.need, "XP");
  },
  racha(){
    if(typeof questsStreakInfo !== "function") return null;
    const S = questsStreakInfo();
    if(!S.next) return null;
    const txt = questsRewardText(S.next.reward);
    if(!txt) return null;
    return _nuGoal("racha", "Racha diaria", txt, S.count, S.next.days, "días");
  },
  cuenta(){
    if(typeof questsAccount !== "function" || typeof QUEST_TITLES === "undefined") return null;
    const q = questsState(), A = questsAccount();
    let best = null;
    for(const id of Object.keys(QUEST_TITLES)){
      const lv = QUEST_TITLES[id].accountLevel;
      if(!lv || lv <= A.level || (q.titles || []).includes(id)) continue;
      if(!best || lv < best.lv) best = { id, lv };
    }
    if(!best) return null;
    let total = 0; for(let l = 1; l < best.lv; l++) total += accountXpToNext(l);
    return _nuGoal("cuenta", `Cuenta · nivel ${best.lv}`, `Título «${QUEST_TITLES[best.id].name}»`, q.xp, total, "XP");
  },
  cicatriz(){
    if(typeof SCAR_CFG === "undefined" || typeof SCAR_RANKS === "undefined" || typeof scarClamp !== "function") return null;
    if(typeof endlessUnlocked === "function" && !endlessUnlocked()) return null;
    const C = (typeof save !== "undefined" && save.endless && save.endless.scar) || {};   // se lee directo: scarSave() normaliza y acá no se escribe
    const max = scarClamp(C.max), top = SCAR_CFG.maxRank;
    if(max >= top && C.cleared && C.cleared[top]) return null;
    const goal = SCAR_CFG.clearRound[max], best = Math.min(goal, Math.max(0, (C.best && +C.best[max]) || 0));
    let name;
    if(max < top) name = SCAR_RANKS[max + 1].name;
    else {
      const fid = typeof scarFrameId === "function" ? scarFrameId(SCAR_RANKS[top].frame) : SCAR_RANKS[top].frame;
      name = fid && QUEST_FRAMES[fid] ? `Marco ${QUEST_FRAMES[fid].name}` : "";
    }
    if(!name || !goal) return null;
    return _nuGoal("cicatriz", `Horda Infinita · ${SCAR_RANKS[max].name}`, name, best, goal, "rondas");
  },
  guardian(){
    if(typeof CHAMPION_CATALOG === "undefined" || typeof shopChampionPrice !== "function" || typeof save === "undefined") return null;
    let pick = null, same = 0;
    for(const c of CHAMPION_CATALOG){
      if((save.champions[c.id] || {}).unlocked || !CLASSES[c.id]) continue;
      if(typeof shopChampionPurchasable === "function" && !shopChampionPurchasable(c.id)) continue;
      const price = shopChampionPrice(c.id);
      if(!(price > 0)) continue;
      if(!pick || price < pick.price){ pick = { id: c.id, price }; same = 1; }
      else if(price === pick.price) same++;
    }
    if(!pick) return null;
    return _nuGoal("guardian", "Guardián nuevo", same > 1 ? "Un guardián a elección" : CLASSES[pick.id].name, save.gold || 0, pick.price, "de oro");
  }
};
// Lista ordenada: primero lo que está más cerca de cumplirse. Devuelve como mucho NEXT_UNLOCK_MAX metas.
function nextUnlockGoals(max){
  const out = [];
  for(const k of Object.keys(NEXT_UNLOCK_SOURCES)){
    try{ const g = NEXT_UNLOCK_SOURCES[k](); if(g) out.push(g); }catch(e){ /* un sistema sin cargar no rompe el panel */ }
  }
  out.sort((a, b) => b.pct - a.pct);
  return out.slice(0, max || NEXT_UNLOCK_MAX);
}
function nextUnlockHTML(opts){
  const goals = nextUnlockGoals(opts && opts.max);
  if(!goals.length) return "";
  const rows = goals.map(g => `<div class="nu-goal" data-nu="${g.id}">
      <div class="nu-row"><span class="nu-tag">${_nuEsc(g.tag)}</span><b class="nu-name">${_nuEsc(g.name)}</b><span class="nu-num">${_nuFmt(g.cur)} / ${_nuFmt(g.need)} ${_nuEsc(g.unit)}</span></div>
      <div class="nu-bar${g.pct >= 100 ? " full" : ""}" role="progressbar" aria-valuemin="0" aria-valuemax="${g.need}" aria-valuenow="${g.cur}" aria-label="${_nuEsc(g.tag)}"><i style="width:${g.pct}%"></i></div>
    </div>`).join("");
  return `<div class="nu-panel" data-next-unlock><div class="nu-title">Lo próximo que desbloqueás</div>${rows}</div>`;
}
// Pone (o quita, si no hay metas) el panel dentro de `host`, antes de `before` si se indica. Devuelve el elemento o null.
function nextUnlockMount(host, before){
  if(!host) return null;
  host.querySelectorAll(":scope > [data-next-unlock]").forEach(n => n.remove());
  const html = nextUnlockHTML();
  if(!html) return null;
  const t = document.createElement("template"); t.innerHTML = html;
  const el = t.content.firstElementChild;
  if(before && before.parentNode === host) host.insertBefore(el, before); else host.appendChild(el);
  return el;
}
function nextUnlockClear(){ document.querySelectorAll("[data-next-unlock], [data-nu-pride]").forEach(n => n.remove()); }

/* ---------------- momento de orgullo (Horda): equipar lo ganado / mirar apariencias ----------------
   Botones secundarios, debajo de «UNA MÁS» y «Volver»: llevan a pantallas que ya existen. Sin compra directa ni apuro. */
function nextUnlockPrideHTML(){
  const L = (typeof EN !== "undefined" && EN.local) || {}, S = L.scar || {};
  const won = !!(S.title || S.frame), proud = !!(L.newGlobal || L.newGuardian || S.cleared || won);
  if(!proud) return "";
  const online = !!((typeof netMatch !== "undefined" && netMatch) || (typeof netInRoom === "function" && netInRoom()));
  const btns = [];
  if(won && typeof window.questsOpen === "function") btns.push(`<button class="btn small secondary" type="button" data-nu-act="perfil">${S.title ? "Equipar título" : "Equipar marco"}</button>`);
  if(!online && typeof openGuardians === "function") btns.push('<button class="btn small secondary" type="button" data-nu-act="skins">Ver apariencias</button>');
  return btns.length ? `<div class="nu-pride" data-nu-pride>${btns.join("")}</div>` : "";
}
document.addEventListener("click", ev => {
  const b = ev.target.closest && ev.target.closest("[data-nu-act]"); if(!b) return;
  if(typeof state === "undefined" || state !== "endless") return;
  if(b.dataset.nuAct === "perfil"){ if(typeof window.questsOpen === "function") window.questsOpen("perfil"); }   // «Volver» regresa a los resultados
  else if(b.dataset.nuAct === "skins"){
    // igual que «Volver al menú»: se cierra el modo antes de salir de los resultados
    if(typeof endlessFinish === "function") endlessFinish();
    if(typeof endlessPending !== "undefined") endlessPending = false;
    if(typeof openGuardians === "function") openGuardians("skins");
  }
});

/* ---------------- enganches (envolviendo las funciones globales que dibujan los resultados) ---------------- */
(function nextUnlockWire(){
  // Horda Infinita: arriba de los botones va el panel; debajo de los botones, los accesos del momento de orgullo.
  if(typeof endlessShowResults === "function"){
    const _sr = endlessShowResults;
    endlessShowResults = function(){
      const r = _sr.apply(this, arguments);
      try{
        const box = document.querySelector("#endless-screen .en-res"), btns = box && box.querySelector(".en-res-btns");
        if(box){
          nextUnlockMount(box, btns);
          box.querySelectorAll("[data-nu-pride]").forEach(n => n.remove());
          const pride = nextUnlockPrideHTML();
          if(pride && btns) btns.insertAdjacentHTML("afterend", pride);
        }
      }catch(e){ console.error(e); }
      return r;
    };
  }
  // Campaña (victoria y derrota): js/ui/quests-ui.js dibuja ahí el resumen de desafíos; el panel va al pie de la pantalla.
  if(typeof questsShowRunSummary === "function"){
    const _rs = questsShowRunSummary;
    questsShowRunSummary = function(){
      const r = _rs.apply(this, arguments);
      try{
        if(typeof state !== "undefined" && (state === "victory" || state === "gameover")){
          const scr = document.getElementById(state === "victory" ? "victory-screen" : "gameover-screen");
          nextUnlockMount(scr, state === "gameover" ? document.getElementById("go-stats") : null);
        }
      }catch(e){ console.error(e); }
      return r;
    };
  }
})();
window.nextUnlockHTML = nextUnlockHTML;
window.nextUnlockGoals = nextUnlockGoals;
window.nextUnlockMount = nextUnlockMount;
