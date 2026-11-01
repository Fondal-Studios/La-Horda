"use strict";
/* ============================================================
   js/data/build-synergy.js
   DATOS de BUILD EVOLUTION 2.0 — RAMAS DE EVOLUCIÓN (Fondal Studios · Beta).
   Una RAMA es una evolución ALTERNATIVA de UNA habilidad: al llegar a Nv.5 de esa habilidad
   (hito Ímpetu de skill-evolution.js) aparece una carta de decisión durante la partida con dos
   ramas excluyentes de arquetipo distinto (ofensiva / defensiva / control). Elegir una cierra la otra
   para esa habilidad hasta la próxima incursión (dura lo que dura la partida, como los refuerzos).
   NO duplica nada existente:
     · skill-evolution.js  -> Firma (Nv.3), Ímpetu (Nv.5), Resonancia (Nv.7), Forma final (Nv.10): se mantienen.
     · boons.js            -> refuerzos que transforman la habilidad (zonas, rebotes...): se mantienen.
     · Las ramas se montan SOBRE esos hitos: leen el estado de la Firma (marca, ralentización) y
       sus efectos solo corren en la ventana de lanzamiento de la habilidad.
   Cada rama: {id, champ, skill (0|1|2|"ult"), arch, name, fx, cdMult, set, look}
     fx (todos con tope y enfriamiento interno; los jefes reciben menos control):
       vsMarked / vsSlowed  daño extra (fracción del golpe) a enemigos que YA estaban marcados/ralentizados
       extra                golpe adicional {pct, icd}
       chain                arco a {n} cercanos {pct, range, icd}
       shield / heal        {pct de vida máx por golpe, cap por lanzamiento, icd}
       slow / stun          control {amt, ms, icd}  (stun no afecta élite/jefe)
       freezeSlowed         congela (aturde) a quien ya estaba ralentizado {ms, icd}
       pull                 acerca al enemigo {px, icd} (no afecta jefes)
       mark                 marca (+10% daño recibido, el mismo estado de la Firma) {ms}
     cdMult  costo de la decisión: multiplica el enfriamiento de ESA habilidad (>=1).
     set     {id, n}: con n piezas del set del guardián la rama rinde +SYN_CFG.setBonus (tope SYN_CFG.setCap).
   >>> Balance: SYN_CFG y cada rama. La prueba tools/build-evolution/t_synergy_static.js vigila la banda
       de presupuesto (SYN_BUDGET) para que ninguna rama domine.
   ============================================================ */
