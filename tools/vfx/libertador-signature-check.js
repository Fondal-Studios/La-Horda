'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),H=require('../lib/serve');
const out=process.env.OUT;fs.mkdirSync(out,{recursive:true});
(async()=>{const site=await H.startSite(),browser=await H.launch();try{
 const errors=[],runs=[];for(const parent of [true,false]){
  const p=await browser.newPage();p.on('pageerror',e=>errors.push(e.message));
  if(parent)await p.route('**/js/skills/champion-signatures.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(path.join(out,'signatures-before.js'),'utf8')}));
  await p.goto(site.url+'/?lazy=0');await p.waitForFunction(()=>typeof drawChampionSignatures==='function');await p.evaluate(()=>{loop=()=>{};});
  const r=await p.evaluate(()=>{
   const real=ctx,view=inView,cv=document.createElement('canvas');cv.width=320;cv.height=320;ctx=cv.getContext('2d');inView=()=>true;
   const rng=Math.random;let calls=0;Math.random=()=>{calls++;return rng();};const samples=[];
   try{for(const key of ['libertador','morwen','maura','brakk','mago','tanque','iria','other'])for(const ult of [false,true])for(const slot of [0,1,2])for(const t of [0,80,180,350]){
     championSignaturesReset();vfxChampionSignature(160,200,key,slot,ult,0);const s=championSignatures.find(s=>s.on);s.t=t;
     const before=JSON.stringify(championSignatures);ctx.clearRect(0,0,320,320);drawChampionSignatures();samples.push({key,ult,slot,t,unchanged:before===JSON.stringify(championSignatures),png:cv.toDataURL()});
   }
   const native=[],extra=[];let atlas=null;if(typeof libertadorSignatureAtlas!=='undefined'&&libertadorSignatureAtlas){atlas=libertadorSignatureAtlas.toDataURL();for(let slot=0;slot<3;slot++)for(let f=0;f<4;f++){
    const g=libertadorSignatureAtlas.getContext('2d'),d=g.getImageData(f*32,slot*32,32,32).data;let partial=0,border=0,opaque=0;
    for(let y=0;y<32;y++)for(let x=0;x<32;x++){const a=d[(y*32+x)*4+3];if(a){opaque++;if(a!==255)partial++;if(!x||!y||x===31||y===31)border++;}}native.push({slot,f,opaque,partial,border});}
   }
   if(atlas){
    libertadorSignatureAtlas=null;championSignaturesReset();vfxChampionSignature(160,200,'libertador',1,false,0);drawChampionSignatures();extra.push({name:'cold cache byte-identical atlas',ok:atlas===libertadorSignatureAtlas.toDataURL()});
    const di=ctx.drawImage,records=[],old=JUICE.reduceMotion;ctx.drawImage=function(...a){if(a[0]===libertadorSignatureAtlas)records.push(a.slice(1));return di.apply(this,a)};
    JUICE.reduceMotion=true;drawChampionSignatures();JUICE.reduceMotion=old;ctx.drawImage=di;extra.push({name:'reduced motion selects final native phase',ok:records.length===1&&records[0][0]===96});
    let fits=true;const g=libertadorSignatureAtlas.getContext('2d');for(let slot=0;slot<3;slot++)for(let f=0;f<4;f++){
     const d=g.getImageData(f*32,slot*32,32,32).data,size=slot===1?40:32,top=slot===1?146:112;for(let y=0;y<32;y++)for(let x=0;x<32;x++)if(d[(y*32+x)*4+3]&&((top-y*size/32)>140||Math.abs((x-16)*size/32)>140))fits=false;
    }extra.push({name:'all opaque pixels inside existing 140-unit culling extent',ok:fits});
   }
   championSignaturesReset();vfxChampionSignature(160,200,'libertador',1,false,0);championSignaturesUpdate(460);const expired=championSignatures.every(s=>!s.on);
   return{samples,native,atlas,extra,rng:calls,expired};
   }finally{Math.random=rng;ctx=real;inView=view;}
  });
  if(r.atlas)fs.writeFileSync(path.join(out,'launch-atlas.png'),Buffer.from(r.atlas.split(',')[1],'base64'));delete r.atlas;
  for(const s of r.samples){s.hash=crypto.createHash('sha256').update(Buffer.from(s.png.split(',')[1],'base64')).digest('hex');delete s.png;}runs.push(r);await p.close();
 }
 const unaffected=runs[0].samples.filter(s=>s.key!=='libertador'||s.ult).map(a=>({key:a.key,ult:a.ult,slot:a.slot,t:a.t,equal:a.hash===runs[1].samples.find(b=>b.key===a.key&&b.ult===a.ult&&b.slot===a.slot&&b.t===a.t).hash}));
 const ok=!errors.length&&runs.every(r=>!r.rng&&r.expired&&r.samples.every(s=>s.unchanged))&&runs[1].native.every(f=>f.opaque&&!f.partial&&!f.border)&&runs[1].extra.every(c=>c.ok)&&unaffected.every(s=>s.equal);
 fs.writeFileSync(path.join(out,'SIGNATURE_CHECK.json'),JSON.stringify({ok,errors,runs,unaffected},null,2));console.log(JSON.stringify({ok,errors,unaffected:unaffected.length,native:runs[1].native,rng:runs.map(r=>r.rng)}));if(!ok)process.exitCode=1;
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
