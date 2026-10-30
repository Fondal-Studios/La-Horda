'use strict';
// Common 36-pose authored contract. Does not invent missing frames or approve art.
function codexMeta(refH=71,cell=112){
 const sets={};
 for(const [dir,offset] of [['down',0],['side',4],['up',8]]){
  sets['idle_'+dir]=[offset];
  sets['walk_'+dir]=[offset,offset+1,offset+2,offset+3];
  sets['attack_'+dir]=[offset+12,offset+13,offset+14,offset+15];
 }
 sets.cast_down=[24,25,26,27];sets.hit_down=[28,29];sets.hit_side=[30];sets.hit_up=[31];sets.death_down=[32,33,34,35];
 return {w:cell,h:cell,cols:4,refH,anchor:Math.round(cell*106/112)/cell,fix:{left:'mirror'},sets};
}
module.exports={codexMeta};
