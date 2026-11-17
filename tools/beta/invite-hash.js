#!/usr/bin/env node
'use strict';
/* Convierte códigos de invitación de la beta cerrada a su forma con hash, para BETA_INVITE_CODES sin el código en claro.
 *   node tools/beta/invite-hash.js HORDA-AMIGOS PRENSA-2026:20
 * Imprime la línea lista para: fly secrets set BETA_INVITE_CODES="..."   (no guarda nada, no usa la red)
 * Los jugadores siguen escribiendo el código normal; el servidor compara hashes (server/beta-kit.js). */
const { hashCode, normCode } = require('../../server/beta-kit');
const args = process.argv.slice(2);
if(!args.length){ console.error('Uso: node tools/beta/invite-hash.js CODIGO[:usos] [CODIGO[:usos] ...]'); process.exit(2); }
const out = args.map(a => { const m = /^([^:]+?)(?::(\d{1,6}))?$/.exec(a.trim()); if(!m || normCode(m[1]).length < 4) { console.error('Código inválido (4 a 64 caracteres, sin dos puntos): ' + a); process.exit(2); } return 'sha256:' + hashCode(m[1]) + (m[2] ? ':' + m[2] : ''); });
console.log(out.join(','));
