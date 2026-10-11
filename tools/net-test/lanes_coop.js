// LA HORDA — GUERRA DE CRISTALES en el motor real, 2 clientes reales contra el relay local.
// anfitrión crea la sala (guardado temporal), el invitado se une con código, los dos entran a partida:
// mismos carriles y cristales, cada uno ve a su equipo; compra del invitado validada por el anfitrión; el final llega a los dos.
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
 check('partida.los_dos_juegan',both);
 await sleep(3000);
 const st=await Promise.all([ev(A,()=>({lanes:heroes.map(h=>h.lane),me:player.lane,crystals:LN.lane.map(l=>Math.round(l.crystal.hp)),hud:!!document.querySelector('.ln-score')&&document.querySelector('.ln-score').getBoundingClientRect().width>0,arena:currentArena,wave:LN.wave})),ev(B,()=>({lanes:heroes.map(h=>h.lane),me:player.lane,crystals:LN.lane.map(l=>Math.round(l.crystal.hp)),hud:!!document.querySelector('.ln-score')&&document.querySelector('.ln-score').getBoundingClientRect().width>0,arena:currentArena,wave:LN.wave}))]);
 check('partida.equipos_por_slot',JSON.stringify(st[0].lanes)==='[0,0,1,1]'&&JSON.stringify(st[1].lanes)==='[0,0,1,1]',st);
 check('partida.invitado_en_el_equipo_del_anfitrion',st[0].me===0&&st[1].me===0);
 check('partida.hud_en_los_dos',st[0].hud&&st[1].hud);
 // oleada: los dos ven enemigos de su carril (el invitado los recibe por snapshot)
 await waitFor(A,()=>LN.wave>=1,null,30000);await sleep(2500);
 const en=await Promise.all([ev(A,()=>enemies.filter(e=>e.alive).length),ev(B,()=>enemies.filter(e=>e.alive).length)]);
 check('partida.enemigos_sincronizados',en[0]>0&&en[1]>0&&Math.abs(en[0]-en[1])<=6,en);
 // compra del invitado
 await ev(A,()=>{LN.lane[0].shards=100;});await waitFor(B,()=>LN.lane[0].shards===100,null,5000);
 await waitFor(A,()=>lanesShopOpen(),null,40000);
 await ev(B,()=>{lanesBuy(player.lane,'upgrade',player);});await sleep(900);
 const up=await Promise.all([ev(A,()=>LN.lane[0].upgrade),ev(B,()=>LN.lane[0].upgrade)]);
 check('compra.invitado_valida_el_anfitrion',up[0]===1&&up[1]===1,up);
 const spoof=await ev(B,()=>{netSendToHost({k:'ln-buy',key:'__proto__'});netSendToHost({k:'ln-buy',key:'brute'});return 1;});await sleep(500);
 check('compra.clave_falsa_rechazada',await ev(A,()=>LN.lane[0].upgrade===1&&!LN.pending.some(p=>p.kind==='__proto__')));
 // final: cae el cristal rival
 await ev(A,()=>{LN.lane[1].crystal.hp=1;lanesCrystalHit(1,50);});
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
