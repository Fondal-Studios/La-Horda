'use strict';
// Vuelca los datos del juego que usa el paquete de instrucciones de Runway (docs/art-brief/runway-pack/): campeones (kit, lore, colores),
// enemigos y jefes (rango, familia, comportamiento, ataques) y qué arte tienen hoy. Lo lee tools/art/build-runway-pack.py.
//   export NODE_PATH="server/node_modules:$(npm root -g)"; node tools/art/dump-game-data.js
const fs = require('node:fs'), path = require('node:path'), H = require('../lib/serve');
const OUT = path.resolve(__dirname, '../../docs/art-brief/runway-pack/data/game-data.json');
(async () => {
  const site = await H.startSite(), b = await H.launch();
  try {
    const p = await b.newPage(); await H.goto(p, site.url + '/index.html?lazy=0');
    await p.waitForFunction(() => typeof CLASSES !== 'undefined' && typeof ENEMY_BASE !== 'undefined' && typeof CODEX_CHAMP_LORE !== 'undefined' && typeof CODEX_CREATURES !== 'undefined', null, {timeout: 60000});
    const data = await p.evaluate(() => {
      const fn = (k, v) => typeof v === 'function' ? undefined : v;
      const champions = {};
      for (const id of Object.keys(CLASSES)) {
        const c = CLASSES[id], cat = (typeof CHAMPION_CATALOG !== 'undefined' ? CHAMPION_CATALOG.find(x => x.id === id) : null) || {}, lore = CODEX_CHAMP_LORE[id] || {};
        champions[id] = {id, name: c.name, hudName: c.hudName, color: c.color, glow: c.glow, role: c.role, roleCategory: c.roleCategory, basicRange: c.basicRange, basicArc: !!c.basicArc, ranged: !!c.basicProjectile || c.basicRange > 140,
          skills: (c.skills || []).map(s => ({name: s.name, desc: s.desc, kind: s.kind, radius: s.radius || null, range: s.range || null, duration: s.duration || null})),
          ultimate: c.ultimate ? {name: c.ultimate.name, desc: c.ultimate.desc, kind: c.ultimate.kind} : null,
          catalogLore: cat.lore || null, origin: lore.origin || null, history: lore.history || null};
      }
      const enemies = {};
      for (const id of Object.keys(ENEMY_BASE)) {
        const e = ENEMY_BASE[id], cr = CODEX_CREATURES[id] || {};
        let arena = null; try { arena = typeof codexArenaOfType === 'function' ? codexArenaOfType(id) : null; } catch (x) {}
        enemies[id] = {id, name: e.name, rank: e.rank, hp: e.hp, dmg: e.dmg, speed: e.speed, radius: e.radius, scale: e.scale, color: e.color, ranged: !!e.ranged, visualAlias: e.visualAlias || null, arena: arena && (arena.id || arena.key || arena.name || String(arena)) || null,
          family: cr.family || null, lore: cr.lore || null, origin: cr.origin || null, behavior: cr.behavior || null, attacks: cr.attacks || [], mech: cr.mech || null};
      }
      return {generado: 'node tools/art/dump-game-data.js', champions, enemies};
    });
    // arte que existe hoy (por id): carpeta con atlas bajo assets/sprites
    const roots = ['assets/sprites/champions', 'assets/sprites/enemies', 'assets/sprites/arenas', 'assets/sprites/bosses'];
    const ROOT = path.resolve(__dirname, '../..');
    const found = {};
    const walk = (d, depth) => { if (depth > 5 || !fs.existsSync(d)) return; for (const e of fs.readdirSync(d, {withFileTypes: true})) { const f = path.join(d, e.name); if (e.isDirectory()) { if (fs.existsSync(path.join(f, 'atlas.png'))) (found[e.name] = found[e.name] || []).push(path.relative(ROOT, path.join(f, 'atlas.png')).split(path.sep).join('/')); walk(f, depth + 1); } } };
    for (const r of roots) walk(path.join(ROOT, r), 0);
    for (const id in data.champions) data.champions[id].atlasActual = (found[id] || []).filter(x => x.startsWith('assets/sprites/champions/' + id + '/atlas'))[0] || null;
    for (const id in data.enemies) data.enemies[id].atlasActual = (found[id] || [])[0] || null;
    fs.mkdirSync(path.dirname(OUT), {recursive: true});
    fs.writeFileSync(OUT, JSON.stringify(data, null, 1) + '\n');
    console.log('campeones', Object.keys(data.champions).length, 'enemigos', Object.keys(data.enemies).length, '->', path.relative(ROOT, OUT));
  } finally { await b.close(); await site.close(); }
})().catch(e => { console.error(e); process.exit(1); });
