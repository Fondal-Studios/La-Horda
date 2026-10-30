'use strict';
const fs=require('node:fs'),path=require('node:path'),H=require('../lib/serve');
const src=fs.readFileSync(path.join(H.ROOT,'tools/art/pixel-density.js'),'utf8');
const cut=(a,b)=>src.slice(src.indexOf(a),src.indexOf(b));
(async()=>{const s=await H.startSite(),b=await H.launch();try{
 const p=await b.newPage();await H.goto(p,s.url+'/?lazy=1');
 await p.waitForFunction(()=>typeof arenaWorldPack==='function');
 await p.evaluate(()=>{loop=function(){};arenaWorldPack('hielo');arenaWorldPack('bosque');});
 await p.waitForFunction(()=>arenaWorldReady('hielo')&&arenaWorldReady('bosque'));
 await p.addScriptTag({content:cut('const CANON =','const FLOOR_SCALE')+cut('function analyzeInPage','function walk')+cut('function classify','(async () => {')});
 const result=await p.evaluate(()=>{
  const rows=[];
  for(const arena of ['hielo','bosque'])for(const [key,f]of Object.entries(ARENA_WORLD_MANIFEST[arena].frames)){
   const c=document.createElement('canvas');c.width=f.w;c.height=f.h;const g=c.getContext('2d');
   g.drawImage(ARENA_WORLD_PACKS[arena].img,f.x,f.y,f.w,f.h,0,0,f.w,f.h);
   const r=analyzeInPage(g.getImageData(0,0,f.w,f.h).data,f.w,f.h,8);
   rows.push({arena,key,...r,...classify('escenario',r,null,arena+'.png')});
  }
  return rows;
 });
 fs.writeFileSync(path.join(H.ROOT,'docs/art-gate/arena-world-20261029/density.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({frames:result.length,styleFlags:result.filter(x=>x.issues.length).map(x=>({arena:x.arena,key:x.key,issues:x.issues})),note:'Informational style heuristic; visual approval is separate. Scale is evaluated in the game screenshots.'}));
}finally{await b.close();await s.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
