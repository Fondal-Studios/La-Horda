'use strict';
/* Regenera los croma-preview.png de las 10 cromas «Ceniza del Alba» (Expedición) con el recolor vigente del juego.
 * Misma lógica que tools/expedition/cosmetics-test.js (cuadro 0 del atlas recoloreado), sin tocar docs/expedition. Uso: OUT=dir [WRITE=1] node regen-croma-previews.js */
const fs=require('node:fs'),path=require('node:path'),H=require('../../lib/serve');
const OUT=path.resolve(process.env.OUT||'croma-previews');
(async()=>{const site=await H.startSite(),b=await H.launch();fs.mkdirSync(OUT,{recursive:true});
try{const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await H.goto(p,site.url+'/');
await p.waitForFunction(()=>typeof EXPEDITION!=='undefined'&&Object.keys(EXPEDITION).every(k=>CHAMP_PACK[k]&&CHAMP_PACK[k].ready),null,{timeout:120000});
await p.evaluate(()=>{cromaLoadAll();});
await p.waitForFunction(()=>Object.values(CROMA_SKINS).filter(d=>EXPEDITION[d.champ]).every(d=>Object.values(d.packs).every(k=>CHAMP_PACK[k]&&CHAMP_PACK[k].ready)),null,{timeout:120000});
const r=await p.evaluate(()=>{const o={};for(const k of Object.keys(EXPEDITION)){const P=CHAMP_PACK[CROMA_SKINS[k+'_croma'].packs[k]],c=document.createElement('canvas');c.width=P.fw;c.height=P.fh;c.getContext('2d').drawImage(P.atlas,0,0,P.fw,P.fh,0,0,P.fw,P.fh);o[k]={png:c.toDataURL(),changed:P.cosmeticChangedPixels};}return o;});
for(const [k,v] of Object.entries(r)){fs.writeFileSync(path.join(OUT,k+'.png'),Buffer.from(v.png.split(',')[1],'base64'));if(process.env.WRITE)fs.writeFileSync(`assets/sprites/champions/${k}/croma-preview.png`,Buffer.from(v.png.split(',')[1],'base64'));}
console.log(JSON.stringify(Object.fromEntries(Object.entries(r).map(([k,v])=>[k,v.changed])),null,0),'errores',errs.length);
}finally{await b.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
