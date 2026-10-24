'use strict';
const H=require('../lib/serve'),fs=require('node:fs'),{spawn}=require('node:child_process');
(async()=>{const site=await H.startSite();try{const code=await new Promise(r=>{const p=spawn(process.execPath,['tools/ascension/functional.js'],{env:{...process.env,ENTRY_BASE_URL:site.url},stdio:'inherit'});p.on('exit',r);});fs.copyFileSync('docs/founders/functional-results.json','art-source/entregas/facu-gm-kit-20261023/primera-pasada-01/ascension-functional.json');process.exitCode=code;}finally{await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
