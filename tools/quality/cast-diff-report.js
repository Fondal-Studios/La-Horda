'use strict';
/* REPORTE: ¿el lanzamiento de cada habilidad cambia la imagen respecto del autoataque? (crítica #9 del crítico indie)
   Para cada campeón y cada acción (autoataque, habilidades 1-3, definitiva) se arma la MISMA escena en el motor real (mismo azar
   sembrado, 10 muñecos quietos agrupados a ~100 u, aliados detenidos), se frena el bucle de requestAnimationFrame y se avanza
   la simulación a mano (update(16) + render()). En 4 instantes (64, 192, 480 y 960 ms tras el lanzamiento) se lee el frame del
   canvas (sin HUD) y se mide el % de píxeles que difieren (suma |dR|+|dG|+|dB| > 48) contra:
     - el frame del AUTOATAQUE en el mismo instante (¿se distingue la habilidad del básico?)
     - el frame sin acción (¿hace algo visible?)
   y contra un segundo "sin acción" idéntico (piso de ruido: debe dar ~0 por el azar sembrado).
   Una habilidad "no se distingue" si en ningún instante supera max(umbral, ruido de ese campeón + 1) (umbral por defecto 1,5 % del frame) contra el autoataque.
   Es solo REPORTE: no falla (salvo --strict) porque los efectos visuales se están rehaciendo en otros frentes.
   Uso: node tools/quality/cast-diff-report.js [--strict] [--threshold=1.5]   (ONLY=a,b filtra campeones; CAST_DIFF_PORT, CHROMIUM_PATH)
   Escribe docs/vfx/cast-diff-report.md y docs/vfx/cast-diff-report.json (sin ONLY). */
const fs = require('node:fs'), path = require('node:path'), {spawn} = require('node:child_process');
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '../..'), PORT = +(process.env.CAST_DIFF_PORT || 8851), OUT = path.join(ROOT, 'docs/vfx');
const THRESHOLD = +((process.argv.find(a => a.startsWith('--threshold=')) || '=1.5').split('=')[1]);
const STRICT = process.argv.includes('--strict');
const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {cwd: ROOT, stdio: 'ignore'});
process.on('exit', () => server.kill());
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SNAPS = [4, 12, 30, 60]; // cuadros de 16 ms

