#!/usr/bin/env node
// Fondal Art Engine — read-only reconciliation; Node >=18, no dependencies.
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const source='docs/art-brief/manifiestos/mundo_faltantes.json';
const input=path.join(root,source);
const ignored=new Set(['.git','node_modules','.cache','dist','coverage']);
const extensions=/\.(png|webp|gif|svg|ase|aseprite|jpg|jpeg)$/i;
function rowsFrom(doc){
 if(Array.isArray(doc))return doc;
 if(doc&&typeof doc==='object'){
  for(const k of ['rows','items','assets','entries','filas','registros','faltantes','records']){
   if(Array.isArray(doc[k]))return doc[k];
  }
  const arrays=Object.entries(doc).filter(([,v])=>Array.isArray(v));
  if(arrays.length===1)return arrays[0][1];
 }
 throw Error('Unknown manifest schema: no unambiguous records array; inspect source manually');
}
function safePath(value){
 if(typeof value!=='string')return null;
 const p=value.trim().replace(/\\/g,'/').replace(/^\.\//,'');
 if(!p||p.startsWith('/')||p.includes('://')||p.split('/').includes('..')||/^[a-z]:/i.test(p)||!extensions.test(p))return null;
 return path.posix.normalize(p);
}
function pathsFrom(row){
 if(!row||typeof row!=='object')return [];
 const keys=['path','ruta','file','filename','asset_path','output','destino','archivo','asset','png','target','ruta_destino'];
 const values=keys.flatMap(k=>Array.isArray(row[k])?row[k]:[row[k]]);
 return [...new Set(values.map(safePath).filter(Boolean))];
}
function scanFiles(dir,rel='',out=new Set()){
 for(const e of fs.readdirSync(dir,{withFileTypes:true})){
  if(ignored.has(e.name))continue;
  const p=path.join(dir,e.name),r=path.posix.join(rel,e.name);
  if(e.isSymbolicLink())continue;
  if(e.isDirectory())scanFiles(p,r,out);else if(e.isFile())out.add(r);
 }
 return out;
}
function reconcile(rows,files){
 const records=rows.map((raw,index)=>{
  const row=raw&&typeof raw==='object'?raw:{value:raw};
  const paths=pathsFrom(row),existing=paths.filter(p=>files.has(p));
  const status=!paths.length?'UNVERIFIED':existing.length===paths.length?'PATH_EXISTS':'PATH_MISSING';
  return {index,id:row.id??row.ID??null,priority:row.prioridad??row.priority??null,status,paths,existing};
 });
 const counts={PATH_EXISTS:0,PATH_MISSING:0,UNVERIFIED:0};
 for(const row of records)counts[row.status]++;
 return {records,counts};
}
function main(){
 const bytes=fs.readFileSync(input),rows=rowsFrom(JSON.parse(bytes.toString('utf8')));
 const {records,counts}=reconcile(rows,scanFiles(root));
 const report={schema:'fondal-art-engine.inventory.v2',source,source_sha256:crypto.createHash('sha256').update(bytes).digest('hex'),generated_at:new Date().toISOString(),total:records.length,counts,records};
 const md=['# Fondal Art Engine — reconciliación de rutas','',`Fuente: \`${source}\``,`Registros: ${rows.length}`,'',...Object.entries(counts).map(([k,v])=>`- ${k}: ${v}`),'','PATH_EXISTS no implica aprobación visual. PATH_MISSING puede indicar una ruta propuesta o desactualizada. UNVERIFIED requiere cotejo manual.',''];
 const i=process.argv.indexOf('--out');
 if(i>=0){
  if(!process.argv[i+1])throw Error('Expected output directory after --out');
  const dest=path.resolve(process.cwd(),process.argv[i+1]);
  fs.mkdirSync(dest,{recursive:true});
  fs.writeFileSync(path.join(dest,'inventory.json'),JSON.stringify(report,null,2)+'\n');
  fs.writeFileSync(path.join(dest,'inventory.md'),md.join('\n'));
  console.log('Reports written to '+dest);
 }else console.log(md.join('\n'));
}
if(require.main===module){
 try{main()}catch(e){console.error('Art inventory failed:',e.message);process.exitCode=2}
}
module.exports={rowsFrom,safePath,pathsFrom,reconcile};
