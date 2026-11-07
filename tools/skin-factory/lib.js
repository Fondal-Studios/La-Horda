'use strict';
/* Arnés mínimo del Premium Skin Factory (independiente de la rama de Build Evolution). */
const path=require('node:path');
let chromium;try{({chromium}=require('playwright'));}catch(e){({chromium}=require('/opt/node22/lib/node_modules/playwright'));}
const ROOT=path.join(__dirname,'../..');
async function openGame(site){
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto((site||process.env.SITE||'http://127.0.0.1:8771')+'/',{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(()=>typeof startRun==='function'&&typeof CLASSES!=='undefined'&&typeof CROMA_SKINS!=='undefined',null,{timeout:120000});
  return {browser,page,errors};
}
module.exports={openGame,ROOT};
