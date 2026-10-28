#!/usr/bin/env node
// Fondal Art Engine: read-only inventory reconciliation. Node >=18, no dependencies.
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const source='docs/art-brief/manifiestos/mundo_faltantes.json';
const input=path.join(root,source);
if(!fs.existsSync(input)){console.error('Missing '+source);process.exit(2)}
const raw=JSON.parse(fs.readFileSync(input,'utf8'));
const rows=Array.isArray(raw)?raw:Object.values(raw).find(v=>Array.isArray(v));
if(!rows){console.error('Manifest must contain an array');process.exit(2)}
const ignored=new Set(['.git','node_modules','.cache','dist','coverage']);
const all=new Set();
function walk(dir,rel=''){
 for(const e of fs.readdirSync(dir,{withFileTypes:true})){
  if(ignored.has(e.name))continue;
  const r=path.posix.join(rel,e.name),p=path.join(dir,e.name);
  if(e.isDirectory())walk(p,r);else if(e.isFile())all.add(r);
 }
}
walk(root);
const keys=['path','ruta','file','filename','asset_path','output','destino','archivo'];
const records=rows.map((row,i)=>{
 const obj=row&&typeof row==='object'?row:{value:row};
 const candidates=keys.flatMap(k=>typeof obj[k]==='string'?[obj[k]]:[])
  .map(s=>s.replace(/\\/g,'/').replace(/^\.\//,''))
  .filter(s=>!s.includes('..')&&!path.posix.isAbsolute(s)&&/\.(png|webp|gif|json|svg)$/i.test(s));
 const present=candidates.filter(s=>all.has(s));
 return {index:i,id:obj.id||obj.ID||null,priority:obj.prioridad||obj.priority||null,
  status:!candidates.length?'UNVERIFIED':present.length===candidates.length?'PRESENT':'MISSING_PATH',
  paths:candidates,existing:present};
});
const counts={};for(const r of records)counts[r.status]=(counts[r.status]||0)+1;
const result={schema:'fondal-art-engine.inventory.v1',source,source_sha256:crypto.createHash('sha256').update(fs.readFileSync(input)).digest('hex'),generated_at:new Date().toISOString(),total:records.length,counts,records};
const json=JSON.stringify(result,null,2)+'\n';
const md=['# Fondal Art Engine — inventario (solo lectura)','',`Fuente: \`${source}\``,`Registros: ${records.length}`,'',...Object.entries(counts).map(([k,v])=>`- ${k}: ${v}`),'','**PRESENT solo significa que existe la ruta, no que el arte esté aprobado.**','**UNVERIFIED requiere inspección del esquema o verificación manual.**',''];
const out=process.argv.indexOf('--out');
if(out>=0&&process.argv[out+1]){
 const dest=path.resolve(process.cwd(),process.argv[out+1]);fs.mkdirSync(dest,{recursive:true});
 fs.writeFileSync(path.join(dest,'inventory.json'),json);
 fs.writeFileSync(path.join(dest,'inventory.md'),md.join('\n'));
 console.log('Written '+dest);
}else{console.log(md.join('\n'));console.log('Use --out <directory> to save JSON and Markdown.')}
