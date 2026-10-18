# Nahir — El Restaurador de Espejos (El Vidrio Errante) (`nahir`)

> **Especificación técnica** (atlas, paleta, alfa, nombres de archivo, export): `docs/art-brief/00_ESPECIFICACION_TECNICA.md`. Este brief NO la duplica; si ella fija otra escala de píxel, convertir con `px = u ÷ escala`.
> **Estilo:** `docs/ART_BIBLE.md` §7 (VFX libres, en capas propias, nunca pintados dentro del cuerpo) y §14 (densidad). **Unidades:** `u` = unidad de mundo; la pantalla muestra 650 u en el lado corto (`js/core/constants.js:20`); un campeón mide ~66–70 u (ART_BIBLE §2). **Escala de px usada acá (supuesto explícito):** decales y zonas de suelo 2,0 u/px (canon de suelos, ART_BIBLE §14); proyectiles, auras y efectos a escala de cuerpo 1,0 u/px (canon de campeones), salvo que midan más de 160 u de lado: entonces también 2,0 u/px. Los tamaños en u son del código (a nivel base: maestría y talentos multiplican radio/alcance, `AREA` en `js/skills/abilities.js`); los px son conversión.
> **Tiempos:** casi todas las habilidades son instantáneas (el daño se aplica al lanzar). La pose de lanzamiento del héroe dura 420 ms (650 ms en definitiva); la anticipación del efecto debe caber ahí y en el premarcado del apuntado, sin retrasar el golpe, salvo donde se indica un retardo real.

## A. Identidad

- **Rol:** Asesino flanqueador (`roleCategory: asesino`), cuerpo a cuerpo (básico 72 u, 450 ms). Deja reflejos fijos y corta desde varios ángulos.
- **Tono:** Frío, preciso y un poco inquietante: restaurador que teme que sus gestos repetidos se vuelvan destino. Vidrio, simetría, destellos secos; nada orgánico.
- **Fuentes del kit:** `js/champions/expedition/catalog.js:13`; `js/champions/expedition/catalog.js:18`; `js/champions/expedition/runtime.js:37`; pasiva en `js/champions/expedition/catalog.js:16`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/nahir/atlas.png`: aguamarina oscuro `#105050`/`#107070`, grises `#505050`/`#707070`, blanco `#f0f0f0`. Color de clase `#68c6c2` (`catalog.js:13`); armas: hojas de espejo, máscara partida, media capa.
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Aguamarina (dominante) | `#68c6c2` |
  | Aguamarina oscuro (sombra) | `#2f8f8c` |
  | Destello de vidrio | `#c9fffb` |
  | Blanco especular | `#ffffff` |
  | Azul-negro (contorno) | `#0d2e33` |
  | Gris plata (marco/capa) | `#8a9ba0` |

- **Motivos visuales:** triángulos y esquirlas de vidrio, óvalos de espejo con marco, destellos en cruz, simetría doble, reflejos translúcidos (copia tenue del héroe), grietas finas rectas.
- **Pasiva:** *Ángulo muerto* (+15% de daño al cambiar ≥60° el ángulo contra el mismo enemigo; recarga interna 900 ms, `catalog.js:16`) no tiene indicador visual hoy (verificado: ni `expedition/render.js` ni `vfx-b/nahir.js` lo dibujan); no se pide arte.
- **NO debe parecerse a:** **Vesper** (también cono de 97° y asesina): sus agujas son hilos finos violetas y ondulados; las de Nahir son polígonos sólidos con brillo blanco. **Axiom** (`#3ad6c4`, teal digital) y **Ismara** (`#4fd8c4`): Nahir es aguamarina más apagada y azulada, con grises plata; nunca píxeles/glitch (Axiom) ni hilos/relojes (Ismara). **Thalen/Nova de Escarcha** (cristales de hielo azul): las esquirlas de Nahir son aguamarina y reflejan, no son cristales de hielo.

## B. Habilidades

Convención de cada ficha: *Mecánica* = lo que hace el código hoy (no se inventa nada); el resto es lo que se pide al dibujante. "Frames" = cuadros sugeridos por fase.

### Ataque básico — Ataque básico (hojas de espejo)

