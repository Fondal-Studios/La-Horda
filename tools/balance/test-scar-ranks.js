#!/usr/bin/env node
'use strict';
// Rangos de Cicatriz: reglas puras (js/data/scar-ranks.js). Sin navegador. node tools/balance/test-scar-ranks.js
const path = require('path'), fs = require('fs');
const S = require('../../js/data/scar-ranks.js');
const ROOT = path.resolve(__dirname, '..', '..');
let fails = 0;
const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (!ok && x !== undefined ? '  ' + JSON.stringify(x) : '')); if (!ok) fails++; };
// mutadores válidos: se leen del archivo de datos de la Horda
const endlessSrc = fs.readFileSync(path.join(ROOT, 'js/data/endless.js'), 'utf8');
const mutIds = [...endlessSrc.slice(endlessSrc.indexOf('const ENDLESS_MUTATORS'), endlessSrc.indexOf('const ENDLESS_MUTATOR_IDS')).matchAll(/^\s{2}(\w+):\s*\{name:/gm)].map(m => m[1]);
check('hay_6_rangos_0_a_5', S.SCAR_RANKS.length === 6 && S.SCAR_RANKS.every((R, i) => R.rank === i));
check('rondas_de_cierre_crecen', S.SCAR_CFG.clearRound.length === 6 && S.SCAR_CFG.clearRound.every((v, i, a) => i === 0 || v > a[i - 1]), S.SCAR_CFG.clearRound);
check('mutadores_de_rango_existen', S.SCAR_RANKS.every(R => R.mutators.every(m => mutIds.includes(m))), mutIds);
check('cada_rango_suma_sobre_el_anterior', S.SCAR_RANKS.every((R, i) => i === 0 || (R.mutators.length > S.SCAR_RANKS[i - 1].mutators.length && S.SCAR_RANKS[i - 1].mutators.every(m => R.mutators.includes(m)))));
check('mezcla_sustituye_los_repetidos', JSON.stringify(S.scarMergeMutators(['elites_x2', 'swarm'], 2)) === JSON.stringify(['elites_x2', 'swarm', 'rifts', 'fast_horde']), S.scarMergeMutators(['elites_x2', 'swarm'], 2));
{ // en TODAS las combinaciones de temporada (2 de 7) cada rango suma tantos mutadores nuevos como su tabla, sin repetir y todos válidos
  const ids = mutIds; let bad = 0, combos = 0;
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) for (let r = 0; r <= 5; r++) {
    const out = S.scarMergeMutators([ids[i], ids[j]], r); combos++;
    if (new Set(out).size !== out.length || out.length !== 2 + S.SCAR_RANKS[r].mutators.length || !out.every(m => ids.includes(m))) bad++;
  }
  check('rango_siempre_suma_sus_mutadores_con_cualquier_temporada', bad === 0 && combos === 126, { bad, combos });
  check('rango_V_activa_los_7', ids.every(m => S.scarMergeMutators([ids[0], ids[1]], 5).includes(m)) && S.scarMergeMutators([ids[2], ids[5]], 5).length === 7);
  check('reserva_valida', S.SCAR_RESERVE.every(m => ids.includes(m)) && new Set(S.SCAR_RESERVE).size === S.SCAR_RESERVE.length);
}
check('rango_0_no_cambia_la_temporada', JSON.stringify(S.scarMergeMutators(['swarm', 'dense'], 0)) === JSON.stringify(['swarm', 'dense']));
check('rango_fuera_de_rango_se_acota', S.scarClamp(-3) === 0 && S.scarClamp(99) === 5 && S.scarClamp('2') === 2 && S.scarClamp(NaN) === 0);
check('bono_de_puntaje', S.scarScoreBonus(0) === 1 && Math.abs(S.scarScoreBonus(4) - 1.6) < 1e-9);
check('no_se_elige_lo_bloqueado', S.scarCanPick(0, 0) && !S.scarCanPick(1, 0) && S.scarCanPick(2, 3) && !S.scarCanPick(4, 3));
let o = S.scarOutcome(0, 9, 0); check('rango0_ronda9_no_completa', !o.cleared && o.unlock === null && !o.title, o);
o = S.scarOutcome(0, 10, 0); check('rango0_ronda10_abre_I_sin_titulo', o.cleared && o.unlock === 1 && !o.title, o);
o = S.scarOutcome(1, 15, 1); check('I_ronda15_abre_II_y_da_titulo', o.cleared && o.unlock === 2 && o.title === 'marcado_1', o);
o = S.scarOutcome(1, 40, 3); check('rejugar_un_rango_viejo_no_baja_el_maximo', o.unlock === null && o.title === 'marcado_1', o);
o = S.scarOutcome(5, 35, 5); check('V_ronda35_da_titulo_y_marco_sin_nuevo_rango', o.cleared && o.unlock === null && o.title === 'marcado_5' && o.frame === 'cicatriz', o);
check('titulos_y_marco_estan_en_el_catalogo', (() => {
  const q = fs.readFileSync(path.join(ROOT, 'js/data/quests.js'), 'utf8');
  return S.SCAR_RANKS.filter(R => R.title).every(R => new RegExp('\\b' + R.title + ':\\s*\\{name:').test(q)) && /\bcicatriz:\s*\{name:/.test(q);
})());
check('no_toca_economia', !/\b(gold|gems|brasas|xp)\b/i.test(fs.readFileSync(path.join(ROOT, 'js/data/scar-ranks.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')));
console.log(fails ? 'FALLAS: ' + fails : 'OK todas');
process.exit(fails ? 1 : 0);
