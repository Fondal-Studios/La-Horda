'use strict';
const {spawn}=require('node:child_process'),fs=require('node:fs'),H=require('../lib/serve');
const OUT=process.env.OUT||'art-source/entregas/libertador-kit-20261025/primera-pasada-01';
fs.mkdirSync(OUT,{recursive:true});
const relay=spawn('node',['server/relay.js'],{env:{...process.env,PORT:'8894',DATA_DIR:fs.mkdtempSync('/tmp/libertador-kit-relay-'),DATABASE_URL:'',ALLOWED_ORIGINS:'*'},stdio:'ignore'});
(async()=>{const site=await H.startSite();let b;const errors=[],checks=[];try{
 for(let n=0;n<100;n++){try{if((await fetch('http://127.0.0.1:8894/api/health')).ok)break;}catch{}if(n===99)throw Error('relay not ready');await new Promise(r=>setTimeout(r,100));}
 b=await H.launch();const a=await b.newPage(),g=await b.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true});
 for(const [p,k]of[[a,'solciju'],[g,'libertador']]){p.on('pageerror',e=>errors.push(e.message));await H.goto(p,site.url+'/?lazy=0&server=ws%3A%2F%2F127.0.0.1%3A8894');await p.waitForFunction(()=>typeof netCreateRoom==='function'&&assetsAllReady());await p.evaluate(k=>{save.starterChosen=true;for(const c in save.champions){save.champions[c].unlocked=true;save.champions[c].level=20;}selectedClass=k;currentArena='bosque';setState('prep');},k);}
 await a.evaluate(()=>netCreateRoom(currentArena,selectedClass,20));const code=await a.evaluate(()=>net.code);await g.evaluate(code=>netJoinRoom(code,selectedClass,20),code);await a.waitForFunction(()=>netHumanCount()===2);await a.waitForFunction(()=>netDuoLoadoutValid(1));await a.evaluate(()=>netHostStartGame());await g.waitForFunction(()=>netMatch?.role==='guest'&&state==='playing');
 for(const p of[a,g])await p.evaluate(()=>{window.__draw={};window.__trace=[];const di=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(im,...args){if(this===ctx)for(const[key,v]of sfaCache)if(v.cv===im&&key.includes('libertador_')){__draw[key]=(__draw[key]||0)+1;if(__trace.length<300)__trace.push({key,phase:heroes[1].smPhase,x:heroes[1].x,y:heroes[1].y,draw:args});}return di.call(this,im,...args);};});
 await a.evaluate(()=>{enemies=[];aidSolids=aidSolids.filter(s=>!s.bsv);if(typeof aidNavBuild==='function')aidNavBuild();for(const h of heroes){h.invulnTimer=1e9;h.energy=1e4;}setInterval(()=>{spawnTimer=1e9;levelTimer=0;arenaHazardTimer=1e9;},50);});
 for(const [i,kind]of[[0,'bayonet'],[1,'command'],[2,'charge']]){
  await a.waitForFunction(()=>!heroes[1].smPhase,null,{timeout:30000});await g.evaluate(i=>useSkill(i,{x:player.x+430,y:player.y,dx:1,dy:0}),i);
  for(const p of[a,g])await p.waitForFunction(kind=>Object.keys(__draw).some(k=>k.includes('libertador_'+kind)),kind,{timeout:30000});
 }
 await g.waitForFunction(()=>heroes[1].stats.skillCasts>=3,null,{timeout:30000});
 for(const [role,p]of[['host',a],['touch-guest',g]]){
  const r=await p.evaluate(()=>({draw:__draw,trace:__trace,casts:heroes[1].stats.skillCasts,owner:heroes[1].classKey,role:netMatch.role}));fs.writeFileSync(OUT+'/online-'+role+'.json',JSON.stringify(r,null,2));
  for(const kind of ['bayonet','command','charge'])checks.push({name:role+' draws '+kind,ok:Object.keys(r.draw).some(k=>k.includes('libertador_'+kind))});
  checks.push({name:role+' owner and three casts',ok:r.owner==='libertador'&&r.casts>=3});checks.push({name:role+' no charge atlas during mount',ok:r.trace.filter(t=>t.key.includes('libertador_charge')).every(t=>t.phase==='charge')});
  await p.screenshot({path:OUT+'/online-'+role+'.png'});
 }
 const signatures=[];for(const p of[a,g])signatures.push(await p.evaluate(()=>[['beam','libertador_bayonet',16],['nova','libertador_command~h',192],['beam','libertador_charge~p',16]].map(args=>{const b=sfaBake(...args),d=b.cv.getContext('2d').getImageData(0,0,b.cv.width,b.cv.height).data;let h=2166136261;for(const n of d)h=Math.imul(h^n,16777619);return[h>>>0,b.w,b.h,b.n];})));checks.push({name:'exact variants match host and guest RGBA',ok:JSON.stringify(signatures[0])===JSON.stringify(signatures[1]),signatures});
 fs.writeFileSync(OUT+'/online-results.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks,errors}));if(errors.length||checks.some(c=>!c.ok))process.exitCode=1;
 }catch(e){fs.writeFileSync(OUT+'/online-failure.json',JSON.stringify({error:String(e),checks,errors},null,2));throw e;}finally{if(b)await b.close();relay.kill();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
