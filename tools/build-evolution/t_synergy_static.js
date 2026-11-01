'use strict';
/* Prueba estática (sin navegador): integridad de datos, diversidad de arquetipos, banda de presupuesto
   anti-dominancia, tiempo de comprensión y aislamiento (no toca red/economía/persistencia). */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ROOT=path.join(__dirname,'../..');
const src=fs.readFileSync(path.join(ROOT,'js/data/build-synergy.js'),'utf8');
const ctx=vm.createContext({});vm.runInContext(src,ctx);
const D=vm.runInContext('({SYN_CFG,SYN_ARCH,SYN_BRANCHES,SYN_CHAMPS})',ctx);
let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log('FAIL',m);}};
const B=D.SYN_BRANCHES;
ok(new Set(B.map(b=>b.id)).size===B.length,'ids únicos');
ok(D.SYN_CHAMPS.length===3,'tres campeones iniciales');
// cada (campeón, habilidad) tiene exactamente 2 ramas de arquetipo distinto -> decisión real
const groups={};for(const b of B)(groups[b.champ+':'+b.skill]=groups[b.champ+':'+b.skill]||[]).push(b);
for(const [k,g] of Object.entries(groups)){ok(g.length===2,k+' tiene 2 ramas');ok(new Set(g.map(x=>x.arch)).size===2,k+' arquetipos distintos');}
for(const c of D.SYN_CHAMPS){const a=new Set(B.filter(b=>b.champ===c).map(b=>b.arch));ok(a.size>=2,c+' cubre >=2 arquetipos');}
const archs=new Set(B.map(b=>b.arch));ok(['ofensiva','defensiva','control'].every(a=>archs.has(a)),'cubre ofensiva, defensiva y control');
// Banda de balance: la fuente de verdad es la simulación (sim-balance.js, piloto automático real).
// Se exige que los resultados correspondan EXACTAMENTE a los datos actuales (hash) y que ninguna rama domine.
const crypto=require('node:crypto');
const simF=path.join(ROOT,'docs/build-evolution/sim-results.json');
ok(fs.existsSync(simF),'existe docs/build-evolution/sim-results.json (correr sim-balance.js)');
if(fs.existsSync(simF)){const sim=JSON.parse(fs.readFileSync(simF,'utf8'));
 const h=crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,'js/data/build-synergy.js'))).digest('hex');
 ok(sim.dataSha256===h,'la simulación corresponde a los datos actuales (si cambiaste el balance, volvé a correr sim-balance.js)');
 const br=sim.summary.filter(s=>s.branch!=='base');
 ok(br.length===B.length,'la simulación cubre las '+B.length+' ramas ('+br.length+')');
 for(const s of br){ok(s.dmgVsBase<=15,s.branch+': daño vs base <= +15% ('+s.dmgVsBase+'%)');ok(s.dmgVsBase>=-10,s.branch+': daño vs base >= -10% ('+s.dmgVsBase+'%)');ok(s.underCeiling,s.branch+' bajo el techo por rol');ok(s.errors===0,s.branch+' sin errores');ok(s.survived===s.survived.split('/')[1]+'/'+s.survived.split('/')[1],s.branch+' sobrevive todas las partidas');}
 ok(sim.verdict.cpuOverheadPct<=10,'sobrecosto de CPU <= 10% ('+sim.verdict.cpuOverheadPct+'%)');
 console.log('simulación:',sim.seeds.length,'semillas x 150 s | rango de daño vs base: '+sim.verdict.minDmgPct+'% .. +'+sim.verdict.maxDmgGainPct+'% | CPU '+sim.verdict.cpuOverheadPct+'%');}
for(const b of B){
 ok(b.cdMult>=1&&b.cdMult<=1.2,b.id+' cdMult en [1,1.2]');
 ok(b.set&&b.set.id&&b.set.n>=2,b.id+' declara set');
 const words=b.text.split(/\s+/).length;ok(words<=22,b.id+' texto <=22 palabras ('+words+')');
 ok(/^[A-Za-z0-9_]+$/.test(b.id)&&b.fx&&Object.keys(b.fx).length>=1,b.id+' fx');
}
// tiempo de comprensión: lectura de una carta (nombre+texto+costo ~ palabras / 3 por s)
const secs=B.map(b=>(b.name.split(/\s+/).length+b.text.split(/\s+/).length+12)/3);
console.log('tiempo estimado de lectura por carta: máx '+Math.max(...secs).toFixed(1)+' s, media '+(secs.reduce((a,b)=>a+b,0)/secs.length).toFixed(1)+' s');
ok(Math.max(...secs)<=12,'lectura de carta <=12 s');
// aislamiento: el motor no toca red, economía ni persistencia
const eng=fs.readFileSync(path.join(ROOT,'js/systems/build-synergy.js'),'utf8');
for(const bad of ['localStorage','save\\.(brasas|gold|wallet)','fetch\\(','WebSocket','netSend','relay']) ok(!new RegExp(bad).test(eng),'motor sin '+bad);
ok(!/save\.champions\[[^\]]+\]\s*=/.test(eng),'motor no escribe el guardado');
console.log(fail?'\nFALLÓ ('+fail+')':'\nPASS ('+B.length+' ramas)');process.exit(fail?1:0);
