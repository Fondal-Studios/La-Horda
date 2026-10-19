'use strict';
// Captura y mide el texto en pantalla durante una pelea de jefe en celular apaisado (844x390): panel "Cómo
// sobrevivir", cartel central (runa, oleada, caída de compañero), nombre del jefe y textos flotantes.
//   node tools/ux/capture-boss-text.js <outdir> [etiqueta=antes] [--assert]
// Con --assert falla si: hay más de 1 cartel central visible a la vez, la guía del jefe ocupa más del 25 % del alto,
// el nombre del jefe se corta, o la guía sigue visible tras el primer movimiento.
// Servidor propio en BOSSTXT_PORT (por defecto 47312); BOSSTXT_NOSERVER=1 usa uno ya levantado.
const {spawn}=require('node:child_process'),path=require('node:path'),fs=require('node:fs');
let chromium;try{({chromium}=require('playwright'));}catch(e){({chromium}=require('/opt/node22/lib/node_modules/playwright'));}
const ROOT=path.resolve(__dirname,'../..'),PORT=+(process.env.BOSSTXT_PORT||47312),OWN=!process.env.BOSSTXT_NOSERVER;
const args=process.argv.slice(2).filter(a=>!a.startsWith('--'));
const out=path.resolve(args[0]||'docs/ux/jefes-limpios'),tag=args[1]||'antes',ASSERT=process.argv.includes('--assert');
fs.mkdirSync(out,{recursive:true});
const server=OWN?spawn('python3',['-m','http.server',String(PORT),'--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'}):null;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const snap=()=>{
 const vis=el=>{if(!el)return null;const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden'||el.classList.contains('hidden'))return null;let o=1;for(let a=el;a&&a!==document.body;a=a.parentElement)o*=+getComputedStyle(a).opacity;if(o<.08)return null;const r=el.getBoundingClientRect();return r.width>1&&r.height>1?r:null;};
 const box=id=>{const el=document.getElementById(id),r=vis(el);return r?{id,t:el.textContent.trim().replace(/\s+/g,' ').slice(0,60),x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height),hPct:Math.round(r.height/innerHeight*100)}:null;};
 const name=document.getElementById('boss-name');
 const hero=typeof worldToScreen==='function'&&player?worldToScreen(player.x,player.y):null;
 return {banner:box('center-banner'),card:box('arena-title-card'),intro:box('boss-intro'),bossHud:box('boss-hud'),down:box('downed-overlay'),
  nameTxt:name&&name.textContent,nameCut:name?name.scrollWidth>name.clientWidth+1:null,nameW:name&&name.clientWidth,
  hero:hero&&{x:Math.round(hero.x),y:Math.round(hero.y)},
  words:floatTexts.filter(f=>f.on&&f.kind===4).map(f=>f.text)};
};
(async()=>{await sleep(600);
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),args:['--no-sandbox']});
 const res=[],fails=[];
 try{
  const ctx=await b.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  await ctx.addInitScript(()=>{window.__autoConfirm=true;try{localStorage.clear();}catch(e){}});
  const p=await ctx.newPage(),errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(`http://127.0.0.1:${PORT}/index.html?dev=1`,{timeout:120000});
  for(let k=0;k<600;k++){if(await p.evaluate(()=>{const x=document.getElementById('title-continue-btn');return !!x&&!x.disabled;}))break;await sleep(100);}
  await p.evaluate(()=>{for(const k in save.champions){save.champions[k].level=30;save.champions[k].unlocked=true;}save.starterChosen=true;save.tut={};persistNow();});
  await sleep(500);
  await p.evaluate(async()=>{selectedClass='guerrero';currentArena='bosque';lobbyAllies=['tanque','mago','soporte'];startRun(1);await new Promise(r=>setTimeout(r,1500));if(typeof campClose==='function')campClose(true);
   player.hp=player.maxHp=1e7;startBossFight();});
  // lo que pasa a la vez en una pelea real del Bosque, escalonado: runa despierta (3 s), oleada (5 s), un compañero cae (6,5 s)
  const SHOTS=[1200,3000,4600,6200,8000,10000,12500];
  const plan=[[3000,"showBanner('RUNA ACTIVA (1/4)')"],[5000,"showBanner('¡OLEADA DE CORRUPCIÓN!')"],[6500,"showBanner(heroes.find(h=>h!==player).cls.name+' ha caído')"]];
  let t=0,maxBig=0;
  while(t<=13000){
   for(const [at,js] of plan)if(at===t)await p.evaluate(js);
   const s=await p.evaluate(snap);s.t=t;
   const big=[s.banner,s.card].filter(Boolean).length;maxBig=Math.max(maxBig,big);
   if(SHOTS.includes(t)){res.push(s);await p.screenshot({path:path.join(out,`${tag}-844x390-jefe-${String(t).padStart(5,'0')}ms.png`)});}
   else if(big>1)res.push(s);
   await sleep(250);t+=250;
  }
  res.maxBig=maxBig;
  // primer movimiento: esperar a que la guía esté a la vista, caminar y ver que se va
  await p.evaluate(()=>{bossHudShow(hudBoss);});
  let seen=false;for(let k=0;k<60&&!seen;k++){await sleep(200);seen=!!(await p.evaluate(snap)).intro;}
  await sleep(700);
  const before=await p.evaluate(snap);
  await p.evaluate(()=>{joyVec.x=1;joyVec.y=0;});await sleep(1100);
  const after=await p.evaluate(snap);await p.evaluate(()=>{joyVec.x=0;joyVec.y=0;});
  res.push({moveBefore:before.intro,moveAfter:after.intro});
  for(const s of res){if(!s.t)continue;
   const big=[s.banner,s.card].filter(Boolean).length;if(big>1)fails.push(`t=${s.t}: ${big} carteles centrales a la vez`);
   if(s.intro&&s.intro.hPct>25)fails.push(`t=${s.t}: guía del jefe ocupa ${s.intro.hPct}% del alto`);
   if(s.nameCut)fails.push(`t=${s.t}: nombre del jefe cortado ("${s.nameTxt}", ${s.nameW}px)`);}
  if(res.maxBig>1)fails.push('cartel central: '+res.maxBig+' a la vez');
  const last=res[res.length-1];if(!last.moveBefore)fails.push('la guía del jefe nunca se mostró');else if(last.moveAfter)fails.push('la guía del jefe sigue visible tras el primer movimiento');
  if(errs.length)fails.push('pageerror: '+errs[0]);
  fs.writeFileSync(path.join(out,`${tag}-medicion.json`),JSON.stringify({res,fails},null,1));
  for(const s of res)console.log(JSON.stringify(s.t?{t:s.t,banner:s.banner&&s.banner.t,card:s.card&&s.card.t,intro:s.intro&&`${s.intro.w}x${s.intro.h} (${s.intro.hPct}%) y=${s.intro.y}`,nameCut:s.nameCut,name:s.nameTxt,words:s.words}:s));
  console.log(fails.length?'FALLAS:\n - '+fails.join('\n - '):'sin fallas');
  if(ASSERT&&fails.length)process.exitCode=1;
 }finally{await b.close();if(server)server.kill();}})().catch(e=>{console.error(e);process.exitCode=1;});
