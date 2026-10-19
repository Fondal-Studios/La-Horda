'use strict';
// Densidad de textos flotantes de PALABRAS (habilidades, sets, pasivas, avisos) en una pelea de 30 s, por rol,
// con el piloto automático de tools/playtest/autopilot.js. Los números de daño NO cuentan: tienen su propio tope
// (effects.js FT_NUM_CAP) y no se tocan.
//   node tools/quality/test-floating-text-rate.js [--report]
// Mide, por guardián, cuántas palabras nuevas aparecen por segundo (a) en total y (b) SOBRE la cabeza del
// jugador (a menos de 24 px en x del héroe, hasta 122 px arriba): ahí solo deberían ir los avisos que cambian la decisión.
// UMBRALES (documentados en docs/ux/jefes-limpios/README.md):
//   HERO_MAX = 0.40 palabras/s sobre el héroe (<= 12 en 30 s; el gate global deja pasar 1 de estado cada 1,5 s = 0,67/s
//              como techo duro, y la mayoría de las peleas queda muy por debajo) y ningún par de palabras de ESTADO (no avisos de decisión: FT_KEEP/warn) sobre el héroe a < 1,4 s.
//   ALL_MAX  = 1.20 palabras/s en total (incluye enemigos, jefes y arena).
// Servidor propio en TEXTRATE_PORT (47340); TEXTRATE_ROOT apunta a otra copia del repo (para medir "antes").
const {spawn}=require('node:child_process'),path=require('node:path');
let chromium;try{({chromium}=require('playwright'));}catch(e){({chromium}=require('/opt/node22/lib/node_modules/playwright'));}
const ROOT=path.resolve(process.env.TEXTRATE_ROOT||path.join(__dirname,'../..')),PORT=+(process.env.TEXTRATE_PORT||47340);
const HERO_MAX=0.40,ALL_MAX=1.20,SECONDS=30,GAP_MIN_MS=1400;
const ROLES={tanque:['tanque','segador'],asesino:['guerrero','cazadora','musashi'],mago:['mago','nigromante'],soporte:['soporte','profeta']};
const server=spawn('python3',['-m','http.server',String(PORT),'--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{await sleep(600);
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),args:['--no-sandbox']});
 const rows=[],fails=[];
 try{
  const p=await b.newPage({viewport:{width:844,height:390}}),errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{window.__campaignMode=true;window.__autoConfirm=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html?dev=1`,{timeout:120000});
  await p.waitForFunction(()=>typeof assetsAllReady==='function'&&assetsAllReady(),null,{timeout:180000});
  await p.addScriptTag({path:path.join(__dirname,'../playtest/autopilot.js')});
  for(const [role,classes] of Object.entries(ROLES))for(const cls of classes){
   if(process.env.TEXTRATE_ONLY&&!process.env.TEXTRATE_ONLY.split(',').includes(cls))continue;
   const r=await p.evaluate(({cls,SECONDS,GAP})=>{
    __AP.on=false;state='menu';netMatch=null;divinaMode=false;
    let n=(cls.length*7919+104729)|0||1;Math.random=()=>{n^=n<<13;n^=n>>>17;n^=n<<5;return (n>>>0)/4294967296;};
    for(const c of Object.values(save.champions)){c.unlocked=true;c.level=20;c.xp=0;}save.starterChosen=true;
    __AP.pickBuff=function(){const c=document.querySelector('#buff-cards .buff-card');if(c){c.click();return true;}return false;};
    lobbyAllies=['tanque','mago','soporte'];
    __AP.start(cls,'bosque',3);
    if(typeof campClose==='function')campClose(true);
    player.hp=player.maxHp=player.maxHp*4; // que la pelea dure los 30 s completos
    const seen=floatTexts.map(()=>({on:false,t:0})),events=[];let nums=0,ms=0;
    let guard=0;
    while(ms<SECONDS*1000&&(state==='playing'||state==='buff')&&guard++<5000){
     if(state==='buff'){__AP.pickBuff();continue;}
     update(40);ms+=40;
     floatTexts.forEach((f,i)=>{const s=seen[i];
      if(f.on&&(!s.on||f.t<s.t)){
       if(f.kind===4){const over=Math.abs(f.x-player.x)<24&&f.y<=player.y+12&&player.y-f.y<=122;events.push({t:ms,text:f.text,hero:over,status:over&&f.cls!=='warn'&&!(typeof FT_KEEP!=='undefined'&&FT_KEEP.test(f.text))});}
       else if(f.kind<=1)nums++;}
      s.on=f.on;s.t=f.t;});
    }
    const hero=events.filter(e=>e.hero),st=events.filter(e=>e.status),gaps=st.slice(1).map((e,i)=>({g:e.t-st[i].t,a:st[i].text,b:e.text})),worst=gaps.sort((a,b)=>a.g-b.g)[0],minGap=worst?worst.g:1e9;
    return {cls,seconds:ms/1000,state,words:events.length,heroWords:hero.length,nums,minHeroGapMs:minGap,worstPair:worst?worst.a+' + '+worst.b:'',heroTexts:hero.map(e=>e.text),otherTexts:events.filter(e=>!e.hero).map(e=>e.text)};
   },{cls,SECONDS,GAP:GAP_MIN_MS});
   r.role=role;r.wps=+(r.words/r.seconds).toFixed(2);r.heroWps=+(r.heroWords/r.seconds).toFixed(2);rows.push(r);
   console.log(`${role.padEnd(8)} ${cls.padEnd(11)} ${r.seconds.toFixed(0)}s palabras=${r.words} (${r.wps}/s) sobre héroe=${r.heroWords} (${r.heroWps}/s) numeros=${r.nums} sobreHeroe:${JSON.stringify([...new Set(r.heroTexts)]).slice(0,160)}`);
   if(r.seconds<SECONDS*0.9)fails.push(`${cls}: la pelea duró ${r.seconds}s (<${SECONDS*.9}s): ${r.state}`);
   if(r.heroWps>HERO_MAX)fails.push(`${cls} (${role}): ${r.heroWps} palabras/s sobre el héroe > ${HERO_MAX}`);
   if(r.wps>ALL_MAX)fails.push(`${cls} (${role}): ${r.wps} palabras/s en total > ${ALL_MAX}`);
   if(r.minHeroGapMs<GAP_MIN_MS)fails.push(`${cls} (${role}): dos palabras de estado sobre el héroe a ${r.minHeroGapMs} ms (${r.worstPair}) (< ${GAP_MIN_MS})`);
  }
  for(const [role] of Object.entries(ROLES)){const rr=rows.filter(x=>x.role===role);console.log(`ROL ${role}: máx sobre héroe ${Math.max(...rr.map(x=>x.heroWps))}/s, máx total ${Math.max(...rr.map(x=>x.wps))}/s`);}
  if(errs.length)fails.push('pageerror: '+errs[0]);
  if(process.argv.includes('--report'))console.log(JSON.stringify(rows,null,1));
  console.log(fails.length?'FAIL texto flotante por segundo:\n - '+fails.join('\n - '):`PASS texto flotante por segundo (umbral sobre héroe ${HERO_MAX}/s, total ${ALL_MAX}/s, ${SECONDS} s por guardián)`);
  if(fails.length)process.exitCode=1;
 }finally{await b.close();server.kill();}})().catch(e=>{console.error(e);process.exitCode=1;});
