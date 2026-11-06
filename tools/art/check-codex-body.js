'use strict';
// Cuerpo del Códice de un guardián (uso: node tools/art/check-codex-body.js <guardián>): el atlas carga, TODOS los cuadros referenciados por los estados existen y no están vacíos,
// cada estado tiene los cuadros esperados, y el héroe se dibuja con él (vivo y caído) sin errores. Solo apariencia: no toca estadísticas.
const assert=require('node:assert/strict'),H=require('../lib/serve');
const C=process.argv[2]||'guerrero';
(async()=>{const site=await H.startSite();let browser;
 try{browser=await H.launch();const page=await browser.newPage({viewport:{width:844,height:390}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await H.goto(page,site.url+'/?lazy=1');
  await page.waitForFunction(c=>typeof drawCodexChampion==='function'&&typeof CODEX_GAMEPLAY_ART!=='undefined'&&CODEX_GAMEPLAY_ART[c],C);
  await page.evaluate(c=>{loop=function(){};assetsStartGroup('ch:'+c);},C);
  await page.waitForFunction(c=>CHAMP_PACK['codex_'+c]&&CHAMP_PACK['codex_'+c].ready,C,{timeout:30000});
  const r=await page.evaluate(champ=>{
   const P=CHAMP_PACK['codex_'+champ],M=CODEX_GAMEPLAY_ART[champ].meta,img=P.atlas||P.img,out={sets:{},empty:[],img:[img.width,img.height]};
   const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);
   const used=new Set();
   for(const [k,arr] of Object.entries(M.sets)){out.sets[k]=arr.length;for(const i of arr){used.add(i);
    const x=(i%M.cols)*M.w,y=Math.floor(i/M.cols)*M.h;const d=g.getImageData(x,y,M.w,M.h).data;let n=0;for(let p=3;p<d.length;p+=4)if(d[p]>40)n++;if(n<150)out.empty.push(k+':'+i+'('+n+'px)');}}
   out.used=used.size;
   selectedClass=champ;currentArena='bosque';lobbyAllies=[];startRun(1);state='playing';
   out.live=drawCodexChampion(player,1,1);
   player.alive=false;let died=null;try{render();died=true;}catch(e){died=String(e);}out.dead=died;
   return out;
  },C);
  assert.ok(Object.keys(r.sets).length>=8,'pocos estados: '+JSON.stringify(r.sets));
  for(const k of ['idle_down','walk_down','attack_down']) assert.ok(r.sets[k]>=1,'falta el estado '+k);
  assert.ok(r.sets.death_down>=1||r.sets.death>=1||Object.keys(r.sets).some(k=>/death/.test(k)),'falta el estado de caída');
  assert.deepEqual(r.empty,[],'cuadros vacíos: '+r.empty.join());
  assert.equal(r.live,true,'drawCodexChampion no dibujó al héroe vivo');
  assert.equal(r.dead,true,'dibujar al héroe caído falló: '+r.dead);
  assert.equal(errors.length,0,errors.join());
  console.log(`PASS codex ${C}: ${Object.keys(r.sets).length} estados, ${r.used} cuadros no vacíos (atlas ${r.img.join('x')}), héroe vivo y caído dibujados`);
 }finally{if(browser)await browser.close();await site.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
