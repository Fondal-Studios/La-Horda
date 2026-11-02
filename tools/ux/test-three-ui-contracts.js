'use strict';
// Regression coverage for the three baseline UI defects. Real pointer clicks;
// no forced clicks, legal acceptance injection, CSS overrides or modified assertions.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const H=require('../lib/serve');
const OUT=path.resolve(process.env.UI_CONTRACT_EVIDENCE||'docs/ux/three-ui-contracts');
const overlaps=(a,b)=>Math.min(a.x+a.width,b.x+b.width)>Math.max(a.x,b.x)+.5&&Math.min(a.y+a.height,b.y+b.height)>Math.max(a.y,b.y)+.5;
(async()=>{
 const site=await H.startSite(),rows=[];let browser;fs.mkdirSync(OUT,{recursive:true});
 try{
  browser=await H.launch();
  for(const [width,height] of [[568,320],[667,375],[740,360],[844,390],[1366,768]]){
   const ctx=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:width<1000});
   const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
   // Exercise the real account gate even under WebDriver (production-supported URL).
   await p.goto(site.url+'/index.html?account=1');
   const button=p.locator('#title-continue-btn'),footer=p.locator('#legal-title');
   await button.waitFor({state:'visible'});await p.waitForFunction(()=>!document.getElementById('title-continue-btn').disabled);
   const geometry=await p.evaluate(()=>{
    const read=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
    return {button:read(document.getElementById('title-continue-btn')),footer:read(document.getElementById('legal-title')),cta:document.getElementById('bt-cta')?read(document.getElementById('bt-cta')):null};
   });
   assert(!overlaps(geometry.button,geometry.footer),`${width}: Continue/footer overlap ${JSON.stringify(geometry)}`);
   if(geometry.cta)assert(!overlaps(geometry.button,geometry.cta),`${width}: Continue/primary CTA overlap ${JSON.stringify(geometry)}`);
   assert(geometry.button.y>=0&&geometry.button.y+geometry.button.height<=height,`${width}: Continue on screen`);
   // Links remain actual reachable navigation, not disabled overlays or hidden consent.
   for(const slug of ['privacidad','terminos','reembolsos']){
    const a=footer.locator(`a[href="legal/${slug}.html"]`),box=await a.boundingBox();
    if(width<1000)assert(box.height>=44,`${width}: ${slug} retains touch height`);
    const popupPromise=p.waitForEvent('popup');await a.click();const popup=await popupPromise;
    await popup.waitForLoadState('domcontentloaded');assert(new URL(popup.url()).pathname.endsWith(`/legal/${slug}.html`));await popup.close();
   }
   await p.screenshot({path:path.join(OUT,`title-${width}.png`)});
   await button.click();await p.getByRole('button',{name:/invitado/i}).waitFor({state:'visible'});
   assert.deepEqual(errors,[]);rows.push({viewport:[width,height],title:geometry,legalLinks:'PASS',continuePointer:'PASS'});await ctx.close();
  }
  const fixture={tut:{training:1},starterChosen:true,starterGiftV1:true,starterSkin:'vale',playtestV1Bonus:true,campaignResetV1:true,campaignResetV2:true,arenasCleared:{infernal:true}};
  for(const [width,height] of [[667,375],[844,390]]){
   const ctx=await browser.newContext({viewport:{width,height},hasTouch:true});
   await ctx.addInitScript(f=>localStorage.setItem('laHordaSave_v1',JSON.stringify(f)),fixture);
   const p=await ctx.newPage();await p.goto(site.url+'/index.html?lazy=0');
   await p.waitForFunction(()=>typeof lanesStart==='function'&&typeof renderMainMenu==='function');
   await p.evaluate(()=>{save.tut.training=1;persistNow();setState('mainmenu');renderMainMenu();});
   await p.locator('#hub-crystal-btn').click();await p.locator('#practice').waitFor({state:'visible'});
   await p.selectOption('#champ','mago');await p.click('#practice');await p.waitForFunction(()=>state==='playing'&&lanesOn());
   for(const lefty of [false,true]){
    await p.evaluate(v=>document.body.classList.toggle('lefty',v),lefty);
    const data=await p.evaluate(()=>{
     const read=e=>{const r=e.getBoundingClientRect();return {id:e.id||e.className,x:r.x,y:r.y,width:r.width,height:r.height};};
     return {recall:read(document.querySelector('.ln-recall')),button:read(document.getElementById('btn-basic')),icon:read(document.querySelector('#btn-basic .ico-img')),controls:[...document.querySelectorAll('.ability-btn,.ln-chip,#joy-base')].filter(e=>e.getBoundingClientRect().width&&getComputedStyle(e).display!=='none').map(read)};
    });
    assert(data.recall.width>=48&&data.recall.height>=48,`${width}: recall >=48`);
    assert.equal(data.button.width,92);assert.equal(data.button.height,92);assert.equal(data.icon.width,32);assert.equal(data.icon.height,32);
    const hits=data.controls.filter(r=>overlaps(data.recall,r));assert.deepEqual(hits,[],`${width} lefty=${lefty}: recall overlaps controls`);
    await p.screenshot({path:path.join(OUT,`lanes-${width}-${lefty?'left':'right'}.png`)});rows.push({viewport:[width,height],lefty,...data});
   }
   await ctx.close();
  }
  fs.writeFileSync(path.join(OUT,'geometry.json'),JSON.stringify(rows,null,2));console.log('PASS three UI contracts: 5 title viewports, 15 real legal-link clicks, 5 Continue clicks, 4 competitive layouts; 32px glyph/92px button/48px recall.');
 }finally{if(browser)await browser.close();await site.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
