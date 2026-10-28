#!/usr/bin/env node
'use strict';
// Direct independent pilot; uses the same repair execution as the persisted queue.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {plan}=require('../../server/art-factory'),{execute}=require('./worker'),{prepare}=require('./bfl-repair');
async function main(){
 const target=process.argv[2]||'morveth',root=process.env.FONDAL_ART_OUTPUT;
 if(!root||!path.isAbsolute(root))throw Error('Set persistent absolute FONDAL_ART_OUTPUT');
 const job={...plan('Reparar '+target)[0],id:crypto.randomUUID()};prepare(job);
 fs.mkdirSync(root,{recursive:true});
 if(!process.env.BFL_API_KEY){console.log(JSON.stringify({status:'BLOCKED_CREDENTIAL',target,requiredSecret:'BFL_API_KEY',spent_usd:0}));process.exitCode=2;return;}
 const result=await execute(job,{root,profile:{provider:'bfl-klein-trial'}});
 fs.writeFileSync(path.join(root,job.id+'.receipt.json'),JSON.stringify({id:job.id,result},null,2)+'\n');console.log(JSON.stringify(result));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
