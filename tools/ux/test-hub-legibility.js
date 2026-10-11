'use strict';
/* Hub: se desliza, Guerra de Cristales / Coliseo / Códice están a la vista con etiqueta grande, y ningún texto visible
 * es menor a 14 px ni los botones menores a 44 px de alto. Viewports de celular horizontal y escritorio. */
const {chromium}=require('playwright');const assert=require('node:assert/strict');
const {spawn}=require('node:child_process'),path=require('node:path');
const PORT=8891,BASE=process.env.SITE||('http://127.0.0.1:'+PORT);
const srv=process.env.SITE?null:spawn('python3',['-m','http.server',String(PORT)],{cwd:path.resolve(__dirname,'../..'),stdio:'ignore'});
const wait=async()=>{for(let i=0;i<50;i++){try{if((await fetch(BASE+'/index.html')).ok)return;}catch{}await new Promise(r=>setTimeout(r,100));}throw Error('servidor no listo');};
(async()=>{await wait();const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 for(const [w,h] of [[844,390],[667,375],[932,430],[1280,720]]){
  const ctx=await b.newContext({viewport:{width:w,height:h}});await ctx.addInitScript(()=>{try{localStorage.setItem('laHordaSave_v1',JSON.stringify({tut:{training:1},starterChosen:true,starterGiftV1:true,starterSkin:'vale',playtestV1Bonus:true,campaignResetV1:true,campaignResetV2:true}));}catch(e){}});
  const p=await ctx.newPage(),errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(BASE+'/index.html?lazy=0');await p.waitForFunction(()=>typeof setState==='function'&&typeof renderMainMenu==='function',null,{timeout:30000});
  await p.evaluate(()=>{setState('mainmenu');renderMainMenu();});await p.waitForTimeout(600);
  const r=await p.evaluate(()=>{
   const s=document.getElementById('mainmenu-screen'),out={scrolls:s.scrollHeight>s.clientHeight+2||getComputedStyle(s).overflowY==='auto',small:[],btns:{}};
   const vis=el=>{const r=el.getBoundingClientRect(),cs=getComputedStyle(el);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none'&&!el.closest('.hidden');};
   for(const el of s.querySelectorAll('*')){if(!vis(el))continue;const own=[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>1);if(!own)continue;const fs=parseFloat(getComputedStyle(el).fontSize);if(fs<14)out.small.push((el.id||el.className||el.tagName)+':'+fs+':'+el.textContent.trim().slice(0,24));}
   for(const id of ['hub-crystal-btn','hub-coliseum-btn','mainmenu-codex-btn','mainmenu-guardianes-btn','mainmenu-tienda-btn','mainmenu-jugar-btn','hub-play-btn']){const el=document.getElementById(id);if(!el){out.btns[id]=null;continue;}const r=el.getBoundingClientRect(),t=el.querySelector('.hub-tile-title,.hub-play-title');out.btns[id]={h:Math.round(r.height),w:Math.round(r.width),title:t?t.textContent.trim():'',fs:t?parseFloat(getComputedStyle(t).fontSize):0};}
   return out;});
  assert(r.scrolls,w+': el hub no se desliza');
  assert.deepEqual(r.small,[],w+': textos menores a 14 px: '+r.small.join(' | '));
  for(const [id,v] of Object.entries(r.btns)){assert(v,w+': falta '+id);assert(v.h>=44,w+': '+id+' alto '+v.h);assert(v.fs>=18,w+': '+id+' título '+v.fs);}
  assert.match(r.btns['hub-crystal-btn'].title,/GUERRA DE CRISTALES/);assert.match(r.btns['hub-coliseum-btn'].title,/COLISEO/);assert.match(r.btns['mainmenu-codex-btn'].title,/CÓDICE/);
  // se puede llegar a todo deslizando
  await p.evaluate(()=>{const s=document.getElementById('mainmenu-screen');s.scrollTop=s.scrollHeight;});await p.waitForTimeout(200);
  const bottom=await p.evaluate(()=>{const s=document.getElementById('mainmenu-screen'),sr=s.getBoundingClientRect();return ['mainmenu-codex-btn','mainmenu-jugar-btn'].every(id=>{const r=document.getElementById(id).getBoundingClientRect();return r.bottom<=sr.bottom+1&&r.top>=sr.top-1;});});
  assert(bottom,w+': el final del menú no es alcanzable');assert.deepEqual(errs,[]);
  console.log('PASS hub '+w+'x'+h+': desliza, 3 modos con etiqueta grande, sin texto < 14 px');await ctx.close();}
 await b.close();if(srv)srv.kill();})().catch(e=>{console.error(e.message||e);if(srv)srv.kill();process.exit(1);});
