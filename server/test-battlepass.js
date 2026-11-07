'use strict';
// Pase de batalla: XP solo por partidas verificadas, reclamo idempotente, Brasas solo por el pase, cambio de temporada sin perder lo ganado.
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),http=require('node:http');
process.env.HORDA_ITEM_ECONOMY='1';process.env.DATA_PERSISTENT='1';process.env.ADMIN_USERS='bpowner';
const {create}=require('./accounts'),BP=require('./battlepass');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'horda-bp-'));let now=Date.parse('2026-11-10T12:00:00Z'),app,server,url,seq=0,checks=0;
async function api(method,p,body,t,status=200){const r=await fetch(url+p,{method,headers:{'content-type':'application/json',...(t?{authorization:'Bearer '+t}:{})},body:body===undefined?undefined:JSON.stringify(body)}),j=await r.json();assert.equal(r.status,status,method+' '+p+' '+JSON.stringify(j));checks++;return j;}
const action=(t,op,args={},status=200)=>api('POST','/api/economy/action',{op,args,requestId:'bp_act_'+(++seq)+'_xxxx'},t,status);
const rid=()=>'bp_req_'+(++seq)+'_abcd';
(async()=>{
 app=create({dataDir:dir,databaseUrl:process.env.HORDA_TEST_PG_URL||'',now:()=>now,log:()=>{},originAllowed:()=>true});await app.ready;
 server=http.createServer((q,s)=>app.handle(q,s)||s.end());await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port;
 await api('POST','/api/register',{user:'bpowner',pass:'test-long-password'},null,201);
 const u=await api('POST','/api/register',{user:'bpplayer',pass:'test-long-password'},null,201),T=u.token,uid=(await app.store.getUserByKey('bpplayer')).id;
 const brasas=async()=>(await app.store.walletGet(uid)).premium;
 // 0) orden de inicialización: un jugador que cierra una partida ANTES de abrir el pase igual recibe su XP (el hook no puede romper el cierre)
 {
  const f=await api('POST','/api/register',{user:'bpfresh',pass:'test-long-password'},null,201),FT=f.token;
  await api('GET','/api/economy',undefined,FT);
  const fr=(await action(FT,'run.start',{arena:'ciudad',champion:'tanque',mode:'endless'})).run;now+=100000;
  await action(FT,'run.pulse',{run:fr.id,round:3});
  await action(FT,'run.finish',{run:fr.id,durationMs:100000,round:5,score:1000,survived:2,survivedScore:1000});
  const fv=await api('GET','/api/battlepass',undefined,FT);assert.equal(fv.xp,25+15*2);
 }
 // 1) estado inicial: temporada 1 de 30 días, 30 niveles, ruta gratis y premium
 let v=await api('GET','/api/battlepass',undefined,T);
 assert.equal(v.season.id,1);assert.equal(v.season.days,30);assert.equal(v.tier,0);assert.equal(v.track.length,30);assert.equal(v.premium,false);assert.equal(v.claimed.length,0);
 // 2) nivel bloqueado
 await api('POST','/api/battlepass/claim',{requestId:rid(),tier:1,track:'free'},T,409);
 // 3) XP SOLO por partida verificada del servidor: una partida de Horda cerrada suma, y repetir el cierre no suma dos veces
 await api('GET','/api/economy',undefined,T);
 const run=(await action(T,'run.start',{arena:'ciudad',champion:'tanque',mode:'endless'})).run;now+=100000;
 await action(T,'run.pulse',{run:run.id,round:3});
 await action(T,'run.finish',{run:run.id,durationMs:100000,round:6,score:5000,survived:3,survivedScore:5000});
 v=await api('GET','/api/battlepass',undefined,T);
 assert.equal(v.xp,25+15*3,'XP = 25 + 15 por ronda sobrevivida personalmente');
 const prog=v.challenges.find(c=>c.id==='horda_5_partidas');assert.equal(prog.progress,1);
 const rep=await api('POST','/api/economy/action',{op:'run.finish',args:{run:run.id,durationMs:100000,round:6,score:5000,survived:3,survivedScore:5000},requestId:'bp_act_replay_'+seq},T,200).catch(e=>null);
 v=await api('GET','/api/battlepass',undefined,T);assert.equal(v.xp,70,'el mismo cierre no suma XP otra vez');
 // 4) se simula progreso (solo test) para probar los niveles
 await app.store.gmUpdate(async raw=>{const r=BP.root(raw);BP.acct(r,String(uid),now).xp=6500;return {state:r,value:null};});
 // 5) reclamo de la ruta gratis: una sola vez
 const gold0=(await api('GET','/api/economy',undefined,T)).account.gold;
 let c1=await api('POST','/api/battlepass/claim',{requestId:rid(),tier:1,track:'free'},T);
 assert.equal(c1.duplicate,false);assert.ok(c1.claimed.includes('free:1'));
 const gold1=(await api('GET','/api/economy',undefined,T)).account.gold;assert.equal(gold1,gold0+300);
 let c1b=await api('POST','/api/battlepass/claim',{requestId:rid(),tier:1,track:'free'},T);assert.equal(c1b.duplicate,true);
 assert.equal((await api('GET','/api/economy',undefined,T)).account.gold,gold1,'reclamar de nuevo no duplica el oro');
 // 6) premium: sin ruta no se reclama; sin Brasas no se compra
 await api('POST','/api/battlepass/claim',{requestId:rid(),tier:5,track:'premium'},T,403);
 await api('POST','/api/battlepass/premium',{requestId:rid()},T,402);
 assert.equal(await brasas(),0);
 await app.store.walletApply({userId:uid,delta:2000,reason:'purchase:test',ref:'test-credit-1',actor:null,at:now});
 v=await api('POST','/api/battlepass/premium',{requestId:rid()},T);assert.equal(v.premium,true);assert.equal(await brasas(),2000-BP.PASS_PRICE_BRASAS);
 await api('POST','/api/battlepass/premium',{requestId:rid()},T);assert.equal(await brasas(),2000-BP.PASS_PRICE_BRASAS,'comprar de nuevo no cobra dos veces');
 // 7) Brasas del pase: 5 pedidos simultáneos del mismo nivel => se acreditan UNA vez
 const before=await brasas();
 await Promise.all(Array.from({length:5},()=>api('POST','/api/battlepass/claim',{requestId:rid(),tier:5,track:'premium'},T)));
 assert.equal(await brasas(),before+30,'Brasas del pase: una sola entrega aunque haya doble clic/reintentos');
 // 8) cosmético premium: queda en la cuenta
 const cos=await api('POST','/api/battlepass/claim',{requestId:rid(),tier:3,track:'premium'},T);assert.ok(cos.cosmetics.some(x=>x.startsWith('bp:')));
 // 9) las Brasas SOLO entran por compra (test) o por el pase
 const ledger=await app.store.walletLedger(uid,50);
 for(const e of ledger) if(e.delta>0) assert.ok(/^purchase:|^bp-reward:/.test(e.reason),'entrada de Brasas fuera de compra/pase: '+e.reason);
 // 10) cambio de temporada: se reinicia el progreso y la ruta premium; lo ganado se conserva
 now+=31*86400000;
 v=await api('GET','/api/battlepass',undefined,T);
 assert.equal(v.season.id,2);assert.equal(v.xp,0);assert.equal(v.premium,false);assert.equal(v.claimed.length,0);
 assert.ok(v.cosmetics.some(x=>x.startsWith('bp:')),'los cosméticos ganados se conservan entre temporadas (derechos adquiridos)');
 await api('POST','/api/battlepass/claim',{requestId:rid(),tier:1,track:'free'},T,409);
 // 11) validaciones
 await api('POST','/api/battlepass/claim',{requestId:rid(),tier:99,track:'free'},T,400);
 await api('POST','/api/battlepass/claim',{requestId:rid(),tier:1,track:'gold'},T,400);
 await api('POST','/api/battlepass/claim',{tier:1,track:'free'},T,400);
 await api('GET','/api/battlepass',undefined,undefined,401);
 // 12) hallazgos de la revisión independiente: el XP sale solo de lo que el servidor validó
 {
  const q=await api('POST','/api/register',{user:'bpcheat',pass:'test-long-password'},null,201),QT=q.token,qid=(await app.store.getUserByKey('bpcheat')).id;
  await api('GET','/api/economy',undefined,QT);
  const xpOf=async()=>(await api('GET','/api/battlepass',undefined,QT)).xp;
  const x0=await xpOf();
  // a) partida de duración cero: no da XP
  const z=(await action(QT,'run.start',{arena:'ciudad',champion:'tanque',mode:'endless'})).run;
  await action(QT,'run.finish',{run:z.id,durationMs:0,round:1,score:0});
  assert.equal(await xpOf(),x0,'una partida de duración cero no da XP');checks++;
  // b) victoria no estricta (victory:1) cuenta como derrota: 40 XP, no 200
  const c=(await action(QT,'run.start',{arena:'ciudad',champion:'tanque',mode:'campaign'})).run;now+=60000;
  await action(QT,'run.pulse',{run:c.id,round:1});
  await action(QT,'run.finish',{run:c.id,durationMs:60000,victory:1});
  assert.equal(await xpOf(),x0+40,'victory:1 no es una victoria verificada');checks++;
  // c) repetir el cierre con argumentos inflados no suma, ni siquiera si la partida no figuraba en el pase
  const e=(await action(QT,'run.start',{arena:'ciudad',champion:'tanque',mode:'endless'})).run;now+=100000;
  await action(QT,'run.pulse',{run:e.id,round:3});
  await action(QT,'run.finish',{run:e.id,durationMs:100000,round:6,score:1000,survived:3,survivedScore:1000});
  const x1=await xpOf();assert.equal(x1,x0+40+25+15*3);checks++;
  await app.store.gmUpdate(async raw=>{const r=BP.root(raw);delete BP.acct(r,String(qid),now).runs[e.id];delete raw.itemEconomy.runs[e.id].xpInfo;return {state:r,value:null};});
  await api('POST','/api/economy/action',{op:'run.finish',args:{run:e.id,durationMs:100000,round:6,score:1000,survived:6,survivedScore:1000},requestId:'bp_replay_'+(++seq)+'_zz'},QT,200);
  assert.equal(await xpOf(),x1,'el replay de un cierre no entrega XP con argumentos del cliente');checks++;
  // d) beta pública: el servidor rechaza las arenas de los modos fuera de alcance
  process.env.BETA_PUBLIC='1';
  await action(QT,'run.start',{arena:'coliseum',champion:'tanque',mode:'campaign'},403);
  await action(QT,'run.start',{arena:'crystal_wars',champion:'tanque',mode:'campaign'},403);
  await action(QT,'run.start',{arena:'divina',champion:'tanque',mode:'campaign'},403);
  delete process.env.BETA_PUBLIC;checks+=3;
 }
 await new Promise(r=>server.close(r));await app.close();fs.rmSync(dir,{recursive:true,force:true});
 console.log(`PASS battlepass: ${checks} HTTP assertions; XP verificado, reclamo idempotente, Brasas solo por compra/pase, cambio de temporada`);
})().catch(e=>{console.error(e);process.exit(1);});
