"use strict";
/* ============================================================
   js/data/codex-book-text.js
   EL LIBRO DE LA HORDA — textos del Códice como eje narrativo (datos, no lógica).
   Lógica de disparo/omisión/persistencia: js/systems/codex-narrative.js · visor animado:
   js/ui/codex/codex-book.js · ilustraciones procedurales: js/ui/codex/codex-book-art.js.
   Canon: docs/lore/LA_HORDA_LORE_BIBLE.md. NARRADOR: el Hechicero Supremo, en primera persona y en voseo rioplatense
   (antes narraba Ismena, la escriba; ella sigue siendo la autora de la Crónica de la Noche del Regreso, que NO se toca).
   El Libro es la voz ESCRITA del Hechicero: mientras está abierto, él no habla en ningún otro lado (js/systems/codex-narrative.js,
   "un solo narrador a la vez"). Tono (biblia §5 y §9): habla CLARO y la sospecha va en una frase al final, nunca en el medio de
   una instrucción. Arenas 1-3 sin ninguna sospecha; primera grieta en la 4 ("yo te lo cuido"); más interés por los cristales que por
   vos en la 5-6; descarta la advertencia del Tercero en la 7. NO adelanta la traición: que fue el Primero de los Cuatro y que se
   quedó con la Horda por decisión propia recién se confiesa en el fragmento de la Arena Infernal, cuando ya la viviste. Ningún
   texto de antes de ese fragmento dice que él fue Guardián ni que los cristales sean para él.
   Cada página trae su propia información; lo que ya cuentan la ficha, el prólogo o la victoria (js/data/story-text.js,
   js/systems/campaign-story.js, js/systems/crystals.js) no se copia acá: se complementa.
   Una "página" del libro = {kicker, title, text, art}. `art` es el nombre de una ilustración
   procedural ("tapa", "horda"...) o "arena:<id>" (la panorámica real de esa arena, teñida de tinta).
   Los datos de sistemas (niveles, talentos, Brasas...) se verificaron contra el código; si cambian las
   reglas, se cambia el texto acá (tools/items/t_codex_book.js chequea la cobertura de temas).
   ============================================================ */

// Firma de narrador (pie de cada página del visor y de la tarjeta del fragmento en la victoria).
const BOOK_NARRATOR = "El Hechicero";
const BOOK_NARRATOR_SIGN = "— El Hechicero Supremo";

