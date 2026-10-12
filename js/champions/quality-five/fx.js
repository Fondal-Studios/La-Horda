'use strict';
// Decorative particles only: bounded per owner, leaving ground telegraphs intact.
// kitFx uses <=700 ms lifetime, randomized by the engine by at most 1.2.
function qualityFiveFx(h, draw, ...args){
 const now=runElapsedMs,live=(h._qualityFxBudget||[]).filter(x=>x.until>now);
 h._qualityFxBudget=live;
 let remaining=Math.max(0,64-live.reduce((n,x)=>n+x.count,0));
 const burst=vfxBurst,spray=vfxSpray;
 const limit=fn=>function(x,y,n,...rest){
  n=Math.min(Math.max(0,Math.floor(n)),remaining);if(!n)return;
  remaining-=n;live.push({count:n,until:now+900});
  return fn.call(this,x,y,n,...rest);
 };
 vfxBurst=limit(burst);vfxSpray=limit(spray);
 try{return draw(...args);}finally{vfxBurst=burst;vfxSpray=spray;}
}
