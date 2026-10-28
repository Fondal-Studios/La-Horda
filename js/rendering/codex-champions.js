// Shared by the live hero renderer and Codex previews. Purely cosmetic.
function codexChampionPack(h){
 if(!h || typeof CODEX_GAMEPLAY_ART === 'undefined' || !CODEX_GAMEPLAY_ART[h.classKey]) return null;
 // An equipped skin retains its own authored design, including while loading.
 if(typeof ascCandidate==='function' && ascCandidate(h) && typeof ascSkinIndex==='function' && ascSkinIndex(h)>0) return null;
 if(typeof activeSetSkin === 'function' && activeSetSkin(h)) return null;
 const P=CHAMP_PACK['codex_'+h.classKey];
 return P && P.ready ? P : null;
}
function drawCodexChampion(h, drawScale, alpha){
 const P=codexChampionPack(h);if(!P)return false;
 let actor=h;
 // Existing skill timers choose the pose; combat values and timers are never changed.
 if(h.classKey==='tanque' && (h.dashFxTimer>0 || h.spinTimer>0 || (h.growTimer>0 && h.growMaxTimer>0))){
  const set=h.spinTimer>0?'attack_down':'cast_down';
  actor=Object.assign({},h,{_codexSet:set,_codexT:animNow,_codexPack:undefined});
 }
 return drawChampPack('codex_'+h.classKey,actor,drawScale,alpha);
}
