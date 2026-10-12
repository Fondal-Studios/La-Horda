// LA HORDA — GUERRA DE CRISTALES en el motor real, 2 clientes reales contra el relay local.
// anfitrión crea la sala (guardado temporal), el invitado se une con código, los dos entran a partida:
// mismo mapa, torres y cristales; cada uno ve a su equipo; compra y carta de horda del invitado validadas por el anfitrión; PvP sincronizado; el final llega a los dos.
// uso: node tools/net-test/lanes_coop.js   (levanta su propio servidor estático y relay)
const {chromium}=require('playwright');const {spawn}=require('node:child_process');const path=require('node:path');
const root=path.resolve(__dirname,'../..'),HTTP=8895,RELAYP=8896,SITE=`http://127.0.0.1:${HTTP}`,RELAY=`ws://127.0.0.1:${RELAYP}`;
const http=spawn('python3',['-m','http.server',String(HTTP)],{cwd:root,stdio:'ignore'});
const relay=spawn(process.execPath,['server/relay.js'],{cwd:root,env:{...process.env,PORT:String(RELAYP),ACCOUNT_DATA_DIR:'/tmp/lanes-coop-accounts'},stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let fails=0;
const check=(n,ok,x)=>{console.log((ok?'PASS ':'FAIL ')+n+(x!==undefined?'  '+JSON.stringify(x).slice(0,400):''));if(!ok)fails++;};
const FIX={tut:{training:1},starterChosen:true,starterGiftV1:true,starterSkin:'vale',playtestV1Bonus:true,campaignResetV1:true,campaignResetV2:true};
async function client(b,name){
 const ctx=await b.newContext({viewport:{width:844,height:390},hasTouch:true});await ctx.addInitScript(([n,f])=>{try{if(!localStorage.getItem('__s')){localStorage.clear();localStorage.setItem('__s','1');localStorage.setItem('horda_name',n);localStorage.setItem('laHordaSave_v1',JSON.stringify(f));}}catch(e){}},[name,FIX]);
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`${SITE}/index.html?server=${encodeURIComponent(RELAY)}&lazy=0`,{waitUntil:'load',timeout:120000});
 await page.waitForFunction(()=>typeof lanesOnlineCreate==='function'&&typeof setState==='function',null,{timeout:60000});
 return {ctx,page,errors,name};
}
const ev=(c,fn,a)=>c.page.evaluate(fn,a);
async function waitFor(c,fn,a,ms){for(let k=0;k<(ms||20000)/150;k++){if(await ev(c,fn,a))return true;await sleep(150);}return false;}
(async()=>{
 for(let i=0;i<60;i++){try{if((await fetch(SITE+'/index.html')).ok&&(await fetch(`http://127.0.0.1:${RELAYP}/health`)).ok)break;}catch{}await sleep(100);}
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const A=await client(b,'Ana'),B=await client(b,'Beto');
 const realA=await ev(A,()=>localStorage.getItem('laHordaSave_v1'));
 await ev(A,()=>{setState('mainmenu');return lanesOnlineCreate('mago');});
 check('sala.anfitrion_en_sala_con_guardado_temporal',await waitFor(A,()=>!!net.code&&state==='prep'&&lanesOn()&&save.champions.tanque.level===10));
 const code=await ev(A,()=>net.code);
 await ev(B,()=>{setState('mainmenu');return lanesOnlineJoin(arguments[0],'tanque');},code).catch(()=>{});
 await ev(B,c=>{lanesOnlineJoin(c,'tanque');},code);
 check('sala.invitado_en_sala',await waitFor(B,()=>net.role==='guest'&&state==='prep'&&lanesOn(),null,30000));
 await ev(B,()=>{document.getElementById('net-ready-btn').click();});await sleep(800);
 await ev(A,()=>{document.getElementById('prep-start-btn').click();});
 const both=await waitFor(A,()=>state==='playing'&&lanesOn()&&heroes.length===4&&!LN.lobby,null,30000)&&await waitFor(B,()=>state==='playing'&&lanesOn()&&heroes.length===4,null,60000);
 check('partida.los_dos_juegan',both,[...A.errors,...B.errors].slice(0,4));
 await sleep(3000);
 const st=await Promise.all([ev(A,()=>({lanes:heroes.map(h=>h.team),me:player.team,crystals:LN.team.map(t=>Math.round(t.S[2].hp)),hud:!!document.querySelector('.ln-score')&&document.querySelector('.ln-score').getBoundingClientRect().width>0,arena:currentArena,wave:LN.wave})),ev(B,()=>({lanes:heroes.map(h=>h.team),me:player.team,crystals:LN.team.map(t=>Math.round(t.S[2].hp)),hud:!!document.querySelector('.ln-score')&&document.querySelector('.ln-score').getBoundingClientRect().width>0,arena:currentArena,wave:LN.wave}))]);
 check('partida.equipos_por_slot',JSON.stringify(st[0].lanes)==='[0,0,1,1]'&&JSON.stringify(st[1].lanes)==='[0,0,1,1]',st);
 check('partida.invitado_en_el_equipo_del_anfitrion',st[0].me===0&&st[1].me===0);
 check('partida.hud_en_los_dos',st[0].hud&&st[1].hud);
 // horda: los dos ven criaturas de los dos equipos y los avatares/estructuras (el invitado los recibe por snapshot)
 await waitFor(A,()=>LN.wave>=1,null,30000);await sleep(2500);
 const en=await Promise.all([ev(A,()=>enemies.filter(e=>e.alive&&!e.lanesProxy).length),ev(B,()=>enemies.filter(e=>e.alive&&!e.lanesProxy).length)]);
 check('partida.horda_sincronizada',en[0]>0&&en[1]>0&&Math.abs(en[0]-en[1])<=6,en);
 const px=await Promise.all([ev(A,()=>enemies.filter(e=>e.alive&&e.lanesProxy).length),ev(B,()=>enemies.filter(e=>e.alive&&e.lanesProxy).length)]);
 check('partida.avatares_y_estructuras_sincronizados',px[0]===10&&px[1]===10,px);   // 4 héroes + 6 estructuras
 // compra del invitado
 await ev(A,()=>{LN.team[0].shards=100;});await waitFor(B,()=>LN.team[0].shards===100,null,5000);
 await ev(B,()=>{lanesBuy(player.team,'ward',player);});await sleep(900);
 const up=await Promise.all([ev(A,()=>lanesFront(0).ward),ev(B,()=>lanesFront(0).ward)]);
 check('compra.invitado_valida_el_anfitrion',up[0]===180&&up[1]===180,up);
 await ev(B,()=>{netSendToHost({k:'ln-buy',key:'__proto__'});netSendToHost({k:'ln-buy',key:'toString'});return 1;});await sleep(500);
 check('compra.clave_falsa_rechazada',await ev(A,()=>LN.team[0].shards>=100-40));
 // carta de horda: el invitado la elige por la red y la aplica el anfitrión
 await ev(A,()=>{LN.team[0].nextCard=LN.t;});await waitFor(B,()=>!!LN.team[0].offer,null,8000);
 await ev(B,()=>{lanesNetCardRequest(1);});await sleep(900);
 const cd=await Promise.all([ev(A,()=>LN.team[0].taken),ev(B,()=>LN.team[0].taken)]);
 check('cartas.invitado_elige_y_el_anfitrion_aplica',cd[0]===1&&cd[1]===1,cd);
 // PvP: un golpe a un avatar rival le llega al héroe rival real, en los dos clientes
 const pvp=await ev(A,()=>{const foe=heroes.find(h=>h.team===1),P=foe._lnProxy,hp=foe.hp;damageEnemy(P,60,{src:player});return {id:heroes.indexOf(foe),hp};});await sleep(700);
 const after=await Promise.all([ev(A,i=>heroes[i].hp,pvp.id),ev(B,i=>heroes[i].hp,pvp.id)]);
 check('pvp.daño_al_avatar_llega_al_heroe',after[0]<pvp.hp&&after[1]<pvp.hp+1,{antes:pvp.hp,despues:after});
 // final: cae el cristal rival
 await ev(A,()=>{LN.team[1].S[0].alive=false;LN.team[1].S[1].alive=false;LN.team[1].S[2].hp=1;lanesStructDamage(LN.team[1].S[2],50,0);});
 const fin=await waitFor(A,()=>!!document.querySelector('#lanes-result:not(.hidden)'),null,15000)&&await waitFor(B,()=>!!document.querySelector('#lanes-result:not(.hidden)'),null,20000);
 check('final.resultado_en_los_dos',fin);
 const res=await Promise.all([ev(A,()=>document.querySelector('#lanes-result h2').textContent),ev(B,()=>document.querySelector('#lanes-result h2').textContent)]);
 check('final.mismo_ganador',/VICTORIA/.test(res[0])&&/VICTORIA/.test(res[1]),res);
 // volver a la sala y salir: guardado real intacto
 await ev(A,()=>document.querySelector('#lanes-result .ln-again').click());await ev(B,()=>document.querySelector('#lanes-result .ln-again').click());
 check('final.vuelven_a_la_sala',await waitFor(A,()=>state==='prep'&&netInRoom())&&await waitFor(B,()=>state==='prep'&&netInRoom()));
 await ev(B,()=>{netLeaveRoom();setState('mainmenu');});await ev(A,()=>{netLeaveRoom();setState('mainmenu');});
 check('final.guardado_real_restaurado',await waitFor(A,()=>!lanesOn()&&save.champions.tanque.level!==10)&&await waitFor(B,()=>!lanesOn()&&save.champions.tanque.level!==10));
 check('final.guardado_real_sin_cambios',(await ev(A,()=>localStorage.getItem('laHordaSave_v1')))===realA);
 check('sin_errores_de_pagina',A.errors.length+B.errors.length===0,[...A.errors,...B.errors].slice(0,3));
 await b.close();http.kill();relay.kill();console.log('SUMMARY',JSON.stringify({fails}));process.exit(fails?1:0);
})().catch(e=>{console.error(e);http.kill();relay.kill();process.exit(1);});
