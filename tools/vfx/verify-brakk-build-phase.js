'use strict';
const fs=require('node:fs'),H=require('../lib/serve');
const OUT='art-source/entregas/brakk-kit-20261022/correccion-01';
(async()=>{const site=await H.startSite(),browser=await H.launch();try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await H.goto(page,site.url);await H.waitFor(page,()=>typeof sfaDrawOne==='function'&&assetsAllReady());
 const checks=await page.evaluate(()=>{
  const checks=[],check=(name,pass,details)=>checks.push({name,pass:!!pass,details});
  selectedClass='brakk';save.champions.brakk.unlocked=true;startRun(1);state='menu';
  const g={save(){},restore(){},translate(){},rotate(){},drawImage(...args){this.frames.push(args[1]/16);},frames:[]};
  const sample=(theme,age,clock,dur=600)=>{animNow=clock;g.frames=[];sfaDrawOne({art:'beam',theme,t:age,dur,x:player.x,y:player.y,bx:player.x+120,by:player.y,w:28,fi:-2},g);return g.frames[0];};
  for(const theme of ['brakk_build','brakk_build~h','brakk_build~p']){
   const n=sfaBake('beam',theme,12).n;
   for(const age of [0,90,300,599]){const a=sample(theme,age,1000),b=sample(theme,age,1400),expected=Math.min(n-1,Math.floor(age/600*n));check('event phase '+theme+' age='+age,a===b&&a===expected,{a,b,expected});}
   check('expired event is not drawn '+theme,sample(theme,600,1400)===undefined);
  }
  for(const theme of ['brakk_nails','siege']){const n=sfaBake('beam',theme,12).n;for(const clock of [1000,1400])check('legacy loop unchanged '+theme+' clock='+clock,sample(theme,200,clock)===Math.floor(clock/70)%n);}
  check('duration changes scale only the visual sequence',sample('brakk_build',300,1000,1200)===Math.floor(.25*sfaBake('beam','brakk_build',12).n));
  return checks;
 });
 const status=errors.length||checks.some(c=>!c.pass)?'FAIL':'PASS';fs.writeFileSync(OUT+'/phase-tests.json',JSON.stringify({status,checks,errors},null,2)+'\n');console.log(JSON.stringify({status,checks,errors}));if(status==='FAIL')process.exitCode=1;
 }finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
