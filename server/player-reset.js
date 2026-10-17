"use strict";
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const entitlements=require('./entitlements');
function fresh(){
  // Use the game's canonical defaults, never a client-supplied reset payload.
  const src=fs.readFileSync(path.join(__dirname,'../js/storage/save.js'),'utf8').split('let save = defaultSave();')[0];
  const ctx={result:null,CHAMPION_CATALOG:entitlements.taxonomy().ids.map(id=>({id,unlockedByDefault:false}))};
  vm.createContext(ctx);vm.runInContext(src+';result=defaultSave();',ctx,{timeout:1000});
  const data=JSON.parse(JSON.stringify(ctx.result));
  data.resetGeneration=crypto.randomUUID();data.starterTrioV1=[];data.starterTrioActive=true;
  return data;
}
function validWrite(current,incoming){
  if(current?.resetGeneration && incoming.resetGeneration!==current.resetGeneration)return false;
  const prev=current?.starterTrioV1||[],next=incoming.starterTrioV1||[];
  if(!Array.isArray(next)||next.length>3||new Set(next).size!==next.length)return false;
  if(prev.some((id,i)=>next[i]!==id))return false;
  if(next.some(id=>!entitlements.isChampion(id)||!entitlements.taxonomy().meta(id).starterEligible))return false;
  // Existing accounts cannot mint a trio without taking the one-time reset.
  if(!prev.length&&next.length&&current&&!current.starterTrioActive&&Object.values(current.champions||{}).some(c=>c.unlocked))return false;
  return true;
}
module.exports={fresh,validWrite};
