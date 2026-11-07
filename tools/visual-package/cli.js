#!/usr/bin/env node
'use strict';
// node tools/visual-package/cli.js build [--write] | check
const fs = require('node:fs'), path = require('node:path');
const L = require('./lib');
const MANIFEST = path.join(L.ROOT, 'assets/visual-packages/manifest.v1.json');
const CANDIDATES = path.join(L.ROOT, 'assets/visual-packages/candidates.v1.json');
const [cmd, ...flags] = process.argv.slice(2);
try {
  if (cmd === 'build') {
    const m = L.buildManifest(), text = JSON.stringify(m, null, 1) + '\n';
    if (flags.includes('--write')) { fs.writeFileSync(MANIFEST, text); console.log(`escrito ${path.relative(L.ROOT, MANIFEST)} (${m.packages.length} paquetes)`); }
    else process.stdout.write(text);
  } else if (cmd === 'check') {
    const errors = [], current = L.buildManifest();
    const stored = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : null;
    if (!stored) errors.push('falta assets/visual-packages/manifest.v1.json (build --write)');
    else if (JSON.stringify(stored) !== JSON.stringify(current)) errors.push('el manifiesto no coincide con las registraciones actuales: regenerar con build --write y revisar el diff');
    for (const p of current.packages) errors.push(...L.validatePackage(p));
    const cands = fs.existsSync(CANDIDATES) ? JSON.parse(fs.readFileSync(CANDIDATES, 'utf8')) : {packages: []};
    const ids = new Set(current.packages.map(p => p.id));
    for (const c of cands.packages) {
      errors.push(...L.validatePackage(c, L.ROOT, {strict: true}));
      if (!ids.has(c.fallback)) errors.push(`${c.id}: el fallback ${c.fallback} no es un paquete integrado`);
      if (c.activation && c.activation.enabled && c.lifecycle.visualApproval !== 'approved') errors.push(`${c.id}: no puede activarse sin aprobación visual`);
    }
    console.log(JSON.stringify({packages: current.packages.length, candidates: cands.packages.length, errors: errors.length}, null, 1));
    errors.forEach(e => console.error('  - ' + e));
    if (errors.length) process.exitCode = 1;
  } else throw Error('Uso: cli.js build [--write] | check');
} catch (e) { console.error(e.message); process.exitCode = 1; }
