'use strict';
const fs=require('node:fs'),H=require('../lib/serve');
const OUT='art-source/entregas/aelith-normal-kit-20261022/correccion-02';
(async()=>{const site=await H.startSite(),browser=await H.launch();try{
const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await H.goto(page,site.url);await H.waitFor(page,()=>typeof startRun==='function'&&assetsAllReady());
const previous=fs.readFileSync(OUT+'/engine-before.js','utf8').split('const sfaDrawOne = ')[1].split('function sfaFrame')[0];await page.addScriptTag({content:'window.__beforeDraw = '+previous});
const r=await page.evaluate(()=>{
 const checks=[],check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
 netMatch=null;save.stash=[];for(const k in save.champions)Object.assign(save.champions[k],{unlocked:true,level:60,equipment:{},inventory:[],talents:{nodes:{},mastery:null,masteryNodes:{}}});selectedClass='aelith';currentArena='bosque';lobbyAllies=[];startRun(3);state='menu';enemies=[];
 const cv=document.createElement('canvas');cv.width=800;cv.height=300;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;
 const draws=[],rects=[],orig=g.drawImage.bind(g),fill=g.fillRect.bind(g);g.drawImage=function(...a){draws.push(a.slice(1));return orig(...a);};g.fillRect=function(...a){rects.push({args:a,color:this.fillStyle});return fill(...a);};
 let rng=0;const random=Math.random;Math.random=()=>{rng++;return .5;};
 const s={art:'beam',theme:'aelith_fracture~h',x:50,y:80,bx:310,by:80,w:52,fi:-2,dur:720};
 for(const t of [0,75,150,360,570,645,719]){
  draws.length=rects.length=0;sfaDrawOne({...s,t},g);const fraction=Math.min(1,t/150,(720-t)/150),a=draws[0];
  check('longitudinal opening/closure t='+t,fraction===0?draws.length===0:draws.length===1&&Math.abs(a[2]/224-fraction)<1e-9&&Math.abs(a[6]/260-fraction)<1e-9,{draw:a});
  check('full reach trace retained t='+t,rects.length===1&&rects[0].args[2]===260&&rects[0].color!=='#000000',rects[0]);
 }
 for(const theme of ['time','siege'])for(const art of ['beam','nova','aura']){
  const args={...s,theme,art,t:220,r:55};g.clearRect(0,0,800,300);g.globalAlpha=1;__beforeDraw(args,g);const old=cv.toDataURL();g.clearRect(0,0,800,300);g.globalAlpha=1;sfaDrawOne(args,g);check('shared renderer preserved '+theme+'/'+art,cv.toDataURL()===old);
 }
 let invalidSafe=true;try{sfaDrawOne({...s,theme:'missing-theme',t:220},g);}catch(e){invalidSafe=false;}check('missing beam theme keeps safe fallback',invalidSafe);
 const samples=[];for(const now of [1000,9000]){animNow=now;draws.length=0;sfaDrawOne({...s,t:300},g);samples.push(JSON.stringify(draws));}
 check('fracture does not use global phase',samples[0]===samples[1]);
 for(const arena of ['bosque','hielo','infernal','laberinto','acuatica','minas']){
  currentArena=arena;const b=sfaBake('beam','aelith_fracture~h',16),im=b.cv.getContext('2d').getImageData(0,0,b.cv.width,b.cv.height).data;let soft=0,edge=0,ink=0;
  for(let y=0;y<b.h;y++)for(let x=0;x<b.cv.width;x++){const a=im[(y*b.cv.width+x)*4+3];if(a){ink++;if(a!==255)soft++;if(x%b.w===0||x%b.w===b.w-1||y===0||y===b.h-1)edge++;}}
  check('crisp full-length padded atlas '+arena,b.w===224&&b.h===40&&b.n===12&&ink>0&&soft===0&&edge===0,{ink,soft,edge});
 }
 currentArena='bosque';check('H2 palette stays lilac white',sfaTheme('aelith_fracture~h').pal.b==='#d9c9f5');
 const h=player,shot=aelithTrailStamp(h),get=()=>shot.getContext('2d').getImageData(0,0,160,160).data,amber=get(),aa=[];for(let i=3;i<amber.length;i+=4)aa.push(amber[i]);aelithTrailPaint(shot,true);const debt=get(),da=[];for(let i=3;i<debt.length;i+=4)da.push(debt[i]);
 check('debt recolor preserves equipped-body alpha exactly',JSON.stringify(aa)===JSON.stringify(da)&&aa.some(x=>x>0));
 const colors=d=>{const s=new Set();for(let i=0;i<d.length;i+=4)if(d[i+3])s.add([d[i],d[i+1],d[i+2]].join(','));return [...s].sort();};
 check('amber contour distinct from interior',colors(amber).length===2,colors(amber));check('grey contour distinct from interior',colors(debt).length===2,colors(debt));
 check('trail opacity max40 and collapse ends at220ms',aelithTrailAlpha(2,0)===.4&&aelithTrailAlpha(2,.5)===.2&&[0,1,2].every(i=>aelithTrailAlpha(i,1)===0));
 check('painting and drawing consume no combat RNG',rng===0,rng);Math.random=random;
 const fracture=sfaBake('beam','aelith_fracture~h',16);
 return {checks,fracture:{w:fracture.w,h:fracture.h,n:fracture.n,png:fracture.cv.toDataURL()},amber:{colors:colors(amber)},debt:{colors:colors(debt)}};
});
fs.writeFileSync(OUT+'/fracture-glass.png',Buffer.from(r.fracture.png.split(',')[1],'base64'));delete r.fracture.png;const status=errors.length||r.checks.some(c=>!c.pass)?'FAIL':'PASS';fs.writeFileSync(OUT+'/silhouette-tests.json',JSON.stringify({status,...r,errors},null,2)+'\n');console.log(JSON.stringify({status,checks:r.checks.length,failed:r.checks.filter(c=>!c.pass),errors}));if(status==='FAIL')process.exitCode=1;
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
