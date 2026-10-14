'use strict';
// Equipment collections use the existing drop, collection and cosmetic unlock paths.
// Completing a collection unlocks its appearance; the cosmetic adds no combat power.
for(const [k,p] of Object.entries(QUALITY_FIVE_COLLECTION)){
 const id='quality_'+k;
 const S={id,champion:k,name:p.setName,theme:p.theme,aura:p.aura,full:id,
  sourceArena:p.arena,lore:p.lore,rarity:'legendario',pieces:p.pieces,
  thresholds:[{count:4,desc:'Colección completa: desbloquea '+p.skinName+'. La apariencia no añade poder.',mods:()=>[]}]};
 CHAMPION_SETS[id]=SET_DB[id]=S;
 SET_ARENA_WEIGHTS[p.arena][id]=1;
 for(const [type,name] of Object.entries(S.pieces)){
  const key=id+'_'+type;
  DESIGNED_ITEMS[key]={id:key,champion:k,type,rarity:'legendario',set:id,name,lore:p.lore,passiveNames:[]};
 }
}
