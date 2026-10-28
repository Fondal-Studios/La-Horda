'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {validateBundle}=require('./validate-delivery');
test('reject unknown jobs and unreviewed output',()=>{
 const result=validateBundle({jobs:[{id:'x',type:'champion'}],deliveries:[
  {job_id:'x',files:['sprite.png'],canon_reference:'canon.png',approved:true},
  {job_id:'y',files:['other.png']}
 ]});
 assert.equal(result.length,2);
 assert.ok(result[0].issues.includes('MISSING_REVIEWER'));
 assert.ok(result[1].issues.includes('UNKNOWN_JOB'));
});
test('valid metadata does not imply installed assets',()=>{
 assert.deepEqual(validateBundle({jobs:[{id:'x',type:'enemy'}],deliveries:[
  {job_id:'x',files:['a.png'],canon_reference:'canon.png',reviewed_by:'artist',approved:true}
 ]}),[]);
});
