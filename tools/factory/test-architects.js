'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const art=require('./architect-art'),game=require('./architect-game');
test('architect-art rejects staging without receipt or atlas',()=>{
  const d=fs.mkdtempSync(path.join(path.resolve(__dirname,'../..'),'tmp-staging-')),id='tmp_x';
  const sub=path.join(d,id);fs.mkdirSync(sub);
  try{assert.ok(art.plan(path.relative(path.resolve(__dirname,'../..'),sub)).errors.length>0);}finally{fs.rmSync(d,{recursive:true,force:true});}
});
test('architect-art refuses staging outside repo',()=>assert.throws(()=>art.plan('../../etc')));
test('architect-game blocks unresolvable ref',()=>assert.equal(game.analyze('no-such-ref-xyz').verdict,'BLOCKED'));
test('architect-game rules: knownChampions and secrets block',()=>{
  const base={files:[],addedText:'',bigAssets:[]};
  const hit=id=>game.RULES.find(r=>r.id===id).test({...base,...{addedText:id==='secrets'?'apiKey = "abcdefghijklmnopqrstuvwxyz"':'knownChampions.push("x")'}});
  assert.ok(hit('knownChampions'));assert.ok(hit('secrets'));
});
