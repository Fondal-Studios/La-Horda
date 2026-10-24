'use strict';
const fs=require('node:fs'),H=require('../lib/serve');
const OUT='art-source/entregas/aelith-normal-kit-20261022/correccion-02';
(async()=>{const site=await H.startSite(),browser=await H.launch();try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await H.goto(page,site.url);await H.waitFor(page,()=>typeof startRun==='function'&&assetsAllReady());
 const checks=await page.evaluate(()=>{
  const checks=[],check=(name,pass,details)=>checks.push({name,pass:!!pass,details});
  netMatch=null;for(const k in save.champions)Object.assign(save.champions[k],{unlocked:true,level:100,equipment:{},inventory:[],talents:{nodes:{},mastery:null,masteryNodes:{}}});
  selectedClass='aelith';currentArena='bosque';lobbyAllies=['tanque','soporte'];startRun(3);state='menu';enemies=[];runLevel=ULT_MIN_ARENA_LEVEL;
  const fx=window.vfxSfaPlay,events=[];window.vfxSfaPlay=function(...a){events.push(a);return fx.apply(this,a);};
  const reset=()=>{portadorObjects=[];sfaReset();sfaObjectsReset();events.length=0;player.energy=1e4;player.cds=[0,0,0];player.ultCharge=player.ultMax;player.ultCd=0;player.aim={x:player.x+100,y:player.y,dx:1,dy:0};save.champions.aelith.talents={nodes:{},mastery:null,masteryNodes:{}};};
  const impacts=()=>events.filter(e=>e[0]==='nova'&&e[1]==='aelith_echo');
  reset();save.champions.aelith.talents.nodes.aelith_t0transform=1;castAbility(player,player.cls.skills[0],false,0);let o=portadorOwned(player,'ael_echo')[0];
  check('real delayed talent retains1600ms',aelithFlag(player,0,'delayed')&&o.life===1600);events.length=0;if(!o)throw Error(JSON.stringify({missingEcho:true,flag:aelithFlag(player,1,'aftershock'),mastery:aelithFlag(player,'ult','reprise'),alive:player.alive,fused:player.fused,level:save.champions.aelith.level,objects:portadorObjects.map(x=>x.kind),last:player.aelithLastEcho}));aelithUpdateObject(o,800);check('delayed talent does not impact at800',impacts().length===0);aelithUpdateObject(o,800);check('delayed talent impacts exactly at1600',impacts().length===1);
  reset();save.champions.aelith.talents.nodes.aelith_t1transform=1;castAbility(player,player.cls.skills[1],false,1);o=portadorOwned(player,'ael_echo')[0];
  check('aftershock creates actual endpoint echo',aelithFlag(player,1,'aftershock')&&o&&o.r===60&&o.life===800);events.length=0;if(!o)throw Error(JSON.stringify({missingEcho:true,flag:aelithFlag(player,1,'aftershock'),mastery:aelithFlag(player,'ult','reprise'),alive:player.alive,fused:player.fused,level:save.champions.aelith.level,objects:portadorObjects.map(x=>x.kind),last:player.aelithLastEcho}));aelithUpdateObject(o,800);check('aftershock expiry owns one correctly sized impact',impacts().length===1&&impacts()[0][4]===60);
  reset();castAbility(player,player.cls.skills[0],false,0);const last={...player.aelithLastEcho};portadorObjects=[];events.length=0;
  save.champions.aelith.talents.mastery='aelith_0';save.champions.aelith.talents.masteryNodes.aelith_t0master=1;
  check('real reprise mastery active',aelithFlag(player,'ult','reprise'));castAbility(player,player.cls.ultimate,true);o=portadorOwned(player,'ael_echo')[0];
  check('reprise retains remembered geometry',o&&o.x===last.x&&o.y===last.y&&o.r===last.r&&o.dmg===last.dmg);events.length=0;if(!o)throw Error(JSON.stringify({missingEcho:true,flag:aelithFlag(player,1,'aftershock'),mastery:aelithFlag(player,'ult','reprise'),alive:player.alive,fused:player.fused,level:save.champions.aelith.level,objects:portadorObjects.map(x=>x.kind),last:player.aelithLastEcho}));aelithUpdateObject(o,800);check('reprise impact uses normal echo without replacing UF',impacts().length===1&&portadorOwned(player,'ael_hour').length===1);
  reset();player.aelithDebtUntil=0;player.slowTimer=1200;player.slowAmt=.6;updatePortadorHero(player,16);check('unrelated slow never creates debt phase',!events.some(e=>e[1]==='aelith_debt'));
  reset();save.champions.aelith.talents.nodes.aelith_t2transform=1;allies[0].x=player.x+20;allies[0].y=player.y;allies[1].x=player.x+600;allies[1].y=player.y;castAbility(player,player.cls.skills[2],false,2);
  const receivers=events.filter(e=>e[1]==='aelith_haste~p').map(e=>e[10]);check('shared haste selects only actual nearby recipients',receivers.length===2&&receivers.includes(0)&&receivers.includes(1)&&!receivers.includes(2),receivers);
  events.length=0;runElapsedMs=player.aelithDebtUntil;for(const h of heroes)updatePortadorHero(h,0);const debts=events.filter(e=>e[1]==='aelith_debt').map(e=>e[10]);check('shared debt uses same recipient set',JSON.stringify(debts)===JSON.stringify(receivers),debts);
  window.vfxSfaPlay=fx;return checks;
 });
 const status=errors.length||checks.some(c=>!c.pass)?'FAIL':'PASS';fs.writeFileSync(OUT+'/variant-tests.json',JSON.stringify({status,checks,errors},null,2)+'\n');console.log(JSON.stringify({status,checks:checks.length,failed:checks.filter(c=>!c.pass),errors}));if(status==='FAIL')process.exitCode=1;
 }finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
