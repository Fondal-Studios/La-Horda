'use strict';
// Ficha de arena (briefing neutro) — antes también probaba los micro-tutoriales con voz, hoy apagados (ARENA_TUT_ON=false):
//  - cada arena con ficha muestra mecánica, peligro (con aviso), jefe y botín destacado (piezas ✓/?).
//  - Reino Fúngico, primera vez: aparece un núcleo de práctica; los pasos avanzan SOLO cuando el jugador
//    lo hace (ver la colonia, entrar al territorio y sentir la lentitud, romper el núcleo, ver la retirada);
//    queda guardado y la segunda partida no lo repite; "saltar" también lo guarda.
const assert=require('node:assert/strict'),{spawn}=require('node:child_process'),path=require('node:path');
let chromium;try{({chromium}=require('playwright'));}catch(e){({chromium}=require('/opt/node22/lib/node_modules/playwright'));}
const ROOT=path.resolve(__dirname,'../..'),PORT=+(process.env.BRIEF_PORT||8836);
const server=spawn('python3',['-m','http.server',String(PORT),'--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 await sleep(500);
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:844,height:390}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${PORT}/`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof runIntroShow==='function'&&typeof arenaTutTick==='function'&&typeof micSpawnNucleo==='function',null,{timeout:120000});
  // 1) briefing de todas las arenas con ficha
  const brief=await page.evaluate(()=>ARENA_ORDER.map(a=>{runIntroShow(a,()=>{});RUN_INTRO.pages=[];RUN_INTRO.prologue=false;runIntroFill(document.getElementById('run-intro'),a,ARENA_BRIEF[a]);
    const el=document.querySelector('#run-intro .abr');const r={a,cells:el?el.querySelectorAll('.abr-cell').length:0,txt:el?el.innerText:'',pieces:el?el.querySelectorAll('.abr-piece').length:0};
    RUN_INTRO.open=false;document.getElementById('run-intro').classList.add('hidden');return r;}));
  for(const b of brief){assert.equal(b.cells,4,`${b.a}: 4 briefing cells`);assert(/AVISO/i.test(b.txt),`${b.a}: hazard telegraph shown`);assert(b.pieces>=4,`${b.a}: featured set pieces`);}
  // 2) la ficha es neutra y los micro-tutoriales con voz quedaron apagados (el Hechicero solo habla por el Libro)
  const off=await page.evaluate(()=>({on:ARENA_TUT_ON,say:ARENA_ORDER.some(a=>ARENA_BRIEF[a].say),tut:typeof tutSay('atut_x','x',null,1000,true)==='boolean'&&tutSay('atut_x','x',null,1000,true)===false}));
  assert.equal(off.on,false,'arena tutorials off');assert.equal(off.say,false,'no opening line');assert.equal(off.tut,true,'tutSay discards arena tutorial steps');
  assert.deepEqual(errors,[]);
  console.log('PASS ficha de arena neutra (10 arenas: mecánica, peligro+aviso, jefe, botín) y micro-tutoriales con voz apagados');
 }finally{await browser.close();server.kill();}
})().catch(e=>{console.error(e);server.kill();process.exitCode=1;});
