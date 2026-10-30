'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const H=require('../lib/serve');
const OUT=path.join(H.ROOT,'docs/art-gate/arena-world-20261029');
(async()=>{
 const site=await H.startSite(),browser=await H.launch();
 const report={checks:[],errors:[],requests:[],renderMs:{}};
 const check=(name,ok,detail)=>{report.checks.push({name,ok,detail});assert.ok(ok,name+' '+JSON.stringify(detail));};
 fs.mkdirSync(OUT,{recursive:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('request',r=>{if(r.url().includes('/world-v1/'))report.requests.push(r.url().split('/').pop());});
  await H.goto(page,site.url+'/?lazy=1');
  await page.waitForFunction(()=>typeof arenaWorldDraw==='function' && typeof startRun==='function');
  await page.evaluate(()=>{loop=function(){};save.arenasCleared=Object.fromEntries(ARENA_ORDER.map(k=>[k,true]));save.starterChosen=true;selectedClass='tanque';lobbyAllies=[];netMatch=null;});
  check('no biome atlas downloaded on title',report.requests.length===0,report.requests);
  for(const arena of ['hielo','bosque']){
   await page.evaluate(a=>{currentArena=a;startRun(3);setState('playing');for(const h of heroes)h.hp=h.maxHp=1e7;for(let t=0;t<6000;t+=40)update(40);state='paused';arenaTitleCardHide();for(const id of ['hud','controls','pause-btn','mute-btn','tut-panel','boss-hud','center-banner','arena-title-card','boss-intro','run-intro']){const el=document.getElementById(id);if(el)el.style.visibility='hidden';}},arena);
   await page.waitForFunction(a=>arenaWorldReady(a),arena);
   await page.waitForFunction(()=>assetsAllReady());
   const result=await page.evaluate(a=>{
    const pack=ARENA_WORLD_PACKS[a],meta=ARENA_WORLD_MANIFEST[a],c=document.createElement('canvas');c.width=384;c.height=384;
    const g=c.getContext('2d'),saved=ctx,frames={};
    for(const key of Object.keys(meta.frames)){
     g.clearRect(0,0,384,384);ctx=g;arenaWorldDraw(a,key,192,370,300);ctx=saved;
     const d=g.getImageData(0,0,384,384).data;let n=0,hash=2166136261;
     for(let i=0;i<d.length;i++){hash=Math.imul(hash^d[i],16777619);if(i%4===3&&d[i])n++;}
     frames[key]={pixels:n,hash:hash>>>0};
    }
    const snap=()=>JSON.stringify({net:arenaHook('netState'),solids:aidSolids,hero:heroes.map(h=>[h.hp,h.x,h.y,h._cold]),particles:particles.length});
    const before=snap(),t=performance.now();for(let i=0;i<40;i++)render();const elapsed=performance.now()-t;
    const unchanged=before===snap();
    const state=arenaHook('netState');arenaHook('guestStart');arenaHook('applyNetState',state);
    const roundtrip=JSON.stringify(arenaHook('netState'))===JSON.stringify(state);
    return {ready:pack.ready,frames,unchanged,roundtrip,ms:elapsed/40,keys:aidProps.filter(p=>p.img?._arenaArtKey).map(p=>p.img._arenaArtKey)};
   },arena);
   check(arena+' all 16 frames contain visible art',Object.keys(result.frames).length===16&&Object.values(result.frames).every(f=>f.pixels>100),result.frames);
   check(arena+' render does not change events, geometry, hp or particles',result.unchanged);
   check(arena+' host state roundtrip through guest handlers',result.roundtrip);
   const anim=arena==='hielo'?['fire0','fire1','fire2','fire3']:['bush0','bush1','bush2','bush3'];
   check(arena+' four distinct animation frames',new Set(anim.map(k=>result.frames[k].hash)).size===4);
   if(arena==='bosque') check('east arch has solid feet and an open passage',await page.evaluate(()=>{
    const walk=(x,y)=>{const e={x,y,radius:4};resolveWallCollision(e);return Math.hypot(e.x-x,e.y-y)<1;};
    return !walk(488,-298)&&!walk(590,-298)&&walk(540,-298);
   }));
   report.renderMs[arena]=result.ms;
   // Compare the same loaded scene and event state, with only this new renderer
   // disabled for the before view. Do not confuse unloaded assets with old art.
   await page.evaluate(()=>{window.__awFns=[arenaWorldDraw,arenaWorldReady];arenaWorldDraw=()=>false;arenaWorldReady=()=>false;render();});
   await page.screenshot({path:path.join(OUT,'before-'+arena+'.png')});
   await page.evaluate(()=>{[arenaWorldDraw,arenaWorldReady]=window.__awFns;render();});
   await page.screenshot({path:path.join(OUT,'after-'+arena+'.png')});
   // Event states are staged using their existing synchronized state fields.
   await page.evaluate(a=>{
    enemies.length=0;projectiles.length=0;hazardZones.length=0;for(const f of floatTexts)f.on=false;
    if(a==='hielo'){HIE.br.forEach((b,i)=>Object.assign(b,{lit:i<2,fuel:i===0?30000:3000,prog:i===3?1000:0}));}
    else {BOS.runes.forEach((r,i)=>Object.assign(r,{st:['ctrl','arming','corrupt','sealed'][i],arm:.65,t:4000}));BOS.amb=[{id:99,x:100,y:80,t:1200,seed:5}];}
    render();
   },arena);
   await page.screenshot({path:path.join(OUT,'events-'+arena+'.png')});
   await page.setViewportSize({width:844,height:390});await page.evaluate(()=>render());
   await page.screenshot({path:path.join(OUT,'mobile-'+arena+'.png')});
   await page.setViewportSize({width:1280,height:800});
   // Compare authored props with the actual champion scale, including trees at the edge.
   const board=await page.evaluate(a=>{
    const c=document.createElement('canvas');c.width=1200;c.height=900;const g=c.getContext('2d'),saved=ctx;ctx=g;
    g.fillStyle=a==='hielo'?'#344c65':'#304b35';g.fillRect(0,0,1200,900);
    const items=a==='hielo'?[['pillar',150],['shards',150],['rock',80],['cluster',72],['tree',225],['pine',225],['statue',130],['gate',190],['fire0',96],['low',96],['off',96],['ignite1',96]]:[['oak',240],['magic',240],['ancient',240],['rock',72],['ctrl',85],['arming',85],['active',85],['corrupt',85],['sealed',85],['bush0',48],['bush2',48],['bush3',48]];
    for(let i=0;i<items.length;i++){const [key,h]=items[i],x=150+(i%4)*300,y=260+Math.floor(i/4)*290;arenaWorldDraw(a,key,x,y,h);g.fillStyle='#e7edf0';g.font='15px monospace';g.textAlign='center';g.fillText(key,x,y+20);}
    ctx=saved;return c.toDataURL('image/png');
   },arena);
   fs.writeFileSync(path.join(OUT,'sprites-'+arena+'.png'),Buffer.from(board.split(',')[1],'base64'));
  }
  check('only the two active biome atlases requested',new Set(report.requests).size===2,report.requests);
  const fallback=await browser.newPage();
  fallback.on('pageerror',e=>report.errors.push(e.message));
  await fallback.route('**/world-v1/*.png',r=>r.abort());
  await H.goto(fallback,site.url+'/?lazy=1');
  await fallback.waitForFunction(()=>typeof startRun==='function');
  await fallback.evaluate(()=>{loop=function(){};save.arenasCleared={hielo:true,bosque:true};currentArena='hielo';selectedClass='tanque';lobbyAllies=[];startRun(1);state='paused';});
  await fallback.waitForFunction(()=>ARENA_WORLD_PACKS.hielo?.failed);
  check('missing atlas falls back to old renderer',await fallback.evaluate(()=>{render();return !arenaWorldDrawProp(aidProps[0],0)&&aidProps.every(p=>p.img&&p.img.width>0);}));
  check('no runtime exceptions',report.errors.length===0,report.errors);
 }finally{
  fs.writeFileSync(path.join(OUT,'runtime-tests.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));await browser.close();await site.close();
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
