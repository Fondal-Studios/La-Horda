'use strict';
/* Clanes y Conquista del Castillo por la interfaz real, contra el servidor de cuentas REAL (server/accounts.js en memoria de un
 * directorio temporal), en 844×390 y 667×375: tarjeta del hub, pantalla «Clan» (buscar, pedir entrar, unirse, salir con confirmación,
 * crear, miembros con permisos, expulsar, tabla), requisito de campaña para el castillo, partida de asedio ATACANDO y DEFENDIENDO
 * (HUD, murallas, resultado), puntos de clan en el servidor, parte sin conexión en cola (sin sumar dos veces), invitado sin cuenta,
 * ausencia de texto cortado / desborde horizontal / letra menor a 14 px / botones menores a 44 px, sin errores de página.
 * Uso: node tools/clan/clan-ui.js */
process.env.REGISTER_MAX_IP = '500'; process.env.API_MAX_IP = '100000'; process.env.CLAN_ACT_MAX = '500'; process.env.CLAN_COOLDOWN_MS = '1500';
const {chromium}=require('playwright');const {spawn}=require('node:child_process');const path=require('node:path');const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),http=require('node:http');
const accountsMod=require('../../server/accounts.js');
const ROOT=path.resolve(__dirname,'../..'),WEB=8862;
const web=spawn('python3',['-m','http.server',String(WEB)],{cwd:ROOT,stdio:'ignore'});
let clock=Date.now();   // reloj del servidor de clanes (las partidas se simulan en segundos: se adelanta lo que "duraron")
const accounts=accountsMod.create({now:()=>clock,dataDir:fs.mkdtempSync(path.join(os.tmpdir(),'horda-clan-ui-')),databaseUrl:'',log:()=>{},originAllowed:()=>true,adminUsers:'nadie_admin'});
const apiSrv=http.createServer((q,s)=>{if(!accounts.handle(q,s)){s.writeHead(404);s.end();}});
let API='';
const FIX={tut:{training:1},starterChosen:true,starterGiftV1:true,starterSkin:'vale',playtestV1Bonus:true,campaignResetV1:true,campaignResetV2:true};
async function api(method,p,body,token){const r=await fetch(API+p,{method,headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,j:await r.json()};}
async function reg(name){const r=await api('POST','/api/register',{user:name,pass:'clave-de-prueba-1',name});assert.equal(r.status,201,JSON.stringify(r.j));return r.j;}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// Problemas de diseño dentro de `rootSel`: texto fuera de su caja, desborde horizontal, letra < 14 px, botones < 44 px de alto.
const LAYOUT=`(rootSel,opts)=>{
 const root=document.querySelector(rootSel);if(!root)return ['no existe '+rootSel];
 const out=[],rr=root.getBoundingClientRect(),vis=el=>{const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0)return false;const r=el.getBoundingClientRect();return r.width>0&&r.height>0;};
 const clipX=el=>{for(let a=el;a&&a!==root.parentElement;a=a.parentElement){const cs=getComputedStyle(a);if(/(hidden|clip)/.test(cs.overflowX))return a;}return null;};
 for(const el of root.querySelectorAll('*')){
  if(['SCRIPT','STYLE','CANVAS','svg','path','OPTION'].includes(el.tagName)||!vis(el))continue;
  const cs=getComputedStyle(el),r=el.getBoundingClientRect();
  const own=[...el.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim()).map(n=>n.textContent.trim()).join(' ');
  if(own){
   if(parseFloat(cs.fontSize)<14)out.push('letra '+cs.fontSize+': "'+own.slice(0,30)+'"');
   let tx0=Infinity,tx1=-Infinity;for(const n of el.childNodes){if(n.nodeType!==3||!n.textContent.trim())continue;const g=document.createRange();g.selectNodeContents(n);for(const q of g.getClientRects()){tx0=Math.min(tx0,q.left);tx1=Math.max(tx1,q.right);}}
   const over=Math.max(r.left-tx0,tx1-r.right);
   if(over>2&&cs.textOverflow!=='ellipsis'&&!/(hidden|clip)/.test(cs.overflowX))out.push('texto desborda su caja ('+Math.round(over)+'px): "'+own.slice(0,30)+'"');
   if(cs.textOverflow==='ellipsis'&&el.scrollWidth>el.clientWidth+1)out.push('texto cortado con puntos suspensivos: "'+own.slice(0,30)+'"');
  }
  if(!clipX(el)||clipX(el)===root){ if(r.right>rr.right+1.5||r.left<rr.left-1.5)out.push('sale del marco horizontalmente ('+Math.round(Math.max(r.right-rr.right,rr.left-r.left))+'px): '+el.tagName+'.'+String(el.className).slice(0,30)+' "'+(own||el.textContent||'').trim().slice(0,24)+'"'); }
  if((el.tagName==='BUTTON'||el.tagName==='INPUT'||el.tagName==='SELECT')&&!(opts&&opts.skipTouch)&&r.height<43.5)out.push('objetivo táctil de '+Math.round(r.height)+'px: '+(el.textContent||el.name||'').trim().slice(0,24));
 }
 return out.slice(0,10);}`;
(async()=>{
 await accounts.ready;await new Promise(r=>apiSrv.listen(0,'127.0.0.1',r));API='http://127.0.0.1:'+apiSrv.address().port;
 for(let i=0;i<60;i++){try{if((await fetch(`http://127.0.0.1:${WEB}/index.html`)).ok)break;}catch{}await sleep(100);}
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 for(const [w,h] of [[844,390],[667,375]]){
  const tag=w+'x'+h, sfx=String(w);
  const me=await reg('jugador'+sfx),ana=await reg('ana'+sfx),beto=await reg('beto'+sfx),carla=await reg('carla'+sfx);
  assert.equal((await api('POST','/api/clan/create',{name:'Cuervos de Ceniza '+(w===844?'':'II'),tag:w===844?'CCZ':'CCY',desc:'Clan abierto de prueba',joinMode:'open'},ana.token)).status,200);
  assert.equal((await api('POST','/api/clan/create',{name:'Guardia Gris '+(w===844?'':'II'),tag:w===844?'GGR':'GGQ',desc:'Solo por solicitud',joinMode:'closed'},beto.token)).status,200);
  const ctx=await browser.newContext({viewport:{width:w,height:h},hasTouch:true});
  await ctx.addInitScript(({f,base,s})=>{try{localStorage.setItem('laHordaSave_v1',JSON.stringify(f));localStorage.setItem('horda_account:'+encodeURIComponent(base),JSON.stringify({token:s.token,user:s.user.user,name:s.user.name,expiresAt:s.expiresAt,apiBase:base}));}catch(e){}},{f:FIX,base:API,s:me});
  const p=await ctx.newPage(),errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|favicon/.test(m.text()))errs.push('console:'+m.text());});
  await p.goto(`http://127.0.0.1:${WEB}/index.html?lazy=0&api=${encodeURIComponent(API)}`);
  await p.waitForFunction(()=>typeof setState==='function'&&typeof renderMainMenu==='function'&&typeof lanesStart==='function'&&typeof clanOpen==='function'&&typeof accountState==='function'&&accountState().logged,null,{timeout:60000});
  // La cuenta recién creada sube/baja el guardado y puede mostrar «¿Qué progreso usamos?»: se espera, se elige este dispositivo y se
  // apaga la sincronización de ESTA página (esta prueba es de clanes, no de la nube: sus pruebas son tools/alpha/cloud-recovery.js).
  await p.waitForFunction(()=>!accountState().syncing,null,{timeout:15000});await p.waitForTimeout(1200);
  if(await p.evaluate(()=>state==='account')){await p.getByRole('button',{name:'Usar este dispositivo'}).click().catch(()=>{});await p.waitForTimeout(800);}
  await p.evaluate(()=>{accountPull=async()=>{};accountUpload=async()=>true;_acctPullIfStale=()=>{};accountSyncNow=async()=>{};});
  await p.evaluate(()=>{save.tut=save.tut||{};save.tut.training=1;save.arenasCleared={};persistNow();setState('mainmenu');renderMainMenu();});
  const lay=async(sel,opts)=>{const r=await p.evaluate(`(${LAYOUT})(${JSON.stringify(sel)},${JSON.stringify(opts||null)})`);return r;};
  const inView=async sel=>p.evaluate(s=>{const r=document.querySelector(s).getBoundingClientRect();return r.left>=-0.5&&r.top>=-0.5&&r.right<=innerWidth+0.5&&r.bottom<=innerHeight+0.5;},sel);
  const shot=async n=>{if(process.env.CLAN_SHOTS)await p.screenshot({path:path.join(process.env.CLAN_SHOTS,tag+'-'+n+'.png')});};
  const msg=async()=>(await p.textContent('#clan-screen .clan-msg').catch(()=>''))||'';
  const tabs=async()=>p.$$eval('#clan-screen .clan-tab',a=>a.map(x=>x.textContent));
  const waitText=(re,sel='#clan-screen .clan-scroll')=>p.waitForFunction(({re,sel})=>new RegExp(re).test((document.querySelector(sel)||{}).textContent||''),{re:re.source,sel},{timeout:8000}).catch(async e=>{console.log('ESPERABA',re,'EN',sel,'->',await p.evaluate(s=>((document.querySelector(s)||{}).textContent||'').slice(0,400),sel));throw e;});
  const clickTab=async name=>{await p.click(`#clan-screen .clan-tab:text-is("${name}")`);await sleep(250);};
  // fin de la tarjeta del hub
  await p.evaluate(()=>document.getElementById('mainmenu-clan-btn').scrollIntoView({block:'center'}));
  const tile=await p.evaluate(()=>{const r=document.getElementById('mainmenu-clan-btn').getBoundingClientRect();return {w:r.width,h:r.height,vis:r.width>0};});
  assert(tile.vis&&tile.h>=44&&tile.w>=44,tag+': tarjeta CLAN visible y táctil '+JSON.stringify(tile));
  assert.deepEqual(await lay('#hub-grid',{skipTouch:true}),[],tag+': el hub con la tarjeta CLAN sin desbordes');
  // control negativo: el detector de diseño tiene que encontrar un texto de 10 px, un botón de 30 px y un desborde horizontal
  await p.evaluate(()=>{const d=document.createElement('div');d.id='lay-ctl';d.style.cssText='position:fixed;left:0;top:0;width:120px;z-index:999';d.innerHTML='<span style="font-size:10px">diminuto</span><button style="height:30px">chico</button><div style="width:400px;white-space:nowrap">'+'x'.repeat(80)+'</div>';document.body.appendChild(d);});
  const ctl=await lay('#lay-ctl');assert(ctl.some(x=>/letra/.test(x))&&ctl.some(x=>/táctil/.test(x))&&ctl.some(x=>/desborda|sale del marco/.test(x)),tag+': el detector de diseño funciona (control negativo) '+JSON.stringify(ctl));
  await p.evaluate(()=>document.getElementById('lay-ctl').remove());
  /* ---- sin clan ---- */
  await p.click('#mainmenu-clan-btn',{timeout:8000}).catch(async e=>{console.log('DEBUG',await p.evaluate(()=>({state,vis:[...document.querySelectorAll('body > *')].filter(x=>x.getBoundingClientRect().width>0&&getComputedStyle(x).display!=='none').map(x=>x.tagName+'#'+x.id+'.'+String(x.className).slice(0,30))})));await p.screenshot({path:'/tmp/claude-0/scratch/fail.png'});throw e;});
  await p.waitForSelector('#clan-screen:not(.hidden) .clan-tab');
  assert.deepEqual(await tabs(),['Buscar','Crear','Tabla'],tag+': pestañas sin clan');
  await waitText(/Cuervos de Ceniza/);
  assert(await inView('#clan-screen .clan-panel'),tag+': el panel entra en la pantalla');
  assert.deepEqual(await lay('#clan-screen .clan-panel'),[],tag+': Buscar sin problemas de diseño');await shot('1-buscar');
  await p.fill('#clan-screen input[name=q]',w===844?'ggr':'ggq');await p.click('#clan-screen form[data-clan-form=search] button');
  await waitText(/Guardia Gris/);assert.equal(await p.locator('#clan-screen .clan-row').count(),1,tag+': la búsqueda filtra');
  await p.click('#clan-screen [data-clan-join]');await waitText(/Pediste entrar/);
  assert.equal((await api('GET','/api/clan',undefined,beto.token)).j.clan.requests.length,1,tag+': el líder ve la solicitud en el servidor');
  await p.fill('#clan-screen input[name=q]',w===844?'ccz':'ccy');await p.click('#clan-screen form[data-clan-form=search] button');await waitText(/Cuervos de Ceniza/);
  await p.click('#clan-screen [data-clan-join]');await waitText(/Ya sos parte de Cuervos/);
  assert.deepEqual(await tabs(),['Mi clan','Miembros','Castillo','Tabla'],tag+': pestañas con clan');
  assert.equal((await api('GET','/api/clan',undefined,me.token)).j.me.role,'member',tag+': entró como miembro (servidor)');
  assert.deepEqual(await lay('#clan-screen .clan-panel'),[],tag+': Mi clan sin problemas de diseño');
  await clickTab('Miembros');assert.equal(await p.locator('#clan-screen .clan-member').count(),2);
  assert.equal(await p.locator('#clan-screen [data-clan-kick]').count(),0,tag+': un miembro raso no ve botones de moderación');
  assert.deepEqual(await lay('#clan-screen .clan-panel'),[],tag+': Miembros sin problemas de diseño');
  /* ---- salir con confirmación real, enfriamiento, crear ---- */
  await clickTab('Mi clan');
  await p.evaluate(()=>{const s=document.querySelector('#clan-screen .clan-scroll');s.scrollTop=s.scrollHeight;});
  assert(await p.evaluate(()=>{const b=document.querySelector('#clan-screen [data-clan-leave]').getBoundingClientRect(),s=document.querySelector('#clan-screen .clan-scroll').getBoundingClientRect();return b.bottom<=s.bottom+1&&b.top>=s.top-1;}),tag+': el botón Salir se alcanza con el scroll');
  await p.click('#clan-screen [data-clan-leave]');await p.waitForSelector('#game-dialog .gd-ok',{state:'visible'});
  await p.click('#game-dialog .gd-ok');await waitText(/Saliste del clan/);
  await p.waitForFunction(()=>[...document.querySelectorAll('#clan-screen .clan-tab')].some(t=>t.textContent==='Buscar'),null,{timeout:8000});
  assert.deepEqual(await tabs(),['Buscar','Crear','Tabla']);
  assert.equal((await api('GET','/api/clan',undefined,me.token)).j.clan,null,tag+': el servidor ya no lo tiene en el clan');
  await clickTab('Crear');
  await p.fill('#clan-screen input[name=name]','Lobos del Alba'+(w===844?'':' II'));await p.fill('#clan-screen input[name=tag]','lda'+(w===844?'':'x').slice(0,1));
  assert.deepEqual(await lay('#clan-screen .clan-panel'),[],tag+': Crear sin problemas de diseño');
  await p.click('#clan-screen form[data-clan-form=create] button[type=submit]');await waitText(/enfri|esper|minutos|Esperá/i,'#clan-screen .clan-msg');
  clock+=2000;   // CLAN_COOLDOWN_MS = 1500 en esta prueba
  await clickTab('Crear');
  await p.fill('#clan-screen input[name=name]','Lobos del Alba'+(w===844?'':' II'));await p.fill('#clan-screen input[name=tag]','lda'+(w===844?'':'x').slice(0,1));await p.fill('#clan-screen input[name=desc]','Clan de prueba <b>x</b>');
  await p.click('#clan-screen form[data-clan-form=create] button[type=submit]');await waitText(/Lobos del Alba/);
  const mine=(await api('GET','/api/clan',undefined,me.token)).j;
  assert.equal(mine.me.role,'leader',tag+': el creador es líder');assert(!mine.clan.desc.includes('<'),tag+': el servidor limpia el HTML de la descripción');
  assert.equal(await p.locator('#clan-screen form[data-clan-form=edit]').count(),1,tag+': el líder ve el editor');
  assert.deepEqual(await lay('#clan-screen .clan-panel'),[],tag+': Mi clan (líder) sin problemas de diseño');await shot('2-mi-clan');
  /* ---- moderación desde la interfaz ---- */
  const myTag=mine.clan.tag, myId=mine.clan.id;
  assert.equal((await api('POST','/api/clan/join',{id:myId},carla.token)).status,200);
  await p.evaluate(()=>{clanClose();});await p.click('#mainmenu-clan-btn',{force:true}).catch(()=>p.evaluate(()=>clanOpen()));await p.waitForSelector('#clan-screen:not(.hidden) .clan-tab');
  await clickTab('Miembros');await waitText(/carla/i);
  assert.deepEqual(await lay('#clan-screen .clan-panel'),[],tag+': Miembros (líder) sin problemas de diseño');await shot('3-miembros');
  await p.click('#clan-screen [data-clan-role$=":officer"]');await waitText(/Ascendido/,'#clan-screen .clan-msg');
  assert.equal((await api('GET','/api/clan',undefined,carla.token)).j.me.role,'officer',tag+': ascenso aplicado en el servidor');
  await p.evaluate(()=>{window.__autoConfirm=true;});
  await p.click('#clan-screen [data-clan-kick]');await waitText(/expulsado/,'#clan-screen .clan-msg');
  assert.equal((await api('GET','/api/clan',undefined,carla.token)).j.clan,null,tag+': expulsión aplicada en el servidor');
  await p.evaluate(()=>{window.__autoConfirm=false;});
  await clickTab('Tabla');await waitText(/Lobos del Alba/);
  assert(await p.locator('#clan-screen .clan-row').count()>=3 && await p.locator('#clan-screen .clan-row.me').count()===1,tag+': la tabla lista los clanes y marca el tuyo');
  assert.deepEqual(await lay('#clan-screen .clan-panel'),[],tag+': Tabla sin problemas de diseño');await shot('4-tabla');
  /* ---- Castillo: requisito de campaña ---- */
  await clickTab('Castillo');
  assert.match(await p.textContent('#clan-screen .clan-lock'),/Se abre al completar la campaña/,tag+': aviso de campaña');
  assert.equal(await p.isDisabled('#clan-screen [data-clan-start]'),true,tag+': comenzar deshabilitado sin campaña');
  assert.deepEqual(await lay('#clan-screen .clan-panel'),[],tag+': Castillo (bloqueado) sin problemas de diseño');
  await p.evaluate(()=>{save.arenasCleared=Object.fromEntries(ARENA_ORDER.map(a=>[a,true]));persistNow();});
  await p.evaluate(()=>{clanClose();clanOpen({tab:'castle'});});await p.waitForSelector('#clan-screen [data-clan-start]:not([disabled])');
  await p.evaluate(()=>{const s=document.querySelector('#clan-screen .clan-scroll');s.scrollTop=0;});
  assert.deepEqual(await lay('#clan-screen .clan-panel'),[],tag+': Castillo (abierto) sin problemas de diseño');await shot('5-castillo');
  assert.match(await p.textContent('#clan-screen .clan-lead'),/contra bots/i,tag+': el texto dice que es contra bots');
  assert.match(await p.textContent('#clan-screen .clan-scroll'),/no son una clasificación verificada|no es clan contra clan/i);
  const lvl0=await p.evaluate(()=>JSON.stringify(Object.values(save.champions).map(c=>c.level)));
  /* ---- partida ATACANDO (nivel 1) ---- */
  const play=async(side,tier)=>{
   await p.evaluate(()=>{clanClose();clanOpen({tab:'castle'});});await p.waitForSelector('#clan-screen [data-clan-start]:not([disabled])');
   await p.click(`#clan-screen [data-clan-side=${side}]`);await p.click(`#clan-screen [data-clan-tier="${tier}"]`);
   await p.click('#clan-screen [data-clan-start]');
   await p.waitForFunction(()=>state==='playing'&&lanesOn()&&LN.castle,null,{timeout:20000});
  };
  await play('attack',1);
  const st=await p.evaluate(()=>({side:LN.castle.side,tier:LN.castle.tier,team:player.team,mode:LN.mode,labels:[castleTeamLabel(0),castleTeamLabel(1)],heroes:heroes.length,arena:document.getElementById('hud-arena').textContent,
   shape:{gates:LN.team[1].S.filter(s=>s.castle==='gate').length,keeps:LN.team[1].S.filter(s=>s.castle==='keep').length,atkTowers:LN.team[0].S.filter(s=>s.alive&&s.kind==='tower').length}}));
  assert.deepEqual([st.side,st.tier,st.team,st.mode,st.heroes,st.arena],['attack',1,0,'castle',10,'Asedio al castillo'],tag+': arrancó atacando '+JSON.stringify(st));
  assert.deepEqual(st.shape,{gates:3,keeps:3,atkTowers:0},tag+': castillo');
  assert(st.labels[0].includes('ASEDIO')&&st.labels[1].includes('CASTILLO'),tag+': etiquetas '+st.labels);
  const myTagUp=myTag;assert(st.labels[0].includes('['+myTagUp+']'),tag+': el HUD muestra la etiqueta de TU clan '+st.labels[0]);
  await p.waitForTimeout(500);
  const hudScore=await p.evaluate(()=>{const s=document.querySelector('.ln-score'),r=s.getBoundingClientRect();const bad=[...s.querySelectorAll('.ln-team,.ln-pips,.ln-clock,b')].filter(e=>e.scrollWidth>e.clientWidth+1||e.getBoundingClientRect().right>r.right+1||e.getBoundingClientRect().left<r.left-1).map(e=>e.className+':'+e.textContent.slice(0,30));return {bad,inView:r.left>=0&&r.right<=innerWidth,text:s.textContent};});
  assert.deepEqual(hudScore.bad,[],tag+': marcador del castillo sin desborde '+hudScore.text);assert(hudScore.inView);
  assert.deepEqual(await lay('.ln-score',{skipTouch:true}),[],tag+': marcador: letra >= 14 px y sin texto cortado');
  const cut=await p.evaluate(()=>['hud-arena','goal-chip'].map(id=>{const e=document.getElementById(id);return e&&e.getBoundingClientRect().width>0&&e.scrollWidth>e.clientWidth+1?id+': '+e.textContent:null;}).filter(Boolean));
  assert.deepEqual(cut,[],tag+': rótulos del HUD sin texto cortado (…)');
  await p.evaluate(()=>{const g=LN.team[1].S.find(s=>s.castle==='gate');player.x=g.x-160;player.y=g.y;});await p.waitForTimeout(500);await shot('6-hud-ataque');
  // las puertas resisten a los héroes (solo el 55 %) y la torre no
  const mult=await p.evaluate(()=>{const g=LN.team[1].S.find(s=>s.castle==='gate'),t=LN.team[1].S.find(s=>s.castle==='tower');return [castleDmgMult(g._lnProxy),castleDmgMult(t._lnProxy)];});
  assert.deepEqual(mult,[0.55,1],tag+': puertas resisten a los héroes');
  // victoria: caen los homenajes y el corazón
  clock+=400000;   // «duró» 200 s y pasó el tiempo que exige el servidor entre partes
  await p.evaluate(()=>{const D=LN.team[1].S;for(const s of D)if(s.castle==='keep'){s.alive=false;s.hp=0;}LN.t=200000;lanesStructDamage(D.find(s=>s.castle==='heart'),1e6,0);});
  await p.waitForSelector('#lanes-result:not(.hidden)',{timeout:8000});
  assert.match(await p.textContent('#lanes-result h2'),/CASTILLO CONQUISTADO/,tag+': título de victoria atacando');
  await p.waitForFunction(()=>/Puntos de clan: \+12/.test(document.getElementById('ln-res-clan').textContent),null,{timeout:8000});
  assert.equal((await api('GET','/api/clan',undefined,me.token)).j.clan.points,12,tag+': el servidor sumó +12');
  assert(await inView('#lanes-result .ln-res-card')||await p.evaluate(()=>{const c=document.querySelector('#lanes-result .ln-res-card');return c.scrollHeight>=c.clientHeight;}),tag+': la tarjeta de resultado entra o scrollea');
  assert.deepEqual(await lay('#lanes-result .ln-res-card',{skipTouch:false}),[],tag+': resultado sin problemas de diseño');await shot('7-resultado');
  const wasMatch=await p.evaluate(()=>LN.castleReport.matchId);
  await p.click('#lanes-result .ln-again');await p.waitForFunction(()=>state==='playing'&&lanesOn()&&LN.castle&&LN.t<3000,null,{timeout:20000});
  assert.notEqual(await p.evaluate(()=>LN.castleMatchId||null),wasMatch,tag+': la revancha usa otro identificador de partida');
  assert.deepEqual(await p.evaluate(()=>[LN.castle.side,LN.castle.tier]),['attack',1],tag+': la revancha conserva rol y nivel');
  // abandonar: sin parte, sin puntos
  await p.click('#pause-btn');await p.click('#quit-btn');await p.waitForTimeout(400);await p.getByRole('button',{name:'Abandonar',exact:true}).click();
  await p.waitForFunction(()=>state==='mainmenu'&&!lanesOn(),null,{timeout:10000});
  assert.equal((await api('GET','/api/clan',undefined,me.token)).j.clan.points,12,tag+': abandonar no suma ni resta');
  /* ---- partida DEFENDIENDO (nivel 3): el castillo resiste ---- */
  await play('defend',3);
  const sd=await p.evaluate(()=>({team:player.team,myLabel:castleTeamLabel(1),note:document.querySelector('.ln-note').textContent,heroTeams:[heroes.filter(h=>h.team===0).length,heroes.filter(h=>h.team===1).length]}));
  assert.equal(sd.team,1,tag+': defendiendo, el jugador está en el castillo');assert.deepEqual(sd.heroTeams,[5,5]);assert(sd.myLabel.includes('['+myTag+']'),tag+': etiqueta propia en el castillo');
  assert.deepEqual(await lay('.ln-score',{skipTouch:true}),[],tag+': marcador (defensa) sin problemas');await shot('8-hud-defensa');
  clock+=800000;
  await p.evaluate(()=>{LN.t=CASTLE.TIME_LIMIT_MS-60;});
  await p.waitForSelector('#lanes-result:not(.hidden)',{timeout:10000});
  assert.match(await p.textContent('#lanes-result h2'),/EL CASTILLO RESISTIÓ/,tag+': título de victoria defendiendo');
  await p.waitForFunction(()=>/Puntos de clan: \+30/.test(document.getElementById('ln-res-clan').textContent),null,{timeout:8000});
  assert.equal((await api('GET','/api/clan',undefined,me.token)).j.clan.points,42,tag+': +30 por el nivel 3');
  assert.deepEqual(await lay('#lanes-result .ln-res-card'),[],tag+': resultado (defensa) sin problemas de diseño');
  await p.click('#lanes-result .ln-exit');
  await p.waitForSelector('#clan-screen:not(.hidden) .clan-tab',{timeout:8000});
  assert.equal(await p.evaluate(()=>state==='mainmenu'&&!lanesOn()),true,tag+': VOLVER AL CLAN deja el hub y abre la pantalla');
  await clickTab('Mi clan');
  await p.waitForFunction(()=>{const c=document.querySelector('#clan-screen .clan-chips');return c&&/42/.test(c.textContent);},null,{timeout:8000});
  /* ---- derrota atacando + parte SIN CONEXIÓN en cola, reenvío idempotente ---- */
  await play('attack',2);
  await p.evaluate(()=>{window.__realFetch=accountFetch;accountFetch=async()=>{const e=new Error('OFFLINE');e.code='OFFLINE';e.offline=true;throw e;};});
  clock+=400000;
  await p.evaluate(()=>{LN.t=150000;lanesStructDamage(LN.team[0].S[9],1e6,1);});    // cae el estandarte: ganan los defensores
  await p.waitForSelector('#lanes-result:not(.hidden)',{timeout:8000});
  assert.match(await p.textContent('#lanes-result h2'),/EL CASTILLO RESISTIÓ/);
  await p.waitForFunction(()=>/Sin conexión/.test(document.getElementById('ln-res-clan').textContent),null,{timeout:8000});
  assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('horda_clan_pending_v1')).length),1,tag+': el parte quedó en cola');
  assert.equal((await api('GET','/api/clan',undefined,me.token)).j.clan.points,42,tag+': sin conexión no suma todavía');
  await p.evaluate(()=>{accountFetch=window.__realFetch;});
  const sent=await p.evaluate(()=>clanFlushPending());assert.equal(sent,1,tag+': se reenvió una vez');
  assert.equal((await api('GET','/api/clan',undefined,me.token)).j.clan.points,37,tag+': derrota nivel 2: -5');
  assert.equal(await p.evaluate(()=>clanFlushPending()),0,tag+': la cola quedó vacía');
  const rep=await p.evaluate(()=>LN.castleReport);
  const dup=await api('POST','/api/clan/war/report',rep,me.token);assert(dup.j.duplicate&&dup.j.points===37,tag+': el mismo parte no suma dos veces '+JSON.stringify(dup.j));
  await p.click('#lanes-result .ln-exit');await p.waitForSelector('#clan-screen:not(.hidden) .clan-tab');
  await p.evaluate(()=>{clanClose();});
  assert.equal(await p.evaluate(()=>JSON.stringify(Object.values(save.champions).map(c=>c.level))),lvl0,tag+': el guardado real no cambió');
  assert.deepEqual(errs,[],tag+': sin errores de página');
  await ctx.close();
  /* ---- invitado sin cuenta ---- */
  const g=await browser.newContext({viewport:{width:w,height:h},hasTouch:true});await g.addInitScript(f=>{try{localStorage.setItem('laHordaSave_v1',JSON.stringify(f));}catch(e){}},FIX);
  const gp=await g.newPage(),gerr=[];gp.on('pageerror',e=>gerr.push(e.message));
  await gp.goto(`http://127.0.0.1:${WEB}/index.html?lazy=0&api=${encodeURIComponent(API)}`);await gp.waitForFunction(()=>typeof clanOpen==='function'&&typeof setState==='function',null,{timeout:60000});
  await gp.evaluate(()=>{setState('mainmenu');renderMainMenu();clanOpen();});await gp.waitForSelector('#clan-screen [data-clan-account]');
  assert.deepEqual(await gp.evaluate(`(${LAYOUT})('#clan-screen .clan-panel',null)`),[],tag+': invitado sin problemas de diseño');
  assert.match(await gp.textContent('#clan-screen .clan-scroll'),/necesitás una cuenta/);
  assert.deepEqual(gerr,[],tag+': invitado sin errores');await g.close();
  console.log(`PASS clan ui ${tag}`);
 }
 await browser.close();web.kill();apiSrv.close();await accounts.close();process.exit(0);
})().catch(e=>{console.error(e);web.kill();process.exit(1);});
