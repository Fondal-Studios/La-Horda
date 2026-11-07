'use strict';
// Compra de apariencias con Brasas: si se corta la red o se recarga la página, el reintento del MISMO artículo reutiliza la referencia
// (el servidor la trata como idempotente) => nunca dos cobros. Probado sobre premiumBuySkin real con la red simulada.
const assert=require('node:assert/strict'),H=require('../lib/serve');
(async()=>{const site=await H.startSite();let browser;
 try{browser=await H.launch();const page=await browser.newPage({viewport:{width:844,height:390}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await H.goto(page,site.url+'/index.html');
  await page.waitForFunction(()=>typeof premiumBuySkin==='function'&&typeof premiumPendingRef==='function');
  const r=await page.evaluate(async()=>{
   localStorage.removeItem('horda_buy_pending');
   const id=Object.keys(SET_SKINS).find(k=>premiumPrice(k)>0)||Object.keys(CROMA_SKINS).find(k=>premiumPrice(k)>0);
   window.premiumAvailable=()=>true; window.premiumSkinOwned=()=>false; PREMIUM.premium=100000;
   const refs=[]; let mode='down';
   window.accountFetch=async(m,p,body)=>{ refs.push(body&&body.ref); if(mode==='down') throw new Error('red caída'); return {status:200,j:{ok:true,premium:99000,sku:id,cosmetics:[]}}; };
   const a=premiumPendingRef('skin:'+id), b=premiumPendingRef('skin:'+id);
   premiumPendingClear(); const c=premiumPendingRef('skin:'+id);
   const out={id,stable:a===b,newAfterClear:a!==c};
   premiumPendingClear(); refs.length=0;
   const f1=await premiumBuySkin(id);                       // sin respuesta del servidor
   out.failedOffline=!f1.ok; out.pendingKept=premiumPendingFor('skin:'+id);
   const first=refs[0]; mode='up'; refs.length=0;
   const f2=await premiumBuySkin(id);                       // reintento: misma referencia
   out.sameRefOnRetry=refs.length>=1&&refs.every(x=>x===first); out.okAfterRetry=!!f2.ok;
   out.clearedAfterAnswer=!premiumPendingFor('skin:'+id);
   // otro artículo no hereda la referencia pendiente
   const other=Object.keys(SET_SKINS).concat(Object.keys(CROMA_SKINS)).find(k=>k!==id&&premiumPrice(k)>0);
   mode='down'; refs.length=0; await premiumBuySkin(other); const oref=refs[0];
   out.otherItemOwnRef=oref!==undefined&&oref!==first;
   // vencida (10 min): se pide una referencia nueva
   localStorage.setItem('horda_buy_pending',JSON.stringify({sku:'skin:'+id,ref:'vieja',at:Date.now()-700000}));
   out.expiredRenews=premiumPendingRef('skin:'+id)!=='vieja';
   return out;
  });
  for(const [k,v] of Object.entries(r)) if(k!=='id') assert.equal(v,true,k+' '+JSON.stringify(r));
  assert.equal(errors.length,0,errors.join());
  console.log('PASS purchase pending ref: misma referencia al reintentar, se borra al contestar el servidor, otro artículo no la hereda, vence a los 10 min ('+r.id+')');
 }finally{if(browser)await browser.close();await site.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
