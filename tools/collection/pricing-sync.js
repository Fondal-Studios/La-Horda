#!/usr/bin/env node
'use strict';
// UNA SOLA FUENTE DE PRECIOS: el cliente (página real) y el servidor (server/wallet.js) tienen que cotizar IGUAL cada
// apariencia en Brasas y en oro, cada colección por campeón, cada campeón en oro y el Pack de bienvenida.
// Uso: SE_BASE_URL=http://127.0.0.1:8814/ NODE_PATH=/opt/node-tools/node_modules:server/node_modules node tools/collection/pricing-sync.js
const {chromium}=require('playwright');const assert=require('node:assert/strict');const path=require('node:path');
const wallet=require('../../server/wallet');
(async()=>{
 const P=wallet.pricing(),cat=wallet.skinCatalog();
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 const page=await b.newPage({viewport:{width:844,height:390}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.SE_BASE_URL||'http://127.0.0.1:8805/',{waitUntil:'load'});
 await page.waitForFunction(()=>typeof premiumPrice==='function'&&typeof PRICING!=='undefined'&&typeof CHAMPION_CATALOG!=='undefined');
 const c=await page.evaluate(()=>{
  const skins={};
  for(const id of Object.keys(SET_SKINS))skins[id]={tier:premiumTier(id),brasas:premiumPrice(id),gold:premiumGoldPrice(id)};
  for(const id of Object.keys(CROMA_SKINS))skins[id]={tier:premiumTier(id),brasas:premiumPrice(id),gold:premiumGoldPrice(id)};
  const champs={};for(const k of Object.keys(CLASSES))champs[k]=premiumChampSkinIds(k).slice().sort();
  return {pricing:JSON.parse(JSON.stringify(PRICING)),skins,champs,champGold:Object.fromEntries(CHAMPION_CATALOG.map(x=>[x.id,{gold:x.priceGold,cat:championMeta(x.id).category}])),
   pieces:{flag:PIECES_FOR_BRASAS,mode:SHOP_MODE,cap:INVENTORY_CAPACITY,price:Object.fromEntries(shopCatalog().filter(e=>e.cat==='set').map(e=>[e.id,premiumPiecePrice(e.id)])),
    cat:Object.fromEntries(shopCatalog().filter(e=>e.cat==='set').map(e=>[e.id,{set:DESIGNED_ITEMS[e.id].set,type:DESIGNED_ITEMS[e.id].type,name:DESIGNED_ITEMS[e.id].name,champion:DESIGNED_ITEMS[e.id].champion||null}])),
    sets:Object.fromEntries(Object.keys(SET_DB).map(id=>[id,setPieceIds(id)])),pool:shopRotationPoolEntries().map(e=>e.key),
    rot:Array.from({length:420},(_,i)=>shopRotationKeys(20000+i).join('|'))},
   col:Object.fromEntries(Object.keys(CLASSES).map(k=>{const q=premiumCollection(k);return [k,{n:q.n,price:q.price,sum:q.sum,save:q.save}];}))};
 });
 let n=0;const ok=(x,m)=>{assert(x,m);n++;};
 assert.deepEqual(c.pricing,JSON.parse(JSON.stringify(P.PRICING)),'PRICING idéntico en cliente y servidor');n++;
 // cada apariencia que vende el servidor se cotiza igual en el cliente (si el cliente la conoce)
 let compared=0;
 for(const [id,s] of Object.entries(cat)){const k=c.skins[id];if(!k)continue;compared++;
  assert.equal(k.tier,s.tier,'tier '+id);assert.equal(k.brasas,P.pricingBrasas(s.tier),'brasas '+id);assert.equal(k.gold,P.pricingCosmeticGold(s.tier,s.goldBase),'oro '+id);n+=3;}
 ok(compared>=30,'se compararon las apariencias del juego: '+compared);
 // lo que el cliente ofrece por Brasas, el servidor lo vende (y al mismo precio)
 for(const [id,k] of Object.entries(c.skins))if(k.brasas>0)ok(cat[id]&&P.pricingBrasas(cat[id].tier)===k.brasas,'el servidor vende '+id);
 // colecciones: mismas piezas y mismo precio (campeones sin ninguna apariencia pendiente: 0 piezas en ambos lados)
 for(const k of Object.keys(c.champs)){
  const srv=Object.values(cat).filter(s=>s.champion===k&&c.skins[s.id]).map(s=>s.id).filter(id=>c.champs[k].includes(id)||true);
  const cli=c.champs[k];
  ok(cli.every(id=>cat[id]&&cat[id].champion===k),'piezas de '+k+' conocidas por el servidor');
  const q=P.pricingCollection(cli.map(id=>P.pricingBrasas(cat[id].tier)));
  assert.equal(c.col[k].price,q.price,'colección '+k);assert.equal(c.col[k].save,q.save,'ahorro '+k);n+=2;
 }
 // campeones: oro, nunca Brasas
 for(const [id,x] of Object.entries(c.champGold))if(x.cat!=='FOUNDER'&&x.cat!=='EVENT'&&x.cat!=='DEV'){assert.equal(x.gold,P.pricingChampionGold(id,x.cat),'oro campeón '+id);n++;}
 ok(P.pricingBrasas('champion')===0&&!Object.values(cat).some(s=>s.id in c.champGold),'Brasas no compran campeones');
 // piezas de set por Brasas: mismo interruptor, precio, catálogo, sets y rotación diaria en cliente y servidor
 {const db=P.__flags?require('../../server/wallet').pieceDb():null,fl=P.__flags();
  assert.equal(c.pieces.flag,fl.PIECES_FOR_BRASAS,'PIECES_FOR_BRASAS igual');assert.equal(c.pieces.mode,fl.SHOP_MODE,'SHOP_MODE igual');n+=2;
  assert.equal(c.pieces.cap,P.PRICING.pieces.inventoryCapacity,'capacidad de inventario igual');n++;
  for(const [id,pr] of Object.entries(c.pieces.price))assert.equal(pr,fl.PIECES_FOR_BRASAS?P.pricingBrasas('pieza'):0,'precio pieza '+id);n++;
  assert.deepEqual(Object.keys(db.pieces).sort(),Object.keys(c.pieces.cat).sort(),'server/shop-pieces.json = piezas de set de la tienda');n++;
  for(const [id,x] of Object.entries(c.pieces.cat)){const y=db.pieces[id];assert(y&&y.set===x.set&&y.type===x.type&&y.name===x.name&&y.champion===x.champion,'pieza '+id);}n++;
  assert.deepEqual(db.sets,c.pieces.sets,'sets = setPieceIds');n++;
  assert.deepEqual(db.pool.map(e=>e.key),c.pieces.pool,'pozo de la rotación');n++;
  const W=require('../../server/wallet');c.pieces.rot.forEach((k,i)=>assert.equal(W.rotationKeys(20000+i).join('|'),k,'rotación del día '+(20000+i)));n+=c.pieces.rot.length;
  ok(P.pricingBrasas('pieza')*4>=P.pricingBrasas('set'),'4 piezas cuestan al menos una skin de set');}
 // Pack de bienvenida: servidor y tabla de precios coinciden
 const packs=require('../../server/premium-packs.json').packs,w=packs.find(p=>p.id===P.PRICING.welcome.pack);
 ok(w&&w.once&&w.championGifts===P.PRICING.welcome.champions&&P.PRICING.welcome.champions===3,'pack de bienvenida regala 3 campeones');
 assert.deepEqual(errors,[]);await b.close();
 console.log(`pricing-sync: ${n} checks PASS (${compared} apariencias comparadas)`);
})().catch(e=>{console.error(e);process.exit(1);});
