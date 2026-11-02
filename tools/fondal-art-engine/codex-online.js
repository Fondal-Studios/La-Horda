'use strict';
const {spawn}=require('node:child_process'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net'),H=require('../lib/serve');
const out=process.argv[2]||'/tmp/codex-online';
(async()=>{
 fs.mkdirSync(out,{recursive:true});const reservation=net.createServer();await new Promise(r=>reservation.listen(0,'127.0.0.1',r));const port=reservation.address().port;await new Promise(r=>reservation.close(r));
 const data=fs.mkdtempSync(path.join(os.tmpdir(),'horda-codex-relay-'));const relay=spawn(process.execPath,['server/relay.js'],{env:{...process.env,PORT:String(port),DATA_DIR:data,DATABASE_URL:'',ALLOWED_ORIGINS:'*'},stdio:['ignore','ignore','pipe']});let relayErrors='';relay.stderr.on('data',d=>relayErrors+=d);
 const site=await H.startSite();let b;const rows=[],errors=[];
 try{for(let i=0;i<100;i++){try{const r=await fetch('http://127.0.0.1:'+port+'/health');if(r.ok)break;}catch{}if(i===99)throw Error('Relay did not start: '+relayErrors);await new Promise(r=>setTimeout(r,100));}
  b=await H.launch();
  for(const key of ['tanque','guerrero','aelith','morveth']){
   const context=await b.newContext(),host=await context.newPage(),guest=await b.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true});
   for(const [p,k]of[[host,'soporte'],[guest,key]]){p.setDefaultTimeout(60000);p.on('pageerror',e=>errors.push(e.message));await H.goto(p,site.url+'/?lazy=0&server='+encodeURIComponent('ws://127.0.0.1:'+port));await p.waitForFunction(()=>typeof netCreateRoom==='function'&&Object.keys(CODEX_GAMEPLAY_ART).every(k=>CHAMP_PACK['codex_'+k]?.ready));await p.evaluate(k=>{save.starterChosen=true;for(const c in save.champions){save.champions[c].unlocked=true;save.champions[c].level=20;save.champions[c].croma=null;save.champions[c].cosmeticSkin='';save.champions[c].equipment={};}selectedClass=k;currentArena='bosque';setState('prep');},k);}
   await host.evaluate(()=>netCreateRoom(currentArena,selectedClass,20));const code=await host.evaluate(()=>net.code);await guest.evaluate(code=>netJoinRoom(code,selectedClass,20),code);await host.waitForFunction(()=>netHumanCount()===2);await host.evaluate(()=>netHostStartGame());await guest.waitForFunction(()=>netMatch?.role==='guest'&&state==='playing');
   for(const p of [host,guest])await p.evaluate(key=>{window.__codexDraws=[];const fn=champPackDrawFrame;champPackDrawFrame=function(P,v){if(P===CHAMP_PACK['codex_'+key]&&__codexDraws.length<3000)__codexDraws.push({url:new URL(P.atlas.src).pathname,frame:v});return fn.apply(this,arguments);};},key);
   await host.evaluate(()=>{enemies=[];heroes[0].x=heroes[1].x-80;heroes[0].y=heroes[1].y;spawnTimer=arenaHazardTimer=1e9;});
   for(const slot of [0,1,2]){await host.evaluate(()=>{heroes[1].energy=10000;heroes[1].cds=[0,0,0];});await guest.waitForTimeout(250);await guest.evaluate(slot=>useSkill(slot),slot);await host.waitForFunction(n=>heroes[1].stats.skillCasts>=n,slot+1);await host.waitForTimeout(600);}
   for(const [side,p]of[['host',host],['guest',guest]]){await p.waitForFunction(()=>__codexDraws.length>0);const row=await p.evaluate(()=>({casts:heroes[1].stats.skillCasts,role:netMatch.role,key:heroes[1].classKey,draws:__codexDraws}));row.side=side;row.pass=row.key===key&&row.draws.every(d=>d.url.includes('/'+key+'/codex-v1/'))&&(side==='guest'?row.role==='guest':row.casts>=3);rows.push(row);await p.screenshot({path:path.join(out,key+'-'+side+'.png')});}
   await guest.close();await context.close();
  }
  if(errors.length||rows.some(r=>!r.pass))process.exitCode=1;
 }finally{fs.writeFileSync(path.join(out,'online.json'),JSON.stringify({scope:'Four real relay matches: desktop host and mobile guest. H1/H2/H3 input on guest, recovered atlas rendered by both peers.',rows,errors},null,2)+'\n');console.log(rows.map(r=>({key:r.key,side:r.side,casts:r.casts,draws:r.draws.length,pass:r.pass})));if(b)await b.close();relay.kill();await site.close();fs.rmSync(data,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
