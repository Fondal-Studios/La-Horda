#!/usr/bin/env node
'use strict';
// One command submits persistent work. Operator token is an existing account session, never a CLI argument.
const crypto=require('node:crypto');
(async()=>{
 const command=process.argv.slice(2).join(' ');if(command.length<5)throw Error('Usage: node tools/fondal-art-engine/command.js "Reparar los últimos campeones"');
 const base=new URL(process.env.FONDAL_ART_API||'http://127.0.0.1:8787');
 if(base.protocol!=='https:'&&!(base.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(base.hostname)))throw Error('Use HTTPS or loopback');
 if(base.username||base.password||base.search||base.hash)throw Error('Invalid API URL');
 const token=process.env.FONDAL_ART_OPERATOR_TOKEN;if(!token)throw Error('Authenticate through Game Master or configure FONDAL_ART_OPERATOR_TOKEN as a private environment variable');
 const requestId=process.env.FONDAL_ART_REQUEST_ID||crypto.randomUUID();
 const r=await fetch(base.href.replace(/\/$/,'')+'/api/gm/art/command',{method:'POST',redirect:'error',signal:AbortSignal.timeout(30000),headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify({command,requestId})});
 const j=await r.json();if(!r.ok)throw Error(j.msg||j.error||'Command failed');console.log(JSON.stringify({requestId,...j},null,2));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
