"use strict";
/* ============================================================
   js/champions/ilkan.js
   ILKAN — EL CAMINANTE DE DUNAS (clave "ilkan"). Campeón ORIGINAL (rework del campeón anterior: ver
   docs/ILKAN_REWORK.md). Mecánicas idénticas; arte, nombres, textos y efectos propios.
   Loop: MOVILIDAD -> COMBATE -> RECIBIR/INFLIGIR DAÑO -> TORMENTA -> TRANSFORMACIÓN -> DESTRUCCIÓN ->
   (si vuelve a llenar la Tormenta transformado) LOS TRES PASOS -> AGOTADO.
   Valores: ILKAN_CFG (js/data/champion-tuning.js). Arte: CHAMP_PACK.ilkan (humano) y
   CHAMP_PACK.ilkan_colossus (Coloso de Arena, misma escala de píxel que el humano en la hoja).

   TORMENTA = la barra de la definitiva (ultCharge). Transformado, h.cls pasa a ILKAN_COLOSSUS_CLS (sus
   botones, cooldowns e IA son los del coloso) y vuelve a CLASSES.ilkan al terminar.
   Estado (en el héroe, sincronizado por el anfitrión):
     ilkanPhase ........ null | "hookPrep" | "hook" | "land" | "tf" | "quake" | "stomp" | "finale" | "exhaustFall"
     ilkanPhaseTimer ... ms de las fases con tiempo
     ilkanColossus ..... forma de coloso activa (ilkanColossusTimer/ilkanColossusMax)
     ilkanFinaleReady .. Tormenta llena otra vez estando transformado (Definitiva II desbloqueada)
     ilkanExhaustTimer / ilkanNoTfTimer ... agotado después de Los Tres Pasos
   ============================================================ */
const _ilkanHit = new WeakMap();

function heroClsOf(h){ return (h && h.ilkanColossus) ? ILKAN_COLOSSUS_CLS : (CLASSES[h.classKey] || h.cls); }
function ilkanMoveLocked(h){ const p = h.ilkanPhase; return !!(p && p!=="land"); }
function ilkanLowHp(h){ return h.alive && h.hp/h.maxHp < ILKAN_CFG.passive.threshold; }
function ilkanAdvPow(h){ return h.ilkanAdvanceTimer>0 ? (h.ilkanAdvancePow||1) : 0; }
function ilkanSpeedMult(h){
  let m = 1;
  const pw = ilkanAdvPow(h); if(pw) m *= 1 + ILKAN_CFG.advance.speedPct*pw;
  if(ilkanLowHp(h)) m *= 1 + ILKAN_CFG.passive.speedPct;
  if(h.ilkanExhaustTimer>0) m *= 1 + ILKAN_CFG.exhausted.speedPct;
  if(h.ilkanColossus) m *= ILKAN_CFG.colossus.speedMult;
  return m;
}
function ilkanDmgMult(h){
  let m = 1;
  const pw = ilkanAdvPow(h); if(pw) m *= 1 + ILKAN_CFG.advance.dmgPct*pw;
  if(ilkanLowHp(h)) m *= 1 + ILKAN_CFG.passive.dmgPct;
  if(h.ilkanColossus) m *= ILKAN_CFG.colossus.dmgMult;
  return m;
}
function ilkanDmgTakenMult(h){
  if(h.ilkanPhase==="finale" || h.ilkanPhase==="tf") return 0; // cinemáticas sin control: no se le puede matar sin poder reaccionar
  let m = 1;
  if(h.ilkanInstinctTimer>0) m *= 1 - ILKAN_CFG.instinct.dmgReduce;
  if(h.ilkanPhase==="quake") m *= ILKAN_CFG.terremoto.vulnMult;
  return m;
}
function ilkanCcResist(h){ return h.ilkanColossus ? 0.6 : (h.ilkanPhase==="hook" ? 0.9 : 0); }
// Multiplicador de Tormenta ganada (pegando y recibiendo daño)
function ilkanFuryGainMult(h){
  const F = ILKAN_CFG.fury;
  let m = 1 + F.lowHpBonus*(1 - Math.max(0, h.hp)/h.maxHp);
  if(ilkanLowHp(h)) m *= ILKAN_CFG.passive.furyMult;
  if(h.ilkanAdvanceTimer>0) m *= ILKAN_CFG.advance.furyMult;
  if(h.ilkanColossus) m *= F.colossusGainMult;
  m *= 1 + (talentSkillMods(h.classKey, "ult").flags.furyGainPct||0);
  return m * setFuryMult(h); // set Caravana de Medianoche
}
function ilkanAddFury(h, amt){
  if(h.ilkanPhase==="finale") return;
  h.ultCharge = Math.min(h.ultMax, (h.ultCharge||0) + amt);
  ilkanCheckFinale(h);
}
// Condición especial de Los Tres Pasos (aparte de la Tormenta): nunca por enfriamiento ni por reinicios.
function ilkanFinaleCondition(h){
  const R = ILKAN_CFG.finale, used = h.ilkanFinaleUses||0;
  if(used >= R.maxPerRun) return false;
  const bossUp = typeof boss!=="undefined" && boss && boss.alive && boss.rank==="jefe" && bossActive;
  if(used === 0){
    const danger = h.hp < h.maxHp*R.lowHpPct || heroes.some(o=>o!==h && !o.alive);
    return bossUp || danger;
  }
  return bossUp && boss.hp <= boss.maxHp*R.bossHpPct2 && (runElapsedMs - (h.ilkanFinaleAt||-1e9)) >= R.gapMs2;
}
function ilkanCheckFinale(h){
  if(h.ilkanColossus && !h.ilkanFinaleReady && h.ultCharge >= h.ultMax && h.ilkanPhase!=="finale" && ilkanFinaleCondition(h)){
    h.ilkanFinaleReady = true;
    if(h===player || h.isRemote) showBanner("☠ LOS TRES PASOS — Definitiva II disponible");
    vfxShock(h.x, h.y, 10, 120, "79,227,207", 600, 2);
  }
}
// Recibir daño: Tormenta (mucha más con Piel de Duna) y reserva de regeneración del coloso
function ilkanOnHurt(h, dmg){
  if(!h.alive || dmg<=0) return;
  const inst = h.ilkanInstinctTimer>0 ? ILKAN_CFG.instinct.furyMult : 1;
  ilkanAddFury(h, dmg/h.maxHp*100*ILKAN_CFG.fury.perHpPctTaken*ilkanFuryGainMult(h)*inst);
  if(h.ilkanColossus) h.ilkanRegenPool = Math.min(h.maxHp*0.6, (h.ilkanRegenPool||0) + dmg*ILKAN_CFG.colossus.regenPct);
}
function ilkanSfx(h, name){ if(h===player || inView(h.x, h.y, 0)) playSfx(name); }
function ilkanBaseDmg(h, POWER){
  return h.baseDmg * runStats.dmgMult * (h.buffDmgMult||1) * arenaMods().heroDmgMult * (POWER||1) * (1 + passiveSum(h.classKey,"dmg_mult") + passiveSum(h.classKey,"skilldmg_mult"));
}

