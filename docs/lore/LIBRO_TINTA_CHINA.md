# El Libro de tinta china

El Hechicero no habla en ningún otro lado: su única voz es el Libro de la Horda. Este documento resume qué se quitó, qué quedó
y cómo se escribe.

## Secuencia final

1. **Primera vez que se abre el juego (instalación nueva):** el Libro se lee sobre la pantalla de carga del título, desde la tapa,
   con las 8 páginas de la introducción (`codexBookBoot`, `js/ui/codex/codex-book.js`). No bloquea ni demora la carga (los
   scripts y el arte siguen bajando debajo), se saltea con Saltar, toque o Esc y, si el juego termina de cargar antes que la
   lectura, avisa "El juego ya cargó" sin cortarse solo. Saltarla = *vista*; llegar a la última página = *leída* (`introSeen` /
   `introRead`, igual que antes). No se repite. Queda en Códice › El Libro. Ya no existe la oferta "Leer el Libro / Después"
   al volver de la primera arena. Invitaciones (`?room=`, `?cw=`, `?return=`) y las pruebas automáticas viejas no lo disparan.
2. **Al entrar a una arena de campaña en solitario:** página del Libro de la arena (carga corta, ≈3 s, saltable, tope
   `BOOK_SHORT_MAX` = 3 por arena, apagable) → **se cierra del todo** → **ficha de arena** → partida. Nunca juntos en pantalla.
3. **La ficha de arena** (`js/ui/run-intro.js` + `js/ui/arena-briefing.js`, textos en `js/data/arena-brief.js`) es una tarjeta
   de interfaz neutra, rotulada "FICHA DE ARENA": objetivo, qué amenaza, qué ayuda y las celdas mecánica / peligro / jefe /
   botín. **Solo para novatos** (la cuenta todavía no completó esa arena: `runIntroNovice`). Los veteranos entran directo tras
   el Libro y la tienen a pedido en Códice › Arenas y en la pausa › Ayuda. En la primera partida del jugador nuevo (`first`)
   no hay página del Libro: va directo a la ficha. En cooperativo online no se usa.
4. **Durante la partida** el Hechicero no aconseja ni comenta.

## Qué se quitó

- De la ficha: el retrato con alas dibujadas en vivo, el nombre "EL HECHICERO SUPREMO", la frase de apertura (`say`), el fondo
  dorado y la música del "vals angelical" (`_introOpen` ya no existe como pantalla). Los textos kill/help/goal se reescribieron
  en estilo directo.
- De la partida: los consejos hablados del Hechicero (recarga, vida, energía, élite, jefe, definitiva, refuerzos, y todas las
  llamadas `tutSay` de las arenas: trampas, runas, fisuras, corrientes, sellos...). `tutSay` descarta todo lo que no sea una
  indicación neutra de controles (moverse, atacar, habilidad, "+", revivir; sin retrato ni nombre, `data-face="none"`) o la voz de
  otro personaje (jefes, Guardianes, Crónicas). Se mantiene el jefe final de la Infernal hablando (`TUT_VILLAIN`: es historia,
  no consejo). El comentarista "EL HECHICERO" de las voces de jefes (`storySay`) se descarta. Los micro-tutoriales de arena con
  su voz quedaron apagados (`ARENA_TUT_ON = false`). La escena de entrada en cooperativo (voz del Hechicero) se eliminó.
- Los botones "Repetir la lección" y "Guía del Hechicero" (ahora "Guía de juego").
- La oferta posterior a la primera arena.

## Dónde quedó la información imprescindible

Ficha de novatos al entrar; Códice › Arenas (objetivo, reglas, peligros); pausa › Ayuda (objetivo, regla propia, amenaza, ayuda y
Guía de juego); cartel del HUD (nivel n/10 y objetivo corto, avisos de peligro del propio mundo). No se tocaron: escena de
campamento y pantalla de victoria (voz del Hechicero entre arenas, fuera de la entrada y de la partida).

## Guía de estilo del Libro

