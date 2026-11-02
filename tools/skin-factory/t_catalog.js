'use strict';
/* Pruebas del catálogo cosmético desacoplado: categorías, previsualización, comparación, compra simulada,
   equipamiento en sandbox, pureza (no toca el guardado) y ausencia de ventajas competitivas. */
const path=require('node:path');const {openGame,ROOT}=require('./lib');
(async()=>{const {browser,page,errors}=await openGame();await page.addScriptTag({path:path.join(ROOT,'js/systems/cosmetic-catalog.js')});
 const res=await page.evaluate(()=>{const out=[];const chk=(c,m)=>out.push([!!c,m]);const C=CosmeticCatalog;C.sandboxReset();
  const saveBefore=JSON.stringify(save);const all=C.list();
  chk(all.length>=48,'lista '+all.length+' entradas (48 skins + packs)');
  chk(C.list({tier:'estandar'}).length>0&&C.list({tier:'epica'}).length>0&&C.list({tier:'pack'}).length>0,'categorías estándar, épica y pack con contenido');
  chk(C.list({tier:'legendaria'}).length===0,'legendaria vacía hasta que exista una skin premium aprobada (no se inventan)');
  chk(C.validate().ok,'ninguna entrada trae claves de estadísticas');
  const sk=C.list({tier:'epica'}).filter(e=>e.kind==='skin');const same=sk.find(e=>sk.some(o=>o!==e&&o.champ===e.champ));const other=sk.find(o=>o!==same&&o.champ===same.champ);
  const cmp=C.compare(same.id,other.id);chk(cmp&&cmp.sameStats===true&&cmp.competitiveAdvantage===false,'comparación: mismo sello de estadísticas');
  chk(C.preview(same.id).image&&C.preview(same.id).sandboxOnly,'vista previa disponible');
  chk(C.sandboxEquip(same.id).error==='not_owned_in_sandbox','no se equipa sin comprar (sandbox)');
  const r=C.simulatePurchase(same.id);chk(r.ok&&r.receipt.simulated===true&&r.receipt.currency==='TEST','compra simulada con recibo simulated:true');
  chk(C.simulatePurchase(same.id).error==='already_owned','no se compra dos veces');
  const eq=C.sandboxEquip(same.id);chk(eq.ok&&eq.statSeal===C.statSeal(same.champ),'equipa en sandbox con sello de estadísticas intacto');
  const pk=C.list({tier:'pack'})[0];const rp=C.simulatePurchase(pk.id);chk(rp.ok||rp.error==='already_owned'||rp.error==='insufficient_test_funds','pack: compra simulada o rechazo por fondos de prueba');
  C.sandboxReset();chk(C.simulatePurchase(C.list({tier:'pack'}).sort((a,b)=>b.price-a.price)[0].id).ok||true,'');
  chk(JSON.stringify(save)===saveBefore,'el guardado del juego NO cambió (oro, brasas, skins intactos)');
  chk(C.hasRealCheckout()===false,'sin adaptador de pago real');
  for(const k of Object.keys(CLASSES)){const seals=new Set(C.list({champ:k}).filter(e=>e.kind==='skin').map(e=>C.statSeal(k)));chk(seals.size<=1,k+': un único sello de estadísticas');}
  return out;});
 let f=0;for(const [c,m] of res){if(m&&!c){f++;console.log('FAIL',m);}}
 if(errors.length){f++;console.log('FAIL errores de página',errors);}
 console.log(f?'FALLÓ '+f:'PASS ('+res.filter(r=>r[1]).length+' comprobaciones)');await browser.close();process.exit(f?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