/* ---------------- básico: hoces gemelas / puños del coloso ---------------- */
function ilkanBasic(caster, aspd){
  if(caster.ilkanPhase && caster.ilkanPhase!=="land") return true;
  const bot = caster!==player;
  const base = caster.baseDmg * runStats.dmgMult * (caster.buffDmgMult||1) * arenaMods().heroDmgMult * (1 + passiveSum(caster.classKey,"dmg_mult"));
  if(caster.ilkanColossus){
    const T = ILKAN_CFG.colossus;
    const target = nearestEnemyTo(caster, T.atkRange + T.atkAoe);
    if(bot && !target) return true;
    caster.basicCd = T.atkCdMs / ((caster.buffAtkSpeedMult||1)*aspd) * (bot?1.1:1);
    if(target){ const dx=target.x-caster.x, dy=target.y-caster.y, l=Math.hypot(dx,dy)||1; caster.fx=dx/l; caster.fy=dy/l; }
    if(!(caster.ilkanComboTimer>0)) caster.ilkanCombo = 0;
    const stepN = (caster.ilkanCombo||0) % 3, third = stepN===2;
    caster.ilkanCombo = stepN+1; caster.ilkanComboTimer = 1600;
    caster.attackAnim = 380; caster.ilkanAtkTotal = 380; caster.ilkanAtkStep = stepN;
    const cx = third ? caster.x : caster.x + caster.fx*T.atkRange*0.7, cy = third ? caster.y : caster.y + caster.fy*T.atkRange*0.7;
    const R = third ? T.thirdAoe : T.atkAoe, dmg = base * (third ? T.thirdMult : 1);
    for(const e of enemies){
      if(!e.alive || Math.hypot(e.x-cx, e.y-cy) > R + (e.radius||20)*0.5) continue;
      damageEnemy(e, dmg, {fromBasic:true, src:caster});
      const dx = e.x-caster.x, dy = e.y-caster.y, l = Math.hypot(dx,dy)||1;
      seKnock(e, dx/l, dy/l, third ? T.knockPx*1.4 : T.knockPx*0.5, T.eliteStaggerMs);
    }
    vfxShock(cx, cy, 6, R, third ? "230,200,160" : "255,160,120", third ? 420 : 240, bot?0:1);
    vfxBurst(cx, cy, third ? 14 : 6, "sand", 150, 420, 4, bot?0:1, -30, 0);
    if(third){ pushChampFx({type:"crack", x:cx, y:cy, v:(Math.random()*3)|0, life:2200, maxLife:2200, s:0.9}); if(caster===player) vfxShake(5); ilkanSfx(caster, "stomp"); }
    else ilkanSfx(caster, "punch");
    return true;
  }
  // HOCES GEMELAS: combo 1-2-3; el 3ro da Tormenta extra
  const B = ILKAN_CFG.blades, range = caster.cls.basicRange;
  const target = nearestEnemyTo(caster, range + 10);
  if(bot && !target) return true;
  caster.basicCd = caster.cls.basicCd / ((caster.buffAtkSpeedMult||1)*aspd) * (bot?1.15:1);
  if(target){ const dx=target.x-caster.x, dy=target.y-caster.y, l=Math.hypot(dx,dy)||1; caster.fx=dx/l; caster.fy=dy/l; }
  if(!(caster.ilkanComboTimer>0)) caster.ilkanCombo = 0;
  const stepN = (caster.ilkanCombo||0) % 3;
  caster.ilkanCombo = stepN+1; caster.ilkanComboTimer = B.windowMs;
  caster.attackAnim = 200; caster.ilkanAtkTotal = 200; caster.ilkanAtkStep = stepN;
  let hit = false;
  for(const e of enemies){
    if(!e.alive || distance(caster,e) > range + (e.radius||20)*0.4) continue;
    const dx=e.x-caster.x, dy=e.y-caster.y, l=Math.hypot(dx,dy)||1;
    if((dx/l)*caster.fx + (dy/l)*caster.fy < -0.2) continue;
    damageEnemy(e, base*B.combo[stepN], {fromBasic:true, src:caster}); hit = true;
  }
  if(hit && stepN===2) ilkanAddFury(caster, ILKAN_CFG.fury.comboThird*ilkanFuryGainMult(caster));
  spawnSlash(caster);
  ilkanSfx(caster, "blade");
  return true;
}

