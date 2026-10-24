const H=require(process.cwd()+'/tools/lib/serve');
(async()=>{const s=await H.startSite();const p=require('node:child_process').spawn(process.execPath,['tools/expedition/functional.js'],{env:{...process.env,ENTRY_BASE_URL:s.url},stdio:'inherit'});p.on('exit',async c=>{await s.close();process.exitCode=c;});})();
