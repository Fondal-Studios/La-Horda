"use strict";
/* ============================================================
   js/data/codex-book-text.js
   EL LIBRO DE LA HORDA — textos del Códice como eje narrativo (datos, no lógica).
   Lógica de disparo/omisión/persistencia: js/systems/codex-narrative.js · visor animado:
   js/ui/codex/codex-book.js · ilustraciones procedurales: js/ui/codex/codex-book-art.js.
   Canon: docs/lore/LA_HORDA_LORE_BIBLE.md. Guía de estilo y reglas por arena: docs/lore/LIBRO_TINTA_CHINA.md.
   NARRADOR: el Hechicero Supremo, en primera persona y en voseo rioplatense. Es un hechicero viejo y cansado que escribe con tinta
   de hollín para el guardián que lo va a leer. EL LIBRO ES SU ÚNICA VOZ: ya no hay ficha previa a la arena ni consejos suyos en
   la partida (js/ui/run-intro.js, js/systems/tutorial.js). Por eso acá no se explican mecánicas: se cuentan hechos, nombres y cosas.
   (Antes narraba Ismena, la escriba; ella sigue siendo la autora de la Crónica de la Noche del Regreso, que NO se toca.)
   Tono (biblia §5 y §9): habla CLARO y la sospecha va en una frase al final, nunca en el medio. Arenas 1-3 sin ninguna sospecha;
   primera grieta en la 4 (insiste en cuidar el cristal); más interés por los cristales que por el guardián en la 5-6; descarta
   la advertencia del Tercero en la 7. NO adelanta la traición: que fue el Primero de los Cuatro y que se quedó con la Horda por
   decisión propia recién se confiesa en el fragmento de la Arena Infernal, cuando ya la viviste. Ningún texto de antes de ese
   fragmento dice que él fue Guardián ni que los cristales sean para él.
   Cada página trae su propia información; lo que ya cuentan el prólogo o la victoria (js/data/story-text.js,
   js/systems/campaign-story.js, js/systems/crystals.js) no se copia acá: se complementa.
   Una "página" del libro = {kicker, title, text, art}. `art` es el nombre de una ilustración
   procedural ("tapa", "horda"...) o "arena:<id>" (la panorámica real de esa arena, teñida de tinta).
   Los datos de sistemas (niveles, talentos, Brasas...) se verificaron contra el código; si cambian las
   reglas, se cambia el texto acá (tools/items/t_codex_book.js chequea la cobertura de temas y
   tools/ux/test-libro-unico.js el vocabulario, el canon por arena y el largo).
   ============================================================ */

// Firma de narrador (pie de cada página del visor y de la tarjeta del fragmento en la victoria).
const BOOK_NARRATOR = "El Hechicero";
const BOOK_NARRATOR_SIGN = "— El Hechicero Supremo";

