'use strict';
/* Puntuador de skins premium. Aplica la rúbrica de 100 puntos SOLO en lo medible por máquina y NUNCA inventa
   puntuaciones artísticas: sin assets reales el estado es NOT_PRODUCED y la nota es null. La nota artística
   (coherencia 25, sprites/animación 25, legibilidad 20, identidad 15) exige un evaluador independiente.
   Aprobación: >= 90/100 y 0 defectos críticos. Uso: node tools/skin-factory/score.js */
const fs=require('node:fs'),path=require('node:path');const ROOT=path.join(__dirname,'../..'),dir=path.join(ROOT,'docs/skin-factory/manifests');
let fail=0;const rows=[];
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.json'))){const m=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
 const missing=Object.entries(m.assets).filter(([k,a])=>a.status!=='WRITTEN'&&!(a.path&&fs.existsSync(path.join(ROOT,a.path))));
 const produced=Object.keys(m.assets).length-missing.length;
 const c=m.constraints;const cons=c.stats===false&&c.damage===false&&c.range===false&&c.hitbox===false&&c.cooldown===false;
 if(!cons){fail++;console.log('FAIL',m.skin,'viola restricciones cosméticas');}
 const approvable=missing.length===0&&m.status==='READY_FOR_QA';
 rows.push({skin:m.skin,tier:m.tier,status:missing.length?'NOT_PRODUCED':m.status,assets:`${produced}/${Object.keys(m.assets).length}`,score:null,approved:false,reason:missing.length?`faltan: ${missing.map(x=>x[0]).join(', ')}`:(approvable?'pendiente de evaluador independiente':'estado '+m.status)});
 if(m.status==='APPROVED'&&missing.length){fail++;console.log('FAIL',m.skin,'declarada APPROVED con assets ausentes');}}
console.table(rows);console.log(fail?'FALLÓ':'PASS (ninguna skin se declara terminada sin assets reales)');process.exit(fail?1:0);