/* ---------------- habilidades ---------------- */
function ilkanCast(caster, sk, isUlt, dmg, AREA, DUR, POWER){
  const kind = sk.kind;
  if(caster.ilkanPhase==="tf" || caster.ilkanPhase==="finale" || caster.ilkanPhase==="exhaustFall") return;
  if(kind==="ilkan_lance"){
    const H = ILKAN_CFG.hook;
    const tgt = seBestTarget(caster, H.dashDist*AREA);
    const d = seAimDir(caster, caster.aim ? null : tgt);
    caster.ilkanPhase = "hookPrep"; caster.ilkanPhaseTimer = H.prepMs;
    caster.ilkanHookDx = d.x; caster.ilkanHookDy = d.y; caster.fx = d.x; caster.fy = d.y;
    caster.ilkanDashLeft = H.dashDist*AREA; caster.ilkanHookDmg = dmg; caster.ilkanHookArea = AREA;
    caster.ilkanHookRedirects = H.redirects + Math.round(talentSkillMods(caster.classKey, 0).flags.extraRedirects||0);
    ilkanSetAnchor(caster, d.x, d.y, H.dashDist*AREA);
    _ilkanHit.set(caster, new Set());
    ilkanSfx(caster, "hook");
    return;
  }
  if(kind==="ilkan_temple"){
    caster.ilkanInstinctTimer = ILKAN_CFG.instinct.durationMs*DUR;
    caster.ilkanPose = "instinct"; caster.ilkanPoseTimer = 520;
    vfxBurst(caster.x, caster.y-24, 16, "t_#4fe3cf", 150, 420, 3, caster===player?2:0, -40, 0);
    ilkanSfx(caster, "shield");
    return;
  }
  if(kind==="ilkan_caravan"){
    const A = ILKAN_CFG.advance;
    caster.ilkanAdvanceTimer = A.durationMs*DUR;
    caster.ilkanAdvancePow = 1 + A.lowHpScale*(1 - caster.hp/caster.maxHp);
    caster.ilkanPose = "advance"; caster.ilkanPoseTimer = 620;
    for(const o of heroes){ if(o!==caster && o.alive && !o.isDivineFoe && distance(o,caster) <= A.allyRadius*AREA) o.advAllyTimer = Math.max(o.advAllyTimer||0, A.durationMs*DUR); }
    vfxShock(caster.x, caster.y, 8, 110, "240,190,80", 420, 1);
    if(caster===player) showBanner("¡EN CARAVANA!");
    ilkanSfx(caster, "roar");
    return;
  }
  if(kind==="ilkan_colossus_ult"){
    const T = ILKAN_CFG.colossus;
    caster.ilkanPhase = "tf"; caster.ilkanPhaseTimer = T.tfMs;
    caster.ilkanColossusDur = T.durationMs*DUR;
    caster.ilkanHookRedirects = 0;
    ilkanSfx(caster, "blade");
    return;
  }
  if(kind==="colossus_slam"){
    const S = ILKAN_CFG.sismo, R = S.radius*AREA;
    for(const e of enemies){
      if(!e.alive) continue;
      const d = distance(caster, e); if(d > R + (e.radius||20)*0.5) continue;
      damageEnemy(e, dmg*(1 - S.falloff*Math.min(1, d/R)), {src:caster});
      const l = d||1; seKnock(e, (e.x-caster.x)/l, (e.y-caster.y)/l, S.knockPx, S.eliteStunMs);
    }
    caster.ilkanPose = "sismo"; caster.ilkanPoseTimer = 560;
    ilkanQuakeFx(caster, caster.x, caster.y, R, 1);
    if(caster===player) vfxShake(9);
    ilkanSfx(caster, "boom");
    return;
  }
  if(kind==="colossus_sinkhole"){
    const Q = ILKAN_CFG.terremoto;
    caster.ilkanPhase = "quake"; caster.ilkanQuakeLeft = Q.pulses; caster.ilkanPhaseTimer = 120;
    caster.ilkanQuakeDmg = dmg; caster.ilkanQuakeR = Q.radius*AREA;
    return;
  }
  if(kind==="colossus_march"){
    const R = ILKAN_CFG.march;
    const t = caster.aim ? null : (bestClusterPoint(caster, 380, 120) || seBestTarget(caster, 380));
    const d = seAimDir(caster, t);
    caster.ilkanPhase = "stomp"; caster.ilkanStepsLeft = R.steps; caster.ilkanPhaseTimer = 200;
    caster.ilkanStompDx = d.x; caster.ilkanStompDy = d.y; caster.fx = d.x; caster.fy = d.y;
    caster.ilkanStompDmg = dmg; caster.ilkanStompR = R.radius*AREA;
    return;
  }
  if(kind==="ilkan_finale_ult"){
    ilkanStartFinale(caster, POWER);
    return;
  }
}
// Segunda activación de la Lanza-Pendón durante el vuelo: nueva lanza + cambio violento de dirección.
function ilkanHookCanRedirect(h){ return !!(h && h.classKey==="ilkan" && !h.ilkanColossus && (h.ilkanPhase==="hook" || h.ilkanPhase==="land") && (h.ilkanHookRedirects||0) > 0); }
function ilkanHookRedirect(h, aim){
  if(!ilkanHookCanRedirect(h)) return false;
  const H = ILKAN_CFG.hook;
  let d;
  if(aim && (aim.dx || aim.dy)){ const l = Math.hypot(aim.dx, aim.dy)||1; d = {x:aim.dx/l, y:aim.dy/l}; }
  else if(h===player && Math.hypot(joyVec.x, joyVec.y) > 0.2){ const l = Math.hypot(joyVec.x, joyVec.y); d = {x:joyVec.x/l, y:joyVec.y/l}; }
  else { const t = seBestTarget(h, 340); d = seAimDir(h, t); }
  h.ilkanHookRedirects--;
  h.ilkanPhase = "hook"; h.ilkanHookDx = d.x; h.ilkanHookDy = d.y; h.fx = d.x; h.fy = d.y;
  h.ilkanDashLeft = H.redirectDist*(h.ilkanHookArea||1); h.ilkanRedirFxTimer = 160;
  ilkanSetAnchor(h, d.x, d.y, H.redirectDist);
  _ilkanHit.set(h, new Set());
  vfxBurst(h.x, h.y-20, 8, "t_#4fe3cf", 180, 260, 3, h===player?2:0, -10, 0);
  ilkanSfx(h, "hook");
  return true;
}
// Ancla visual del cable: un enemigo grande en esa dirección si hay, si no un punto fuera de pantalla.
function ilkanSetAnchor(h, dx, dy, dist){
  let ax = h.x + dx*(dist+140), ay = h.y + dy*(dist+140);
  for(const e of enemies){
    if(!e.alive || !(isBossRank(e) || isEliteRank(e) || (e.radius||0) > 34)) continue;
    const vx = e.x-h.x, vy = e.y-h.y, along = vx*dx + vy*dy;
    if(along < 60 || along > dist+200) continue;
    if(Math.abs(vx*-dy + vy*dx) < (e.radius||30)){ ax = e.x; ay = e.y - (e.radius||30)*0.6; break; }
  }
  h.ilkanAnchorX = ax; h.ilkanAnchorY = ay;
}

/* ---------------- transformación ---------------- */
function ilkanEnterColossus(h){
  const T = ILKAN_CFG.colossus;
  h.ilkanPrev = {maxHp:h.maxHp, radius:h.radius, def:h.def, cds:h.cds.slice(), at:runElapsedMs};
  const pct = h.hp/h.maxHp;
  h.maxHp = Math.round(h.maxHp*T.hpMult*(1+(talentSkillMods(h.classKey,"ult").flags.colossusHpPct||0)));
  h.hp = Math.max(1, Math.round(h.maxHp*Math.min(1, pct + 0.35)));
  h.radius = Math.round(h.ilkanPrev.radius*T.radiusMult);
  h.def = Math.max(h.def, T.def);
  h.cds = [0,0,0];
  h.ilkanColossus = true; h.cls = ILKAN_COLOSSUS_CLS;
  h.ilkanColossusTimer = (h.ilkanColossusDur || T.durationMs) * champSetColossusDurMult(h); h.ilkanColossusMax = h.ilkanColossusTimer;
  h.ilkanFinaleReady = false; h.ultCharge = 0; h.ilkanRegenPool = 0;
  h.ilkanCombo = 0;
  if(h===player || h.isRemote) showBanner("COLOSO DE ARENA");
  vfxShock(h.x, h.y, 20, 220, "255,120,80", 700, 2);
  for(let i=0;i<3;i++) pushChampFx({type:"sandPuff", x:h.x+(i-1)*40, y:h.y-10, life:1600+i*300, maxLife:1600+i*300, v:i});
  if(h===player) vfxShake(12);
  ilkanSfx(h, "roar");
}
function ilkanExitColossus(h, died){
  if(!h.ilkanColossus) return;
  const pv = h.ilkanPrev || {maxHp:h.maxHp/ILKAN_CFG.colossus.hpMult, radius:24, def:h.def, cds:[0,0,0], at:runElapsedMs};
  const pct = h.hp/h.maxHp, elapsed = runElapsedMs - (pv.at||runElapsedMs);
  h.ilkanColossus = false; h.cls = CLASSES.ilkan;
  h.maxHp = Math.round(pv.maxHp); h.radius = pv.radius; h.def = pv.def;
  h.hp = died ? 0 : Math.max(1, Math.round(h.maxHp*pct));
  h.cds = pv.cds.map(c=>Math.max(0, c - elapsed));
  h.ilkanPrev = null; h.ilkanFinaleReady = false; h.ilkanColossusTimer = 0; h.ilkanRegenPool = 0;
  if(h.ilkanPhase==="quake" || h.ilkanPhase==="stomp") h.ilkanPhase = null;
  if(!died){
    for(let i=0;i<2;i++) pushChampFx({type:"sandPuff", x:h.x+(i?30:-30), y:h.y-6, life:1800, maxLife:1800, v:i+1});
    if(h===player || h.isRemote) showBanner("Ilkan vuelve a su forma humana");
  }
}