Tinta china sobre pergamino viejo, estilo Diablo 2/3. Un hechicero viejo y cansado escribe para el guardián que lo va a leer.

- Hechos y nombres propios antes que adjetivos. Imágenes físicas: hierro, hollín, lonas de panadería, bellotas secas, cartas
  pegadas al hielo. Un detalle concreto e inesperado por página.
- Frases cortas; una de cinco palabras o menos entre las largas. No repetir la estructura entre páginas.
- Voseo rioplatense sobrio. Sin explicar mecánicas (nada de "mantené", botones, fases, cooldown, listas de peligros).
- Prohibido: "no es X, es Y", tríadas de adjetivos, susurros/sombras/ecos/tapiz, "en lo profundo", "ancestral" como muletilla,
  moraleja final, exclamaciones, preguntas retóricas, comparaciones genéricas ("como un..."), rayas largas.
- Página de arena = una escena de 3 a 6 frases (fragmento) y una carga de 2 a 4 frases. Largo: 120–360 caracteres por página,
  carga ≤165. Todo se valida en `tools/ux/test-libro-unico.js`.
- Forma: pergamino oscuro, manchas de tinta y ceniza en los bordes, capitular en sangre seca, título de trazo irregular
  (filtro SVG estático), ilustración de arena lavada a tinta. Sin fuentes nuevas ni animaciones nuevas.

## Regla de canon por arena

| Arena | Qué se permite |
|---|---|
| Introducción y 1–3 (Ciudad, Fábrica, Ruinas) | Habla claro. Ninguna sospecha. |
| 4 (Reino Fúngico) | Primera grieta: insiste en cuidar el cristal. |
| 5–6 (Gélida, Acuática) | Más interés por los cristales que por el guardián. |
| 7 (Laberinto) | Descarta la advertencia del Tercero ("No lo anoto"). |
| 8–9 | Sin traición; más urgencia y un "no las leas" en las Minas. |
| 10 (Infernal) | Única que confiesa: fue el Primero de los Cuatro, se quedó con la Horda porque quiso. |

La Crónica de la Noche del Regreso de Ismena (`js/data/story-text.js`) no se tocó.

## Pruebas

- `tools/ux/test-libro-unico.js`: vocabulario, largo y canon de todos los textos; secuencia Libro → ficha (novatos) → partida en las 10 arenas, sin superposición; veteranos solo con el Libro; tope `BOOK_SHORT_MAX`; Esc/toque; la partida sin voz del Hechicero; datos a pedido; primer despliegue del Libro en la pantalla de carga (844x390, 1280x720 y `?lazy=0`, con medición del tiempo hasta pantalla interactiva y sin repetirse).
- `tools/items/t_codex_book.js`, `t_codex_book_logic.js`, `t_story.js`, `tools/ux/test-first-minute-taps.js`, `test-arena-briefing-tutorial.js`, `test-text-overflow.js`: actualizadas sin debilitar lo que miden.

## Textos nuevos del Libro

### Introducción (8 páginas)

1. **EL LIBRO DE LA HORDA** (EL CÓDICE)
   > Escribo con tinta de hollín sobre pergamino de ciudad quemada. Soy el Hechicero Supremo y ya casi no duermo. Si estas hojas te llegaron, elegiste a tu guardián, y vas a leerme de a poco, entre una guerra y la siguiente. Pasá la página.

2. **CUATRO GUARDIANES, CUATRO CRISTALES** (ANTES DE TODO)
   > Hace siglos, cuatro Guardianes sostenían un sello, y el sello eran cuatro cristales. Mientras los cuatro aguantaron, la Horda quedó del otro lado y el mundo pudo sembrar y enterrar a sus muertos en paz. A los cuatro los conocí. Conozco el peso de sus armaduras.
   > _Versión para quien ya leyó el prólogo:_ Cuatro Guardianes, cuatro cristales: eso ya lo sabés. Mientras estuvieron los cuatro, la Horda siguió del otro lado y los muertos se enterraban de a uno, con nombre. Yo los conocí. Conozco el peso de sus armaduras.

