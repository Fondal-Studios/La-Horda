// Primer minuto con la secuencia nueva (Libro en carga -> guardian -> regalo skin -> tutorial -> Libro de arena -> ficha -> juego)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const [W,H,tag,mode]=[+process.argv[2],+process.argv[3],process.argv[4],process.argv[5]||'tutorial']; // mode: tutorial | skip
const S='.';
const base='http://127.0.0.1:'+(process.env.PORT||18432);
(async()=>{
 const b=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
 const ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:W<1000,isMobile:W<1000});
 await ctx.addInitScript(()=>{window.__codexBook=true;window.__starterGift=true;window.__firstRun=true;});
 const p=await ctx.newPage(); const errs=[],cons=[]; let nreq=0,bytes=0;
 p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')cons.push(m.text().slice(0,140))});
 p.on('response',r=>{nreq++;const l=r.headers()['content-length'];if(l)bytes+=+l;});
 await p.route('https://fondalstudios.com/**',r=>r.abort());
 const t0=Date.now(); const T=[]; const mark=k=>{T.push([k,Date.now()-t0]);console.log(String(Date.now()-t0).padStart(6),k)};
 const snap=async n=>{try{await p.screenshot({path:`${S}/${tag}_${n}.png`})}catch(e){}};
 await p.goto(base+'/index.html',{waitUntil:'commit'});
 let last='',taps=0,shots={};
 const vis=()=>p.evaluate(()=>{const v=s=>{const e=document.querySelector(s);return !!(e&&!e.classList.contains('hidden')&&e.getBoundingClientRect().width>0)};
   const screens=[...document.querySelectorAll('.screen:not(.hidden)')].map(e=>e.id);
   return {state:typeof state!=='undefined'?state:null,book:v('#codex-book'),bookKind:(typeof BOOK!=='undefined'&&BOOK.open)?BOOK.kind:null,runintro:v('#run-intro'),stepChamp:v('#starter-step-champ'),stepSkin:v('#starter-step-skin'),train:typeof ALPHA_TRAINING!=='undefined'&&!!ALPHA_TRAINING.active,screens:screens.join('+'),ready:(()=>{const x=document.getElementById('title-continue-btn');return !!x&&!x.disabled})(),kills:(()=>{const m=document.body.innerText.match(/Vencidos\s*(\d+)/);return m?+m[1]:0})(),acct:v('#account-gate')||!!document.querySelector('[data-account-gate]:not(.hidden)')}}).catch(()=>null);
 const tap=async(sel,why)=>{try{const l=p.locator(sel).first(); if(await l.count()&&await l.isVisible()&&await l.isEnabled()){await l.click({timeout:2000}); taps++; mark('TAP '+why); return true}}catch(e){} return false};
 let combatT=null, playingT=null, firstKillT=null;
 for(let i=0;i<500;i++){
  const v=await vis(); if(!v){await p.waitForTimeout(250);continue}
  const key=[v.state,v.book?'BOOK:'+v.bookKind:'',v.runintro?'RUNINTRO':'',v.stepChamp?'CHAMP':'',v.stepSkin?'SKIN':'',v.train?'TRAIN':'',v.screens].join('|');
  if(key!==last){mark('STATE '+key); last=key; if(!shots[key]){shots[key]=1; await snap(String(Object.keys(shots).length).padStart(2,'0'));}}
  if(v.state==='playing'&&!playingT){playingT=Date.now()-t0}
  if(v.state==='playing'&&v.kills>0&&!firstKillT){firstKillT=Date.now()-t0;mark('FIRST KILL')}
  if(firstKillT&&Date.now()-t0>firstKillT+3000)break;
  if(v.book){ if(!(await tap('#codex-book .bk-skip','skip libro '+v.bookKind))) {} }
  else if(v.ready&&v.state==='title'){await tap('#title-continue-btn','continuar')}
  else if(await p.locator('#first-story').isVisible().catch(()=>false)){ await tap(mode==='skip'?'#first-story-skip':'#first-story-go','historia inicial: '+mode) }
  else if(v.stepChamp){ if(!(await tap('#starter-yes-btn','confirmar guardian'))) await tap('.starter-card','elegir guardian'); }
  else if(v.stepSkin){ if(!(await tap('#starter-skin-later-btn, #starter-step-skin .btn.secondary','skin despues'))) await tap('#starter-step-skin .btn','skin btn'); }
  else if(v.state==='mainmenu'&&mode==='skip'&&!v.runintro&&!(await p.locator('#first-story').isVisible().catch(()=>false))){ await tap('#hub-play-btn','JUGAR (hub)'); await tap('#prep-start-btn','prep: empezar') }
  else if(v.runintro){ await tap('#run-intro .ri-go','ficha: jugar') }
  else if(v.state==='playing'){
    if(v.train&&mode==='skip'){ await tap('text=Saltar tutorial','saltar tutorial') }
    else { // autoataque / mover para generar combate
      await p.evaluate(()=>{try{ if(window.__AP&&!__AP.on){} }catch(e){}});
      try{ const bb=await p.locator('#btn-basic').boundingBox(); if(bb){ await p.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2);} }catch(e){}
    }
  }
  await p.waitForTimeout(250);
 }
 await snap('99_end');
 const fps=await p.evaluate(()=>new Promise(res=>{let f=0;const t=performance.now();function r(){f++;if(performance.now()-t>3000)res(f/3);else requestAnimationFrame(r)}r()}));
 console.log(JSON.stringify({tag,taps,playingMs:playingT,firstKillMs:firstKillT,requests:nreq,mbContentLength:+(bytes/1e6).toFixed(1),fps:+fps.toFixed(1),pageerrors:errs.slice(0,4),consoleErrors:[...new Set(cons)].slice(0,4)}));
 await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1)});
