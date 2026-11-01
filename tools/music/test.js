'use strict';
const {test} = require('node:test'), assert = require('node:assert/strict');
const {parseItem} = require('./ingest'), {build} = require('./build-runtime'), P = require('./propose');
const page = lic => `<title>Pista | OpenGameArt.org</title><div class="field field-name-author-submitter"><span class='username'><a href="/users/x">Autor</a></span></div>
<div class="field field-name-field-art-licenses"><div class="field-items">${lic.map(l => `<div class='license-icon'><div class='license-name'>${l}</div></div>`).join('')}</div></div><div class="field-name-collect"></div>
<a href="https://opengameart.org/sites/default/files/t%20x.ogg">t</a>`;
test('la puerta de licencia solo deja pasar CC0 exacta', () => {
  assert.equal(parseItem(page(['CC0']), 's').licenses, 'CC0');
  for (const l of [['CC-BY 4.0'], ['CC-BY-SA 3.0'], ['CC0', 'CC-BY 3.0'], ['GPL 3.0'], []]) assert.notEqual(parseItem(page(l), 's').licenses, 'CC0', l.join('+'));
  assert.equal(parseItem(page(['CC0']), 's').author, 'Autor');
  assert.equal(parseItem(page(['CC0']), 's').files.length, 1);
});
const mk = (over = {}) => ({loop: {fadesOut: false, fadesIn: false, headTailSimilarity: 0.9}, durationSec: 90, integratedLUFS: -14, ...over});
const cat = {tracks: [{sha256: 'a', slug: 'una', title: 'Una'}, {sha256: 'b', slug: 'dos', title: 'Dos'}]};
test('aprobaciones: exigen revisor, método de escucha humana y fecha', () => {
  const ana = {a: mk(), b: mk()};
  assert.equal(build({cat, ana, rev: {approvals: {boss: {approved: ['a']}}}}).errors.length, 1);
  assert.match(build({cat, ana, rev: {approvals: {boss: {approved: ['a'], reviewer: 'x', date: '2026-11-01', method: 'auto-analysis'}}}}).errors[0], /escucha humana/);
  const ok = build({cat, ana, rev: {approvals: {boss: {approved: ['a'], reviewer: 'x', date: '2026-11-01', method: 'listened-in-context'}}}});
  assert.deepEqual(ok.errors, []); assert.deepEqual(ok.slots, {boss: ['una']});
});
test('una pista con fade-out no entra en ranuras de bucle, pero sí en victoria/derrota', () => {
  const ana = {a: mk({loop: {fadesOut: true, fadesIn: false, headTailSimilarity: 0.9}}), b: mk()};
  const rev = slot => ({approvals: {[slot]: {approved: ['a'], reviewer: 'x', date: '2026-11-01', method: 'listened-isolated'}}});
  assert.match(build({cat, ana, rev: rev('wave@bosque')}).errors[0], /bucle/);
  assert.deepEqual(build({cat, ana, rev: rev('victory')}).errors, []);
});
test('una pista inexistente o sin análisis se rechaza', () => {
  assert.match(build({cat, ana: {}, rev: {approvals: {boss: {approved: ['zz'], reviewer: 'x', date: 'd', method: 'listened-isolated'}}}}).errors[0], /inexistente/);
});
test('el proponedor usa los modos y arenas reales del motor y no toca intro', () => {
  const {modes, arenas} = P.engineSlots();
  assert.ok(modes.includes('boss') && modes.includes('intro')); assert.ok(arenas.includes('bosque') && arenas.includes('infernal') && arenas.length >= 9);
});
