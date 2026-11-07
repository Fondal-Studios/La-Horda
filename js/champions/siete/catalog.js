'use strict';
/* ============================================================
   js/champions/siete/catalog.js — DISEÑO de los siete campeones nuevos.
   Se fusiona con ASCENSION (js/champions/ascension/catalog.js) para reutilizar su registro, talentos de rama,
   Códice, voces y skins, pero NO son de la categoría Ascensión: js/data/champion-taxonomy.js los declara STANDARD en
   TESTING. Siguen siendo candidatos: no están en knownChampions (docs/production/siete/README.md).
   Formato de skills: [nombre, acción, costo, cd(ms), alcance, radio, duración(ms), multDaño, descripción, afinidad]
   Arte: hojas del Pintor (tools/art/painter/specs/<id>.json). Revisión humana de arte y audio: PENDIENTE.
   ============================================================ */
const SIETE = {
 ilsa:{name:'Ilsa',title:'La Esgrimista de Réplica',origin:'Los salones de la Ciudad',tagline:'Ilsa desvía los golpes, los devuelve con interés y convierte cada Réplica en una estocada.',role:'asesino',color:'#d94f6a',glow:'#ffd0da',stats:[108,12,.08,178,70,420,false],weapon:'Florete de duelo',arena:'ciudad',setName:'Salón de Esgrima',
  fantasy:'Duelista de contraataque: desvía los golpes enemigos, responde a cada atacante y gasta Réplicas en estocadas.',
  silhouette:'Esgrimista de casaca corta con vuelo, guante de duelo largo y un florete de hoja fina; una cinta carmesí en la muñeca.',
  history:'Ilsa Corvo enseñaba esgrima en los salones de la Ciudad con una sola regla: jamás atacar primero. Perdió a su mejor alumno por un golpe que nadie desvió y decidió que a nadie más le tocaría pagar por no responder. Ahora espera el golpe con el florete bajo y la cinta carmesí en la muñeca, y devuelve cada uno con intereses. No se jacta: cuenta las respuestas, porque la tercera siempre es la que cierra el duelo.',
  passive:['Respuesta','Cada golpe desviado suma una Réplica (máx. 3). Con tres Réplicas tu siguiente básico es una réplica: +60% de daño.'],
  weakness:'Solo desvía golpes de enemigos (no peligros del suelo) y durante una ventana corta; fuera de ella tiene poca vida.',
  voices:['Golpeá. Es lo único que te voy a pedir.','Respondí a todos. Ninguno quedó sin respuesta.','Mi guardia… bajó…'],
  skins:[['Esgrimista de Gala','Casaca de gala blanca con encaje en el puño, guante alto y florete de empuñadura de plata.','El día de la última función de los salones, Ilsa se vistió de gala para despedir a los que aún bailaban. Nadie la vio bajar la guardia.'],['Esgrimista de Carnaval','Casaca negra y oro con capa de seda, corona de máscara y hombreras de latón.','La noche del carnaval nadie desvió una sola estocada. Ilsa bailó con todas y no recibió ninguna.']],
  skills:[['Postura de Réplica','ils_parry',20,6500,0,110,900,0,'Durante 0,9 s desvía todos los golpes que recibas y contraataca a cada atacante. Cada golpe desviado suma una Réplica (máx. 3) y acorta 2 s esta recarga.','parry'],
   ['Estocada de Réplica','ils_lunge',24,7200,200,26,0,1.5,'Se lanza en línea y atraviesa a cuantos haya en el camino; cada Réplica gastada suma +35% de daño.','lunge'],
   ['Giro de Acero','ils_whirl',26,8800,0,105,0,1.3,'Gira con el acero: daña, frena y aparta a los comunes que la rodean. Cada Réplica gastada suma +25% de daño y empuja más lejos.','whirl'],
   ['Duelo de Mil Réplicas','ils_duel',0,40000,0,130,4000,.85,'Estallido que frena alrededor y, durante 4 s, desvía hasta seis golpes con una onda de respuesta. Recibe 40% menos de daño mientras dura.','duel']]},
 vorn:{name:'Vorn',title:'El Cambiapiel',origin:'El santuario del Laberinto',tagline:'Vorn alterna dos pieles, Piedra y Tormenta, y las funde en una Bestia que nadie quiere frenar.',role:'tanque',color:'#7fa88c',glow:'#d8f0e0',stats:[168,9,.2,142,84,640,false],weapon:'Garras de basalto',arena:'laberinto',setName:'Dos Pieles',
  fantasy:'Tanque transformista: alterna una piel de piedra que resiste y una de tormenta que persigue, y cada skill cambia con la forma.',
  silhouette:'Guardián corpulento de mitad de lomo cubierto de lajas de basalto y la otra mitad de pelaje pálido; garras largas y la mirada baja.',
  history:'El santuario del Laberinto exigía que alguien guardara la puerta con dos pieles: una de piedra, para resistir, y una de tormenta, para avisar. Vorn aceptó el pacto sin preguntar cuánto duraba. Ya no recuerda cuál de las dos fue la suya primero, y cada muda le cuesta un poco de nombre. Cuando entra en la Bestia deja de elegir, y dice que es el único momento en que se siente entero.',
  passive:['Dos Pieles','Piedra: −14% de daño recibido y −8% de velocidad. Tormenta: +18% de velocidad, básicos +12% y roban un poco de vida.'],
  weakness:'Mudar tiene una recarga corta pero cada forma es débil donde la otra es fuerte: Piedra es lenta, Tormenta recibe todo el daño.',
  voices:['Una piel para aguantar. Otra para correr.','Las dos puertas siguen cerradas.','Cuál… era… la mía…'],
  skins:[['Piel de Aurora','Pelaje blanco azulado, lajas de basalto cubiertas de escarcha y un manto de plumas pálidas en los hombros.','En las noches claras del Laberinto la piel de tormenta se pone pálida. Vorn la dejó así cuando entendió que la aurora también avisa.'],['Piel de Ceniza','Roca ennegrecida con grietas de brasa, cuernos de fuego y una capa de ceniza.','Cuando el Laberinto ardió, la piel de piedra de Vorn guardó el calor. Todavía brilla en las grietas.']],
  skills:[['Mudar','vor_shift',18,5000,0,115,3000,.9,'Cambia de piel. A Piedra: onda que frena y una coraza propia. A Tormenta: onda que debilita y +velocidad y +daño. Dura hasta que mudes de nuevo.','shift'],
   ['Zarpa','vor_maul',24,6800,160,70,0,1.5,'Piedra: golpe en abanico que aparta y frena. Tormenta: se lanza en línea y deja sangrado.','maul'],
   ['Instinto','vor_instinct',22,10500,0,170,3500,0,'Piedra: Roca Viva, coraza y armadura para el grupo. Tormenta: Aullido, +velocidad y +daño para el grupo.','instinct'],
   ['Bestia Primordial','vor_beast',0,40000,0,150,6000,.55,'Funde ambas pieles 6 s: −22% de daño recibido, +velocidad y un pisotón cada 0,7 s que frena y aparta.','beast']]},
 kora:{name:'Kora',title:'La Ariete',origin:'Las galerías de las Minas',tagline:'Kora gana Impulso corriendo, arrastra a la Horda en su Arremetida y la arrolla en una Estampida.',role:'tanque',color:'#c9794a',glow:'#ffe0c2',stats:[170,9,.2,143,86,650,false],weapon:'Hombreras de hierro',arena:'minas',setName:'Galería Derrumbada',
  fantasy:'Tanque de impulso: correr acumula Impulso que potencia sus golpes; arrastra y estrella a la Horda contra sí misma.',
  silhouette:'Capataz robusta de torso ancho, casco minero con farol y hombreras de hierro remachado; delantal de cuero y botas reforzadas.',
  history:'Kora era la capataz de las carretas de mineral de las Minas cuando el derrumbe cerró la galería con cuarenta personas dentro. Empujó la carreta más pesada con el hombro hasta que la roca cedió. No fue fuerza: fue no parar. Desde entonces corre hacia cualquier cosa que cierre una salida, y descubrió que lo que se mueve rápido pesa más de lo que parece. No se detiene a mirar atrás; todos los que salieron ya la siguen.',
  passive:['Impulso','Moverte acumula Impulso (0–100) que suma +0,4% de daño a tus básicos y potencia Arremetida y Pisotón; si te quedas quieta, lo pierdes.'],
  weakness:'Sin moverse es una tanque lenta: sin Impulso sus habilidades pegan poco, y jefes y élites no se arrastran, solo reciben el golpe.',
  voices:['No me frenes. No hace falta.','Salieron todos. Ahora, yo.','Frené… por primera vez…'],
  skins:[['Capataz de Hierro','Casco con visera de soldador, delantal de herrero chamuscado y hombreras de hierro con remaches dorados.','Cuando las Minas dejaron de dar mineral, Kora forjó su propia armadura con los rieles que sobraron. Cada remache es una carreta que no volvió.'],['Capataz de Cobre','Armadura de cobre verdoso con capa de lona y hombreras ornadas con remaches.','El cobre se pone verde con el tiempo. Kora no lo pule: cada mancha es una galería que aguantó.']],
  skills:[['Arremetida de Ariete','kor_ram',28,8000,230,48,0,1.3,'Arremete en línea arrastrando hasta seis comunes y estrellándolos contra los vecinos. Gasta Impulso para pegar más.','ram'],
   ['Pisotón de Impulso','kor_quake',26,8200,0,115,0,1.4,'Golpea el suelo: daña, frena y empuja a los comunes; gasta la mitad del Impulso para pegar más fuerte.','quake'],
   ['Cabeza Gacha','kor_brace',22,10500,0,0,3500,0,'3,5 s de armadura y coraza: ningún freno ni aturdimiento te detiene, y ganas Impulso al doble.','brace'],
   ['Estampida','kor_stampede',0,40000,420,70,1600,.7,'Carrera guiada de 1,6 s que arrolla a todos los que cruzas y termina en un pisotón enorme.','stampede']]}
};
Object.assign(ASCENSION, SIETE);
if(typeof module !== 'undefined') module.exports = SIETE;
