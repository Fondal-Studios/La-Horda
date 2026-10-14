'use strict';
// Character cues share the existing mixer, mute and priority limits.
// Context-local reservation prevents a rapid cast/ultimate sequence from piling up voices.
for(const [key,low,high,wave] of [
 ['solciju',392,587,'sine'],['brakk',82,123,'triangle'],
 ['veyra',880,330,'triangle'],['morveth',147,196,'sine'],['aelith',1046,784,'sine']
]){
 const reservations=new WeakMap();
 function play(t,D,ultimate){
  const context=D.context,until=reservations.get(context)||0;
  if(t<until)return 0;
  const duration=ultimate?.82:.3;reservations.set(context,t+duration);
  if(ultimate){
   _tone(t,wave,low*.5,low,.18,.04,D);
   _tone(t+.26,'sine',high,high*1.5,.18,.027,D);
   _tone(t+.5,'triangle',low,low*.75,.25,.02,D);
  }else{
   _tone(t,wave,low,high,.12,.035,D);
   _tone(t+.06,'sine',high,high*.75,.15,.02,D);
  }
  return duration;
 }
 ARENA_SFX['quality_'+key+'_cast']={p:2,gap:300,play:(t,D)=>play(t,D,false)};
 ARENA_SFX['quality_'+key+'_ult']={p:3,gap:900,play:(t,D)=>play(t,D,true)};
}
