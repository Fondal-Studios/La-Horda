'use strict';
const fs=require('fs'),{spawn}=require('child_process'),H=require('../lib/serve');
const D=process.env.OUT||'art-source/entregas/musashi-kit-20261026/integracion-01';fs.mkdirSync(D,{recursive:true});
const relay=spawn('node',['server/relay.js'],{env:{...process.env,PORT:'8897',DATA_DIR:fs.mkdtempSync('/tmp/musashi-relay-'),DATABASE_URL:'',ALLOWED_ORIGINS:'*'},stdio:'ignore'});
(async()=>{let b;const site=await H.startSite(),checks=[],errors=[],rows=[];try{
 for(let n=0;n<100;n++){try{if((await fetch('http://127.0.0.1:8897/api/health')).ok)break;}catch{}if(n===99)throw Error('relay not ready');await new Promise(r=>setTimeout(r,100));}
 b=await H.launch();const host=await b.newPage(),guest=await b.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true});
 for(const [p,skin]of[[host,''],[guest,'errante']]){
  p.on('pageerror',e=>errors.push(e.message));await p.goto(site.url+'/?lazy=0&server=ws%3A%2F%2F127.0.0.1%3A8897');await p.waitForFunction(()=>assetsAllReady()&&typeof netCreateRoom==='function');
  await p.evaluate(skin=>{save.starterChosen=true;for(const c of Object.values(save.champions))Object.assign(c,{unlocked:true,level:20});save.cosmeticUnlocks={...save.cosmeticUnlocks,errante:true};save.champions.musashi.cosmeticSkin=skin;save.champions.musashi.croma=null;selectedClass='musashi';currentArena='bosque';setState('prep');},skin);
 }
 await host.evaluate(()=>netCreateRoom(currentArena,selectedClass,20));const code=await host.evaluate(()=>net.code);await guest.evaluate(code=>netJoinRoom(code,selectedClass,20),code);await host.waitForFunction(()=>netHumanCount()===2&&netDuoLoadoutValid(1));await host.evaluate(()=>netHostStartGame());await guest.waitForFunction(()=>netMatch?.role==='guest'&&state==='playing');
 for(const p of[host,guest])await p.evaluate(()=>{window.__ghostTrace=[];window.__ghostImages=[];let ghost=false,packKey=null;const draw=drawMusashiAfterimages,pack=champPackDrawFrame,di=CanvasRenderingContext2D.prototype.drawImage;
  drawMusashiAfterimages=function(){ghost=true;try{return draw();}finally{ghost=false;}};
  champPackDrawFrame=function(P,...a){const prev=packKey;if(ghost)packKey=Object.keys(CHAMP_PACK).find(k=>CHAMP_PACK[k]===P);try{return pack(P,...a);}finally{packKey=prev;}};
  CanvasRenderingContext2D.prototype.drawImage=function(im,...a){if(this===ctx&&ghost&&packKey&&__ghostTrace.length<500)__ghostTrace.push({packKey,images:musashiAfterimages.map(x=>({packKey:x.packKey,life:x.life,x:x.x,y:x.y}))});return di.call(this,im,...a);};
 });
 await host.evaluate(()=>{enemies=[];for(const h of heroes){h.invulnTimer=1e9;h.energy=1e4;h.cds=[0,0,0];}setInterval(()=>{spawnTimer=arenaHazardTimer=1e9;levelTimer=0;},40);});
 for(const [slot,p,expected]of[[0,host,'musashi'],[1,guest,'skin_errante']]){
  await host.waitForFunction(()=>musashiAfterimages.length===0);await guest.waitForFunction(()=>musashiAfterimages.length===0);
  for(const pg of[host,guest])await pg.evaluate(()=>{__ghostTrace=[];});
  await p.evaluate(()=>useSkill(1,{x:player.x+180,y:player.y,dx:1,dy:0}));
  for(const [role,pg]of[['host',host],['touch-guest',guest]]){
   await pg.waitForFunction(()=>__ghostTrace.length>0);const row=await pg.evaluate(()=>({role:netMatch.role,trace:__ghostTrace,skins:heroes.map(h=>({skinSet:h.skinSet,classKey:h.classKey})),casts:heroes.map(h=>h.stats.skillCasts)}));
   rows.push({casterSlot:slot,expected,observer:role,...row});checks.push({name:role+' casts slot '+slot+' actual texture',ok:row.trace.every(t=>t.packKey===expected)});checks.push({name:role+' casts slot '+slot+' serialized identity',ok:row.trace.every(t=>t.images.every(a=>a.packKey===expected))});
  }
 }
 for(const p of[host,guest])await p.waitForFunction(()=>musashiAfterimages.length===0);
 checks.push({name:'host and guest expire both snapshots',ok:true});
 fs.writeFileSync(D+'/ONLINE.json',JSON.stringify({checks,rows,errors},null,2));console.log(JSON.stringify({checks,errors}));if(errors.length||checks.some(c=>!c.ok))process.exitCode=1;
}catch(e){fs.writeFileSync(D+'/ONLINE_FAILURE.json',JSON.stringify({error:String(e),checks,rows,errors},null,2));throw e;}finally{if(b)await b.close();relay.kill();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
