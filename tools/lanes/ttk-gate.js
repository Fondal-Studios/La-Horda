'use strict';
/* PRUEBA INFORMATIVA de equilibrio PvP por campeón: TIEMPO PARA MATAR a un blanco quieto (motor real de Cristales/Coliseo).
 * NO bloquea nada y NO toca campeones: lista los que quedan fuera de ±50 % de la mediana de su rol (siempre sale con código 0).
 * Cada campeón juega solo, al nivel 10 (como el Coliseo), contra un luchador rival inmóvil de 600 de vida y 10 % de defensa, sin hordas ni
 * otros héroes; se acerca hasta el alcance de su ataque básico y se queda quieto. Usa sus tres habilidades y su definitiva con las recargas naturales (energía repuesta cada segundo), el ataque básico
 * sostenido y el límite de ráfaga real del PvP (LANES.PVP_BURST: nadie pierde más del 40 % de su vida por segundo).
 * Uso: node tools/lanes/ttk-gate.js [--profile=none|max] [--repeat=2] [--secs=90] [--out=archivo.json] [campeón...]
 *   none     : campeón SIN progreso (Entrenamiento normalizado)                       (por defecto; es la prueba de equilibrio)
 *   max      : campeón con TODO al máximo de la campaña, recortado por LANES.PROGRESS_CAP (postgame)
 * Con profile=max también imprime la ventaja contra `none` si existe el archivo --base=... (salida de una corrida none). */
