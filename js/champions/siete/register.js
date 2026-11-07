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
  'ascension:ils_lunge':{type:'dash', w:30, range:()=>190},
  'ascension:vor_maul':{type:'cone', range:()=>170},
  'ascension:kor_ram':{type:'dash', w:48, range:()=>220}, 'ascension:kor_stampede':{type:'line', w:70, range:()=>420}
 });
 const PROJ = {ilsa:'dagger', vorn:'dagger', kora:'dagger'};
 // Talento de transformación por rama (cuesta 3, requiere la tercera mejora común de la rama).
 const SPECIAL = {
  ilsa:[['haste','Paso Ligero','Desviar un golpe da +15% de velocidad 2 s.'],
        ['expose','Estocada Expuesta','La Estocada deja vulnerable (+12%) a quien atraviesa.'],
        ['keep','Réplica Guardada','El Giro de Acero conserva una Réplica al gastarlas.']],
  vorn:[['wide','Muda Ancha','La onda de Mudar tiene un 30% más de radio.'],
        ['stagger','Zarpa Aturdidora','La Zarpa aturde 0,4 s a los comunes que golpea.'],
        ['pack','Manada','Instinto alcanza un 40% más lejos.']],
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
