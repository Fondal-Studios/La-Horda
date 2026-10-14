"use strict";
/* ============================================================
   js/arenas/lanes/lanes-levels.js
   GUERRA DE CRISTALES en el motor real — experiencia y niveles dentro de la partida (de 3 a 15), reaparición, curación en la
   base y volver a la base (recall). Todos arrancan en el nivel 3 sin cuenta ni equipo; cada nivel sube vida, daño y defensa con la
   misma curva de la campaña (computePlayerStats). Cada nuevo nivel máximo del equipo ofrece una carta de horda.
   ============================================================ */
function lanesLevelNeed(l){ return 60 + 22 * l; }    // experiencia para pasar del nivel l al l+1
// Aplica las estadísticas del nivel `lvl` al héroe conservando la proporción de vida (y la curva normal de bots).
function lanesApplyLevel(h, lvl, full){
  const base = computePlayerStats(h.classKey, lvl), ratio = h.maxHp ? h.hp / h.maxHp : 1;
  const bot = h.isBot && !h.isDivineFoe;
  h.maxHp = Math.round(base.hp * runStats.hpMult * (bot ? 1.15 : 1) * (1 + 0.10 * (h.itHp || 0)));
  h.hp = full ? h.maxHp : Math.max(1, Math.round(h.maxHp * ratio));
  h.baseDmg = base.dmg * (bot ? 0.72 : 1); h.def = base.def;
  if(h._spd0 == null) h._spd0 = h.baseSpeed; h.baseSpeed = h._spd0 * (1 + 0.07 * (h.itSpd || 0));
  h.mlvl = lvl;
  if(save.champions[h.classKey]) save.champions[h.classKey].level = lvl;   // el HUD de siempre muestra «Nv. X»
}
// Reparte experiencia entre los héroes vivos del equipo que estén cerca de (x, y).
function lanesGrantXP(team, x, y, amount){
  const L = LN; if(!L) return;
  const near = heroes.filter(h=>h.team === team && h.alive && Math.hypot(h.x - x, h.y - y) < LANES.XP_SHARE_R);
  if(!near.length) return;
  const each = amount / Math.pow(near.length, 0.6);
  for(const h of near) lanesAddXP(h, each);
}
function lanesAddXP(h, xp){
  if((h.mlvl || LANES.LEVEL0) >= LANES.LEVEL_MAX) return;
  h.mxp = (h.mxp || 0) + xp;
  while(h.mlvl < LANES.LEVEL_MAX && h.mxp >= lanesLevelNeed(h.mlvl)){ h.mxp -= lanesLevelNeed(h.mlvl); lanesLevelUp(h); }
}
function lanesLevelUp(h){
  const L = LN, lvl = h.mlvl + 1;
  lanesApplyLevel(h, lvl, false);
  h.hp = Math.min(h.maxHp, h.hp + h.maxHp * 0.2);
  floatText(h.x, h.y - 46, "¡NIVEL " + lvl + "!", "heal");
  if(typeof playSfx === "function") try{ playSfx("levelup"); }catch(e){}
  if(typeof juiceLevelUp === "function") try{ juiceLevelUp(h.classKey, lvl); }catch(e){}
  // Un hito por equipo: no depender de un capitán quieto o de su posición en heroes.
  const T = L.team[h.team], previous = T.cardLevel == null ? LANES.LEVEL0 : T.cardLevel;
  if(lvl > previous){
    T.cardLevel = lvl;
    const earned = T.taken + T.pendingCards + (T.offer ? 1 : 0);
    T.pendingCards += Math.min(lvl - previous, Math.max(0, LANES.MAX_CARDS - earned));
  }
}

/* ---------------- volver a la base ---------------- */
function lanesRecallStart(h){
  const L = LN; if(!L || L.ended || !h || !h.alive || h._recall) return false;
  const c = laneCrystalPos(h.team);
  if(Math.hypot(h.x - c.x, h.y - c.y) < 300) return false;           // ya está en la base
  h._recall = {t0:L.t, x:h.x, y:h.y};
  if(h === player) showBanner("Volviendo a la base… no te muevas");
  return true;
}
function lanesRecallRequest(h){ if(typeof lanesNetRecallRequest === "function" && lanesNetRecallRequest()) return true; return lanesRecallStart(h); }

