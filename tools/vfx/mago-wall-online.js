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
const reportPath='art-source/entregas/mago-kit-20261025/cierre-04/ONLINE.json';
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

 for(const [host,guest] of [['tanque','mago']]){
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
  for(const pg of [a,g]){await pg.waitForFunction(()=>MuroFuego.image.naturalWidth>0);await pg.evaluate(()=>{window.launchArgs=[];const fx=KVB_FX["uf.mago.0"];KVB_FX["uf.mago.0"]=function(...a){launchArgs.push(a);return fx(...a);};window.wallDraws=0;window.wallFrames=[];const di=ctx.drawImage;ctx.drawImage=function(im,...args){if(im===MuroFuego.image){wallDraws++;wallFrames.push([args[0],args[1]]);}return di.call(this,im,...args);};});}
  await g.evaluate(()=>useSkill(0,{x:player.x+60,y:player.y,dx:1,dy:0}));
  for(const [label,pg]of [['host',a],['touch guest',g]]){await pg.waitForFunction(()=>fireWalls.length>0&&wallDraws>0);const details=await pg.evaluate(()=>({draws:wallDraws,walls:fireWalls.map(w=>({inner:w.innerR,outer:w.outerR,timer:w.timer,owner:w.src?.classKey})),frames:wallFrames.slice(0,40),launch:launchArgs}));checks.push({name:'real H1 wall and vendor pixels on '+label,ok:details.launch.length>0&&details.launch.every(a=>a[2]===24)&&details.draws>0&&details.walls.some(w=>w.inner>0&&w.outer>w.inner),details});}
  await a.evaluate(()=>{window.wallEnd=runElapsedMs+Math.max(...fireWalls.map(w=>w.timer))+100;});await a.waitForFunction(()=>runElapsedMs>wallEnd,null,{timeout:30000});await g.waitForFunction(()=>fireWalls.length===0,null,{timeout:15000});
  for(const [label,pg]of [['host',a],['touch guest',g]])checks.push({name:'wall expires on '+label,ok:await pg.evaluate(()=>fireWalls.length===0)});
  await a.evaluate(()=>{heroes[1].cds[0]=0;heroes[1].energy=heroes[1].maxEnergy;});await g.waitForTimeout(300);await g.evaluate(()=>useSkill(0,{x:player.x,y:player.y,dx:1,dy:0}));await g.waitForFunction(()=>fireWalls.length===1);
  checks.push({name:'second guest cast reaches host',ok:await a.evaluate(()=>heroes[1].stats.skillCasts>=2&&fireWalls.length===1)});
  await ac.close();await gc.close();await ab.close();await gb.close();
 }
 const status=errors.length||checks.some(c=>!c.ok)?'FAIL':'PASS';
 fs.writeFileSync(reportPath,JSON.stringify({status,scope:'Unmodified local relay and RELEASED standard taxonomy, founder negative controls, two authenticated fixture accounts. No production accounts or cosmetics.',checks,errors},null,2)+'\n');
 console.log(JSON.stringify({status,checks,errors}));if(status==='FAIL')process.exitCode=1;
}finally{for(const b of browsers)await b.close().catch(()=>{});servers.forEach(s=>s.kill());fs.rmSync(dataDir,{recursive:true,force:true});}})().catch(e=>{fs.writeFileSync(reportPath,JSON.stringify({status:'FAIL',checks,errors:[...errors,e.message]},null,2)+'\n');console.error(e);process.exitCode=1;});
