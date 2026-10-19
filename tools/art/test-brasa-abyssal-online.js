'use strict';
// Actual host/guest transport and renderer, disposable local relay only.
const {chromium}=require('playwright'),{spawn}=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const ROOT=path.resolve(__dirname,'../..'),OUT=path.join(ROOT,'art-source/entregas/bloques/B635_brasa_abisal/runtime/online.json');
const dataDir=fs.mkdtempSync(path.join(os.tmpdir(),'brasa-skin-relay-')),servers=[],checks=[],errors=[];
const check=(name,ok,detail)=>checks.push({name,ok:!!ok,detail});
let browser;
(async()=>{try{
 servers.push(spawn('python3',['-m','http.server','8875','--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'}),spawn('node',['server/relay.js'],{cwd:ROOT,env:{...process.env,PORT:'8876',DATA_DIR:dataDir,DATABASE_URL:'',ADMIN_USERS:'',PAYMENTS_PROVIDER:''},stdio:'ignore'}));
 let ready=false;for(let i=0;i<100;i++){try{if((await fetch('http://127.0.0.1:8876/api/health')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}if(!ready)throw Error('Local relay unavailable');
 const sku=require('../../server/wallet').skinCatalog().brasa_abisal;
 check('server catalog recognizes authored Brasa skin',sku?.champion==='brasa'&&sku.tier==='autor',sku);
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),args:['--no-sandbox']});
 for(const wearer of ['host','guest']){
  const ac=await browser.newContext(),gc=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true});
  const a=await ac.newPage(),g=await gc.newPage();
  for(const [p,role] of [[a,'host'],[g,'guest']]){
   p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(30000);
   await p.goto('http://127.0.0.1:8875/?lazy=0&server=ws%3A%2F%2F127.0.0.1%3A8876');
   await p.waitForFunction(()=>typeof netBuildLoadout==='function'&&typeof cromaLoadAll==='function');
   await p.evaluate(wears=>{save.starterChosen=true;for(const c of Object.values(save.champions)){c.unlocked=true;c.level=20;}selectedClass=wears?'brasa':'tanque';currentArena='bosque';if(wears){save.gold=cromaPrice('brasa_abisal');if(!cromaBuy('brasa_abisal').ok||!cromaEquip('brasa','brasa_abisal'))throw Error('Isolated skin purchase failed');}cromaLoadAll();setState('prep');},role===wearer);
   await p.waitForFunction(()=>CHAMP_PACK[CROMA_SKINS.brasa_abisal.packs.brasa]?.ready);
  }
  await a.evaluate(()=>netCreateRoom(currentArena,selectedClass,20));const code=await a.evaluate(()=>net.code);
  await g.evaluate(code=>netJoinRoom(code,selectedClass,20),code);await a.waitForFunction(()=>netHumanCount()===2);
  await a.evaluate(()=>netHostStartGame());await g.waitForFunction(()=>netMatch?.role==='guest'&&state==='playing');
  for(const [p,side] of [[a,'host'],[g,'guest']]){
   const r=await p.evaluate(()=>{const h=heroes.find(h=>h.classKey==='brasa');if(!h)return {missing:true};const key=setSkinPackKey(h,'brasa'),expected=CROMA_SKINS.brasa_abisal.packs.brasa;return {key,expected,ready:CHAMP_PACK[key]?.ready,src:CHAMP_PACK[key]?.atlas?.src};});
   check(wearer+' cosmetic reaches '+side+' renderer',r.key===r.expected&&r.ready&&r.src?.includes('/brasa_abisal/atlas.png'),r);
  }
  const w=wearer==='host'?a:g;await a.evaluate(()=>{enemies=[];for(const h of heroes){h.invulnTimer=1e9;h.energy=h.maxEnergy;h.cds=[0,0,0];}spawnTimer=1e9;});
  await w.evaluate(()=>useSkill(0,{x:player.x+65,y:player.y,dx:1,dy:0}));await g.waitForTimeout(500);
  const casts=await a.evaluate(()=>heroes.find(h=>h.classKey==='brasa').stats.skillCasts);
  check(wearer+' can cast while wearing cosmetic',casts>=1,casts);
  await ac.close();await gc.close();
 }
}finally{if(browser)await browser.close();servers.forEach(s=>s.kill());fs.rmSync(dataDir,{recursive:true,force:true});}
const status=errors.length||checks.some(c=>!c.ok)?'FAIL':'PASS';fs.writeFileSync(OUT,JSON.stringify({status,scope:'Disposable anonymous local relay, real gold shop in isolated browser saves; no production data',checks,errors},null,2)+'\n');console.log(JSON.stringify({status,checks,errors}));if(status==='FAIL')process.exitCode=1;
})().catch(e=>{fs.writeFileSync(OUT,JSON.stringify({status:'FAIL',checks,errors:[...errors,e.message]},null,2)+'\n');console.error(e);process.exitCode=1});
