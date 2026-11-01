#!/usr/bin/env node
"use strict";
// Read-only recovery audit: detect atlases which are preloaded but not explicitly
// referenced by runtime JavaScript. This is a candidate list, not proof of disuse.
const fs=require("fs"),path=require("path");
const root=path.resolve(__dirname,"../..");
function walk(dir,out=[]){if(!fs.existsSync(dir))return out;for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p,out);else out.push(p)}return out}
const runtime=walk(path.join(root,"js")).filter(p=>p.endsWith(".js")&&!/asset-manifest\.js$|asset-webp\.js$/.test(p));
const sources=runtime.map(p=>({path:path.relative(root,p),text:fs.readFileSync(p,"utf8")}));
const assets=walk(path.join(root,"assets/sprites/champions")).filter(p=>/atlas\.png$/.test(p));
const results=assets.map(p=>{const rel=path.relative(root,p).replace(/\\/g,"/");const hits=sources.filter(s=>s.text.includes(rel)).map(s=>s.path);return {asset:rel,explicitRuntimeReferences:hits,needsDynamicTrace:hits.length===0}});
const report={schemaVersion:1,warning:"Static references only. Dynamic path builders and runtime selection require browser tracing; zero references is not proof of unused art.",totalChampionAtlases:results.length,needsDynamicTrace:results.filter(x=>x.needsDynamicTrace).length,results};
process.stdout.write(JSON.stringify(report,null,2)+"\n");
