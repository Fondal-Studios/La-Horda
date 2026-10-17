"use strict";
// Rework de Ilkan (campeón original que reemplazó al campeón de clave legada "eren"): el servidor acepta y MIGRA ids
// viejos sin perder progreso. Carpeta temporal, nunca DATABASE_URL.
//   · guardado en la nube con la clave vieja (nivel, talentos, objetos, desafíos) -> sale con la clave nueva (GET y PUT)
//   · ranking semanal: filas guardadas con el guardián viejo se leen como el nuevo; los envíos viejos entran como el nuevo
//   · concesiones del libro del Game Master hechas con el id viejo siguen contando
//   · idempotente: un guardado ya migrado no cambia
const assert = require("assert/strict"), http = require("http"), fs = require("fs"), os = require("os"), path = require("path");
const { create, hashPassword, lbWeekKey } = require("./accounts");
const ent = require("./entitlements");
const legacy = require("../js/storage/legacy-champion-ids.js");

const OLD = "eren", NEW = "ilkan";
const legacySave = () => ({
  gold: 1234, gems: 7, starterChosen: true, lastChamp: OLD,
  champions: {
    tanque: { unlocked: true, level: 12, xp: 5, talents: { nodes: {}, picks: {}, mastery: null, masteryNodes: {} } },
    [OLD]: { unlocked: true, level: 37, xp: 120, talentPoints: 3, croma: null,
      skillMastery: [{ useXp: 10, useLvl: 2, alloc: 4 }, { useXp: 0, useLvl: 1, alloc: 2 }, { useXp: 0, useLvl: 1, alloc: 0 }],
      ultMastery: { useXp: 0, useLvl: 1, alloc: 3 },
      equipment: { arma: "it_9_x" },
      talents: { nodes: { er_man_c1: 3, er_man_c2: 2, er_ins_c1: 1, er_tit_s1: 2 }, picks: {}, mastery: "instinto", masteryNodes: { er_m_ins_1: 2, er_m_ins_3: 1 } } },
  },
  stash: [
    { uid: "it_9_x", designed: true, designId: "legion_arma", champion: OLD, set: "legion", name: "Hojas de la Legión", rarity: "legendario", type: "arma", desc: "x · +20% daño" },
    { uid: "it_10_y", designed: false, champion: null, rarity: "raro", type: "casco" },
  ],
  quests: { stats: { byChamp: { [OLD]: { runs: 5, wins: 2, kills: 100, timeMs: 1000 }, tanque: { runs: 1, wins: 0, kills: 3, timeMs: 10 } } }, daily: [{ id: "champRuns", champ: OLD, n: 2 }] },
  cromas: {},
});

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "horda-legacy-ids-"));
  const clock = Date.UTC(2026, 9, 1, 12, 0, 0);
  const week = lbWeekKey(new Date(clock));
  let checks = 0;
  const ok = (cond, name, extra) => { checks++; assert.ok(cond, name + (extra ? " " + JSON.stringify(extra) : "")); console.log("PASS " + name); };

  // --- 1) módulo compartido
  {
    const d = legacySave();
    ok(legacy.legacyChampionMigrate(d) === true, "modulo.migra");
    ok(!d.champions[OLD] && d.champions[NEW].level === 37 && d.champions[NEW].xp === 120 && d.champions[NEW].talentPoints === 3, "modulo.progreso_intacto");
    const t = d.champions[NEW].talents;
    ok(t.nodes.il_pen_c1 === 3 && t.nodes.il_pen_c2 === 2 && t.nodes.il_dun_c1 === 1 && t.nodes.il_col_s1 === 2 && !t.nodes.er_man_c1, "modulo.talentos_renombrados", t.nodes);
    ok(t.mastery === "duna" && t.masteryNodes.il_m_dun_1 === 2 && t.masteryNodes.il_m_dun_3 === 1, "modulo.maestria_renombrada", t);
    ok(d.champions[NEW].skillMastery[0].alloc === 4 && d.champions[NEW].ultMastery.alloc === 3 && d.champions[NEW].equipment.arma === "it_9_x", "modulo.maestria_de_habilidades_y_equipo");
    ok(d.stash[0].champion === NEW && d.stash[1].champion === null, "modulo.objetos_del_campeon");
    ok(d.lastChamp === NEW, "modulo.guardian_elegido_la_ultima_vez");
    ok(d.quests.stats.byChamp[NEW].runs === 5 && !d.quests.stats.byChamp[OLD] && d.quests.stats.byChamp.tanque.runs === 1 && d.quests.daily[0].champ === NEW, "modulo.estadisticas_y_desafios");
    ok(legacy.legacyChampionMigrate(d) === false, "modulo.idempotente");
    // si ya existe una fila nueva "recién creada", gana la que tiene progreso
    const e = legacySave(); e.champions[NEW] = { unlocked: false, level: 1, xp: 0, talents: { nodes: {}, picks: {}, mastery: null, masteryNodes: {} } };
    legacy.legacyChampionMigrate(e);
    ok(e.champions[NEW].level === 37 && !e.champions[OLD], "modulo.gana_el_progreso");
    // y a la inversa: si la fila nueva tiene más progreso, no se pisa
    const f = legacySave(); f.champions[NEW] = { unlocked: true, level: 60, xp: 1, talents: { nodes: {}, picks: {}, mastery: null, masteryNodes: {} } };
    legacy.legacyChampionMigrate(f);
    ok(f.champions[NEW].level === 60 && !f.champions[OLD], "modulo.no_pisa_mas_progreso");
    // un nombre de jugador "eren" no se toca
    const g = { champions: {}, profile: { name: OLD, friends: [OLD] } };
    legacy.legacyChampionMigrate(g);
    ok(g.profile.name === OLD && g.profile.friends[0] === OLD, "modulo.no_toca_nombres_de_jugadores");
  }
  // --- 2) sanitizeSave (se aplica a cada guardado que el servidor acepta o entrega)
  {
    const d = legacySave();
    const r = ent.sanitizeSave(d, {});
    ok(r.migrated === true && d.champions[NEW] && !d.champions[OLD] && r.changed.every(c => c.id !== OLD), "entitlements.sanitize_migra", r);
    ok(ent.sanitizeSave(d, {}).migrated === false, "entitlements.sanitize_idempotente");
    ok(ent.isChampion(NEW) && !ent.isChampion(OLD), "entitlements.taxonomia_solo_con_el_id_nuevo");
    const led = ent.ledgerChampions({ grants: { 7: { champions: { [OLD]: { origin: "ADMIN_GRANT", at: 1 } } } } }, 7);
    ok(led[NEW] && !led[OLD], "entitlements.libro_con_id_viejo_cuenta");
  }
  // --- 3) API: guardado en la nube y ranking
  const seed = create({ dataDir: dir, databaseUrl: "", adminUsers: "", log: () => {}, now: () => clock });
  await seed.ready;
  const user = await seed.store.createUser({ user: "Viejo", userKey: "viejo", name: "Viejo", createdAt: clock, lastLogin: 0, passHash: await hashPassword("fixture-password") });
  // el guardado VIEJO se escribe directo en el almacenamiento (como lo dejó un cliente anterior)
  await seed.store.putSave(user.id, JSON.stringify(legacySave()), { guardians: 2, maxLevel: 37, gold: 1234, arenas: 0 }, 0, true);
  await seed.close();
  fs.writeFileSync(path.join(dir, "leaderboard.json"), JSON.stringify({ weeks: { [week]: {
    [user.id + "|" + OLD]: { score: 5000, round: 4, durationMs: 120000, at: clock - 600000 },
    [user.id + "|mago"]: { score: 3000, round: 3, durationMs: 90000, at: clock - 700000 } } } }));
  const app = create({ dataDir: dir, databaseUrl: "", log: () => {}, originAllowed: () => true, roles: {}, founders: {}, now: () => clock });
  await app.ready;
  const server = http.createServer((q, s) => { if (!app.handle(q, s)) { s.writeHead(404); s.end("{}"); } });
  await new Promise(r => server.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.address().port;
  async function api(method, url, body, token) {
    const r = await fetch(base + url, { method, headers: { "content-type": "application/json", ...(token ? { authorization: "Bearer " + token } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
    let j = null; try { j = await r.json(); } catch (e) {}
    return { status: r.status, j };
  }
  try {
    const token = (await api("POST", "/api/login", { user: "Viejo", pass: "fixture-password" })).j.token;
    let g = await api("GET", "/api/save", undefined, token);
    ok(g.status === 200 && g.j.data.champions[NEW] && !g.j.data.champions[OLD] && g.j.data.champions[NEW].level === 37, "api.get_save_migrado", Object.keys(g.j.data.champions));
    ok(g.j.data.champions[NEW].talents.nodes.il_pen_c1 === 3 && g.j.data.stash[0].champion === NEW, "api.get_save_talentos_y_objetos");
    const v1 = g.j.version;
    g = await api("GET", "/api/save", undefined, token);
    ok(g.j.version === v1, "api.get_save_estable_despues_de_migrar", { v1, v2: g.j.version });
    // un cliente viejo que vuelve a subir su guardado con la clave vieja no hace perder nada
    const put = await api("PUT", "/api/save", { data: legacySave(), baseVersion: g.j.version }, token);
    ok(put.status === 200, "api.put_save_viejo_aceptado", put.j);
    g = await api("GET", "/api/save", undefined, token);
    ok(g.j.data.champions[NEW].level === 37 && !g.j.data.champions[OLD], "api.put_save_viejo_se_guarda_migrado");
    // ranking
    let lb = await api("GET", "/api/leaderboard?guardian=" + NEW);
    ok(lb.status === 200 && lb.j.entries.length === 1 && lb.j.entries[0].guardian === NEW && lb.j.entries[0].score === 5000, "api.ranking_fila_vieja_se_lee_con_id_nuevo", lb.j.entries);
    lb = await api("GET", "/api/leaderboard?guardian=" + OLD);
    ok(lb.status === 200 && lb.j.entries.length === 1 && lb.j.entries[0].guardian === NEW, "api.ranking_filtro_viejo_funciona");
    lb = await api("GET", "/api/leaderboard");
    ok(lb.j.entries.length === 1 && lb.j.entries[0].guardian === NEW && lb.j.entries[0].score === 5000, "api.ranking_global_sin_duplicados", lb.j.entries);
    const sub = await api("POST", "/api/leaderboard/submit", { score: 9000, round: 5, guardian: OLD, week, durationMs: 200000 }, token);
    ok(sub.status === 200, "api.envio_con_id_viejo_aceptado", sub.j);
    lb = await api("GET", "/api/leaderboard?guardian=" + NEW);
    ok(lb.j.entries[0].score === 9000 && lb.j.entries[0].guardian === NEW, "api.envio_viejo_se_guarda_como_nuevo", lb.j.entries);
  } finally {
    server.close(); await app.close();
  }
  console.log("OK " + checks + " comprobaciones");
})().catch(e => { console.error(e); process.exit(1); });
