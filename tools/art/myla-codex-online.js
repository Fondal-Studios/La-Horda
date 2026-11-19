'use strict';
const {spawn}=require('node:child_process'),fs=require('node:fs'),H=require('../lib/serve');
const OUT=process.env.OUT||'art-source/entregas/bloques/B005_myla/cierre-cast-08';
const bubbleState=()=>{
  const h=heroes.find(x=>x.classKey==='myla'),b=[...KVB.pool].reverse().find(x=>x.name==='my_bubble_idle'&&x.follow===h);
  return h&&b?{shield:h.shield,attackAnim:h.attackAnim,packUntil:h._packCastUntil,pcuLocal:h._pcuLocal,alpha:b.alpha,layer:b.layer,w:b.w,h:b.h,ofy:b.ofy,duration:b.dur,t:b.t}:null;
};
(async()=>{fs.mkdirSync(OUT,{recursive:true});const relay=spawn(process.execPath,['server/relay.js'],{env:{...process.env,PORT:'8899',DATA_DIR:'/tmp/myla-codex-relay',DATABASE_URL:'',ALLOWED_ORIGINS:'*'},stdio:'ignore'}),site=await H.startSite();let browser;const rows=[],errors=[];try{
 browser=await H.launch();const host=await browser.newPage(),guest=await browser.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true});
 for(const [page,key] of [[host,'tanque'],[guest,'myla']]){page.setDefaultTimeout(30000);page.on('pageerror',e=>errors.push(e.message));await H.goto(page,site.url+'/?server=ws%3A%2F%2F127.0.0.1%3A8899');await page.waitForFunction(()=>typeof netCreateRoom==='function'&&typeof KVB==='object');await page.evaluate(key=>{save.starterChosen=true;for(const c in save.champions){save.champions[c].unlocked=true;save.champions[c].level=20;}selectedClass=key;currentArena='bosque';setState('prep');},key);}
 await host.evaluate(()=>netCreateRoom(currentArena,selectedClass,20));const code=await host.evaluate(()=>net.code);await guest.evaluate(code=>netJoinRoom(code,selectedClass,20),code);await host.waitForFunction(()=>netHumanCount()===2);await host.evaluate(()=>netHostStartGame());await guest.waitForFunction(()=>netMatch?.role==='guest'&&state==='playing');
 await host.evaluate(()=>{enemies=[];heroes[0].x=heroes[1].x-80;heroes[0].y=heroes[1].y;setInterval(()=>{spawnTimer=1e9;arenaHazardTimer=1e9;},50);});
 await guest.evaluate(()=>{const h=heroes.find(x=>x.classKey==='myla');h.cls.skills[2].cd=0;h.energy=1e4;const aim={x:h.x+80,y:h.y,dx:1,dy:0};useSkill(2,aim);});
 await host.waitForFunction(()=>{const h=heroes.find(x=>x.classKey==='myla');return h&&h.shield>0&&KVB.pool.some(x=>x.name==='my_bubble_idle'&&x.follow===h);});
 await guest.waitForFunction(()=>{const h=heroes.find(x=>x.classKey==='myla');return h&&h.shield>0&&KVB.pool.some(x=>x.name==='my_bubble_idle'&&x.follow===h);});
 for(const [side,page] of [['host',host],['guest',guest]]){await page.evaluate(()=>render());const during=await page.evaluate(bubbleState);rows.push({side,phase:'cast',...during,pass:!!during&&during.alpha===.64&&during.layer==='g'&&during.w===88&&during.h===88&&during.ofy===-8&&during.shield>0});}
 await host.waitForTimeout(700);
 for(const [side,page] of [['host',host],['guest',guest]]){await page.evaluate(()=>render());const idle=await page.evaluate(bubbleState);rows.push({side,phase:'idle',...idle,pass:!!idle&&idle.alpha===.8&&idle.layer==='t'&&idle.w===68&&idle.h===68&&idle.ofy===-12&&idle.shield>0});await page.screenshot({path:`${OUT}/online-${side}.png`});}
 const report={scope:'Real local relay: Tanque host and tactile Myla guest. H3 cast creates the existing shield bubble on both peers; changed dynamic accessors are checked during cast and after local cast expiry. No protocol, mechanics or balance changes.',rows,errors,status:!errors.length&&rows.length===4&&rows.every(r=>r.pass)?'PASS':'FAIL'};
 fs.writeFileSync(OUT+'/ONLINE.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));if(report.status!=='PASS')process.exitCode=1;
 }finally{if(browser)await browser.close();relay.kill();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
