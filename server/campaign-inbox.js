'use strict';
// Durable relay outcomes. This does not validate combat: the existing host remains authoritative.
// Results survive room/host closure; account identity or a private random capability owns the inbox.
const crypto=require('node:crypto');
const KEY=/^[a-f0-9]{64}$/;
function create({getStore,ready,send}){
 const state=raw=>{const s=raw||require('./game-master').stateOf(null);s.campaignInbox=s.campaignInbox||{};return s;};
 async function mutate(fn){await ready;return getStore().gmUpdate(async raw=>{const s=state(raw);return {state:s,value:await fn(s.campaignInbox)};});}
 const key=ws=>ws._identity?.userId ? 'user:'+ws._identity.userId : ws._campaignKey;
 async function handle(ws,m){
  if(!['reward-open','reward-get','reward-ack'].includes(m.t))return false;
  if(m.t==='reward-open'){
   if(!KEY.test(m.key||''))return true;
   ws._campaignKey='anon:'+crypto.createHash('sha256').update(m.key).digest('hex');
  }
  const k=key(ws);if(!k)return true;
  const result=await mutate(db=>{
   const box=db[k]||{};
   if(m.t==='reward-ack'){if(box[m.id])box[m.id].acknowledged=true;return {t:'reward-list',ids:Object.keys(box)};}
   if(m.t==='reward-get')return box[m.id]?{t:'reward-result',result:box[m.id]}:{t:'reward-list',ids:Object.keys(box)};
   return {t:'reward-list',ids:Object.keys(box)};
  });send(ws,result);return true;
 }
 async function start(room){
  const members=room.slots.map(m=>m&&m.ws?key(m.ws):null);
  const ok=await mutate(db=>members.every(k=>!k||Object.values(db[k]||{}).filter(r=>!r.acknowledged).length<20));
  if(!ok)return false;
  room.campaign={id:crypto.randomUUID(),members,start:null,committed:false};return true;
 }
 function capture(room,d){
  const c=room.campaign;if(!c||d?.k!=='start')return;
  d.rewardRunId=c.id;
  if(!c.start)c.start={arena:d.arena,seed:d.seed,diff:d.diff,lay:d.lay,slots:d.slots,rewardRunId:c.id};
 }
 async function finish(room,d){
  const c=room.campaign;
  if(!c||!c.start||d?.k!=='end'||!d.victory||d.lanes||c.committed)return;
  // Never forward success before the durable write succeeds. Retried end is idempotent.
  await mutate(db=>{
   c.members.forEach((k,slot)=>{
    if(!k||slot===0)return;
    const box=db[k]||(db[k]={});
    if(!box[c.id])box[c.id]={id:c.id,slot,start:c.start,end:d,at:Date.now()};
   });
  });c.committed=true;
 }
 return {handle,start,capture,finish};
}
module.exports={create};
