'use strict';
// Actual cast entry points plus explicitly synthetic renderer-boundary probes.
const fs=require('fs'),H=require('../lib/serve');
const OUT=process.env.OUT||'art-source/entregas/musashi-kit-20261026/cierre-03';
(async()=>{const site=await H.startSite(),b=await H.launch(),rows=[],errors=[];try{
 for(const off of [false,true]){
  const p=await b.newPage({viewport:{width:844,height:390}});p.on('pageerror',e=>errors.push(e.message));
  await p.goto(site.url+'/?lazy=0'+(off?'&uf=0':''));await p.waitForFunction(()=>assetsAllReady()&&CHAMP_PACK.musashi?.ready);
  rows.push(...await p.evaluate(off=>{
   loop=()=>{};netMatch=null;selectedClass='musashi';currentArena='bosque';lobbyAllies=[];
   for(const c of Object.values(save.champions)){Object.assign(c,{unlocked:true,level:20,equipment:{},inventory:[],talents:{nodes:{},mastery:null,masteryNodes:{}}});for(const m of c.skillMastery)m.alloc=0;}
   startRun(1);state='playing';enemies=[];spawnTimer=arenaHazardTimer=1e9;
   document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
   const out=[],check=(name,ok,data={})=>out.push({off,name,ok,...data});
   const e=spawnEnemy('esqueleto');Object.assign(e,{x:player.x+80,y:player.y,hp:1e9,maxHp:1e9,speed:0,baseSpeed:0,dmg:0});
   const original=kvbFx,events=[];kvbFx=function(...a){if(a[0]==='uf.musashi.2')events.push(a);return original(...a);};
   const casts=()=>{player.energy=1e5;player.cds=[0,0,0];return useSkill(2,{x:e.x,y:e.y,dx:1,dy:0});};
   const count=()=>KVB.pool.filter(e=>[...UF.cache.entries()].some(([k,v])=>k.startsWith('musashi.2')&&v.frames===e.frames)).length;
   kvbReset();sfaPool.length=0;casts();
   check('actual cast dispatch',off?events.length===0&&sfaPool.some(s=>s.theme.startsWith('ink')):events.length===1&&count()===1,{events:events.map(a=>a.slice(0,4)),fallback:sfaPool.map(s=>({theme:s.theme,r:s.r}))});
   events.length=0;player.fused=true;casts();player.fused=false;check('fused rejected no extra H3 event',events.length===0);
   axiomFreezeTimer=1000;axiomFreezeCaster={};casts();axiomFreezeTimer=0;axiomFreezeCaster=null;check('frozen rejected no extra H3 event',events.length===0);
   e.alive=false;casts();check('no live target no extra H3 event',events.length===0);e.alive=true;
   player.alive=false;casts();check('dead useSkill rejected',events.length===0);player.alive=true;
   if(!off){
    kvbReset();casts();kvbUpdate(128);casts();check('recast two independent bounded events',count()===2&&events.length===2);
    player.x+=100;player.alive=false;kvbUpdate(332);check('first expires at 460 while second remains',count()===1);kvbUpdate(128);check('second expires at 460 despite owner death/movement',count()===0);player.alive=true;
    // Synthetic sk.radius values exercise the existing visual cap without claiming reachable builds.
    for(const radius of [419,420,421,600]){
     kvbReset();events.length=0;const sk={...player.cls.skills[2],radius};castAbility(player,sk,false,2);
     const g=musashiThousandGeometry({rec:SFA_REC}),v=events[0];
     check('synthetic radius '+radius,!!g&&Math.abs(g.r-radius)<1e-8&&v?.[3]===radius&&count()===1,{geometry:g,visualRadius:v?.[3]});
    }
    kvbReset();const ent=ufPlay('musashi.2',player.x,player.y,420,0)[0];ent.t=128;
    const di=ctx.drawImage,view=inView;let draws=0;ctx.drawImage=function(...a){draws++;return di.apply(this,a);};
    inView=()=>false;kvbDrawLayer('t');check('renderer culls rejected viewport',draws===0);
    inView=()=>true;kvbDrawLayer('t');check('renderer accepts visible viewport',draws===1);inView=view;ctx.drawImage=di;
    const baked=UF.stats.baked;ufPlay('musashi.2',player.x,player.y,420,0);check('warm cache does not rebake',UF.stats.baked===baked);
    let partial=0,edge=0;for(const bucket of [32,56,72]){const a=ufBake('musashi.2','t',bucket);for(const c of a.frames){const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const alpha=d[(y*c.width+x)*4+3];if(alpha&&alpha!==255)partial++;if(alpha&&(x===0||y===0||x===c.width-1||y===c.height-1))edge++;}}}
    check('72 native frames binary alpha and clear edges',partial===0&&edge===0,{partial,edge});
   }
   kvbFx=original;return out;
  },off));await p.close();
 }
 fs.writeFileSync(OUT+'/LIFECYCLE.json',JSON.stringify({scope:'Actual useSkill rejection/recast; synthetic copied skill radii419..600 and forced inView predicates are explicit boundary probes, not reachable build or actual screen-edge certification.',rows,errors},null,2));
 console.log({checks:rows.length,failed:rows.filter(r=>!r.ok),errors});if(errors.length||rows.some(r=>!r.ok))process.exitCode=1;
 }finally{await b.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1});
