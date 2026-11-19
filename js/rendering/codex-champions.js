// Shared by the live hero renderer and Codex previews. Purely cosmetic.
function codexChampionPack(h){
 if(!h || typeof CODEX_GAMEPLAY_ART === 'undefined' || !CODEX_GAMEPLAY_ART[h.classKey]) return null;
 // An equipped skin retains its own authored design, including while loading.
 if(typeof ascCandidate==='function' && ascCandidate(h) && typeof ascSkinIndex==='function' && ascSkinIndex(h)>0) return null;
 if(typeof activeSetSkin === 'function'){
  const d=activeSetSkin(h);
  if(d){
   // Una croma de paleta (no autoral) conserva el diseño: se recolorea el cuerpo del Códice (ver expedition/cosmetics.js).
   const ck=d.croma && !d.authoredPacks && d.packs && d.packs['codex_'+h.classKey];
   const C=ck && CHAMP_PACK[ck];
   return C && C.ready ? C : null;
  }
 }
 const P=CHAMP_PACK['codex_'+h.classKey];
 return P && P.ready ? P : null;
}
// Grito de Guerra del Caballero: arranque del grito con la hoja de LANZAR (tanque/v3/cast.png, paquete aparte;
// el atlas maestro y el del Códice no se tocan). Solo el cuerpo base (sin croma ni skin, que conservan su arte)
// y solo los primeros ~0,76 s del grito; después sigue la pose de siempre. Lee timers existentes, no los cambia.
const KNIGHT_CRY_STEPS=[120,160,320,160];
function drawKnightWarCryCast(h, P, drawScale, alpha){
 if(h._codexSet || !(h.growTimer>0 && h.growMaxTimer>0) || P!==CHAMP_PACK.codex_tanque) return false;
 const C=CHAMP_PACK.tanque_cast;
 if(!C || !C.ready) return false;
 let age=h.growMaxTimer-h.growTimer, n=0;
 if(!(age>=0)) return false;
 while(n<KNIGHT_CRY_STEPS.length && age>=KNIGHT_CRY_STEPS[n]){ age-=KNIGHT_CRY_STEPS[n]; n++; }
 if(n>=KNIGHT_CRY_STEPS.length) return false;
 // misma escala por pixel nativo que el cuerpo del Códice (la hoja se redujo a esa escala)
 const pick=champPackSet(C,"cast",champPackDir(h),h) || {arr:C.sets.cast_down,flip:false};
 champPackDrawFrame(C, pick.arr[n], h.x, h.y, champPackScale(P,h,drawScale), pick.flip, alpha);
 return true;
}
function drawCodexChampion(h, drawScale, alpha){
 const P=codexChampionPack(h);if(!P)return false;
 let actor=h;
 if(h.classKey==='tanque' && !(h.dashFxTimer>0) && !(h.spinTimer>0) && drawKnightWarCryCast(h,P,drawScale,alpha)) return true;
 // Existing skill timers choose the pose; combat values and timers are never changed.
 if(h.classKey==='tanque' && (h.dashFxTimer>0 || h.spinTimer>0 || (h.growTimer>0 && h.growMaxTimer>0))){
  const set=h.spinTimer>0?'attack_down':'cast_down';
  actor=Object.assign({},h,{_codexSet:set,_codexT:animNow,_codexPack:undefined});
 }
 return drawChampPack('codex_'+h.classKey,actor,drawScale,alpha);
}
