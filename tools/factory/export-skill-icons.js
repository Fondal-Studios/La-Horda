'use strict';
// Export existing game HUD pixels, never generate replacement art or close inventory tasks.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const H=require('../lib/serve'),ROOT=path.resolve(__dirname,'../..');
const DIR='art-source/entregas/2026-10_mundo/iconos/habilidades';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const write=process.argv.includes('--write'),items=JSON.parse(fs.readFileSync(path.join(ROOT,'art-source/entregas/control_produccion.json'))).items.filter(x=>x.id.startsWith('B-ICON-'));
 if(!items.length)throw Error('No inventory icon tasks');
 const site=await H.startSite();let browser;
 try{
  browser=await H.launch();
  const page=await browser.newPage({viewport:{width:844,height:390}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(site.url+'/?lazy=0');await page.waitForFunction(()=>typeof updateAbilityButtons==='function'&&typeof pxiIconAudit==='function');
  const rows=[];
  for(const item of items){
   if(!item.destino.startsWith(DIR+'/')||item.destino.includes('..'))throw Error('Unexpected export path');
   const id=item.id.slice('B-ICON-'.length),split=id.lastIndexOf('-'),champ=id.slice(0,split),slot=id.slice(split+1);
   const file=path.join(ROOT,item.destino),previous=fs.existsSync(file)?fs.readFileSync(file):null;
   const row=await page.evaluate(async({champ,slot,previous})=>{
    const decode=async uri=>{const im=new Image();im.src=uri;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);return {w:im.width,h:im.height,data:Array.from(g.getImageData(0,0,im.width,im.height).data),url:c.toDataURL()};};
    const idx=slot==='ult'?3:Number(slot.slice(1))-1,category=slot==='ult'?'ult':slot==='basic'?'basic':'skill';
    let uri,label;
    if(champ==='ilkan_colossus'){
     uri=skillPixelGlyphUri(champ,idx);label=champ+':'+slot;
    }else{
     const key=champ==='generico'?'tanque':champ;if(!CLASSES[key])throw Error('Unknown champion '+key);
     if(window.__exportChamp!==key){for(const c of Object.values(save.champions)){c.unlocked=true;c.level=20;}
      selectedClass=key;currentArena='bosque';lobbyAllies=['tanque'];netMatch=null;startRun(3);setState('playing');updateHUD();updateAbilityButtons();window.__exportChamp=key;}

     const button=champ==='generico'?{basic:'btn-basic',heal:'btn-emerg',pact:'btn-pact'}[slot]:['btn-s1','btn-s2','btn-s3','btn-ult'][idx];
     const el=document.getElementById(button),im=el?.querySelector('.ico img');if(!im)throw Error('Missing HUD image '+champ+':'+slot);
     uri=im.src;label=el.getAttribute('aria-label')||el.title||el.textContent;
    }
    if(!uri)throw Error('Missing icon '+champ+':'+slot);
    const actual=await decode(uri),issues=pxiIconAudit(actual.data,actual.w,actual.h,category);
    if(issues.length)throw Error(champ+':'+slot+' '+issues.join('; '));
    if(previous){const old=await decode('data:image/png;base64,'+previous);if(old.w!==actual.w||old.h!==actual.h||old.data.some((v,i)=>v!==actual.data[i]))throw Error('Stored pixels differ '+champ+':'+slot);}
    return {...actual,category,label};
   },{champ,slot,previous:previous?.toString('base64')});
   if(!previous&&!write)throw Error('Missing export '+item.destino);
   rows.push({item,row,bytes:previous||Buffer.from(row.url.split(',')[1],'base64')});
  }
  if(errors.length)throw Error(errors.join('; '));
  const sources=['js/ui/pixel-icons.js','js/ui/skill-glyphs.js','js/ui/skill-pixel-glyphs.js','js/ui/skill-icon-motifs.js'];
  const report={schema:1,status:'EXACT_EXISTING_RUNTIME_EXPORT',note:'Existing HUD designs, not newly drawn assets. Inventory completion, art approval and public deployment are separate.',sources:Object.fromEntries(sources.map(f=>[f,sha(fs.readFileSync(path.join(ROOT,f)))])),icons:rows.map(({item,row,bytes})=>({task:item.id,block:item.bloque,file:item.destino,size:[row.w,row.h],category:row.category,label:row.label,pngSha256:sha(bytes),rgbaSha256:sha(Buffer.from(row.data))}))};
  const receipt=path.join(ROOT,DIR,'entrega.json');
  if(write){fs.mkdirSync(path.dirname(receipt),{recursive:true});for(const {item,bytes}of rows)if(!fs.existsSync(path.join(ROOT,item.destino)))fs.writeFileSync(path.join(ROOT,item.destino),bytes);fs.writeFileSync(receipt,JSON.stringify(report,null,2)+'\n');}
  else if(JSON.stringify(JSON.parse(fs.readFileSync(receipt)))!==JSON.stringify(report))throw Error('Stale receipt');
  console.log(JSON.stringify({status:'PASS',exports:rows.length,mode:write?'write':'verify',exactRuntimePixels:true}));
 }finally{if(browser)await browser.close();await site.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
