// MIGRACIÓN DE GUARDADOS del rework de Ilkan (clave legada "eren" -> "ilkan"), en el juego real.
// Se siembra localStorage con un guardado escrito por un cliente ANTERIOR (progreso, talentos, maestría,
// inventario, desafíos...) y se comprueba que al abrir el juego nada se pierde y todo queda bajo la clave nueva.
//   node tools/regression/t_ilkan_migration.js <urlBase>      # p.ej. http://127.0.0.1:8981 (el repo servido tal cual)
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const BASE = process.argv[2] || 'http://127.0.0.1:8981';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const OLD = 'eren', NEW = 'ilkan';
let fails = 0;
const check = (id, ok, detail) => { console.log((ok ? 'PASS ' : 'FAIL ') + id + (detail !== undefined ? '  ' + JSON.stringify(detail).slice(0, 220) : '')); if (!ok) fails++; };

const mk = (extra) => Object.assign({ level: 1, xp: 0, talentPoints: 0, unlocked: false, skillMastery: [0, 1, 2].map(() => ({ useXp: 0, useLvl: 1, alloc: 0 })), ultMastery: { useXp: 0, useLvl: 1, alloc: 0 }, equipment: {}, inventory: [], talents: { nodes: {}, picks: {}, mastery: null, masteryNodes: {} }, croma: null }, extra || {});
function legacySave(withFreshNew) {
  const champions = { tanque: mk({ unlocked: true, level: 20 }) };
  champions[OLD] = mk({ unlocked: true, level: 45, xp: 120, talentPoints: 3,
    skillMastery: [{ useXp: 10, useLvl: 2, alloc: 4 }, { useXp: 0, useLvl: 1, alloc: 2 }, { useXp: 0, useLvl: 1, alloc: 0 }], ultMastery: { useXp: 0, useLvl: 1, alloc: 3 },
    equipment: { arma: 'it_9_x' },
    talents: { nodes: { er_man_c1: 3, er_man_c2: 2, er_ins_c1: 1, er_tit_s1: 2 }, picks: {}, mastery: 'instinto', masteryNodes: { er_m_ins_1: 2, er_m_ins_3: 1 } } });
  if (withFreshNew) champions[NEW] = mk({ unlocked: false });
  return { champions, lastChamp: OLD, gold: 777, gems: 5, itemSchemaV: 2,
    // marcas de las migraciones anteriores (un guardado vigente de antes del rework ya las tiene; sin ellas se reharían)
    talentTreeV2: true, talentGate40V1: true, campaignV2: true, ciudadV1: true, minasV1: true, starterGiftV1: true, fortalezaMigrated: true, micelialMigrated: true, abismoMigrated: true, starterChosen: true, divineArenaUnlocked: true, campaignResetV1: true, campaignResetV2: true, campaignResetV3: true, testStageV1: true, playtestV1Bonus: true,
    arenasCleared: { bosque: true, acuatica: true, fortaleza: true, micelial: true, hielo: true, laberinto: true, infernal: true }, relics: { hp: 0, dmg: 0, def: 0, vel: 0 },
    stash: [
      { uid: 'it_9_x', level: 1, roll: 0.5, designed: true, designId: 'legion_arma', champion: OLD, set: 'legion', name: 'Hojas de la Legión', rarity: 'legendario', type: 'arma', icon: '🗡', statKey: 'arma', value: 0.2, passives: [], desc: 'Las alas en la espalda no son un adorno: son una promesa de volver. · +20% daño · Set: Legión de Reconocimiento' },
      { uid: 'it_10_y', level: 1, roll: 0.5, designed: false, champion: null, rarity: 'raro', type: 'casco', icon: '⛑', statKey: 'casco', value: 0.1, passives: [] },
    ], stashV1: true, affixV1: true,
    quests: { stats: { byChamp: { [OLD]: { runs: 5, wins: 2, kills: 100, timeMs: 1000 } } } } };
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
  for (const variant of ['solo_clave_vieja', 'clave_vieja_y_fila_nueva_vacia']) {
    const ctx = await browser.newContext({ viewport: { width: 1000, height: 560 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await ctx.addInitScript(() => { window.__campaignMode = true; });
    await ctx.addInitScript(s => { try { if (!sessionStorage.getItem('__seeded')) { localStorage.setItem('laHordaSave_v1', s); sessionStorage.setItem('__seeded', '1'); } } catch (e) {} },
      JSON.stringify(legacySave(variant !== 'solo_clave_vieja')));
    await page.goto(BASE + '/index.html', { waitUntil: 'load', timeout: 120000 });
    for (let k = 0; k < 300; k++) { if (await page.evaluate(() => !!document.getElementById('title-continue-btn') && !document.getElementById('title-continue-btn').disabled)) break; await sleep(100); }
    const r = await page.evaluate(([OLD, NEW]) => {
      const c = save.champions[NEW] || {};
      const it = (save.stash || []).find(x => x.uid === 'it_9_x') || {};
      return {
        hasOld: !!save.champions[OLD], hasNew: !!save.champions[NEW], level: c.level, xp: c.xp, tp: c.talentPoints, unlocked: c.unlocked,
        nodes: c.talents && c.talents.nodes, mastery: c.talents && c.talents.mastery, masteryNodes: c.talents && c.talents.masteryNodes,
        skillAlloc: (c.skillMastery || []).map(m => m.alloc), ultAlloc: c.ultMastery && c.ultMastery.alloc, equip: c.equipment && c.equipment.arma,
        rank: typeof talentRank === 'function' ? [talentRank(NEW, 'il_pen_c1'), talentRank(NEW, 'il_dun_c1'), talentRank(NEW, 'il_col_s1')] : null,
        masteryChosen: typeof talentState === 'function' ? talentState(NEW).mastery : null,
        item: { champion: it.champion, name: it.name, desc: it.desc, set: it.set },
        designedName: DESIGNED_ITEMS.legion_arma && DESIGNED_ITEMS.legion_arma.name,
        byChamp: save.quests && save.quests.stats && save.quests.stats.byChamp,
        stored: localStorage.getItem('laHordaSave_v1'),
        gold: save.gold, lastChamp: save.lastChamp, selected: (typeof netRestoreLastChamp === 'function' ? (netRestoreLastChamp(), selectedClass) : null),
      };
    }, [OLD, NEW]);
    check(variant + '.sin_clave_vieja', !r.hasOld && r.hasNew, { hasOld: r.hasOld, hasNew: r.hasNew });
    check(variant + '.progreso', r.level === 45 && r.xp === 120 && r.tp === 3 && r.unlocked === true, { level: r.level, xp: r.xp, tp: r.tp, gold: r.gold });
    check(variant + '.talentos', r.nodes && r.nodes.il_pen_c1 === 3 && r.nodes.il_pen_c2 === 2 && r.nodes.il_dun_c1 === 1 && r.nodes.il_col_s1 === 2 && !r.nodes.er_man_c1 && JSON.stringify(r.rank) === '[3,1,2]', { nodes: r.nodes, rank: r.rank });
    check(variant + '.maestria_de_talentos', r.mastery === 'duna' && r.masteryChosen === 'duna' && r.masteryNodes.il_m_dun_1 === 2 && r.masteryNodes.il_m_dun_3 === 1, { mastery: r.mastery, nodes: r.masteryNodes });
    check(variant + '.maestria_de_habilidades_y_equipo', JSON.stringify(r.skillAlloc) === '[4,2,0]' && r.ultAlloc === 3, { skillAlloc: r.skillAlloc, ult: r.ultAlloc, equip: r.equip });
    check(variant + '.objeto_del_set', r.item.champion === NEW && r.item.name === r.designedName && /Caravana de Medianoche/.test(r.item.desc) && /\+20%/.test(r.item.desc) && !/Legión de Reconocimiento/.test(r.item.desc), r.item);
    check(variant + '.seleccion_recordada', r.lastChamp === NEW && r.selected === NEW, { lastChamp: r.lastChamp, selected: r.selected });
    check(variant + '.estadisticas', r.byChamp && r.byChamp[NEW] && r.byChamp[NEW].runs === 5 && !r.byChamp[OLD], r.byChamp);
    check(variant + '.guardado_reescrito_sin_clave_vieja', typeof r.stored === 'string' && !r.stored.includes('"' + OLD + '"') && !r.stored.includes('"er_man_c1"') && r.stored.includes('"' + NEW + '"'), { oldInStorage: (r.stored || '').includes('"' + OLD + '"') });
    // el campeón es jugable: se puede iniciar una partida con él y sus 3 habilidades + definitiva existen
    const play = await page.evaluate(([NEW]) => { selectedClass = NEW; currentArena = 'bosque'; startRun(1); return { cls: player.classKey, name: player.cls.name, skills: player.cls.skills.map(s => s.name), ult: player.cls.ultimate.name, level: save.champions[NEW].level }; }, [NEW]);
    check(variant + '.jugable', play.cls === NEW && play.skills.length === 3 && /Ilkan/.test(play.name), play);
    await sleep(300);
    // recarga: el guardado ya migrado no cambia (idempotente)
    const before = await page.evaluate(() => JSON.stringify(save.champions.ilkan));
    await page.evaluate(() => { try { loadSave(); } catch (e) {} });
    const after = await page.evaluate(() => JSON.stringify(save.champions.ilkan));
    check(variant + '.idempotente', before === after);
    check(variant + '.sin_errores_de_pagina', errors.length === 0, errors.slice(0, 3));
    await ctx.close();
  }
  await browser.close();
  console.log(fails ? `FALLAS: ${fails}` : 'TODO OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
