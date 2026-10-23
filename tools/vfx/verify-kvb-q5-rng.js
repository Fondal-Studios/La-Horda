"use strict";
const H=require('../lib/serve'), fs=require('node:fs'),path=require('node:path');
(async()=>{const site=await H.startSite();const {chromium}=require('playwright');const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/tmp/chromium',args:['--no-sandbox']});let page;
try{page=await browser.newPage();await page.goto(site.url);await page.waitForFunction(()=>typeof startRun==='function'&&assetsAllReady());
const result=await page.evaluate(()=>{
 const checks=[],check=(name,ok,detail)=>checks.push({name,pass:!!ok,detail});
 const orig={rnd:Math.random,burst:vfxBurst,spray:vfxSpray,sprite:vfxSprite,shock:vfxShock};let calls=0,seed=123;
 const rng=()=>{calls++;seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const init=(k,mode)=>{KVB.off=true;Math.random=rng;calls=0;seed=123;netMatch=null;selectedClass=k;currentArena='bosque';lobbyAllies=[];startRun(3);state='playing';player.x=1200;player.y=1200;CAM_SUBJECT=player;player.fx=1;player.fy=0;runElapsedMs=1000;vCount=mode==='full'?720:mode==='near'?580:0;vfxLoad=mode==='low'?.3:1;JUICE.reduceFx=mode==='reduced';player._qualityFxBudget=[];calls=0;seed=123;};
 const snap=()=>({calls,seed,count:vCount,budget:player._qualityFxBudget,particles:Array.from({length:vCount},(_,j)=>[vX[j],vY[j],vVX[j],vVY[j],vLife[j],vMax[j],vSize[j],vGrav[j],vKind[j],vPrio[j],vCol[j]])});
 for(const k of ['solciju','veyra'])for(const mode of ['normal','reduced','low','near','full','culled','budget'])for(const type of ['fx','line','persistent']){
  const once=off=>{init(k,mode);KVB.off=off;const h=player,sk=h.cls.skills[type==='line'?1:0];KVB.q5=type==='persistent'?null:{h,sk,area:1,dur:1};const x=mode==='culled'?1e7:h.x,y=h.y;
   if(mode==='budget')h._qualityFxBudget=[{count:64,until:1900}];
   const args=type==='line'?['slash',x,y,x+140,y+60,30]:['water',x,y,85];
   qualityFiveFx(h,type==='line'?kitFxLine:kitFx,...args);qualityFiveFx(h,type==='line'?kitFxLine:kitFx,...args);return snap();};
  const off=once(true),on=once(false);check(k+':'+mode+':'+type,JSON.stringify(off)===JSON.stringify(on),{callsOff:off.calls,callsOn:on.calls,countOff:off.count,countOn:on.count});
 }
 // Unknown action, other champion, and unrelated draw callbacks retain the original path.
 for(const which of ['unknown','other','callback']){
  const once=off=>{init(which==='other'?'tanque':'solciju','normal');KVB.off=off;KVB.q5={h:player,sk:{action:'missing'},area:1,dur:1};if(which==='callback')qualityFiveFx(player,()=>vfxBurst(player.x,player.y,4,'spark',50,100,2,1));else qualityFiveFx(player,kitFx,'water',player.x,player.y,80);return snap();};check('passthrough:'+which,JSON.stringify(once(true))===JSON.stringify(once(false)));
 }
 let caught=false;try{kvbKeepQ5Particles(()=>{throw Error('intentional');});}catch(e){caught=e.message==='intentional';}
 check('restore-on-throw',caught&&vfxSprite===orig.sprite&&vfxShock===orig.shock&&vfxBurst===orig.burst&&vfxSpray===orig.spray);
 let nested=false;kvbKeepQ5Particles(()=>{const inner=vfxSprite;kvbKeepQ5Particles(()=>{});nested=vfxSprite===inner;});check('nested-restore',nested&&vfxSprite===orig.sprite&&vfxShock===orig.shock);
 // The existing host event wrapper still records particles, not generic sprite/shock.
 init('solciju','normal');KVB.off=false;KVB.q5={h:player,sk:player.cls.skills[0],area:1,dur:1};_netEvents=[];netMatch={role:'host',recording:true};
 qualityFiveFx(player,kitFx,'water',player.x,player.y,85);const names=_netEvents.map(e=>e[0]);
 check('host-delivery',names.includes('vfxBurst')&&names.includes('kvbFx')&&!names.includes('vfxSprite'),names);
 check('wrappers-restored',vfxBurst===orig.burst&&vfxSpray===orig.spray&&vfxSprite===orig.sprite&&vfxShock===orig.shock);
 state='menu';netMatch=null;KVB.q5=null;KVB.off=false;Math.random=orig.rnd;
 return {checks,pass:checks.every(c=>c.pass),scope:'Real emitters: RNG + particle arrays + owner budget across culling/load/reduced/full pools; host event queue; restoration'};
});const out=process.env.OUT;if(out)fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));if(!result.pass)process.exitCode=1;
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