- **Mecánica (código):** Melee: golpea a todo enemigo a ≤72 u (`basicRange`), enfriamiento 450 ms; pose de 190 ms; destello de tajo 140 ms a 38 u frente al héroe (`spawnSlash`).
- **Tipo:** cuerpo a cuerpo (círculo de golpe) · **Fuente:** `js/champions/expedition/catalog.js:13`; `js/skills/abilities.js:235`; `js/champions/expedition/register.js:9`
- **Silueta y forma:** Tajo corto en media luna de vidrio (dos hojas curvas: el segundo tajo en espejo del primero), 40 u de largo.
- **Color dominante:** Blanco especular `#ffffff` con núcleo aguamarina `#68c6c2`.
- **Movimiento:** Barrido de 80° en 3 cuadros; el segundo tajo llega en la misma tirada, invertido, como un reflejo.
- **Anticipación:** Sin retardo; 1 cuadro de destello en la hoja al iniciar (pose 190 ms).
- **Impacto:** Destello en cruz de 17 u de radio sobre el blanco (hoy `bh_nahir`, 300 ms, motivo `nh_glint`) con 2 esquirlas.
- **Disipación:** Esquirlas caen y se apagan en 3 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 3 · disipación 3 (= 7 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Tajo en media luna: 40×28 u → **40×28 px** nativos (1 u/px)
  - Destello de impacto: 34×34 u → **34×34 px** nativos (1 u/px)
- **Partículas / capas secundarias:** 2 esquirlas triangulares (≈4 px).
- **Cómo se distingue de las otras del mismo campeón:** Es corto y blanco; las habilidades usan formas grandes (abanico, óvalo, línea, triángulo).
- **Habilidad más parecida de otro campeón y cómo evitarla:** Tajo de Musashi y de Veyra: los de ellos son arcos de acero/sangre; el de Nahir es doble y simétrico, vidrio blanco-aguamarina.

### Habilidad 1 — Astillas errantes

- **Mecánica (código):** `shards`: cono de 240 u de alcance y semiángulo 0,85 rad (≈97° de abertura), premarcado `cone`. Coste 24, enfriamiento 5500 ms, 2,85× de daño. Golpea hasta 12 enemigos (los más cercanos). Sin efecto de estado.
- **Tipo:** cono (abanico de proyectiles instantáneo) · **Fuente:** `js/champions/expedition/catalog.js:18`; `js/champions/expedition/runtime.js:37`; `js/champions/expedition/runtime.js:9`; `js/skills/aim-targeting.js:66`
- **Silueta y forma:** Abanico de 7–9 esquirlas de vidrio triangulares (largas, con filo), de longitud creciente hacia el centro; el conjunto llena el sector de 97° × 240 u.
- **Color dominante:** Aguamarina `#68c6c2` con brillo blanco `#c9fffb` en cada arista.
- **Movimiento:** Las esquirlas salen del héroe y se abren en abanico, rotando levemente sobre su eje y escalando hasta el alcance; centelleo secuencial de izquierda a derecha.
- **Anticipación:** Sin retardo: 2 cuadros de destello en las hojas (pose 420 ms) y el sector punteado del premarcado.
- **Impacto:** Cada esquirla se clava y "revienta" en un destello de 10–14 u sobre el enemigo que cruza.
- **Disipación:** Las esquirlas se quiebran en polvo de vidrio en 4 cuadros.
- **Frames sugeridos:** anticipación 2 · impacto 4 · disipación 4 (= 10 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Sector completo (largo × ancho en la punta): 240×360,6 u → **120×180 px** nativos (2 u/px)
  - Esquirla suelta: 48×10 u → **48×10 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Chispas de vidrio (motivo `nh_glint`); un reflejo tenue de la forma del cono en el suelo.
- **Ícono 16×16:** hoy `crystal+dots` (`js/ui/skill-pixel-glyphs.js:186`); propuesta: mantener: cristal facetado.
- **Cómo se distingue de las otras del mismo campeón:** Es la única en abanico de polígonos sólidos; Corte Cruzado es una línea fina y la Galería es un triángulo de tres óvalos.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Agujas de penumbra de Vesper**: misma geometría (cono 97°, ~235 u). Evitarla con silueta y color: Vesper = hilos finos ondulados violeta/ciruela con un hilo que une las agujas; Nahir = polígonos anchos, aguamarina, con brillos blancos.

### Habilidad 2 — Reflejo fugitivo

- **Mecánica (código):** `reflect`: salto seguro de 110 u (sin atravesar muros; premarcado `dash` de 30 u de ancho). Deja en el origen un reflejo inmóvil (radio 25 u, vive 5000 ms, máx. 3, no absorbe daño ni bloquea) y da +15% de daño 3 s. Coste 25, enfriamiento 9500 ms.
- **Tipo:** desplazamiento + invocación (reflejo estático) · **Fuente:** `js/champions/expedition/catalog.js:18`; `js/champions/expedition/runtime.js:38`; `js/champions/expedition/runtime.js:16`; `js/skills/aim-targeting.js:67`
- **Silueta y forma:** Estela de vidrio durante el salto (110 × 30 u) y, al terminar, un espejo oval de cuerpo entero (⌀50 u, ≈64 u de alto) con marco plata y una copia tenue de Nahir adentro.
- **Color dominante:** Plata/gris `#8a9ba0` en el marco, aguamarina `#68c6c2` en el cristal, blanco `#ffffff` en el destello.
- **Movimiento:** El héroe se deshace en esquirlas y reaparece 110 u más allá; el espejo se "enciende" desde el centro del óvalo hacia el borde. En reposo, un destello barre el cristal cada ~1,5 s.
- **Anticipación:** Premarcado de salto (existente). 1 cuadro de resquebrajado en el origen antes de moverse.
- **Impacto:** El espejo aparece con destello de 25 u y un anillo de esquirlas.
- **Disipación:** A los 5 s (o al reemplazarlo) el espejo se quiebra en 5 cuadros y deja polvo.
- **Frames sugeridos:** anticipación 1 · impacto 4 · disipación 5 (= 10 cuadros) + bucle de 6 cuadros
- **Loop:** Reflejo en reposo: bucle de 6 cuadros (barrido de brillo). Estela y quiebre no repiten.
- **Tamaño de los assets:**
  - Espejo (sprite): 50×64 u → **50×64 px** nativos (1 u/px)
  - Estela del salto: 110×30 u → **110×30 px** nativos (1 u/px)
  - Quiebre: 60×60 u → **60×60 px** nativos (1 u/px)
- **Partículas / capas secundarias:** La copia tenue del héroe dentro del espejo debe usar la silueta de Nahir tintada (no un sprite nuevo del personaje, ART_BIBLE §5).
- **Ícono 16×16:** hoy `mirror+arrow` (`js/ui/skill-pixel-glyphs.js:186`); propuesta: mantener: espejo oval con flecha.
- **Cómo se distingue de las otras del mismo campeón:** Es el único objeto persistente de pie; las Astillas son un abanico efímero y el Corte una línea.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Reflejo/clon de Musashi (Paso Fantasma) y Runa de Inversión de Nano GM: aquellos son sombras o runas de suelo; el de Nahir es un óvalo de vidrio de pie con marco.

### Habilidad 3 — Corte cruzado

- **Mecánica (código):** `cross`: línea de 240 u de largo (premarcado `line` de 28 u; el golpe alcanza 24 u + el radio del enemigo a cada lado). Coste 30, enfriamiento 8000 ms, 3,15×. Además cada reflejo vivo (hasta 3) lanza un eco al 25% hacia el mismo punto final; un eco por reflejo y objetivo; tope 1,75× por enemigo.
- **Tipo:** línea (golpe del héroe + ecos desde los reflejos) · **Fuente:** `js/champions/expedition/catalog.js:18`; `js/champions/expedition/runtime.js:39`; `js/skills/aim-targeting.js:67`
- **Silueta y forma:** Tajo recto cristalino de 240 × 48 u, con filo blanco; desde cada reflejo, una línea tenue (alpha ~40%) que converge al mismo punto final, formando una X o un abanico de líneas.
- **Color dominante:** Blanco `#ffffff` en el filo, aguamarina `#68c6c2` en el cuerpo; ecos en `#c9fffb` translúcido.
- **Movimiento:** El tajo principal recorre la línea de principio a fin en 2 cuadros; los ecos llegan 1 cuadro más tarde, todos hacia el mismo punto final; el cruce emite un destello.
- **Anticipación:** Premarcado lineal (existente). Con reflejos activos, las líneas de eco se esbozan 2 cuadros antes (aviso de que cortarán desde ahí).
- **Impacto:** Destello de cruz en el punto final y en cada enemigo atravesado.
- **Disipación:** Las líneas se parten en esquirlas y se desvanecen en 4 cuadros.
- **Frames sugeridos:** anticipación 2 · impacto 3 · disipación 4 (= 9 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Tajo principal: 240×48 u → **120×24 px** nativos (2 u/px)
  - Eco (línea tenue): 240×20 u → **120×10 px** nativos (2 u/px)
  - Destello final: 40×40 u → **40×40 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Cruces brillantes en cada punto donde se cortan tajo y eco.
- **Ícono 16×16:** hoy `swords+x` (`js/ui/skill-pixel-glyphs.js:186`); propuesta: dos tajos cruzados en X.
- **Cómo se distingue de las otras del mismo campeón:** Única línea larga del kit; sin reflejos se ve como un tajo simple, con reflejos se vuelve una red de cortes.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Línea de tinta de Sira y Perno conductor de Orsa (líneas largas): la de Nahir es blanca/aguamarina con cruces y ecos; las otras son tinta azul y cobre.

### Definitiva — Galería de nadie

- **Mecánica (código):** `gallery`: sin apuntado, coste 0, enfriamiento 36000 ms, dura 6000 ms. Borra los reflejos previos y crea 3 a 100 u de Nahir (a 0°, 120° y 240°). Cada reflejo estalla de inmediato en un radio de 80 u y ralentiza 30% por 1200 ms; Nahir gana +15% de daño 6 s. Nota de código: `dmgMult` es 0 en el catálogo, y el daño se calcula como `baseDmg × dmgMult` (`abilities.js`), así que los estallidos frenan pero no hacen daño; no mostrarlos como un golpe fuerte.
- **Tipo:** invocación (3 reflejos) + estallido + buff · **Fuente:** `js/champions/expedition/catalog.js:18`; `js/champions/expedition/runtime.js:40`; `js/skills/abilities.js:336`
- **Silueta y forma:** Triángulo de luz de ≈200 × 200 u con un espejo de cuerpo entero en cada vértice (radio 100 u desde el héroe) y un estallido circular de 80 u de radio en cada espejo; líneas de luz unen los tres espejos.
- **Color dominante:** Blanco `#ffffff` y aguamarina `#68c6c2`; el triángulo de luz en `#c9fffb` translúcido.
- **Movimiento:** Los tres espejos caen/aparecen en secuencia (120 ms entre cada uno), se encienden y emiten el estallido; las líneas del triángulo se tensan y el interior brilla suave durante los 6 s.
- **Anticipación:** Pose de 650 ms: el héroe se parte en tres reflejos que se separan hasta 100 u (4 cuadros); primer destello al final.
- **Impacto:** Estallido de 80 u en cada vértice (3×) y destello del triángulo completo, con una sacudida corta.
- **Disipación:** A los 6 s los tres espejos se quiebran a la vez (5 cuadros) y el triángulo se apaga por tramado.
- **Frames sugeridos:** anticipación 4 · impacto 5 · disipación 5 (= 14 cuadros) + bucle de 8 cuadros
- **Loop:** Triángulo y espejos en bucle de 8 cuadros (brillo que circula) durante 6 s.
- **Tamaño de los assets:**
  - Triángulo de luz + espejos: 200×200 u → **100×100 px** nativos (2 u/px)
  - Estallido por espejo: 160×160 u → **80×80 px** nativos (2 u/px)
  - Espejo de cuerpo entero: 50×64 u → **50×64 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Esquirlas que orbitan cada espejo; el contorno de los espejos hace de "pared de museo" visual sin bloquear (no son paredes).
- **Ícono 16×16:** hoy `frame+ring` (`js/ui/skill-pixel-glyphs.js:186`); propuesta: marco de espejo con triángulo de luz.
- **Cómo se distingue de las otras del mismo campeón:** Única definitiva simétrica en tres puntos; reutiliza el espejo del Reflejo, pero con el triángulo de luz y el estallido.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Triángulo de Iria (Sello de los Tres Caminos): hilo/ancla de tinta violeta; el de Nahir es de luz blanca con espejos en los vértices.

