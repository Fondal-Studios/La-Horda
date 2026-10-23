'use strict';
// B119: atlas nativo y consumidor real. No certifica contraste compuesto ni un dispositivo.
const fs=require('node:fs'),path=require('node:path'),H=require('../lib/serve');
const OUT=process.env.OUT||'art-source/entregas/brakk-kit-20261022/correccion-06';
const src=fs.readFileSync(path.join(OUT,'kit-before.js'),'utf8');
const parent=src.slice(src.indexOf('function brakkFxStrip('),src.indexOf('for(const kind of '));
(async()=>{const site=await H.startSite(),browser=await H.launch();try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await H.goto(page,site.url+'/');await page.waitForFunction(()=>assetsAllReady());
 const r=await page.evaluate(parent=>{
  const old=eval('('+parent+')'),now=brakkFxStrip,checks=[],check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
  let draws=0;const rnd=Math.random;Math.random=()=>{draws++;return .5;};
  const rows=[];
  for(const arena of ['bosque','hielo','infernal','laberinto','acuatica','minas'])for(const variant of ['','~h','~p']){
   currentArena=arena;sfaCache.clear();const b=sfaBake('aura','brakk_repair'+variant,0),d=b.cv.getContext('2d').getImageData(0,0,b.cv.width,b.cv.height).data;
   let clipped=0,center=0,soft=0,opaque=0;for(let f=0;f<b.n;f++)for(let y=0;y<b.h;y++)for(let x=0;x<b.w;x++){
    const a=d[(y*b.cv.width+f*b.w+x)*4+3];if(!a)continue;opaque++;if(a!==255)soft++;if(x===0||x===b.w-1||y===0||y===b.h-1)clipped++;if(x>=12&&x<=35)center++;
   }
   rows.push({arena,variant,width:b.w,height:b.h,frames:b.n,clipped,center,soft,opaque});
   check('open silhouette '+arena+variant,b.w===48&&b.h===56&&b.n===12&&!clipped&&!center&&!soft&&opaque>0,rows.at(-1));
   const specs=[['beam','brakk_build',12],['burst','brakk_deploy',64],['beam','brakk_nails',12],['burst','brakk_repair',48],['nova','siege',64]];
   for(const [art,th,size]of specs){const a=sfaBake(art,th+variant,size).cv.toDataURL();brakkFxStrip=old;sfaCache.clear();const b=sfaBake(art,th+variant,size).cv.toDataURL();brakkFxStrip=now;sfaCache.clear();check('unchanged '+arena+variant+' '+art+'/'+th,a===b);}
  }
  check('baking consumes zero combat RNG',draws===0,draws);Math.random=rnd;
  selectedClass='brakk';currentArena='bosque';lobbyAllies=[];startRun(3);state='menu';sfaReset();
  const c=document.createElement('canvas');c.width=300;c.height=300;const g=c.getContext('2d'),di=g.drawImage.bind(g),calls=[];g.drawImage=(...a)=>{calls.push(a.slice(1));return di(...a);};
  const s={art:'aura',theme:'brakk_repair~p',x:0,y:0,r:24,t:1500,dur:3000,fi:heroes.indexOf(player)};
  animNow=1500;sfaDrawOne(s,g);const first=calls.at(-1);player.x+=15;player.y-=9;sfaDrawOne(s,g);const second=calls.at(-1);
  check('real draw uses native 48x56 source',first[2]===48&&first[3]===56,first);
  check('real draw follows moved owner',Math.abs(second[4]-first[4]-15)<1e-6&&Math.abs(second[5]-first[5]+9)<1e-6,{first,second});
  const n=calls.length;player.alive=false;sfaDrawOne(s,g);check('dead owner stops draw without extending duration',calls.length===n&&s.t===s.dur&&s.dur===3000);
  return {checks,rows};
 },parent);
 fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,'composition-verification.json'),JSON.stringify({...r,errors},null,2)+'\n');console.log(JSON.stringify({checks:r.checks.length,failed:r.checks.filter(c=>!c.pass),errors}));if(errors.length||r.checks.some(c=>!c.pass))process.exitCode=1;
 }finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
