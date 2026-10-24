'use strict';
const fs=require('node:fs'),H=require('../lib/serve');
const OUT=process.env.OUT||'art-source/entregas/brakk-kit-20261022/correccion-08';
(async()=>{const site=await H.startSite(),browser=await H.launch();try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await H.goto(page,site.url+'/');await page.waitForFunction(()=>assetsAllReady());
 const result=await page.evaluate(canary=>{
  loop=()=>{};selectedClass='brakk';currentArena='bosque';lobbyAllies=[];startRun(3);state='menu';sfaReset();portadorObjects=[];
  const checks=[],check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
  const h=player;heroes=[h];h.alive=true;runElapsedMs=1000;h._kitArmorUntil=4000;
  const profile=window.kitArmorVisualOpacity;if(canary)window.kitArmorVisualOpacity=()=>0;
  const origCtx=ctx,cv=document.createElement('canvas');cv.width=300;cv.height=300;ctx=cv.getContext('2d');h.x=150;h.y=150;
  const aura={art:'aura',theme:'brakk_repair',fi:0,x:150,y:150,r:24,t:1500,dur:3000};
  const install=()=>{sfaPool.length=0;sfaPool.push({...aura});sfaBake('aura','brakk_repair',0);window.SFA_OFF=false;};
  let strokes=[];const stroke=ctx.stroke.bind(ctx);ctx.stroke=function(){if(this.strokeStyle==='#bfe8ff')strokes.push(this.globalAlpha);return stroke();};
  const sample=()=>{strokes=[];drawPortadorTop();return strokes.at(-1);};
  const base=.55+.2*Math.sin(runElapsedMs/200),near=(a,b)=>Math.abs(a-b)<1e-6;
  check('no event keeps armor ring',near(sample(),base));
  install();check('actual mature aura replaces only generic armor ring',near(sample(),0));
  install();sfaPool[0].t=150;check('anticipation crossfade',near(sample(),base*.5));
  install();sfaPool[0].t=2700;check('dissipation returns generic ring',near(sample(),base*.5));
  for(const [name,edit]of [
   ['expired',()=>sfaPool[0].t=3000],['delayed',()=>sfaPool[0].t=-20],['other recipient',()=>sfaPool[0].fi=1],['ownerless',()=>sfaPool[0].fi=-1],
   ['other theme',()=>sfaPool[0].theme='siege'],['other art',()=>sfaPool[0].art='burst'],['off',()=>window.SFA_OFF=true],
   ['cold cache',()=>sfaCache.clear()],['wrong dimensions',()=>sfaCache.get('aura|brakk_repair|0|0|'+sfaArenaKey()).w=40],
   ['arena change',()=>currentArena='hielo'],['reset',()=>sfaReset()],['invalid phase',()=>sfaPool[0].t=NaN]
  ]){currentArena='bosque';sfaCache.clear();install();edit();check(name+' falls back',near(kitArmorRingOpacity(h),1));}
  currentArena='bosque';sfaCache.clear();install();JUICE.reduceFx=true;check('reduced effects preserves real aura coverage',near(kitArmorRingOpacity(h),0));JUICE.reduceFx=false;
  for(const v of ['','~h','~p','~k']){install();sfaPool[0].theme='brakk_repair'+v;sfaBake('aura','brakk_repair'+v,0);check('variant '+v+' matches receiver',near(kitArmorRingOpacity(h),0));}
  install();h._kitArmorUntil=runElapsedMs;check('cleansed buff cannot claim coverage',near(kitArmorRingOpacity(h),1));check('cleanse draws no generic ring',sample()===undefined);
  h._kitArmorUntil=9000;install();sfaPool[0].t=3000;check('longer unrelated armor stays visible after brace',near(kitArmorRingOpacity(h),1));
  install();h.alive=false;check('dead receiver no coverage',near(kitArmorRingOpacity(h),1));check('dead receiver no ring',sample()===undefined);h.alive=true;
  install();for(let i=0;i<50;i++)sfaPush('burst','siege',h.x,h.y,24,0,400);check('pool eviction restores ring',near(kitArmorRingOpacity(h),1));
  for(const [name,fn]of [['missing',undefined],['throwing',()=>{throw Error('test');}],['NaN',()=>NaN],['too high',()=>2]]){window.kitArmorVisualOpacity=fn;check(name+' hook fails open',near(kitArmorRingOpacity(h),1));}
  window.kitArmorVisualOpacity=canary?()=>0:profile;install();sfaPool.push({...aura,t:100,fi:1});const snapshot=JSON.stringify({pool:sfaPool,h:[h.hp,h._kitArmorUntil,h._kitArmorPct]});let rng=0;const random=Math.random;Math.random=()=>{rng++;return .5;};
  const times=[];for(let j=0;j<600;j++){const a=performance.now();for(let i=0;i<40;i++)kitArmorRingOpacity(h);times.push(performance.now()-a);}Math.random=random;
  check('profile does not consume RNG',rng===0,rng);check('profile leaves pool and mechanical state intact',snapshot===JSON.stringify({pool:sfaPool,h:[h.hp,h._kitArmorUntil,h._kitArmorPct]}));
  times.sort((a,b)=>a-b);ctx=origCtx;return {checks,performance:{batches:600,queriesPerBatch:40,p50:times[300],p95:times[570],max:times.at(-1),note:'local browser, not physical mobile or GC certification'}};
 },!!process.env.CANARY);
 fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(OUT+'/armor-verification.json',JSON.stringify({...result,errors},null,2)+'\n');console.log(JSON.stringify({checks:result.checks.length,failed:result.checks.filter(x=>!x.pass),errors,performance:result.performance}));if(errors.length||result.checks.some(x=>!x.pass))process.exitCode=1;
 }finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
