'use strict';
// Recorre las pantallas del juego en español y junta TODOS los textos visibles (nodos de texto y title/aria-label/placeholder/alt) y los dibujados en el canvas
// (fillText) → docs/i18n/es-strings.json. Sirve de lista de trabajo para las traducciones y, con --check <en|pt>, de medidor de cobertura.
//   node tools/i18n/tour.js                # escribe docs/i18n/es-strings.json
//   node tools/i18n/tour.js --check en     # % de textos traducidos (falla bajo el umbral CORE_MIN)
const fs=require('node:fs'),path=require('node:path'),H=require('../lib/serve');
const OUT=path.join(H.ROOT,'docs/i18n/es-strings.json'),CHECK=process.argv.includes('--check')?process.argv[process.argv.indexOf('--check')+1]:null;
const CORE_MIN=+(process.env.CORE_MIN||0.97);
const esRe=/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{3,}/;
(async()=>{const site=await H.startSite(),browser=await H.launch();
 try{
  const page=await browser.newPage({viewport:{width:1100,height:640}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.__cv=new Set();const P=CanvasRenderingContext2D.prototype;for(const f of ['fillText','strokeText']){const o=P[f];P[f]=function(t){try{window.__cv.add(String(t));}catch(e){}return o.apply(this,arguments);};}});
  await page.goto(site.url+'/index.html?lang='+(CHECK||'es')+'&lazy=0');
  await page.waitForFunction(()=>typeof setState==='function'&&typeof assetsAllReady==='function'&&assetsAllReady(),null,{timeout:120000});
  const seen=new Set(),attrs=new Set();
  const grab=async tag=>{const r=await page.evaluate(()=>{const out={t:[],a:[],c:[...window.__cv]};const SK={SCRIPT:1,STYLE:1,NOSCRIPT:1};
    const w=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_ALL);let n;
    while((n=w.nextNode())){if(n.nodeType===3){if(n.parentNode&&SK[n.parentNode.tagName])continue;const v=n.nodeValue.trim();if(v)out.t.push(v);}
      else if(n.nodeType===1){for(const a of ['title','aria-label','placeholder','alt']){const v=n.getAttribute&&n.getAttribute(a);if(v&&v.trim())out.a.push(v.trim());}}}
    return out;});
   for(const t of r.t)seen.add(t);for(const t of r.c)seen.add(t);for(const t of r.a)attrs.add(t);};
  await grab('boot');
  const steps=[
   ()=>{for(const id of ['hub-options','legal-modal'])document.getElementById(id)?.classList.remove('hidden');},
   ()=>{renderMainMenu();setState('mainmenu');},
   ()=>{if(typeof bpOpen==='function')bpOpen();},
   ()=>{for(const t of ['skins','brasas','items','sets','champions'])try{shopOpen(t);}catch(e){}},
   ()=>{for(const s of ['codex','inventory','champdetail','modeselect','arenaselect','prep','menu','starter','crystalwars','divina','shop','gameover','victory'])try{setState(s);}catch(e){}},
   ()=>{try{codexOpen&&codexOpen();}catch(e){}},
   ()=>{try{selectedClass='tanque';currentArena='bosque';lobbyAllies=[];startRun(2);setState('playing');}catch(e){}},
   ()=>{try{setState('paused');}catch(e){}},
   ()=>{try{player.alive=false;setState('gameover');}catch(e){}}
  ];
  for(let i=0;i<steps.length;i++){try{await page.evaluate(steps[i]);}catch(e){}await page.waitForTimeout(500);await grab('s'+i);}
  const norm=s=>s.replace(/\d+(?:[.,]\d+)*/g,'{n}');
  const spanish=[...seen,...attrs].filter(s=>esRe.test(s)&&s.length<400);
  const set=[...new Set(spanish.map(norm))].sort();
  if(!CHECK){fs.mkdirSync(path.dirname(OUT),{recursive:true});fs.writeFileSync(OUT,JSON.stringify({schema:1,note:'Textos en español de la interfaz (números normalizados a {n}). Generado por tools/i18n/tour.js',count:set.length,strings:set},null,1)+'\n');console.log('textos:',set.length,'→',path.relative(H.ROOT,OUT));}
  else{
   const base=JSON.parse(fs.readFileSync(OUT,'utf8')).strings,dict=await page.evaluate(l=>({n:I18N.size(l)}),CHECK);
   // un texto cuenta como pendiente si, en el idioma elegido, sigue apareciendo igual que en español
   const known=await page.evaluate(([l,a])=>a.filter(k=>I18N.hasKey(l,k)),[CHECK,set]);const left=set.filter(s=>base.includes(s)&&!known.includes(s));const pct=1-left.length/Math.max(1,base.length);
   console.log(JSON.stringify({lang:CHECK,dictionary:dict.n,spanishLeft:left.length,baseCount:base.length,coverage:+pct.toFixed(3)}));
   fs.writeFileSync(path.join(H.ROOT,`docs/i18n/pending-${CHECK}.txt`),left.join('\n')+'\n');
   if(pct<CORE_MIN){console.log('FAIL cobertura',pct,'<',CORE_MIN);process.exitCode=1;}else console.log('PASS cobertura');
  }
  if(errors.length)console.log('errores de página',errors.slice(0,3));
 }finally{await browser.close();await site.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
