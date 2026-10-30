'use strict';
// Design-time evaluator only. This module never grants ownership or reads a game save.
// Its input is a normalized, trusted evidence snapshot, NOT an HTTP request payload.
const own = (o,k) => o != null && Object.prototype.hasOwnProperty.call(o,k) ? o[k] : undefined;
const number = x => Number.isSafeInteger(x) && x >= 0 ? x : 0;
function evaluate(requirement, evidence = {}) {
  const r = requirement;
  if (r.type === 'all' || r.type === 'any') {
    if (!Array.isArray(r.requirements) || !r.requirements.length) throw Error('Empty compound requirement');
    const children = r.requirements.map(c=>evaluate(c,evidence));
    const done = r.type === 'all' ? children.every(c=>c.done) : children.some(c=>c.done);
    return {done, children};
  }
  let have = 0, need = r.target === undefined ? 1 : r.target;
  switch (r.type) {
    case 'metric': {
      let v = own(evidence.metrics,r.key);
      // hero + arena is one joint record: never combine unrelated aggregate totals.
      for (const key of ['hero','arena','difficulty']) if (r[key]) v = own(v,r[key]);
      have = number(v); break;
    }
    case 'owned': have = own(evidence.ownedHeroes,r.hero) === true ? 1 : 0; break;
    case 'set_complete': have = own(evidence.completedSets,r.setId) === true ? 1 : 0; break;
    case 'starter_choice': have = number(evidence.availableStarterChoices); break;
    case 'entitlement': return {done:false,external:true}; // never infer an operator grant
    default: throw Error('Unknown requirement '+r.type);
  }
  if (!Number.isSafeInteger(need) || need < 1) throw Error('Invalid target');
  return {have:Math.min(have,need),need,done:have>=need};
}
function recruitmentChoices(plan, {campaignWins=0,claims=0,ownedHeroes={}} = {}) {
  const earned = plan.starter.initialChoices + plan.starter.recruitWinMilestones.filter(n=>number(campaignWins)>=n).length;
  const remaining = plan.starter.pool.filter(id=>own(ownedHeroes,id)!==true);
  return {available:Math.min(remaining.length,Math.max(0,earned-number(claims))),eligible:remaining};
}
module.exports = {evaluate,recruitmentChoices};
