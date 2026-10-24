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
   grants[u.id]={champions:Object.fromEntries(['solciju','brakk','veyra','morveth','aelith'].map(k=>[k,{origin:'ADMIN_GRANT',by:'local-test-fixture',at:Date.now(),reason:'Isolated relay QA'}]))};
  }
  await app.store.gmUpdate(state=>({state:{...state,grants},value:true}));
 }finally{await app.close();}
}
const checks=[],errors=[],browsers=[];
const reportPath=process.env.REPORT || 'art-source/entregas/brakk-kit-20261022/validacion-07/relay-trace.json';
const lifecycle={},observations={};
const waits=[];
async function observeUntil(page,fn,label){const start=Date.now();try{await page.waitForFunction(fn,null,{timeout:30000});waits.push({label,ok:true,wallMs:Date.now()-start});}catch(e){waits.push({label,ok:false,wallMs:Date.now()-start,error:e.message.split('\n')[0]});}}
fs.writeFileSync(reportPath,JSON.stringify({status:'RUNNING',scope:'local relay workshop'})+'\n');
const modules=[];
(async()=>{try{
 await seedLocalAccounts();
 servers.push(spawn('python3',['-m','http.server','8867','--bind','127.0.0.1'],{stdio:'ignore'}),spawn('node',['server/relay.js'],{env:{...process.env,PORT:'8868',DATA_DIR:dataDir,DATABASE_URL:''},stdio:'ignore'}));
 let ready=false;
 for(let i=0;i<100;i++){try{const r=await fetch('http://127.0.0.1:8868/api/health');if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}
 if(!ready)throw Error('Local relay failed to start');
 // Released standard champions use the normal public roster. Founders remain grant-protected.
 const WebSocket=require('../../server/node_modules/ws');
 for(const champ of ['solciju','brakk','veyra','morveth','aelith','nano_gm','facu_gm']){
  const allowed=await new Promise((resolve,reject)=>{
   const ws=new WebSocket('ws://127.0.0.1:8868');
   const timer=setTimeout(()=>{ws.terminate();reject(Error('Anonymous entitlement probe timed out'));},5000);
   ws.on('error',e=>{clearTimeout(timer);reject(e);});
   ws.on('open',()=>ws.send(JSON.stringify({t:'create',protocol:1,arena:'bosque',champ,level:20,name:'Anonymous QA'})));
   ws.on('message',data=>{const m=JSON.parse(data);if(m.t==='joined'){clearTimeout(timer);ws.close();resolve(m.room.slots[0].champ===champ);}});
  });
  const founder=champ.endsWith('_gm');checks.push({name:champ+(founder?' rejected without founder entitlement':' admitted as released standard champion'),ok:founder?!allowed:allowed});
 }
 const tokens=[];
 for(const user of ['qa_five_host','qa_five_guest']){const r=await fetch('http://127.0.0.1:8868/api/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({user,pass:'local-fixture-password'})});const j=await r.json();if(!r.ok||!j.token)throw Error('Local QA login failed');tokens.push(j.token);}

 for(const [host,guest] of [['solciju','brakk']]){
  const launch=()=>chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),args:['--no-sandbox']});
  const ab=await launch(),gb=await launch();browsers.push(ab,gb);
  const ac=await ab.newContext(),gc=await gb.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true});
  const a=await ac.newPage(),g=await gc.newPage();
  if(process.env.CPU_RATE){const cdp=await ac.newCDPSession(a);await cdp.send('Emulation.setCPUThrottlingRate',{rate:Number(process.env.CPU_RATE)});}
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
  for(const pg of [a,g])await pg.evaluate(()=>{window.braceDraws=0;const di=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(im,...args){for(const [key,b]of sfaCache)if(key.startsWith('aura|brakk_repair')&&im===b.cv&&b.w===48&&b.h===56){braceDraws++;break;}return di.call(this,im,...args);};window.signatureDraws=[];const sig=drawBrakkNormalSignature;drawBrakkNormalSignature=function(s){signatureDraws.push({key:s.key,slot:s.slot,ult:s.ult,t:s.t,dur:s.dur});return sig(s);};window.brakkTrace=[];const push=sfaPush;window.sfaPush=function(...args){if(window.suppressNails&&args[1]==='brakk_nails')return;if(String(args[1]).startsWith('brakk_'))brakkTrace.push(args);return push.apply(this,args);};});
  for(const [role,pg]of [['host',a],['guest',g]])await pg.evaluate(role=>{
    window.lifecycle=[];window.lifecycleTimer=setInterval(()=>{
      if(lifecycle.length>2000)return;
      lifecycle.push({wall:performance.now(),sim:runElapsedMs,role,heroes:heroes.map(h=>({key:h.classKey,x:h.x,y:h.y,energy:h.energy,cds:h.cds,alive:h.alive,stun:h.stunTimer})),objects:portadorObjects.filter(o=>o.brakk).map(o=>({kind:o.kind,id:o.id,netId:o.netId,owner:heroes.indexOf(o.owner),x:o.x,y:o.y,hp:o.hp,maxHp:o.maxHp,life:o.life,tick:o.tick,interval:o.interval,left:o.left,hitTimer:o.hitTimer})),enemies:enemies.map(e=>({x:e.x,y:e.y,hp:e.hp,speed:e.speed,baseSpeed:e.baseSpeed,stun:e.stunTimer}))});
    },20);
  },role);
  if(process.env.CANARY_NAILS)await a.evaluate(()=>window.suppressNails=true);
  await g.waitForTimeout(400);
  for(let i=0;i<3;i++){await g.evaluate(i=>useSkill(i,{x:player.x+65,y:player.y,dx:1,dy:0}),i);await g.waitForTimeout(150);}
  if(guest==='veyra'){
   const hostBleeds=await a.evaluate(()=>(heroes[1].veyraBleeds||[]).filter(x=>x.left>0).length),guestBleeds=await g.evaluate(()=>(player.veyraBleeds||[]).length);
   checks.push({name:'Veyra active bleed state belongs only to host',ok:hostBleeds>0&&guestBleeds===0,hostBleeds,guestBleeds});
  }
  if(guest==='morveth'){const hs=await a.evaluate(()=>(heroes[1].morvethInfections||[]).length),gs=await g.evaluate(()=>(player.morvethInfections||[]).length);checks.push({name:'Morveth infections remain host authoritative',ok:hs>0&&gs===0,hs,gs});}
  if(guest==='brakk'){
   if(process.env.OBSERVE_STATE)await observeUntil(g,()=>['brk_wall','brk_turret'].every(kind=>portadorObjects.some(o=>o.owner===player&&o.kind===kind&&o.life>0)),'guest receives both live builds');
   observations.builds=await g.evaluate(()=>({wall:performance.now(),sim:runElapsedMs,objects:portadorObjects.filter(o=>o.brakk).map(o=>({kind:o.kind,owner:heroes.indexOf(o.owner),life:o.life,hp:o.hp}))}));
   const builds=await g.evaluate(()=>portadorObjects.filter(o=>o.owner===player&&o.brakk&&o.life>0).map(o=>o.kind));
   checks.push({name:'Brakk wall and turret replicate with guest owner',ok:builds.includes('brk_wall')&&builds.includes('brk_turret'),builds});
  }
  await g.waitForTimeout(1100);
  if(process.env.OBSERVE_STATE){
   await observeUntil(a,()=>portadorObjects.some(o=>o.owner===heroes[1]&&o.kind==='brk_turret'&&o.left<6),'host turret completes first real interval');
   await observeUntil(g,()=>brakkTrace.some(x=>x[1]==='brakk_nails'),'guest receives nails event');
  }
  observations.events=await a.evaluate(()=>({wall:performance.now(),sim:runElapsedMs,objects:portadorObjects.filter(o=>o.brakk).map(o=>({kind:o.kind,life:o.life,hp:o.hp,left:o.left,tick:o.tick}))}));
  const ht=await a.evaluate(()=>brakkTrace),gt=await g.evaluate(()=>brakkTrace);
  for(const [role,pg]of [['host',a],['touch guest',g]]){const seen=await pg.evaluate(()=>signatureDraws);for(let slot=0;slot<3;slot++)checks.push({name:role+' renders own signature slot '+slot,ok:seen.some(s=>s.slot===slot&&s.key==='brakk'&&!s.ult&&s.dur===460),draws:seen.filter(s=>s.slot===slot).length});}
  for(const [role,pg]of [['host',a],['touch guest',g]]){const draws=await pg.evaluate(()=>braceDraws);checks.push({name:role+' draws new 48x56 brace atlas in real renderer',ok:draws>0,draws});}
  for(const theme of ['brakk_build','brakk_deploy~h','brakk_repair~p','brakk_nails'])checks.push({name:'host event reaches touch guest: '+theme,ok:ht.some(x=>x[1]===theme)&&gt.some(x=>x[1]===theme),host:ht.filter(x=>x[1]===theme),guest:gt.filter(x=>x[1]===theme)});
  for(const [role,pg]of [['host',a],['guest',g]])lifecycle[role]=await pg.evaluate(()=>window.lifecycle);
  await g.evaluate(()=>useUltimate());await g.waitForTimeout(400);
  const hh=await a.evaluate(()=>({key:heroes[1].classKey,casts:heroes[1].stats.skillCasts,damage:heroes[1].stats.dmgDealt,bleeds:(heroes[1].veyraBleeds||[]).length}));
  const gg=await g.evaluate(()=>({key:player.classKey,casts:player.stats.skillCasts,owned:portadorObjects.filter(o=>o.owner===player).map(o=>o.kind),bleeds:(player.veyraBleeds||[]).length}));
  checks.push({name:guest+' guest casts simulated by host',ok:hh.key===guest&&gg.key===guest&&hh.casts>=4&&hh.damage>0,host:hh,guest:gg});
  if(['morveth','aelith'].includes(guest))checks.push({name:guest+' ultimate replicates with guest owner',ok:gg.owned.includes(guest==='morveth'?'mor_garden':'ael_hour')});
  if(guest==='solciju')checks.push({name:'Solciju reserve and cask replicate with guest owner',ok:gg.owned.includes('sol_reserve')&&gg.owned.includes('sol_cask')});
  await a.evaluate(()=>{heroes[1].alive=false;heroes[1].hp=0;});await g.waitForTimeout(500);
  checks.push({name:guest+' death removes owned effects',ok:await a.evaluate(()=>!portadorObjects.some(o=>o.owner===heroes[1]&&o.life>0)&&!(heroes[1].veyraBleeds||[]).length&&!(heroes[1].morvethInfections||[]).length)});
  await ac.close();await gc.close();await ab.close();await gb.close();
 }
 const status=errors.length||waits.some(w=>!w.ok)||checks.some(c=>!c.ok)?'FAIL':'PASS';
 fs.writeFileSync(reportPath,JSON.stringify({status,lifecycle,observations,waits,cpuRate:Number(process.env.CPU_RATE||1),observeState:!!process.env.OBSERVE_STATE,scope:'Unmodified local relay and RELEASED standard taxonomy, founder negative controls, two authenticated fixture accounts. No production accounts or cosmetics.',checks,errors},null,2)+'\n');
 console.log(JSON.stringify({status,checks,errors}));if(status==='FAIL')process.exitCode=1;
}finally{for(const b of browsers)await b.close().catch(()=>{});servers.forEach(s=>s.kill());fs.rmSync(dataDir,{recursive:true,force:true});}})().catch(e=>{fs.writeFileSync(reportPath,JSON.stringify({status:'FAIL',lifecycle,observations,waits,checks,errors:[...errors,e.message]},null,2)+'\n');console.error(e);process.exitCode=1;});
