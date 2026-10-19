'use strict';
/* Equipos claros (Guerra de Cristales y Coliseo): muestrea PÍXELES REALES de las barras de vida dibujadas en el canvas y comprueba la
 * convención única: aliados verdes, enemigos rojos, neutrales (selva/épicos) ámbar, yo verde brillante; que sigue valiendo si el jugador
 * está en el equipo contrario (Cristales) o si espectás a un luchador de otro equipo (Coliseo); que el marcador y el minimapa usan el mismo
 * criterio; y que una paleta sobrescrita solo con variables CSS (--ally/--enemy/--neutral/--self, p. ej. para daltónicos) cambia los colores
 * sin tocar el render. Servidor propio en un puerto libre (se verifica que sirva ESTE árbol).
 *   node tools/lanes/test-sides.js     (CHROMIUM_PATH opcional) */
const {chromium}=require('playwright');const {spawn}=require('node:child_process');const path=require('node:path');const net=require('node:net');const fs=require('node:fs');const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const FIX={tut:{training:1},starterChosen:true,starterGiftV1:true,starterSkin:'vale',playtestV1Bonus:true,campaignResetV1:true,campaignResetV2:true};
const freePort=()=>new Promise(r=>{const s=net.createServer().listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>r(p));});});
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const hex=h=>{h=h.trim().replace('#','');if(h.length===3)h=[...h].map(c=>c+c).join('');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16));};

// Se instala dentro de la página: cada barra de vida que se dibuja queda registrada con el píxel REAL del canvas y la entidad (rel esperado calculado aparte).
const INSTALL=()=>{
 window.__rec=[];window.__icons=new Set();
 const oSidesOf=window.sidesOf;let last=null;
 window.sidesOf=function(e){const r=oSidesOf(e);last={e,r};return r;};
 const oBar=window.sidesBar,oIcon=window.sidesIcon;
 window.sidesIcon=function(g,rel){window.__icons.add(rel);return oIcon.apply(this,arguments);};
 window.sidesBar=function(g,rel,x,y,w,h,f,o){
  oBar.apply(this,arguments);
  const ent=last&&last.r===rel?last.e:null;const fr=Math.max(0,Math.min(1,f));if(fr<0.2)return;
  const t=g.getTransform(),pt=t.transformPoint(new DOMPoint(x+w*fr*0.5,y+h*0.62));
  // 3x3 alrededor del centro del relleno (con el canvas reducido la barra mide pocos píxeles): se toma el más claro = relleno puro, sin marco ni mezcla
  const im=g.getImageData(Math.round(pt.x)-1,Math.round(pt.y)-1,3,3).data;const cv=document.createElement('canvas').getContext('2d');cv.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--'+rel).trim();const tc=cv.fillStyle,T=[1,3,5].map(i=>parseInt(tc.slice(i,i+2),16));
  let bi=0,bs=-1;for(let i=0;i<9;i++){const a=[im[i*4],im[i*4+1],im[i*4+2]],sc=(a[0]*T[0]+a[1]*T[1]+a[2]*T[2])/((Math.hypot(...a)*Math.hypot(...T))||1);if(im[i*4+3]>=250&&sc>bs){bs=sc;bi=i;}}
  if(bs<0)return; // fuera de pantalla: nada que muestrear
  const d=[im[bi*4],im[bi*4+1],im[bi*4+2]];
  const kind=!ent?'?':ent===player?'self':ent.isStruct?ent.kind:(ent.classKey?'hero':(ent.epicId!=null?'epic':'minion'));
  let expect=null;if(ent){expect=ent===player?'self':(ent.team===2&&LN.mode!=='coliseo')?'neutral':(ent.team===((typeof CAM_SUBJECT!=='undefined'&&CAM_SUBJECT&&CAM_SUBJECT.team!=null)?CAM_SUBJECT.team:player.team)?'ally':'enemy');}
  window.__rec.push({rel,expect,kind,dim:!!(o&&o.dim),rgb:[d[0],d[1],d[2]],ga:g.globalAlpha,f:fr,inv:ent&&ent.invulnTimer,dead:ent&&ent.alive});
 };
};
const TOKENS=()=>{const cs=getComputedStyle(document.documentElement),g=n=>cs.getPropertyValue(n).trim();return {ally:g('--ally'),enemy:g('--enemy'),neutral:g('--neutral'),self:g('--self')};};