3. **LA HORDA NO MUERE** (EL ENEMIGO)
   > Un ejército se rinde cuando se queda sin hombres. La Horda no se queda sin nada, porque es la maldad que hay en el mundo y eso no se mata. Corrompe. Los monstruos que hoy cuidan los cristales tuvieron nombre y juramento. Algunos tenían hijos. Acordate cuando los tengas enfrente.

4. **LAS CAMPANAS SONARON SOLAS** (LA NOCHE DEL REGRESO)
   > A medianoche las campanas sonaron sin manos en las cuerdas. Cuando llegó la guardia, las puertas seguían cerradas y la Horda ya estaba adentro. La muralla aguantó hasta el amanecer, y a dos de cada tres los enterraron ahí mismo. Yo hablé desde el humo, porque de mi lado no se puede cruzar.
   > _Versión para quien ya leyó el prólogo:_ La noche de las campanas ya la viste. Lo que no viste: la guardia de la muralla no dio un paso atrás aunque la Horda estuviera adentro, y por eso la ciudad sigue en pie, maldita y en pie. Yo hablé desde el humo; de mi lado no se puede cruzar.

5. **LAS CICATRICES** (LA GUERRA)
   > Los Guardianes fueron cayendo de a uno. Donde cayó cada uno, la tierra se abrió y no volvió a cerrar. Les decimos Cicatrices. Juntas dibujan un camino de diez arenas, y vas a recorrerlo de a una, hasta el fondo. Yo te marco el rumbo.
   > _Versión para quien ya leyó el prólogo:_ La grieta del suelo tiene hermanas: diez arenas, una tras otra, hasta el fondo. Cada Cicatriz late distinto según los cristales que lleves encima. Los Guardianes cayeron de a uno, y de cada caída quedó una marca. Yo te marco el rumbo.

6. **UN GUÍA CON ALAS DE LUZ** (QUIEN TE GUÍA)
   > Soy la figura de luz que salió del humo. Tengo alas, dicen los que me vieron, y no los corrijo. Conozco cada cristal y a cada Guardián, por eso puedo llevarte hasta ellos. Con cada cristal que junte tu mano, el sello está más cerca de volver. Escuchame y llegás al fondo.
   > _Versión para quien ya leyó el prólogo:_ Ya me oíste en el humo; ahora me ves. Conozco cada cristal y a cada Guardián, por eso puedo llevarte hasta ellos. Con cada uno que juntes, el sello está más cerca de volver. Escuchame y llegás al fondo.

7. **SOBREVIVIR** (TU MISIÓN)
   > Te pido una sola cosa: seguir con vida. Cada arena se gana resistiendo hasta que la noche afloja, y al final espera alguien que no quiere dejarte pasar. Si un compañero cae, volvé a buscarlo mientras tenga el cuerpo tibio.

8. **SEGUÍ LEYENDO** (UN LIBRO QUE SE ESCRIBE SOLO)
   > Cada arena que termines suma una hoja a este libro: qué pasó ahí, quién cayó, qué quedó. Leelas cuando quieras, que el libro espera. Si hoy no tenés ganas, saltealo y buscalo después en Menú › Códice › Libro. Yo sigo escribiendo.

### Página de carga de cada arena (lo que se lee al entrar)

