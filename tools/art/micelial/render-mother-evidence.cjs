'use strict';
// Calls the real baseline/candidate Canvas renderer with controlled encounter snapshots.
// This is isolated renderer evidence, NOT a substitute for the browser encounter test.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
const {createCanvas,loadImage,ImageData}=require('@napi-rs/canvas');
const ROOT=path.resolve(__dirname,'../../..'),OUT=path.resolve(process.argv[2]||'/tmp/madre-render-evidence');fs.mkdirSync(OUT,{recursive:true});
async function scene(source){
 const c=createCanvas(640,580),ctx=c.getContext('2d');
 const s={Image:class{},ImageData,VFX_SPR_EXTRA:{},MIC_CFG:{madre:{closeMs:2600}},MIC_MOTHER_POS:{x:0,y:125},runElapsedMs:0,micS:{mo:{st:'fight'}},ctx,console,document:{createElement:()=>createCanvas(1,1)},vfxBurst:()=>{}};
 s.glowSprite=()=>{const g=createCanvas(64,64),p=g.getContext('2d'),r=p.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,80,190,.4)');r.addColorStop(1,'rgba(255,80,190,0)');p.fillStyle=r;p.fillRect(0,0,64,64);return g;};
 vm.createContext(s);vm.runInContext(source,s);
 for(const n of ['mp_full','mp_cap','mp_arm_l','mp_arm_r','mp_atlas']){
   const file=n==='mp_atlas'?'assets/sprites/arenas/micelial/madre_espora/atlas.png':'assets/sprites/arenas/micelial/mother/'+n+'.png';
   s.loaded=await loadImage(path.join(ROOT,file));vm.runInContext(`MIC_MP.${n}=loaded;MIC_MP_OK.${n}=true`,s);
 }
 return {s,c,ctx};
}
function draw(o,e,M,t){
 const {s,c,ctx}=o;ctx.resetTransform();ctx.globalAlpha=1;ctx.fillStyle='#17101f';ctx.fillRect(0,0,c.width,c.height);
 ctx.strokeStyle='#36283f';ctx.lineWidth=1;for(let x=0;x<640;x+=32){ctx.beginPath();ctx.moveTo(x,40);ctx.lineTo(x,580);ctx.stroke()}
 for(let y=40;y<580;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(640,y);ctx.stroke()}
 ctx.save();ctx.translate(320,320);s.micS={mo:M,dead:M.st==='dying'&&M.t>=3200};s.runElapsedMs=t;
 if(M.st==='dying'||M.st==='dead')s._micDrawMotherDying(t/1000);else s._micDrawMother(e,t/1000);
 ctx.strokeStyle='#79ac95';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-300,205);ctx.lineTo(300,205);ctx.stroke();ctx.restore();
}
(async()=>{
 const baseline=await scene(cp.execFileSync('git',['show','34ac2852:js/arenas/micelial/mic-render.js'],{cwd:ROOT,encoding:'utf8'}));
 const current=await scene(fs.readFileSync(path.join(ROOT,'js/arenas/micelial/mic-render.js'),'utf8'));
 const sets=[['idle',{}, {st:'fight'}],['windup',{packSet:'atk',packDur:1500,packTimer:1000,bossWind:{t:500,dur:1000}},{st:'fight'}],['impact',{packSet:'atk',packDur:1500,packTimer:490},{st:'fight'}],['phase2-attack',{packSet:'atk',packDur:1500,packTimer:490}, {st:'fight',bloom:1,ph:2}],['phase3-attack',{packSet:'atk',packDur:1500,packTimer:490}, {st:'fight',heart:1,ph:3}],['bloom',{}, {st:'fight',bloom:1,ph:2}],['open',{}, {st:'fight',tr:{to:3,t:2000}}],['heart',{}, {st:'fight',heart:1,ph:3}],['death',{}, {st:'dying',t:6700}]];
 for(const [name,e,M]of sets){
  const out=createCanvas(1280,580),g=out.getContext('2d');draw(baseline,e,M,1800);draw(current,e,M,1800);g.drawImage(baseline.c,0,0);g.drawImage(current.c,640,0);
  g.fillStyle='#eee';g.font='20px sans-serif';g.fillText('MAIN: portrait / '+name,20,28);g.fillText('CANDIDATE: authored frames / '+name,660,28);
  fs.writeFileSync(path.join(OUT,name+'.png'),out.toBuffer('image/png'));
 }
 const out=createCanvas(1280,580),g=out.getContext('2d');
 for(let i=0;i<210;i++){
   const t=i*100;let M={st:'fight'},e={};let label='idle';
   if(t>=2000&&t<3500){const x=t-2000;e={packSet:'atk',packDur:1500,packTimer:1500-x};if(x<1000)e.bossWind={t:x,dur:1000};label='windup / impact / recovery';}
   else if(t>=4000&&t<7100){M.tr={to:2,t:t-4000};label='phase transition';}
   else if(t>=7100&&t<9500){M.bloom=1;label='bloom';}
   else if(t>=9500&&t<12100){M.tr={to:3,t:t-9500};label='heart opening';}
   else if(t>=12100){M.heart=1;label='heart';}
   if(t>=14000&&t<15500){const x=t-14000;e={packSet:'atk',packDur:1500,packTimer:1500-x};if(x<1000)e.bossWind={t:x,dur:1000};label='phase3 attack';}
   if(t>=17000){M={st:'fight',bloom:1};label='phase2 idle';if(t<18500){const x=t-17000;e={packSet:'atk',packDur:1500,packTimer:1500-x};if(x<1000)e.bossWind={t:x,dur:1000};label='phase2 attack';}}
   draw(baseline,e,M,t);draw(current,e,M,t);g.drawImage(baseline.c,0,0);g.drawImage(current.c,640,0);
   g.fillStyle='#eee';g.font='20px sans-serif';g.fillText('MAIN portrait: '+label,20,28);g.fillText('CANDIDATE authored frames: '+label,660,28);
   fs.writeFileSync(path.join(OUT,'frame-'+String(i).padStart(3,'0')+'.png'),out.toBuffer('image/png'));
 }
 console.log(OUT);
})().catch(e=>{console.error(e);process.exitCode=1});
