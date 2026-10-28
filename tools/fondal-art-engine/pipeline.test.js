'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {makeJobs,validateDelivery}=require('./pipeline');
const {getProvider}=require('./providers');
test('plans without approving assets',()=>{
 const jobs=makeJobs([{id:'boss-1',description:'jefe de arena',priority:'P0'}]);
 assert.equal(jobs.length,1);
 assert.equal(jobs[0].type,'boss');
 assert.equal(jobs[0].output_policy,'COMPLETE_CANON_SHEET');
 assert.equal(jobs[0].status,'NEEDS_RECONCILIATION');
});
test('rejects unreviewed or incomplete delivery',()=>{
 const job=makeJobs([{id:'champ-1',description:'campeón'}])[0];
 assert.ok(validateDelivery(job,{job_id:job.id,files:[],approved:true}).includes('NO_FILES'));
 assert.ok(validateDelivery(job,{job_id:job.id,files:['x.png'],approved:true,canon_reference:'a.png'}).includes('MISSING_REVIEWER'));
});
test('no paid provider is silently selected',async()=>{
 assert.throws(()=>getProvider('pixellab'),/not configured/);
 const p=getProvider();
 const result=await p.generate({id:'a'});
 assert.equal(result.status,'NOT_GENERATED');
});