- **ciudad**: Las campanas suenan sin manos. Las camas de la guardia están hechas y vacías. El resto de la ciudad espera detrás de las puertas.
- **fortaleza**: Los hornos siguen encendidos y no queda un solo obrero. De los techos cuelga una cadena que alguien dejó a medio forjar.
- **bosque**: Entre los menhires la niebla se pega a la ropa y huele a tierra removida. Acá espera el más viejo de los Cuatro, o lo que la niebla dejó de él.
- **micelial**: Esta cueva respira y repite las voces de los que pasaron, y a veces una que nadie reconoce. No te detengas a oírlas. El cristal, mejor que lo cuide yo.
- **hielo**: En la cima el invierno dejó de ser una estación. El Segundo Guardián escribió cartas hasta que se le congeló la mano. El cristal tiene que llegar entero.
- **acuatica**: Este mar no existía hasta que movieron el segundo cristal. Un faro sin costa sigue encendido sobre el agua. Los cristales primero; lo demás, después.
- **laberinto**: El Tercero levantó estos muros para esconderse, y la piedra le fue subiendo por el cuerpo. Si te habla, no lo escuches. Traeme el cristal.
- **abismo**: Tres cristales pesan más de lo que el suelo aguanta, y el suelo cedió. Desde acá no se vuelve. Si dudás, seguí igual.
- **minas**: Otros bajaron antes y rayaron sus nombres en la roca. Algunas cuentas de días se cortan a mitad de raya. No las leas. Seguí bajando.
- **infernal**: Acá abajo no hay cielo, y la Horda tiene casa. En el fondo hay alguien encadenado; no le des tu atención. Te espero en el centro, con los cristales.

### Fragmento de cada arena (se gana al completarla)

**ciudad — LA PRIMERA CICATRIZ**
> Al amanecer quedaban el humo y las campanas, quietas. Las cuerdas estaban atadas a los ganchos; nadie las había tirado. Los que sobrevivieron cubrieron a los muertos de la plaza con lonas de panadería, porque no había otra tela. Frente a la puerta sur apareció una grieta fina en el empedrado. Fue la primera Cicatriz.
>
> _Lo que sigue (A QUÉ SE JUEGA):_ Diez arenas, en orden, solo o con amigos: cada una se abre cuando ganás la anterior. Aparte quedan la Convergencia, cinco contra cinco, y el Coliseo, que reúne a cuatro equipos de dos. Se abren al terminar la campaña. La Horda Infinita se abre antes, al vencer en la Fábrica.

**fortaleza — UNA FÁBRICA QUE NO PARA**
> Los que levantaron la Fábrica se fueron antes de que llegara la Horda, o se los llevaron. Las máquinas siguieron sin ellos: vapor, cintas con piezas para nadie, un capataz de hierro que todavía cuenta turnos. Los hornos no se apagaron. De los techos cuelga una cadena con el último eslabón abierto.
>
> _Lo que sigue (CRECER SIN APURO):_ Cada victoria deja experiencia, oro y un cofre. La experiencia le sube el nivel al guardián, y cada guardián lleva el suyo: probar a otro no te quita nada. El oro lo gastás cuando quieras, lejos de la batalla.

**bosque — EL GUARDIÁN DE LA NIEBLA**
> El más viejo de los Cuatro dormía entre los menhires, y la niebla le había crecido encima hasta las rodillas. Los feéricos le dejaban bellotas sobre la piedra. Seguían ahí, secas, de años. Tenía las manos cerradas sobre el cristal verde. Cuando cayó, pesaba menos que su armadura.
>
> _Lo que sigue (LO QUE LLEVÁS PUESTO):_ Lo que sacás de los cofres se equipa en el guardián, lejos de la batalla. Cada pieza tiene su rareza, y las de un mismo set dan algo más cuando se juntan. Las Gemas se ganan peleando y sirven para mejorar un objeto. No se compran.

**micelial — LO QUE REPITE EL MICELIO**
> La cueva crece sola y repite lo que oye. Entre las esporas rotas se oyen nombres de Guardianes, dichos con la voz de quien los llamó hace siglos, y un nombre de más. Lo anoté y lo taché. El hongo repite cualquier cosa. Insisto en cuidarte el cristal verde. Lo que brilla acá abajo termina en la boca de algo.
>
> _Lo que sigue (CADA HABILIDAD SE AFILA):_ Cuanto más usás una habilidad, más se afila: sube su nivel de uso, y esa mejora, chica, se queda para siempre. Los puntos que le das, hasta diez, la cambian: pega más, llega más lejos, dura más y se hace esperar menos. Lo ves en el Códice, en Guardianes.

