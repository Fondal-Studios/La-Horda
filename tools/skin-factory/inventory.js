'use strict';
/* Inventario VERIFICABLE de apariencias (Agente I · Premium Skin Factory). Corre en el juego real.
   Por cada skin: archivos en disco, dimensiones del atlas contra su metadata, cobertura de animaciones
   por orientación, vista previa, rareza, precio y defectos. No modifica nada.
   Uso: SITE=http://127.0.0.1:8771 node tools/skin-factory/inventory.js [salida.json] */
const fs=require('node:fs'),path=require('node:path');const {openGame,ROOT}=require('./lib');
function pngSize(f){const b=fs.readFileSync(f);return b.readUInt32BE(0)===0x89504e47?{w:b.readUInt32BE(16),h:b.readUInt32BE(20)}:null;}
(async()=>{const {browser,page,errors}=await openGame();
 const raw=await page.evaluate(()=>{const out=[];for(const id in CROMA_SKINS){const s=CROMA_SKINS[id];out.push({id,champ:s.champ,name:s.name,rarity:s.rarity||null,price:s.price,type:s.appearanceType||'?',preview:s.preview||null,authored:!!s.preserveAuthoredArt,packs:Object.fromEntries(Object.entries(s.authoredPacks||{}).map(([k,p])=>[k,{src:p.src,meta:p.meta}])),theme:s.visualTheme||null,hasLore:!!(s.lore&&s.lore.length>20)});}
  return {skins:out,champs:Object.keys(CLASSES).map(k=>({key:k,name:CLASSES[k].name,role:CLASSES[k].roleCategory}))};});
 const NEED=['idle','walk','run','attack','cast','ultimate','hit','death'],DIRS=['down','side','up'];
 const rows=[];
 for(const s of raw.skins){const d=[],obs=[];let atlasOk=0,atlasN=0,missingSets=[];
  if(!s.preview||!fs.existsSync(path.join(ROOT,s.preview)))d.push('CRÍTICO: vista previa ausente');
  if(!Object.keys(s.packs).length)d.push('sin atlas propio (recolor/paleta sobre cuerpo base)');
  for(const [k,p] of Object.entries(s.packs)){if(k!==s.champ)continue; // el pack de montura/forma (p.ej. libertador_horse) no se juzga como cuerpo
   atlasN++;const f=path.join(ROOT,p.src);
   if(!fs.existsSync(f)){d.push('CRÍTICO: atlas ausente '+p.src);continue;}
   const sz=pngSize(f),m=p.meta||{};
   if(!sz)d.push('atlas no es PNG');else{const cols=m.cols,fr=Object.values(m.sets||{}).flat(),maxIdx=Math.max(...fr);
    const rowsN=Math.ceil((maxIdx+1)/cols);if(sz.w!==cols*m.w)d.push(`ancho de atlas ${sz.w} != cols*w ${cols*m.w}`);else if(sz.h<rowsN*m.h)d.push(`alto de atlas ${sz.h} < ${rowsN*m.h}`);else atlasOk++;}
   for(const a of NEED)for(const dir of DIRS)if(!(m.sets&&(m.sets[a+'_'+dir]||(a==='run'&&m.sets.run))))missingSets.push(a+'_'+dir);}
  const onlyRun=missingSets.length>0&&missingSets.every(x=>x.startsWith('run_'));
  if(missingSets.length&&onlyRun)obs.push('sin cuadros propios de correr (usa caminar/perfil)');else if(missingSets.length)d.push('animaciones sin definir: '+[...new Set(missingSets)].slice(0,6).join(',')+(missingSets.length>6?'…':''));
  if(!s.hasLore)d.push('historia breve ausente');
  rows.push({...s,packs:undefined,atlasN,atlasOk,defects:d,observations:obs,critical:d.filter(x=>x.startsWith('CRÍTICO')).length});}
 const byChamp=raw.champs.map(c=>{const sk=rows.filter(r=>r.champ===c.key);return {champ:c.key,role:c.role,skins:sk.length,epic:sk.filter(r=>/pica/i.test(r.rarity||'')).length,legendary:sk.filter(r=>/legend/i.test(r.rarity||'')).length,withAtlas:sk.filter(r=>r.atlasN>0).length,defects:sk.reduce((a,r)=>a+r.defects.length,0)};});
 const summary={total:rows.length,champions:raw.champs.length,withAtlas:rows.filter(r=>r.atlasN>0).length,withoutAtlas:rows.filter(r=>r.atlasN===0).length,critical:rows.reduce((a,r)=>a+r.critical,0),withDefects:rows.filter(r=>r.defects.length).length,withObservations:rows.filter(r=>r.observations.length).length,pageErrors:errors.length,byRarity:rows.reduce((o,r)=>(o[r.rarity||'sin rareza']=(o[r.rarity||'sin rareza']||0)+1,o),{}),byType:rows.reduce((o,r)=>(o[r.type]=(o[r.type]||0)+1,o),{})};
 console.log(JSON.stringify(summary));console.table(byChamp);
 if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify({summary,byChamp,skins:rows},null,1)+'\n');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
