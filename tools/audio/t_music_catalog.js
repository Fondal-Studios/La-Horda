// Valida la biblioteca de música por archivos: assets/audio/music/CATALOGO.json, CREDITS.md y
// js/data/music-map.js. Licencias permitidas (uso comercial + redistribución): CC0, dominio público,
// CC BY. Falla ante NC / ND / SA, campos faltantes, archivos inexistentes, pesos fuera de tope,
// atribución ausente en CREDITS.md o ids del mapa que no existen.  node tools/audio/t_music_catalog.js
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '../..'), DIR = path.join(ROOT, 'assets/audio/music');
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x).slice(0, 300) : '')); if (!ok) fails++; };
const cat = JSON.parse(fs.readFileSync(path.join(DIR, 'CATALOGO.json'), 'utf8'));
const credits = fs.readFileSync(path.join(DIR, 'CREDITS.md'), 'utf8');
const map = require(path.join(ROOT, 'js/data/music-map.js'));
const ALLOWED = new Set(cat.licenciasPermitidas);
const BAD = /(-NC|-ND|-SA|NonCommercial|NoDerivs|ShareAlike|GPL|Pixabay)/i;
check('licencias permitidas = solo CC0/PDM/CC-BY', [...ALLOWED].every(l => /^(CC0-1\.0|PDM-1\.0|CC-BY-[34]\.0)$/.test(l)), [...ALLOWED]);
check('tracks es un arreglo', Array.isArray(cat.tracks), cat.tracks.length);
const ids = new Set(); let total = 0; const perArena = {};
for (const t of cat.tracks) {
  const tag = t.id || '?';
  const miss = cat.camposObligatorios.filter(k => t[k] === undefined || t[k] === null || t[k] === '');
  check(`${tag}: campos obligatorios`, !miss.length, miss);
  check(`${tag}: id único`, !ids.has(t.id)); ids.add(t.id);
  check(`${tag}: licencia permitida y sin NC/ND/SA`, ALLOWED.has(t.licencia) && !BAD.test(t.licencia + ' ' + (t.licenciaUrl || '')), t.licencia);
  check(`${tag}: URL de fuente y licencia https`, /^https:\/\//.test(t.fuenteUrl) && /^https:\/\//.test(t.licenciaUrl));
  check(`${tag}: fecha de verificación ISO`, /^\d{4}-\d{2}-\d{2}$/.test(t.fechaVerificacion));
  check(`${tag}: intensidad 1..5`, Number.isInteger(t.intensidad) && t.intensidad >= 1 && t.intensidad <= 5);
  const f = path.join(DIR, t.archivo || '');
  const ok = t.archivo && /^[a-z0-9-]+\/[a-z0-9-]+\.ogg$/.test(t.archivo) && fs.existsSync(f);
  check(`${tag}: archivo .ogg existe`, !!ok, t.archivo);
  if (ok) { const kb = fs.statSync(f).size / 1024; total += kb; check(`${tag}: pesoKB declarado coincide (±5%)`, Math.abs(kb - t.pesoKB) <= Math.max(2, kb * 0.05), [kb | 0, t.pesoKB]); check(`${tag}: ≤ 12 MB`, kb <= cat.tope.temaArenaKB); }
  if (/CC-BY/.test(t.licencia)) check(`${tag}: CC BY → atribución presente en CREDITS.md`, !!t.atribucion && credits.includes(t.atribucion));
  if (t.enUso) check(`${tag}: en uso → verificada`, t.verificada === true);
}
check('peso total ≤ 30 MB', total <= cat.tope.bibliotecaKB, Math.round(total));
// el mapa solo puede apuntar a pistas existentes, verificadas y de uso
const mapIds = [map.menu, map.hub, map.tienda, map.victoria, map.derrota];
for (const a of Object.values(map.arenas)) mapIds.push(a.calma, a.intensa, a.jefe);
for (const id of mapIds.filter(Boolean)) { const t = cat.tracks.find(x => x.id === id); check(`mapa: ${id} existe, verificada y enUso`, !!(t && t.verificada === true && t.enUso === true)); }
for (const [k, a] of Object.entries(map.arenas)) { const c = cat.tracks.find(x => x.id === a.calma), i = cat.tracks.find(x => x.id === a.intensa); if (c && i) { const r = i.bpm / c.bpm; check(`mapa ${k}: BPM calma/intensa compatibles (x1 o x2)`, Math.abs(r - 1) < 0.06 || Math.abs(r - 2) < 0.1 || Math.abs(r - 0.5) < 0.05, [c.bpm, i.bpm]); } }
// ninguna pista suelta en el disco fuera del catálogo
const onDisk = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) e.isDirectory() ? walk(path.join(d, e.name)) : /\.(ogg|opus|mp3|wav|flac)$/i.test(e.name) && onDisk.push(path.relative(DIR, path.join(d, e.name))); })(DIR);
check('no hay audio sin catalogar', onDisk.every(f => cat.tracks.some(t => t.archivo === f)), onDisk);
console.log(fails ? `\n${fails} FALLAS` : '\nOK'); process.exit(fails ? 1 : 0);