function checkRecords(rec,tok,label,need){
 const col={ally:hex(tok.ally),enemy:hex(tok.enemy),neutral:hex(tok.neutral),self:hex(tok.self)};
 const seen={};
 for(const r of rec){
  if(!r.expect)continue;
  assert.equal(r.rel,r.expect,`${label}: ${r.kind} dibujado como ${r.rel} pero debía ser ${r.expect}`);
  seen[r.rel+':'+r.kind]=(seen[r.rel+':'+r.kind]||0)+1;
  if(r.dim){ // estructura protegida: relleno atenuado → solo el canal dominante debe ser el del bando
   const [R,G]=r.rgb;if(r.rel==='ally')assert(G>R+25,`${label}: barra atenuada aliada no es verde ${r.rgb}`);if(r.rel==='enemy')assert(R>G+25,`${label}: barra atenuada enemiga no es roja ${r.rgb}`);continue;}
  // el motor puede oscurecer una barra (alfa de la entidad, niebla): se acepta el MISMO tono con brillo entre 25 % y 140 % (el brillo de arriba de la barra es más claro)
  const t=col[r.rel],dot=r.rgb[0]*t[0]+r.rgb[1]*t[1]+r.rgb[2]*t[2],cos=dot/(Math.hypot(...r.rgb)*Math.hypot(...t)||1),k=Math.hypot(...r.rgb)/Math.hypot(...t);
  assert(cos>0.97&&k>0.25&&k<1.4,`${label}: píxel ${r.rgb} de ${r.kind}/${r.rel} no corresponde a ${tok[r.rel]} ga=${r.ga} f=${r.f} inv=${r.inv} (cos=${cos.toFixed(3)}, brillo=${k.toFixed(2)})`);
 }
 for(const k of need)assert(seen[k],`${label}: no se muestreó ninguna barra ${k}. Vistas: ${JSON.stringify(seen)}`);
 // separación entre bandos: verde ≠ rojo ≠ ámbar ≠ yo
 const rels=['ally','enemy','neutral','self'];for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)assert(dist(col[rels[i]],col[rels[j]])>60,`${label}: ${rels[i]} y ${rels[j]} demasiado parecidos`);
 return seen;
}
const dominant=([r,g,b])=>r>g+60&&r>b+60?'red':g>r+40&&g>b+40?'green':r>b+60&&g>b+60?'amber':'other';