// GRAN INTRODUCCIÓN: se OFRECE una vez, al volver al menú tras la primera arena (y se puede revisitar desde el Códice).
// `recap` (opcional): texto de la misma página para quien YA leyó el prólogo de la Ciudad (save.storyPrologueSeen, p. ej. en
// cooperativo): cuenta lo que el prólogo no dijo en vez de repetirlo. Misma cantidad de páginas, mismo título y mismo arte.
const BOOK_INTRO_PAGES = [
  {kicker:"EL CÓDICE", title:"EL LIBRO DE LA HORDA", art:"tapa",
   text:"Escribo con tinta de hollín sobre pergamino de ciudad quemada. Soy el Hechicero Supremo y ya casi no duermo. Si estas hojas te llegaron, elegiste a tu guardián, y vas a leerme de a poco, entre una guerra y la siguiente. Pasá la página."},
  {kicker:"ANTES DE TODO", title:"CUATRO GUARDIANES, CUATRO CRISTALES", art:"guardianes",
   text:"Hace siglos, cuatro Guardianes sostenían un sello, y el sello eran cuatro cristales. Mientras los cuatro aguantaron, la Horda quedó del otro lado y el mundo pudo sembrar y enterrar a sus muertos en paz. A los cuatro los conocí. Conozco el peso de sus armaduras.",
   recap:"Cuatro Guardianes, cuatro cristales: eso ya lo sabés. Mientras estuvieron los cuatro, la Horda siguió del otro lado y los muertos se enterraban de a uno, con nombre. Yo los conocí. Conozco el peso de sus armaduras."},
  {kicker:"EL ENEMIGO", title:"LA HORDA NO MUERE", art:"horda",
   text:"Un ejército se rinde cuando se queda sin hombres. La Horda no se queda sin nada, porque es la maldad que hay en el mundo y eso no se mata. Corrompe. Los monstruos que hoy cuidan los cristales tuvieron nombre y juramento. Algunos tenían hijos. Acordate cuando los tengas enfrente."},
  {kicker:"LA NOCHE DEL REGRESO", title:"LAS CAMPANAS SONARON SOLAS", art:"arena:ciudad",
   text:"A medianoche las campanas sonaron sin manos en las cuerdas. Cuando llegó la guardia, las puertas seguían cerradas y la Horda ya estaba adentro. La muralla aguantó hasta el amanecer, y a dos de cada tres los enterraron ahí mismo. Yo hablé desde el humo, porque de mi lado no se puede cruzar.",
   recap:"La noche de las campanas ya la viste. Lo que no viste: la guardia de la muralla no dio un paso atrás aunque la Horda estuviera adentro, y por eso la ciudad sigue en pie, maldita y en pie. Yo hablé desde el humo; de mi lado no se puede cruzar."},
  {kicker:"LA GUERRA", title:"LAS CICATRICES", art:"cicatriz",
   text:"Los Guardianes fueron cayendo de a uno. Donde cayó cada uno, la tierra se abrió y no volvió a cerrar. Les decimos Cicatrices. Juntas dibujan un camino de diez arenas, y vas a recorrerlo de a una, hasta el fondo. Yo te marco el rumbo.",
   recap:"La grieta del suelo tiene hermanas: diez arenas, una tras otra, hasta el fondo. Cada Cicatriz late distinto según los cristales que lleves encima. Los Guardianes cayeron de a uno, y de cada caída quedó una marca. Yo te marco el rumbo."},
  {kicker:"QUIEN TE GUÍA", title:"UN GUÍA CON ALAS DE LUZ", art:"hechicero",
   text:"Soy la figura de luz que salió del humo. Tengo alas, dicen los que me vieron, y no los corrijo. Conozco cada cristal y a cada Guardián, por eso puedo llevarte hasta ellos. Con cada cristal que junte tu mano, el sello está más cerca de volver. Escuchame y llegás al fondo.",
   recap:"Ya me oíste en el humo; ahora me ves. Conozco cada cristal y a cada Guardián, por eso puedo llevarte hasta ellos. Con cada uno que juntes, el sello está más cerca de volver. Escuchame y llegás al fondo."},
  {kicker:"TU MISIÓN", title:"SOBREVIVIR", art:"mision",
   text:"Te pido una sola cosa: seguir con vida. Cada arena se gana resistiendo hasta que la noche afloja, y al final espera alguien que no quiere dejarte pasar. Si un compañero cae, volvé a buscarlo mientras tenga el cuerpo tibio."},
  {kicker:"UN LIBRO QUE SE ESCRIBE SOLO", title:"SEGUÍ LEYENDO", art:"libro",
   text:"Cada arena que termines suma una hoja a este libro: qué pasó ahí, quién cayó, qué quedó. Leelas cuando quieras, que el libro espera. Si hoy no tenés ganas, saltealo y buscalo después en Menú › Códice › Libro. Yo sigo escribiendo."}
];

// CARGA CORTA: una sola página, antes de entrar a cada arena de la campaña (solo, nunca en sala). Es LO ÚNICO que se ve al entrar:
// dos o tres frases de la escena, sin consejos ni mecánicas. Ver el canon por arena en la cabecera.
const BOOK_SHORT_LINES = {
  ciudad:    "Las campanas suenan sin manos. Las camas de la guardia están hechas y vacías. El resto de la ciudad espera detrás de las puertas.",
  fortaleza: "Los hornos siguen encendidos y no queda un solo obrero. De los techos cuelga una cadena que alguien dejó a medio forjar.",
  bosque:    "Entre los menhires la niebla se pega a la ropa y huele a tierra removida. Acá espera el más viejo de los Cuatro, o lo que la niebla dejó de él.",
  micelial:  "Esta cueva respira y repite las voces de los que pasaron, y a veces una que nadie reconoce. No te detengas a oírlas. El cristal, mejor que lo cuide yo.",
  hielo:     "En la cima el invierno dejó de ser una estación. El Segundo Guardián escribió cartas hasta que se le congeló la mano. El cristal tiene que llegar entero.",
  acuatica:  "Este mar no existía hasta que movieron el segundo cristal. Un faro sin costa sigue encendido sobre el agua. Los cristales primero; lo demás, después.",
  laberinto: "El Tercero levantó estos muros para esconderse, y la piedra le fue subiendo por el cuerpo. Si te habla, no lo escuches. Traeme el cristal.",
  abismo:    "Tres cristales pesan más de lo que el suelo aguanta, y el suelo cedió. Desde acá no se vuelve. Si dudás, seguí igual.",
  minas:     "Otros bajaron antes y rayaron sus nombres en la roca. Algunas cuentas de días se cortan a mitad de raya. No las leas. Seguí bajando.",
  infernal:  "Acá abajo no hay cielo, y la Horda tiene casa. En el fondo hay alguien encadenado; no le des tu atención. Te espero en el centro, con los cristales."
};

