'use strict';
// Captura de TODAS las pantallas de la beta (Campaña + Horda Infinita) en 844x390, 667x375 y 1280x720.
// Uso: NODE_PATH=$(npm root -g) node tools/ux/capture-ui-beta.js <carpeta>
// CAP_TIPS=1 deja ver los consejos de pantalla (js/ui/screen-tips.js) encima de cada captura.
// Además de las capturas deja <carpeta>/audit.json: textos < 14px, botones < 44px y botones tapados por pantalla.
const {chromium}=require('playwright'),{spawn}=require('node:child_process'),path=require('node:path'),fs=require('node:fs');
const ROOT=path.resolve(__dirname,'../..'),OUT=path.resolve(process.argv[2]||'docs/beta-release/ui-beta/antes'),PORT=+(process.env.CAP_PORT||8851);
const srv=spawn('python3',['-m','http.server',String(PORT),'--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const VIEWS=[[844,390],[667,375],[1280,720]];
const AUDIT_JS=()=>{
  const out={small:[],tiny:[],overlap:[]};
  const vis=el=>{const r=el.getBoundingClientRect(),cs=getComputedStyle(el);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none'&&cs.opacity!=='0'&&!el.closest('.hidden,[hidden],[inert]');};
  const root=[...document.querySelectorAll('.screen:not(.hidden),.ui-modal:not(.hidden),#howto:not(.hidden)')];
  const seen=new Set();
  for(const s of root)for(const el of s.querySelectorAll('*')){if(seen.has(el)||!vis(el))continue;seen.add(el);
    const own=[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>1);
    if(own&&!/(^|\s)pxi(\s|$)/.test(String(el.className))){const fs=parseFloat(getComputedStyle(el).fontSize);if(fs<14){const nm=el.id||(typeof el.className==='string'&&el.className)||'';out.small.push((nm||el.tagName+'<'+(el.parentElement.id||el.parentElement.className||el.parentElement.tagName))+':'+fs+':'+el.textContent.trim().slice(0,28));}}
    if(el.matches('button,[role=button],a[href]')){const r=el.getBoundingClientRect();if(r.height<44||r.width<44)out.tiny.push((el.id||el.className)+':'+Math.round(r.width)+'x'+Math.round(r.height));
      const cx=r.left+r.width/2,cy=r.top+r.height/2;if(cx>=0&&cy>=0&&cx<=innerWidth&&cy<=innerHeight){const t=document.elementFromPoint(cx,cy);if(t&&t!==el&&!el.contains(t)&&!t.contains(el))out.overlap.push((el.id||el.className)+' tapado por '+(t.id||t.className));}}}
  return out;};
(async()=>{
 await sleep(600);fs.mkdirSync(OUT,{recursive:true});
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const audit={};
 for(const [w,h] of VIEWS){
  const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:w<1000});
  await ctx.addInitScript(()=>{try{if(!localStorage.getItem('laHordaSave_v1'))localStorage.setItem('laHordaSave_v1',JSON.stringify({tut:{training:1,firstStory:1},starterChosen:true,starterGiftV1:true,starterSkin:'vale',playtestV1Bonus:true,campaignResetV1:true,campaignResetV2:true}));}catch(e){}});
  const p=await ctx.newPage(),errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(`http://127.0.0.1:${PORT}/index.html?dev=1&lazy=0&beta=1${process.env.CAP_TIPS?'&tips=1':''}`,{timeout:180000});
  await p.waitForFunction(()=>typeof setState==='function'&&typeof renderMainMenu==='function'&&typeof showGameOverScreen==='function',null,{timeout:60000});
  await sleep(1500);
  const shot=async(name,fn)=>{
   try{ if(fn)await p.evaluate(fn); }catch(e){errs.push(name+': '+e.message);}
   await sleep(700);
   if(process.env.CAP_TIPS){await p.evaluate(()=>{if(typeof screenTipsReset==='function'){save.tut.tips={};}screenTipsTick();screenTipsTick();}).catch(()=>{});await sleep(400);}
   await p.screenshot({path:`${OUT}/${name}_${w}x${h}.png`});
   audit[`${name}_${w}x${h}`]=await p.evaluate(AUDIT_JS).catch(()=>null);
  };
  await shot('01_titulo',()=>{setState('title');});
  await shot('02_hub',()=>{setState('mainmenu');renderMainMenu();});
  await shot('03_guardian_inicial',()=>{setState('starter');if(typeof renderStarterSelect==='function')renderStarterSelect();});
  await shot('04_campana_arenas',()=>{setState('arenaselect');renderArenaGrid();});
  await shot('05_horda_infinita',()=>{save.arenasCleared=save.arenasCleared||{};save.arenasCleared.fabrica=true;save.arenasCleared[ENDLESS_CFG.unlockArena]=true;try{window.endlessOpen();}catch(e){}});
  await shot('06_tienda',()=>{setState('shop');renderShop();});
  await shot('07_tienda_brasas',()=>{shopTab='brasas';renderShop();});
  await shot('08_coleccion_guardianes',()=>{shopTab='destacados';setState('mainmenu');renderMainMenu();document.getElementById('mainmenu-guardianes-btn').click();});
  await shot('09_talentos',()=>{const t=[...document.querySelectorAll('#champdetail-screen button')].find(x=>/talent/i.test((x.dataset.tab||'')+x.textContent));if(t)t.click();});
  await shot('10_maestria',()=>{const t=[...document.querySelectorAll('#champdetail-screen button')].find(x=>/maestr|mastery/i.test((x.dataset.tab||'')+x.textContent));if(t)t.click();});
  await shot('11_objetos',()=>{setState('inventory');if(typeof renderMyInventory==='function')try{renderMyInventory();}catch(e){}});
  await shot('12_codice',()=>{openCodex();});
  await shot('13_ajustes',()=>{setState('mainmenu');renderMainMenu();openHubOptions();});
  await shot('14_controles',()=>{document.getElementById('opt-keys-btn').click();});
  await shot('15_como_se_juega',()=>{document.getElementById('ctl-map').classList.add('hidden');document.getElementById('hub-options').classList.add('hidden');document.getElementById('hub-howto-btn').click();});
  await shot('16_pausa',()=>{document.getElementById('howto').classList.add('hidden');setState('prep');selectedClass='mago';startRun(1);setState('paused');});
  await shot('17_fin_partida',()=>{showGameOverScreen();});
  fs.writeFileSync(`${OUT}/errors_${w}x${h}.json`,JSON.stringify(errs,null,1));
  await ctx.close();
 }
 fs.writeFileSync(`${OUT}/audit.json`,JSON.stringify(audit,null,1));
 await b.close();srv.kill();
})().catch(e=>{console.error(e);srv.kill();process.exit(1);});
