#!/usr/bin/env node
'use strict';
// Validates delivery metadata, never installs unapproved files.
const fs=require('node:fs'),path=require('node:path');
const {validateDelivery}=require('./pipeline');
function validateBundle(bundle){
 const errors=[];
 if(!bundle||!Array.isArray(bundle.jobs)||!Array.isArray(bundle.deliveries))return ['INVALID_BUNDLE'];
 if(!bundle.jobs.length)return ['EMPTY_BUNDLE'];
 const byId=new Map();const delivered=new Set();
 for(const j of bundle.jobs){
  if(!j||typeof j.id!=='string'||!j.id)return ['INVALID_JOB'];
  if(byId.has(j.id))errors.push({job_id:j.id,issues:['DUPLICATE_JOB']});
  byId.set(j.id,j);
 }
 for(const d of bundle.deliveries){
  if(!d||typeof d!=='object'){errors.push({issues:['INVALID_DELIVERY']});continue;}
  if(delivered.has(d.job_id))errors.push({job_id:d.job_id,issues:['DUPLICATE_DELIVERY']});
  delivered.add(d.job_id);
  const job=byId.get(d.job_id);
  if(!job){errors.push({job_id:d.job_id,issues:['UNKNOWN_JOB']});continue}
  const issues=validateDelivery(job,d);
  if(issues.length)errors.push({job_id:d.job_id,issues});
 }
 for(const id of byId.keys())if(!delivered.has(id))errors.push({job_id:id,issues:['MISSING_DELIVERY']});
 return errors;
}
if(require.main===module){
 try{
  const file=process.argv[2];if(!file)throw Error('Usage: node validate-delivery.js <bundle.json>');
  const errors=validateBundle(JSON.parse(fs.readFileSync(path.resolve(file),'utf8')));
  console.log(JSON.stringify({ok:errors.length===0,errors},null,2));
  if(errors.length)process.exitCode=1;
 }catch(e){console.error(e.message);process.exitCode=2}
}
module.exports={validateBundle};
