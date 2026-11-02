'use strict';
// Authored-animation adapter regression tests. No network, browser, or paid provider.
const assert=require('node:assert/strict'), fs=require('node:fs'), vm=require('node:vm'), path=require('node:path');
const ROOT=path.resolve(__dirname,'../../..');
const code=fs.readFileSync(path.join(ROOT,'js/arenas/micelial/mic-render.js'),'utf8');
const sandbox={Image:class{},VFX_SPR_EXTRA:{},MIC_CFG:{madre:{closeMs:2600}},console};
vm.createContext(sandbox); vm.runInContext(code,sandbox);
const frame=(e={},m={st:'fight'},t=0)=>sandbox._micMotherFrame(e,m,t);
let pass=0;const check=(name,fn)=>{fn();pass++;console.log('PASS',name)};
check('canonical atlas metadata matches shipped manifest',()=>{
 const expected=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/sprites/arenas/micelial/meta.json'))).atlas.madre_espora;
 const actual=vm.runInContext('MIC_MOTHER_ANIM',sandbox);
 for(const k of ['w','h','cols','anchor'])assert.equal(actual[k],expected[k]);
 for(const k of ['idle','atk','cast','trans','bloom','open','heart','death'])assert.deepEqual([...actual[k]],expected.sets[k]);
});
check('idle has three genuinely distinct source frames',()=>assert.deepEqual([0,300,600,900,1200].map(t=>frame({}, {st:'fight'},t).frame),[9,10,11,10,9]));
check('sleep and stir never show the full boss early',()=>{for(const st of ['sleep','stir'])assert.equal(frame({}, {st},5000).alpha,0)});
check('reveal stays hidden before 1500ms',()=>assert.equal(frame({}, {st:'reveal',t:1200}).rise,0));
check('reveal completes once and holds endpoint',()=>{assert.equal(frame({}, {st:'reveal',t:9000}).frame,9);assert.equal(frame({}, {st:'reveal',t:9000}).rise,1)});
check('phase closing advances despite refreshed pack timer',()=>assert.deepEqual([0,1000,2000,3100].map(t=>frame({packSet:'trans',packTimer:400,packDur:400},{st:'fight',tr:{to:2,t}}).frame),[15,16,17,17]));
check('heart opening advances without looping endpoint',()=>assert.deepEqual([0,1000,2000,3100].map(t=>frame({}, {st:'fight',tr:{to:3,t}}).frame),[12,13,14,14]));
check('root claw holds anticipation until actual wind resolves',()=>{
 assert.equal(frame({packSet:'atk',packDur:1500,packTimer:1490,bossWind:{t:10,dur:1000}}).frame,0);
 assert.equal(frame({packSet:'atk',packDur:1500,packTimer:510,bossWind:{t:990,dur:1000}}).frame,1);
 assert.equal(frame({packSet:'atk',packDur:1500,packTimer:490}).frame,2);
 assert.equal(frame({packSet:'atk',packDur:1500,packTimer:250}).frame,1);
 assert.equal(frame({packSet:'atk',packDur:1500,packTimer:10}).frame,9);
});
check('spore shot uses ranged pose rather than false root slash',()=>assert.equal(frame({packSet:'atk',packDur:700,packTimer:690}).frame,5));
check('cast returns to neutral without a second attack',()=>assert.equal(frame({packSet:'cast',packDur:1200,packTimer:20}).frame,10));
check('phase3 attacks retain open-heart body',()=>assert.equal(frame({packSet:'atk',packDur:1500,packTimer:490},{st:'fight',heart:1}).frame,14));
check('phase2 attacks retain bloom body',()=>assert.equal(frame({packSet:'atk',packDur:1500,packTimer:490},{st:'fight',bloom:1}).frame,3));
check('phase2 impact and recovery use different evolved poses',()=>{
 const M={st:'fight',bloom:1};
 assert.equal(frame({packSet:'atk',packDur:1500,packTimer:510,bossWind:{t:990,dur:1000}},M).frame,17);
 assert.equal(frame({packSet:'atk',packDur:1500,packTimer:490},M).frame,3);
 assert.equal(frame({packSet:'atk',packDur:1500,packTimer:20},M).frame,17);
});
check('phase3 idle uses authored heart frames',()=>assert.equal(frame({}, {st:'fight',heart:1},240).frame,14));
check('cutting network exposes heart before phase3',()=>assert.equal(frame({}, {st:'fight',ph:1,net:{st:'open'}},240).state,'heart'));
check('ordinary idle has no false open heart',()=>assert.equal(frame({}, {st:'fight',ph:1,net:{st:'net'}},240).state,'idle'));
check('phase2 blooms in actual authored frames',()=>assert.equal(frame({}, {st:'fight',bloom:1},380).frame,3));
check('stun cancels misleading attack visual',()=>assert.equal(frame({stunTimer:200,packSet:'atk',packTimer:400,packDur:1500}).state,'stunned'));
check('death follows existing 4700/6600/9000ms milestones',()=>assert.deepEqual([0,4699,4700,6599,6600,9000].map(t=>frame(null,{st:'dying',t}).frame),[18,18,6,6,7,7]));
check('death does not loop or leave a corpse indefinitely',()=>{assert.equal(frame(null,{st:'dying',t:9000}).alpha,0);assert.equal(frame(null,{st:'dead',t:0}).alpha,0)});
check('late-join pose equals host pose from same snapshot',()=>{
 const e={packSet:'atk',packTimer:700,packDur:1500,bossWind:{t:800,dur:1000}},m={st:'fight',ph:2,bloom:1};
 assert.deepEqual(frame(e,m,14000),frame(JSON.parse(JSON.stringify(e)),JSON.parse(JSON.stringify(m)),14000));
});
check('same game time and snapshot keeps paused pose unchanged',()=>assert.deepEqual(frame({}, {st:'fight'},1200),frame({}, {st:'fight'},1200)));
check('renderer never mutates entity or encounter state',()=>{
 const e=Object.freeze({packSet:'cast',packTimer:600,packDur:1200}),m=Object.freeze({st:'fight',tr:Object.freeze({to:3,t:1200})});frame(e,m,1000);
 assert.equal(e.packTimer,600);assert.equal(m.tr.t,1200);
});
check('all selected indices remain in 19 authored cells',()=>{
 for(const st of ['sleep','stir','reveal','fight','dying','dead'])for(let t=0;t<12000;t+=29){const p=frame({}, {st,t},t);assert(p.frame>=0&&p.frame<19);assert(p.alpha>=0&&p.alpha<=1);assert(p.rise>=0&&p.rise<=1)}
});
check('portrait fallback remains when atlas missing/malformed',()=>{
 assert.equal(sandbox._micMotherAtlasReady(),false);
 vm.runInContext('MIC_MP.mp_atlas={width:1,height:1};MIC_MP_OK.mp_atlas=true',sandbox);assert.equal(sandbox._micMotherAtlasReady(),false);
 vm.runInContext('MIC_MP.mp_atlas={width:1360,height:417}',sandbox);assert.equal(sandbox._micMotherAtlasReady(),true);
});
check('phase3 cosmetic heartbeat no longer overwrites action',()=>{
 const mother=fs.readFileSync(path.join(ROOT,'js/arenas/micelial/mic-mother.js'),'utf8');
 const ctx={micS:{mo:{st:'fight',ph:3,beat:900}},MIC_CFG:{madre:{}},heroes:[],runElapsedMs:1000,
 _micBossPack:(e,set,ms)=>Object.assign(e,{packSet:set,packTimer:ms,packDur:ms})};
 vm.createContext(ctx);vm.runInContext(mother,ctx);
 const e={_ax:0,_ay:125,packSet:'atk',packTimer:600,packDur:1500,mcd:1000};
 ctx.micAIMadre(e,16,{},500);assert.equal(e.packSet,'atk');assert.equal(e.packTimer,600);
 e.packTimer=0;ctx.micAIMadre(e,16,{},500);assert.equal(e.packSet,'heart');
});
check('Madre camera fits all authored phases and player below HUD at close/mid range',()=>{
 const cv=fs.readFileSync(path.join(ROOT,'js/core/canvas.js'),'utf8');
 vm.runInContext(cv.slice(cv.indexOf('function computeCamZoom'),cv.indexOf('function _viewportBox')),sandbox);
 Object.assign(sandbox,{VIEW_WORLD_SHORT:650,VIEW_WORLD_LONG_MAX:1500,MIC_MOTHER_POS:{x:0,y:0},micS:{mo:{st:'fight'}},player:{x:0,y:260}});
 for(const [w,h] of [[1280,720],[844,390],[390,844]])for(const y of [260,450]){
   Object.assign(sandbox,{VW:w,VH:h});sandbox.player.y=y;
   const normal=sandbox.computeCamZoom(w,h),zoom=sandbox.micCamZoom(normal);
   sandbox.CAM_ZOOM=zoom;sandbox.CAM_Y_ANCHOR=sandbox.camFitAnchor(w,h,zoom);
   const lift=sandbox.micCamLift(),R=sandbox._micMotherRect();
   const top=h/2-sandbox.CAM_Y_ANCHOR+(R.y-y+lift)*zoom;
   const feet=h/2-sandbox.CAM_Y_ANCHOR+lift*zoom;
   assert(top>=Math.max(104,h*0.15)-1,JSON.stringify({w,h,y,top}));
   assert(feet<=h-(h<=500?58:92)-43,JSON.stringify({w,h,y,feet}));
   assert(zoom<=normal&&zoom>=normal*0.35);
 }
 sandbox.micS.mo.st='sleep';assert.equal(sandbox.micCamZoom(0.6),0.6);
 sandbox.micS.mo.st='fight';sandbox.player.y=901;assert.equal(sandbox.micCamZoom(0.6),0.6);
});
check('boss camera restores normal zoom on death, arena exit and spectator; input roundtrip stays exact',()=>{
 vm.runInContext(fs.readFileSync(path.join(ROOT,'js/rendering/camera.js'),'utf8'),sandbox);
 let hooked=true;Object.assign(sandbox,{VW:844,VH:390,state:'playing',CAM_LEAD_X:12,CAM_LEAD_Y:17,
  arenaHas:n=>hooked&&['camZoom','camLift'].includes(n),arenaHook:(n,arg)=>n==='camZoom'?sandbox.micCamZoom(arg):sandbox.micCamLift()});
 sandbox.player.y=260;sandbox.micS.mo.st='fight';sandbox.CAM_ZOOM=0.6;
 for(let i=0;i<120;i++){
   sandbox.updateArenaCameraZoom();sandbox.updateCamLift();
   const world={x:83,y:42},screen=sandbox.worldToScreen(world.x,world.y),lift=vm.runInContext('CAM_LIFT',sandbox);
   const back={x:sandbox.player.x+sandbox.CAM_LEAD_X+(screen.x-sandbox.VW/2)/sandbox.CAM_ZOOM,
    y:sandbox.player.y-lift+sandbox.CAM_LEAD_Y+(screen.y-(sandbox.VH/2-sandbox.CAM_Y_ANCHOR))/sandbox.CAM_ZOOM};
   assert(Math.abs(back.x-world.x)<1e-8&&Math.abs(back.y-world.y)<1e-8);
 }
 assert(sandbox.CAM_ZOOM<0.6);
 const frozenZoom=sandbox.CAM_ZOOM,frozenLift=vm.runInContext('CAM_LIFT',sandbox);sandbox.state='paused';
 for(let i=0;i<20;i++){sandbox.updateArenaCameraZoom();sandbox.updateCamLift();}
 assert.equal(sandbox.CAM_ZOOM,frozenZoom);assert.equal(vm.runInContext('CAM_LIFT',sandbox),frozenLift);sandbox.state='playing';
 for(const mode of ['dead','arena-exit','spectator']){
   hooked=true;sandbox.micS.mo.st='fight';vm.runInContext('CAM_SUBJECT=null',sandbox);
   for(let i=0;i<160;i++)sandbox.updateArenaCameraZoom();
   sandbox.micS.mo.st=mode==='dead'?'dead':'fight';hooked=mode!=='arena-exit';
   vm.runInContext('CAM_SUBJECT='+ (mode==='spectator'?'{x:5,y:5}':'null'),sandbox);
   for(let i=0;i<160;i++)sandbox.updateArenaCameraZoom();
   assert.equal(sandbox.CAM_ZOOM,0.6,mode);
 }
});
check('opt-in high-detail phase1 pilot holds windup, impact, recovery and excludes other phases',()=>{
 const m={st:'fight',ph:1};const p=(e,M=m,t=0)=>sandbox._micMotherPilotPose(e,M,t,frame(e,M,t));
 assert.equal(p({packSet:'atk',packDur:1500,packTimer:510,bossWind:{t:990,dur:1000}}).frame,0);
 assert.equal(p({packSet:'atk',packDur:1500,packTimer:490}).frame,1);
 assert.equal(p({packSet:'atk',packDur:1500,packTimer:100}).frame,2);
 assert.equal(p({packSet:'atk',packDur:700,packTimer:600}).key,'mp_pilot_cast');
 assert.equal(p({packSet:'atk',packDur:1500,packTimer:490},{st:'fight',ph:2,bloom:1}),null);
 assert.equal(p({packSet:null,packTimer:0},m,360).frame,1);
});
check('bloom keypose requires both explicit flags and only evolved idle',()=>{
 const q={Image:class{},VFX_SPR_EXTRA:{},MIC_CFG:{madre:{closeMs:2600}},console,location:{search:'?motherArtPilot=1&motherBloomKey=1'},URLSearchParams};
 vm.createContext(q);vm.runInContext(code,q);
 const M={st:'fight',ph:2,bloom:1},e={};
 const p=q._micMotherPilotPose(e,M,0,q._micMotherFrame(e,M,0));
 assert.equal(p.key,'mp_bloom_idle');assert.equal(p.anchor,528);assert.equal(p.cols,3);
 assert.equal(q._micMotherPilotPose(e,M,999999,{state:'bloom-idle'}).frame,0,'legacy missing epoch holds deterministic endpoint');
 assert.deepEqual([0,420,840,1260,1680].map(t=>q._micMotherPilotPose(e,{...M,bloomAt:1000},1000+t,{state:'bloom-idle'}).frame),[0,1,2,1,0]);
 assert.equal(q._micMotherPilotPose(e,{...M,tr:{to:2,t:100}},0,q._micMotherFrame(e,{...M,tr:{to:2,t:100}},0)).key,'mp_pilot');
 for(const [t,key,frame] of [[500,'mp_bloom_trans',0],[1100,'mp_bloom_trans',1],[1800,'mp_bloom_trans',2],[2500,'mp_bloom_key',0],[3100,'mp_bloom_key',0]]){
  const m={...M,tr:{to:2,t}},r=q._micMotherPilotPose(e,m,999999,q._micMotherFrame(e,m,0));assert.equal(r.key,key);assert.equal(r.frame,frame);
 }
 for(const [timer,wind,index] of [[510,{t:990,dur:1000},0],[490,null,1],[100,null,2]]){
  const r=q._micMotherPilotPose({packSet:'atk',packTimer:timer,packDur:1500,bossWind:wind},M,0,{state:'atk'});assert.equal(r.key,'mp_bloom_attack');assert.equal(r.frame,index);
 }
 assert.equal(q._micMotherPilotPose({packSet:'atk',packTimer:690,packDur:700},M,0,{state:'atk'}).key,'mp_bloom_cast');
 assert.equal(q._micMotherPilotPose({packSet:'atk',packTimer:690,packDur:700},M,0,{state:'atk'}).frame,0,'immediate release');
 assert.equal(q._micMotherPilotPose({packSet:'atk',packTimer:100,packDur:700},M,0,{state:'atk'}).frame,1,'ranged recovery');
 assert.equal(q._micMotherPilotPose({packSet:'atk',packTimer:490,packDur:1500},{...M,heart:1},0,{state:'atk'}),null,'heart excluded');
 for(const ph of [1,2])for(const [state,dur] of [['cast',1100],['cast',1200],['bloom',1100]]){
  const m={st:'fight',ph,bloom:ph===2?1:0},entity={packSet:state,packDur:dur,packTimer:dur},before=JSON.stringify([m,entity]);
  const r=q._micMotherPilotPose(entity,m,0,{state});assert.equal(r.key,ph===1?'mp_pilot_cast':'mp_bloom_cast');assert.equal(r.frame,0);assert.equal(JSON.stringify([m,entity]),before);
  entity.packTimer=10;assert.equal(q._micMotherPilotPose(entity,m,0,{state}).frame,1);
 }

});
check('Mother1-based phases map to zero-based HUD without changing combatphase',()=>{
 const source=fs.readFileSync(path.join(ROOT,'js/arenas/micelial/mic-mother.js'),'utf8');
 const calls=[],q={micS:{mo:{}},runElapsedMs:123,bossHudPhase:(...a)=>calls.push(a),showBanner:()=>{},playSfx:()=>{},vfxShake:()=>{},flashScreen:()=>{}};
 vm.createContext(q);vm.runInContext(source,q);
 for(const ph of [2,3]){const e={};q.micMotherToPhase(e,ph);assert.equal(e.bossPhase,ph);assert.equal(q.micS.mo.ph,ph);assert.equal(calls.at(-1)[0],ph-1);}
});
check('open-core keypose is explicit and cosmetic vulnerability cue tracks visible seed',()=>{
 const ellipses=[],q={Image:class{},VFX_SPR_EXTRA:{},MIC_CFG:{madre:{closeMs:2600}},console,location:{search:'?motherArtPilot=1&motherBloomKey=1&motherHeartKey=1'},URLSearchParams,runElapsedMs:1000,MIC_MOTHER_POS:{x:0,y:125},ctx:{save(){},restore(){},beginPath(){},stroke(){},ellipse(...a){ellipses.push(a)}}};
 vm.createContext(q);vm.runInContext(code,q);const m={st:'fight',ph:3,heart:1,bt:900},r=q._micMotherPilotPose({},m,1000,{state:'heart'});
 assert.equal(r.key,'mp_heart_key');q._micDrawMotherHeartCue(m,r.core);assert(Math.abs(ellipses[0][1]-35.6)<1e-6);
 assert.equal(q._micMotherPilotPose({},m,1000,{state:'atk'}),null,'static geometry pilot does not claim heart attacks');
 assert.equal(q._micMotherPilotPose({},{...m,ph:2,heart:0},1000,{state:'heart'}),null);
});
check('core replacement bindings pin reviewed source bytes and every supported frame',()=>{
 const bindings=vm.runInContext('MIC_MOTHER_CORE_BINDINGS',sandbox),crypto=require('node:crypto');
 for(const [key,b]of Object.entries(bindings)){
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,b.path))).digest('hex'),b.sha256,key+' requires visual re-review after source change');
  assert(b.frames.length>=2);for(const f of b.frames)assert(Array.isArray(f.foreground));
 }
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,'assets/sprites/arenas/micelial/mother/pilot_heart_key.png'))).digest('hex'),vm.runInContext('MIC_MOTHER_CORE_HEART_SHA256',sandbox));
});
check('network exposure preserves body and action while permanent heart survives rebuild',()=>{
 const q={Image:class{},VFX_SPR_EXTRA:{},MIC_CFG:{madre:{closeMs:2600}},console,location:{search:'?motherArtPilot=1&motherBloomKey=1&motherHeartKey=1&motherCoreLayer=1'},URLSearchParams};vm.createContext(q);vm.runInContext(code,q);
 for(const ph of [1,2,3])for(const e of [{},{stunTimer:500},{packSet:'atk',packTimer:1000,packDur:1600,bossWind:{t:600,dur:1100}},{packSet:'atk',packTimer:490,packDur:1600},{packSet:'atk',packTimer:680,packDur:700}]){
  const m={st:'fight',ph,bloom:ph>=2?1:0,heart:ph===3?1:0,net:{st:'open',t:6999}},before=JSON.stringify([e,m]);
  const open=q._micMotherPilotPose(e,m,1000,q._micMotherFrame(e,m,1000));assert(open.coreLayer);assert.equal(open.key.startsWith('mp_bloom'),ph>=2);assert.equal(JSON.stringify([e,m]),before);
  m.net.st='rebuild';const closed=q._micMotherPilotPose(e,m,1000,q._micMotherFrame(e,m,1000));assert.equal(!!closed.coreLayer,ph===3);
  const frozen=q._micMotherPilotPose(e,m,1000,q._micMotherFrame(e,m,1000));assert.deepEqual(JSON.parse(JSON.stringify(frozen)),JSON.parse(JSON.stringify(closed)));
 }
});
check('bark opening and closing follow authoritative timers without delaying vulnerability',()=>{
 const q={Image:class{},VFX_SPR_EXTRA:{},MIC_CFG:{madre:{closeMs:2600,net:{openMs:7000}}},console,location:{search:'?motherArtPilot=1&motherBloomKey=1&motherHeartKey=1&motherCoreLayer=1'},URLSearchParams};vm.createContext(q);vm.runInContext(code,q);
 const m={st:'fight',ph:1,net:{st:'open',t:0}},e={_expT:7000,crashVuln:true};
 const pose=()=>q._micMotherPilotPose(e,m,123,q._micMotherFrame(e,m,123));
 assert.equal(pose().coreAmount,0);assert.equal(e.crashVuln,true);
 e._expT=6820;assert.equal(pose().coreAmount,.5);e._expT=6640;assert.equal(pose().coreAmount,1);
 e._expT=0;e.crashVuln=false;m.net={st:'rebuild',t:0};assert.equal(pose().coreAmount,1);assert.equal(e.crashVuln,false);
 m.net.t=160;assert.equal(pose().coreAmount,.5);m.net.t=320;assert(!pose().coreLayer);
 m.ph=3;m.bloom=1;m.tr={to:3,t:1300};assert.equal(pose().coreAmount,.5);assert.equal(pose().key,'mp_bloom_idle');
 m.tr.t=2600;assert.equal(pose().coreAmount,1);delete m.tr;m.heart=1;assert.equal(pose().coreAmount,1);
});
check('network glow shares successful core anchor, falls back intact and freezes with game time',()=>{
 const calls=[],m={alive:true,type:'madre_espora',x:0,y:125,_expT:7000},q={MIC_CFG:{madre:{}},enemies:[m],runElapsedMs:1000,inView:()=>true,_micGlow:(...a)=>calls.push(a),_micMotherRenderedCoreAnchor:()=>({x:12,y:27}),ctx:{save(){},restore(){},beginPath(){},ellipse(){},stroke(){}}};
 vm.createContext(q);vm.runInContext(fs.readFileSync(path.join(ROOT,'js/arenas/micelial/mic-network.js'),'utf8'),q);
 q.micDrawNetHeart(2);assert.equal(calls[0][0],12);assert.equal(calls[0][1],27);assert(calls[0][2]<=36&&calls[0][4]<=.2);
 q.micDrawNetHeart(99);assert.deepEqual(calls[0],calls[1]);q._micMotherRenderedCoreAnchor=()=>null;q.micDrawNetHeart(99);assert.equal(calls[2][1],-65);assert(calls[2][2]>=120);
});
check('high-detail death holds three real poses at unchanged controller milestones',()=>{
 const q={Image:class{},VFX_SPR_EXTRA:{},MIC_CFG:{madre:{closeMs:2600}},console,location:{search:'?motherArtPilot=1&motherBloomKey=1&motherHeartKey=1&motherCoreLayer=1&motherDeathPilot=1'},URLSearchParams};vm.createContext(q);vm.runInContext(code,q);
 for(const [t,frame,alpha]of [[0,0,1],[4699,0,1],[4700,1,1],[6599,1,1],[6600,2,1],[8000,2,1],[8500,2,.5],[9000,2,0]]){
  const m={st:'dying',t},before=JSON.stringify(m),pose=q._micMotherFrame(null,m,0),p=q._micMotherPilotPose(null,m,0,pose);assert.equal(p.key,'mp_death');assert.equal(p.frame,frame);assert.equal(p.anchor,528);assert.equal(pose.alpha,alpha);assert.equal(JSON.stringify(m),before);
 }
 assert.equal(q._micMotherFrame(null,{st:'dead',t:0},0).alpha,0);
});
check('high-detail reveal keeps existing emergence and seamless articulated idle clock',()=>{
 const q={Image:class{},VFX_SPR_EXTRA:{},MIC_CFG:{madre:{closeMs:2600}},console,location:{search:'?motherArtPilot=1&motherBloomKey=1&motherHeartKey=1&motherCoreLayer=1&motherRevealPilot=1'},URLSearchParams};vm.createContext(q);vm.runInContext(code,q);
 for(const st of ['sleep','stir'])assert.equal(q._micMotherFrame(null,{st,t:9000},0).alpha,0);
 for(const [t,frame]of [[1500,0],[3400,1],[5300,2]]){const M={st:'reveal',t},pose=q._micMotherFrame(null,M,t);assert.equal(q._micMotherPilotPose(null,M,t,pose).frame,frame);assert.equal(pose.rise,Math.max(0,(t-1500)/5500));}
 const t=9000,reveal=q._micMotherPilotPose(null,{st:'reveal',t},t,{state:'reveal'}),idle=q._micMotherPilotPose(null,{st:'fight',ph:1,t:0},t,{state:'idle'});assert.deepEqual(reveal,idle);
});
console.log(JSON.stringify({pass,scope:'pose and contract unit tests only; visual/browser checks separate'}));
