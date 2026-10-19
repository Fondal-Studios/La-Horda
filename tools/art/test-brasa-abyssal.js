'use strict';
// Isolated browser save. Reuses real shop/equipment/loadout/render functions.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
const OUT=path.resolve(__dirname,'../../art-source/entregas/bloques/B635_brasa_abisal/runtime');
(async()=>{
 fs.mkdirSync(OUT,{recursive:true});
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),args:['--no-sandbox']});
 try{
  const p=await b.newPage({viewport:{width:1000,height:600}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto(process.env.SE_BASE_URL||'http://127.0.0.1:8775');
  await p.waitForFunction(()=>typeof cromaLoadAll==='function'&&typeof netBuildLoadout==='function');
  await p.evaluate(()=>cromaLoadAll());
  await p.waitForFunction(()=>CROMA_SKINS.brasa_abisal?.packs?.brasa&&CHAMP_PACK[CROMA_SKINS.brasa_abisal.packs.brasa]?.ready);
  // Reuse the canonical detector and classifier unchanged; champions are not in its inventory.
  const densitySource=fs.readFileSync(path.join(__dirname,'pixel-density.js'),'utf8');
  await p.addScriptTag({content:densitySource.slice(densitySource.indexOf('const CANON ='),densitySource.indexOf('const FLOOR_SCALE'))+densitySource.slice(densitySource.indexOf('function analyzeInPage'),densitySource.indexOf('function walk'))+densitySource.slice(densitySource.indexOf('function classify'),densitySource.indexOf('(async () => {'))});
  const r=await p.evaluate(()=>{
   const id='brasa_abisal',checks=[],check=(name,ok)=>checks.push({name,ok:!!ok});
   selectedClass='tanque';currentArena='bosque';startRun(1);state='paused';
   const before=JSON.stringify([save.champions.brasa.level,save.champions.brasa.equipment,save.champions.brasa.talents,CLASSES.brasa]);
   check('unowned skin cannot equip',!cromaOwned(id)&&!cromaEquip('brasa',id));
   const cost=cromaPrice(id); save.gold=cost;
   check('gold price matches authored skin tier',cost===12000);
   check('purchase debits exact amount',cromaBuy(id).ok&&save.gold===0&&cromaOwned(id));
   check('equip correct champion',cromaEquip('brasa',id));
   check('wrong champion rejected',!cromaEquip('mago',id));
   const loadout=netBuildLoadout('brasa'),remote=netLoadoutRecord(loadout);
   check('remote loadout keeps cosmetic ID',loadout.croma===id&&loadout.skin===id&&remote.croma===id);
   const worn=makeHero('brasa',true,0,0);cromaEquip('brasa',null);const base=makeHero('brasa',true,0,0);
   check('combat stats unchanged',['maxHp','dmg','def','speed','maxEnergy','radius'].every(k=>worn[k]===base[k]));
   check('progress equipment talents and class unchanged',before===JSON.stringify([save.champions.brasa.level,save.champions.brasa.equipment,save.champions.brasa.talents,CLASSES.brasa]));
   cromaEquip('brasa',id);persist();
   const P=CHAMP_PACK[CROMA_SKINS[id].packs.brasa];
   check('36-frame atlas decoded',P.atlas.naturalWidth===448&&P.atlas.naturalHeight===1008&&P.cols===4);
   check('all animation states registered',['down','side','up'].every(d=>['idle','walk','attack','cast','ultimate','hit','death'].every(s=>P.sets[s+'_'+d]?.length)));
   selectedClass='brasa';currentArena='bosque';startRun(1);state='paused';window.ART_GATE_NO_VFX=true;
   const cv=document.createElement('canvas');cv.width=960;cv.height=400;const g=cv.getContext('2d');g.fillStyle='#343b40';g.fillRect(0,0,960,400);g.imageSmoothingEnabled=false;
   const old=ctx;ctx=g;animNow=1000;
   try{
    for(const [row,key]of ['tanque','brasa'].entries())for(let col=0;col<8;col++){
     const h=makeHero(key,true,0,0);h._codexSkin=key==='brasa'&&col>=4?id:null;
     h.x=60+col*120;h.y=140+row*190;h.fx=col%4===1?1:col%4===3?-1:0;h.fy=col%4===0?1:col%4===2?-1:0;h.moving=false;h.attackAnim=0;h.hurtTimer=0;
     drawHeroBody(h,h.scale,false,false);
     g.fillStyle='#ffffff';g.font='12px monospace';g.textAlign='center';g.fillText(row===0?'Referencia':col<4?'Brasa original':'Calderera abisal',h.x,h.y+26);
    }
   }finally{ctx=old;}
   const native=document.createElement('canvas');native.width=112;native.height=112;
   const ng=native.getContext('2d'),density=[];
   for(let frame=0;frame<36;frame++){
    ng.clearRect(0,0,112,112);ng.drawImage(P.atlas,(frame%4)*112,Math.floor(frame/4)*112,112,112,0,0,112,112);
    const metrics=analyzeInPage(ng.getImageData(0,0,112,112).data,112,112,8);
    density.push({frame,...metrics,...classify('campeones',metrics,0.9077,'atlas.png')});
   }
   check('36 native frames meet canonical pixel density without exceptions',density.every(d=>d.issues.length===0));
   return {checks,density,png:cv.toDataURL()};
  });
  fs.writeFileSync(path.join(OUT,'brasa-comparison.png'),Buffer.from(r.png.split(',')[1],'base64'));delete r.png;
  await p.reload();await p.waitForFunction(()=>typeof cromaEquippedId==='function');
  r.checks.push({name:'ownership and selection survive reload',ok:await p.evaluate(()=>cromaOwned('brasa_abisal')&&cromaEquippedId('brasa')==='brasa_abisal')});
  r.errors=errors;fs.writeFileSync(path.join(OUT,'brasa-checks.json'),JSON.stringify(r,null,2)+'\n');
  console.log(JSON.stringify(r));if(errors.length||r.checks.some(c=>!c.ok))process.exitCode=1;
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