// FRAGMENTOS: uno por arena, se ganan al completarla. Cada uno = página de historia (`lore`: una escena de 4 a 6 frases) + página
// "lo que sigue" (`lesson`: qué se abre y para qué sirve, en voz del narrador y sin instrucciones de botones).
// topic: tema de sistema que cubre (lo usa el chequeo de cobertura). lesson sin presión de compra.
// La victoria ya muestra, en pasos propios, las últimas palabras del Guardián y la línea del Hechicero sobre el cristal (story.js,
// crystals.js): el `lore` de acá NO las repite, las acompaña.
const BOOK_FRAGMENTS = {
  ciudad: {title:"LA PRIMERA CICATRIZ", topic:"modos", topicTitle:"A QUÉ SE JUEGA", topicArt:"modos",
    lore:"Al amanecer quedaban el humo y las campanas, quietas. Las cuerdas estaban atadas a los ganchos; nadie las había tirado. Los que sobrevivieron cubrieron a los muertos de la plaza con lonas de panadería, porque no había otra tela. Frente a la puerta sur apareció una grieta fina en el empedrado. Fue la primera Cicatriz.",
    lesson:"Diez arenas, en orden, solo o con amigos: cada una se abre cuando ganás la anterior. Aparte quedan la Convergencia, cinco contra cinco, y el Coliseo, que reúne a cuatro equipos de dos. Se abren al terminar la campaña. La Horda Infinita se abre antes, al vencer en la Fábrica."},
  fortaleza: {title:"UNA FÁBRICA QUE NO PARA", topic:"progresion", topicTitle:"CRECER SIN APURO", topicArt:"progreso",
    lore:"Los que levantaron la Fábrica se fueron antes de que llegara la Horda, o se los llevaron. Las máquinas siguieron sin ellos: vapor, cintas con piezas para nadie, un capataz de hierro que todavía cuenta turnos. Los hornos no se apagaron. De los techos cuelga una cadena con el último eslabón abierto.",
    lesson:"Cada victoria deja experiencia, oro y un cofre. La experiencia le sube el nivel al guardián, y cada guardián lleva el suyo: probar a otro no te quita nada. El oro lo gastás cuando quieras, lejos de la batalla."},
  bosque: {title:"EL GUARDIÁN DE LA NIEBLA", topic:"equipo", topicTitle:"LO QUE LLEVÁS PUESTO", topicArt:"equipo",
    lore:"El más viejo de los Cuatro dormía entre los menhires, y la niebla le había crecido encima hasta las rodillas. Los feéricos le dejaban bellotas sobre la piedra. Seguían ahí, secas, de años. Tenía las manos cerradas sobre el cristal verde. Cuando cayó, pesaba menos que su armadura.",
    lesson:"Lo que sacás de los cofres se equipa en el guardián, lejos de la batalla. Cada pieza tiene su rareza, y las de un mismo set dan algo más cuando se juntan. Las Gemas se ganan peleando y sirven para mejorar un objeto. No se compran."},
  micelial: {title:"LO QUE REPITE EL MICELIO", topic:"maestria", topicTitle:"CADA HABILIDAD SE AFILA", topicArt:"maestria",
    lore:"La cueva crece sola y repite lo que oye. Entre las esporas rotas se oyen nombres de Guardianes, dichos con la voz de quien los llamó hace siglos, y un nombre de más. Lo anoté y lo taché. El hongo repite cualquier cosa. Insisto en cuidarte el cristal verde. Lo que brilla acá abajo termina en la boca de algo.",
    lesson:"Cuanto más usás una habilidad, más se afila: sube su nivel de uso, y esa mejora, chica, se queda para siempre. Los puntos que le das, hasta diez, la cambian: pega más, llega más lejos, dura más y se hace esperar menos. Lo ves en el Códice, en Guardianes."},
  hielo: {title:"CARTAS SIN RESPUESTA", topic:"talentos", topicTitle:"EL ÁRBOL DE TALENTOS", topicArt:"talentos",
    lore:"El Segundo Guardián sostuvo la cima solo, y escribió. Hay veintiséis cartas pegadas al hielo de la celda, con la tinta corrida en venas azules, ninguna con destinatario. Del Guardián quedó poco. El cristal quedó entero.",
    lesson:"Pasado el nivel 40, tu guardián gana puntos para el árbol de talentos de su clase: uno al llegar y otro cada dos niveles. Son pocos y pesan, así que elegí despacio. Hasta ahí, peleá y equipate."},
  acuatica: {title:"EL MAR QUE NO ESTABA", topic:"dificultad", topicTitle:"LA MISMA CAMPAÑA, MÁS DURA", topicArt:"dificultad",
    lore:"Cuando el segundo cristal salió de su sitio apareció agua donde nunca hubo. Una farera llamada Maren llevaba el cuaderno del faro: anotó la hora de la marea y siguió anotando hasta que se le mojó la tinta. Las páginas que se leen dicen que el agua subió sin ruido. Queda la lámpara, encendida. De los cristales no se mojó ninguno.",
    lesson:"Al terminar la campaña en Normal se abre Pesadilla, y al terminarla en Pesadilla, Infierno. La historia es la misma con una Horda más fuerte; a cambio, mejor botín y más experiencia y oro. Nunca es obligatorio."},
  laberinto: {title:"EL TERCERO LEVANTÓ MUROS", topic:"cooperativo", topicTitle:"NADIE PELEA SOLO", topicArt:"cooperativo",
    lore:"Con sus propias manos levantó el Tercero este laberinto, para esconderse de la Horda y de otros. La piedra le fue subiendo por las piernas, y al final solo hablaba con los muros. Cuentan que antes de caer quiso advertir algo. Los que se vuelven piedra dicen muchas cosas. No lo anoto. Ya tenés tres cristales.",
    lesson:"Podés armar una sala con un código o entrar a una abierta: equipos de cuatro, y los lugares vacíos los ocupan bots, siempre marcados como tales. Si alguien cae, ayudalo a levantarse. Al final, la calificación mide lo que aportó cada rol."},
  abismo: {title:"EL PUNTO DE NO RETORNO", topic:"tienda", topicTitle:"EL ORO Y LA TIENDA", topicArt:"tienda",
    lore:"Con tres cristales encima, el suelo cedió. La grieta se abrió bajo el último campamento y se llevó las tiendas, las mulas y una campana que nadie había tocado. Ahora hay ruinas colgando sobre el vacío, y abajo vive algo que no tiene apuro en subir. Se mueve lo que llevaba siglos quieto, y pasa esto. Seguimos hacia donde se abre.",
    lesson:"El oro se gana peleando y se gasta en la Tienda: objetos del día, guardianes nuevos, pieles y cromas. Nada de eso hace falta para ganar. Un guardián de más es, sobre todo, otra manera de pelear."},
  minas: {title:"LA LUZ ES TERRITORIO", topic:"brasas", topicTitle:"LAS BRASAS ✦", topicArt:"brasas",
    lore:"Las Minas guardan lo que dejaron los que bajaron antes: nombres rayados en la roca, cuentas de días que se cortan a mitad de raya. Alguien grabó la palabra luz cuarenta veces, cada vez más chica. Cerbero cuidaba la puerta del fondo. Fue perro de mina, dicen.",
    lesson:"Las Brasas son otra moneda: compran apariencia, o sea pieles y cromas, y piezas de set. No hacen falta para llegar al final. Las piezas también caen peleando, y todo el poder se consigue con el oro que ganás en las arenas."},
  infernal: {title:"EL QUE ELIGIÓ QUEDARSE", topic:"postgame", topicTitle:"LO QUE SIGUE", topicArt:"postgame",
    lore:"Te mentí en lo que importaba. Fui el Primero de los Cuatro, y me quedé con la Horda porque quise: iba a fundir los cristales para ser la Horda. Cuando caí dije que alguien tenía que sostenerla, y lo creí, que es lo peor. Este libro lo escribí yo, con tinta de hollín. Los cristales necesitan portadores. Ahora son ustedes.",
    lesson:"Ganaste la campaña. Quedan la Arena Divina (las Cinco Pruebas), la Horda Infinita, las dificultades Pesadilla e Infierno, la Convergencia y el Coliseo. Tu guardián y tu equipo siguen creciendo en todos. El Códice guarda todo lo que viste.",
    extra:[{kicker:"RESUMEN DEL LIBRO", title:"LO QUE SABÉS AHORA", art:"recap",
      text:"HISTORIA: cuatro Guardianes, cuatro cristales y una Horda que no muere.\nMODOS: campaña, cooperativo, Convergencia, Coliseo, Infinita y Divina.\nPROGRESIÓN: nivel, oro, equipo, maestría, talentos, dificultades. Brasas ✦: solo apariencia."}]}
};

// Temas que el recorrido completo de la campaña tiene que cubrir (el test falla si falta alguno).
const BOOK_REQUIRED_TOPICS = ["modos", "progresion", "equipo", "maestria", "talentos", "dificultad", "cooperativo", "tienda", "brasas", "postgame"];

// Rótulo de cada sección del libro en el Códice.
const BOOK_SECTION = {id:"libro", label:"EL LIBRO", icon:"📖",
  blurb:"La crónica de la Horda, escrita con tinta de hollín por el Hechicero. Releé la introducción o los fragmentos que ya ganaste."};
