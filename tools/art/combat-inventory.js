'use strict';
// Reproducible evidence, not a declaration that art is complete.
// CHROMIUM_PATH=/path/to/chromium node tools/art/combat-inventory.js [output-directory]
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const H=require('../lib/serve'),ROOT=H.ROOT,OUT=path.resolve(ROOT,process.argv[2]||'docs/art-audit/combat-inventory');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const tracked=cp.execFileSync('git',['ls-files','-z'],{cwd:ROOT,encoding:'utf8'}).split('\0').filter(Boolean);
const code=tracked.filter(p=>/^(js\/|css\/)|^(index|crystal-wars)\.html$/.test(p)&&/\.(js|css|html)$/.test(p));
const texts=Object.fromEntries(code.map(p=>[p,fs.readFileSync(path.join(ROOT,p),'utf8')]));
const refs=new Map(),dynamic=[];
for(const [file,text] of Object.entries(texts)){
 for(const m of text.matchAll(/["'`](assets\/[^"'`\s<>]+)["'`]/g)){
  const raw=m[1],line=text.slice(0,m.index).split('\n').length;
  if(raw.includes('${')||! /\.[a-z0-9]+(?:[?#].*)?$/i.test(raw)){dynamic.push({file,line,expression:raw});continue;}
  const p=raw.split(/[?#]/)[0];if(!refs.has(p))refs.set(p,[]);refs.get(p).push({file,line});
 }
}
const media=tracked.filter(p=>p.startsWith('assets/')&&/\.(png|webp|jpe?g|svg|gif|ico|avif|woff2?|ttf|mp3|ogg|wav)$/i.test(p));
const group=p=>/\/champions\//.test(p)?(/\/skins\/|\/cromas\//.test(p)?'skins':'heroes'): /\/summons\//.test(p)?'summons':/\/bosses\//.test(p)?'bosses':/\/enemies\//.test(p)?'enemies':/\/vfx\//.test(p)?'vfx':/\/ui\//.test(p)?'ui':/\/arenas\//.test(p)?'arena_props':/\.(mp3|ogg|wav)$/.test(p)?'audio':'other';
const files=media.map(p=>{const b=fs.readFileSync(path.join(ROOT,p));return {path:p,categoryHint:group(p),bytes:b.length,sha256:sha(b),literalReferences:refs.get(p)||[]};});
const declarations=[];
for(const [file,text] of Object.entries(texts))for(const m of text.matchAll(/(?:const|let|var)\s+([A-Z][A-Z_0-9]+)\s*=/g))if(/(?:ATLAS|PACK|_IMG$|_META$|_PIECES$|_TEX$|VFX_SPR_EXTRA|ENEMY_PROJ|^PXI_ART$|^UF$|_MAP$|^GRIDS$|^PAL$)/.test(m[1]))declarations.push({name:m[1],file,line:text.slice(0,m.index).split('\n').length});
fs.mkdirSync(OUT,{recursive:true});
const write=(n,v)=>fs.writeFileSync(path.join(OUT,n),JSON.stringify(v,null,2)+'\n');
(async()=>{
 const site=await H.startSite(),browser=await H.launch(),errors=[],httpFailures=[];
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800},serviceWorkers:'block'});
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(site.url)&&r.status()>=400)httpFailures.push({path:new URL(r.url()).pathname,status:r.status()});});
  await page.route('**/*',r=>new URL(r.request().url()).origin===site.url?r.continue():r.abort());
  await page.goto(site.url+'/?lazy=1');await page.waitForFunction(()=>typeof CHAMP_PACK!=='undefined'&&typeof makeHero==='function');
  await page.evaluate(()=>{loop=function(){};cromaLoadAll();for(const id in SET_SKINS)skinDefOf(id);if(typeof assetsStartRest==='function')assetsStartRest();for(const k in CLASSES)assetsStartGroup('ch:'+k);});
  await page.waitForFunction(()=>Object.values(CHAMP_PACK).every(p=>p.ready||p.failed),null,{timeout:120000});
  const data=await page.evaluate(names=>{
   const clean=(v,seen=new WeakSet(),depth=0)=>{
    if(v==null||typeof v==='string'||typeof v==='number'||typeof v==='boolean')return v;
    if(typeof v==='function')return '[function]';if(depth>12)return '[depth limit]';
    if(v instanceof HTMLImageElement){const src=v.__pngSrc||v.src||'';return {image:src.startsWith('data:')?'inline-image':src.replace(location.origin+'/',''),loaded:v.complete&&v.naturalWidth>0,width:v.naturalWidth,height:v.naturalHeight};}
    if(v instanceof HTMLCanvasElement)return {proceduralCanvas:true,width:v.width,height:v.height};
    if(typeof v!=='object')return String(v);if(seen.has(v))return '[shared/circular]';seen.add(v);
    if(Array.isArray(v))return v.map(x=>clean(x,seen,depth+1));
    return Object.fromEntries(Object.entries(v).filter(([k])=>!['cache','stats'].includes(k)).map(([k,x])=>[k,clean(x,seen,depth+1)]));
   };
   const registries={},unavailable=[];for(const n of names)try{registries[n]=clean(eval(n));}catch(e){unavailable.push({name:n,reason:e.message});}
   const heroes=Object.entries(CLASSES).map(([id,c])=>({id,name:c.name,role:c.role,skills:c.skills.map(s=>({name:s.name,desc:s.desc})),ultimate:{name:c.ultimate.name,desc:c.ultimate.desc},codexReference:'assets/ui/codex/champions/'+id+'.png'}));
   const skins=[...Object.entries(SET_SKINS).map(([id,s])=>({id,kind:'set',champ:s.champ,definition:clean(s)})),...Object.entries(CROMA_SKINS).map(([id,s])=>({id,kind:'croma',champ:s.champ,definition:clean(s)}))];
   for(const [champ,list] of Object.entries(ASCENSION_SKINS))list.forEach((s,i)=>skins.push({id:champ+'_alt'+(i+1),kind:'ascension',champ,asc:i+1,definition:clean(s)}));
   return {heroes,skins,enemies:Object.entries(ENEMY_BASE).map(([id,e])=>({id,...clean(e)})),registries,unavailable};
  },[...new Set(declarations.map(x=>x.name))]);
  console.log('registered',data.heroes.length,'heroes',data.skins.length,'appearances',data.enemies.length,'enemies');
  write('files.json',files);write('registries.json',{declarations,...data});
  // Probe every hero/skin using the actual renderer. Four time samples are coverage evidence,
  // NOT the complete unique-frame count; the raw and normalized pack sets are saved separately.
  const probes=await page.evaluate(({heroes:roster,skins})=>{
   selectedClass='tanque';currentArena='bosque';lobbyAllies=[];startRun(1);state='paused';window.ART_GATE_NO_VFX=true;
   const cv=document.createElement('canvas');cv.width=cv.height=320;const g=cv.getContext('2d',{willReadFrequently:true});
   const saved=ctx,original=g.drawImage.bind(g),rows=[];let calls=[];
   g.drawImage=function(im,...args){const source=im._srcImg||im,src=source.__pngSrc||source.src||'canvas';calls.push({source:src.startsWith('data:')?'inline-image':src.replace(location.origin+'/',''),rect:args.slice(0,4)});return original(im,...args);};
   const views={down:[0,1],side:[1,0],up:[0,-1],left:[-1,0]},states=['idle','walk','attack','cast','ultimate','hit','death'];
   try{ctx=g;
    for(const hero of roster){const looks=[{id:hero.id},...skins.filter(s=>s.champ===hero.id)];for(const look of looks){
     const records=[];
     for(const [dir,[fx,fy]] of Object.entries(views))for(const st of states){const samples=[];
      for(let n=0;n<4;n++){
       const h=makeHero(hero.id,true,0,0);Object.assign(h,{x:0,y:0,fx,fy,_pdir:dir==='left'?'side':dir,_pleft:dir==='left',moving:st==='walk',animT:n*130,attackAnim:['attack','cast','ultimate'].includes(st)?400-n*100:0,_aDur:400,_aPrev:400,hurtTimer:st==='hit'?160-n*40:0,_packCastUntil:['cast','ultimate'].includes(st)?Infinity:0,portCastState:st==='ultimate'?'ultimate':'cast',_animCastKind:st==='ultimate'?2:1,_deadAt:10000,alive:st!=='death'});
       if(look.asc)h.ascSkin=look.asc;else h._codexSkin=look.id===hero.id?null:look.id;
       animNow=st==='death'?10000+n*170:10000+n*230;calls=[];g.clearRect(0,0,320,320);g.save();g.translate(160,260);g.imageSmoothingEnabled=false;let error=null;
       try{if(st==='death')drawFallenHero(h);else drawHeroBody(h,h.scale,false,false);}catch(e){error=e.message;}finally{g.restore();}
       const d=g.getImageData(0,0,320,320).data;let count=0,hash=2166136261;for(let i=0;i<d.length;i++){hash=Math.imul(hash^d[i],16777619);if(i%4===3&&d[i]>0)count++;}
       samples.push({sample:n,pixels:count,signature:(hash>>>0).toString(16),draws:calls,error});
      }records.push({state:st,direction:dir,samples});
     }rows.push({hero:hero.id,appearance:look.id,records});
    }}
   }finally{ctx=saved;}return rows;
  },data);
  write('files.json',files);write('literal-references.json',[...refs].map(([p,references])=>({path:p,exists:fs.existsSync(path.join(ROOT,p)),references})));
  write('registries.json',{declarations,...data});write('hero-runtime.json',probes);
  const summary={schemaVersion:1,baseCommit:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim(),scopeComplete:false,
   counts:{trackedMediaFiles:files.length,heroes:data.heroes.length,skins:data.skins.length,enemyTypes:data.enemies.length,enemyRanks:data.enemies.reduce((a,e)=>(a[e.rank]=(a[e.rank]||0)+1,a),{}),heroAppearancesProbed:probes.length},
   categories:['heroes','skins','summons','transformations','vfx','projectiles','props','ui','enemies','minibosses','bosses'],
   globalMissingAssets:null,globalMissingFrames:null,
   completed:['all tracked media files hashed','all literal asset references in runtime JS/CSS/entry HTML indexed','live hero, skin and enemy registries captured','hero and skin actual renderer sampled in seven states and four directions'],
   pending:['review dynamic expressions and generated paths','classify summons, transformations, props and projectiles by actual use (registry/code evidence available)','full enemy renderer coverage','per-frame artistic review against codex and master; sampled visibility is not PASS','reachable branches outside sampled states, multiplayer and arena-specific variants'],
   dynamicExpressions:dynamic,unavailableRegistries:data.unavailable,httpFailures,errors,
   classificationRules:{missing:'required resource absent, after resolving path and intended fallback',technical:'load, crop, alpha, pivot or runtime failure',artistic:'visual comparison, never inferred from filename or alpha alone',proceduralIntentional:'explicit design/code evidence; absence of PNG is not a missing asset',unknown:'unreviewed or insufficient evidence'},
   integratedThisRun:{newAssetFiles:0,replacedAssetFiles:0,uniqueFrames:0}};
  write('summary.json',summary);
  console.log(JSON.stringify({counts:summary.counts,errors,httpFailures:httpFailures.length,scopeComplete:false}));
 }finally{await browser.close();await site.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