// GRAN INTRODUCCIÓN: se OFRECE una vez, al volver al menú tras la primera arena (y se puede revisitar desde el Códice).
// `recap` (opcional): texto de la misma página para quien YA vio el prólogo de la Ciudad en la ficha previa (save.storyPrologueSeen,
// js/ui/run-intro.js): cuenta lo que el prólogo no dijo en vez de repetirlo. Misma cantidad de páginas, mismo título y mismo arte.
const BOOK_INTRO_PAGES = [
  {kicker:"EL CÓDICE", title:"EL LIBRO DE LA HORDA", art:"tapa",
   text:"Lo escribo yo, el Hechicero Supremo, para que no pelees a ciegas. Si lo estás leyendo, ya elegiste a tu guardián. Pasá la página: antes de seguir tenés que saber contra qué, y cómo se juega."},
  {kicker:"ANTES DE TODO", title:"CUATRO GUARDIANES, CUATRO CRISTALES", art:"guardianes",
   text:"Hace siglos, cuatro Guardianes sostenían un sello hecho de cuatro cristales. Mientras el sello aguantó, la Horda quedó encerrada en su propia dimensión y el mundo pudo dormir. Los conocí a todos.",
   recap:"Cuatro Guardianes, cuatro cristales: eso ya lo sabés. Cada cristal guardaba una parte del sello, y mientras estuvieron los cuatro la Horda siguió encerrada en su propia dimensión y el mundo pudo dormir. Los conocí a todos."},
  {kicker:"EL ENEMIGO", title:"LA HORDA NO MUERE", art:"horda",
   text:"La Horda es la maldad que hay en el mundo, y eso no se mata. No destruye: corrompe. Los monstruos que hoy custodian los cristales alguna vez fueron héroes. Acordate de eso cuando los tengas enfrente: yo no lo olvido."},
  {kicker:"LA NOCHE DEL REGRESO", title:"LAS CAMPANAS SONARON SOLAS", art:"arena:ciudad",
   text:"A medianoche las campanas sonaron sin que nadie tirara de las cuerdas. La Horda ya estaba adentro: atravesó las puertas como atraviesa el frío. Los guardianes de la muralla resistieron hasta el amanecer. Yo hablé desde el humo, porque desde mi lado no puedo cruzar.",
   recap:"La noche de las campanas ya la viste. Lo que falta: los guardianes de la muralla no retrocedieron ni un paso aunque la Horda ya estuviera adentro. Por eso la ciudad sigue en pie. Maldita, pero en pie. Yo hablé desde el humo, porque desde mi lado no puedo cruzar."},
  {kicker:"LA GUERRA", title:"LAS CICATRICES", art:"cicatriz",
   text:"Los Guardianes fueron cayendo, uno por uno. Donde la Horda pasa, la realidad queda herida: son las Cicatrices. Forman un camino de diez arenas, y vas a seguirlo de a una, hasta el fondo. Yo te marco el rumbo.",
   recap:"Esa grieta del suelo no es la única: son diez arenas y vas a seguirlas de a una, hasta el fondo. Cada Cicatriz late distinto, según cuántos cristales hayas juntado. Los Guardianes fueron cayendo uno por uno. Yo te marco el rumbo."},
  {kicker:"QUIEN TE GUÍA", title:"UN GUÍA CON ALAS DE LUZ", art:"hechicero",
   text:"Soy la figura de luz que salió del humo. Conozco cada cristal y cada Guardián, y por eso puedo guiarte hasta ellos. Con cada uno que juntes, el sello está más cerca de volver. Escuchame con atención y vas a llegar hasta el fondo.",
   recap:"Ya me oíste en el humo; ahora me ves. Conozco cada cristal y cada Guardián, y por eso puedo guiarte hasta ellos. Con cada uno que juntes, el sello está más cerca de volver. Escuchame con atención y vas a llegar hasta el fondo."},
  {kicker:"TU MISIÓN", title:"SOBREVIVIR", art:"mision",
   text:"Tu único trabajo es seguir con vida. Cada arena tiene 10 niveles y cada nivel dura un ratito: aguantá hasta que el reloj llegue a cero. En el último hay un jefe: derrotalo y ganás la arena. Se pierde si caen todos los guardianes de tu equipo; si un compañero cae, mantené ✚ a su lado para levantarlo."},
  {kicker:"UN LIBRO QUE SE ESCRIBE SOLO", title:"SEGUÍ LEYENDO", art:"libro",
   text:"Cada vez que termines una arena, sumo un fragmento: qué pasó ahí y cómo se juega lo que viene. Podés saltear esta lectura cuando quieras y volver a abrirla desde Menú › Códice › Libro. Yo sigo escribiendo."}
];

// CARGA CORTA: una sola página, antes de entrar a cada arena de la campaña (solo, nunca en sala). Es la ficha del Hechicero en
// versión corta y hace de su frase de apertura: si la página se leyó, la ficha de la arena (run-intro.js) NO repite esa frase.
// Por eso cada línea lleva el mismo gesto del arco que ARENA_BRIEF[arena].say (sin la sospecha adelantada).
const BOOK_SHORT_LINES = {
  ciudad:    "Esta es tu ciudad y la Horda volvió. No podés salvarlos a todos, pero vas a intentarlo. Yo te marco el camino.",
  fortaleza: "Seguí la Cicatriz hasta esta fábrica que no para nunca. Los que la hicieron se fueron; las máquinas todavía no se enteraron.",
  bosque:    "Acá duerme el más viejo de los Cuatro, el de la niebla, y lo que duerme ya no es él. Traé su cristal: yo sé cómo cuidarlo.",
  micelial:  "Una caverna viva que repite voces de hace siglos. No escuches a las esporas: mienten con voces conocidas.",
  hielo:     "Acá espera el Segundo Guardián. Resistió solo, esperando a alguien que no volvió. No le debas nada: tomá el cristal.",
  acuatica:  "Este mar no estaba antes del segundo cristal: es el precio. Protegelos. Son lo único que importa.",
  laberinto: "El Tercero levantó estos muros para esconderse. Si te habla, no le creas: la piedra le comió el juicio. Traeme… traé el tercer cristal.",
  abismo:    "Tres cristales y el mundo ya no los aguanta. Es el punto de no retorno. Dudar es natural: seguí igual.",
  minas:     "Debajo del Abismo hay minas, y debajo, una puerta. Acá la luz es territorio. No leas lo que dejaron escrito los que bajaron antes.",
  infernal:  "La dimensión de la Horda. Alguien está encadenado en el fondo: no le hagas caso. Y traeme los cristales."
};

