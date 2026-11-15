'use strict';
const fs=require('fs'),path=require('path'),H=require('../lib/serve');
// Salida en un directorio temporal (antes escribía OWNERSHIP.json dentro del repo en cada corrida).
const D=process.env.OUT||fs.mkdtempSync(path.join(require('os').tmpdir(),'musashi-afterimage-'));
fs.mkdirSync(D,{recursive:true});
// Línea base "parent": el código actual SIN la apariencia por estela (packKey), derivado del propio árbol.
// Antes leía instantáneas congeladas (before-*.js) que quedaron obsoletas (MAGO_IMG ya no existe) y rompían la
// corrida con errores de página. Si el código cambia y el parche inverso no aplica, la prueba falla en voz alta.
const rd=f=>fs.readFileSync(path.join(__dirname,'..','..',f),'utf8');
const rev=(src,pairs)=>pairs.reduce((t,[a,b])=>{if(!t.includes(a))throw new Error('línea base: parche inverso no aplica; actualizar musashi-afterimage-check.js');return t.replace(a,b);},src);
const BASELINE={
 'js/champions/musashi.js':rev(rd('js/champions/musashi.js'),[
  ['const packKey = typeof setSkinPackKey === "function" ? setSkinPackKey(h, "musashi") : "musashi";\n  ',''],
  ['classKey:h.classKey, packKey, life','classKey:h.classKey, life']]),
 'js/rendering/champion-sprites.js':rev(rd('js/rendering/champion-sprites.js'),[
  ['    for(const a of musashiAfterimages){\n      // Cada estela conserva su emisor (a.packKey), incluso tras reordenar héroes o recibirla por red;\n      // sin clave (estela previa) o con atlas no listo, cae al Musashi base.\n      const SK = a.packKey && CHAMP_PACK[a.packKey];\n      const Q = SK && SK.ready && SK.sets.walk_side ? SK : P;\n      const s = 78/Q.refH;\n',
   '    const owner = typeof heroes!=="undefined" && heroes ? heroes.find(h=>h.classKey==="musashi") : null;\n    const SK = owner && typeof setSkinPackKey==="function" ? CHAMP_PACK[setSkinPackKey(owner, "musashi")] : null;\n    const Q = SK && SK.ready && SK.sets.walk_side ? SK : P;\n    const s = 78/Q.refH;\n    for(const a of musashiAfterimages){\n']])};
