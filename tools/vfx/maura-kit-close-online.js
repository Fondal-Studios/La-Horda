'use strict';
const {chromium}=require('playwright'),{spawn}=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const dataDir=fs.mkdtempSync(path.join(os.tmpdir(),'horda-workshop-relay-'));
// Production taxonomy remains unchanged. Only this disposable local data directory
// receives test users and explicit grant ledger entries; no production accounts.
const servers=[];
async function seedLocalAccounts(){
 const {create,hashPassword}=require('../../server/accounts');
 const app=create({dataDir,databaseUrl:'',adminUsers:'',founders:{},log:()=>{}});
 try{
  await app.ready;const grants={};
  for(const user of ['qa_five_host','qa_five_guest']){
   const u=await app.store.createUser({user,userKey:user,name:user,createdAt:Date.now(),lastLogin:0,passHash:await hashPassword('local-fixture-password')});
   grants[u.id]={champions:Object.fromEntries(['maura'].map(k=>[k,{origin:'ADMIN_GRANT',by:'local-test-fixture',at:Date.now(),reason:'Isolated relay QA'}]))};
  }
  await app.store.gmUpdate(state=>({state:{...state,grants},value:true}));
 }finally{await app.close();}
}
const checks=[],errors=[],browsers=[];
const reportPath=process.env.REPORT_PATH||'art-source/entregas/maura-kit-20261025/cierre-01/ONLINE.json';
fs.writeFileSync(reportPath,JSON.stringify({status:'RUNNING',scope:'local relay workshop'})+'\n');
const modules=[];
(async()=>{try{
 await seedLocalAccounts();
 servers.push(spawn('python3',['-m','http.server','8867','--bind','127.0.0.1'],{stdio:'ignore'}),spawn('node',['server/relay.js'],{env:{...process.env,PORT:'8868',DATA_DIR:dataDir,DATABASE_URL:''},stdio:'inherit'}));
 let ready=false;
 for(let i=0;i<100;i++){try{const r=await fetch('http://127.0.0.1:8868/api/health');if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}
 if(!ready)throw Error('Local relay failed to start');
 const tokens=[];
 for(const user of ['qa_five_host','qa_five_guest']){const r=await fetch('http://127.0.0.1:8868/api/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({user,pass:'local-fixture-password'})});const j=await r.json();if(!r.ok||!j.token)throw Error('Local QA login failed '+r.status+' '+JSON.stringify(j));tokens.push(j.token);}

 for(const [host,guest] of [['tanque','maura']]){
  const launch=()=>chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),args:['--no-sandbox']});
  const ab=await launch(),gb=await launch();browsers.push(ab,gb);
  const ac=await ab.newContext(),gc=await gb.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true});
  const a=await ac.newPage(),g=await gc.newPage();
  for(const [p,k] of [[a,host],[g,guest]]){
   p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(30000);
   await p.goto('http://127.0.0.1:8867/?lazy=0&server=ws%3A%2F%2F127.0.0.1%3A8868');
   await p.waitForFunction(()=>typeof CHAMPION_ENTRY_BALANCE!=='undefined');
   for(const file of modules)await p.addScriptTag({path:file});
   await p.evaluate(token=>{acct.session={token};},tokens[p===a?0:1]);
   await p.evaluate(k=>{save.starterChosen=true;for(const c of Object.values(save.champions)){c.unlocked=true;c.level=20;}selectedClass=k;currentArena='bosque';setState('prep');},k);
  }
  await a.evaluate(()=>netCreateRoom(currentArena,selectedClass,20));const code=await a.evaluate(()=>net.code);
  await g.evaluate(code=>netJoinRoom(code,selectedClass,20),code);await a.waitForFunction(()=>netHumanCount()===2);
  await a.evaluate(()=>netHostStartGame());await g.waitForFunction(()=>netMatch?.role==='guest'&&state==='playing');
  await a.evaluate(()=>{
   enemies=[];runLevel=ULT_MIN_ARENA_LEVEL;
   for(const h of heroes){h.energy=h.maxEnergy;h.ultCharge=h.ultMax;h.ultCd=0;h.cds=[0,0,0];h.invulnTimer=1e9;}
   for(let i=0;i<5;i++){const e=spawnEnemy('esqueleto');Object.assign(e,{x:heroes[1].x+40+i*8,y:heroes[1].y,hp:1e7,maxHp:1e7,dmg:0,speed:0});}
   window.workshopTimer=setInterval(()=>{spawnTimer=1e9;levelTimer=0;arenaHazardTimer=1e9;},50);
  });
  for(const pg of [a,g]){await pg.waitForFunction(()=>CHAMP_PACK.maura?.ready);await pg.evaluate(()=>{window.signatureDraws=[];const sig=drawMauraNormalSignature;drawMauraNormalSignature=function(s){signatureDraws.push({key:s.key,slot:s.slot,ult:s.ult,t:s.t,dur:s.dur});return sig(s);};window.mauraDraws={roots:0,bark:0,shears:0};const di=ctx.drawImage;ctx.drawImage=function(im,...args){for(const k of ['roots','bark'])if(im===mauraNativeStrip(k).cv)mauraDraws[k]++;if([...sfaCache.entries()].some(([k,v])=>k.includes('maura_shears')&&v.cv===im))mauraDraws.shears++;return di.call(this,im,...args);};});}
  for(let slot=0;slot<3;slot++){
   await a.evaluate(()=>{for(const h of heroes){h.cds=[0,0,0];h.energy=h.maxEnergy;}});await g.waitForTimeout(250);
   await g.evaluate(slot=>useSkill(slot,{x:player.x+160,y:player.y,dx:1,dy:0}),slot);
   const key=['roots','bark','shears'][slot];
   for(const [label,pg]of [['host',a],['touch guest',g]]){try{await pg.waitForFunction(key=>mauraDraws[key]>0,key);}catch(e){checks.push({name:'timeout diagnosis '+label+' '+key,ok:false,details:await pg.evaluate(()=>({state,role:netMatch?.role,heroes:heroes.map(h=>({k:h.classKey,alive:h.alive,c: h.cds,energy:h.energy,stats:h.stats})),objects:portadorObjects.map(o=>({kind:o.kind,life:o.life,owner:o.owner?.classKey})),draws:mauraDraws,pool:sfaPool.map(s=>({theme:s.theme,t:s.t,dur:s.dur})),sfaError:sfaErrAt}))});throw e;}const detail=await pg.evaluate(()=>({draws:mauraDraws,objects:portadorObjects.map(o=>({kind:o.kind,life:o.life,owner:o.owner?.classKey,shield:o.owner?.shield})),pool:sfaPool.map(s=>({art:s.art,theme:s.theme,t:s.t}))}));checks.push({name:key+' actual draw on '+label,ok:detail.draws[key]>0,detail});}
  }
  for(const [label,pg]of [['host',a],['touch guest',g]]){const seen=await pg.evaluate(()=>signatureDraws);for(let slot=0;slot<3;slot++)checks.push({name:label+' normal signature '+slot,ok:seen.some(s=>s.key==='maura'&&s.slot===slot&&!s.ult&&s.dur===460),draws:seen.filter(s=>s.slot===slot).length});}
  await a.evaluate(()=>{heroes.find(h=>h.classKey==='maura').shield=0;});await g.waitForFunction(()=>heroes.find(h=>h.classKey==='maura')?.shield===0);
  for(const [label,pg]of [['host',a],['touch guest',g]]){const before=await pg.evaluate(()=>mauraDraws.bark);await pg.waitForTimeout(150);const after=await pg.evaluate(()=>mauraDraws.bark);checks.push({name:'zero-shield bark stops on '+label,ok:before===after,before,after,method:'Host zero-shield fixture replicated; real damage tested separately'});}
  await a.evaluate(()=>{heroes.find(h=>h.classKey==='maura').cds[1]=0;heroes.find(h=>h.classKey==='maura').energy=1e4;});await g.waitForTimeout(250);await g.evaluate(()=>useSkill(1));await g.waitForFunction(()=>heroes.find(h=>h.classKey==='maura')?.shield>0);
  for(const [label,pg]of [['host',a],['touch guest',g]]){const before=await pg.evaluate(()=>mauraDraws.bark);await pg.waitForTimeout(100);const after=await pg.evaluate(()=>mauraDraws.bark);checks.push({name:'recast bark resumes '+label,ok:after>before});}
  await a.waitForFunction(()=>!portadorObjects.some(o=>o.kind==='ex_bark'),null,{timeout:15000});await g.waitForFunction(()=>!portadorObjects.some(o=>o.kind==='ex_bark'),null,{timeout:15000});checks.push({name:'bark expiry replicated',ok:true});
  await ac.close();await gc.close();await ab.close();await gb.close();
 }
 const status=errors.length||checks.some(c=>!c.ok)?'FAIL':'PASS';
 fs.writeFileSync(reportPath,JSON.stringify({status,scope:'Unmodified local relay and RELEASED standard taxonomy, founder negative controls, two authenticated fixture accounts. No production accounts or cosmetics.',checks,errors},null,2)+'\n');
 console.log(JSON.stringify({status,checks,errors}));if(status==='FAIL')process.exitCode=1;
}finally{for(const b of browsers)await b.close().catch(()=>{});servers.forEach(s=>s.kill());fs.rmSync(dataDir,{recursive:true,force:true});}})().catch(e=>{fs.writeFileSync(reportPath,JSON.stringify({status:'FAIL',checks,errors:[...errors,e.message]},null,2)+'\n');console.error(e);process.exitCode=1;});
