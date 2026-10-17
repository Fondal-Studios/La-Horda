"use strict";
// Run ON THE SERVER with its environment loaded. Outputs presence, never secret values.
const payments = require('../../server/payments');
const checks = [];
const check = (name, ok) => checks.push({name,ok:!!ok});
check('Mercado Pago selected',process.env.PAYMENTS_PROVIDER==='mercadopago');
check('Provider configuration complete',payments.enabled());
check('Production mode explicitly selected',process.env.MP_LIVE_MODE==='true');
check('Postgres configured OR operator verified a persistent volume',!!process.env.DATABASE_URL || (!!process.env.DATA_DIR && process.env.DATA_PERSISTENT==='1'));
check('Launch pack shortlist explicitly configured',process.env.PAYMENTS_PACK_IDS==='brasas_inicio,brasas_coleccion');
check('Return URL uses HTTPS',/^https:\/\//.test(process.env.PAYMENTS_SUCCESS_URL||''));
console.log(JSON.stringify({checks,configurationReady:checks.every(c=>c.ok),
  note:'Configuration only. Does not verify backup restore, provider purchase/refund, legal texts, rights, game QA or public capacity.'},null,2));
process.exitCode=checks.every(c=>c.ok)?0:1;