const {chromium}=require('playwright');const {spawn}=require('node:child_process');const path=require('node:path');const net=require('node:net');const fs=require('node:fs');
const arg=(n,d)=>{const a=process.argv.find(x=>x.startsWith('--'+n+'='));return a?a.split('=')[1]:d;};
const CAPJ=arg('cap',null);   // JSON que se mezcla en LANES.PROGRESS_CAP (solo para calibrar topes; p. ej. --cap={"talentPoints":0})
const PROFILE=arg('profile','none'),REPEAT=Number(arg('repeat',2)),SECS=Number(arg('secs',90)),OUT=arg('out',null),BASE=arg('base',null);
const ONLY=process.argv.slice(2).filter(x=>!x.startsWith('--'));
const freePort=()=>new Promise(r=>{const s=net.createServer().listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>r(p));});});
const median=a=>{const s=[...a].sort((x,y)=>x-y),m=s.length>>1;return s.length?(s.length%2?s[m]:(s[m-1]+s[m])/2):NaN;};
(async()=>{
 const PORT=await freePort(),root=path.resolve(__dirname,'../..');
 const srv=spawn('python3',['-m','http.server',String(PORT),'--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
 for(let i=0;i<80;i++){try{if((await fetch(`http://127.0.0.1:${PORT}/index.html`)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const newPage=async()=>{const p=await b.newPage({viewport:{width:844,height:390}});p.on('pageerror',e=>console.error('pageerror',e.message));await p.goto(`http://127.0.0.1:${PORT}/index.html?lazy=0`,{timeout:120000});await p.waitForFunction(()=>typeof lanesStart==='function'&&typeof update==='function',null,{timeout:60000});return p;};
 let p=await newPage();
 const roster=await p.evaluate(()=>Object.keys(CLASSES).filter(k=>championBotEligible(k)).map(k=>[k,CLASSES[k].roleCategory||'sin rol']));
 const list=roster.filter(([k])=>!ONLY.length||ONLY.includes(k));
 const rows=[];let n=0;
 for(const [champ,role] of list){
  if(++n%8===0){await p.close();p=await newPage();}
  const times=[],info={};
  for(let rep=0;rep<REPEAT;rep++){
   const r=await p.evaluate(({champ,profile,secs,seed,capj})=>{
    setState('mainmenu');if(capj){const o=JSON.parse(capj);for(const k in o){if(o[k]&&typeof o[k]==='object'&&!Array.isArray(o[k]))Object.assign(LANES.PROGRESS_CAP[k],o[k]);else LANES.PROGRESS_CAP[k]=o[k];}}
    // guardado de prueba: campaña completa y, según el perfil, el campeón al máximo de la campaña
    const c=save.champions[champ];c.unlocked=true;save.arenasCleared.infernal=true;
    if(profile!=='none'){
     c.level=99;c.skillMastery.forEach(m=>{m.alloc=10;m.useLvl=40;});c.ultMastery.alloc=10;c.ultMastery.useLvl=40;
     const tree=TALENT_TREES[champ];if(tree){for(const nd of tree.nodes)c.talents.nodes[nd.id]=nd.maxRank;const mid=Object.keys(tree.masteries||{})[0];if(mid){c.talents.mastery=mid;for(const nd of tree.masteries[mid].miniTree||[])c.talents.masteryNodes[nd.id]=nd.maxRank;}}
     save.relics={hp:30,dmg:30,def:30,vel:30};save.stash=[];
     for(const type of Object.keys(ITEM_TYPES)){const it=makeItem(type,'legendario',champ);it.level=10;it.ilvl=10;save.stash.push(it);c.equipment[type]=it.uid;}
    }
    lanesStart({champ,seed,training:profile==='none'});
    const out={champ,progress:LN.pg&&LN.pg.progress,ttk:null,hp:0,dmg:0,eHp:0};
    // escenario: sin hordas ni otros héroes; el blanco quieto en el centro del mapa
    for(const T of LN.team)T.nextWave=1e12;
    const foe=heroes.find(h=>h.team===1),mid=lanePoint(1,LANES_PATHS[1].len*0.5);
    for(const h of heroes)if(h!==player&&h!==foe){h.x=-5000;h.y=-5000;h.stunTimer=1e9;h.invulnTimer=1e9;}
    // todos al nivel 10 (como el Coliseo); el progreso del jugador sigue aplicándose por encima
    for(const h of heroes)lanesApplyLevel(h,10,true);
    player.x=mid.x;player.y=mid.y;foe.x=mid.x+150;foe.y=mid.y;foe.maxHp=foe.hp=600;foe.def=0.10;foe.itemShield=0;foe.itemMaxShield=0;foe.shield=0;
    out.hp=player.maxHp;out.dmg=Math.round(player.baseDmg*10)/10;out.eHp=Math.round(player.maxHp+(player.itemMaxShield||0));
    const dt=1000/60;let t=0;const stand=Math.max(50,Math.min(250,(player.cls.basicRange||150)*0.8));   // se acerca hasta el alcance de su básico
    for(let f=0;f<secs*60&&!LN.ended;f++){
     foe.stunTimer=1e6;foe.slowTimer=0;foe.x=mid.x+150;foe.y=mid.y;foe.hp=Math.min(foe.maxHp,foe.hp);foe.invulnTimer=0;foe.heal=0;
     const dx=foe.x-player.x,dy=foe.y-player.y,d=Math.hypot(dx,dy);
     joyVec=d>stand?{x:dx/d,y:dy/d}:{x:0,y:0};basicHeld=true;
     if(f%60===0)player.energy=player.maxEnergy;
     if(f%6===0&&player.alive){try{useSkill(0,null);useSkill(1,null);useSkill(2,null);useUltimate();}catch(e){}}
     update(dt);t+=dt;
     if(!foe.alive||foe.hp<=0){out.ttk=Math.round(t)/1000;break;}
    }
    lanesStop('mainmenu');
    return out;},{champ,profile:PROFILE,secs:SECS,seed:11+rep,capj:CAPJ});
   if(r.ttk!=null)times.push(r.ttk);Object.assign(info,{progress:r.progress,hp:r.hp,dmg:r.dmg,eHp:r.eHp});
  }
  const ttk=times.length===REPEAT?median(times):(times.length?median(times):null);
  rows.push({champ,role,ttk,runs:times,...info});
  console.log(champ.padEnd(14),role.padEnd(10),ttk==null?'sin matar en '+SECS+' s':ttk.toFixed(1)+' s',JSON.stringify(info));
 }
 await b.close();srv.kill();
 // agrupar por rol y marcar los que se salen de ±50 % de la mediana del rol
 const roles={};for(const r of rows)(roles[r.role]=roles[r.role]||[]).push(r);
 const out={profile:PROFILE,secs:SECS,repeat:REPEAT,roles:{},outliers:[]};
 console.log('\nTiempo para matar (s), blanco quieto de 600 de vida, nivel 10, perfil '+PROFILE+':');
 for(const role of Object.keys(roles).sort()){
  const rs=roles[role],med=median(rs.filter(r=>r.ttk!=null).map(r=>r.ttk));
  out.roles[role]={median:med,champions:rs.map(r=>({champ:r.champ,ttk:r.ttk,ratio:r.ttk!=null&&med?+(r.ttk/med).toFixed(2):null}))};
  console.log(`  ${role} (n=${rs.length}) mediana ${isNaN(med)?'—':med.toFixed(1)+' s'}`);
  for(const r of rs){const ratio=r.ttk!=null&&med?r.ttk/med:null,out50=r.ttk==null||ratio<0.5||ratio>1.5;
   if(out50)out.outliers.push({champ:r.champ,role,ttk:r.ttk,ratio:ratio==null?null:+ratio.toFixed(2),why:r.ttk==null?'no mata en '+SECS+' s':ratio<0.5?'más de 50 % por debajo de la mediana':'más de 50 % por encima de la mediana'});
   console.log(`    ${out50?'FUERA ':'      '}${r.champ.padEnd(14)} ${r.ttk==null?'—':r.ttk.toFixed(1)+' s'.padEnd(2)} ${ratio==null?'':'x'+ratio.toFixed(2)}`);}
 }
 console.log('\nFuera de ±50 % de la mediana de su rol ('+out.outliers.length+' de '+rows.length+'):');
 for(const o of out.outliers)console.log('  '+o.champ.padEnd(14)+o.role.padEnd(10)+(o.ttk==null?'—':o.ttk.toFixed(1)+' s')+'  '+(o.ratio==null?'':'x'+o.ratio+' ')+o.why);
 const all=rows.filter(r=>r.ttk!=null).map(r=>r.ttk);out.global={median:median(all),n:all.length,p10:[...all].sort((a,b)=>a-b)[Math.floor(all.length*0.1)],p90:[...all].sort((a,b)=>a-b)[Math.floor(all.length*0.9)]};
 out.rows=rows;
 if(BASE&&fs.existsSync(BASE)){
  const base=JSON.parse(fs.readFileSync(BASE,'utf8')).rows,ratios=[],ehp=[];
  for(const r of rows){const b0=base.find(x=>x.champ===r.champ);if(b0&&b0.ttk&&r.ttk){ratios.push(b0.ttk/r.ttk);}if(b0&&b0.eHp&&r.eHp)ehp.push(r.eHp/b0.eHp);}
  out.vsBase={dpsAdvantageMedian:+median(ratios).toFixed(2),dpsAdvantageMin:+Math.min(...ratios).toFixed(2),dpsAdvantageMax:+Math.max(...ratios).toFixed(2),ehpRatioMedian:+median(ehp).toFixed(2),n:ratios.length};
  out.vsBase.lanchesterMedian=+(out.vsBase.dpsAdvantageMedian*out.vsBase.ehpRatioMedian).toFixed(2);
  console.log('\nVentaja contra el campeón sin progreso (misma prueba): '+JSON.stringify(out.vsBase));
 }
 if(OUT){fs.writeFileSync(OUT,JSON.stringify(out,null,1));console.log('Escrito '+OUT);}
 console.log('\nINFORMATIVA: esta prueba no falla ni modifica campeones.');process.exit(0);
})().catch(e=>{console.error(e);process.exit(0);});
