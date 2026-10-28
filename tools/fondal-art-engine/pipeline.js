#!/usr/bin/env node
'use strict';
// Safe production orchestrator: plans jobs and validates delivered assets.
// Never writes into game assets or calls a paid API.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {rowsFrom,pathsFrom}=require('./inventory');
const root=path.resolve(__dirname,'../..');
const manifest=path.join(root,'docs/art-brief/manifiestos/mundo_faltantes.json');
const allowed=new Set(['champion','skin','enemy','boss','summon','map','prop','vfx','ui','other']);
function classify(r){
 const s=String(r.subcategoria||r.type||r.description||r.descripcion||r.asset||'').toLowerCase();
 if(/skin|croma/.test(s))return 'skin';
 if(/fx|efecto|proyectil|decal|aura/.test(s))return 'vfx';
 if(/icon|ícono|interfaz|hud|ui|retrato|ilustracion|carta|marco/.test(s))return 'ui';
 if(/jefe|boss/.test(s))return 'boss';
 if(/enemigo|enemy/.test(s))return 'enemy';
 if(/invocaci[oó]n|summon/.test(s))return 'summon';
 if(/campe[oó]n|champion/.test(s))return 'champion';
 if(/mapa|arena|tileset|suelo/.test(s))return 'map';
 if(/prop|objeto|estructura|item/.test(s))return 'prop';
 return 'other';
}
function makeJobs(rows){
 return rows.map((r,i)=>{
  const id=String(r.id??r.ID??('row-'+i)).replace(/[^\w.-]/g,'_').slice(0,90);
  const type=classify(r),paths=pathsFrom(r);
  const priority=String(r.priority??r.prioridad??'UNSPECIFIED').toUpperCase();
  return {id,index:i,type,priority,source_paths:paths,reference_required:true,
   output_policy:type==='champion'||type==='enemy'||type==='boss'?'COMPLETE_CANON_SHEET':'TYPE_SPECIFIC',
   status:'NEEDS_RECONCILIATION',provider:'unassigned',estimated_cost:null,
   gate:['canonical-reference','technical','visual','originality','runtime']};
 });
}
function validateDelivery(job,delivery){
 const problems=[];
 if(!allowed.has(job.type))problems.push('INVALID_TYPE');
 if(!delivery||typeof delivery!=='object')return ['NO_DELIVERY'];
 if(delivery.job_id!==job.id)problems.push('JOB_ID_MISMATCH');
 if(!Array.isArray(delivery.files)||delivery.files.length===0)problems.push('NO_FILES');
 if(!delivery.canon_reference)problems.push('MISSING_CANON_REFERENCE');
 if(delivery.approved===true&&!delivery.reviewed_by)problems.push('MISSING_REVIEWER');
 return problems;
}
function main(){
 const args=process.argv,output=args[args.indexOf('--out')+1];
 if(!args.includes('--out')||!output||output.startsWith('--'))throw Error('Use --out <directory>');
 const raw=JSON.parse(fs.readFileSync(manifest,'utf8')),rows=rowsFrom(raw);
 const jobs=makeJobs(rows);
 const dir=path.resolve(process.cwd(),output);
 if(dir===root||dir===path.parse(dir).root)throw Error('Refusing unsafe output directory');
 fs.mkdirSync(dir,{recursive:true});
 const plan={schema:'fondal-art-engine.jobs.v1',generated_at:new Date().toISOString(),
  manifest_sha256:crypto.createHash('sha256').update(fs.readFileSync(manifest)).digest('hex'),
  mode:'DRY_RUN_ONLY',count:jobs.length,jobs};
 fs.writeFileSync(path.join(dir,'jobs.json'),JSON.stringify(plan,null,2)+'\n');
 const counts={};for(const j of jobs)counts[j.type]=(counts[j.type]||0)+1;
 fs.writeFileSync(path.join(dir,'summary.md'),
  '# Fondal Art Engine — plan sin ejecución\n\n'+
  'Trabajos candidatos: '+jobs.length+'\n\n'+Object.entries(counts).map(([k,v])=>'- '+k+': '+v).join('\n')+
  '\n\nNingún trabajo se envió a proveedores ni se instaló en el juego. Reconciliar contra archivos reales antes de generar.\n');
 console.log('Dry-run planned '+jobs.length+' candidate jobs at '+dir);
}
if(require.main===module){try{main()}catch(e){console.error(e.message);process.exitCode=2}}
module.exports={classify,makeJobs,validateDelivery};
