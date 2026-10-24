'use strict';
// Universal cosmetic manifestations reuse the existing skill art and VFX plans.
// They never remap champion animation rigs or modify combat statistics.
var MYTHIC_APPEARANCES = {
 lucifer:{name:'Lucifer',source:'manada',tint:'#ff762b',preview:'assets/sprites/champions/cazadora/skins/manada/preview.png'},
 glaciar:{name:'Glaciar Eterno',source:'convergencia',tint:'#8cdbff',preview:'assets/sprites/champions/mago/skins/convergencia/preview.png'},
 coloso:{name:'Coloso',source:'marea',tint:'#e7b46c',preview:'assets/sprites/champions/segador/skins/marea/preview.png'},
 tempestad:{name:'Tempestad',source:'sistema',tint:'#ad9bff',preview:'assets/sprites/champions/axiom/skins/sistema/preview.png'},
 alba:{name:'Alba',source:'custodio',tint:'#fff0ae',preview:'assets/sprites/champions/soporte/skins/custodio/preview.png'}
};
for(const [id,d] of Object.entries(MYTHIC_APPEARANCES)){
 for(const variant of ['base','astral','consagrada']){
  const key=variant==='base'?id:id+'_'+variant;
  SET_SKINS[key]={name:d.name+(variant==='base'?' · Manifestación':variant==='astral'?' · Astral':' · Consagrada'),champ:null,packs:{},src:d.preview,preview:d.preview,
   manifest:true,fxSource:d.source,fxTint:variant==='base'?d.tint:variant==='astral'?'#b6baff':'#ffe9b3',earnedOnly:variant==='base',requiresSet:variant==='consagrada'?id:null};
 }
}
