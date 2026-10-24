'use strict';
const fs=require('node:fs'),H=require('../lib/serve');
const OUT='art-source/entregas/morveth-kit-20261022/correccion-01';
(async()=>{const site=await H.startSite(),browser=await H.launch();try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await H.goto(page,site.url);await H.waitFor(page,()=>typeof startRun==='function'&&assetsAllReady());
 const checks=await page.evaluate(()=>{
  const checks=[],check=(name,pass,details)=>checks.push({name,pass:!!pass,details});
  selectedClass='morveth';currentArena='bosque';lobbyAllies=[];save.stash=[];for(const c of Object.values(save.champions))Object.assign(c,{unlocked:true,level:60,equipment:{},inventory:[],talents:{nodes:{},mastery:null,masteryNodes:{}}});startRun(3);state='menu';enemies=[];
  for(const arena of ['bosque','hielo','infernal','laberinto','acuatica','minas'])for(const suf of ['','~h','~p']){
   currentArena=arena;const b=sfaBake('nova','morveth_pulse'+suf,96),g=b.cv.getContext('2d'),counts=[];
   for(let f=0;f<b.n;f++){const d=g.getImageData(f*b.w,0,b.w,b.h).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;counts.push(n);}
   check('pulse dissipates '+arena+suf,counts.at(-1)===0&&counts.at(-2)>0&&counts[0]>0,{counts});
  }
  currentArena='bosque';
  for(const suf of ['', '~h', '~p']){const b=sfaBake('aura','morveth_symbiosis'+suf,0),g=b.cv.getContext('2d');let edge=0;for(let f=0;f<b.n;f++){const d=g.getImageData(f*b.w,0,b.w,b.h).data;for(let y=0;y<b.h;y++)for(const x of [0,b.w-1])if(d[(y*b.w+x)*4+3])edge++;}check('mycelium contour has side padding '+suf,edge===0,{edge});}
  const rendered=style=>{championSignaturesReset();vfxSkillCone(player.x,player.y,210,0,.85,'#a4c56a',style);let rays=0;const old=ctx.lineTo;ctx.lineTo=function(...a){rays++;return old.apply(this,a);};try{ctx.clearRect(0,0,canvas.width,canvas.height);drawChampionSignatures();return {rays,png:canvas.toDataURL(),s:{...championSignatures.find(s=>s.on)}};}finally{ctx.lineTo=old;}};
  const generic=rendered(),spores=rendered('morveth_spores'),unknown=rendered('invalid-style');
  check('generic cone retains five rays',generic.rays===5,{rays:generic.rays});
  check('spore cone has border without radial rays',spores.rays===0&&spores.s.radius===210&&spores.s.arc===.85&&spores.s.dur===420,{rays:spores.rays,signature:spores.s});
  check('unknown style exactly matches generic raster',unknown.png===generic.png);
  championSignaturesReset();vfxSkillCone(player.x,player.y,210,0,.85,'#a4c56a','morveth_spores');championSignaturesReset();vfxSkillCone(player.x,player.y,210,0,.85,'#a4c56a');check('reused pool slot clears profile',championSignatures.find(s=>s.on).style===null);
  const cone=window.vfxSkillCone;
  for(const off of [false,true]){
   window.SFA_OFF=off;championSignaturesReset();player.energy=1e4;player.cds=[0,0,0];player.aim={x:player.x+100,y:player.y,dx:1,dy:0};castAbility(player,player.cls.skills[1],false,1);const s=championSignatures.find(s=>s.on&&s.key==='__cone');
   check('actual cast profile with SFA_OFF='+off,s&&s.style===(off?null:'morveth_spores'),s);check('cast restores cone hook '+off,window.vfxSkillCone===cone);
  }
  window.SFA_OFF=false;const ex=exCone;window.exCone=()=>{throw Error('fixture exception');};try{morvethCast(player,player.cls.skills[1],false,1,1,1);}catch(e){}finally{window.exCone=ex;}check('exception restores cone hook',window.vfxSkillCone===cone);
  return checks;
 });
 const status=errors.length||checks.some(c=>!c.pass)?'FAIL':'PASS';fs.writeFileSync(OUT+'/silhouette-tests.json',JSON.stringify({status,checks,errors},null,2)+'\n');console.log(status,checks.length,checks.filter(c=>!c.pass));if(status==='FAIL')process.exitCode=1;
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
