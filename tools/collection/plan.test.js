'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const plan = require('../../docs/design/hero-collection.v1.json');
const {loadRoster} = require('./load-roster');
const {validate} = require('./validate-plan');
const {evaluate,recruitmentChoices} = require('./model');
const roster=loadRoster();
const rule=id=>plan.heroes.find(h=>h.id===id).requirement;
test('all 43 real heroes, ten starters and all discovered cosmetic references are classified',()=>{
  assert.deepEqual(validate(plan,roster),{heroes:43,public:41,starters:10,registeredCosmetics:82,pendingConcepts:16});
  const roles=new Set(plan.heroes.filter(h=>plan.starter.pool.includes(h.id)).map(h=>h.role));
  assert.deepEqual([...roles].sort(),['asesino','mago','soporte','tanque']);
});
test('one initial choice, nine earned choices, no duplication or required gold',()=>{
  assert.equal(recruitmentChoices(plan).available,1);
  const one={campaignWins:0,claims:1,ownedHeroes:{tanque:true}};
  assert.equal(recruitmentChoices(plan,one).available,0);
  assert.equal(recruitmentChoices(plan,{...one,campaignWins:1}).available,1);
  assert.equal(recruitmentChoices(plan,{...one,campaignWins:20}).available,9);
  assert.ok(!recruitmentChoices(plan,one).eligible.includes('tanque'));
  assert.equal(recruitmentChoices(plan,{campaignWins:100,ownedHeroes:Object.fromEntries(plan.starter.pool.map(id=>[id,true]))}).available,0);
});
test('kill thresholds use totals with exact boundaries and reject malformed evidence',()=>{
  for(const [v,done] of [[499,false],[500,true],[5000,true],[-1,false],[Infinity,false],['500',false]])
    assert.equal(evaluate(rule('musashi'),{metrics:{kills:v}}).done,done);
});
test('linked hero requires ownership AND a victory by the exact hero in the exact arena',()=>{
  assert.equal(evaluate(rule('myla'),{ownedHeroes:{ynara:true},metrics:{heroWins:{ynara:50},arenaWins:{bosque:50}}}).done,false);
  assert.equal(evaluate(rule('myla'),{ownedHeroes:{ynara:true},metrics:{heroArenaWins:{ynara:{ciudad:1},soporte:{bosque:1}}}}).done,false);
  assert.equal(evaluate(rule('myla'),{metrics:{heroArenaWins:{ynara:{bosque:1}}}}).done,false);
  assert.equal(evaluate(rule('myla'),{ownedHeroes:{ynara:true},metrics:{heroArenaWins:{ynara:{bosque:1}}}}).done,true);
});
test('solo alternative is sufficient; no failed run resets the design counter',()=>{
  assert.equal(evaluate(rule('bront'),{metrics:{soloArenaWins:{fortaleza:5}}}).done,true);
  assert.equal(evaluate(rule('bront'),{metrics:{coopWins:3}}).done,true);
  assert.equal(evaluate(rule('bront'),{metrics:{coopWins:2,soloArenaWins:{fortaleza:4}}}).done,false);
});
test('arena survival and campaign ending are not confused with hero level or entering the final',()=>{
  assert.equal(evaluate(rule('zahra'),{metrics:{heroLevel:{mago:99},arenaBestLevel:{infernal:7}}}).done,false);
  assert.equal(evaluate(rule('zahra'),{metrics:{arenaLevelCompleted:{infernal:7}}}).done,true);
  assert.equal(evaluate(rule('aurelia'),{metrics:{arenaWins:{infernal:1},campaignArenas:1}}).done,false);
  assert.equal(evaluate(rule('aurelia'),{metrics:{campaignArenas:10}}).done,true);
  assert.equal(evaluate(rule('libertador'),{metrics:{campaignArenas:10,distinctHeroesArena:{infernal:2}}}).done,false);
  assert.equal(evaluate(rule('libertador'),{metrics:{campaignArenas:10,distinctHeroesArena:{infernal:3}}}).done,true);
});
test('skin ownership requires the matching hero and completed set',()=>{
  const skin=plan.skins.find(s=>s.id==='merienda_magica'&&s.registry==='SET_SKINS');
  assert.equal(evaluate(skin.requirement,{completedSets:{merienda_magica:true}}).done,false);
  assert.equal(evaluate(skin.requirement,{ownedHeroes:{myla:true},completedSets:{santa_paciencia:true}}).done,false);
  assert.equal(evaluate(skin.requirement,{ownedHeroes:{myla:true},completedSets:{merienda_magica:true}}).done,true);
});
test('evaluation is read-only and repeated checks never grant heroes or founder rights',()=>{
  const evidence={ownedHeroes:{},metrics:{kills:500}};const before=JSON.stringify(evidence);
  assert.deepEqual(evaluate(rule('musashi'),evidence),evaluate(rule('musashi'),evidence));
  assert.equal(JSON.stringify(evidence),before);
  assert.equal(evaluate(rule('nano_gm'),{entitlement:true,metrics:{kills:1e9}}).done,false);
});
test('validator blocks missing/duplicate heroes, wrong arenas, cycles, founders and cosmetic mistakes',()=>{
  const bad=fn=>{const copy=structuredClone(plan);fn(copy);assert.throws(()=>validate(copy,roster));};
  bad(p=>p.heroes.pop());
  bad(p=>p.heroes[1].id=p.heroes[0].id);
  bad(p=>p.starter.pool.push('axiom'));
  bad(p=>p.heroes.find(h=>h.id==='zahra').requirement.arena='unknown');
  bad(p=>p.heroes.find(h=>h.id==='myla').requirement={type:'owned',hero:'nano_gm'});
  bad(p=>p.heroes.find(h=>h.id==='ynara').requirement={type:'owned',hero:'myla'});
  bad(p=>p.heroes.find(h=>h.id==='musashi').requirement.target=0);
  bad(p=>p.heroes.find(h=>h.id==='axiom').requirement.requirements[1].target=100);
  bad(p=>p.skins[0].combatBonus=true);
  bad(p=>p.skins[0].id='nonexistent_skin');
  bad(p=>p.pendingSkinConcepts[0].activation='ready');
});