/* ---------------- Los Tres Pasos (Ultimate II) ---------------- */
function ilkanStartFinale(h, POWER){
  const R = ILKAN_CFG.finale;
  if(!ilkanFinaleCondition(h)){ h.ilkanFinaleReady = false; return; }   // defensa: nunca fuera de su condición
  h.ilkanFinaleReady = false; h.ultCharge = 0;
  h.ilkanFinaleUses = (h.ilkanFinaleUses||0) + 1; h.ilkanFinaleAt = runElapsedMs;
  const total = R.roarMs + 3*R.telegraphMs + 2*R.gapMs + 900;
  h.ilkanPhase = "finale"; h.ilkanPhaseTimer = total; h.ilkanFinaleTotal = total;
  const base = ilkanBaseDmg(h, POWER) * (talentSkillMods(h.classKey,"ult").flags.finaleDmgPct ? 1+talentSkillMods(h.classKey,"ult").flags.finaleDmgPct : 1);
  // IZQUIERDA -> DERECHA -> CENTRO, alrededor de la pelea y siempre dentro de la arena
  const spots = [[-R.dist, -R.dist*0.25], [R.dist, R.dist*0.25], [0, 0]];
  pushChampFx({type:"finaleScreen", x:h.x, y:h.y, src:h, life:total, maxLife:total, n:R.silhouettes});
  spots.forEach(([ox, oy], i)=>{
    const p = seClampPoint(h.x+ox, h.y+oy, R.radii[i]*0.4);
    const delay = R.roarMs + i*(R.telegraphMs + R.gapMs);
    const life = delay + R.telegraphMs + 1100;
    pushChampFx({type:"finaleStep", x:p.x, y:p.y, r:R.radii[i], dmg:base*R.dmgMult[i], idx:i, delay, tele:R.telegraphMs, src:h, done:false, life, maxLife:life});
  });
  h.ilkanPose = "roar"; h.ilkanPoseTimer = R.roarMs;
  if(h===player || h.isRemote) showBanner("☠ LOS TRES PASOS");
  flashScreen(0.3, "120,20,10");
  ilkanSfx(h, "roar");
}
function ilkanUpdateFinaleStep(f, dt){
  const el = (f.maxLife||0) - f.life;
  if(f.done || el < f.delay + f.tele) return;
  f.done = true;
  const src = f.src;
  for(const e of enemies){
    if(!e.alive) continue;
    const d = Math.hypot(e.x-f.x, e.y-f.y); if(d > f.r + (e.radius||20)*0.5) continue;
    damageEnemy(e, f.dmg*(1 - 0.3*Math.min(1, d/f.r)), {src});
    const l = d||1; seKnock(e, (e.x-f.x)/l, (e.y-f.y)/l, ILKAN_CFG.finale.knockPx, 900);
  }
  // fuego amigo apagado: la pisada no daña a ningún aliado (ni al propio Ilkan)
  ilkanQuakeFx(src, f.x, f.y, f.r, 2);
  vfxShake(f.idx===2 ? 16 : 12);
  flashScreen(f.idx===2 ? 0.35 : 0.22, "255,210,180");
  playSfx(f.idx===2 ? "bigKill" : "boom");
}
// Onda + grietas + polvo + rocas (UNA grieta por golpe: sin cientos de entidades)
function ilkanQuakeFx(h, x, y, R, big){
  pushChampFx({type:"ring", x, y, r:R, life:520, maxLife:520, color:"#e8c9a0", w:big>1?7:5});
  pushChampFx({type:"crack", x, y, v:(Math.random()*3)|0, life:2600, maxLife:2600, s: Math.min(2.6, R/110)});
  vfxShock(x, y, 10, R, "230,200,160", 480, 2);
  vfxBurst(x, y, big>1 ? 30 : 18, "sand", 220, 600, 5, 2, -50, 0);
  vfxBurst(x, y, big>1 ? 16 : 8, "t_#c89a58", 200, 520, 5, 2, -80, 0);
}

