'use strict';
// Export the authored PXI grids through the real item UI/floor renderer. No game data writes.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),H=require('../lib/serve');
const ROOT=path.resolve(__dirname,'../..'),DIR='art-source/entregas/quality-item-icons-20261020',sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const write=process.argv.includes('--write'),site=await H.startSite();let browser;
 try{
  browser=await H.launch();const page=await browser.newPage({viewport:{width:844,height:390}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>new URL(r.request().url()).origin===site.url?r.continue():r.abort());
  await page.goto(site.url+'/?dev=1');await page.waitForFunction(()=>typeof DESIGNED_ITEMS!=='undefined'&&typeof QUALITY_ITEM_ART!=='undefined'&&typeof itemIconURL==='function');
  const saved={};if(fs.existsSync(path.join(ROOT,DIR)))for(const f of fs.readdirSync(path.join(ROOT,DIR)))if(f.endsWith('.png')&&f!=='preview.png')saved[f.slice(0,-4)]=fs.readFileSync(path.join(ROOT,DIR,f)).toString('base64');
  const result=await page.evaluate(async saved=>{
   const checks=[],check=(name,ok)=>{checks.push({name,ok});if(!ok)throw Error(name);};
   const ids=Object.keys(QUALITY_ITEM_ART).map(k=>k.slice(5)),newIds=new Set(ids),baseline={},current={};
   const clear=()=>{for(const k of Object.keys(_ICON_CACHE))delete _ICON_CACHE[k];for(const k of Object.keys(_ICON_CV))delete _ICON_CV[k];};
   const gameData=JSON.stringify(DESIGNED_ITEMS),items=Object.fromEntries(Object.keys(DESIGNED_ITEMS).map(id=>[id,makeDesignedItem(id)]));
   for(const id of ids){check('registered '+id,!!items[id]);delete PXI_ART['item_'+id];}
   clear();for(const [id,it]of Object.entries(items))baseline[id]=itemIconURL(it);
   Object.assign(PXI_ART,QUALITY_ITEM_ART);clear();for(const [id,it]of Object.entries(items))current[id]=itemIconURL(it);
   const untouched=Object.keys(items).filter(id=>!newIds.has(id));check('all other item pixels preserved',untouched.every(id=>baseline[id]===current[id]));
   check('every authored replacement changes its old icon',ids.every(id=>baseline[id]!==current[id]));
   check('all designed item icons are distinct',new Set(Object.values(current)).size===Object.keys(items).length);
   const decode=async url=>{const im=new Image();im.src=url;await im.decode();const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const ctx=cv.getContext('2d');ctx.drawImage(im,0,0);return {im,cv,data:ctx.getImageData(0,0,im.width,im.height).data};};
   const rows=[];
   for(const id of ids){
    const key='item_'+id,grid=PXI_ART[key],colors=new Set(grid.join('').replace(/[.k]/g,''));
    check('native grid and named palette '+id,grid.length===16&&grid.every(r=>r.length===16)&&colors.size<=6&&[...colors].every(c=>PXI_PAL[c])&&!!PXI_NAME[key]);
    const cv=_pxiCanvas(key),d=cv.getContext('2d').getImageData(0,0,16,16).data;
    check('binary visible alpha '+id,d.some((v,i)=>i%4===3&&v===255)&&d.every((v,i)=>i%4!==3||v===0||v===255));
    if(saved[id]){const old=await decode('data:image/png;base64,'+saved[id]);check('stored export RGBA '+id,old.cv.width===16&&old.cv.height===16&&old.data.every((v,i)=>v===d[i]));}else check('stored export RGBA '+id,true);
    const floor=itemIconCanvas(items[id]),fd=floor.getContext('2d').getImageData(0,0,32,32).data,ui=await decode(current[id]);
    let floorSame=true,uiSame=true;
    for(let y=0;y<16;y++)for(let x=0;x<16;x++)for(let c=0;c<4;c++){
     for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++)if(fd[((y*2+dy)*32+x*2+dx)*4+c]!==d[(y*16+x)*4+c])floorSame=false;
     if(d[(y*16+x)*4+3]===255)for(let dy=0;dy<4;dy++)for(let dx=0;dx<4;dx++)if(ui.data[((y*4+dy)*64+x*4+dx)*4+c]!==d[(y*16+x)*4+c])uiSame=false;
    }
    check('floor exact nearest-neighbor '+id,floorSame);check('UI uses same authored opaque pixels '+id,uiSame);
    const copy={...items[id],uid:'copy-'+id,level:99,roll:1.17};check('copies and progression preserve icon '+id,itemIconURL(copy)===current[id]);
    rows.push({id,name:PXI_NAME[key],size:[16,16],rgba:Array.from(d),url:cv.toDataURL(),ui:current[id]});
   }
   check('item definitions unchanged by rendering',gameData===JSON.stringify(DESIGNED_ITEMS));
   const cv=document.createElement('canvas');cv.width=1000;cv.height=650;const g=cv.getContext('2d');g.fillStyle='#141822';g.fillRect(0,0,1000,650);g.fillStyle='#f0e5cd';g.font='18px sans-serif';g.fillText('19 íconos originales · equipo de los cinco campeones y Alquimista',18,25);g.font='12px sans-serif';g.imageSmoothingEnabled=false;
   for(let i=0;i<rows.length;i++){const x=i%5*200,y=Math.floor(i/5)*150+45,a=await decode(rows[i].url),b=await decode(rows[i].ui);g.drawImage(a.im,x+20,y,64,64);g.drawImage(b.im,x+105,y);const words=rows[i].name.split(' ');let line='',yy=y+85;for(const w of words){if(g.measureText(line+w).width>185){g.fillText(line,x+8,yy);yy+=15;line='';}line+=w+' ';}g.fillText(line,x+8,yy);}
   return {checks,rows,preview:cv.toDataURL(),total:Object.keys(items).length,beforeUnique:new Set(Object.values(baseline)).size,afterUnique:new Set(Object.values(current)).size,preserved:untouched.length};
  },saved);
  if(errors.length)throw Error(errors.join('; '));
  const exported=[];
  for(const row of result.rows){const file=DIR+'/'+row.id+'.png',bytes=saved[row.id]?Buffer.from(saved[row.id],'base64'):Buffer.from(row.url.split(',')[1],'base64');
   if(!write&&!fs.existsSync(path.join(ROOT,file)))throw Error('Export mismatch '+file);
   exported.push({id:row.id,name:row.name,file,size:row.size,pngSha256:sha(bytes),rgbaSha256:sha(Buffer.from(row.rgba))});
  }
  const report={schema:1,status:'PASS',scope:'19 original item icons; no champion/skin/progression changes; publication unverified',source:'js/ui/quality-five-item-icons.js',sourceSha256:sha(fs.readFileSync(path.join(ROOT,'js/ui/quality-five-item-icons.js'))),total:result.total,beforeUnique:result.beforeUnique,afterUnique:result.afterUnique,preserved:result.preserved,icons:exported,checks:result.checks,errors};
  const receipt=path.join(ROOT,DIR,'receipt.json');
  if(write){fs.mkdirSync(path.dirname(receipt),{recursive:true});for(const row of result.rows)if(!saved[row.id])fs.writeFileSync(path.join(ROOT,DIR,row.id+'.png'),Buffer.from(row.url.split(',')[1],'base64'));fs.writeFileSync(receipt,JSON.stringify(report,null,2)+'\n');fs.writeFileSync(path.join(ROOT,DIR,'preview.png'),Buffer.from(result.preview.split(',')[1],'base64'));}
  else if(JSON.stringify(JSON.parse(fs.readFileSync(receipt)))!==JSON.stringify(report)){console.error('Current icon counts',JSON.stringify({total:report.total,beforeUnique:report.beforeUnique,afterUnique:report.afterUnique,preserved:report.preserved}));throw Error('Stale authored icon evidence');}
  console.log(JSON.stringify({status:'PASS',checks:result.checks.length,total:result.total,unique:result.afterUnique,previousUnique:result.beforeUnique,exports:exported.length,preserved:result.preserved,mode:write?'write':'verify'}));
 }finally{if(browser)await browser.close();await site.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
