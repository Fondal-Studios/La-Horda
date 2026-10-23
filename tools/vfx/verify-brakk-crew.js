'use strict';
// Real crew talent/cast, exact recipients and draw-follow. Does not approve art.
const fs=require('node:fs'),H=require('../lib/serve');
const OUT=process.env.OUT||'art-source/entregas/brakk-kit-20261022/validacion-10';
(async()=>{const site=await H.startSite(),browser=await H.launch();try{const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await H.goto(page,site.url+'/');await page.waitForFunction(()=>assetsAllReady());
const result=await page.evaluate(canary=>{
 loop=()=>{};netMatch=null;currentArena='bosque';selectedClass='brakk';lobbyAllies=['tanque','soporte','mago'];
 for(const s of Object.values(save.champions))Object.assign(s,{unlocked:true,level:60,equipment:{},talents:{nodes:{},mastery:null,masteryNodes:{}}});save.champions.brakk.talents.nodes.brakk_t2transform=1;invalidatePassiveCache();startRun(3);state='menu';enemies=[];
 const checks=[],check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});check('four real heroes',heroes.length===4,heroes.map(h=>h.classKey));check('crew talent resolves',brakkFlag(player,2,'crew'));
 const setup=()=>{runElapsedMs=1000;sfaReset();portadorObjects=[];heroes.forEach((h,i)=>Object.assign(h,{x:i*24,y:0,alive:true,fused:false,team:1,_kitArmorUntil:0,_kitArmorPct:0,energy:1e4,cds:[0,0,0]}));};
 const cast=()=>castAbility(player,player.cls.skills[2],false,2);
 const events=()=>sfaPool.filter(s=>s.art==='aura'&&s.theme.startsWith('brakk_repair'));
 const cv=document.createElement('canvas');cv.width=1000;cv.height=1000;const g=cv.getContext('2d'),draw=g.drawImage.bind(g);let calls=[];g.drawImage=function(im,...a){if(canary&&heroes[2]&&Math.abs(a[4]-(heroes[2].x-28.8))<1e-6)return;calls.push(a);return draw(im,...a);};
 const render=(s)=>{calls=[];s.t=Math.min(1000,s.dur/2);sfaDrawOne(s,g);return calls;};
 for(const [name,mutate,want]of [['all',()=>{},[0,1,2,3]],['out of range',()=>heroes[3].x=1000,[0,1,2]],['dead',()=>heroes[3].alive=false,[0,1,2]],['fused',()=>heroes[3].fused=true,[0,1,2]],['opposing team',()=>heroes[3].team=2,[0,1,2]]]){
  setup();mutate();cast();const got=events().map(s=>s.fi).sort(),buff=heroes.flatMap((h,i)=>h._kitArmorUntil>runElapsedMs?[i]:[]);
  check(name+' mechanics select recipients',JSON.stringify(buff)===JSON.stringify(want),{buff,want});check(name+' visual recipients match mechanics',JSON.stringify(got)===JSON.stringify(buff),got);
 }
 setup();cast();const es=events();for(const s of es){const h=heroes[s.fi],dur=h._kitArmorUntil-runElapsedMs;check('receiver '+s.fi+' duration',s.dur===dur,{event:s.dur,buff:dur});h.x+=37;h.y-=19;const c=render(s),a=c.at(-1),sc=24/20;check('receiver '+s.fi+' renderer follows current position',c.length===1&&Math.abs(a[4]-(h.x-48*sc/2))<1e-6&&Math.abs(a[5]-(h.y+8*sc-56*sc))<1e-6,{calls:c.length,xy:a?.slice(4,6),hero:[h.x,h.y]});check('receiver '+s.fi+' own ring crossfade',kitArmorRingOpacity(h)===0);}
 const foreign=heroes[3];sfaPool.splice(sfaPool.indexOf(es[3]),1);check('missing one event restores only that receiver ring',kitArmorRingOpacity(foreign)===1&&kitArmorRingOpacity(heroes[1])===0);
 heroes[1].alive=false;const dead=render(es[1]);check('dead receiver stops atlas draw',dead.length===0&&es[1].t===es[1].dur);
 setup();cast();runElapsedMs=1500;player.cds[2]=0;cast();check('recast retains original IDs and bounded recipient indices',events().length===8&&events().every(s=>s.fi>=0&&s.fi<4),events().map(s=>s.fi));
 const snap=JSON.stringify({pool:sfaPool,buffs:heroes.map(h=>[h._kitArmorUntil,h._kitArmorPct,h.hp])});let rng=0;const rnd=Math.random;Math.random=()=>{rng++;return .5;};for(const s of events()){s.t=0;}const before=JSON.stringify({pool:sfaPool,buffs:heroes.map(h=>[h._kitArmorUntil,h._kitArmorPct,h.hp])});for(let i=0;i<100;i++)for(const h of heroes)kitArmorRingOpacity(h);Math.random=rnd;check('crew opacity query consumes no RNG',rng===0);check('crew opacity query leaves pool/buffs unchanged',before===JSON.stringify({pool:sfaPool,buffs:heroes.map(h=>[h._kitArmorUntil,h._kitArmorPct,h.hp])}));
 sfaReset();check('reset removes all crew events',events().length===0&&heroes.every(h=>kitArmorRingOpacity(h)===1));return{checks};
},!!process.env.CANARY);
fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(OUT+'/crew-verification.json',JSON.stringify({...result,errors},null,2)+'\n');console.log(JSON.stringify({checks:result.checks.length,failed:result.checks.filter(c=>!c.pass),errors}));if(errors.length||result.checks.some(c=>!c.pass))process.exitCode=1;
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
