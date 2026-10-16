'use strict';
const {chromium}=require('playwright'),{spawn}=require('child_process'),fs=require('fs'),assert=require('assert');
const out='docs/production/art-unification';
(async()=>{const srv=spawn('python3',['-m','http.server','8874'],{stdio:'ignore'});let browser;try{
for(let i=0;i<60;i++){try{if((await fetch('http://127.0.0.1:8874')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:844,height:390}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
if(process.env.FALLBACK)await page.route('**/battlefield/tower-blue.webp',r=>r.fulfill({status:404,body:''}));
await page.goto('http://127.0.0.1:8874/?lazy=1');await page.waitForFunction(()=>typeof BATTLEFIELD_IMAGES!=='undefined');
await page.evaluate(()=>{for(const g of ['common','ar:infernal','ar:minas','ar:ciudad','ar:abismo','ar:laberinto','ar:acuatica','ar:fortaleza','ar:micelial'])assetsStartGroup(g);});
await page.waitForFunction(()=>Object.values(BATTLEFIELD_IMAGES).every(i=>i.complete&&i.naturalWidth),null,{timeout:60000});
const result=await page.evaluate(()=>{lanesStart({champ:'nigromante',seed:42});state='paused';const props=aidProps.filter(p=>p.battlefield),snapshot=JSON.stringify(props),n=props.length,solids=aidSolids.length;
const clear=props.filter(p=>!p.noSolid).every(p=>[0,1,2].every(l=>laneProject(l,p.x,p.y).d>=270));
const mirror=props.filter(p=>!p.noSolid).every(p=>props.some(q=>Math.abs(q.x-(LANES.W-p.x))<.01&&Math.abs(q.y-(LANES.H-p.y))<.01));
const c=aidSolids[0],h={x:c.x,y:c.y,radius:20,classKey:'tanque'};lanesClamp(h);const collide=Math.hypot(h.x-c.x,h.y-c.y)>=c.r+15;
const N=AID_NAV,dist=new Uint16Array(N.W*N.H);aidNavBfs(dist,seed=>seed({...laneCrystalPos(0),alive:true}));const points=[...LANES_CAMPS,...LANES_EPICS,laneCrystalPos(1)];for(let l=0;l<3;l++)for(const t of [.1,.3,.5,.7,.9])points.push(lanePoint(l,LANES_PATHS[l].len*t));const reachable=points.every(p=>dist[aidNavCell(p.x,p.y)]<65535);
aidBuild();const repeatable=JSON.stringify(aidProps.filter(p=>p.battlefield))===snapshot;
return {n,solids,clear,mirror,collide,reachable,repeatable,assets:Object.keys(BATTLEFIELD_IMAGES).length,lazy:LAZY_IMG.deferredOn};});
await page.evaluate(()=>{const p=aidProps.find(p=>p.battlefield==='oak');player.x=p.x+100;player.y=p.y+60;render();});
await page.locator('#game').screenshot({path:out+'/gameplay.png'});
const contact=await page.evaluate(()=>{const cv=document.createElement('canvas');cv.width=1200;cv.height=1000;const old=ctx,arena=currentArena;currentArena='infernal';ctx=cv.getContext('2d');ctx.fillStyle='#29332e';ctx.fillRect(0,0,1200,1000);
Object.keys(BATTLEFIELD_HEIGHTS).forEach((key,i)=>{const x=150+i%4*300,y=215+Math.floor(i/4)*245;
 const e={type:key,x,y,fx:1,moving:false,animT:0,attackAnim:0};battlefieldDrawMonster(e);ctx.fillStyle='#fff';ctx.font='14px monospace';ctx.textAlign='center';ctx.fillText(key,x,y+23);});ctx=old;currentArena=arena;return cv.toDataURL();});
fs.writeFileSync(out+'/contact.png',Buffer.from(contact.split(',')[1],'base64'));
result.errors=errors;assert(result.n>100&&result.clear&&result.mirror&&result.collide&&result.reachable&&result.repeatable&&!errors.length);
fs.writeFileSync(out+'/'+(process.env.FALLBACK?'fallback':'battlefield-results')+'.json',JSON.stringify(result,null,2));console.log(result);
}finally{if(browser)await browser.close();srv.kill();}})().catch(e=>{console.error(e);process.exitCode=1;});
