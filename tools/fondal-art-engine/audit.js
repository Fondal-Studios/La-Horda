#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {scanFiles,reconcile,rowsFrom,safePath}=require('./inventory');
const {sha}=require('./sheet-gate');
const root=path.resolve(__dirname,'../..');
function audit(){
 const files=scanFiles(root),byPath=new Map(),dynamic=[];
 const code=[...files].filter(p=>(p.startsWith('js/')||p.startsWith('css/')||p==='index.html')&&/\.(js|css|html)$/.test(p));
 for(const file of code){
  const text=fs.readFileSync(path.join(root,file),'utf8');
  for(const match of text.matchAll(/["'`](assets\/[^"'`\n]+)["'`]/g)){
   const target=safePath(match[1]);
   if(!target){dynamic.push({source:file,expression:match[1]});continue;}
   if(!byPath.has(target))byPath.set(target,new Set());byPath.get(target).add(file);
  }
 }
 const refs=[...byPath].map(([target,sources])=>({path:target,exists:files.has(target),consumers:[...sources].sort(),sha256:files.has(target)?sha(fs.readFileSync(path.join(root,target))):null})).sort((a,b)=>a.path.localeCompare(b.path));
 const historical=reconcile(rowsFrom(JSON.parse(fs.readFileSync(path.join(root,'docs/art-brief/manifiestos/mundo_faltantes.json')))),files);
 return {schema:'fondal-art-engine.audit.v1',generated_at:new Date().toISOString(),coverage:'all literal asset references in js/css/index; dynamic expressions require runtime audit; not artistic approval',filesScanned:files.size,codeFilesScanned:code.length,images:[...files].filter(p=>p.startsWith('assets/')&&/\.(png|webp|jpg|svg|gif)$/i.test(p)).length,literalReferences:refs.length,missingReferences:refs.filter(r=>!r.exists).length,dynamicReferences:dynamic.length,refs,dynamic,historical};
}
if(require.main===module){const out=process.argv[2];if(!out)throw Error('Usage: audit.js output.json');const result=audit();fs.mkdirSync(path.dirname(path.resolve(out)),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(Object.fromEntries(Object.entries(result).filter(([k])=>!['refs','dynamic','historical'].includes(k)))));}
module.exports={audit};
