'use strict';
/* Auditoría integral: vuelca desde el juego en ejecución TODOS los activos visuales de campeones (base, cromas/skins, skins de set):
 * metadatos, preview de tienda, estado de carga y una tira de cuadros reales (reposo, pasos x3 vistas, ataque, muerte) tal como los dibuja el motor.
 * Uso: OUT=dir node dump-assets.js   → OUT/assets.json + OUT/strips/<id>.png */
const fs=require('node:fs'),path=require('node:path'),H=require('../../lib/serve');
const OUT=path.resolve(process.env.OUT||'asset-dump');
(async()=>{const site=await H.startSite(),b=await H.launch();fs.mkdirSync(OUT+'/strips',{recursive:true});
try{const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await H.goto(p,site.url+'/');await p.waitForFunction(()=>typeof startRun==='function'&&assetsAllReady(),null,{timeout:120000});await p.waitForTimeout(1500);
const ids=await p.evaluate(()=>({croma:Object.keys(CROMA_SKINS),set:Object.keys(SET_SKINS),base:Object.keys(CLASSES)}));
await p.evaluate(async ids=>{for(const id of ids.croma){try{cromaEnsureLoaded(id);}catch(e){}}await new Promise(r=>setTimeout(r,2500));},ids);
await p.waitForFunction(ids=>ids.croma.filter(id=>CROMA_SKINS[id].authoredPacks).every(id=>CHAMP_PACK['croma_'+id]&&CHAMP_PACK['croma_'+id].ready),ids,{timeout:90000}).catch(()=>{});await p.waitForTimeout(1500);
const data=await p.evaluate(ids=>{
 const strip=(P)=>{ // tira de cuadros reales del pack
  const S=P.sets||{},pick=(...ns)=>{for(const n of ns){const v=(S[n]||[]).filter(i=>i>=0);if(v.length)return v;}return[];};
  const sel=[[pick('idle_down','walk_down')[0]],[pick('walk_down')[1]??pick('walk_down')[0]],[pick('walk_side')[1]??pick('walk_side')[0]],[pick('walk_up')[1]??pick('walk_up')[0]],
   [pick('attack_down','attack_side','cast_down','cast_side').slice(-1)[0]],[pick('death_down','death_side').slice(-1)[0]]].map(a=>a[0]);
  const fw=P.fw,fh=P.fh,sc=2,cv=document.createElement('canvas');cv.width=fw*sc*sel.length;cv.height=fh*sc;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;
  sel.forEach((i,n)=>{if(i==null)return;g.drawImage(P.atlas,(i%P.cols)*fw,Math.floor(i/P.cols)*fh,fw,fh,n*fw*sc,0,fw*sc,fh*sc);});
  return {png:cv.toDataURL(),cells:sel};};
 const info=P=>P&&P.atlas?{ready:!!P.ready,src:(P.atlas.src||'').replace(location.origin+'/',''),fw:P.fw,fh:P.fh,cols:P.cols,refH:P.refH,nat:[P.atlas.naturalWidth||P.atlas.width,P.atlas.naturalHeight||P.atlas.height],sets:Object.keys(P.sets||{}).length,setsMap:P.sets}:null;
 const out=[];
 for(const k of ids.base){const P=CHAMP_PACK[k];const legacy=!P;out.push({id:k,type:'base',champ:k,name:CLASSES[k].name,pack:info(P),strip:P&&P.ready?strip(P):null});}
 for(const id of ids.croma){const d=CROMA_SKINS[id],keys=Object.keys(d.packs||{});const P=CHAMP_PACK['croma_'+id]||null;
  out.push({id,type:'croma',champ:d.champ,name:d.name,rarity:d.rarity,kind:cosmeticAppearanceKind(id),authored:!!d.authoredPacks,recolor:!!Object.keys(d.files||{}).length,price:d.price,preview:d.preview,packKeys:keys.map(k=>'croma_'+id+(k===d.champ?'':'_'+k)),pack:info(P),strip:P&&P.ready?strip(P):null});}
 for(const id of ids.set){const s=SET_SKINS[id];const bk=Object.keys(s.packs||{});const P=bk.length?CHAMP_PACK[s.packs[bk[0]]]:null;
  out.push({id,type:'set',champ:skinSetChamp(id)||s.champ,name:s.name,preview:s.preview||s.src,packKeys:bk.map(x=>s.packs[x]),pack:info(P),strip:P&&P.ready?strip(P):null});}
 return out;},ids);
for(const a of data){if(a.strip){fs.writeFileSync(`${OUT}/strips/${a.type}_${a.id}.png`,Buffer.from(a.strip.png.split(',')[1],'base64'));a.stripFile=`strips/${a.type}_${a.id}.png`;a.stripCells=a.strip.cells;delete a.strip;}}
fs.writeFileSync(OUT+'/assets.json',JSON.stringify({generated:new Date().toISOString(),errs,assets:data},null,1));
console.log('activos',data.length,'sin pack',data.filter(a=>!a.pack).length,'no listos',data.filter(a=>a.pack&&!a.pack.ready).length,'errores',errs.length);
}finally{await b.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
