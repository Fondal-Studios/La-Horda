'use strict';
CROMA_CRYSTALS.expedition={label:'Expedición de los Diez',short:'Expedición',color:'#e6dcc8'};
for(const [k,p] of Object.entries(EXPEDITION)){
 CROMA_SKINS[k+'_croma']={champ:k,name:p.name+' — Ceniza del Alba',price:1000,crystal:'expedition',appearanceType:'croma',rarity:'Rara',tagline:'Marfil y ceniza al final del viaje.',lore:'El polvo del viaje cubre la ropa antes de que llegue la primera luz. '+p.name+' conserva sus herramientas: cambian los colores, no las promesas.',visualTheme:'Paleta ceniza y marfil; mismo vestuario y silueta.',collection:'Expedición de los Diez',preserveAuthoredArt:true,preview:'assets/sprites/champions/'+k+'/croma-preview.png',files:{},exPalette:{colors:['#45424b','#85808c','#bdb5b0','#eee6d5'],tint:'#eee6d5'}};
}
const exCromaLoad=cromaEnsureLoaded;cromaEnsureLoaded=function(id){
 const d=exCromaLoad(id);if(!d?.exPalette||d._exBuilt)return d;d._exBuilt=true;
 const build=(baseKey,key)=>{const B=CHAMP_PACK[baseKey];if(!B||!B.atlas)return;d.packs[baseKey]=key;
  const apply=()=>{const P=CHAMP_PACK[key]=Object.assign({},B,{ready:false,failed:false,footX:null});const c=portadorRecolorAtlas(P,d.exPalette),im=new Image();im.onload=()=>{P.atlas=im;P.ready=true;};im.onerror=()=>{P.failed=true;};im.src=c.toDataURL();};
  if(B.ready)apply();else{const prev=B.atlas.onload;B.atlas.onload=e=>{if(prev)prev(e);apply();};}};
 build(d.champ,'croma_'+id);
 // Guardián con cuerpo del Códice: la croma recolorea TAMBIÉN ese cuerpo (se dibuja por codexChampionPack con su propia normalización);
 // el pack clásico se conserva para el contrato de grilla de t_cromas y como respaldo mientras el del Códice carga.
 if(CHAMP_PACK['codex_'+d.champ])build('codex_'+d.champ,'croma_'+id+'_codex');
 return d;
};
