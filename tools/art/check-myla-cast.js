'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),H=require('../lib/serve');
const ROOT=path.resolve(__dirname,'../..');
const OUT=path.join(ROOT,'art-source/entregas/bloques/B005_myla/cierre-cast-01');

(async()=>{
 fs.mkdirSync(OUT,{recursive:true});
 const site=await H.startSite(),browser=await H.launch();
 const report={scope:'Myla B005 base cast supplement through the real renderer; authored skins and Berrinche preserved',checks:[],errors:[],rows:[]};
 try{
  const context=await browser.newContext({viewport:{width:1280,height:720},serviceWorkers:'block'});
  await context.route('**/*',r=>new URL(r.request().url()).origin===site.url?r.continue():r.abort());
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(site.url+'/?lazy=1');
  await page.waitForFunction(()=>typeof drawPortador==='function'&&typeof useSkill==='function'&&typeof activeSetSkin==='function');
  await page.evaluate(()=>{loop=function(){};for(const [id,d] of Object.entries({...SET_SKINS,...CROMA_SKINS}))if(d.champ==='myla')skinDefOf(id);assetsStartGroup('ch:myla');});
  await page.waitForFunction(()=>CHAMP_PACK.myla?.ready&&CHAMP_PACK.myla_cast?.ready&&CHAMP_PACK.myla_berrinche?.ready&&CHAMP_PACK.skin_merienda_magica?.ready&&CHAMP_PACK.skin_myla_arandanos?.ready);
  for(const view of [{id:'desktop',width:1280,height:720},{id:'mobile',width:844,height:390}]){
   await page.setViewportSize({width:view.width,height:view.height});
   const result=await page.evaluate(({view})=>{
    const arenas=['bosque','hielo','infernal','laberinto','acuatica','minas'];
    const looks=[{id:'base',skin:null,pack:'myla'},{id:'merienda',skin:'merienda_magica',pack:'skin_merienda_magica'},{id:'arandanos',skin:'myla_arandanos',pack:'skin_myla_arandanos'}];
    const check=[],rows=[],cv=document.getElementById('game'),realReady=CHAMP_PACK.myla_cast.ready;
    const makeSheet=(cols,rows)=>{const c=document.createElement('canvas');c.width=cols*256;c.height=rows*216;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#091018';g.fillRect(0,0,c.width,c.height);return[c,g];};
    const stamp=(sheet,index,label)=>{const [c,g]=sheet,col=index%(c.width/256|0),row=Math.floor(index/(c.width/256));const sw=Math.min(256,cv.width),sh=Math.min(192,cv.height),sx=Math.max(0,(cv.width-sw)/2),sy=Math.max(0,(cv.height-sh)/2);g.drawImage(cv,sx,sy,sw,sh,col*256,row*216,sw,sh);g.fillStyle='#091018';g.fillRect(col*256,row*216+192,256,24);g.fillStyle='#f3ead2';g.font='11px sans-serif';g.fillText(label,col*256+5,row*216+208);};
    const setup=(arena,look,dense=false)=>{netMatch=null;window.ART_GATE_NO_VFX=true;selectedClass='myla';currentArena=arena;lobbyAllies=[];const rec=save.champions.myla;rec.unlocked=true;rec.level=20;rec.equipment={};rec.croma=null;rec.cosmeticSkin='';startRun(1);state='playing';document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));spawnTimer=arenaHazardTimer=1e9;enemies=[];if(arena==='bosque'){player.x+=260;player.y+=160;}CAM_SUBJECT={x:player.x,y:player.y};CAM_LEAD_X=CAM_LEAD_Y=CAM_LIFT=0;_arenaTitleUntil=0;player.invulnTimer=1e9;player._codexSkin=look.skin;if(dense)for(const [dx,dy] of [[-120,-80],[120,-80],[-145,10],[145,10]]){const e=spawnEnemy('esqueleto');Object.assign(e,{x:player.x+dx,y:player.y+dy,hp:1e8,maxHp:1e8,speed:0,baseSpeed:0,dmg:0});}};
    const cast=(dir,progress=.88)=>{const aim=dir==='up'?{x:player.x,y:player.y-100,dx:0,dy:-1}:dir==='side'?{x:player.x+100,y:player.y,dx:1,dy:0}:{x:player.x,y:player.y+100,dx:0,dy:1};player.fx=aim.dx;player.fy=aim.dy;player._packCastUntil=0;player.attackAnim=0;player.cls.skills[2].cd=0;player.skillCd[2]=0;useSkill(2,aim);player.fx=aim.dx;player.fy=aim.dy;player._packCastUntil=Infinity;player._aDur=400;player._aPrev=400;player.attackAnim=Math.max(1,400*(1-progress));};
    const drawTracked=()=>{const calls=[],orig=champPackDrawFrame;champPackDrawFrame=function(P,v,...args){calls.push({key:Object.keys(CHAMP_PACK).find(k=>CHAMP_PACK[k]===P)||'?',frame:v<0?~v:v});return orig.call(this,P,v,...args);};try{render();}finally{champPackDrawFrame=orig;}return calls;};
    const compare=makeSheet(6,2),matrix=makeSheet(6,looks.length*2);let ci=0,mi=0;
    for(const mode of ['legacy','candidate'])for(const arena of arenas){setup(arena,looks[0]);CHAMP_PACK.myla_cast.ready=mode==='candidate'&&realReady;cast('up',.88);const calls=drawTracked();stamp(compare,ci++,mode+' · '+arena+' · espalda');const used=calls.filter(c=>['myla','myla_cast'].includes(c.key));rows.push({view:view.id,mode,arena,look:'base',resolved:setSkinPackKey(player,'myla'),calls:used});check.push({name:view.id+' '+mode+' '+arena+' base consumer',ok:mode==='candidate'?used.some(c=>c.key==='myla_cast'&&c.frame===11):used.some(c=>c.key==='myla')&&!used.some(c=>c.key==='myla_cast')});}
    for(const dense of [false,true])for(const look of looks)for(const arena of arenas){setup(arena,look,dense);CHAMP_PACK.myla_cast.ready=realReady;cast('up',.88);const calls=drawTracked(),used=calls.filter(c=>c.key==='myla_cast'||c.key===look.pack);stamp(matrix,mi++,look.id+' · '+(dense?'dense':'sparse')+' · '+arena);rows.push({view:view.id,mode:'candidate',arena,look:look.id,dense,resolved:setSkinPackKey(player,'myla'),calls:used});check.push({name:view.id+' '+look.id+' '+arena+' '+(dense?'dense':'sparse'),ok:look.id==='base'?used.some(c=>c.key==='myla_cast'&&c.frame===11):used.some(c=>c.key===look.pack)&&!used.some(c=>c.key==='myla_cast')});}
    setup('bosque',looks[0]);CHAMP_PACK.myla_cast.ready=realReady;cast('side',.5);const tantrum=portadorAdd(player,'tantrum',player,1000,{}),tantrumCalls=drawTracked();check.push({name:view.id+' Berrinche priority',ok:tantrumCalls.some(c=>c.key==='myla_berrinche')&&!tantrumCalls.some(c=>c.key==='myla_cast')});portadorObjects.splice(portadorObjects.indexOf(tantrum),1);
    for(const dir of ['down','side','up'])for(const [n,progress] of [[0,.05],[1,.3],[2,.55],[3,.88]]){setup('bosque',looks[0]);CHAMP_PACK.myla_cast.ready=realReady;cast(dir,progress);const calls=drawTracked().filter(c=>c.key==='myla_cast');check.push({name:view.id+' '+dir+' frame '+n,ok:calls.length===1&&calls[0].frame===({down:0,side:4,up:8}[dir]+n)});}
    CHAMP_PACK.myla_cast.ready=realReady;state='menu';return{check,rows,comparison:compare[0].toDataURL(),matrix:matrix[0].toDataURL()};
   },{view});
   for(const [name,data] of [['before-after',result.comparison],['six-arenas-skins',result.matrix]])fs.writeFileSync(path.join(OUT,view.id+'-'+name+'.png'),Buffer.from(data.split(',')[1],'base64'));
   report.checks.push(...result.check);report.rows.push(...result.rows);
  }
  const cast=fs.readFileSync(path.join(ROOT,'assets/sprites/champions/myla/v2/cast.png'));
  report.asset={path:'assets/sprites/champions/myla/v2/cast.png',bytes:cast.length,sha256:crypto.createHash('sha256').update(cast).digest('hex')};
  report.reference={codex:'assets/ui/codex/champions/myla.png',source:'art-source/entregas/bloques/B005_myla/revision-cast-back-03/cast.png'};
  report.files=fs.readdirSync(OUT).filter(f=>f.endsWith('.png')).sort().map(name=>{const b=fs.readFileSync(path.join(OUT,name));return{name,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')};});
  report.status=report.errors.length||report.checks.some(c=>!c.ok)?'FAIL':'PASS';
  fs.writeFileSync(path.join(OUT,'RUNTIME_GATE.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({status:report.status,checks:report.checks.length,failed:report.checks.filter(c=>!c.ok),errors:report.errors,files:report.files}));
  if(report.status!=='PASS')process.exitCode=1;
 }finally{await browser.close();await site.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
