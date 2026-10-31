import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const url = process.env.GAME_URL || 'https://drmarianojimenez94-sudo.github.io/La-Horda';
const out = 'social-output';
await mkdir(out,{recursive:true});
const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
const page = await browser.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1,recordVideo:{dir:out,size:{width:1080,height:1920}}});
const errors=[];
page.on('pageerror',e=>errors.push(String(e)));
try {
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForTimeout(8000);
 await page.screenshot({path:out+'/screen.png',fullPage:false});
 // Avoid fabricated gameplay: no synthetic input or claims of actual combat.
 await page.waitForTimeout(12000);
 const video=await page.video();
 await page.close();
 const path=await video.path();
 const {rename}=await import('node:fs/promises');
 await rename(path,out+'/capture.webm');
 await writeFile(out+'/manifest.json',JSON.stringify({url,recording:'browser-session',gameplayVerified:false,errors,capturedAt:new Date().toISOString()},null,2));
} finally {await browser.close();}
