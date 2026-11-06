const { chromium } = require('playwright'); const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const [base,out]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});
 const names=await (async()=>{const p=await (await b.newContext()).newPage(); await p.goto(base+'/index.html'); await p.waitForFunction(()=>typeof ARENA_ORDER!=='undefined'); const n=await p.evaluate(()=>ARENA_ORDER.slice()); await p.close(); return n;})();
 console.log(names.join(','));
 for(const a of names){
  const p=await (await b.newContext({viewport:{width:960,height:540}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(base+'/index.html',{waitUntil:'load'});
  for(let k=0;k<300;k++){ if(await p.evaluate(()=>!document.getElementById('title-continue-btn').disabled)) break; await sleep(100); }
  await p.evaluate(a=>{selectedClass='guerrero';currentArena=a;lobbyAllies=['tanque','mago','soporte'];startRun(1);},a);
  await sleep(3500);
  await p.evaluate(()=>{for(const h of heroes)h.invulnTimer=1e9;});
  await p.screenshot({path:`${out}_${a}.png`}); console.log(a,'errors',JSON.stringify(errs.slice(0,2)));
  await p.close();
 } await b.close();})();