const SYN_CFG = {
  reqLvl: 5,           // se desbloquea al alcanzar el hito Nv.5 de esa habilidad (evoLevelOf >= 5)
  setBonus: 0.2,       // +20% de potencia con 2 piezas del set del guardián
  setCap: 1.3,         // potencia total máxima (set + otros) = x1.3
  budgetPerSec: 6,     // tope de daño extra por segundo = 6 x daño base del héroe (anti-dominancia)
  bossControl: 0.5,    // los jefes reciben la mitad de la ralentización y no se aturden/acercan
  fxPerWindow: 5       // efectos visuales de rama por ventana de 100 ms por héroe
};
const SYN_ARCH = {
  ofensiva:  {name:"Ofensiva",  color:"#ff7a59", ico:"⚔"},
  defensiva: {name:"Defensiva", color:"#5fd0ff", ico:"🛡"},
  control:   {name:"Control",   color:"#b78bff", ico:"❄"}
};
const SYN_BRANCHES = [
  /* ---------- Aldric (Tanque) — frente: control y aguante ---------- */
  {id:"tq_ariete",  champ:"tanque", skill:1, arch:"defensiva", name:"Ariete Fortificado", look:"#9cc4ee",
   fx:{shield:{pct:0.04, cap:0.20, icd:120}}, cdMult:1.10, set:{id:"baluarte", n:2},
   text:"Cada enemigo embestido te da un escudo de 4% de tu vida (hasta 20% por embestida)."},
  {id:"tq_quiebre", champ:"tanque", skill:1, arch:"control", name:"Embestida Quebrantadora", look:"#c9a0ff",
   fx:{slow:{amt:0.30, ms:1600, icd:2500}, stun:{ms:200, icd:2500}}, cdMult:1.20, set:{id:"baluarte", n:2},
   text:"Los embestidos quedan lentos 30% y aturdidos 0,2 s (jefes: solo lentos)."},
  {id:"tq_vortice", champ:"tanque", skill:0, arch:"control", name:"Vórtice de Acero", look:"#8fd9ff",
   fx:{pull:{px:12, icd:300}, slow:{amt:0.25, ms:700, icd:300}}, cdMult:1.20, set:{id:"baluarte", n:2},
   text:"Torbellino arrastra a los enemigos hacia vos y los frena 25%."},
  {id:"tq_filo",    champ:"tanque", skill:0, arch:"ofensiva", name:"Torbellino Afilado", look:"#ff9a6a",
   fx:{extra:{pct:0.30, icd:200}}, cdMult:1.10, set:{id:"baluarte", n:2},
   text:"Cada giro suma un tajo extra de 30% del golpe, una vez cada 0,2 s por enemigo."},
  /* ---------- Thalen (Mago) — distancia: daño condicional y cadenas ---------- */
  {id:"mg_quebradiza", champ:"mago", skill:1, arch:"ofensiva", name:"Nova Quebradiza", look:"#aee6ff",
   fx:{vsSlowed:0.30}, cdMult:1.0, set:{id:"convergencia", n:2},
   text:"+30% de daño a enemigos que ya estaban ralentizados al llegarles la nova."},
  {id:"mg_glacial", champ:"mago", skill:1, arch:"control", name:"Nova Glacial", look:"#7fb8ff",
   fx:{freezeSlowed:{ms:450, icd:5000}}, cdMult:1.0, set:{id:"convergencia", n:2},
   text:"Quien ya estaba ralentizado queda congelado 0,45 s (jefes: ralentización fuerte)."},
  {id:"mg_tormenta", champ:"mago", skill:2, arch:"ofensiva", name:"Cadena de Tormenta", look:"#ffe36a",
   fx:{chain:{n:2, pct:0.18, range:130, icd:400}}, cdMult:1.05, set:{id:"convergencia", n:2},
   text:"Cada descarga salta a 2 enemigos cercanos con 18% del golpe."},
  {id:"mg_tierra", champ:"mago", skill:2, arch:"defensiva", name:"Cadena a Tierra", look:"#8bffb0",
   fx:{heal:{pct:0.03, cap:0.12, icd:150}}, cdMult:1.0, set:{id:"convergencia", n:2},
   text:"Cada descarga te cura 3% de tu vida (hasta 12% por lanzamiento)."},
  /* ---------- Sylva (Cazadora) — presa marcada y cobertura ---------- */
  {id:"cz_caceria", champ:"cazadora", skill:0, arch:"ofensiva", name:"Flecha de Cacería", look:"#9bff8a",
   fx:{vsMarked:0.30}, cdMult:1.0, set:{id:"manada", n:2},
   text:"+30% de daño a presas ya marcadas (la Firma Nv.3 marca)."},
  {id:"cz_rastro", champ:"cazadora", skill:0, arch:"control", name:"Flecha de Rastro", look:"#7ee0c0",
   fx:{slow:{amt:0.40, ms:1800, icd:1500}, vsSlowed:0.15}, cdMult:1.0, set:{id:"manada", n:2},
   text:"La flecha frena 40% durante 1,8 s a lo que atraviesa y pega +15% a lo ya frenado."},
  {id:"cz_cobertura", champ:"cazadora", skill:2, arch:"defensiva", name:"Lluvia de Cobertura", look:"#a8e8ff",
   fx:{shield:{pct:0.04, cap:0.20, icd:200}}, cdMult:1.0, set:{id:"manada", n:2},
   text:"Cada flecha que impacta te da escudo de 4% de tu vida (hasta 20%)."},
  {id:"cz_marca", champ:"cazadora", skill:2, arch:"control", name:"Lluvia Marcadora", look:"#ffb86a",
   fx:{mark:{ms:3500}, slow:{amt:0.20, ms:1200, icd:600}}, cdMult:1.0, set:{id:"manada", n:2},
   text:"Marca a todo lo que toca (+10% de daño recibido para el equipo) y lo frena 20%."}
];
const SYN_BY_ID = Object.fromEntries(SYN_BRANCHES.map(b=>[b.id, b]));
const SYN_CHAMPS = [...new Set(SYN_BRANCHES.map(b=>b.champ))];
