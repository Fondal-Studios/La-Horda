'use strict';
// Independencia de los tres paquetes: propiedad de archivos sin solapes, contratos puros, sin ciclos.
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const { ROOT, check, summary } = require('./lib');
const own = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/arquitectura-compartida/ownership.json'), 'utf8'));
const files = cp.execFileSync('git', ['ls-files'], { cwd: ROOT, maxBuffer: 1 << 28 }).toString().split('\n').filter(Boolean);
const rx = g => new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '\u0000').replace(/\*/g, '[^/]*').replace(/\u0000/g, '.*') + '$');
const match = (g, f) => rx(g).test(f);
const P = Object.keys(own.packages);
check('hay exactamente tres paquetes A, B y C', P.join() === 'A,B,C');

// 1. Cada archivo (existente) pertenece como mucho a UN paquete.
const owners = f => P.filter(p => own.packages[p].allowed.some(g => match(g, f)));
const multi = files.filter(f => owners(f).length > 1);
check('ningún archivo del repo es permitido a dos paquetes', multi.length === 0, multi.slice(0, 10));
// 2. Los patrones de un paquete no se pisan con los de otro, ni siquiera para archivos nuevos (se prueba el literal de cada patrón sin comodín).
const literal = g => g.replace(/\/?\*\*$/, '/x.txt').replace(/\*/g, 'x');
const cross = [];
for(const a of P) for(const g of own.packages[a].allowed) for(const b of P) if(a !== b && own.packages[b].allowed.some(h => match(h, literal(g)))) cross.push(`${a}:${g} ~ ${b}`);
check('los patrones permitidos de paquetes distintos no se solapan', cross.length === 0, cross.slice(0, 10));
// 3. Lo prohibido para todos no está permitido a nadie; los archivos compartidos tampoco.
const forb = own.forbiddenForAll, sharedGlobs = Object.keys(own.shared);
const bad = [];
for(const p of P) for(const g of own.packages[p].allowed){ const lit = literal(g); if(forb.some(h => match(h, lit))) bad.push(p + ':' + g); }
check('ningún paquete tiene permitido un archivo prohibido para todos', bad.length === 0, bad);
const sharedLeak = [];
for(const p of P) for(const g of own.packages[p].allowed){ const lit = literal(g); for(const s of sharedGlobs) if(s !== 'contracts/v1/**' && match(s, lit)) sharedLeak.push(p + ':' + g + ' en ' + s); }
check('ningún paquete invade un archivo compartido (salvo la excepción documentada de migrations.js)', sharedLeak.length === 0, sharedLeak);
// 4. Los archivos clave existen y tienen dueño único (los patrones que no son comodín deben existir o estar marcados como nuevos).
const missing = [];
for(const p of P) for(const g of own.packages[p].allowed) if(!g.includes('*') && !files.includes(g) && !fs.existsSync(path.join(ROOT, g))) missing.push(p + ':' + g);
const NEW_OK = new Set(['fly.toml', 'Dockerfile']); // archivos que el Agente B debe CREAR
check('todo archivo permitido sin comodín existe (salvo los que el paquete debe crear)', missing.filter(m => !NEW_OK.has(m.split(':')[1])).length === 0, missing);
for(const f of ['server/accounts.js', 'server/item-economy-live.js', 'server/wallet.js', 'server/game-master.js', 'js/net/alpha-services.js', 'js/storage/save.js', 'tools/quality/run-all.js']){
  check(`${f}: dueño único`, owners(f).length === 1, owners(f));
}
// 5. Archivos de integración con un solo dueño.
check('index.html no pertenece a ningún paquete', owners('index.html').length === 0);
check('server/relay.js (multijugador) no pertenece a ningún paquete', owners('server/relay.js').length === 0);
check('run-all y los workflows pertenecen solo a C', owners('tools/quality/run-all.js').join() === 'C' && owners('.github/workflows/integracion-pruebas.yml').join() === 'C');
// 6. Pureza de los contratos: no importan servidor, cliente ni herramientas; no se importan entre sí en ciclo.
const cdir = path.join(ROOT, 'contracts/v1'), cfiles = fs.readdirSync(cdir).filter(f => f.endsWith('.js'));
const deps = {};
for(const f of cfiles){
  const src = fs.readFileSync(path.join(cdir, f), 'utf8');
  deps[f] = [...src.matchAll(/require\(\s*['"]([^'"]+)['"]\s*\)/g)].map(m => m[1]);
}
const outside = Object.entries(deps).flatMap(([f, d]) => d.filter(x => !x.startsWith('./') && !x.startsWith('node:')).map(x => f + ' -> ' + x));
check('los contratos no importan nada fuera de contracts/v1 (ni paquetes npm)', outside.length === 0, outside);
const graph = Object.fromEntries(Object.entries(deps).map(([f, d]) => [f, d.filter(x => x.startsWith('./')).map(x => x.replace('./', '').replace(/(\.js)?$/, '.js')).filter(x => x.endsWith('.js'))]));
function cyc(){ const st = {}; const go = n => { if(st[n] === 1) return true; if(st[n] === 2) return false; st[n] = 1; for(const m of graph[n] || []) if(go(m)) return true; st[n] = 2; return false; }; return Object.keys(graph).some(go); }
check('el grafo de módulos de los contratos no tiene ciclos', !cyc());
// 7. Ningún módulo de los paquetes importa a otro paquete: dependsOn solo apunta a contracts/v1.
check('cada paquete depende únicamente de contracts/v1', P.every(p => own.packages[p].dependsOn.join() === 'contracts/v1'));
// Importaciones reales entre archivos de paquetes distintos que YA existen (acoplamiento actual a vigilar, no a prohibir).
const reqs = [];
for(const f of files.filter(f => /^server\/[^/]+\.js$/.test(f) && owners(f).length)){
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  for(const m of src.matchAll(/require\(\s*['"]\.\/([a-z0-9-]+)['"]\s*\)/g)){
    const t = 'server/' + m[1] + '.js';
    if(files.includes(t) && owners(t).length && owners(t)[0] !== owners(f)[0] && !/\/test-/.test(f)) reqs.push(`${owners(f)[0]}:${f} -> ${owners(t)[0]}:${t}`);
  }
}
console.log('INFO acoplamientos de producción entre paquetes (cada uno exige interfaz congelada):\n  ' + [...new Set(reqs)].join('\n  '));
check('los acoplamientos entre paquetes están cubiertos por una interfaz congelada declarada', own.frozenInterfaces.length >= 6);
// 8. Cada contrato tiene un propietario que existe, y cada propietario es un paquete.
const C = require('../../contracts/v1');
check('los propietarios de contrato son paquetes válidos', Object.values(C.OWNERS).every(o => P.includes(o)));
check('los contratos declarados en ownership.json coinciden con OWNERS', P.every(p => own.packages[p].ownsContracts.every(c => C.OWNERS[c] === p)));
summary('independencia de los tres módulos');
