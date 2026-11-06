'use strict';
// Alcance de la beta: con ?beta=1 (o __BETA_PUBLIC__) Convergencia y Coliseo quedan ocultos y bloqueados; sin bandera, todo igual que siempre.
const assert=require('node:assert/strict'),H=require('../lib/serve');
const IDS=['hub-crystal-btn','hub-coliseum-btn','mode-crystal-wars-btn','mode-coliseum-btn'];
(async()=>{const site=await H.startSite();let browser;
 try{browser=await H.launch();
  for(const beta of [false,true]){
   const page=await browser.newPage({viewport:{width:844,height:390}});
   await H.goto(page,site.url+'/index.html'+(beta?'?beta=1':''));
   await page.waitForFunction(()=>typeof competitiveOpen==='function'&&!!window.BETA_SCOPE);
   const r=await page.evaluate(ids=>{
    const disp=ids.map(i=>{const e=document.getElementById(i);return e?getComputedStyle(e).display:'MISSING';});
    const before=state; try{competitiveOpen('crystal');competitiveOpen('coliseum');cwGo({mode:'crystal'});}catch(e){return {err:String(e)};}
    save.divineArenaUnlocked=true;const divina=isDivinaUnlocked();return {disp,divina,pub:BETA_SCOPE.public,stateSame:state===before,campaignBtn:getComputedStyle(document.getElementById('mode-arena-btn')).display};
   },IDS);
   assert(!r.err,r.err);
   assert.equal(r.pub,beta);
   if(beta){assert(r.disp.every(d=>d==='none'),'ocultos: '+r.disp);assert(r.stateSame,'el competitivo no debe abrirse en la beta');assert.equal(r.divina,false,'la Arena Divina queda bloqueada en la beta aunque esté desbloqueada');}
   else assert.equal(r.divina,true,'sin bandera la Arena Divina sigue disponible');
   if(!beta)assert(r.disp.every(d=>d!=='none'&&d!=='MISSING'),'sin bandera siguen visibles: '+r.disp);
   assert.notEqual(r.campaignBtn,'none','Campaña sigue visible');
   await page.close();
  }
  console.log('PASS beta scope: sin bandera visibles; con ?beta=1 ocultos y bloqueados; Campaña intacta.');
 }finally{if(browser)await browser.close();await site.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
