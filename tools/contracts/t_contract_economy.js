'use strict';
// Economía: acreditación sin duplicados, idempotencia, recuperación tras reinicio y adaptadores de contrato,
// contra el servidor REAL en proceso (carpeta temporal, economía V2 activada solo dentro de esta prueba).
const { check, codes, summary, harness } = require('./lib');
const C = require('../../contracts/v1');
const gold = async (h, t) => (await h.api('GET', '/api/economy', undefined, t)).body.account.gold;
const runOf = async (h, id) => (await h.app.store.gmRead()).itemEconomy.runs[id];

(async () => {
  const h = harness({ HORDA_ITEM_ECONOMY: '1', DATA_PERSISTENT: '1', ADMIN_USERS: 'ctowner' });
  await h.start();
  try{
    await h.api('POST', '/api/register', { user: 'ctowner', pass: 'test-long-password' });
    const u = await h.api('POST', '/api/register', { user: 'ctplayer', pass: 'test-long-password' });
    const t = u.body.token; const uid = Number((await h.app.store.getUserByKey('ctplayer')).id);
    const g0 = await gold(h, t); // migra la cuenta al libro
    check('cuenta nueva migrada al libro con oro inicial 0', g0 === 0, g0);

    // ---- Partida completa: una acreditación, sin importar cuántas veces se repita el cierre ----
    const run = (await h.action(t, 'run.start', { arena: 'ciudad', champion: 'tanque', mode: 'campaign' })).body.run;
    for(let i = 0; i < 3; i++){ h.now += 50000; await h.action(t, 'run.pulse', { run: run.id, round: 1 }); }
    const fin = { run: run.id, durationMs: 150000, victory: true };
    const a = await h.action(t, 'run.finish', fin, 'finish_A');
    check('run.finish con evidencia suficiente => 200 y oro acreditado', a.status === 200 && a.body.gold === 1280, a.body);
    const balance = await gold(h, t);
    check('el saldo refleja exactamente una acreditación', balance === 1280, balance);
    const sameKey = await h.action(t, 'run.finish', fin, 'finish_A');
    check('repetir con la MISMA clave devuelve el mismo recibo', sameKey.status === 200 && JSON.stringify(sameKey.body) === JSON.stringify(a.body));
    const otherKey = await h.action(t, 'run.finish', fin, 'finish_B');
    check('repetir con OTRA clave devuelve el mismo resultado de la partida', otherKey.status === 200 && otherKey.body.gold === a.body.gold && JSON.stringify(otherKey.body.items) === JSON.stringify(a.body.items));
    check('ninguna repetición vuelve a acreditar', await gold(h, t) === balance);
    const conflict = await h.action(t, 'run.finish', { ...fin, durationMs: 140000 }, 'finish_A');
    check('misma clave con contenido distinto => 409 IDEMPOTENCY_CONFLICT', conflict.status === 409 && /IDEMPOTENCY_CONFLICT/.test(JSON.stringify(conflict.body)), conflict.body);
    const late = await h.action(t, 'run.pulse', { run: run.id, round: 1 });
    check('una partida ya cerrada no admite más pulsos (409)', late.status === 409, late.body);

    // ---- La evidencia manda: el reclamo del cliente que no cuadra con lo observado se rechaza sin tocar el saldo ----
    const r2 = (await h.action(t, 'run.start', { arena: 'ciudad', champion: 'tanque', mode: 'campaign' })).body.run;
    const rej = await h.action(t, 'run.finish', { run: r2.id, durationMs: 130000, victory: true }, 'impl_1');
    check('reclamo no respaldado por lo observado => 422 y el saldo no cambia', rej.status === 422 && await gold(h, t) === balance, rej.body);
    check('un tercero no puede cerrar la partida ajena (404)', (await h.action((await h.api('POST', '/api/login', { user: 'ctowner', pass: 'test-long-password' })).body.token, 'run.finish', { run: r2.id, durationMs: 1 }, 'tercero_1')).status === 404);

    // ---- Adaptadores de contrato sobre los registros reales ----
    const rec = await runOf(h, run.id);
    const known = { outcome: 'victory', claimed: { victory: true, durationMs: 150000 }, verified: { durationMs: 150000, round: 1, verifier: 'server-economy-live' }, closedAt: rec.last };
    const gr = C.fromServerRun(rec, a.body, known);
    const grv = C.validate('GameResult', gr);
    check('registro real de la partida => GameResult v1 válido y acreditable', grv.ok && gr.credit.eligible, grv.errors);
    const grBare = C.fromServerRun(rec, a.body);
    check('LIMITACIÓN: sin datos extra el registro actual sale outcome=unknown y NO acreditable (el servidor aún no guarda victoria ni lo declarado)', grBare.outcome === 'unknown' && grBare.credit.eligible === false && C.validate('GameResult', grBare).ok);
    const txGold = { contract: 'EconomyTransaction', version: '1.0.0', txId: 'run_reward:' + run.id, idempotencyKey: 'run_reward:' + run.id, accountId: String(uid), kind: 'credit', currency: 'gold', amount: a.body.gold, source: 'run_reward', evidenceRef: run.id, actor: 'server', at: rec.last };
    check('la acreditación de la partida se expresa como EconomyTransaction v1 válida', C.validate('EconomyTransaction', txGold).ok, C.validate('EconomyTransaction', txGold).errors);
    check('el monto acreditado coincide con lo que el saldo subió', txGold.amount === balance - g0);
    const audit = (await h.app.store.gmRead()).itemEconomy.audit.filter(x => x.action === 'run.finish');
    console.log(`INFO auditoría: ${audit.length} asiento(s) run.finish; campos del asiento: ${audit[0] ? Object.keys(audit[0]).join(',') : '-'} (no incluye monto, partida ni cuenta afectada)`);

    // ---- Abandono y partida nueva: la anterior queda cerrada sin pagar ----
    const r3 = (await h.action(t, 'run.start', { arena: 'bosque', champion: 'tanque', mode: 'campaign' })).body.run;
    const r4 = (await h.action(t, 'run.start', { arena: 'bosque', champion: 'tanque', mode: 'campaign' })).body.run;
    const rec3 = await runOf(h, r3.id);
    check('iniciar otra partida cierra la anterior como abandonada', rec3.done === true && rec3.abandoned === true && r3.id !== r4.id);
    const gr3 = C.fromServerRun(rec3, undefined);
    check('la partida abandonada es GameResult válido, outcome=abandon y NO acreditable', C.validate('GameResult', gr3).ok && gr3.outcome === 'abandon' && gr3.credit.eligible === false, gr3);
    check('cerrar una partida abandonada no paga (409) y el saldo no cambia', (await h.action(t, 'run.finish', { run: r3.id, durationMs: 150000, victory: true }, 'ab_1')).status === 409 && await gold(h, t) === balance);

    // ---- Desconexión: el servidor se reinicia a mitad de partida y el cliente reintenta ----
    for(let i = 0; i < 3; i++){ h.now += 50000; await h.action(t, 'run.pulse', { run: r4.id, round: 1 }); }
    const stateBefore = await h.app.store.gmRead();
    await h.stop(); await h.start();
    check('tras el reinicio el estado de la economía es idéntico', JSON.stringify(await h.app.store.gmRead()) === JSON.stringify(stateBefore));
    const t2 = (await h.api('POST', '/api/login', { user: 'ctplayer', pass: 'test-long-password' })).body.token;
    const f4 = await h.action(t2, 'run.finish', { run: r4.id, durationMs: 150000, victory: true }, 'finish_after_restart');
    check('la partida en curso sobrevive al reinicio y se cierra una sola vez', f4.status === 200 && f4.body.gold === 1280 && await gold(h, t2) === balance + 1280, f4.body);
    const f4b = await h.action(t2, 'run.finish', { run: r4.id, durationMs: 150000, victory: true }, 'finish_retry_after_timeout');
    check('el reintento del cliente tras perder la respuesta no vuelve a pagar', f4b.status === 200 && await gold(h, t2) === balance + 1280);
    const stateMid = await h.app.store.gmRead();
    await h.stop(); await h.start();
    check('un segundo reinicio conserva recibos y saldo', JSON.stringify(await h.app.store.gmRead()) === JSON.stringify(stateMid) && (await h.action(t2, 'run.finish', { run: r4.id, durationMs: 150000, victory: true }, 'finish_after_restart')).body.gold === 1280);

    // ---- Billetera premium: libro con referencia única ----
    const ref = 'ct_credit_ref_0001';
    const e1 = await h.app.store.walletApply({ userId: uid, delta: 500, reason: 'gm:adjust', ref, actor: 'admin', at: h.now });
    const e2 = await h.app.store.walletApply({ userId: uid, delta: 500, reason: 'gm:adjust', ref, actor: 'admin', at: h.now });
    check('walletApply: la misma referencia no se acredita dos veces', e1.ok === true && e2.duplicate === true && e2.premium === 500, { e1: e1.ok, e2 });
    const race = await Promise.all(Array.from({ length: 8 }, () => h.app.store.walletApply({ userId: uid, delta: 100, reason: 'gm:adjust', ref: 'ct_race_ref_0001', actor: 'admin', at: h.now })));
    check('walletApply: 8 pedidos simultáneos con la misma referencia => una sola acreditación', race.filter(x => x.ok).length === 1 && (await h.app.store.walletGet(uid)).premium === 600, race.map(x => x.ok || (x.duplicate && 'dup')));
    check('walletApply: nunca deja saldo negativo', (await h.app.store.walletApply({ userId: uid, delta: -99999, reason: 'buy:x', ref: 'ct_neg_ref_00001', actor: String(uid), at: h.now })).insufficient === true);
    const ledger = await h.app.store.walletLedger(uid, 50);
    const txs = ledger.map(C.fromWalletEntry);
    const bad = txs.map(x => ({ x, r: C.validate('EconomyTransaction', x) })).filter(o => !o.r.ok);
    check('cada asiento real del libro se proyecta a EconomyTransaction v1 válido', txs.length >= 2 && bad.length === 0, bad.map(o => o.r.errors));
    const reloaded = (await h.app.store.walletLedger(uid, 50)).length;
    await h.stop(); await h.start();
    check('el libro de la billetera sobrevive al reinicio', (await h.app.store.walletLedger(uid, 50)).length === reloaded && (await h.app.store.walletGet(uid)).premium === 600);
    check('tras el reinicio la referencia sigue siendo única', (await h.app.store.walletApply({ userId: uid, delta: 500, reason: 'gm:adjust', ref, actor: 'admin', at: h.now })).duplicate === true);
  } finally { await h.stop().catch(() => {}); h.cleanup(); }
  summary('economía: acreditación segura, idempotencia y recuperación');
})().catch(e => { console.error(e); process.exitCode = 1; });
