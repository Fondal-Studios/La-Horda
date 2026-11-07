const { chromium } = require('playwright'); const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const [base,out]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--no-sandbox']}); const p=await (await b.newContext({viewport:{width:1000,height:560}})).newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto(base+'/index.html',{waitUntil:'load'});
 for(let k=0;k<300;k++){ if(await p.evaluate(()=>!document.getElementById('title-continue-btn').disabled)) break; await sleep(100); }
 await p.evaluate(()=>{selectedClass='guerrero';currentArena='ciudad';lobbyAllies=['tanque','mago','soporte'];startRun(1);});
 await sleep(2500);
 for(const [n,x,y] of [['a',630,-180],['b',-1150,-120],['c',-640,200]]){
   await p.evaluate(([x,y])=>{for(const h of heroes)h.invulnTimer=1e9; player.x=x; player.y=y;},[x,y]); await sleep(900);
   await p.screenshot({path:out+'_'+n+'.png'}); }
 console.log('errors',JSON.stringify(errs.slice(0,3))); await b.close();})();