(async()=>{const site=await H.startSite(),b=await H.launch(),rows=[],errors=[];try{
 for(const parent of [true,false])for(const mobile of [false,true]){
  const p=await b.newPage({viewport:mobile?{width:844,height:390}:{width:1280,height:720}});
  p.on('pageerror',e=>errors.push(e.message));
  if(parent)for(const url of Object.keys(BASELINE))await p.route('**/'+url+'*',r=>r.fulfill({contentType:'text/javascript',body:BASELINE[url]}));
  await p.addInitScript(()=>{requestAnimationFrame=()=>0;performance.now=()=>1000;});
  await p.goto(site.url+'/?lazy=0');await p.waitForFunction(()=>assetsAllReady(),null,{polling:100});
  await p.evaluate(()=>{for(const id of cromaIdsFor('musashi'))cromaEnsureLoaded(id);});
  await p.waitForFunction(()=>cromaIdsFor('musashi').every(id=>Object.values(CROMA_SKINS[id].packs).every(k=>CHAMP_PACK[k]?.ready))&&CHAMP_PACK.skin_errante?.ready,null,{polling:100});
  const r=await p.evaluate(()=>{
   netMatch=null;for(const c of Object.values(save.champions))Object.assign(c,{unlocked:true,level:20,equipment:{},inventory:[],cosmeticSkin:'',croma:null,talents:{nodes:{},mastery:null,masteryNodes:{}}});
   selectedClass='musashi';currentArena='bosque';lobbyAllies=[];startRun(1);state='playing';document.querySelectorAll('.screen').forEach(e=>e.classList.add('hidden'));enemies=[];spawnTimer=arenaHazardTimer=1e9;
   const base=player,checks=[],variants=[null,...Object.keys(SET_SKINS).filter(id=>SET_SKINS[id].champ==='musashi'),...cromaIdsFor('musashi')];
   const draw=()=>{const calls=[],old=champPackDrawFrame;champPackDrawFrame=function(P,...a){calls.push({key:Object.keys(CHAMP_PACK).find(k=>CHAMP_PACK[k]===P),args:a});return old(P,...a);};try{drawMusashiAfterimages();}finally{champPackDrawFrame=old;}return calls;};
   const records=[];
   for(const skin of variants){
    player=base;heroes=[base];base._codexSkin=null;musashiAfterimages=[];const h={...base,_codexSkin:skin,x:base.x+140,energy:1e4,cds:[0,0,0],fx:-1,fy:0};heroes.push(h);player=h;
    const expected=setSkinPackKey(h,'musashi');useSkill(1,{x:h.x+100,y:h.y,dx:1,dy:0});
    const pre=musashiAfterimages.map(a=>({...a})),calls=draw();
    checks.push({name:'two real afterimages '+skin,ok:pre.length===2&&pre.every(a=>a.life===240&&a.maxLife===240)});
    checks.push({name:'correct emitter appearance '+skin,ok:calls.length===2&&calls.every(a=>a.key===expected)});
    // Stale lifetime snapshots must not change appearance with the heroes array.
    h._codexSkin=null;heroes=[h,base];const reordered=draw();heroes=[];const removed=draw();
    checks.push({name:'snapshot survives reorder/removal/skin-change '+skin,ok:[reordered,removed].every(a=>a.length===2&&a.every(x=>x.key===expected))});
    const wire=JSON.parse(JSON.stringify(netSer(pre,0)));musashiAfterimages=netDecode(wire);const decoded=draw();
    checks.push({name:'NET_COLLS serializes atlas key '+skin,ok:wire.every(a=>a.packKey===expected)&&decoded.every(a=>a.key===expected)});
    const oldRandom=Math.random;let rng=0;Math.random=()=>{rng++;return .5;};const snapshot=JSON.stringify(musashiAfterimages);draw();Math.random=oldRandom;
    checks.push({name:'render is pure '+skin,ok:rng===0&&snapshot===JSON.stringify(musashiAfterimages)});
    updateMusashiFx(120);const half=draw();updateMusashiFx(120);
    checks.push({name:'fade and expiry '+skin,ok:half.length===2&&half.every(x=>x.args[5]===.225)&&musashiAfterimages.length===0});
    records.push({skin,expected,pre,calls,reordered,removed,wire,decoded});
   }
   heroes=[base];player=base;musashiAfterimages=[{x:0,y:0,fx:1,life:240,maxLife:240},{x:20,y:0,fx:1,life:240,maxLife:240,packKey:'absent'}];
   checks.push({name:'legacy and missing atlas fallback',ok:draw().every(a=>a.key==='musashi')});
   const P=CHAMP_PACK.skin_errante;musashiAfterimages=[{x:0,y:0,fx:1,life:240,maxLife:240,packKey:'skin_errante'}];P.ready=false;
   checks.push({name:'temporarily unavailable texture fallback',ok:draw()[0]?.key==='musashi'});P.ready=true;
   checks.push({name:'texture recovery keeps snapshot',ok:draw()[0]?.key==='skin_errante'});
   musashiAfterimages=[];base._codexSkin='errante';P.ready=false;musashiSpawnAfterimage(base);P.ready=true;
   checks.push({name:'cold spawn matches body fallback',ok:musashiAfterimages[0].packKey==='musashi'});
   return{variants,records,checks};
  });rows.push({parent,mobile,...r});await p.close();
 }
 fs.writeFileSync(D+'/OWNERSHIP.json',JSON.stringify({rows,errors,scope:'Actual useSkill casts; local paired heroes and production netSer/netDecode, not relay certification'},null,2));
 console.log(JSON.stringify({rows:rows.map(r=>({parent:r.parent,mobile:r.mobile,checks:r.checks.length,fail:r.checks.filter(c=>!c.ok)})),errors}));
 if(errors.length||rows.filter(r=>!r.parent).some(r=>r.checks.some(c=>!c.ok)))process.exitCode=1;
}finally{await b.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
