'use strict';
const {chromium}=require('playwright'),{spawn}=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const dataDir=fs.mkdtempSync(path.join(os.tmpdir(),'horda-workshop-relay-'));
// Los cinco están en TESTING (sólo concedidos). El relay rechaza campeones TESTING de cuentas sin concesión, así que este test arranca una COPIA del relay
// cuya taxonomía los marca RELEASED (simula la concesión). No prueba cuentas reales ni el servidor oficial.
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'horda-relay-tree-'));
fs.cpSync('server',path.join(tmp,'server'),{recursive:true,verbatimSymlinks:true});fs.mkdirSync(path.join(tmp,'docs/production'),{recursive:true});fs.copyFileSync('docs/production/shop-catalog.json',path.join(tmp,'docs/production/shop-catalog.json'));
fs.mkdirSync(path.join(tmp,'js'));for(const e of fs.readdirSync('js'))if(e!=='data')fs.symlinkSync(path.resolve('js',e),path.join(tmp,'js',e));
fs.cpSync('js/data',path.join(tmp,'js/data'),{recursive:true});const taxFile=path.join(tmp,'js/data/champion-taxonomy.js');fs.writeFileSync(taxFile,fs.readFileSync(taxFile,'utf8').replace(/releaseState:"TESTING"/g,'releaseState:"RELEASED"'));
const servers=[spawn('python3',['-m','http.server','8857','--bind','127.0.0.1'],{stdio:'ignore'}),spawn('node',[path.join(tmp,'server/relay.js')],{cwd:tmp,env:{...process.env,PORT:'8858',DATA_DIR:dataDir,DATABASE_URL:''},stdio:'ignore'})];
const checks=[],errors=[];let browser;
const reportPath='docs/production/quality-five/online-results.json';
fs.writeFileSync(reportPath,JSON.stringify({status:'RUNNING',scope:'local relay workshop'})+'\n');
const modules=[];
(async()=>{try{
 await new Promise(r=>setTimeout(r,900));browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),args:['--no-sandbox']});
 for(const [host,guest] of [['solciju','veyra'],['veyra','solciju'],['solciju','brakk'],['aelith','morveth'],['morveth','aelith']]){
  const ac=await browser.newContext(),gc=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true});
  const a=await ac.newPage(),g=await gc.newPage();
  for(const [p,k] of [[a,host],[g,guest]]){
   p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(30000);
   await p.goto('http://127.0.0.1:8857/?lazy=0&server=ws%3A%2F%2F127.0.0.1%3A8858');
   await p.waitForFunction(()=>typeof CHAMPION_ENTRY_BALANCE!=='undefined');
   for(const file of modules)await p.addScriptTag({path:file});
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
  await g.waitForTimeout(400);
  for(let i=0;i<3;i++){await g.evaluate(i=>useSkill(i,{x:player.x+65,y:player.y,dx:1,dy:0}),i);await g.waitForTimeout(150);}
  if(guest==='veyra'){
   const hostBleeds=await a.evaluate(()=>(heroes[1].veyraBleeds||[]).filter(x=>x.left>0).length),guestBleeds=await g.evaluate(()=>(player.veyraBleeds||[]).length);
   checks.push({name:'Veyra active bleed state belongs only to host',ok:hostBleeds>0&&guestBleeds===0,hostBleeds,guestBleeds});
  }
  if(guest==='morveth'){const hs=await a.evaluate(()=>(heroes[1].morvethInfections||[]).length),gs=await g.evaluate(()=>(player.morvethInfections||[]).length);checks.push({name:'Morveth infections remain host authoritative',ok:hs>0&&gs===0,hs,gs});}
  if(guest==='brakk'){
   const builds=await g.evaluate(()=>portadorObjects.filter(o=>o.owner===player&&o.brakk&&o.life>0).map(o=>o.kind));
   checks.push({name:'Brakk wall and turret replicate with guest owner',ok:builds.includes('brk_wall')&&builds.includes('brk_turret'),builds});
  }
  await g.evaluate(()=>useUltimate());await g.waitForTimeout(400);
  const hh=await a.evaluate(()=>({key:heroes[1].classKey,casts:heroes[1].stats.skillCasts,damage:heroes[1].stats.dmgDealt,bleeds:(heroes[1].veyraBleeds||[]).length}));
  const gg=await g.evaluate(()=>({key:player.classKey,casts:player.stats.skillCasts,owned:portadorObjects.filter(o=>o.owner===player).map(o=>o.kind),bleeds:(player.veyraBleeds||[]).length}));
  checks.push({name:guest+' guest casts simulated by host',ok:hh.key===guest&&gg.key===guest&&hh.casts>=4&&hh.damage>0,host:hh,guest:gg});
  if(['morveth','aelith'].includes(guest))checks.push({name:guest+' ultimate replicates with guest owner',ok:gg.owned.includes(guest==='morveth'?'mor_garden':'ael_hour')});
  if(guest==='solciju')checks.push({name:'Solciju reserve and cask replicate with guest owner',ok:gg.owned.includes('sol_reserve')&&gg.owned.includes('sol_cask')});
  await a.evaluate(()=>{heroes[1].alive=false;heroes[1].hp=0;});await g.waitForTimeout(500);
  checks.push({name:guest+' death removes owned effects',ok:await a.evaluate(()=>!portadorObjects.some(o=>o.owner===heroes[1]&&o.life>0)&&!(heroes[1].veyraBleeds||[]).length&&!(heroes[1].morvethInfections||[]).length)});
  await ac.close();await gc.close();
 }
 const status=errors.length||checks.some(c=>!c.ok)?'FAIL':'PASS';
 fs.writeFileSync(reportPath,JSON.stringify({status,scope:'local real relay, two clients; no production accounts or cosmetics',checks,errors},null,2)+'\n');
 console.log(JSON.stringify({status,checks,errors}));if(status==='FAIL')process.exitCode=1;
}finally{if(browser)await browser.close();servers.forEach(s=>s.kill());fs.rmSync(dataDir,{recursive:true,force:true});}})().catch(e=>{fs.writeFileSync(reportPath,JSON.stringify({status:'FAIL',checks,errors:[...errors,e.message]},null,2)+'\n');console.error(e);process.exitCode=1;});
