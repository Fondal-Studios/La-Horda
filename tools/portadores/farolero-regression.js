'use strict';
const {spawn}=require('node:child_process'),fs=require('node:fs'),H=require('../lib/serve');
(async()=>{const site=await H.startSite();try{const c=spawn(process.execPath,['tools/expedition/functional.js'],{env:{...process.env,ENTRY_BASE_URL:site.url},stdio:'inherit'});const code=await new Promise(r=>c.on('exit',r));fs.copyFileSync('docs/expedition/functional-results.json','art-source/entregas/farolero-kit-20261023/primera-pasada-01/regression.json');process.exitCode=code;}finally{await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
