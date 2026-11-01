'use strict';
const assert = require('node:assert/strict');
const plan = require('../../docs/design/hero-collection.v1.json');
const {loadRoster} = require('./load-roster');
function validate(p, roster) {
  assert.equal(p.schemaVersion,1);
  assert.equal(p.status,'proposal');
  assert.equal(p.runtimeEnabled,false,'This branch is a classification proposal, not a live grant migration');
  const ids = new Set(roster.heroes.map(h=>h.id));
  const founders = new Set(roster.heroes.filter(h=>h.category==='FOUNDER').map(h=>h.id));
  const categories = new Set(p.categories.map(c=>c.id));
  assert.equal(categories.size,p.categories.length,'Duplicate categories');
  assert.equal(p.heroes.length,ids.size,'Every registered hero needs one row');
  assert.equal(new Set(p.heroes.map(h=>h.id)).size,p.heroes.length,'Duplicate heroes');
  assert.equal(p.publicHeroCount,ids.size-founders.size);
  assert.equal(p.founderHeroCount,founders.size);
  assert.equal(p.starter.pool.length,10);
  assert.equal(new Set(p.starter.pool).size,10);
  assert.equal(p.starter.initialChoices,1);
  assert.equal(p.starter.recruitWinMilestones.length,9);
  p.starter.recruitWinMilestones.forEach((n,i)=>assert.ok(Number.isSafeInteger(n)&&n>0&&(!i||n>p.starter.recruitWinMilestones[i-1])));
  assert.deepEqual([...p.starter.pool].sort(),p.heroes.filter(h=>h.category==='iniciales').map(h=>h.id).sort());
  const sets = new Map(roster.sets.map(s=>[s.id,s]));
  const edges = new Map(p.heroes.map(h=>[h.id,new Set()]));
  function check(r, owner, isSkin=false, depth=0) {
    assert.ok(r && typeof r==='object' && depth<12,'Invalid requirement tree');
    const fields = new Set(['type']);
    if (r.type==='all' || r.type==='any') {
      fields.add('requirements');
      assert.ok(Array.isArray(r.requirements)&&r.requirements.length>0,'Empty requirement');
      r.requirements.forEach(x=>check(x,owner,isSkin,depth+1));
    } else if (r.type==='metric') {
      fields.add('key'); fields.add('target');
      const metric=p.metricContract[r.key];assert.ok(metric,'Unknown metric '+r.key);
      assert.ok(Number.isSafeInteger(r.target)&&r.target>0,'Invalid target');
      const dims={total:[],arena:['arena'],hero:['hero'],heroArena:['hero','arena'],difficulty:['difficulty']}[metric.shape];
      assert.ok(dims,'Unknown shape');
      for(const dim of dims){fields.add(dim);assert.equal(typeof r[dim],'string','Missing '+dim);}
      if(r.arena)assert.ok(roster.arenas.includes(r.arena),'Unknown arena '+r.arena);
      if(r.difficulty)assert.ok(['normal','pesadilla','infierno'].includes(r.difficulty),'Unknown difficulty');
      if(r.key==='campaignArenas'||r.key==='difficultyArenas')assert.ok(r.target<=roster.arenas.length,'Unreachable campaign');
      if(r.key==='arenaLevelCompleted')assert.ok(r.target<=10,'Arena has ten levels');
      if(r.key==='heroLevel')assert.ok(r.target<=99,'Hero max level is 99');
    } else if(r.type==='owned')fields.add('hero');
    else if(r.type==='set_complete') {
      fields.add('setId');assert.ok(isSkin,'A hero must not require its own equipment collection');
      assert.equal(sets.get(r.setId)?.champion,owner,'Skin set belongs to a different hero');
    } else if(r.type==='starter_choice')assert.ok(p.starter.pool.includes(owner),'Nonstarter using starter choice');
    else if(r.type==='entitlement')assert.ok(founders.has(owner),'Public hero requires founder access');
    else assert.fail('Unknown requirement '+r.type);
    for(const field of Object.keys(r))assert.ok(fields.has(field),'Unexpected requirement field '+field);
    if(r.hero){
      assert.ok(ids.has(r.hero),'Unknown prerequisite hero');
      assert.ok(!founders.has(r.hero),'Founder blocks public progression');
      if(!isSkin){assert.notEqual(r.hero,owner,'Self-locked hero');edges.get(owner).add(r.hero);}
    }
  }
  for(const h of p.heroes){
    assert.ok(ids.has(h.id),'Unknown hero '+h.id);assert.ok(categories.has(h.category));
    assert.equal(h.role,roster.heroes.find(x=>x.id===h.id).role,'Role drift');
    assert.equal(h.category==='fundadores',founders.has(h.id),'Founder classification changed');
    assert.ok(h.challenge&&h.designReason);check(h.requirement,h.id);
  }
  const visiting=new Set(),visited=new Set();
  function visit(id){
    assert.ok(!visiting.has(id),'Cyclic hero dependencies: '+id);
    if(visited.has(id))return;visiting.add(id);
    for(const dep of edges.get(id))visit(dep);
    visiting.delete(id);visited.add(id);
  }
  for(const id of ids)visit(id);
  for(const [rows,source,pending] of [[p.skins,roster.skins,false],[p.pendingSkinConcepts,roster.skinConcepts,true]]){
    const refs=new Map(source.map(s=>[s.registry+':'+s.id,s]));
    assert.equal(new Set(rows.map(s=>s.registry+':'+s.id)).size,rows.length,'Duplicate cosmetic');
    assert.equal(rows.length,refs.size,'Cosmetic coverage mismatch');
    for(const s of rows){
      const real=refs.get(s.registry+':'+s.id);assert.ok(real,'Unknown cosmetic');
      assert.equal(s.champion,real.champion);assert.equal(s.name,real.name);assert.equal(s.combatBonus,false);
      assert.ok(['coleccion','maestria','hazana','fundador'].includes(s.track));
      if(pending)assert.equal(s.activation,'blocked_until_art_and_runtime_validation');
      check(s.requirement,s.champion,true);
    }
  }
  for(const id of ids)assert.ok([...p.skins,...p.pendingSkinConcepts].some(s=>s.champion===id),'No cosmetic path for '+id);
  return {heroes:p.heroes.length,public:p.publicHeroCount,starters:p.starter.pool.length,registeredCosmetics:p.skins.length,pendingConcepts:p.pendingSkinConcepts.length};
}
module.exports = {validate};
if(require.main===module)console.log('COLLECTION PLAN PASS',validate(plan,loadRoster()));
