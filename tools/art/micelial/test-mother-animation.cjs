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
console.log(JSON.stringify({pass,scope:'pose and contract unit tests only; visual/browser checks separate'}));
