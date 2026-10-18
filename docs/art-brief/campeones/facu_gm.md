# Facu GM, el Soberano de las Mareas (`facu_gm`) - brief de arte de habilidades

> Formato técnico (canvas, paleta, export, nombres de archivo, fps, alfa): `docs/art-brief/00_ESPECIFICACION_TECNICA.md` (escrito por otro agente; este brief no lo duplica y, si difiere, manda esa especificación).
> Reglas de este documento: los números de mecánica son los del código (alcance, radio, duración en **unidades de mundo (u)** y milisegundos) con la fuente `archivo:linea`. El resto (colores, cuadros, tamaños en px, tiempos de anticipación del arte) es **dirección/sugerencia** para el artista, no mecánica. Tamaño en px = diámetro o largo en u dividido por 1,5 u/px (hasta 360 u), 2 u/px (hasta 640 u) o 3 u/px (más grande), redondeado a múltiplo de 8; el personaje mide ~70 px para ~66-70 u (ART_BIBLE s.2; `refH:70` en `js/assets/quality-five-collection-meta.js:142`), o sea ~1 u/px, y el motor procedural actual usa 1,4 a 4,5 u/px (`js/champions/skill-fx-a/engine.js:277`). Las habilidades que apuntan tienen premarcado propio del juego (perfiles en `js/skills/aim-targeting.js`); el arte no lo reemplaza.
> Índice con todas las habilidades de la mitad A y colisiones a evitar: `INDEX_A.md`.

## A. Identidad

- **Rol y tono:** Asesino de secuencia (rol asesino, melee; Regente Fundador). Tono: sereno y soberbio; no domina el océano, el océano lo reconoce. Lenguaje: corriente, presión, oleada, espuma.
- **Paleta sugerida:** azul mar `#5aa8e4` (color de clase, `ascension/catalog.js:27`), espuma `#d4ecff`, azul profundo `#0c3c6c` y `#3c84cc` (atlas), turquesa `#7af0e0` (acento del tema `tide`), blanco `#ffffff`, contorno `#0a1a34`.
- **Motivos visuales:** ola con cresta, remolino, espuma, burbujas, corriente en vetas, silueta abisal bajo el agua, quilla.
- **NO debe parecerse a:** **Baltra** (bronce y metal sumergido: el agua de Facu es azul vivo y fluida, sin bronce); **Mago/Thalen** (hielo cristalino: aquí no hay cristales ni copos, solo agua curva); **Bront** (acero); **Khepri** (verde).
- **Estado actual del VFX (verificado en código):** Tema procedural `tide` (`themes.js:17`, forma `wave`, motivos wave/drop/shell/bubble). `skill-fx-a/c/facu_gm.js`: Corriente = estallido + teja de haz, Presión = nova, Ola = trazo ancho 56, definitiva = nova. Proyectil básico `wave` (`ascension/register.js:10`).
- **Fuentes del kit:** `js/champions/ascension/catalog.js:27-41` (stats y kit), lanzamiento `ascension/runtime.js:111-114`, objetos `:205-213`, cabalgata `:262-267`, premarcado `js/skills/aim-targeting.js:54-56`.

## B. Habilidades

### Básico - Quilla

- **Mecánica (código):** Golpe cuerpo a cuerpo; alcance 92 u, cooldown 400 ms (arma: Quilla Ceremonial). *(`ascension/catalog.js:27` (`stats [165,15,.14,186,92,400,false]`))*
- **Silueta y forma:** Corte curvo de agua (arco de 92 u) con la cresta blanca de espuma en el borde.
- **Color dominante:** Azul mar `#5aa8e4` con espuma `#d4ecff`.
- **Movimiento:** Arco rápido y fluido, la cresta lo sigue medio cuadro atrás.
- **Anticipación:** La quilla se alza con gotas, 2 cuadros.
- **Impacto:** Tajo de agua con salpicadura, 3 cuadros.
- **Disipación:** La espuma cae y se disuelve en gotas.
- **Cuadros sugeridos:** anticipación 2 + impacto 3 + disipación 3 = 8 cuadros
- **Tamaño sugerido del asset (px nativos):** 64x96 px (radio 92u, ancho de boca 138u, arco 97 grados; 1,5 u/px)
- **Loop:** No.
- **Partículas / capas secundarias:** Gotas, burbujas.
- **Ícono 16x16:** ola pequeña. (el ataque básico no tiene entrada en `SKILL_PIXEL_MAP`, `js/ui/skill-pixel-glyphs.js:164`; ícono opcional)
- **Se distingue de las otras del mismo campeón:** Arco corto de agua; las habilidades son corriente, remolino, cresta y marea total.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Hoces Gemelas de Ilkan y Puñalada de Kael: arcos de arena y daga; este es agua con espuma.

