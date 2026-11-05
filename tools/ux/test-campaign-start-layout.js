'use strict';
// Layout regression using the shipped HTML/CSS and tab controller, without game/network startup.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const H=require('../lib/serve');
(async()=>{
 const root=path.resolve(__dirname,'../..'), site=await H.startSite();let browser;
 try{
  browser=await H.launch();
  let html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
  html=html.replace('<head>','<head><base href="'+site.url+'/">');
  for(const [width,height] of [[320,568],[390,844],[568,320],[667,375],[844,390],[1366,768]]){
   const page=await browser.newPage({viewport:{width,height},hasTouch:true});
   await page.setContent(html,{waitUntil:'load'});
   await page.evaluate(()=>{
    document.querySelectorAll('.screen').forEach(e=>e.classList.add('hidden'));
    document.getElementById('prep-screen').classList.remove('hidden');
    for(const id of ['duo-picker','lobby-arena','net-bar']){
     const e=document.getElementById(id);e.classList.remove('hidden');
     e.innerHTML='<div style="height:1500px">Contenido largo de la sala</div>';
    }
   });
   await page.addScriptTag({path:path.join(root,'js/ui/prep-sections.js')});
   for(const sec of ['equipo','arena','online']){
    await page.evaluate(s=>prepSecSet(s),sec);
    for(const label of ['Comenzar partida','Comenzar · Reino Fúngico (4 jugadores + 0 bots) · faltan 3 LISTO','Esperando que el anfitrión comience…']){
     await page.evaluate(label=>{
      const b=document.getElementById('prep-start-btn');b.textContent=label;b.disabled=label.startsWith('Esperando');
      document.querySelectorAll('#prep-screen details').forEach(e=>e.open=true);
     },label);
     for(const bottom of [false,true]){
      await page.evaluate(bottom=>{const c=document.getElementById('prep-content');if(c)c.scrollTop=bottom?c.scrollHeight:0;},bottom);
      const g=await page.evaluate(()=>{
       const b=document.getElementById('prep-start-btn'),r=b.getBoundingClientRect();
       const c=document.getElementById('prep-content').getBoundingClientRect();
       return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom,contentBottom:c.bottom,hit:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===b};
      });
      assert(g.x>=0&&g.y>=0&&g.right<=width+.5&&g.bottom<=height+.5,JSON.stringify({width,height,sec,label,g}));
      assert(g.h>=48&&g.hit,'primary action is large and unobstructed');
      assert(g.contentBottom<=g.y+.5,'scroll content cannot cover primary action');
     }
    }
   }
   await page.evaluate(()=>{document.getElementById('prep-screen').classList.add('hidden');});
   assert.equal(await page.locator('#prep-start-btn').isVisible(),false);
   await page.close();
  }
  console.log('PASS campaign action: 6 viewports, 3 tabs, solo/host/guest labels, top/bottom scroll, closed screen.');
 }finally{if(browser)await browser.close();await site.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
