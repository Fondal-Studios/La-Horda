'use strict';
// Actual atlas/consumer checks for B168; no approval of compound combat art.
const fs=require('node:fs'),H=require('../lib/serve');
const OUT=process.env.OUT||'art-source/entregas/morveth-kit-20261022/correccion-02';
(async()=>{const site=await H.startSite(),browser=await H.launch();try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await H.goto(page,site.url);await H.waitFor(page,()=>typeof morvethFxStrip==='function'&&assetsAllReady());
 const r=await page.evaluate(()=>{
 const checks=[],metrics=[];const check=(name,pass,details)=>checks.push({name,pass:!!pass,details});
 selectedClass='morveth';currentArena='bosque';lobbyAllies=[];startRun(3);state='menu';enemies=[];
 for(const arena of ['bosque','hielo','infernal','laberinto','acuatica','minas'])for(const v of ['','~h','~p']){
  currentArena=arena;const b=sfaBake('aura','morveth_symbiosis'+v,0),g=b.cv.getContext('2d');let edge=0,soft=0,central=0;const counts=[];
  for(let f=0;f<b.n;f++){const d=g.getImageData(f*b.w,0,b.w,b.h).data;let opaque=0;for(let y=0;y<b.h;y++)for(let x=0;x<b.w;x++){const i=(y*b.w+x)*4,a=d[i+3];if(!a)continue;opaque++;if(a!==255)soft++;if(x===0||y===0||x===b.w-1||y===b.h-1)edge++;if(x>=19&&x<=28&&y<40)central++;}counts.push(opaque);}
  check('padded opaque atlas / open torso '+arena+v,b.w===48&&b.h===56&&b.n===18&&edge===0&&soft===0&&central===0&&counts.every(n=>n>0),{edge,soft,central,counts});
  check('cached same atlas '+arena+v,b===sfaBake('aura','morveth_symbiosis'+v,0));
  metrics.push({arena,variant:v,frames:b.n,opaque:counts});
 }
 currentArena='bosque';const cv=document.createElement('canvas');cv.width=300;cv.height=200;const g=cv.getContext('2d'),draw=g.drawImage;let calls=[];
 g.drawImage=function(...a){calls.push(a);return draw.apply(this,a);};const s={art:'aura',theme:'morveth_symbiosis~p',x:0,y:0,r:25,t:1000,dur:3000,fi:heroes.indexOf(player)};
 player.alive=true;player.x=120;player.y=150;sfaDrawOne(s,g);const b=sfaBake('aura',s.theme,0);
 check('real consumer draws corrected atlas',calls.length===1&&calls[0][0]===b.cv&&calls[0][3]===48&&calls[0][4]===56,{rect:calls[0]?.slice(1)});
 player.x+=17;player.y-=9;sfaDrawOne(s,g);check('consumer follows live owner',calls[1][5]-calls[0][5]===17&&calls[1][6]-calls[0][6]===-9);
 const n=calls.length;player.alive=false;sfaDrawOne(s,g);check('death suppresses aura immediately',calls.length===n&&s.t===s.dur);player.alive=true;
 for(const t of [-1,3000,3100]){s.t=t;sfaDrawOne(s,g);}check('delay/end draws no stale atlas',calls.length===n);
 for(const reduce of [false,true]){JUICE.reduceFx=reduce;s.t=1000;sfaDrawOne(s,g);check('reduced mode retains finite alpha '+reduce,Number.isFinite(g.globalAlpha)&&g.globalAlpha>0&&g.globalAlpha<=1);}
 sfaReset();sfaPush('aura',s.theme,player.x,player.y,25,0,3000,0,0,24,s.fi);check('reset clears aura pool',(sfaReset(),sfaPool.length===0));
 return{checks,metrics};
 });
 const status=errors.length||r.checks.some(x=>!x.pass)?'FAIL':'PASS';fs.writeFileSync(OUT+'/contact-tests.json',JSON.stringify({status,...r,errors},null,2)+'\n');console.log(JSON.stringify({status,checks:r.checks.length,failed:r.checks.filter(x=>!x.pass),errors}));if(status==='FAIL')process.exitCode=1;
 }finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