### Hab. 1 - Corriente de Resaca

- **Mecánica (código):** Abre una corriente en línea (alcance 300 u, ancho de colisión 68 u) durante 3500 ms: empuja a los comunes en su dirección (9 u cada 120 ms), daña 25% cada 500 ms y acelera 25% a los aliados que la pisan. Costo 22, cooldown 5000 ms. (Flujo: Corriente.) *(`catalog.js:38`, `runtime.js:111,205`, premarcado `aim-targeting.js:54`)*
- **Silueta y forma:** Río de agua en el suelo: vetas paralelas azules con flechas de corriente que corren en la dirección del lanzamiento y espuma en los bordes.
- **Color dominante:** Azul medio `#3c84cc` con vetas claras.
- **Movimiento:** Las vetas fluyen continuamente hacia la punta a velocidad constante durante 3500 ms.
- **Anticipación:** La resaca se abre desde sus pies, 3 cuadros.
- **Impacto:** La corriente se extiende por 300 u, 4 cuadros.
- **Disipación:** Se angosta y se vacía de la cola a la cabeza, 5 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 4 + disipación 5 = 12 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 200x48 px (300u x 68u; 1,5 u/px)
- **Loop:** Sí: vetas en loop de 8 cuadros durante 3500 ms.
- **Partículas / capas secundarias:** Burbujas en el borde, espuma, brillo móvil sobre las vetas.
- **Ícono 16x16:** anzuelo con puntos de agua. (hoy: glifo píxel `hook+dots`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única línea larga de agua que fluye; la 2 es un vórtice, la 3 una cresta que se desplaza, la 4 un campo.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Línea Infranqueable de Garren y Fractura de Aelith (líneas persistentes/cortas): cadena y grieta de reloj; esta es un río.

### Hab. 2 - Presión Abisal

- **Mecánica (código):** Implosión en un punto (alcance 280 u, radio 120 u): atrae a los comunes hasta 120 u hacia el centro (élites 50 u), daña y ralentiza 35% 1500 ms; los jefes solo reciben daño y lentitud. Costo 24, cooldown 7400 ms. (Flujo: Presión.) *(`catalog.js:39`, `runtime.js:112`, premarcado `aim-targeting.js:54`)*
- **Silueta y forma:** Remolino cerrado: espiral de agua oscura cuyo centro es casi negro y de cuyos bordes caen cataratas hacia dentro; burbujas que suben desde el fondo.
- **Color dominante:** Azul profundo `#0c3c6c` con vetas `#5aa8e4`.
- **Movimiento:** La espiral gira cada vez más rápido y se hunde; al final un estampido sordo y sube una burbuja grande.
- **Anticipación:** Un círculo de agua se curva hacia adentro, 3 cuadros.
- **Impacto:** Remolino cierra y atrae, 4 cuadros.
- **Disipación:** Se aplana en un anillo de espuma, 4 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 4 + disipación 4 = 11 cuadros
- **Tamaño sugerido del asset (px nativos):** 160x160 px (diámetro 240u = 2 x r 120u; 1,5 u/px)
- **Loop:** No.
- **Partículas / capas secundarias:** Burbujas ascendentes, anillo de espuma.
- **Ícono 16x16:** burbuja con una X. (hoy: glifo píxel `bubble+x`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única oscura y con centro hundido; las demás son claras y fluyen en línea.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Pozo Gravitatorio de Vhal y Error 404 de Axiom (zonas que atraen/colapsan): estrella y ventana; esta es agua con espiral.

### Hab. 3 - Cabalgar la Ola

- **Mecánica (código):** Cabalga una ola hasta 320 u a 620 u/s (~520 ms): aparta a los enemigos a ≤46 u, los daña, los ralentiza 30% 1200 ms, protege 5% a los aliados que cruza y deja espuma (radio 26 u, 2000 ms). Se detiene ante muros. Costo 24, cooldown 7000 ms. (Flujo: Oleada.) *(`catalog.js:40`, `runtime.js:113,262-267`, premarcado `aim-targeting.js:55`)*
- **Silueta y forma:** Cresta de ola de 92 u de ancho con Facu de pie sobre ella, que arrastra una estela de espuma a lo largo del recorrido.
- **Color dominante:** Azul claro `#84ccfc` con espuma blanca.
- **Movimiento:** La ola se levanta bajo sus pies, sale a gran velocidad; la espuma queda atrás y se va disolviendo 2000 ms.
- **Anticipación:** El agua se levanta bajo él, 3 cuadros.
- **Impacto:** Cresta en movimiento, 4 cuadros (loop corto de 4 mientras dura el recorrido).
- **Disipación:** La cresta se rompe en espuma, 5 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 4 + disipación 5 = 12 cuadros (+ 4 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** cresta 92x92 u -> 64x64 px + estela de espuma 340x60 u -> 224x40 px
- **Loop:** Sí: la cresta en loop de 4 cuadros durante el recorrido (~520 ms).
- **Partículas / capas secundarias:** Salpicaduras laterales, espuma que perdura 2000 ms.
- **Ícono 16x16:** ola con flecha hacia arriba. (hoy: glifo píxel `wave+up`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única que mueve a Facu y deja espuma; la 1 es un río fijo.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Carga de San Lorenzo del Libertador y Embestida de Aldric (cargas): caballería y tanque; esta es una cresta de agua.

### Definitiva - El Océano Reclama la Arena

- **Mecánica (código):** La arena se inunda durante 4200 ms (radio 460 u): Facu se eleva sobre una ola; entre 1000 y 3400 ms el remolino atrae a los comunes (cada 180 ms) y daña 30% cada 600 ms; a los 3400 ms una ola final barre (daño completo, empuja 90 u en la dirección de lanzamiento) y todos los aliados reciben escudo 10%. Sin costo, cooldown 64000 ms. *(`catalog.js:41`, `runtime.js:114,208-213`)*
- **Silueta y forma:** La arena entera se llena de agua: una gran masa azul con siluetas abisales (tiburones, tentáculo) que cruzan bajo la superficie y una ola final colosal del ancho de la zona que cruza el campo.
- **Color dominante:** Azul mar `#5aa8e4` y profundo `#0c3c6c`, espuma blanca `#ffffff`, bioluminiscencia `#7af0e0`.
- **Movimiento:** Fase 1 (0-1000 ms): sube el nivel; fase 2 (1000-3400 ms): remolino con siluetas; fase 3 (3400 ms): ola final que barre.
- **Anticipación:** Sube el agua desde los bordes hacia el centro, 8 cuadros (~1000 ms).
- **Impacto:** Remolino sostenido y ola final, 10 cuadros.
- **Disipación:** La ola pasa y el agua baja dejando espuma, 8 cuadros.
- **Cuadros sugeridos:** anticipación 8 + impacto 10 + disipación 8 = 26 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 312x312 px (diámetro 920u = 2 x r 460u; 3 u/px)
- **Loop:** Sí: el remolino con siluetas en loop de 8 cuadros (2400 ms).
- **Partículas / capas secundarias:** Siluetas abisales, sacudida de pantalla fuerte en la ola final, espuma en el borde.
- **Ícono 16x16:** remolino con anillo. (hoy: glifo píxel `vortex+ring`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única definitiva que cubre toda la arena y con tres fases; ninguna otra del kit pasa de 120 u.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente al Cataclismo de Mago y Que todos la escuchen de Baltra: tormenta de elementos y campana; esta es una inundación con ola final.

### Pasiva - Mente de Marea

- **Mecánica (código):** Encadenar Corriente → Presión → Oleada en orden sube la Marea (máx. 3): +20% de potencia y -15% de recarga a la siguiente; con Marea 3 entra Marea Alta 8 s (básicos con ola, +15% velocidad, doble área en la próxima); romper el orden da Marea Baja y un escudo (`ascension/catalog.js:32`, `runtime.js:14,265`).
- **Arte:** Marea Alta: una ola baja que rodea sus pies durante los 8000 ms (loop 8 cuadros) y la barra de Marea 0-3 como 3 gotas junto al personaje. Marea Baja: cuadro único de reflujo gris.
