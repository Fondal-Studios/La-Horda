/* Browser adapter: shared relay protocol, separate CW build and no account writes.
 * Guerra de Cristales vive DENTRO de index.html (pantalla #crystalwars-screen). Este archivo solo define
 * window.CrystalWarsUI; nada se carga ni se dibuja hasta la primera vez que se abre (open): así no pesa en el arranque
 * del juego. close() desconecta y suelta todo; onExit lo pone el juego (js/ui/menus.js) para volver al hub. */
(function(){
'use strict';
let api=null;
window.CrystalWarsUI={
 onExit:null,
 open(opts){if(!api)api=boot();api.open(opts||{});},
 close(){return api?api.close():true;},
 isOpen(){return !!(api&&api.active());}
};
function boot(){
const C=CrystalWars,ID={game:'cw-game',stage:'cw-stage',controls:'cw-controls'},$=id=>document.getElementById(ID[id]||id),query=()=>new URLSearchParams(location.search);
let openOpts={},active=false,raf=0;
const modeSelect=$('competitive-mode'),mode=()=>modeSelect?.value==='coliseum'?'coliseum':'crystal',isColiseum=()=>sim?.mode==='coliseum';
const obstacleImg=new Image();obstacleImg.src='assets/vfx/minas/tex_roca.webp';
const skeletons=[1,2,3,4].map(i=>{const img=new Image();img.src='assets/sprites/enemies/infernal/esqueleto_h/walk'+i+'.png';return img;});
const golem=new Image();golem.src='assets/sprites/enemies/laberinto/golem_piedra/walk-strip.png';
// Arte del juego reutilizado (sin assets nuevos): piso de piedra de las Minas, portal de la Horda del Abismo y el
// cristal del Ángel (recoloreado a ámbar una vez al cargar: sin ctx.filter, que Safari no soporta en canvas).
const floorImg=new Image();floorImg.src='assets/vfx/minas/tex_piso_superior.png';
const portalImg=new Image();portalImg.src='assets/vfx/abismo/portal_activo_0.png';
const crystalImg=new Image();crystalImg.src='assets/vfx/bosses/hielo/bsAngelPillar_1.png';
let crystalAmber=null,floorPat=null;
crystalImg.onload=()=>{try{const c=document.createElement('canvas');c.width=crystalImg.naturalWidth;c.height=crystalImg.naturalHeight;const g=c.getContext('2d');g.drawImage(crystalImg,0,0);const d=g.getImageData(0,0,c.width,c.height),a=d.data;for(let i=0;i<a.length;i+=4){const r=a[i],gg=a[i+1],b=a[i+2];a[i]=b;a[i+1]=Math.round((gg+b)/2*0.78);a[i+2]=Math.round(r*0.55);}g.putImageData(d,0,0);crystalAmber=c;}catch(e){crystalAmber=null;}};
const images={};function refreshRoster(){const selected=$('champ').value,founder=typeof accountIdentity==='function'?accountIdentity()?.founder:null;$('champ').replaceChildren();for(const k of Object.keys(C.ROLES)){if(C.ROLES[k].ownerOnly&&C.ROLES[k].founder!==founder)continue;const o=document.createElement('option');o.value=k;o.textContent=C.ROLES[k].name;$('champ').appendChild(o);}if([...$('champ').options].some(o=>o.value===selected))$('champ').value=selected;}refreshRoster();
let sim=null,ws=null,room=null,slot=0,host=false,offline=true,viewOther=false,inputs={},keys={},joy={x:0,y:0},last=0,acc=0,lastSend=0,lastSnap=0,matchId='',snapshotN=0,lastN=-1,shownResult=false,sound=false,audio=null,connection=null,retryTimer=0,closing=false;
const remoteTimes={},lastActions={};
let clientId;try{clientId=sessionStorage.getItem('cw-client');if(!clientId){clientId=crypto.randomUUID();sessionStorage.setItem('cw-client',clientId);}}catch{clientId=String(Math.random()).slice(2);}
function status(s){$('status').textContent=s;}
function send(m){if(ws&&ws.readyState===WebSocket.OPEN){ws.send(JSON.stringify(m));return true;}return false;}
function message(d,to){return send({t:'msg',d,to});}
function signatureText(r){return r.passive?[r.passive.name,r.passive.desc].filter(Boolean).join(' · '):'';}
function skillGuide(container){container.replaceChildren();const r=C.ROLES[$('champ').value]||C.ROLES[sim?.heroes[slot]?.role];if(!r)return;const signature=signatureText(r);if(signature){const p=document.createElement('p');p.className='cw-signature';p.textContent=signature;container.appendChild(p);}r.skills.forEach((name,i)=>{const p=document.createElement('p'),strong=document.createElement('strong');strong.textContent=(i+1)+' · '+name;p.append(strong,document.createElement('br'),document.createTextNode(r.skillDescriptions?.[i]||name));container.appendChild(p);});const cards=document.createElement('p');cards.textContent='Cartas: Meteorito daña; Escarcha ralentiza. Apuntan automáticamente a la posición del rival vivo con menos vida al lanzarlas. El círculo avisa el impacto 1,35 s antes: moverse permite esquivarlo. Comparten 8 s de recarga de equipo.';container.appendChild(cards);}
function kit(){const r=C.ROLES[$('champ').value];$('kit').textContent=r.skills.join(' · ')+(signatureText(r)?' — '+signatureText(r):'');$('kit').title=(r.skillDescriptions||[]).join(' | ');if(room)send({t:'update',champ:$('champ').value,ready:false});if(document.getElementById('cw-kit-details'))skillGuide(document.getElementById('cw-kit-details'));}
// Textos del lobby según la regla REAL de cada modo. En el motor real (por defecto): Cristales = 5 contra 5 contra bots (en línea, 2 contra 2);
// Coliseo = torneo de cuatro equipos de dos, duelos 2 contra 2, el primero a 3 puntos. El simulador viejo (?legacy=1) conserva su regla (15 bajas).
const MODE_TEXT={
 coliseumReal:{title:'COLISEO · TORNEO 2 CONTRA 2',h1:'COLISEO<br><em>TORNEO 2 CONTRA 2</em>',eyebrow:'OCHO LUCHADORES · CUATRO EQUIPOS · PRIMERO A 3 PUNTOS',
  intro:'Cuatro equipos de dos se enfrentan en duelos 2 contra 2 sobre arena de piedra. Cada duelo ganado suma 1 punto y el primer equipo que llega a 3 gana el torneo.',
  rules:[['01 / COMBATÍ','Ataque básico automático. Movete, combiná habilidades y cubrite con las columnas.'],['02 / SOBREVIVÍ','A los 28 s el anillo se cierra y fuera pierde vida. Si caés, mirás desde la cámara espectadora.'],['03 / SUMÁ','Ganás el duelo si el rival queda sin nadie en pie: 1 punto. El primero a 3 gana (tope 9 rondas).']],
  result:'COLISEO · TORNEO 2 CONTRA 2'},
 coliseumLegacy:{title:'COLISEO · 2 CONTRA 2',h1:'COLISEO<br><em>COMBATE 2 CONTRA 2</em>',eyebrow:'UNA ARENA · DOS EQUIPOS · 15 BAJAS PARA GANAR',
  intro:'Los cuatro campeones comparten la arena. Coordiná habilidades, usá los obstáculos como cobertura y derrotá al equipo rival. Hay monstruos neutrales: aportan fragmentos, pero no puntos de victoria.',
  rules:[['01 / COMBATÍ','El ataque básico es automático. Movete, combiná cuatro habilidades y protegé a tu compañero con la cobertura.'],['02 / INTERFERÍ','Lanzá Meteorito o Escarcha al rival con menos vida. El objetivo queda fijado al lanzar y puede esquivar el círculo de impacto.'],['03 / GANÁ','El primer equipo con 15 bajas de campeones gana. A los 7 minutos vence el de más bajas; si siguen iguales, hay empate. Reaparecés 5 segundos después de caer.']],
  result:'COLISEO · COMBATE 2 CONTRA 2'},
 crystalReal:{title:'CONVERGENCIA · GUERRA DE CRISTALES',h1:'CONVERGENCIA<br><em>GUERRA DE CRISTALES</em>',eyebrow:'5 CONTRA 5 CON BOTS · EN LÍNEA 2 CONTRA 2 · 3 CARRILES',
  intro:'Mapa de tres carriles con selva, río y objetivos épicos. Tu horda sale sola por cada carril; con cada nivel elegís una carta para hacerla más fuerte. Derribá las torres y el cristal rival. El PvP está permitido y jugás con tus habilidades de siempre.',
  rules:[['01 / EMPUJÁ','Tu horda sale sola por tres carriles. Derribá torres; con una inhibidora caída, el cristal queda expuesto.'],['02 / CRECÉ','Nivel 3 a 15 con súbditos, selva y héroes. Cada nivel da una carta para tu horda. B vuelve a la base.'],['03 / REMATÁ','Vencé héroes rivales para ganar oro. Eclipse a los 13 min; a los 18 gana quien tenga más torres y vida.']],
  result:'CONVERGENCIA · GUERRA DE CRISTALES'},
 crystalLegacy:{title:'CONVERGENCIA · GUERRA DE CRISTALES',h1:'CONVERGENCIA<br><em>GUERRA DE CRISTALES</em>',eyebrow:'2 CONTRA 2 · UNA HORDA · ECLIPSE A LOS 5 MINUTOS',
  intro:'Cada equipo defiende su cristal contra la misma horda. Ganás cuando el cristal rival cae: por sus errores, por tus envíos de monstruos o por el Eclipse final. Convertí las bajas en fragmentos y decidí cómo usarlos.',
  rules:[['01 / RESISTÍ','Entrás directo en acción. El ataque básico es automático: movete y combiná tus cuatro habilidades.'],['02 / DECIDÍ','Al comienzo de cada oleada, tenés 7 segundos para reparar, mejorar o enviar amenazas. Mirá cómo atacan en el campo rival, siempre visible.'],['03 / REMATÁ','Pasados los 5 minutos llega el ECLIPSE: los dos cristales se apagan cada vez más rápido. Gana el que más vida conserve. Si vas perdiendo, el cristal te ayuda con fragmentos extra.']],
  result:'CONVERGENCIA · GUERRA DE CRISTALES'}
};
function modePresentation(){
 const col=mode()==='coliseum',lobby=$('lobby'),T=MODE_TEXT[(col?'coliseum':'crystal')+(useReal()?'Real':'Legacy')];
 document.getElementById('crystalwars-screen').dataset.mode=col?'coliseo':'cristales';
 $('competitive-title').textContent=T.title;lobby.querySelector('h1').innerHTML=T.h1;lobby.querySelector('.eyebrow').textContent=T.eyebrow;lobby.querySelector('.intro').textContent=T.intro;
 [...lobby.querySelectorAll('.rules>div')].forEach((el,i)=>{el.querySelector('b').textContent=T.rules[i][0];el.querySelector('p').textContent=T.rules[i][1];});
 $('result').querySelector('.eyebrow').textContent=T.result;
 if(typeof postgameLobbyRefresh==='function')postgameLobbyRefresh();
}
if(modeSelect)modeSelect.onchange=modePresentation;
const kitDetails=document.createElement('details');kitDetails.className='cw-kit-guide';const kitSummary=document.createElement('summary');kitSummary.textContent='Ver habilidades, firma y cartas';const kitBody=document.createElement('div');kitBody.id='cw-kit-details';kitDetails.append(kitSummary,kitBody);$('kit').after(kitDetails);
const helpDialog=document.createElement('dialog');helpDialog.className='cw-help-dialog';const helpTitle=document.createElement('h2');helpTitle.textContent='GUÍA TÁCTICA · EL COMBATE CONTINÚA';const helpContent=document.createElement('div'),helpClose=document.createElement('button');helpClose.textContent='VOLVER AL COMBATE';helpClose.onclick=()=>helpDialog.close();helpDialog.append(helpTitle,helpContent,helpClose);$('result').after(helpDialog);const helpButton=document.createElement('button');helpButton.id='cw-help';helpButton.textContent='Habilidades / cartas';helpButton.onclick=()=>{skillGuide(helpContent);helpDialog.showModal();};$('quit').after(helpButton);
$('champ').onchange=kit;kit();
function server(){const raw=openOpts.server||query().get('server')||NET_CONFIG.serverUrl;const u=new URL(raw);if(!['ws:','wss:'].includes(u.protocol))throw Error('Dirección de servidor inválida');return u.href;}
function identity(){return {protocol:1,build:C.VERSION,champ:$('champ').value,name:$('name').value.trim()||'Guardián',level:1,clientId};}
async function connect(){
 if(ws&&ws.readyState===1)return;if(connection)return connection;closing=false;
 connection=new Promise((resolve,reject)=>{let socket;try{socket=new WebSocket(server());}catch(e){reject(e);return;}ws=socket;
 const timer=setTimeout(()=>{socket.close();reject(Error('El servidor no respondió. Podés entrenar con bots.'));},12000);
 socket.onopen=()=>{clearTimeout(timer);const token=typeof accountPresenceToken==='function'?accountPresenceToken(socket.url):null;if(token)socket.send(JSON.stringify({t:'identify',token}));resolve();};socket.onerror=()=>{clearTimeout(timer);reject(Error('No se pudo conectar al servidor.'));};
 socket.onmessage=e=>{try{receive(JSON.parse(e.data));}catch(err){console.error('CW message',err);status('No se pudo procesar un mensaje de la sala.');}};
 socket.onclose=()=>{clearTimeout(timer);reject(Error('Conexión cerrada'));if(closing)return;if(room&&!host){status('Conexión perdida. Intentando recuperar tu lugar…');retryTimer=setTimeout(()=>joinRoom(room.code).catch(e=>status(e.message)),1600);}else if(sim&&!sim.ended&&!offline){abort('El anfitrión perdió la conexión.');disconnect();}else{room=null;renderRoom();status('Conexión cerrada. Podés crear otra sala.');}};
 });try{await connection;}finally{connection=null;}
}
function parseCode(v){try{return new URL(v).searchParams.get('room')||'';}catch{return v.trim().toUpperCase();}}
async function joinRoom(code){await connect();send(Object.assign(identity(),{t:'join',code:parseCode(code)}));}
$('create').onclick=async()=>{if(useReal()&&mode()==='coliseum'){status('El Coliseo online todavía no está listo en el motor real. Jugá el torneo de 8 contra bots con «ENTRENAR CON BOTS».');return;}if(useReal()&&mode()==='crystal'){const c=$('champ').value;if(close())lanesOnlineCreate(c);return;}try{status('Conectando…');await connect();send(Object.assign(identity(),{t:'create',arena:mode()==='coliseum'?'coliseum':'crystal-wars',public:false}));}catch(e){status(e.message);}};
$('join').onclick=async()=>{const code=parseCode($('code').value);if(useReal()&&mode()==='coliseum'){status('El Coliseo online todavía no está listo en el motor real. Jugá el torneo de 8 contra bots con «ENTRENAR CON BOTS».');return;}if(useReal()&&mode()==='crystal'&&/^[A-Z0-9]{6}$/.test(code)){const c=$('champ').value;if(close())lanesOnlineJoin(code,c);return;}if(!/^[A-Z0-9]{6}$/.test(code)){status('Ingresá un código de seis letras/números o una invitación.');return;}try{await joinRoom(code);}catch(e){status(e.message);}};
$('name').onchange=()=>{if(room)send({t:'update',name:$('name').value.trim()||'Guardián',ready:false});};
function renderRoom(){
 if(modeSelect)modeSelect.disabled=!!room;
 $('room').hidden=!room;$('create').disabled=!!room;$('join').disabled=!!room;$('practice').disabled=!!room;
 modePresentation();if(!room)return;$('room-code').textContent=room.code;$('slots').replaceChildren();room.slots.forEach((p,i)=>{const el=document.createElement('div');el.className='slot'+(i>1?' amber':'');el.textContent='J'+(i+1)+' · '+(p&&p.connected?(p.name+' · '+(C.ROLES[p.champ]?.name||'Tanque')+' · '+(p.ready?'LISTO':'Preparando')):'Lugar libre · lo completa el juego');$('slots').appendChild(el);});
 $('start').hidden=!host;$('ready').hidden=host;$('ready').textContent=room.slots[slot]?.ready?'✔ LISTO':'ESTOY LISTO';$('start').disabled=room.state!=='lobby'||room.slots.some((p,i)=>i>0&&p&&p.connected&&!p.ready);
 $('champ').disabled=room.state!=='lobby';$('name').disabled=room.state!=='lobby';
}
$('ready').onclick=()=>send({t:'update',ready:!room.slots[slot]?.ready});
$('copy').onclick=async()=>{const u=new URL(location.href);u.hash='';const srv=openOpts.server||query().get('server');u.search='';u.searchParams.set('cw','1');u.searchParams.set('mode',mode());u.searchParams.set('room',room.code);if(srv)u.searchParams.set('server',srv);try{await navigator.clipboard.writeText(u.href);status('Invitación copiada.');}catch{status('Invitación: '+u.href);}};
function disconnect(){closing=true;clearTimeout(retryTimer);if(ws){send({t:'leave'});ws.close();}ws=null;room=null;connection=null;host=false;offline=true;$('champ').disabled=false;$('name').disabled=false;renderRoom();}
$('leave').onclick=()=>{disconnect();status('Saliste de la sala.');};
function receive(m){
 if(m.t==='error'){const errors={NOT_FOUND:'No existe esa sala.',BUILD:'Ese código pertenece a otro modo o versión. Abrí la invitación de Convergencia o Coliseo.',ROOM_FULL:'La sala ya tiene cuatro jugadores.',STARTED:'La partida ya comenzó.',VERSION:'El servidor necesita actualizarse.',ORIGIN:'El servidor no admite esta dirección del juego.',HOST_RECONNECT:'El anfitrión debe crear una sala nueva.'};status(errors[m.code]||('No se pudo completar: '+m.code));return;}
 if(m.t==='joined'){room=m.room;if(modeSelect)modeSelect.value=room.arena==='coliseum'?'coliseum':'crystal';slot=m.slot;host=!!m.host;offline=false;renderRoom();status('Conectado · Equipo '+(slot<2?'Zafiro':'Ámbar'));if(!host)message({k:'cw-sync'});return;}
 if(m.t==='room'){room=m.room;renderRoom();if(host&&sim&&!sim.ended){for(const h of sim.heroes){h.bot=!room.slots[h.slot]?.connected;if(h.bot){delete inputs[h.slot];delete remoteTimes[h.slot];}}}if(room.state==='lobby'&&sim){sim=null;closeResult();showLobby();status('Sala lista para la revancha.');}return;}
 if(m.t==='closed'){if(sim&&!sim.ended)abort('La sala se cerró: '+m.reason);disconnect();return;}
 if(m.t!=='msg'||!m.d)return;const d=m.d;
 if(host){
  if(!sim||sim.ended){if(d.k==='cw-sync'&&sim)message({k:'cw-state',id:matchId,n:++snapshotN,state:sim},m.from);return;}
  const h=sim.heroes[m.from];if(!h||m.from===0||!room.slots[m.from]?.connected)return;
  if(d.k==='cw-sync'){h.bot=false;message({k:'cw-state',id:matchId,n:++snapshotN,state:sim},m.from);return;}
  if(d.id!==matchId)return;
  if(d.k==='cw-input'){if(Number.isFinite(d.x)&&Number.isFinite(d.y)){inputs[m.from]={x:Math.max(-1,Math.min(1,d.x)),y:Math.max(-1,Math.min(1,d.y))};remoteTimes[m.from]=performance.now();}return;}
  if(d.k==='cw-action'){const now=performance.now();if(now-(lastActions[m.from]||0)<100)return;lastActions[m.from]=now;if(d.action==='skill')C.ability(sim,m.from,d.value);if(d.action==='buy')C.buy(sim,m.from,d.value);}
 }else if(m.from===0&&d.k==='cw-state'&&d.state?.version===C.VERSION){
  if(d.id===matchId&&d.n<=lastN)return;if(d.id!==matchId){matchId=d.id;lastN=-1;shownResult=false;closeResult();}lastN=d.n;lastSnap=performance.now();const starting=!sim||$('game').hidden;sim=d.state;if(starting)showGame();if(sim.ended)showResult();
 }
}
function begin(){
 offline=!room;host=!!room;slot=0;inputs={};for(const k of Object.keys(remoteTimes))delete remoteTimes[k];sim=C.create(room?room.slots:[{connected:true,champ:$('champ').value,founder:typeof accountIdentity==='function'?accountIdentity()?.founder:null,name:$('name').value||'Guardián'}],crypto.getRandomValues(new Uint32Array(1))[0],{mode:mode(),monsters:true});
 if(typeof botNameFor==='function'){const taken=sim.heroes.filter(h=>!h.bot).map(h=>h.name);for(const h of sim.heroes)if(h.bot)h.name=botNameFor('cw-'+h.role,taken);}
 matchId=crypto.randomUUID();snapshotN=0;shownResult=false;viewOther=false;acc=0;last=performance.now();closeResult();showGame();if(room){send({t:'start'});broadcast();}
}
// Guerra de Cristales usa el MOTOR REAL de la campaña (mismas habilidades, HUD y controles; js/arenas/lanes/).
// El motor simplificado queda como respaldo (enlace con ?legacy=1) y para el Coliseo hasta que tenga el suyo.
function realCrystal(){const champ=$('champ').value;if(!close())return;const training=!!(document.getElementById('pg-training')&&document.getElementById('pg-training').checked);try{if(mode()==='coliseum')colStart({champ,training});else lanesStart({champ,training});}catch(err){console.error(err);status('No se pudo iniciar la partida. Probá de nuevo.');}}
function useReal(){return (mode()==='crystal'&&typeof lanesStart==='function'||mode()==='coliseum'&&typeof colStart==='function')&&!query().get('legacy');}
$('practice').onclick=()=>{if(useReal())realCrystal();else begin();};$('start').onclick=()=>{if(host&&room?.state==='lobby'&&!$('start').disabled)begin();};
function showGame(){ $('view').hidden=isColiseum();canvas.setAttribute('aria-label',isColiseum()?'Coliseo: arena compartida 2 contra 2':'Convergencia: ambos campos visibles');viewOther=false;$('view').textContent='Ampliar rival'; $('lobby').hidden=true;$('game').hidden=false;drawControls(); }
function showLobby(){ modePresentation();$('lobby').hidden=false;$('game').hidden=true;keys={};joy={x:0,y:0};renderRoom(); }
function closeResult(){if($('result').open)$('result').close();}
function escapeHTML(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function recordGet(){try{return JSON.parse(localStorage.getItem('cw-record-'+(sim?.mode||mode()))||'{}')||{};}catch{return {};}}
function recordSet(r){try{localStorage.setItem('cw-record-'+(sim?.mode||mode()),JSON.stringify(r));}catch{}}
function mvpOf(team){const hs=sim.heroes.filter(h=>h.team===team&&!h.bot);const score=h=>h.stats.dmg+h.stats.heal*1.5+h.stats.kills*8+h.stats.sent*20-h.stats.deaths*60;return (hs.length?hs:sim.heroes.filter(h=>h.team===team)).sort((a,b)=>score(b)-score(a))[0];}
function showResult(){if(shownResult)return;shownResult=true;const me=sim.heroes[slot],team=me.team,won=sim.winner===team;$('result-title').textContent=sim.winner===-1?'EMPATE':won?'VICTORIA · '+(isColiseum()?'COLISEO':'CONVERGENCIA'):'DERROTA · '+(isColiseum()?'COLISEO':'CONVERGENCIA');
 $('result-detail').textContent=isColiseum()?'Zafiro '+sim.teams[0].score+' · Ámbar '+sim.teams[1].score+' · Bajas de campeones.': 'Zafiro '+Math.ceil(sim.teams[0].hp)+' · Ámbar '+Math.ceil(sim.teams[1].hp)+' · '+sim.wave+' oleadas. Esta prueba no modifica tu campaña.'+(sim.heroes.some(h=>h.bot)?' Algunos compañeros son controlados por el juego.':'');
 const rows=sim.heroes.map(h=>{const st=h.stats||{dmg:0,kills:0,heal:0,deaths:0,sent:0};return '<tr'+(h.slot===slot?' class="me"':'')+'><td>'+(mvpOf(h.team)===h?'★ ':'')+escapeHTML(h.name)+'</td><td>'+(h.team?'Ámbar':'Zafiro')+'</td><td>'+Math.round(st.dmg)+'</td><td>'+st.kills+'</td><td>'+Math.round(st.heal)+'</td><td>'+st.deaths+'</td><td>'+st.sent+'</td></tr>';}).join('');
 $('result-stats').innerHTML='<table><thead><tr><th>Jugador</th><th>Equipo</th><th>Daño</th><th>Bajas</th><th>Cura</th><th>Caídas</th><th>Envíos</th></tr></thead><tbody>'+rows+'</tbody></table><small>★ = mejor jugador de cada equipo.</small>';
 let rec=recordGet();if(sim.winner!==-1&&!offlineForRecord()){rec.games=(rec.games||0)+1;if(won){rec.wins=(rec.wins||0)+1;rec.streak=(rec.streak||0)+1;rec.best=Math.max(rec.best||0,rec.streak);}else rec.streak=0;recordSet(rec);}
 $('result-record').textContent=rec.games?('Tu racha: '+(rec.streak||0)+' · Mejor racha: '+(rec.best||0)+' · Victorias: '+(rec.wins||0)+' de '+rec.games+' partidas'):'';
 $('rematch').textContent=offline?'VOLVER A ENTRENAR':host?'VOLVER A LA SALA':'ESPERAR EN LA SALA';$('result').showModal();beep(sim.winner===team?660:180);}
function offlineForRecord(){return offline;} // el entrenamiento contra bots no suma a la racha
function abort(reason){if(sim)sim.ended=true;shownResult=true;$('result-title').textContent='PARTIDA INTERRUMPIDA';$('result-detail').textContent=reason+' No se registra victoria ni derrota.';if(!$('result').open)$('result').showModal();}
$('rematch').onclick=()=>{closeResult();if(room&&host)send({t:'lobby',arena:mode()==='coliseum'?'coliseum':'crystal-wars'});sim=null;showLobby();};
$('result').addEventListener('cancel',e=>e.preventDefault());
$('quit').onclick=()=>{if(!confirm('¿Abandonar la partida? Si sos anfitrión, se cerrará para todos.'))return;disconnect();sim=null;closeResult();showLobby();};
$('view').onclick=()=>{viewOther=!viewOther;$('view').textContent=viewOther?'Ampliar mi campo':'Ampliar rival';};
function act(action,value){if(!sim||sim.ended)return;if(offline||host){const ok=action==='skill'?C.ability(sim,slot,value):C.buy(sim,slot,value);if(ok)beep(action==='buy'?430:580);return;}message({k:'cw-action',id:matchId,action,value});}
const GLYPH_COLORS=['#8fe0ff','#cfc2ff','#97f0cc','#ffe9a8'],SHOP_GLYPH={meteor:'llama',frost:'escarcha',repair:'cura',upgrade:'*',swarm:'grito',brute:'calavera',ward:'escudo',surge:'rayo'};
const VERB_HINT={Barrido:'torbellino',Corte:'corte',Pulso:'pulso',Paso:'paso',Baluarte:'escudo',Campo:'llama',Santuario:'cura'};
function skillHint(name,desc){const w=name.split(' ')[0];return w==='Pulso'&&/cura/i.test(desc||'')?'cura':(VERB_HINT[w]||'');}
function glyph(name,desc,color,ult){return typeof skillGlyphUri==='function'?skillGlyphUri({name:name,kind:'',ico:desc||''},color,!!ult):'';}
function iconButton(src,label){const b=document.createElement('button'),img=document.createElement('img');img.className='cw-ico';img.alt='';img.src=src;img.draggable=false;b.append(img);b.setAttribute('aria-label',label);return b;}
function drawControls(){
 $('skills').replaceChildren();const role=sim.heroes[slot]&&C.ROLES[sim.heroes[slot].role];
 role&&role.skills.forEach((name,i)=>{const desc=role.skillDescriptions?.[i]||name,b=iconButton(glyph(skillHint(name,desc),'',GLYPH_COLORS[i],i===3),(i+1)+' · '+name);b.dataset.index=i;b.classList.toggle('cw-ult',i===3);b.title=name+' — '+desc;const k=document.createElement('span');k.className='cw-key';k.textContent=i+1;const cd=document.createElement('span');cd.className='cw-cd';b.append(k,cd);b.onclick=()=>act('skill',i);$('skills').appendChild(b);});
 $('shop').replaceChildren();for(const [key,item]of Object.entries(C.SHOP)){const name=item.name.replace(/^Carta: /,''),b=iconButton(glyph(SHOP_GLYPH[key]||name,'',['meteor','surge'].includes(key)?'#ffb070':key==='frost'?'#9aeaff':'#ffe9a8',key==='upgrade'),name+' · '+item.cost+' fragmentos');b.dataset.key=key;b.className=['meteor','frost'].includes(key)?'cw-card':'';b.title=name+' — '+item.cost+' ◆'+(item.description?' — '+item.description:(['meteor','frost'].includes(key)?' · lanzamiento al rival con aviso previo':''));const c=document.createElement('span');c.className='cw-cost';c.textContent=item.cost+'◆';b.append(c);b.onclick=()=>act('buy',key);$('shop').appendChild(b);}
}
function movement(){let x=joy.x+(keys.d||keys.ArrowRight?1:0)-(keys.a||keys.ArrowLeft?1:0),y=joy.y+(keys.s||keys.ArrowDown?1:0)-(keys.w||keys.ArrowUp?1:0);const n=Math.max(1,Math.hypot(x,y));return {x:x/n,y:y/n};}
window.addEventListener('keydown',e=>{if(!active||!sim||sim.ended||/INPUT|SELECT/.test(e.target.tagName))return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys[e.key.length===1?e.key.toLowerCase():e.key]=true;if(!e.repeat&&/^[1-4]$/.test(e.key))act('skill',+e.key-1);});
window.addEventListener('keyup',e=>{delete keys[e.key.length===1?e.key.toLowerCase():e.key];});
window.addEventListener('blur',()=>{keys={};joy={x:0,y:0};if(!offline&&!host)message({k:'cw-input',id:matchId,x:0,y:0});});
const stick=$('joystick');let pointer=null;
function stickMove(e){const r=stick.getBoundingClientRect(),radius=r.width*.35;joy={x:Math.max(-1,Math.min(1,(e.clientX-r.left-r.width/2)/radius)),y:Math.max(-1,Math.min(1,(e.clientY-r.top-r.height/2)/radius))};stick.querySelector('i').style.transform='translate('+joy.x*radius+'px,'+joy.y*radius+'px)';}
stick.onpointerdown=e=>{pointer=e.pointerId;stick.setPointerCapture(pointer);stickMove(e);};stick.onpointermove=e=>{if(e.pointerId===pointer)stickMove(e);};function release(){pointer=null;joy={x:0,y:0};stick.querySelector('i').style.transform='';}stick.onpointerup=release;stick.onpointercancel=release;stick.onlostpointercapture=release;
$('sound').onclick=()=>{sound=!sound;$('sound').textContent='Sonido: '+(sound?'encendido':'apagado');$('sound').setAttribute('aria-pressed',String(sound));if(sound){audio=audio||new(window.AudioContext||window.webkitAudioContext)();audio.resume();beep(440);}};
function beep(freq){if(!sound||!audio)return;const o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.value=freq;g.gain.setValueAtTime(.05,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.14);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.15);}
const canvas=$('battle'),ctx=canvas.getContext('2d');
function releaseArt(){if(typeof LAZY_IMG==='undefined'||!LAZY_IMG.deferredOn)return;for(const g of ['common','ar:minas','ar:infernal','ar:laberinto','ar:hielo','ar:abismo'])LAZY_IMG.releaseGroup(g);}
function sprite(h){const meta=CW_ATLAS[h.role];if(!images[h.role]){const img=new Image();img.src=meta?.src||'assets/sprites/champions/'+h.role+'/atlas.png';if(typeof LAZY_IMG!=='undefined'&&LAZY_IMG.deferredOn){const g=LAZY_IMG.groupOf(img.src);if(g)LAZY_IMG.releaseGroup(g);}images[h.role]=img;}const im=images[h.role];if(!meta||!im.complete||!im.naturalWidth)return false;const moving=h.moving,dir=Math.abs(h.dx)>Math.abs(h.dy)?h.dx<0?'left':'right':h.dy<0?'up':'down';const clip=meta.animations[(moving?'walk_':'idle_')+dir]||meta.animations[moving?'walk':'idle']||meta.animations.idle||Object.values(meta.animations)[0];const frame=meta.frames[clip.frames[Math.floor((moving?h.anim:sim.time)*(clip.fps||6))%clip.frames.length]];if(!frame)return false;const scale=76/(meta.referenceHeight||frame.h);ctx.save();ctx.translate(h.x,h.y);if(clip.flip)ctx.scale(-1,1);ctx.drawImage(im,frame.x,frame.y,frame.w,frame.h,-(frame.pivotX||frame.w/2)*scale,-(frame.pivotY||frame.h)*scale,frame.w*scale,frame.h*scale);ctx.restore();return true;}
// ---- Escenografía con el arte de las arenas de campaña (atlas de campo de batalla, estadio y arena del Coliseo real) ----
const bfImg=k=>{const i=typeof BATTLEFIELD_IMAGES!=='undefined'?BATTLEFIELD_IMAGES[k]:null;return i&&i.complete&&i.naturalWidth?i:null;};
function prop(k,x,y,h){const i=bfImg(k);if(!i)return false;const w=h*i.naturalWidth/i.naturalHeight;ctx.save();ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x,y,w*.34,h*.07,0,0,Math.PI*2);ctx.fill();ctx.drawImage(i,x-w/2,y-h*.98,w,h);ctx.restore();return true;}
let sandPat=null,sandTile=null;
function sandPattern(){if(sandPat)return sandPat;const t=document.createElement('canvas');t.width=t.height=128;const g=t.getContext('2d');g.fillStyle='#796447';g.fillRect(0,0,128,128);let sd=8793;const r=()=>{sd=(Math.imul(sd,1664525)+1013904223)>>>0;return sd;};for(let i=0;i<260;i++){g.fillStyle=i%2?'#826d4e':'#705c42';g.fillRect(r()%128,r()%128,2+i%3,2);}sandTile=t;return sandPat=ctx.createPattern(t,'repeat');}
function wallFrame(x,y,w,h,t,accent){
 ctx.fillStyle='#2b241d';ctx.fillRect(x-t,y-t,w+2*t,t);ctx.fillRect(x-t,y+h,w+2*t,t);ctx.fillRect(x-t,y,t,h);ctx.fillRect(x+w,y,t,h);
 ctx.fillStyle='#51453a';for(let bx=x-t;bx<x+w+t-26;bx+=26){ctx.fillRect(bx+1,y-t+1,24,t/2-1);ctx.fillRect(bx+14,y-t/2+1,24,t/2-2);ctx.fillRect(bx+1,y+h+1,24,t/2-1);ctx.fillRect(bx+14,y+h+t/2+1,24,t/2-2);}
 for(let by=y;by<y+h-26;by+=26){ctx.fillRect(x-t+1,by+1,t-2,24);ctx.fillRect(x+w+1,by+1,t-2,24);}
 ctx.fillStyle='#7a6a55';ctx.fillRect(x-t,y-t,w+2*t,3);
 ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.strokeRect(x,y,w,h);
}
function drawArena(team,left,width,height,dpr,top=0){
 const me=sim.heroes[slot],mine=team===me.team,shared=isColiseum();
 ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);
 // El campo ocupa TODO el espacio disponible: escala por ancho y la cámara sigue al héroe en vertical (antes: cuadro chico centrado con bandas vacías).
 const viewTop=shared?top:top+40,vw=width,vh=Math.max(60,height-viewTop);
 const sFit=Math.min(vw/C.WIDTH,vh/C.HEIGHT),scale=(shared||mine)?Math.max(sFit,Math.min(vw/C.WIDTH,shared?.8:.5)):sFit;
 const wh=C.HEIGHT*scale,ox=left+(vw-C.WIDTH*scale)/2;let oy=viewTop+(vh-wh)/2;
 if(wh>vh+1){const hy=Math.max(0,Math.min(C.HEIGHT,me.y||C.HEIGHT/2)),fy=shared?hy:hy*.7+545*.3;oy=viewTop+Math.min(0,Math.max(vh-wh,vh*.55-fy*scale));}
 ctx.beginPath();ctx.rect(left,viewTop,vw,vh);ctx.clip();
 ctx.translate(ox,oy);ctx.scale(scale,scale);ctx.imageSmoothingEnabled=false;
 const color=team===0?'#70c9ff':'#ffb86a',FX=20,FY=38,FW=840,FH=560;
 // fondo fuera del campo: gradas del Coliseo (generador procedural de la arena real) o roca oscura de las Minas
 ctx.fillStyle=shared?'#171311':'#10141c';ctx.fillRect(-900,-700,C.WIDTH+1800,C.HEIGHT+1400);
 if(shared&&typeof colStadiumArt==='function'){const k=1.28,art=colStadiumArt();ctx.drawImage(art,440-560*k,318-560*k,1120*k,1120*k);}
 else if(floorImg.complete&&floorImg.naturalWidth){if(!floorPat){const t=document.createElement('canvas');t.width=t.height=128;const g=t.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(floorImg,0,0,128,128);floorPat=ctx.createPattern(t,'repeat');}ctx.fillStyle=floorPat;ctx.fillRect(-900,-700,C.WIDTH+1800,C.HEIGHT+1400);ctx.fillStyle='rgba(6,9,16,.62)';ctx.fillRect(-900,-700,C.WIDTH+1800,C.HEIGHT+1400);}
 // piso del campo
 ctx.save();ctx.beginPath();ctx.rect(FX,FY,FW,FH);ctx.clip();
 if(shared){ctx.fillStyle=sandPattern();ctx.fillRect(FX,FY,FW,FH);ctx.fillStyle='rgba(70,46,24,.12)';ctx.fillRect(FX,FY,FW,FH);ctx.strokeStyle='rgba(255,240,200,.2)';ctx.lineWidth=3;ctx.setLineDash([14,12]);ctx.beginPath();ctx.ellipse(440,318,370,235,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
 else if(floorPat){ctx.fillStyle=floorPat;ctx.fillRect(FX,FY,FW,FH);ctx.fillStyle='rgba(8,12,20,.3)';ctx.fillRect(FX,FY,FW,FH);
  ctx.fillStyle='rgba(120,100,76,.22)';for(const px of [160,440,720]){ctx.beginPath();ctx.moveTo(px-34,FY);ctx.lineTo(px+34,FY);ctx.lineTo(440+54,540);ctx.lineTo(440-54,540);ctx.closePath();ctx.fill();}}
 else{ctx.strokeStyle='#2b3749';ctx.lineWidth=2;for(let x=30;x<880;x+=55){for(let y=45;y<610;y+=40){ctx.strokeRect(x+(y%80?0:25),y,51,36);}}}
 const vg=ctx.createRadialGradient(440,330,120,440,330,520);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.5)');ctx.fillStyle=vg;ctx.fillRect(FX,FY,FW,FH);
 ctx.restore();
 wallFrame(FX,FY,FW,FH,16,color);
 // utilería de campaña: columnas y braseros del Coliseo; torres, braseros y rocas en Cristales
 if(shared){for(const x of [130,300,580,750])prop('column',x,FY-8,120);for(const [x,y] of [[8,78],[872,78],[8,640],[872,640]])prop('brazier',x,y,92);}
 else{prop('tower-'+(team===0?'blue':'amber'),120,FY+FH+22,170);prop('tower-'+(team===0?'blue':'amber'),760,FY+FH+22,170);prop('brazier',300,FY+FH+18,78);prop('brazier',580,FY+FH+18,78);prop('bones',60,FY+110,40);prop('cart',820,FY+250,56);
  if(portalImg.complete&&portalImg.naturalWidth){for(const px of [160,440,720]){const k=1+Math.sin(sim.time*2.4+px)*.03;ctx.drawImage(portalImg,px-50*k,24,100*k,96*k);}}else{ctx.fillStyle='#080c13';ctx.fillRect(55,38,770,22);}}
 for(const o of sim.obstacles||[]){
  ctx.fillStyle='rgba(0,0,0,.22)';ctx.fillRect(o.x,o.y,o.w,o.h);
  if(!prop(shared?'column':'moss-rock',o.x+o.w/2,o.y+o.h,shared?138:92)){ctx.fillStyle='#364353';ctx.fillRect(o.x,o.y,o.w,o.h);ctx.strokeStyle='#a3b6cb';ctx.lineWidth=3;ctx.strokeRect(o.x,o.y,o.w,o.h);}
 }
 if(!shared){
 const tt=sim.teams[team];ctx.save();ctx.translate(440,548);ctx.strokeStyle=color;ctx.globalAlpha=.4;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,87,32,0,0,Math.PI*2);ctx.stroke();for(let i=0;i<8;i++){const a=i*Math.PI/4+sim.time*.12;ctx.fillStyle=color;ctx.fillRect(Math.cos(a)*78-3,Math.sin(a)*26-3,6,6);}if(tt.ward>0){ctx.globalAlpha=.2;ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(0,-55,79,108,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.7;ctx.stroke();}ctx.restore();
 const pulse=1+Math.sin(sim.time*3)*.04;ctx.save();ctx.translate(440,545);ctx.scale(pulse,pulse);ctx.fillStyle='#17222f';ctx.beginPath();ctx.ellipse(0,10,65,23,0,0,Math.PI*2);ctx.fill();ctx.shadowColor=color;ctx.shadowBlur=20;const cimg=team===0?crystalImg:crystalAmber;if(cimg&&(cimg.width||cimg.naturalWidth)&&(team!==0||crystalAmber)){const w=33*2.6,h=75*2.6;ctx.drawImage(cimg,-w/2,-h+12,w,h);}else{ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,-67);ctx.lineTo(25,-25);ctx.lineTo(0,9);ctx.lineTo(-25,-25);ctx.closePath();ctx.fill();ctx.strokeStyle='#eef8ff';ctx.stroke();}ctx.shadowBlur=0;
 {const tt=sim.teams[team],f=Math.max(0,tt.hp/tt.maxHp);if(f<0.5){ctx.strokeStyle='rgba(255,255,255,'+(0.5-f).toFixed(2)+')';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-6,-120);ctx.lineTo(4,-90);ctx.lineTo(-3,-70);ctx.lineTo(7,-40);ctx.stroke();}}ctx.restore();}
 for(const p of sim.projectiles||[]){if(!shared&&p.team!==team)continue;const color=p.kind==='frost'?'#9aeaff':'#ff9b65',remaining=Math.max(0,p.due-sim.time),r=p.r||100;ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.globalAlpha=.2+.1*Math.sin(sim.time*16);ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.9;ctx.lineWidth=3;ctx.setLineDash([10,7]);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(p.x-12,p.y);ctx.lineTo(p.x+12,p.y);ctx.moveTo(p.x,p.y-12);ctx.lineTo(p.x,p.y+12);ctx.stroke();const lift=remaining*190;ctx.shadowColor=color;ctx.shadowBlur=18;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(p.x-30,p.y-lift-50);ctx.lineTo(p.x,p.y-lift);ctx.stroke();ctx.beginPath();ctx.arc(p.x,p.y-lift,12,0,Math.PI*2);ctx.fill();ctx.restore();}
 for(const f of sim.effects.filter(f=>shared||f.team===team)){ctx.save();ctx.strokeStyle=f.color;ctx.fillStyle=f.color;ctx.globalAlpha=f.kind==='zone'?.16:.7;ctx.lineWidth=3;ctx.beginPath();if(f.kind==='shot'){ctx.moveTo(f.x,f.y-25);ctx.lineTo(f.tx,f.ty-15);ctx.stroke();}else{ctx.arc(f.x,f.y,f.r,0,Math.PI*2);if(f.kind==='zone')ctx.fill();else ctx.stroke();}ctx.restore();}
 const entities=[...sim.enemies.filter(e=>shared||e.team===team),...sim.heroes.filter(h=>shared||h.team===team)].sort((a,b)=>a.y-b.y);
 for(const e of entities){if(Number.isInteger(e.sentBy)){ctx.strokeStyle='#ffe29d';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(e.x,e.y+2,18,8,0,0,Math.PI*2);ctx.stroke();}if(e.role){ctx.globalAlpha=e.hp>0?1:.25;if(!sprite(e)){ctx.fillStyle=C.ROLES[e.role].color;ctx.fillRect(e.x-14,e.y-36,28,36);}ctx.globalAlpha=1;ctx.fillStyle='#080d15';ctx.fillRect(e.x-25,e.y-86,50,5);ctx.fillStyle=e.slot===slot?'#ffffff':e.team===0?'#70c9ff':'#ffb86a';ctx.fillRect(e.x-25,e.y-86,50*e.hp/e.maxHp,5);ctx.font='8px "Press Start 2P", monospace';ctx.textAlign='center';ctx.fillText(e.name,e.x,e.y-92);if(e.shield>0){ctx.strokeStyle='#a9f5ff';ctx.beginPath();ctx.arc(e.x,e.y-22,31,0,Math.PI*2);ctx.stroke();}}else{const brute=e.kind==='brute',r=brute?23:12;const img=brute?golem:skeletons[Math.floor(sim.time*8+e.id)%4];if(img.complete&&img.naturalWidth){if(brute){const frame=Math.floor(sim.time*10+e.id)%55;ctx.drawImage(img,frame*75,0,75,61,e.x-42,e.y-65,84,68);}else{const height=e.kind==='runner'?43:48,w=height*img.naturalWidth/img.naturalHeight;ctx.drawImage(img,e.x-w/2,e.y-height,w,height);}}else{ctx.fillStyle='#648375';ctx.fillRect(e.x-r,e.y-r*2,r*2,r*2);}ctx.fillStyle='#111';ctx.fillRect(e.x-r,e.y-r*2-8,r*2,3);ctx.fillStyle='#ed8b72';ctx.fillRect(e.x-r,e.y-r*2-8,r*2*e.hp/e.maxHp,3);}}
 ctx.restore();ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);
 ctx.textAlign='center';ctx.font='bold 12px monospace';ctx.fillStyle=team===0?'#70c9ff':'#ffb86a';
 if(!shared)ctx.fillText(mine?'TU CAMPO · DEFENDÉ':'RIVAL · TUS ENVÍOS',left+width/2,top+15,width-12);
 if(!mine&&!shared){const pending=sim.pending.filter(p=>p.team===team),sent=sim.enemies.filter(e=>e.team===team&&Number.isInteger(e.sentBy));
 ctx.font='11px monospace';ctx.fillStyle='#ffe29d';ctx.fillText(pending.length?'Llegan en '+Math.max(0,Math.ceil(Math.min(...pending.map(p=>p.due))-sim.time))+' s':sent.length?sent.length+' enviados en combate':'Enviá una amenaza desde suministros',left+width/2,top+31,width-12);}
 ctx.restore();
}
function render(){
 if(!sim)return;const me=sim.heroes[slot];if(!me)return;const team=me.team,t=sim.teams[me.team];
 const box=canvas.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);if(canvas.width!==Math.round(box.width*dpr)||canvas.height!==Math.round(box.height*dpr)){canvas.width=Math.round(box.width*dpr);canvas.height=Math.round(box.height*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#111723';ctx.fillRect(0,0,box.width,box.height);
 const gap=8,ownWidth=(box.width-gap)*(viewOther?.4:.6);
 const compact=matchMedia('(max-height:520px) and (orientation:landscape)').matches,top=compact?40:34,height=box.height-(compact?94:0);
 if(isColiseum())drawArena(me.team,0,box.width,box.height,dpr,compact?4:top);else{
 drawArena(me.team,0,ownWidth,height-(viewOther?36:0),dpr,top);
 drawArena(1-me.team,ownWidth+gap,box.width-ownWidth-gap,height-(viewOther?0:36),dpr,top);}
 for(const [i,key]of ['blue','amber'].entries()){const value=isColiseum()?sim.teams[i].score:Math.ceil(sim.teams[i].hp),max=isColiseum()?(sim.scoreLimit||15):sim.teams[i].maxHp;$(key+'-hp').textContent=value+' / '+max+(isColiseum()?' bajas':'');$(key+'-meter').max=max;$(key+'-meter').value=value;}
 const left=Math.max(0,Math.ceil(C.DURATION-sim.time));$('clock').textContent=Math.floor(left/60)+':'+String(left%60).padStart(2,'0');$('wave').textContent=isColiseum()?'COLISEO 2v2':'Oleada '+sim.wave;
 $('shards').textContent='◆ '+t.shards+' · Mejora '+t.upgrade+'/3'+(t.ward>0?' · Barrera '+Math.ceil(t.ward):'')+(sim.time<t.surgeUntil?' · FURIA '+Math.ceil(t.surgeUntil-sim.time)+' s':'');const supply=C.shopOpen(sim);$('game').classList.toggle('coliseum',isColiseum());$('game').classList.toggle('supply',supply);$('phase').textContent=isColiseum()?'Cartas en combate':supply?'SUMINISTROS · '+Math.ceil(sim.wave===0?sim.nextWave-sim.time:sim.nextWave-(C.WAVE_INTERVAL-C.SUPPLY_WINDOW)-sim.time)+' s':'Suministros en '+Math.ceil(sim.nextWave-sim.time)+' s';
 const incoming=sim.pending.filter(p=>p.team===team);$('notice').textContent=isColiseum()?'':incoming.length?'⚠ '+incoming.map(p=>(p.kind==='brute'?'COLOSO':'ACECHADORES')+' EN '+Math.ceil(p.due-sim.time)+' s').join(' · '):sim.time>=C.ECLIPSE_AT?'☀ ECLIPSE · los dos cristales se apagan cada vez más rápido':(!offline&&!host&&performance.now()-lastSnap>3000?'Esperando al anfitrión…':'');
 $('vital').textContent=me.hp>0?'VIDA '+Math.ceil(me.hp)+' / '+me.maxHp:'CAÍDO · Regresás en '+Math.max(0,Math.ceil(me.respawn-sim.time))+' s';
 [...$('skills').children].forEach((b,i)=>{b.disabled=sim.ended||me.hp<=0||me.cd[i]>0;const cd=b.querySelector('.cw-cd');if(cd)cd.textContent=me.cd[i]>0?Math.ceil(me.cd[i]):'';});
 [...$('shop').children].forEach(b=>{const k=b.dataset.key;const card=['meteor','frost'].includes(k);b.hidden=isColiseum()&&!card&&k!=='surge';b.disabled=sim.ended||me.hp<=0||(!card&&!supply)||(card&&sim.time<(t.cardAt||0))||t.shards<C.SHOP[k].cost||(k==='upgrade'&&t.upgrade>=3)||(k==='repair'&&(t.hp>=t.maxHp||sim.time<t.repairAt))||(['swarm','brute'].includes(k)&&sim.time<t.sendAt)||(k==='ward'&&(t.ward>=125||sim.time<t.wardAt))||(k==='surge'&&(sim.time<t.surgeAt||sim.time<t.surgeUntil));});
}
function broadcast(){message({k:'cw-state',id:matchId,n:++snapshotN,state:sim});}
function frame(now){if(!active){raf=0;return;}const dt=Math.min(.15,Math.max(0,(now-(last||now))/1000));last=now;if(sim){if(!sim.ended){const move=movement();inputs[slot]=move;if(offline||host){for(const h of sim.heroes)if(h.slot!==slot&&!h.bot&&now-(remoteTimes[h.slot]||0)>350)inputs[h.slot]={x:0,y:0};acc+=dt;while(acc>=1/30&&!sim.ended){C.step(sim,1/30,inputs);acc-=1/30;}if(sim.ended){showResult();if(host)broadcast();}if(host&&now-lastSend>100){lastSend=now;broadcast();}}else if(now-lastSend>60){lastSend=now;message({k:'cw-input',id:matchId,...move});}}render();}raf=requestAnimationFrame(frame);}
function open(o){
 openOpts=o||{};active=true;releaseArt();if(!sim&&!room){refreshRoster();kit();}if(modeSelect&&!room)modeSelect.value=(openOpts.mode||query().get('mode'))==='coliseum'?'coliseum':'crystal';
 if(openOpts.room){$('code').value=String(openOpts.room).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8);status('Elegí tu nombre y campeón; después tocá UNIRSE.');}
 modePresentation();if(!sim)showLobby();last=performance.now();if(!raf)raf=requestAnimationFrame(frame);
}
// Sale de la pantalla: si hay una partida en curso pide confirmar. Devuelve false si el jugador se queda.
function close(){
 if(sim&&!sim.ended&&!confirm('¿Salir de la partida? Si sos anfitrión, se cerrará para todos.'))return false;
 disconnect();sim=null;closeResult();if(helpDialog.open)helpDialog.close();showLobby();keys={};joy={x:0,y:0};active=false;return true;
}
$('back').onclick=()=>{if(close()!==false&&typeof window.CrystalWarsUI.onExit==='function')window.CrystalWarsUI.onExit();};
return {open,close,active:()=>active};
}
})();