/* ---------------- cada cuadro ---------------- */
function updateIlkan(h, dt){
  const dec = k=>{ if(h[k]>0) h[k] = Math.max(0, h[k]-dt); };
  dec("ilkanComboTimer"); dec("ilkanInstinctTimer"); dec("ilkanAdvanceTimer"); dec("ilkanPoseTimer");
  dec("ilkanRedirFxTimer"); dec("ilkanSlashFxTimer"); dec("ilkanExhaustTimer"); dec("ilkanNoTfTimer");
  if(!h.alive){
    if(h.ilkanColossus) ilkanExitColossus(h, true);
    h.ilkanPhase = null; h.ilkanFinaleReady = false;
    return;
  }
  if(h.ilkanColossus){
    // regeneración: parte del daño recibido vuelve de a poco, con granos de arena
    if(h.ilkanRegenPool>0 && h.hp < h.maxHp){
      const heal = Math.min(h.ilkanRegenPool, h.maxHp*ILKAN_CFG.colossus.regenPerSecPct*dt/1000);
      h.hp = Math.min(h.maxHp, h.hp + heal); h.ilkanRegenPool -= heal;
      if(Math.random() < 0.18) vfxBurst(h.x+(Math.random()-0.5)*50, h.y-50-Math.random()*50, 1, "sand", 30, 800, 5, 0, -40, 1);
    }
    if(h.ilkanPhase!=="finale"){
      h.ilkanColossusTimer -= dt;
      if(h.ilkanColossusTimer<=0){ ilkanExitColossus(h, false); }
    }
    ilkanCheckFinale(h);
  }
  if(ilkanLowHp(h) && Math.random()<0.08) vfxBurst(h.x+(Math.random()-0.5)*26, h.y-30, 1, "sand", 20, 500, 3, 0, -25, 1);
  if(h.ilkanAdvanceTimer>0 && Math.random()<0.3) vfxBurst(h.x+(Math.random()-0.5)*30, h.y-10, 1, "t_#f0c050", 25, 420, 3, 0, -30, 1);
  const ph = h.ilkanPhase; if(!ph) return;
  if(ph==="hookPrep"){
    h.ilkanPhaseTimer -= dt; if(h.ilkanPhaseTimer<=0){ h.ilkanPhase = "hook"; h.ilkanLaunchT = 140; }
    return;
  }
  if(ph==="land"){ h.ilkanPhaseTimer -= dt; if(h.ilkanPhaseTimer<=0) h.ilkanPhase = null; return; }
  if(ph==="hook"){
    const H = ILKAN_CFG.hook;
    if(h.ilkanLaunchT>0) h.ilkanLaunchT -= dt;
    const step = Math.min(h.ilkanDashLeft, H.dashSpeed*dt/1000);
    const ox = h.x, oy = h.y;
    h.x += h.ilkanHookDx*step; h.y += h.ilkanHookDy*step;
    clampToArena(h); resolveWallCollision(h);
    const moved = Math.hypot(h.x-ox, h.y-oy);
    h.ilkanDashLeft -= step; h.fx = h.ilkanHookDx; h.fy = h.ilkanHookDy; h.moving = true; h.animT += dt;
    const hitSet = _ilkanHit.get(h) || new Set(); _ilkanHit.set(h, hitSet);
    for(const e of enemies){
      if(!e.alive || hitSet.has(e)) continue;
      if(distance(h, e) > H.slashRadius*(h.ilkanHookArea||1) + (e.radius||20)*0.5) continue;
      hitSet.add(e);
      if(hitSet.size===3) champSetOnHookEnd(h, 3); // set Caravana: lanza que corta a 3+
      damageEnemy(e, h.ilkanHookDmg||0, {src:h});
      vfxBurst(e.x, e.y-16, 6, "t_#f0c050", 150, 300, 3, 1, -20, 0);
      h.ilkanSlashFxTimer = 180;
    }
    if(Math.random()<0.7) vfxBurst(h.x-h.ilkanHookDx*20, h.y-20, 1, "t_#4fe3cf", 40, 260, 2, 0, 0, 1);
    if(moved < step*0.3 || h.ilkanDashLeft<=0){ h.ilkanPhase = "land"; h.ilkanPhaseTimer = H.landMs; vfxBurst(h.x, h.y, 6, "sand", 80, 300, 3, 0, -20, 0); }
    return;
  }
  if(ph==="tf"){
    const T = ILKAN_CFG.colossus, el = T.tfMs - h.ilkanPhaseTimer;
    h.ilkanPhaseTimer -= dt;
    const el2 = T.tfMs - h.ilkanPhaseTimer;
    if(el < T.invokeMs && el2 >= T.invokeMs){
      // RAYO: micro pausa -> destello -> humo/vapor -> sacudida
      pushChampFx({type:"pillar", x:h.x, y:h.y, life:T.tfMs-T.invokeMs+200, maxLife:T.tfMs-T.invokeMs+200});
      flashScreen(0.45, "255,230,200"); vfxShake(14);
      vfxBurst(h.x, h.y, 26, "sand", 200, 700, 5, 2, -60, 0);
      ilkanSfx(h, "thunder");
    }
    if(h.ilkanPhaseTimer<=0){ h.ilkanPhase = null; ilkanEnterColossus(h); }
    return;
  }
  if(ph==="quake"){
    // Terremoto: canalizada; el aturdimiento la corta (misma regla que el resto de canalizadas)
    if(h.stunTimer>0 || !h.ilkanColossus){ h.ilkanPhase = null; return; }
    h.ilkanPhaseTimer -= dt;
    if(h.ilkanPhaseTimer<=0 && h.ilkanQuakeLeft>0){
      h.ilkanQuakeLeft--; h.ilkanPhaseTimer = ILKAN_CFG.terremoto.intervalMs;
      for(const e of enemies){
        if(!e.alive || distance(h,e) > h.ilkanQuakeR + (e.radius||20)*0.5) continue;
        damageEnemy(e, h.ilkanQuakeDmg||0, {src:h});
        if(isEliteRank(e)) e.stunTimer = Math.max(e.stunTimer||0, 200);
      }
      ilkanQuakeFx(h, h.x+(Math.random()-0.5)*40, h.y+(Math.random()-0.5)*30, h.ilkanQuakeR, 1);
      if(h===player) vfxShake(6);
      ilkanSfx(h, "stomp");
      if(h.ilkanQuakeLeft<=0) h.ilkanPhaseTimer = 300;
    } else if(h.ilkanPhaseTimer<=0 && h.ilkanQuakeLeft<=0){ h.ilkanPhase = null; }
    return;
  }
  if(ph==="stomp"){
    const R = ILKAN_CFG.march;
    if(!h.ilkanColossus){ h.ilkanPhase = null; return; }
    // control de dirección limitado: gira despacio hacia donde apunta el jugador / su input
    const want = Math.atan2(h.fy||0, h.fx||0), cur = Math.atan2(h.ilkanStompDy, h.ilkanStompDx);
    let da = want - cur; while(da > Math.PI) da -= 2*Math.PI; while(da < -Math.PI) da += 2*Math.PI;
    const turn = Math.max(-1.6*dt/1000, Math.min(1.6*dt/1000, da));
    h.ilkanStompDx = Math.cos(cur+turn); h.ilkanStompDy = Math.sin(cur+turn);
    h.x += h.ilkanStompDx*R.speed*dt/1000; h.y += h.ilkanStompDy*R.speed*dt/1000;
    clampToArena(h); resolveWallCollision(h);
    h.moving = true; h.animT += dt;
    h.ilkanPhaseTimer -= dt;
    if(h.ilkanPhaseTimer<=0){
      h.ilkanStepsLeft--; h.ilkanPhaseTimer = R.stepMs;
      const cx = h.x + h.ilkanStompDx*30, cy = h.y + h.ilkanStompDy*30;
      for(const e of enemies){
        if(!e.alive || Math.hypot(e.x-cx, e.y-cy) > h.ilkanStompR + (e.radius||20)*0.5) continue;
        damageEnemy(e, h.ilkanStompDmg||0, {src:h});
        const dx = e.x-cx, dy = e.y-cy, l = Math.hypot(dx,dy)||1;
        seKnock(e, dx/l, dy/l, R.knockPx, R.eliteStaggerMs);
      }
      ilkanQuakeFx(h, cx, cy, h.ilkanStompR, 1);
      if(h===player) vfxShake(6);
      ilkanSfx(h, "stomp");
      if(h.ilkanStepsLeft<=0) h.ilkanPhase = null;
    }
    return;
  }
  if(ph==="finale"){
    h.ilkanPhaseTimer -= dt; h.moving = false;
    if(h.ilkanPhaseTimer<=0){
      // humo, silencio breve y de vuelta a humano: agotado
      ilkanExitColossus(h, false);
      const X = ILKAN_CFG.exhausted;
      h.ilkanPhase = "exhaustFall"; h.ilkanPhaseTimer = 1300;
      h.ilkanExhaustTimer = X.durationMs; h.ilkanNoTfTimer = X.noTransformMs; h.ultCharge = 0;
      for(let i=0;i<3;i++) pushChampFx({type:"sandPuff", x:h.x+(i-1)*36, y:h.y-4, life:2200, maxLife:2200, v:i});
      if(h===player || h.isRemote) showBanner("AGOTADO");
    }
    return;
  }
  if(ph==="exhaustFall"){ h.ilkanPhaseTimer -= dt; h.moving = false; if(h.ilkanPhaseTimer<=0) h.ilkanPhase = null; return; }
}
// La definitiva no se puede usar agotado; transformado solo con Los Tres Pasos desbloqueados.
function ilkanUltBlocked(h){
  // Los Tres Pasos cortan el Hundimiento / la Marcha de Dunas en curso (no hay que esperar a que terminen)
  if(h.ilkanColossus && h.ilkanFinaleReady && (!h.ilkanPhase || h.ilkanPhase==="quake" || h.ilkanPhase==="stomp")) return null;
  if(h.ilkanPhase && h.ilkanPhase!=="land") return "busy";
  if(h.ilkanColossus) return h.ilkanFinaleReady ? null : "colossus";
  if(h.ilkanNoTfTimer>0) return "exhausted";
  return null;
}

