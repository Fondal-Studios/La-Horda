'use strict';
/* Utilidades de Build Evolution 2.0. El módulo se carga con un <script> inyectado (index.html tiene
   un solo dueño: el integrador; ver docs/build-evolution/INTEGRACION.md). Si index.html ya lo trae, no se duplica. */
const path=require('node:path');
let chromium;try{({chromium}=require('playwright'));}catch(e){({chromium}=require('/opt/node22/lib/node_modules/playwright'));}
const ROOT=path.join(__dirname,'../..');
async function openGame(site){
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto((site||process.env.SITE||'http://127.0.0.1:8771')+'/',{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(()=>typeof startRun==='function'&&typeof CLASSES!=='undefined'&&typeof skillEvoOnHit==='function',null,{timeout:120000});
  if(!(await page.evaluate(()=>typeof SYN_BRANCHES!=='undefined'))){
    await page.addScriptTag({path:path.join(ROOT,'js/data/build-synergy.js')});
    await page.addScriptTag({path:path.join(ROOT,'js/systems/build-synergy.js')});
  }
  if(!(await page.evaluate(()=>typeof __AP!=='undefined'))) await page.addScriptTag({path:path.join(ROOT,'tools/balance/autopilot.js')}); // arnés de partida (solo pruebas)
  return {browser,page,errors};
}
module.exports={openGame,ROOT};
