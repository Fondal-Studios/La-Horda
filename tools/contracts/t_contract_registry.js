'use strict';
// El registro de contratos (contracts/registry.json) debe coincidir con el código: dueño, consumidores, esquema, versión, pruebas y áreas.
const fs = require('node:fs'), path = require('node:path');
const { ROOT, check, summary } = require('./lib');
const C = require('../../contracts/v1');
const R = JSON.parse(fs.readFileSync(path.join(ROOT, 'contracts/registry.json'), 'utf8'));
const own = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/arquitectura-compartida/ownership.json'), 'utf8'));
const agents = Object.keys(own.packages), names = Object.keys(R.contracts);
check('el registro y el código declaran exactamente los mismos contratos', JSON.stringify(names.sort()) === JSON.stringify(Object.keys(C.VERSIONS).sort()), { registro: names, codigo: Object.keys(C.VERSIONS) });
for (const n of names) {
  const r = R.contracts[n];
  check(`${n}: el dueño del registro coincide con el del código (${r.owner})`, C.OWNERS[n] === r.owner);
  check(`${n}: el dueño es un agente o ARQ`, agents.includes(r.owner) || r.owner === 'ARQ');
  check(`${n}: tiene consumidores y todos son agentes válidos`, r.consumers.length > 0 && r.consumers.every(c => agents.includes(c)) && !r.consumers.includes(r.owner));
  check(`${n}: el esquema existe y declara la versión vigente (${C.VERSIONS[n]})`, fs.existsSync(path.join(ROOT, r.schema)) && JSON.parse(fs.readFileSync(path.join(ROOT, r.schema), 'utf8')).$id === `fondal/la-horda/${n}/${C.VERSIONS[n]}`);
  check(`${n}: sus pruebas existen`, r.tests.length > 0 && r.tests.every(t => fs.existsSync(path.join(ROOT, t))));
  check(`${n}: sus adaptadores están exportados`, r.adapters.every(a => typeof C[a] === 'function'));
  check(`${n}: el productor existe en el repositorio`, fs.existsSync(path.join(ROOT, r.producer)));
  if (r.owner === 'ARQ') check(`${n}: un contrato de solo lectura explica por qué`, !!r.readOnlyReason);
}
const inAreas = Object.values(R.areas).flat();
check('las siete áreas pedidas están cubiertas', Object.keys(R.areas).length === 7 && ['economia_transacciones', 'persistencia_usuarios', 'telemetria_consentimiento', 'hud_eventos_habilidades', 'seleccion_campeones', 'lobby_multijugador', 'fabrica_artistica_ui'].every(a => R.areas[a]));
check('todo contrato pertenece a exactamente un área', names.every(n => inAreas.filter(x => x === n).length === 1) && inAreas.length === names.length);
check('los contratos que cada agente declara poseer coinciden con el registro', agents.every(a => (own.packages[a].ownsContracts || []).every(c => R.contracts[c] && R.contracts[c].owner === a)) && names.filter(n => R.contracts[n].owner !== 'ARQ').every(n => own.packages[R.contracts[n].owner].ownsContracts.includes(n)));
check('la política de compatibilidad cubre major, minor y patch', ['major', 'minor', 'patch'].every(k => R.compatibility[k]));
summary('registro de contratos');
