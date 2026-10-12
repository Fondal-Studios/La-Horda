"use strict";
/* ============================================================
   js/data/boons-siete.js — REFUERZOS DE HABILIDAD de los siete campeones nuevos (Ostrel, Grelk, Ilsa, Vorn, Nerith,
   Quillon, Kora). Mismo motor y mismo formato que js/data/boons-heroes.js: cada carta transforma UNA habilidad
   nombrada, 4 cartas + 1 dúo por campeón; los valores en arreglo [común, raro, épico] los elige el motor por rareza.
   Se carga justo después de boons-heroes.js y registra en BOONS / BOON_BY_ID con el mismo bucle.
   ============================================================ */
const SIETE_BOONS = {
  ostrel:{duo:[0,1], cards:[
    [0,"Haz Prismático","holy","hits",[{t:"shards",at:"caster",n:[3,4,5],pct:[.3,.35,.4]}],r=>`El Haz de Sirio suelta ${_R([3,4,5],r)} destellos en redondo al empezar.`],
    [1,"Lente Ardiente","fire","zone",[{t:"ground",at:"aim",r:[85,100,115],dur:[3000,3500,4000],dps:[.3,.4,.5],burn:true}],r=>`La Lente de Aumento deja el suelo ardiendo ${_R([3,3.5,4],r)} s.`],
    [2,"Foco Compartido","holy","shield",[{t:"ally",at:"caster",r:200,shield:[.06,.09,.12]}],r=>`Concentración Estelar escuda ${_R([6,9,12],r)}% de vida a los aliados cercanos.`],
    ["ult","Supernova","holy","stun",[{t:"burst",at:"caster",r:170,pct:[.8,1,1.2],status:{stun:[400,600,800]}}],r=>`La Alineación de Sirio cierra con una supernova que aturde ${_R([.4,.6,.8],r)} s.`],
    [0,"Constelación","holy","dmg",[{t:"echo",at:"aim",delay:450,r:120,pct:.8,status:{vuln:.15,vulnMs:4000}}],r=>"Dúo: la luz del Haz vuelve medio segundo después: estalla y deja a la Horda vulnerable."]]},
  grelk:{duo:[0,1], cards:[
    [0,"Cepo de Púas","blood","bleed",[{t:"status",on:"hits",status:{bleed:[.25,.35,.45]}}],r=>`El Cepo de Zarpa hace sangrar (${_R([25,35,45],r)}% de daño por segundo).`],
    [1,"Metralla","steel","hits",[{t:"shards",at:"aim",n:[4,6,8],pct:[.3,.35,.4]}],r=>`La Mina de Clavos lanza ${_R([4,6,8],r)} esquirlas más.`],
    [2,"Eco del Disparo","steel","dmg",[{t:"burst",at:"caster",r:[90,110,130],pct:[.5,.7,.9]}],r=>`El Pulso del Cazador estalla a su alrededor (${_R([50,70,90],r)}% de daño).`],
    ["ult","Cacería Total","blood","vuln",[{t:"status",on:"area",rMul:1,status:{vuln:[.12,.18,.24],vulnMs:5000}}],r=>`El Campo de Cepos deja vulnerable a la Horda: +${_R([12,18,24],r)}% de daño recibido.`],
    [0,"Foso Doble","stone","pull",[{t:"pull",at:"aim",rMul:1.4,px:60},{t:"burst",at:"aim",r:110,pct:.7}],r=>"Dúo: el cepo arrastra a la Horda hacia el foso y la aplasta con la mina."]]},
  ilsa:{duo:[0,2], cards:[
    [0,"Postura Espinosa","steel","dmg",[{t:"burst",at:"caster",r:[80,95,110],pct:[.5,.7,.9]}],r=>`La Postura de Réplica estalla al terminar (${_R([50,70,90],r)}% de daño).`],
    [1,"Estocada Honda","blood","hits",[{t:"line",w:40,pct:[.5,.7,.9],status:{bleed:.3}}],r=>`La Estocada deja un tajo que sangra a lo largo del camino (${_R([50,70,90],r)}%).`],
    [2,"Giro Segador","steel","hits",[{t:"shards",at:"caster",n:[4,6,8],pct:[.3,.35,.4]}],r=>`El Giro de Acero suelta ${_R([4,6,8],r)} filos en redondo.`],
    ["ult","Mil Réplicas","holy","dmg",[{t:"fan",n:[4,6,8],spread:.9,pct:[.4,.45,.5]}],r=>`El Duelo dispara ${_R([4,6,8],r)} réplicas en abanico.`],
    [0,"Tercera Respuesta","steel","stun",[{t:"echo",at:"caster",delay:500,r:130,pct:.9,status:{stun:300}}],r=>"Dúo: la postura responde una vez más medio segundo después y aturde."]]},
  vorn:{duo:[0,3], cards:[
    [0,"Muda Violenta","stone","dmg",[{t:"burst",at:"caster",r:[90,105,120],pct:[.5,.7,.9]}],r=>`Mudar estalla con una segunda onda (${_R([50,70,90],r)}% de daño).`],
    [1,"Zarpa Profunda","blood","bleed",[{t:"status",on:"hits",status:{bleed:[.25,.35,.45]}}],r=>`La Zarpa hace sangrar (${_R([25,35,45],r)}% de daño por segundo).`],
    [2,"Coraza Viva","stone","shield",[{t:"ally",at:"caster",r:200,shield:[.06,.09,.12]}],r=>`El Instinto escuda además ${_R([6,9,12],r)}% de vida a los aliados cercanos.`],
    ["ult","Rugido Primordial","stone","stun",[{t:"burst",at:"caster",r:180,pct:[.8,1,1.2],status:{stun:[400,600,800]}}],r=>`La Bestia Primordial ruge al empezar y aturde ${_R([.4,.6,.8],r)} s.`],
    [0,"Piel Completa","stone","pull",[{t:"pull",at:"caster",r:170,px:55},{t:"burst",at:"caster",r:110,pct:.7}],r=>"Dúo: la muda arrastra a la Horda hacia ti y la aplasta."]]},
  nerith:{duo:[0,1], cards:[
    [0,"Esporas Curativas","holy","shield",[{t:"ally",at:"caster",r:180,shield:[.05,.08,.11]}],r=>`El Charco de Musgo envuelve en una barrera de ${_R([5,8,11],r)}% de vida a los aliados cercanos.`],
    [1,"Lodo Venenoso","poison","poison",[{t:"status",on:"hits",status:{poison:[.3,.45,.6]}}],r=>`El Reguero de Lodo envenena (${_R([30,45,60],r)}% de daño por segundo).`],
    [2,"Niebla Espesa","frost","zone",[{t:"ground",at:"caster",r:[95,110,125],dur:[3000,3500,4000],dps:[.2,.3,.4],slow:.35}],r=>`La Bruma Mansa deja una niebla ${_R([3,3.5,4],r)} s que frena y daña.`],
    ["ult","Marea Verde","holy","shield",[{t:"ally",at:"caster",r:280,shield:[.08,.12,.16]}],r=>`La Marisma Eterna escuda ${_R([8,12,16],r)}% de vida a todos los aliados cercanos.`],
    [0,"Ciénaga Madura","poison","zone",[{t:"ground",at:"aim",r:130,dur:3500,dps:.5,poison:true}],r=>"Dúo: charco y lodo maduran juntos y dejan una ciénaga que envenena."]]},
  quillon:{duo:[0,1], cards:[
    [0,"Mano Marcada","steel","hits",[{t:"bounce",n:[1,2,3],pct:[.45,.55,.65],range:170}],r=>`Cada carta del Reparto salta a ${_R([1,2,3],r)} enemigos más.`],
    [1,"As Afilado","steel","hits",[{t:"line",w:36,pct:[.5,.7,.9]}],r=>`El As en la Manga corta todo el camino (${_R([50,70,90],r)}% de daño).`],
    [2,"Doble o Nada","holy","dmg",[{t:"burst",at:"caster",r:[90,105,120],pct:[.5,.7,.9]}],r=>`La Apuesta Doble estalla alrededor (${_R([50,70,90],r)}% de daño).`],
    ["ult","Mesa Limpia","holy","stun",[{t:"burst",at:"aim",r:150,pct:[.8,1,1.2],status:{stun:[400,600,800]}}],r=>`La Escalera Real termina con la mesa limpia: aturde ${_R([.4,.6,.8],r)} s.`],
    [0,"Full","steel","dmg",[{t:"fan",n:5,spread:.8,pct:.4},{t:"echo",at:"aim",delay:450,r:110,pct:.7}],r=>"Dúo: el reparto se completa con cinco cartas más y un estallido."]]},
  kora:{duo:[0,1], cards:[
    [0,"Choque Frontal","stone","dmg",[{t:"burst",at:"hits",r:[55,65,75],pct:[.35,.5,.65]}],r=>`Cada golpe de la Arremetida estalla alrededor (${_R([35,50,65],r)}% de daño).`],
    [1,"Onda Sísmica","stone","hits",[{t:"line",w:50,pct:[.5,.7,.9],status:{slow:.3}}],r=>`El Pisotón lanza una onda en línea (${_R([50,70,90],r)}%) que frena.`],
    [2,"Casco Duro","steel","shield",[{t:"ally",at:"caster",r:150,shield:[.06,.09,.12]}],r=>`Cabeza Gacha envuelve en una barrera de ${_R([6,9,12],r)}% de vida a los aliados cercanos.`],
    ["ult","Derrumbe","stone","stun",[{t:"burst",at:"caster",r:180,pct:[.8,1,1.2],status:{stun:[400,600,800]}}],r=>`La Estampida termina en un derrumbe que aturde ${_R([.4,.6,.8],r)} s.`],
    [0,"Terremoto de Carga","stone","dmg",[{t:"echo",at:"caster",delay:450,r:130,pct:.9},{t:"shards",at:"caster",n:6,pct:.35}],r=>"Dúo: la carga deja una réplica sísmica medio segundo después."]]}
};
for(const [champ, k] of Object.entries(SIETE_BOONS)){
  const ids = k.cards.slice(0,4).map((_,i)=>champ+"_bn_"+i);
  k.cards.forEach((c,i)=>{
    const [skill, name, look, test, fx, desc] = c;
    const b = {id:champ+"_bn_"+i, champ, skill, name, look, test, fx, desc};
    if(i === 4) b.duo = [ids[k.duo[0]], ids[k.duo[1]]];
    BOONS.push(b); BOON_BY_ID[b.id] = b;
  });
}