/* ---------------- dibujo ---------------- */
function _ilkanFrame(P, set, prog, flip, h, s, alpha){
  const arr = P.sets[set]; if(!arr) return false;
  const n = Math.min(arr.length-1, Math.max(0, Math.floor(prog*arr.length)));
  champPackDrawFrame(P, arr[n], h.x, h.y, s, flip, alpha);
  return true;
}
// Atlas de Ilkan (humano / coloso): los de la skin Caravana de Medianoche si el set Caravana de Medianoche (id interno "legion") está completo.
function ilkanPacks(h){
  const sk = typeof setSkinPackKey==="function";
  return [CHAMP_PACK[sk ? setSkinPackKey(h, "ilkan") : "ilkan"], CHAMP_PACK[sk ? setSkinPackKey(h, "ilkan_colossus") : "ilkan_colossus"]];
}
function ilkanColossusScale(h, drawScale){
  const [P, TP] = ilkanPacks(h);
  const humanR = h.ilkanPrev ? h.ilkanPrev.radius : (h.ilkanColossus ? h.radius/ILKAN_CFG.colossus.radiusMult : h.radius);
  const sHuman = humanR*2.7*(drawScale/(h.scale||2.0))/P.refH;
  return sHuman * ILKAN_CFG.colossus.visualScale * P.refH / TP.refH;
}
function drawIlkan(h, drawScale, alpha){
  const [P, TP] = ilkanPacks(h);
  if(!P || !P.ready) return false;
  const dir = champPackDir(h), left = !!h._pleft;
  const ph = h.ilkanPhase;
  const sHuman = (h.ilkanColossus ? h.radius/ILKAN_CFG.colossus.radiusMult : h.radius)*2.7*(drawScale/(h.scale||2.0))/P.refH;
  if(ph==="tf"){
    const T = ILKAN_CFG.colossus, el = T.tfMs - Math.max(0, h.ilkanPhaseTimer);
    if(el < T.invokeMs) return _ilkanFrame(P, "invoke", el/T.invokeMs, left, h, sHuman, alpha);
    if(TP && TP.ready) return _ilkanFrame(TP, "tf", (el-T.invokeMs)/(T.tfMs-T.invokeMs), left, h, ilkanColossusScale(h, drawScale), alpha);
    return _ilkanFrame(P, "invoke", 0.99, left, h, sHuman, alpha);
  }
  if(h.ilkanColossus && TP && TP.ready){
    const s = ilkanColossusScale(h, drawScale);
    if(ph==="finale") return _ilkanFrame(TP, "roar", 0, left, h, s, alpha);
    if(ph==="quake") return _ilkanFrame(TP, "terremoto", ((ILKAN_CFG.terremoto.intervalMs - Math.max(0,h.ilkanPhaseTimer))/ILKAN_CFG.terremoto.intervalMs), left, h, s, alpha);
    if(ph==="stomp") return _ilkanFrame(TP, "march", 1 - Math.max(0,h.ilkanPhaseTimer)/ILKAN_CFG.march.stepMs, (h.ilkanStompDx||0) < 0, h, s, alpha);
    if(h.ilkanPose==="sismo" && h.ilkanPoseTimer>0) return _ilkanFrame(TP, "sismo", 1 - h.ilkanPoseTimer/560, left, h, s, alpha);
    if(h.attackAnim>0){
      const prog = 1 - h.attackAnim/(h.ilkanAtkTotal||380);
      if((h.ilkanAtkStep||0)===2) return _ilkanFrame(TP, "sismo", prog, left, h, s, alpha);
      return _ilkanFrame(TP, "atk", (h.ilkanAtkStep ? 0.5 : 0) + prog*0.5, left, h, s, alpha);
    }
    const pick = champPackSet(TP, h.moving ? "walk" : "idle", dir, h) || champPackSet(TP, "idle", "down", h);
    const arr = pick.arr;
    const n = h.moving ? Math.floor((h.animT||0)/200) % arr.length : Math.floor(animNow/420) % arr.length;
    champPackDrawFrame(TP, arr[n], h.x, h.y, s, pick.flip, alpha);
    return true;
  }
  if(ph==="finale") return _ilkanFrame(P, "exhausted", 0, left, h, sHuman, alpha); // (no debería verse: el coloso ruge)
  if(ph==="exhaustFall") return _ilkanFrame(P, "exhausted", Math.min(0.99, 1 - Math.max(0,h.ilkanPhaseTimer)/1300), left, h, sHuman, alpha);
  if(ph==="hookPrep") return _ilkanFrame(P, "lance_prep", 1 - Math.max(0,h.ilkanPhaseTimer)/ILKAN_CFG.hook.prepMs, (h.ilkanHookDx||0) < 0, h, sHuman, alpha);
  if(ph==="hook"){
    const fl = (h.ilkanHookDx||0) < 0;
    if(h.ilkanSlashFxTimer>0) return _ilkanFrame(P, "lance_slash", 1 - h.ilkanSlashFxTimer/180, fl, h, sHuman, alpha);
    if(h.ilkanLaunchT>0) return _ilkanFrame(P, "lance_launch", 0, fl, h, sHuman, alpha);
    return _ilkanFrame(P, "lance_fly", h.ilkanRedirFxTimer>0 ? 0.99 : ((h.animT||0)/120 % 2)/3, fl, h, sHuman, alpha);
  }
  if(ph==="land") return _ilkanFrame(P, "lance_land", 0, left, h, sHuman, alpha);
  if(h.ilkanPoseTimer>0 && (h.ilkanPose==="instinct" || h.ilkanPose==="advance")) return _ilkanFrame(P, h.ilkanPose, 1 - h.ilkanPoseTimer/(h.ilkanPose==="advance"?620:520), left, h, sHuman, alpha);
  if(h.ilkanExhaustTimer>0 && !h.moving && h.ilkanExhaustTimer > ILKAN_CFG.exhausted.durationMs-2500) return _ilkanFrame(P, "exhausted", 0, left, h, sHuman, alpha);
  if(h.attackAnim>0){
    const prog = 1 - h.attackAnim/(h.ilkanAtkTotal||200), st = h.ilkanAtkStep||0;
    return _ilkanFrame(P, "attack_side", (st + prog)/3.0001, left, h, sHuman, alpha);
  }
  if(h.moving && (h.ilkanAdvanceTimer>0 || ilkanLowHp(h))) return _ilkanFrame(P, "run", ((h.animT||0)/100 % 4)/4, left, h, sHuman, alpha);
  return drawChampPack("ilkan", h, drawScale, alpha);
}
// Encima del personaje: pendón de la lanza, auras, Tormenta lista.
// PENDÓN: dos tiras de tela (verde azulado y dorada) que ondulan entre la mano y la punta de la lanza clavada.
function ilkanDrawPennant(hx, hy, ax, ay){
  const dx = ax-hx, dy = ay-hy, len = Math.hypot(dx, dy) || 1, nx = -dy/len, ny = dx/len, t = animNow/140;
  const strip = (col, w, ph, amp)=>{
    ctx.beginPath();
    const N = 14;
    for(let i=0;i<=N;i++){
      const u = i/N, wob = Math.sin(u*7 - t + ph)*amp*Math.sin(u*Math.PI);
      const x = hx + dx*u + nx*(wob - w*0.5*(1-u*0.6)), y = hy + dy*u + ny*(wob - w*0.5*(1-u*0.6));
      if(i===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    for(let i=N;i>=0;i--){
      const u = i/N, wob = Math.sin(u*7 - t + ph)*amp*Math.sin(u*Math.PI);
      ctx.lineTo(hx + dx*u + nx*(wob + w*0.5*(1-u*0.6)), hy + dy*u + ny*(wob + w*0.5*(1-u*0.6)));
    }
    ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  };
  ctx.save();
  strip("rgba(24,120,112,0.92)", 7, 0, 5);
  strip("rgba(240,190,80,0.9)", 3.5, 1.2, 6);
  ctx.restore();
}
function ilkanDrawOverlays(h){
  if(h.ilkanPhase==="hook" || h.ilkanPhase==="hookPrep"){
    const hx = h.x + (h.ilkanHookDx||0)*10, hy = h.y - 30;
    ilkanDrawPennant(hx, hy, h.ilkanAnchorX, h.ilkanAnchorY);
    const img = seFx("fx_lance_01");
    if(img){
      const ang = Math.atan2(h.ilkanAnchorY-hy, h.ilkanAnchorX-hx), w = 46, hh = w*img.height/img.width;
      ctx.save(); ctx.translate(h.ilkanAnchorX, h.ilkanAnchorY); ctx.rotate(ang); ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, -w*0.8, -hh/2, w, hh);
      ctx.restore();
    }
  }
  if(h.ilkanInstinctTimer>0 && Math.random()<0.5) vfxBurst(h.x+(Math.random()-0.5)*40, h.y-10-Math.random()*50, 1, "t_#4fe3cf", 20, 260, 2, 0, -10, 0);
  if(h.ilkanAdvanceTimer>0){
    ctx.save(); ctx.globalAlpha = 0.18 + 0.1*Math.sin(animNow/120); ctx.fillStyle = "#e0a838";
    const r = (h.ilkanColossus ? 90 : 34);
    ctx.beginPath(); ctx.ellipse(h.x, h.y+2, r, r*0.4, 0, 0, Math.PI*2); ctx.fill(); ctx.restore();
  }
  if(h.ilkanFinaleReady){
    ctx.save(); ctx.globalAlpha = 0.5 + 0.4*Math.sin(animNow/90); ctx.strokeStyle = "#4fe3cf"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(h.x, h.y+4, 110, 44, 0, 0, Math.PI*2); ctx.stroke(); ctx.restore();
  }
}
function ilkanDrawCrack(f){
  const img = seFx("fx_crack_0"+(1+(f.v||0))); if(!img) return;
  const s = f.s||1;
  drawSeImg(img, f.x, f.y, img.width*s*1.3, img.height*s*0.8, 0.5, 0.5, false, Math.min(1, _fxA(f)*2)*0.85);
}
function ilkanDrawPillar(f){
  const a = _fxA(f), el = (f.maxLife||1) - f.life;
  const img = seFx(el % 160 < 80 ? "fx_pillar_01" : "fx_pillar_02"); if(!img) return;
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  drawSeImg(img, f.x, f.y+6, img.width*2.6, img.height*2.6, 0.5, 0.95, false, Math.min(1, a*2));
  ctx.restore();
}
function ilkanDrawSandPuff(f){
  const a = _fxA(f), el = (f.maxLife||1) - f.life;
  const img = seFx("fx_sand_0"+(1+((((el/220)|0)+(f.v||0))%4))); if(!img) return;
  drawSeImg(img, f.x, f.y - el*0.03, img.width*1.4, img.height*1.4, 0.5, 0.9, false, Math.min(1, a*1.5)*0.8);
}
// Aviso de paso en el suelo: sombra que crece + anillo ámbar + cuenta (siempre antes del impacto).
function ilkanDrawFinaleTelegraph(f){
  const el = (f.maxLife||0) - f.life;
  if(el < f.delay) return;
  const k = Math.min(1, (el - f.delay)/f.tele);
  ctx.save();
  if(!f.done){
    ctx.globalAlpha = 0.25 + 0.45*k; ctx.fillStyle = "#1c1206";
    ctx.beginPath(); ctx.ellipse(f.x, f.y, f.r*(0.55+0.45*k), f.r*(0.55+0.45*k)*0.6, 0, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 0.5 + 0.5*Math.abs(Math.sin(el/90)); ctx.strokeStyle = "#ffb030"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.ellipse(f.x, f.y, f.r, f.r*0.6, 0, 0, Math.PI*2); ctx.stroke();
    ctx.globalAlpha = 1; ctx.fillStyle = "#ffe9b0"; ctx.font = pxFont(30); ctx.textAlign = "center";
    ctx.fillText(String(Math.max(1, Math.ceil((1-k)*3))), f.x, f.y+12);
  }
  ctx.restore();
}
function ilkanDrawFinaleFoot(f){
  const el = (f.maxLife||0) - f.life, t0 = f.delay + f.tele;
  if(el < t0 - 350) return;
  const img = seFx("fx_foot_0"+(1+(f.idx||0)));
  if(!img) return;
  const drop = Math.min(1, (el - (t0-350))/350), fade = el > t0 ? Math.max(0, 1 - (el - t0)/900) : 1;
  const w = f.r*2.6, hgt = w*img.height/img.width;
  drawSeImg(img, f.x, f.y + f.r*0.35 - (1-drop)*160, w, hgt, 0.5, 1, false, drop*fade*0.95);
}
// Siluetas de colosos alrededor/fuera de la arena (pantalla) + tinte de arena: solo VFX.
function ilkanDrawFinaleScreen(f){
  const img = seFx("silhouettes_01");
  const total = f.maxLife||1, el = total - f.life, a = Math.min(1, el/700) * Math.min(1, f.life/800);
  const W = ctx.canvas.width, H = ctx.canvas.height;
  ctx.save(); ctx.setTransform(1,0,0,1,0,0);
  ctx.globalAlpha = 0.22*a; ctx.fillStyle = "#2a1a04"; ctx.fillRect(0,0,W,H);
  if(img){
    ctx.imageSmoothingEnabled = false;
    const w = W*0.7, h = w*img.height/img.width, sway = Math.sin(el/600)*10;
    ctx.globalAlpha = 0.55*a;
    ctx.drawImage(img, -w*0.15 + sway, -h*0.25, w, h);
    ctx.drawImage(img, W - w*0.85 - sway, -h*0.2, w, h);
    ctx.globalAlpha = 0.4*a;
    ctx.save(); ctx.translate(W/2, H); ctx.scale(1, -1); ctx.drawImage(img, -w/2, -h*0.2, w, h*0.8); ctx.restore();
  }
  ctx.restore();
}

/* ---------------- IA ---------------- */
function botIlkan(h, passiveCdMult){
  const ph = h.ilkanPhase;
  if(ph==="hook"){
    // segunda lanza: cambio de dirección hacia un grupo o lejos del peligro
    if(ilkanHookCanRedirect(h) && h.ilkanDashLeft < 120){
      const danger = h.hp/h.maxHp < 0.3 && seCountNear(h.x, h.y, 160) >= 2;
      const t = danger ? null : bestClusterPoint(h, 320, 90);
      if(t || danger){
        const d = danger ? {dx:-(h.fx||0), dy:-(h.fy||0)} : {dx:t.x-h.x, dy:t.y-h.y};
        ilkanHookRedirect(h, d);
      }
    }
    return true;
  }
  if(ph) return true;
  const spend = (idx)=>{
    const sk = h.cls.skills[idx];
    h.energy -= sk.cost;
    h.cds[idx] = sk.cd * 1.1 * cdMultFor(sk, masteryOf(h.classKey, idx)) * passiveCdMult * arenaMods().heroCdMult*arenaRuleCdMult() * talentSkillCdMult(h.classKey, idx);
    castAbility(h, sk, false, idx);
  };
  const ready = (idx)=>{ const sk = h.cls.skills[idx]; return h.cds[idx]<=0 && h.energy >= sk.cost; };
  const near = r=>seCountNear(h.x, h.y, r);
  const boss = enemies.find(e=>e.alive && isBossRank(e) && distance(h,e) < 420);
  const elite = enemies.find(e=>e.alive && isEliteRank(e) && distance(h,e) < 360);
  if(h.ilkanColossus){
    // Ultimate II: disponible + muchos enemigos / jefe / la transformación está por terminar
    if(h.ilkanFinaleReady && (near(420) >= 6 || boss || h.ilkanColossusTimer < 5000)){
      ilkanStartFinale(h, masteryPowerMult(effectiveMasteryFor(h.classKey, "ult"))); return true;
    }
    if(ready(0) && (near(230) >= 3 || (boss && distance(h,boss) < 220))){ spend(0); return true; }
    if(ready(1) && (near(250) >= 5 || (boss && distance(h,boss) < 200 && h.hp/h.maxHp > 0.4))){ spend(1); return true; }
    if(ready(2)){ const p = bestClusterPoint(h, 380, 120); if(p && near(380) >= 4){ const dx=p.x-h.x, dy=p.y-h.y, l=Math.hypot(dx,dy)||1; h.fx=dx/l; h.fy=dy/l; spend(2); return true; } }
    return true;
  }
  // Transformación: grupos grandes, élites, jefes o peligro de muerte
  const inDanger = h.hp/h.maxHp < 0.35 && near(200) >= 2;
  if(h.ultCharge >= h.ultMax && h.ultCd<=0 && runLevel >= ULT_MIN_ARENA_LEVEL && !ilkanUltBlocked(h) && (near(300) >= 5 || boss || elite || inDanger)){
    castAbility(h, h.cls.ultimate, true);
    h.ultCharge = 0; h.ultCd = ultCooldownFor(h, h.cls.ultimate.cd, passiveCdMult);
    return true;
  }
  // Piel de Duna: bajo presión, para cargar Tormenta
  if(ready(1) && ((h.hp/h.maxHp < 0.55 && near(150) >= 2) || (h.ultCharge/h.ultMax > 0.6 && near(160) >= 3))){ spend(1); return true; }
  // Grito de Caravana: antes de entrar agresivamente
  if(ready(2) && (near(260) >= 3 || boss || elite)){ spend(2); return true; }
  // Ganchos: escapar, acercarse a un objetivo prioritario o atravesar un grupo
  if(ready(0)){
    let t = null, away = false;
    if(inDanger){ away = true; }
    else {
      const pri = elite || boss || enemies.find(e=>e.alive && e.hp < e.maxHp*0.3 && distance(h,e) < 340);
      if(pri && distance(h, pri) > 140) t = pri;
      else { const p = bestClusterPoint(h, 340, 80); if(p && near(340) >= 4 && distance(h, p) > 120) t = p; }
    }
    if(t || away){
      const dx = away ? -(h.fx||0) : t.x-h.x, dy = away ? -(h.fy||1) : t.y-h.y, l = Math.hypot(dx,dy)||1;
      h.fx = dx/l; h.fy = dy/l;
      spend(0); return true;
    }
  }
  return true;
}

/* ---------------- HUD ---------------- */
function ilkanHudHtml(p){
  const fury = Math.round(100*(p.ultCharge||0)/(p.ultMax||100));
  const rows = [`<div class="se-fury"><span>TORMENTA</span><div class="se-bar fury"><i style="width:${fury}%"></i></div>${fury}%</div>`];
  if(ilkanLowHp(p)) rows.push(`<div class="se-warn">🌪 SED DE HORIZONTE</div>`);
  if(p.ilkanColossus){
    rows.push(`<div>🗿 ${Math.ceil(Math.max(0,p.ilkanColossusTimer)/1000)}s <div class="se-bar colossus"><i style="width:${Math.round(100*Math.max(0,p.ilkanColossusTimer)/(p.ilkanColossusMax||1))}%"></i></div></div>`);
    if(p.ilkanRegenPool>1) rows.push(`<div class="se-on">⏳ regenerando</div>`);
    if(p.ilkanFinaleReady) rows.push(`<div class="se-finale">☠ LOS TRES PASOS LISTOS</div>`);
    else if(p.ilkanColossus && p.ultCharge >= p.ultMax){
      const used = p.ilkanFinaleUses||0, R = ILKAN_CFG.finale;
      rows.push(`<div class="se-finale" style="opacity:.7">☠ Los Tres Pasos: ${used >= R.maxPerRun ? "ya no queda en esta partida" : (used ? "otra vez solo con el jefe debajo del 50%" : "solo contra un JEFE o al borde de la muerte")} (${used}/${R.maxPerRun})</div>`);
    }
  }
  if(p.ilkanExhaustTimer>0) rows.push(`<div class="se-off">AGOTADO ${Math.ceil(p.ilkanExhaustTimer/1000)}s</div>`);
  else if(p.ilkanNoTfTimer>0 && !p.ilkanColossus) rows.push(`<div class="se-off">sin Coloso ${Math.ceil(p.ilkanNoTfTimer/1000)}s</div>`);
  return rows.join("");
}