**hielo — CARTAS SIN RESPUESTA**
> El Segundo Guardián sostuvo la cima solo, y escribió. Hay veintiséis cartas pegadas al hielo de la celda, con la tinta corrida en venas azules, ninguna con destinatario. Del Guardián quedó poco. El cristal quedó entero.
>
> _Lo que sigue (EL ÁRBOL DE TALENTOS):_ Pasado el nivel 40, tu guardián gana puntos para el árbol de talentos de su clase: uno al llegar y otro cada dos niveles. Son pocos y pesan, así que elegí despacio. Hasta ahí, peleá y equipate.

**acuatica — EL MAR QUE NO ESTABA**
> Cuando el segundo cristal salió de su sitio apareció agua donde nunca hubo. Una farera llamada Maren llevaba el cuaderno del faro: anotó la hora de la marea y siguió anotando hasta que se le mojó la tinta. Las páginas que se leen dicen que el agua subió sin ruido. Queda la lámpara, encendida. De los cristales no se mojó ninguno.
>
> _Lo que sigue (LA MISMA CAMPAÑA, MÁS DURA):_ Al terminar la campaña en Normal se abre Pesadilla, y al terminarla en Pesadilla, Infierno. La historia es la misma con una Horda más fuerte; a cambio, mejor botín y más experiencia y oro. Nunca es obligatorio.

**laberinto — EL TERCERO LEVANTÓ MUROS**
> Con sus propias manos levantó el Tercero este laberinto, para esconderse de la Horda y de otros. Durante años la piedra le fue subiendo por las piernas, y hacia el final solo hablaba con los muros. Cuentan que antes de caer quiso advertir algo. Los que se están volviendo piedra dicen muchas cosas. No lo anoto. Ya tenés tres cristales.
>
> _Lo que sigue (NADIE PELEA SOLO):_ Podés armar una sala con un código o entrar a una abierta: equipos de cuatro, y los lugares vacíos los ocupan bots, siempre marcados como tales. Si alguien cae, ayudalo a levantarse. Al final, la calificación mide lo que aportó cada rol.

**abismo — EL PUNTO DE NO RETORNO**
> Con tres cristales encima, el suelo cedió. La grieta se abrió bajo el último campamento y se llevó las tiendas, las mulas y una campana que nadie había tocado. Ahora hay ruinas colgando sobre el vacío, y abajo vive algo que no tiene apuro en subir. Se mueve lo que llevaba siglos quieto, y pasa esto. Seguimos hacia donde se abre.
>
> _Lo que sigue (EL ORO Y LA TIENDA):_ El oro se gana peleando y se gasta en la Tienda: objetos del día, guardianes nuevos, pieles y cromas. Nada de eso hace falta para ganar. Un guardián de más es, sobre todo, otra manera de pelear.

**minas — LA LUZ ES TERRITORIO**
> Las Minas guardan lo que dejaron los que bajaron antes: nombres rayados en la roca, cuentas de días que se cortan a mitad de raya. Alguien grabó la palabra luz cuarenta veces, cada vez más chica. Cerbero cuidaba la puerta del fondo. Fue perro de mina, dicen.
>
> _Lo que sigue (LAS BRASAS ✦):_ Las Brasas son otra moneda: compran apariencia, o sea pieles y cromas, y piezas de set. No hacen falta para llegar al final. Las piezas también caen peleando, y todo el poder se consigue con el oro que ganás en las arenas.

**infernal — EL QUE ELIGIÓ QUEDARSE**
> Te mentí en lo que importaba. Fui el Primero de los Cuatro, y me quedé con la Horda porque quise: iba a fundir los cristales para ser la Horda. Cuando caí dije que alguien tenía que sostenerla, y lo creí, que es lo peor. Este libro lo escribí yo, con tinta de hollín. Los cristales necesitan portadores. Ahora son ustedes.
>
> _Lo que sigue (LO QUE SIGUE):_ Ganaste la campaña. Quedan la Arena Divina (las Cinco Pruebas), la Horda Infinita, las dificultades Pesadilla e Infierno, la Convergencia y el Coliseo. Tu guardián y tu equipo siguen creciendo en todos. El Códice guarda todo lo que viste.

