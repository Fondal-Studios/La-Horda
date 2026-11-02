'use strict';
/* Verificación posterior de la cola de prioridades (docs/art-factory/ASSET_PRIORITY_QUEUE.json), pensada para correr cuando haya más créditos o tras cada PR de arte.
 *   node tools/factory/audit/verify-queue.js [--rescan] [--fail-on P0]
 * Sin red ni gasto. Por cada ítem compara los hashes del atlas y del preview con los de la auditoría:
 *   - 'sin_cambios'   → sigue pendiente con la misma prioridad.
 *   - 'cambiado'      → el activo fue reemplazado: hay que RE-REVISAR (no se da por resuelto solo por haber cambiado).
 *   - 'archivo_ausente'→ el activo desapareció (crítico).
 * Con --rescan vuelve a volcar los activos del juego (dump-assets.js) y a calcular métricas para detectar flags nuevos.
 * Imprime el trabajo que falta ordenado por prioridad con el costo estimado; sale con código 1 si queda algún ítem pendiente en --fail-on (por defecto P0). */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const ROOT=path.resolve(__dirname,'../../..'),Q=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/art-factory/ASSET_PRIORITY_QUEUE.json'),'utf8'));
const argv=process.argv.slice(2),failOn=(argv.includes('--fail-on')?argv[argv.indexOf('--fail-on')+1]:'P0');
const sha=p=>{try{return crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,p))).digest('hex');}catch(e){return null;}};
const ORDER=['P0','P1','P2','P3','P4'];
let newFlags={};
if(argv.includes('--rescan')){
  const tmp=fs.mkdtempSync('/tmp/verify-queue-');
  cp.execFileSync('node',[path.join(__dirname,'dump-assets.js')],{env:{...process.env,OUT:tmp},stdio:'inherit',cwd:ROOT});
  cp.execFileSync('python3',[path.join(__dirname,'asset-metrics.py'),tmp,tmp+'/metrics.json'],{stdio:'inherit',cwd:ROOT});
  const m=JSON.parse(fs.readFileSync(tmp+'/metrics.json','utf8'));for(const [id,v] of Object.entries(m))newFlags[id]=v.flags;
}
const out=[];let pendingFail=0,changed=0,missing=0,cost=0;
for(const it of Q.items){
  const a=it.surfaces.in_game.atlas,pv=it.surfaces.store.preview;
  const ha=a?sha(a):null,hp=pv?sha(pv):null;let st='sin_cambios';
  if((a&&!ha)||(pv&&!hp)) st='archivo_ausente';
  else if((a&&ha!==it.surfaces.in_game.atlas_sha256)||(pv&&hp!==it.surfaces.store.preview_sha256)) st='cambiado';
  if(st==='cambiado')changed++; if(st==='archivo_ausente')missing++;
  const nf=newFlags[it.id]?newFlags[it.id].filter(f=>!it.auto_flags.includes(f)):[];
  const pr=ORDER.indexOf(it.priority),open=pr>=0&&(!it.status.startsWith('integrado')||pr<=1);
  if(open){cost+=it.production.est_credits_gen4_image_720p||0;if(ORDER.indexOf(it.priority)<=ORDER.indexOf(failOn)&&st!=='cambiado')pendingFail++;}
  out.push({prio:it.priority,id:it.id,type:it.type,status:it.status,verif:st,nuevos_flags:nf,fix:it.review.recommended_fix});
}
const pri=p=>ORDER.indexOf(p)<0?9:ORDER.indexOf(p);out.sort((x,y)=>pri(x.prio)-pri(y.prio));
for(const r of out.filter(r=>ORDER.includes(r.prio)))console.log(`${r.prio} ${r.type.padEnd(5)} ${r.id.padEnd(26)} ${r.verif.padEnd(14)} ${r.status.padEnd(26)} ${r.fix||''}${r.nuevos_flags.length?'  NUEVOS:'+r.nuevos_flags.join(','):''}`);
console.log(`\nítems=${Q.items.length} cambiados=${changed} ausentes=${missing} pendientes<=${failOn}: ${pendingFail} · créditos estimados de lo abierto (gen4_image 720p): ${cost}`);
if(changed)console.log('NOTA: los ítems "cambiado" requieren re-revisión visual independiente; esta herramienta no los da por resueltos.');
process.exitCode=(pendingFail>0||missing>0)?1:0;
