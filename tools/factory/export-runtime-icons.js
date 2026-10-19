'use strict';
// Export the existing native renderer, never redraw or replace the game's icon definitions.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'art-source/entregas/2026-10_mundo/ui/iconos');
const ids='idolo figura antena cuerno caballo huellas silencio ticket agujero enlace cadena chispa estrella murcielago orbe carrito pechera vapor intercambio'.split(' ');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const write=process.argv.includes('--write'),source=fs.readFileSync(path.join(root,'js/ui/pixel-icons.js'),'utf8');
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),args:['--no-sandbox']});
 try{
  const page=await browser.newPage();await page.addScriptTag({content:source});
  const icons=await page.evaluate(ids=>ids.map(id=>{
   if(!PXI_ART[id]||PXI_NAME[id]===undefined)throw Error('Missing icon/name: '+id);
   const cv=_pxiCanvas(id),data=cv.getContext('2d').getImageData(0,0,16,16).data,colors=new Set(),opaque=[];
   for(let i=0;i<data.length;i+=4){if(data[i+3]!==0&&data[i+3]!==255)throw Error('Nonbinary alpha '+id);if(data[i+3]){const color='#'+[data[i],data[i+1],data[i+2]].map(v=>v.toString(16).padStart(2,'0')).join('');colors.add(color);opaque.push(i);}}
   if(!opaque.length||[...colors].filter(c=>c!==PXI_PAL.k).length>6)throw Error('Palette/empty violation: '+id);
   return {id,name:PXI_NAME[id],rows:PXI_ART[id],palette:[...colors].sort(),emojis:Object.keys(PXI_EMOJI).filter(e=>PXI_EMOJI[e]===id),url:cv.toDataURL('image/png'),rgba:Array.from(data)};
  }),ids);
  const entries=[];
  // Validate every existing export before writing any file.
  for(const icon of icons){
   const bytes=Buffer.from(icon.url.split(',')[1],'base64'),file=path.join(dir,icon.id+'.png');
   if(fs.existsSync(file)&&!bytes.equals(fs.readFileSync(file)))throw Error('Export differs from current renderer: '+icon.id);
   if(!write&&!fs.existsSync(file))throw Error('Missing export: '+icon.id);
   entries.push({id:icon.id,name:icon.name,emojis:icon.emojis,size:[16,16],palette:icon.palette,pngSha256:hash(bytes),rgbaSha256:hash(Buffer.from(icon.rgba)),file:path.relative(root,file),grid:icon.rows});
  }
  if(write){fs.mkdirSync(dir,{recursive:true});for(const icon of icons)fs.writeFileSync(path.join(dir,icon.id+'.png'),Buffer.from(icon.url.split(',')[1],'base64'));}
  const report={schema:1,status:'EXACT_RUNTIME_EXPORT',source:'js/ui/pixel-icons.js',sourceSha256:hash(source),renderer:'_pxiCanvas',note:'Existing runtime designs, not new designs. No owner approval or public deployment claimed.',icons:entries};
  const file=path.join(dir,'entrega.json');
  if(write)fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');
  else if(JSON.stringify(JSON.parse(fs.readFileSync(file)))!==JSON.stringify(report))throw Error('Stale export receipt');
  console.log(JSON.stringify({status:'PASS',exports:entries.length,mode:write?'write':'verify',exactRuntimePixels:true}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
