#!/usr/bin/env node
'use strict';
// ARQUITECTO DEL JUEGO: valora una rama/commit contra main antes de fusionar. Solo informa; NUNCA fusiona ni empuja.
// Veredictos: READY_FOR_MERGE_REVIEW (revisión humana final) | NEEDS_WORK | BLOCKED.
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const git = (...a) => { const r = spawnSync('git', a, {cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20}); return {ok: r.status === 0, out: (r.stdout || '').trim(), err: (r.stderr || '').trim()}; };

// Reglas del repo (AGENTS.md / PRODUCTION_BIBLES): cada una puede bloquear (B) o exigir trabajo (W).
const RULES = [
  {id: 'knownChampions', level: 'B', test: d => /knownChampions/.test(d.addedText), msg: 'Toca knownChampions: un campeón nuevo no se registra en la misma PR que lo presenta (AGENTS.md §5).'},
  {id: 'reference-sync', level: 'W', test: d => d.files.some(f => f === 'docs/balance/champion-entry-reference.json') !== d.files.some(f => /champion-entry-reference\.js$/.test(f)) && (d.files.some(f => f === 'docs/balance/champion-entry-reference.json') || d.files.some(f => /champion-entry-reference\.js$/.test(f))), msg: 'Referencia de balance JSON y JS fuera de sincronía.'},
  {id: 'cosmetic-stats', level: 'B', test: d => d.isArtOnly && /\b(hp|damage|speed|cooldown)\s*[:=]/.test(d.addedText) && d.files.some(f => /skins?|cosmetic/i.test(f) && f.endsWith('.js')), msg: 'Cambio cosmético que parece alterar estadísticas.'},
  {id: 'secrets', level: 'B', test: d => d.addedText.split('\n').some(l => /(api[_-]?key|secret|token)\s*[:=]\s*['"][A-Za-z0-9_\-]{20,}/i.test(l) && !/fixture|not-real|example|dummy|placeholder|['"]test-|process\.env\./i.test(l)), msg: 'Posible credencial en el diff.'},
  {id: 'asset-size', level: 'W', test: d => d.bigAssets.length > 0, msg: d => `Assets >2 MB: ${d.bigAssets.join(', ')}`},
  {id: 'no-tests', level: 'W', test: d => d.touchesGameplay && !d.files.some(f => /(^|\/)(tests?|tools\/.*test)/i.test(f)), msg: 'Cambia gameplay (js/) sin pruebas asociadas.'}
];

// Gates sugeridos por tipo de cambio (se listan; no se ejecutan sin --run).
function gatesFor(d) {
  const g = new Set();
  if (d.touchesChampions) ['reference', 'balance', 'abilities'].forEach(x => g.add(x));
  if (d.touchesArt) ['style', 'visuals'].forEach(x => g.add(x));
  if (d.touchesNet) g.add('multiplayer');
  if (d.touchesGameplay) g.add('performance');
  return [...g];
}

function analyze(ref, base = 'origin/main') {
  const mb = git('merge-base', base, ref);
  if (!mb.ok) return {ref, verdict: 'BLOCKED', findings: [{level: 'B', id: 'no-ref', msg: `No se puede resolver ${ref} o no comparte ancestro con ${base} (historia sin relación: no fusionable tal cual)`}]};
  const files = git('diff', '--name-only', `${mb.out}`, ref).out.split('\n').filter(Boolean);
  const diff = git('diff', '-U0', mb.out, ref, '--', '*.js', '*.json', '*.html', '*.py', '*.yml').out;
  const addedText = diff.split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++')).join('\n');
  const bigAssets = files.filter(f => /\.(png|webp|ogg|mp3|wav)$/i.test(f)).filter(f => { const s = git('cat-file', '-s', `${ref}:${f}`); return s.ok && Number(s.out) > 2 << 20; });
  const d = {files, addedText, bigAssets,
    touchesArt: files.some(f => /^(assets|art-source)\//.test(f) || /\/art\.js$/.test(f)),
    touchesChampions: files.some(f => /^js\/champions\//.test(f) && !/\/art\.js$/.test(f)),
    touchesNet: files.some(f => /^(server|js\/net)/.test(f)),
    touchesGameplay: files.some(f => /^js\/(systems|champions|enemies|core)/.test(f) && !/\/art\.js$/.test(f))};
  d.isArtOnly = d.touchesArt && !d.touchesGameplay;
  const findings = RULES.filter(r => r.test(d)).map(r => ({level: r.level, id: r.id, msg: typeof r.msg === 'function' ? r.msg(d) : r.msg}));
  // Simulación de fusión sin tocar el árbol de trabajo: merge-tree detecta conflictos con main actual.
  const mt = git('merge-tree', '--write-tree', '--name-only', base, ref);
  const conflicts = mt.ok ? [] : mt.out.split('\n').slice(1).filter(l => l && !/^(CONFLICT|Auto-merging)/.test(l));
  if (!mt.ok) findings.push({level: 'W', id: 'conflict', msg: `Conflictos de fusión con ${base}: ${conflicts.slice(0, 8).join(', ') || '(ver git merge-tree)'}`});
  const verdict = findings.some(f => f.level === 'B') ? 'BLOCKED' : findings.length ? 'NEEDS_WORK' : 'READY_FOR_MERGE_REVIEW';
  return {ref, base, mergeBase: mb.out, head: git('rev-parse', ref).out, files: files.length, categories: Object.fromEntries(Object.entries(d).filter(([k, v]) => k.startsWith('touches') || k === 'isArtOnly')),
    suggestedGates: gatesFor(d), findings, verdict, note: 'Valoración estática. No sustituye gates ejecutados sobre el commit exacto ni revisión humana; no fusiona nada.'};
}

module.exports = {analyze, RULES};

if (require.main === module) {
  const [cmd, ref] = process.argv.slice(2);
  try {
    if (cmd === 'assess' && ref) {
      const r = analyze(ref);
      console.log(JSON.stringify(r, null, 2));
      if (r.verdict === 'BLOCKED') process.exitCode = 1;
    } else if (cmd === 'queue') {
      const limit = Number(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] || 20);
      const branches = git('for-each-ref', '--sort=-committerdate', '--format=%(refname:short)', 'refs/remotes/origin').out.split('\n')
        .filter(b => b && !/HEAD$|\/main$/.test(b) && git('rev-list', '--count', `origin/main..${b}`).out !== '0').slice(0, limit);
      const rows = branches.map(b => { const a = analyze(b); return {branch: b, verdict: a.verdict, files: a.files, issues: a.findings.map(f => f.id)}; });
      const out = process.argv.find(a => a.startsWith('--out='))?.split('=')[1];
      const report = {generated: new Date().toISOString(), base: 'origin/main', rows};
      if (out) fs.writeFileSync(path.resolve(ROOT, out), JSON.stringify(report, null, 2) + '\n');
      console.table(rows.map(r => ({...r, issues: r.issues.join(',')})));
    } else throw Error('Uso: architect-game.js assess <rama|commit> | queue [--limit=N] [--out=informe.json]');
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