/* ---------------- ciclo de los héroes (reaparición, base, recall, bendiciones) ---------------- */
function lanesHeroTick(dt){
  const L = LN;
  for(const h of heroes){
    h.gold = Math.min(LANES.MAX_GOLD, (h.gold == null ? LANES.START_GOLD : h.gold) + (h.alive ? LANES.GOLD_PASSIVE * dt / 1000 : 0));
    if(h.alive){
      h.dead_t = 0;
      if(h.itRegen && h.hp < h.maxHp) h.hp = Math.min(h.maxHp, h.hp + h.maxHp * 0.006 * h.itRegen * dt / 1000);
      if(!lanesIsHuman(h)) lanesBotShop(h);
      const c = laneCrystalPos(h.team);   // curación en la base propia
      if(Math.hypot(h.x - c.x, h.y - c.y) < 300 && h.hp < h.maxHp){ h.hp = Math.min(h.maxHp, h.hp + h.maxHp * LANES.BASE_HEAL * dt / 1000); h.energy = Math.min(h.maxEnergy || 100, (h.energy || 0) + 12 * dt / 1000); }
      if(h._recall){
        const r = h._recall;
        if(Math.hypot(h.x - r.x, h.y - r.y) > 40 || h.stunTimer > 0) h._recall = null;                 // te movés: se corta
        else if(L.t - r.t0 >= LANES.RECALL_MS){
          const rp = laneRally(h.team); h.x = rp.x + (Math.random() - 0.5) * 80; h.y = rp.y + (Math.random() - 0.5) * 80; h.hp = h.maxHp; h.energy = h.maxEnergy; h._recall = null;
          if(h._net) h._net.posAuth++;
          particles.push({x:h.x, y:h.y, life:600, ring:true, maxLife:600, maxR:70, color:lanesTeamColor(h.team)});
        }
      }
      continue;
    }
    h._recall = null;
    if(!h.dead_t){
      h.dead_t = L.t; h._respawnAt = L.t + lanesRespawnMs(h);
      const kt = h._lnKiller, kh = h._lnKillerHero; h._lnKiller = null; h._lnKillerHero = null;
      if(kt != null && kt !== h.team){
        L.team[kt].pk++;
        if(kh) lanesAddGold(kh, LANES.GOLD_HERO_KILL);
        for(const a of heroes) if(a.team === kt && a !== kh && a.alive && Math.hypot(a.x - h.x, a.y - h.y) < LANES.XP_SHARE_R) lanesAddGold(a, LANES.GOLD_ASSIST);
        lanesGrantXP(kt, h.x, h.y, LANES.XP_HERO + 12 * (h.mlvl || 1));
        if(kh && kh.stats) kh.stats.kills = kh.stats.kills || 0;
        lanesFeed(lanesTeamName(kt) + " derribó a " + heroLabel(h), kt);
      }
      continue;
    }
    if(L.t >= h._respawnAt){
      const c = laneRally(h.team); h.x = c.x + (Math.random() - 0.5) * 120; h.y = c.y + (Math.random() - 0.5) * 120;
      reviveHero(h, null); h.hp = h.maxHp; h.energy = h.maxEnergy; h.invulnTimer = 2500; h.dead_t = 0;
      if(h._net) h._net.posAuth++; // un invitado acepta la nueva posición
    }
  }
}

// Los bots compran en la base: siguiente nivel del objeto que más les conviene según su rol.
function lanesBotShop(h){
  const L = LN; if((h._shopAt != null && L.t - h._shopAt < 2000) || !lanesAtShop(h)) return;
  h._shopAt = L.t;
  const order = h.ln === -1 ? ["atk", "speed", "hp", "regen", "siege"] : (h.cls && (h.cls.role === "tanque") ? ["hp", "atk", "regen", "speed", "siege"] : ["atk", "hp", "speed", "siege", "regen"]);
  let best = null;
  for(const id of order){ const it = LANES_ITEMS[id], tier = h[it.field] || 0; if(tier >= 3 || (h.gold || 0) < it.costs[tier]) continue; if(!best || tier < best.tier) best = {id, tier}; }
  if(best) lanesBuy(h.team, "item:" + best.id, h);
}
