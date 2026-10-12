'use strict';
/* ============================================================
   js/champions/siete/register.js — complemento del registro de los siete campeones.
   Va DESPUÉS de js/champions/ascension/register.js (que ya creó CLASSES, PORTADORES, Códice, voces, skins, Sets
   pendientes y árbol de talentos por rama) y ANTES de js/systems/champion-entry-balance.js (normaliza estadísticas).
   Aquí: premarcado de cada habilidad que apunta (docs/bible/ABILITY_GATE.md), proyectil propio y un talento de
   transformación por rama (flags que lee el runtime). Ninguno está en knownChampions: siguen siendo candidatos.
   ============================================================ */
{
 const R = sk => Math.min(240, sk.radius || 100), RANGE = sk => Math.min(420, sk.range || 200);
 Object.assign(ACTION_AIM_PROFILES, {
  'ascension:ost_beam':{type:'line', w:26, range:()=>340}, 'ascension:ost_lens':{type:'point', r:R, range:()=>260},
  'ascension:ost_align':{type:'line', w:64, range:()=>470},
  'ascension:gre_snare':{type:'point', r:()=>38, range:()=>230}, 'ascension:gre_mine':{type:'point', r:R, range:()=>240},
  'ascension:gre_field':{type:'point', r:()=>130, range:()=>230},
  'ascension:ils_lunge':{type:'dash', w:30, range:()=>190},
  'ascension:vor_maul':{type:'cone', range:()=>170},
  'ascension:ner_moss':{type:'point', r:R, range:RANGE}, 'ascension:ner_mud':{type:'line', w:30, range:()=>300},
  'ascension:ner_marsh':{type:'point', r:()=>200, range:()=>260},
  'ascension:qui_deal':{type:'cone', range:()=>200}, 'ascension:qui_ace':{type:'line', w:24, range:()=>330},
  'ascension:qui_royal':{type:'point', r:()=>160, range:()=>260},
  'ascension:kor_ram':{type:'dash', w:48, range:()=>220}, 'ascension:kor_stampede':{type:'line', w:70, range:()=>420}
 });
 const PROJ = {ostrel:'starshard', grelk:'quarrel', ilsa:'dagger', vorn:'dagger', nerith:'reedspore', quillon:'card', kora:'dagger'};
 // Talento de transformación por rama (cuesta 3, requiere la tercera mejora común de la rama).
 const SPECIAL = {
  ostrel:[['split','Haz Dividido','Dos haces finos acompañan al Haz de Sirio a ±20° con el 40% de su daño.'],
          ['scorch','Lente Abrasadora','Quienes pisan la Lente de Aumento arden 3 s.'],
          ['swift','Concentración Veloz','Concentración Estelar da +15% de velocidad a los aliados cercanos.']],
  grelk:[['barbs','Cepo de Púas','El Cepo de Zarpa además hace sangrar a quien atrapa.'],
         ['cluster','Racimo','La Mina de Clavos deja dos minas pequeñas a sus lados.'],
         ['recycle','Reciclar','Pulso del Cazador acorta 2 s la recarga del Cepo si dispara dos o más trampas.']],
  ilsa:[['haste','Paso Ligero','Desviar un golpe da +15% de velocidad 2 s.'],
        ['expose','Estocada Expuesta','La Estocada deja vulnerable (+12%) a quien atraviesa.'],
        ['keep','Réplica Guardada','El Giro de Acero conserva una Réplica al gastarlas.']],
  vorn:[['wide','Muda Ancha','La onda de Mudar tiene un 30% más de radio.'],
        ['stagger','Zarpa Aturdidora','La Zarpa aturde 0,4 s a los comunes que golpea.'],
        ['pack','Manada','Instinto alcanza un 40% más lejos.']],
  nerith:[['rich','Musgo Rico','El Charco de Musgo repone un 30% más.'],
          ['bog','Lodazal','El Reguero de Lodo es un 25% más largo y frena más.'],
          ['purge','Bruma Limpia','Bruma Mansa además repone 3% de vida a los aliados.']],
  quillon:[['wide','Mano Abierta','Las cartas del Reparto tienen un 25% más de radio.'],
           ['sharp','As Afilado','El As en la Manga hace un 25% más de daño.'],
           ['rich','Apuesta Rica','Apuesta Doble además repone 2% de vida a los aliados cercanos.']],
  kora:[['bigcarry','Carga Pesada','La Arremetida arrastra hasta nueve comunes.'],
        ['stun','Pisotón Aturdidor','El Pisotón aturde 0,4 s a los comunes y tiene 20% más de radio.'],
        ['roll','En Marcha','Cabeza Gacha da 25 de Impulso al lanzarse.']]
 };
 for(const k of Object.keys(SIETE)){
  CHAMP_IDENTITY[k] = Object.assign(CHAMP_IDENTITY[k] || {sig:'mark'}, {proj: PROJ[k]});
  const tree = TALENT_TREES[k];
  SPECIAL[k].forEach(([flag, name, desc], b) => {
   tree.nodes.push({id:k+'_t'+b+'x', branch:k+'_'+b, type:'special', maxRank:1, cost:3, requires:k+'_t'+b+'c', name, desc, rankDesc:()=>desc, mods:()=>[{targetSkill:b, flag}]});
  });
 }
}
