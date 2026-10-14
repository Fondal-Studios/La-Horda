'use strict';
/* Guerra de Cristales: los árboles/peñascos son SÓLIDOS, los matorrales ESCONDEN héroes, y nada de eso bloquea los carriles, bases ni campamentos. */
const {chromium}=require('playwright');const {spawn}=require('node:child_process');const path=require('node:path');const assert=require('node:assert/strict');
const PORT=8896;const srv=spawn('python3',['-m','http.server',String(PORT)],{cwd:path.resolve(__dirname,'../..'),stdio:'ignore'});
(async()=>{
 for(let i=0;i<60;i++){try{if((await fetch(`http://127.0.0.1:${PORT}/index.html`)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const p=await b.newPage({viewport:{width:844,height:390}}),errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(`http://127.0.0.1:${PORT}/index.html?lazy=0`);await p.waitForFunction(()=>typeof lanesStart==='function'&&typeof update==='function',null,{timeout:60000});
 const r=await p.evaluate(()=>{
  setState('mainmenu');lanesStart({champ:'mago',seed:3});for(let f=0;f<60*3;f++)update(1000/60);
  const out={solid:LNS.solid.length,bushes:LNS.bushes.length};
  const o=LNS.solid.find(s=>s.r===34);player.x=o.x+4;player.y=o.y+3;lanesClamp(player);out.pushed=Math.hypot(player.x-o.x,player.y-o.y)>=o.r;
  // nada sólido ni matorral sobre un carril, una base o un campamento
  out.onLane=LNS.solid.filter(s=>[0,1,2].some(l=>laneProject(l,s.x,s.y).d<200)).length+LNS.bushes.filter(s=>[0,1,2].some(l=>laneProject(l,s.x,s.y).d<200)).length;
  out.onBase=LNS.solid.filter(s=>[0,1].some(t=>{const c=laneCrystalPos(t);return Math.hypot(s.x-c.x,s.y-c.y)<400;})).length;
  out.onCamp=LNS.solid.filter(s=>LANES_CAMPS.some(c=>Math.hypot(s.x-c.x,s.y-c.y)<180)).length;
  const bu=LNS.bushes[0];player.x=bu.x;player.y=bu.y;for(let f=0;f<5;f++)update(16);out.hidden=!!player._bush;
  player.x=1000;player.y=3000;for(let f=0;f<5;f++)update(16);out.visibleOutside=!player._bush;
  out.vis=[lanesHeroVisibleTo({_bush:bu,x:0,y:0},LANES.BUSH_SEE-10,0),lanesHeroVisibleTo({_bush:bu,x:0,y:0},LANES.BUSH_SEE+10,0)];
  return out;});
 console.log(JSON.stringify(r));
 assert(r.solid>100&&r.bushes>20,'hay árboles, peñascos y matorrales');assert.equal(r.pushed,true,'un árbol/peñasco frena el paso');
 assert.equal(r.onLane,0,'sin obstáculos sobre los carriles');assert.equal(r.onBase,0,'sin obstáculos en las bases');assert.equal(r.onCamp,0,'sin obstáculos en los campamentos');
 assert.equal(r.hidden,true,'el matorral esconde');assert.equal(r.visibleOutside,true,'fuera del matorral se ve');assert.deepEqual(r.vis,[true,false],'escondido: solo se ve de cerca');
 assert.deepEqual(errs,[],'sin errores de página');
 await b.close();srv.kill();console.log('PASS lanes scenery');process.exit(0);
})().catch(e=>{console.error(e);srv.kill();process.exit(1);});