(async () => {
  await sleep(600);
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  try {
    const page = await browser.newPage({viewport: {width: 844, height: 390}}), pageErrors = [];
    page.on('pageerror', e => pageErrors.push(e.message));
    const boot = async () => { // carga limpia del juego con el bucle real detenido (avanzamos a mano)
      await page.goto(`http://127.0.0.1:${PORT}/`, {waitUntil: 'domcontentloaded', timeout: 120000});
      await page.waitForFunction(() => typeof startRun === 'function' && typeof castAbility === 'function' && typeof render === 'function', null, {timeout: 120000});
      await page.waitForTimeout(1500);
      await page.evaluate(() => { window.requestAnimationFrame = () => 0; });
      await page.waitForTimeout(200);
    };
    await boot();
    const roster = (await page.evaluate(() => Object.keys(CLASSES))).filter(k => !process.env.ONLY || process.env.ONLY.split(',').includes(k));
    const rows = [];
    const measure = (k) => page.evaluate(([k, SNAPS]) => {
        const oRand = Math.random;
        function seed(n) { let x = n >>> 0; Math.random = () => { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
        function start() {
          netMatch = null; save.stash = []; save.relics = {hp: 0, dmg: 0, def: 0, vel: 0};
          for (const ck in save.champions) { const s = save.champions[ck]; s.unlocked = true; s.level = 20; s.xp = 0; s.equipment = {}; s.inventory = []; s.talents = {nodes: {}, mastery: null, masteryNodes: {}}; s.skillMastery = [0, 1, 2].map(() => ({...mkMastery(), alloc: 0})); s.ultMastery = {...mkMastery(), alloc: 0}; }
          selectedClass = k; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte', 'mago'].filter(x => x !== k).slice(0, 3); startRun(3);
          enemies = []; spawnTimer = 1e9; arenaHazardTimer = 1e9; player.fx = 1; player.fy = 0; state = 'playing';
          runLevel = Math.max(runLevel || 1, typeof ULT_MIN_ARENA_LEVEL !== 'undefined' ? ULT_MIN_ARENA_LEVEL : 1);
          const spots = [[100, 0], [118, -16], [118, 16], [134, 0], [92, -20], [92, 20], [140, -24], [140, 24], [60, 0], [200, 0]];
          for (const [dx, dy] of spots) { const e = spawnEnemy('esqueleto'); Object.assign(e, {x: player.x + dx, y: player.y + dy, hp: 1e7, maxHp: 1e7, speed: 0, baseSpeed: 0, dmg: 0}); }
          for (let i = 0; i < allies.length; i++) { allies[i].x = player.x - 35 - i * 24; allies[i].y = player.y + 15; allies[i].hp = allies[i].maxHp * 0.5; allies[i].stunTimer = 1e9; }
          player.hp = player.maxHp * 0.6; player.energy = 1e4; player.ultCharge = player.ultMax;
          if (k === 'ilkan') player.ilkanFury = 1e4;
        }
        const cv = document.getElementById('game') || canvas, c2 = cv.getContext('2d');
        const grab = () => { render(); return c2.getImageData(0, 0, cv.width, cv.height).data.slice(); };
        function run(action) { // action: 'idle' | 'basic' | 0 | 1 | 2 | 'ult'
          seed(4242); const frames = []; let T = 1e6; // reloj determinista: animaciones que leen performance.now()/Date.now() salen iguales
          performance.now = () => T; Date.now = () => 1.7e12 + T;
          try {
            start();
            player.aim = {x: player.x + 115, y: player.y, dx: 1, dy: 0};
            if (action === 'basic') triggerBasic(player);
            else if (action !== 'idle') { const isU = action === 'ult', sk = isU ? player.cls.ultimate : player.cls.skills[action]; castAbility(player, sk, isU, isU ? undefined : action); }
            let f = 0;
            for (const target of SNAPS) { while (f < target) { T += 16; update(16); f++; } frames.push(grab()); }
          } catch (e) { return {err: e.message, frames}; }
          return {frames};
        }
        const diff = (a, b) => { let n = 0; for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 48) n++; return 100 * n / (a.length / 4); };
        const idle = run('idle'), idle2 = run('idle'), basic = run('basic');
        const noise = idle.frames.length ? Math.max(...idle.frames.map((f, i) => diff(f, idle2.frames[i]))) : -1;
        const out = {noise, basicVsIdle: basic.frames.length ? Math.max(...basic.frames.map((f, i) => diff(f, idle.frames[i]))) : -1, acts: [], err: idle.err || basic.err || null};
        for (const action of [0, 1, 2, 'ult']) {
          const r = run(action), sk = action === 'ult' ? CLASSES[k].ultimate : CLASSES[k].skills[action];
          if (r.err || !r.frames.length || !basic.frames.length) { out.acts.push({slot: action, name: sk.name, err: r.err || 'sin frames'}); continue; }
          out.acts.push({slot: action, name: sk.name, vsBasic: Math.max(...r.frames.map((f, i) => diff(f, basic.frames[i]))), vsIdle: Math.max(...r.frames.map((f, i) => diff(f, idle.frames[i])))});
        }
        Math.random = oRand;
        return out;
      }, [k, SNAPS]);
    for (const k of roster) {
      let r = await measure(k);
      // Algunos kits dejan estado global que congela la escena siguiente (todo da 0,0 %, incluso el autoataque contra nada):
      // se recarga la página y se mide de nuevo; si sigue en 0 se informa como no medible.
      const stuck = x => x.basicVsIdle === 0 && x.acts.every(a => a.err || (a.vsBasic === 0 && a.vsIdle === 0));
      if (stuck(r)) { await boot(); r = await measure(k); r.reloaded = true; if (stuck(r)) r.unmeasurable = true; }
      rows.push({champ: k, ...r});
      console.log(k.padEnd(12), 'ruido', r.noise.toFixed(2), '| ' + r.acts.map(a => a.err ? a.name + ': ERR ' + a.err : a.name + ' ' + a.vsBasic.toFixed(1) + '%').join(' | '));
    }
    // ---- reporte
    const indist = [], erroneas = [];
    for (const r of rows) {
      if (r.unmeasurable) continue;
      const bad = r.acts.filter(a => !a.err && a.vsBasic < Math.max(THRESHOLD, r.noise + 1));
      if (r.acts.some(a => a.err) || r.err) erroneas.push(r);
      if (bad.length) indist.push({champ: r.champ, bad, total: r.acts.length});
    }
    const f1 = x => x.toFixed(1).replace('.', ',');
    let md = `# Reporte: ¿cada habilidad se distingue del autoataque al lanzarse?\n\n`;
    md += `Generado por \`node tools/quality/cast-diff-report.js\` (sin ONLY). **Es solo un reporte**: no bloquea nada, porque los efectos visuales se están rehaciendo en otros frentes; sirve para medir antes/después.\n\n`;
    md += `## Método\n\n`;
    md += `- Misma escena en el motor real para cada acción: 10 muñecos quietos agrupados a ~100 u, aliados detenidos, azar sembrado, pantalla 844x390.\n`;
    md += `- Se detiene el bucle de \`requestAnimationFrame\` y se avanza a mano (\`update(16)\` + \`render()\`); se lee el canvas del juego (sin HUD) a los 64, 192, 480 y 960 ms.\n`;
    md += `- **vs autoataque** = máximo, entre esos instantes, del % de píxeles que cambian (suma |dR|+|dG|+|dB| > 48) entre el frame de la habilidad y el del autoataque. **vs nada** = igual contra la escena sin hacer nada.\n`;
    md += `- Umbral: una habilidad **no se distingue** si su "vs autoataque" es menor que **max(${f1(THRESHOLD)} %, ruido del campeón + 1 punto)** del frame (\`--threshold=${THRESHOLD}\`). Piso de ruido máximo medido (escena sin acción repetida): **${f1(Math.max(...rows.map(r => r.noise)))} %**.\n`;
    md += `- Limitaciones: mide cambio de imagen, no calidad ni lectura del efecto; habilidades con retardo largo o efecto fuera de los 960 ms pueden salir bajas; un efecto idéntico al del autoataque pero con otro daño tampoco se distingue (es lo que se quiere detectar).\n\n`;
    md += `## Campeones que hoy no se distinguen (${indist.length} de ${rows.length})\n\n`;
    if (indist.length) {
      md += `| Campeón | Habilidades bajo el umbral | Detalle (vs autoataque / vs nada) |\n|---|---|---|\n`;
      for (const d of indist.sort((a, b) => b.bad.length - a.bad.length || a.champ.localeCompare(b.champ))) {
        const r = rows.find(x => x.champ === d.champ);
        md += `| ${d.champ} | ${d.bad.length} de ${d.total} | ${d.bad.map(a => `${a.slot === 'ult' ? 'Def.' : 'H' + (a.slot + 1)} ${a.name}: ${f1(a.vsBasic)} % / ${f1(a.vsIdle)} %`).join('<br>')} |\n`;
      }
    } else md += `Ninguno: todas las habilidades superan el umbral.\n`;
    md += `\n## Tabla completa (% de píxeles distintos vs autoataque)\n\n| Campeón | Habilidad 1 | Habilidad 2 | Habilidad 3 | Definitiva | Autoataque vs nada |\n|---|---|---|---|---|---|\n`;
    for (const r of rows) {
      const cell = a => r.unmeasurable ? 'n/m' : !a ? '-' : a.err ? 'ERR' : `${f1(a.vsBasic)}${a.vsBasic < Math.max(THRESHOLD, r.noise + 1) ? ' ⚠' : ''}`;
      md += `| ${r.champ} | ${[0, 1, 2, 3].map(i => cell(r.acts[i])).join(' | ')} | ${f1(r.basicVsIdle)} |\n`;
    }
    const nm = rows.filter(r => r.unmeasurable);
    if (nm.length) md += `\n## No medibles (la escena quedó congelada incluso tras recargar)\n\n${nm.map(r => '- ' + r.champ).join('\n')}\n`;
    const rl = rows.filter(r => r.reloaded && !r.unmeasurable);
    if (rl.length) md += `\n_Nota (medidos tras recargar la página porque el kit anterior dejó la escena congelada, estado global que no se limpia entre partidas): ${rl.map(r => r.champ).join(', ')}._\n`;
    if (erroneas.length) md += `\n## Con error al medir\n\n${erroneas.map(r => `- ${r.champ}: ${r.err || r.acts.filter(a => a.err).map(a => a.name + ' (' + a.err + ')').join(', ')}`).join('\n')}\n`;
    if (pageErrors.length) md += `\n## Errores de página durante la corrida\n\n${[...new Set(pageErrors)].slice(0, 8).map(e => '- ' + e).join('\n')}\n`;
    if (!process.env.ONLY) {
      fs.mkdirSync(OUT, {recursive: true});
      fs.writeFileSync(path.join(OUT, 'cast-diff-report.md'), md);
      fs.writeFileSync(path.join(OUT, 'cast-diff-report.json'), JSON.stringify({threshold: THRESHOLD, snapsMs: SNAPS.map(f => f * 16), rows}, null, 1));
    }
    console.log(`\n${indist.length} de ${rows.length} campeones con alguna habilidad que no se distingue del autoataque (umbral ${THRESHOLD} %)`);
    if (STRICT && indist.length) process.exitCode = 1;
  } finally { await browser.close(); server.kill(); }
})().catch(e => { console.error(e); server.kill(); process.exitCode = 1; });