// FRAGMENTOS: uno por arena, se ganan al completarla. Cada uno = página de historia + página "cómo se juega".
// topic: tema de sistema que enseña (lo usa el chequeo de cobertura). lesson sin presión de compra.
// La victoria ya muestra, en pasos propios, las últimas palabras del Guardián y la línea del Hechicero sobre el cristal (story.js,
// crystals.js): el `lore` de acá NO las repite, las acompaña.
const BOOK_FRAGMENTS = {
  ciudad: {title:"LA PRIMERA CICATRIZ", topic:"modos", topicTitle:"A QUÉ SE JUEGA", topicArt:"modos",
    lore:"La Ciudad Maldita resistió la noche, pero quedó marcada: una grieta en el suelo que no es de piedra. La Horda deja heridas así por donde pasa. Guardé esta para que la compares con las que vienen. Ya vas a ver que cada una late distinto.",
    lesson:"MODO CAMPAÑA: las diez arenas en orden, solo o con amigos; cada una se abre al ganar la anterior. Fuera de la campaña están Convergencia (5 contra 5, tres carriles) y Coliseo (2 contra 2). Al ganar la Fábrica Sin Fin se abre la Horda Infinita."},
  fortaleza: {title:"UNA FÁBRICA QUE NO PARA", topic:"progresion", topicTitle:"CRECER SIN APURO", topicArt:"progreso",
    lore:"La Horda contaminó las máquinas de una civilización que ya no está. Los que construyeron la Fábrica desaparecieron; las máquinas todavía no se enteraron. De los techos colgaba una cadena sin terminar: la última que se forjó.",
    lesson:"Cada victoria te da experiencia, oro y un cofre. La XP sube el nivel de tu guardián, y cada guardián lleva su propio nivel: probar otro no te hace perder nada. El oro se gasta fuera de la partida, cuando vos quieras."},
  bosque: {title:"EL GUARDIÁN DE LA NIEBLA", topic:"equipo", topicTitle:"LO QUE LLEVÁS PUESTO", topicArt:"equipo",
    lore:"El más viejo de los Cuatro dormía entre menhires, y la niebla no era su manto: era su celda. Liberarlo fue lo único que podías hacer por él. Te dejó su cristal al caer, y lo escribo hoy para que sepas que lo que dormía alguna vez tuvo nombre.",
    lesson:"Los objetos del cofre se equipan en tu guardián, fuera de la partida. Tienen rarezas, y los sets dan bonos al juntar sus piezas. Las Gemas ◆ se ganan jugando y sirven para subir el nivel de un objeto; no se compran."},
  micelial: {title:"LO QUE REPITE EL MICELIO", topic:"maestria", topicTitle:"CADA HABILIDAD SE AFILA", topicArt:"maestria",
    lore:"Esta caverna crece y repite voces que oyó hace siglos. Entre las esporas rotas se oyen nombres de Guardianes, y también uno que no debería estar. Lo anoto en este libro y sigo: las esporas repiten cualquier cosa que hayan oído.",
    lesson:"Cuanto más usás una habilidad, más sube su nivel de uso: una mejora mínima y permanente. Los puntos que invertís en ella (hasta 10) la transforman: más daño, más área, más duración y menos espera. Lo ves en Códice › Guardianes › Maestría."},
  hielo: {title:"CARTAS SIN RESPUESTA", topic:"talentos", topicTitle:"EL ÁRBOL DE TALENTOS", topicArt:"talentos",
    lore:"El Mago Gélido resistió solo, escribiendo cartas que nadie contestó. Quedaron pegadas al hielo de su celda, con la tinta corrida. No hay a quién entregarlas. La Cicatriz pasó por acá antes que nosotros, y se ve.",
    lesson:"Desde el nivel 40, tu guardián gana puntos para el árbol de talentos de su clase: uno al llegar y otro cada dos niveles. Son pocos y pesan, así que elegí con cabeza. Hasta ahí, concentrate en jugar y en equiparte."},
  acuatica: {title:"EL MAR QUE NO ESTABA", topic:"dificultad", topicTitle:"LA MISMA CAMPAÑA, MÁS DURA", topicArt:"dificultad",
    lore:"Con el segundo cristal en tu bolsa apareció un mar donde nunca hubo agua; la realidad se dobla alrededor de ellos, ya te lo dije. En un faro sin costa, una farera llamada Maren anotó la noche en que llegó la marea. Sus notas son lo único que quedó de ese faro.",
    lesson:"Al terminar la campaña en Normal se abre Pesadilla, y al terminarla en Pesadilla, Infierno. Es la misma historia con una horda más fuerte; a cambio, mejor botín y más XP y oro. Nunca es obligatorio."},
  laberinto: {title:"EL TERCERO LEVANTÓ MUROS", topic:"cooperativo", topicTitle:"NADIE PELEA SOLO", topicArt:"cooperativo",
    lore:"El Tercer Guardián construyó este laberinto para esconderse de la Horda, y de otros. La piedra le fue subiendo por el cuerpo hasta comerle el juicio. Cada muro que cerró fue un camino menos hacia los cristales. Ya los tenés a los tres. Falta poco.",
    lesson:"Podés crear una sala con un código o sumarte a una abierta con JUGAR YA: equipos de cuatro, y los lugares libres los ocupan bots, siempre marcados. Si alguien cae, mantené ✚ a su lado. Al final, la calificación mide lo que aportó tu rol."},
  abismo: {title:"EL PUNTO DE NO RETORNO", topic:"tienda", topicTitle:"EL ORO Y LA TIENDA", topicArt:"tienda",
    lore:"Tres cristales pesan más de lo que el mundo aguanta, y el suelo se rasgó bajo tus pies. Es lo que pasa cuando se mueve lo que llevaba siglos quieto. El mundo se rompió, sí, pero se rompió hacia donde teníamos que ir.",
    lesson:"El oro se gana jugando y se gasta en la Tienda: objetos del día, nuevos guardianes, skins y cromas. Nada de eso es obligatorio para ganar; cada guardián extra es, sobre todo, otra forma de jugar."},
  minas: {title:"LA LUZ ES TERRITORIO", topic:"brasas", topicTitle:"LAS BRASAS ✦", topicArt:"brasas",
    lore:"Las Minas guardan lo que dejaron los que bajaron antes: nombres grabados en la roca, cuentas de días que se cortan de golpe. Acá la oscuridad también pega. Cerbero custodiaba el umbral, y el umbral ya quedó atrás.",
    lesson:"Las Brasas ✦ son una moneda aparte y solo compran apariencia: skins y cromas. Nunca compran poder ni hacen falta para llegar al final. Todo el poder se consigue jugando, con el oro que ganás en las arenas."},
  infernal: {title:"EL QUE ELIGIÓ QUEDARSE", topic:"postgame", topicTitle:"LO QUE SIGUE", topicArt:"postgame",
    lore:"Te mentí en lo que importaba. Fui el Primero de los Cuatro, y me quedé con la Horda por decisión propia: quería fundir los cristales para ser la Horda. Caí diciendo que alguien tenía que sostenerla, y lo creí. Este libro lo escribí yo. Ahora los cristales necesitan portadores, y son ustedes.",
    lesson:"Ganaste la campaña. Quedan la Arena Divina (las Cinco Pruebas), la Horda Infinita, las dificultades Pesadilla e Infierno, Convergencia y Coliseo. Tu guardián y tu equipo siguen creciendo en todos. El Códice guarda todo lo que viste.",
    extra:[{kicker:"RESUMEN DEL LIBRO", title:"LO QUE SABÉS AHORA", art:"recap",
      text:"HISTORIA: cuatro Guardianes, cuatro cristales, y una Horda que no muere.\nMODOS: campaña, cooperativo, Convergencia, Coliseo, Horda Infinita y Divina.\nPROGRESIÓN: XP y nivel, oro y Tienda, equipo y Gemas, maestría, talentos, dificultades. Las Brasas ✦ son solo apariencia."}]}
};

// Temas que el recorrido completo de la campaña tiene que cubrir (el test falla si falta alguno).
const BOOK_REQUIRED_TOPICS = ["modos", "progresion", "equipo", "maestria", "talentos", "dificultad", "cooperativo", "tienda", "brasas", "postgame"];

// Rótulo de cada sección del libro en el Códice.
const BOOK_SECTION = {id:"libro", label:"EL LIBRO", icon:"📖",
  blurb:"La historia de la Horda y cómo se juega, escrita y contada por el Hechicero. Releé la introducción o los fragmentos que ya ganaste."};
