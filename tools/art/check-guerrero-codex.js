'use strict';
// Cuerpo de Guerrero (Kael) fiel al Códice: el atlas carga, TODOS los cuadros referenciados por los estados existen y no están vacíos,
// cada estado tiene los cuadros esperados, y el héroe se dibuja con él (vivo y caído) sin errores. Solo apariencia: no toca estadísticas.
const assert=require('node:assert/strict'),H=require('../lib/serve');
(async()=>{const site=await H.startSite();let browser;
 try{browser=await H.launch();const page=await browser.newPage({viewport:{width:844,height:390}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await H.goto(page,site.url+'/?lazy=1');
  await page.waitForFunction(()=>typeof drawCodexChampion==='function'&&typeof CODEX_GAMEPLAY_ART!=='undefined'&&CODEX_GAMEPLAY_ART.guerrero);
  await page.evaluate(()=>{loop=function(){};assetsStartGroup('ch:guerrero');});
  await page.waitForFunction(()=>CHAMP_PACK.codex_guerrero&&CHAMP_PACK.codex_guerrero.ready,null,{timeout:30000});
  const r=await page.evaluate(()=>{
   const P=CHAMP_PACK.codex_guerrero,M=CODEX_GAMEPLAY_ART.guerrero.meta,img=P.atlas||P.img,out={sets:{},empty:[],img:[img.width,img.height]};
   const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);
   const used=new Set();
   for(const [k,arr] of Object.entries(M.sets)){out.sets[k]=arr.length;for(const i of arr){used.add(i);
    const x=(i%M.cols)*M.w,y=Math.floor(i/M.cols)*M.h;const d=g.getImageData(x,y,M.w,M.h).data;let n=0;for(let p=3;p<d.length;p+=4)if(d[p]>40)n++;if(n<150)out.empty.push(k+':'+i+'('+n+'px)');}}
   out.used=used.size;
   selectedClass='guerrero';currentArena='bosque';lobbyAllies=[];startRun(1);state='playing';
   out.live=drawCodexChampion(player,1,1);
   player.alive=false;let died=null;try{render();died=true;}catch(e){died=String(e);}out.dead=died;
   return out;
  });
  const need={idle_down:1,walk_down:4,attack_down:4,idle_side:1,walk_side:4,attack_side:4,idle_up:1,walk_up:4,attack_up:4,cast_down:4,hit_down:2,hit_side:1,hit_up:1,death_down:4};
  assert.deepEqual(r.sets,need,'estados y cantidad de cuadros: '+JSON.stringify(r.sets));
  assert.deepEqual(r.empty,[],'cuadros vacíos: '+r.empty.join());
  assert.equal(r.live,true,'drawCodexChampion no dibujó al héroe vivo');
  assert.equal(r.dead,true,'dibujar al héroe caído falló: '+r.dead);
  assert.equal(errors.length,0,errors.join());
  console.log(`PASS guerrero codex: ${Object.keys(r.sets).length} estados, ${r.used} cuadros no vacíos (atlas ${r.img.join('x')}), héroe vivo y caído dibujados`);
 }finally{if(browser)await browser.close();await site.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
