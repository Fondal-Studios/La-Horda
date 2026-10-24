'use strict';
// Five universal collections. Existing IDs, skins and legacy pieces remain valid.
const MYTHIC_SET_IDS=['lucifer','glaciar','coloso','tempestad','alba'];
for(const id of MYTHIC_SET_IDS){
 const set=SET_DB[id];if(!set)continue;
 set.rarity='mitico';set.universal=true;
 for(const type of EQUIP_SLOT_TYPES){
  const key=id+'_'+type;
  set.pieces[type]=set.pieces[type]||ITEM_TYPES[type].label+' · '+set.name;
  if(!DESIGNED_ITEMS[key])DESIGNED_ITEMS[key]={id:key,champion:null,type,set:id,name:set.pieces[type],lore:set.lore,passiveNames:[]};
  DESIGNED_ITEMS[key].rarity='mitico';DESIGNED_ITEMS[key].champion=null;
 }
 // Keep the same total bonuses, spreading their acquisition across six slots.
 const th=set.thresholds;
 if(th.length===3){th[0].count=2;th[1].count=4;th[2].count=6;}
}