(async()=>{
 const PORT=await freePort();
 const srv=spawn('python3',['-m','http.server',String(PORT),'--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
 try{
  for(let i=0;i<80;i++){try{if((await fetch(`http://127.0.0.1:${PORT}/index.html`)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  const cwd=fs.readlinkSync(`/proc/${srv.pid}/cwd`);assert.equal(cwd,root,'el servidor debe servir este árbol');
  const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined),args:['--no-sandbox']});
  const open=async(w,h)=>{
   const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:true});await ctx.addInitScript(f=>{try{localStorage.setItem('laHordaSave_v1',JSON.stringify(f));}catch(e){}},FIX);
   const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
   await p.goto(`http://127.0.0.1:${PORT}/index.html?lazy=0`,{timeout:120000});
   await p.waitForFunction(()=>typeof setState==='function'&&typeof lanesStart==='function'&&typeof sidesBar==='function',null,{timeout:60000});
   await p.evaluate(()=>{save.tut=save.tut||{};save.tut.training=1;persistNow();setState('mainmenu');renderMainMenu();});
   return {ctx,p};
  };
  const near=async(p,x,y)=>{await p.evaluate(([x,y])=>{player.x=x;player.y=y;player.invulnTimer=1e9;player.hp=player.maxHp;},[x,y]);await p.waitForTimeout(450);};
  const results=[];

  /* ---------- Guerra de Cristales: equipo 0 y equipo 1 como "mi equipo" ---------- */
  for(const [w,h] of [[844,390],[667,375]]){
   for(const myTeam of [0,1]){
    const {ctx,p}=await open(w,h);
    await p.evaluate(t=>{if(t===1){const o=window.lanesBegin;window.lanesBegin=function(){const r=o.apply(this,arguments);LN.assignment=[1,1,1,1,1,0,0,0,0,0];return r;};}lanesStart({champ:'mago'});},myTeam);
    await p.waitForFunction(()=>state==='playing'&&lanesOn(),null,{timeout:20000});
    assert.equal(await p.evaluate(()=>player.team),myTeam,'equipo del jugador');
    await p.evaluate(INSTALL);
    const tokens=await p.evaluate(TOKENS);
    await p.evaluate(()=>{LN.team.forEach(T=>{T.nextWave=0;});});await p.waitForFunction(()=>enemies.some(e=>e.alive&&!e.lanesProxy&&e.team===0)&&enemies.some(e=>e.alive&&!e.lanesProxy&&e.team===1),null,{timeout:30000}); // sale la primera horda ya
    // 1) héroes y súbditos en el carril medio
    await p.evaluate(()=>{const m=LANES_PATHS[1].pts[Math.floor(LANES_PATHS[1].pts.length/2)];heroes.forEach((h,i)=>{h.x=m[0]+(h.team===player.team?-90:90)+(i%3)*20;h.y=m[1]+(i%5)*24-50;});
     for(const e of enemies)if(e.alive&&!e.lanesProxy&&e.team!=null&&e.team!==2){e.x=m[0]+(e.team===player.team?-70:70)+(Math.random()-.5)*180;e.y=m[1]+(Math.random()-.5)*100;e.hp=e.maxHp*0.6;}});
    await near(p,...(await p.evaluate(()=>{const m=LANES_PATHS[1].pts[Math.floor(LANES_PATHS[1].pts.length/2)];return [m[0],m[1]];})));
    await p.evaluate(()=>{for(const e of enemies)if(e.alive&&!e.lanesProxy&&e.team!=null&&e.team!==2)e.hp=e.maxHp*0.6;});await p.waitForTimeout(500);
    // 2) torres propias y rivales, cristales
    for(const [team,idx] of [[myTeam,3],[1-myTeam,3],[myTeam,9],[1-myTeam,9]]){const s=await p.evaluate(([t,i])=>{const s=LN.team[t].S[i];return [s.x,s.y+120];},[team,idx]);await near(p,...s);await p.waitForFunction(([k,r])=>window.__rec.some(x=>x.kind===k&&x.rel===r),[idx===9?'crystal':'tower',team===myTeam?'ally':'enemy'],{timeout:20000});}
    // 3) selva: un campamento con bichos dañados + objetivo épico
    await p.evaluate(()=>{LN.camps.forEach(c=>{c.respawnAt=0;});});await p.waitForFunction(()=>LN.camps[0].mons.some(m=>m.alive),null,{timeout:15000}); // sale la selva ya
    const camp=await p.evaluate(()=>{const cd=LANES_CAMPS[0];const c=LN.camps&&LN.camps[cd.id];if(c)c.mons.forEach(m=>{if(m.alive)m.hp=m.maxHp*0.5;});return [cd.x,cd.y];});
    await near(p,...camp);await p.evaluate(()=>{const cd=LANES_CAMPS[0],c=LN.camps&&LN.camps[cd.id];if(c)c.mons.forEach(m=>{if(m.alive)m.hp=m.maxHp*0.5;});});await p.waitForTimeout(500);
    await p.waitForFunction(()=>window.__rec.some(x=>x.rel==='neutral'),null,{timeout:20000});
    const rec=await p.evaluate(()=>window.__rec);
    const seen=checkRecords(rec,tokens,`Cristales eq${myTeam} ${w}`,['self:self','ally:hero','enemy:hero','ally:minion','enemy:minion','ally:tower','enemy:tower','ally:crystal','enemy:crystal','neutral:minion']);
    // 4) marcador (DOM) y minimapa (píxeles del canvas)
    const hud=await p.evaluate(()=>[...document.querySelectorAll('.ln-team')].map(t=>({side:t.dataset.side,bar:getComputedStyle(t.querySelector('.ln-bar u')).backgroundColor,tag:t.querySelector('.ln-name').dataset.tag})));
    assert.equal(hud[myTeam].side,'ally',`marcador: tu equipo (${myTeam}) debe ser aliado`);assert.equal(hud[1-myTeam].side,'enemy');
    const rgbOf=s=>s.match(/\d+/g).slice(0,3).map(Number);
    assert.equal(dominant(rgbOf(hud[myTeam].bar)),'green','barra del marcador propia verde: '+hud[myTeam].bar);assert.equal(dominant(rgbOf(hud[1-myTeam].bar)),'red','barra del marcador rival roja: '+hud[1-myTeam].bar);
    const mm=await p.evaluate(()=>{lanesDrawMap();const cv=document.querySelector('.ln-rival canvas'),g=cv.getContext('2d'),sx=cv.width/LANES.W,sy=cv.height/LANES.H;
     const px=(s)=>[...g.getImageData(Math.round(s.x*sx),Math.round(s.y*sy),1,1).data].slice(0,3);return {mine:px(LN.team[player.team].S[9]),foe:px(LN.team[1-player.team].S[9])};});
    assert.equal(dominant(mm.mine),'green','minimapa: mi cristal verde '+mm.mine);assert.equal(dominant(mm.foe),'red','minimapa: cristal rival rojo '+mm.foe);
    const icons=await p.evaluate(()=>[...window.__icons]);assert(icons.includes('ally')&&icons.includes('enemy'),'íconos de escudo y espada dibujados: '+icons);
    // 5) paleta alternativa solo con variables CSS (p. ej. daltónicos): el render sigue la nueva paleta sin cambios de código
    await p.evaluate(()=>{const s=document.documentElement.style;s.setProperty('--ally','#0072b2');s.setProperty('--enemy','#d55e00');s.setProperty('--neutral','#f0e442');s.setProperty('--self','#56b4e9');window.__rec.length=0;heroes.forEach((h,i)=>{if(h!==player){h.x=player.x+(h.team===player.team?-80:80);h.y=player.y+(i%5)*20-40;}});});
    await p.waitForFunction(()=>['ally','enemy'].every(r=>window.__rec.some(x=>x.rel===r&&x.kind==='hero')),null,{timeout:20000});
    const tok2=await p.evaluate(TOKENS);assert.equal(tok2.ally,'#0072b2');
    const rec2=await p.evaluate(()=>window.__rec);
    const like=(a,c)=>{const cos=(a[0]*c[0]+a[1]*c[1]+a[2]*c[2])/((Math.hypot(...a)*Math.hypot(...c))||1),k=Math.hypot(...a)/Math.hypot(...c);return cos>0.97&&k>0.25&&k<1.4;};
    const hasBlue=rec2.some(r=>r.rel==='ally'&&!r.dim&&like(r.rgb,[0,114,178])),hasOrange=rec2.some(r=>r.rel==='enemy'&&!r.dim&&like(r.rgb,[213,94,0]));
    assert(hasBlue&&hasOrange,`paleta sobrescrita por CSS: aliado azul y enemigo naranja (${rec2.length} muestras: ${JSON.stringify(rec2.slice(0,3))})`);
    assert.deepEqual(p.errs,[],'sin errores JS');
    results.push(`Cristales ${w}x${h} equipo ${myTeam}: OK ${JSON.stringify(seen)}`);
    await ctx.close();
   }
  }

  /* ---------- Coliseo: normal y espectando a un luchador de otro equipo ---------- */
  for(const [w,h] of [[844,390],[667,375]]){
   for(const spectate of [false,true]){
    const {ctx,p}=await open(w,h);
    await p.evaluate(()=>colStart({champ:'guerrero'}));
    await p.waitForFunction(()=>state==='playing'&&lanesOn()&&LN.mode==='coliseo'&&LN.col.phase==='fight',null,{timeout:40000});
    await p.evaluate(INSTALL);const tokens=await p.evaluate(TOKENS);
    await p.evaluate(()=>{player.invulnTimer=1e9;const c=colPitCenter(0);heroes.forEach(h=>{if(h.pit===0){h.x=c.x+(h.team===0?-70:70)+(Math.random()-.5)*40;h.y=c.y+(Math.random()-.5)*160;}});});
    let view=0;
    if(spectate){ // caés en plena pelea y la cámara sigue a un luchador del equipo 1: para ese punto de vista, el equipo 1 es el aliado (verde)
     await p.evaluate(()=>{player.invulnTimer=0;damageHero(player,99999,{isPvp:true,from:null});});
     await p.waitForSelector('.col-spec:not(.hidden)',{timeout:10000});
     for(let i=0;i<8&&(await p.evaluate(()=>CAM_SUBJECT&&CAM_SUBJECT.team))!==1;i++)await p.click('.col-next');
     view=await p.evaluate(()=>CAM_SUBJECT.team);assert.equal(view,1,'la cámara sigue a un luchador del equipo 1');
    }
    await p.waitForTimeout(500);
    await p.evaluate(()=>{heroes.forEach(h=>{if(h!==player)h.hp=h.maxHp*0.6;});window.__rec.length=0;});await p.waitForTimeout(700);
    const rec=await p.evaluate(()=>window.__rec);
    const need=spectate?['ally:hero','enemy:hero']:['self:self','ally:hero','enemy:hero'];
    const seen=checkRecords(rec,tokens,`Coliseo ${spectate?'espectador':'normal'} ${w}`,need);
    const hud=await p.evaluate(()=>[...document.querySelectorAll('.col-team')].map(t=>t.dataset.side));
    assert.equal(hud.filter(x=>x==='ally').length,1,'marcador: un solo equipo aliado '+hud);assert.equal(hud.filter(x=>x==='enemy').length,3,'marcador: tres rivales '+hud);assert.equal(hud[view],'ally','el aliado del marcador es el equipo del punto de vista');
    const sw=await p.evaluate(()=>{const c=document.querySelector('.col-team[data-side="ally"] .ln-side'),e=document.querySelector('.col-team[data-side="enemy"] .ln-side');const cs=x=>getComputedStyle(x);return {a:cs(c).backgroundColor,e:cs(e).backgroundColor,ea:cs(e).maskImage||cs(e).webkitMaskImage,aa:cs(c).maskImage||cs(c).webkitMaskImage};});
    assert.notEqual(sw.ea,sw.aa,'ícono distinto (escudo / espada) además del color');assert.equal(dominant(sw.a.match(/\d+/g).slice(0,3).map(Number)),'green');assert.equal(dominant(sw.e.match(/\d+/g).slice(0,3).map(Number)),'red');
    const mm=await p.evaluate(()=>{colDrawMap();const cv=document.querySelector('.col-map canvas'),g=cv.getContext('2d'),sx=cv.width/COL.W,sy=cv.height/COL.H;const view=(CAM_SUBJECT&&CAM_SUBJECT.team!=null)?CAM_SUBJECT.team:player.team;
     const out={};for(const rel of ['ally','enemy']){const hh=heroes.find(x=>x!==player&&x.alive&&(rel==='ally'?x.team===view:x.team!==view));
       // el aro del héroe: 6 px a la izquierda/arriba del centro cae sobre el trazo de 2 px; se busca el color más frecuente del trazo
       const px=[];for(let a=0;a<12;a++){const r=(rel==='enemy'?7:5.5);const q=g.getImageData(Math.round(hh.x*sx+Math.cos(a/12*6.283)*r*(rel==='enemy'?0.78:1)),Math.round(hh.y*sy+Math.sin(a/12*6.283)*r*(rel==='enemy'?0.78:1)),1,1).data;px.push([q[0],q[1],q[2]]);}
       out[rel]=px;}return out;});
    const countDom=(px,k)=>px.filter(c=>dominant(c)===k).length;
    assert(countDom(mm.ally,'green')>=3,'minimapa del Coliseo: aro verde del aliado '+JSON.stringify(mm.ally));assert(countDom(mm.enemy,'red')>=3,'minimapa del Coliseo: aro rojo del rival '+JSON.stringify(mm.enemy));
    assert.deepEqual(p.errs,[],'sin errores JS');
    results.push(`Coliseo ${w}x${h} ${spectate?'espectando equipo 1':'normal'}: OK ${JSON.stringify(seen)}`);
    await ctx.close();
   }
  }
  await b.close();
  console.log(results.join('\n'));console.log('PASS test-sides: aliados verdes, enemigos rojos, neutrales ámbar, yo destacado; vale al cambiar de equipo/punto de vista y con paleta CSS sobrescrita');
 }finally{srv.kill();}
})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
