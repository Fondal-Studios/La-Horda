'use strict';
const {spawn}=require('node:child_process'),fs=require('node:fs'),H=require('../lib/serve');
const OUT='art-source/entregas/guerrero-kit-20261023/integracion-01';
const relay=spawn('node',['server/relay.js'],{env:{...process.env,PORT:'8894',DATA_DIR:'/tmp/guerrero-trap-relay',ALLOWED_ORIGINS:'*'},stdio:'ignore'});
(async()=>{const site=await H.startSite();let b;try{
 b=await H.launch();const a=await b.newPage(),g=await b.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true}),errors=[],checks=[];
 for(const [p,k]of[[a,'solciju'],[g,'guerrero']]){p.on('pageerror',e=>errors.push(e.message));await H.goto(p,site.url+'/?server=ws%3A%2F%2F127.0.0.1%3A8894');await p.waitForFunction(()=>typeof netCreateRoom==='function'&&ASESINO_HAB_READY.trampa);await p.evaluate(k=>{save.starterChosen=true;for(const c in save.champions){save.champions[c].unlocked=true;save.champions[c].level=20;}selectedClass=k;currentArena='bosque';setState('prep');},k);}
 await a.evaluate(()=>netCreateRoom(currentArena,selectedClass,20));const code=await a.evaluate(()=>net.code);await g.evaluate(code=>netJoinRoom(code,selectedClass,20),code);await a.waitForFunction(()=>netHumanCount()===2);await a.waitForFunction(()=>netDuoLoadoutValid(1));await a.evaluate(()=>netHostStartGame());await g.waitForFunction(()=>netMatch?.role==='guest'&&state==='playing');
 for(const p of[a,g])await p.evaluate(()=>{window.__draw=[];const d=window.drawAnimFrameSized;window.drawAnimFrameSized=function(img,clip,n,...args){if(img.src?.includes('/vfx/guerrero/trampa.'))__draw.push({frame:clip.frames[n],args,src:img.src});return d.apply(this,arguments);};});
 await a.evaluate(()=>{enemies=[];setInterval(()=>{spawnTimer=1e9;levelTimer=0;arenaHazardTimer=1e9;},50);});
 await g.evaluate(()=>useSkill(2,{x:player.x+100,y:player.y,dx:1,dy:0}));
 await a.waitForFunction(()=>heroes[1].stats.skillCasts>=1);
 for(const p of[a,g])await p.waitForFunction(()=>__draw.some(d=>d.args[2]===64&&d.args[3]===64),null,{timeout:30000});
 await g.waitForFunction(()=>heroes[1].stats.skillCasts>=1);
 for(const [name,p]of[['host',a],['guest',g]]){const r=await p.evaluate(()=>({draw:__draw,casts:heroes[1].stats.skillCasts,traps:traps.map(t=>({owner:heroes.indexOf(t.src),classKey:t.src?.classKey,radius:t.radius,armTime:t.armTime})),role:netMatch.role}));fs.writeFileSync(OUT+'/online-'+name+'.json',JSON.stringify(r,null,2));checks.push({name:name+' persistent atlas drawn',ok:r.draw.some(d=>d.args[2]===64&&d.args[3]===64)});checks.push({name:name+' actual cast and replicated owner',ok:r.casts>=1&&r.traps.some(t=>t.owner===1&&t.classKey==='guerrero'&&t.armTime<=0)});await p.screenshot({path:OUT+'/online-'+name+'.png'});}
 fs.writeFileSync(OUT+'/online-results.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks,errors}));if(errors.length||checks.some(c=>!c.ok))process.exitCode=1;
}finally{if(b)await b.close();relay.kill();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
