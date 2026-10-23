# Dáriel, el Último Compás (`dariel`) - brief de arte de habilidades

> Formato técnico (canvas, paleta, export, nombres de archivo, fps, alfa): `docs/art-brief/00_ESPECIFICACION_TECNICA.md` (escrito por otro agente; este brief no lo duplica y, si difiere, manda esa especificación).
> Reglas de este documento: los números de mecánica son los del código (alcance, radio, duración en **unidades de mundo (u)** y milisegundos) con la fuente `archivo:linea`. El resto (colores, cuadros, tamaños en px, tiempos de anticipación del arte) es **dirección/sugerencia** para el artista, no mecánica. Tamaño en px = diámetro o largo en u dividido por 1,5 u/px (hasta 360 u), 2 u/px (hasta 640 u) o 3 u/px (más grande), redondeado a múltiplo de 8; el personaje mide ~70 px para ~66-70 u (ART_BIBLE s.2; `refH:70` en `js/assets/quality-five-collection-meta.js:142`), o sea ~1 u/px, y el motor procedural actual usa 1,4 a 4,5 u/px (`js/champions/skill-fx-a/engine.js:277`). Las habilidades que apuntan tienen premarcado propio del juego (perfiles en `js/skills/aim-targeting.js`); el arte no lo reemplaza.
> Índice con todas las habilidades de la mitad A y colisiones a evitar: `INDEX_A.md`.

## A. Identidad

- **Rol y tono:** Soporte rítmico (rol soporte, protección y recuperación acotada, a distancia). Tono: elegante, cansado, con humor seco; dirigía la música entre escenas y marcó la salida de emergencia. Lenguaje: pentagrama, nota, diapasón, telón.
- **Paleta sugerida:** ocre `#d6af77` (color de clase, `expedition/catalog.js:31`), crema `#f6dba8` y `#fffaf0`, vino `#7a1f35`, negro cálido `#1a1410`, acento violeta `#c88aff` (acento del tema `music`). (Atlas: marrón `#6c3c24`, dorado apagado `#b4843c`.)
- **Motivos visuales:** pentagrama de 5 líneas, notas (negra, corchea, bemol), diapasón, telón de teatro, cartel de salida, aplausos.
- **NO debe parecerse a:** **Baltra** (sonido como anillos concéntricos de bronce; el de Dáriel son NOTAS y pentagramas); **Aelith/Aurelia/Farolero** (dorados: Dáriel mezcla ocre con vino y negro); **Libertador** (clarín); **Velmira** (máscaras).
- **Estado actual del VFX (verificado en código):** Tema procedural `music` (`themes.js:14`, forma `wave`, motivos note/note2/star/spark). `skill-fx-a/c/dariel.js`: hab. 1 = cono, hab. 2 y 3 = nova en sí mismo + aura de aliados, definitiva = nova. Las notas acumuladas se muestran como texto "♪♪♪" sobre la cabeza (`expedition/render.js:34`).
- **Fuentes del kit:** `js/champions/expedition/catalog.js:31-36`, lanzamiento `expedition/runtime.js:49-52`, cono `:6`, nota acumulada `:30`, premarcado `aim-targeting.js:69`, proyectil `expedition/register.js:3`.

## B. Habilidades

### Básico - Nota suelta

- **Mecánica (código):** Disparo a distancia (proyectil `note`); alcance 300 u, cooldown 600 ms (arma: Diapasón del telón). *(`expedition/catalog.js:31` (`stats [112,6.5,.12,165,300,600,true]`), `register.js:3`)*
- **Silueta y forma:** Corchea de 10x14 u que vuela con una línea de pentagrama fina detrás.
- **Color dominante:** Ocre claro `#f6dba8`.
- **Movimiento:** Vuelo ondulante suave (seno de ±4 px); la línea de pentagrama se estira y se corta.
- **Anticipación:** Diapasón vibra, 2 cuadros.
- **Impacto:** La nota explota en 3 notitas, 3 cuadros.
- **Disipación:** Las notitas suben y se esfuman.
- **Cuadros sugeridos:** anticipación 2 + impacto 3 + disipación 3 = 8 cuadros (+ 4 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 24x24 px (36u x 36u; 1,5 u/px)
- **Loop:** Proyectil en loop de 4 cuadros.
- **Partículas / capas secundarias:** Notitas, líneas de pentagrama.
- **Ícono 16x16:** corchea. (el ataque básico no tiene entrada en `SKILL_PIXEL_MAP`, `js/ui/skill-pixel-glyphs.js:164`; ícono opcional)
- **Se distingue de las otras del mismo campeón:** Pequeña y ocre; sus habilidades son abanico disonante, marcha, repetición y telón.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Segundo robado de Aelith y Disparo de prisma de Aurelia: gota de arena y prisma; esta es una nota musical.

### Hab. 1 - Nota discordante

- **Mecánica (código):** Cono sonoro (alcance 205 u, semiángulo 0,85 rad = 97° de boca): daño 70% y reduce 8% el daño de los enemigos 1500 ms (jefes 4%). Costo 24, cooldown 6500 ms. *(`catalog.js:36`, `runtime.js:49`, premarcado `aim-targeting.js:69`)*
- **Silueta y forma:** Abanico de pentagrama abierto con notas quebradas (bemoles, sostenidos, corcheas rotas) que salen disparadas; los enemigos golpeados llevan una nota tachada.
- **Color dominante:** Vino `#7a1f35` con ocre `#d6af77`.
- **Movimiento:** Las notas se desparraman en abanico con un sonido desafinado: las líneas del pentagrama se doblan.
- **Anticipación:** El diapasón se golpea y vibra, 3 cuadros.
- **Impacto:** Abanico de notas, 4 cuadros.
- **Disipación:** Las notas se rompen en trozos; sobre los enemigos queda la "nota tachada" 1500 ms (loop 4).
- **Cuadros sugeridos:** anticipación 3 + impacto 4 + disipación 4 = 11 cuadros
- **Tamaño sugerido del asset (px nativos):** 144x208 px (radio 205u, ancho de boca 308u, arco 97 grados; 1,5 u/px)
- **Loop:** Solo la nota tachada sobre enemigos (loop 4 cuadros).
- **Partículas / capas secundarias:** Trozos de pentagrama, bemoles sueltos.
- **Ícono 16x16:** nota con una X. (hoy: glifo píxel `note+x`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única ofensiva y la única vino; las demás son ocre/violeta y aliadas.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Badajo de retorno de Baltra y Máscara Arrojada de Velmira: ondas lisas de bronce y máscaras; esta son notas rotas rojizas.

### Hab. 2 - Marcha de salida

- **Mecánica (código):** Los aliados a ≤150 u (incluida ella) reciben escudo 4% (sin acumular) y +8% velocidad durante 2400 ms. Costo 28, cooldown 11000 ms. *(`catalog.js:36`, `runtime.js:50`, `expedition/runtime.js:118`)*
- **Silueta y forma:** Pentagrama horizontal que se despliega en el suelo y se desplaza con el grupo, con chevrones ">>" en tambor y un escudo pequeño.
- **Color dominante:** Crema `#f6dba8` y ocre.
- **Movimiento:** La línea del pentagrama avanza en la dirección del grupo mientras dura (2400 ms); los chevrones pulsan al compás.
- **Anticipación:** Redoble: el diapasón marca 2 golpes, 3 cuadros.
- **Impacto:** Aparecen los pentagramas y escudos en cada aliado, 4 cuadros.
- **Disipación:** Se apagan hacia atrás, 4 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 4 + disipación 4 = 11 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 200x200 px (diámetro 300u = 2 x r 150u; 1,5 u/px)
- **Loop:** Sí: pentagrama y chevrones en loop de 8 cuadros durante 2400 ms.
- **Partículas / capas secundarias:** Notas pequeñas que se pegan a los pies de cada aliado.
- **Ícono 16x16:** tambor con una flecha. (hoy: glifo píxel `drum+arrow`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única centrada en el grupo y con movimiento horizontal; la 3 es una sola onda centrada.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Bendición de Guerra de Elyra y Grito de Caravana de Ilkan: halo y pendón; esta es un pentagrama en marcha.

### Hab. 3 - Volver al estribillo

- **Mecánica (código):** Área circular alrededor suyo (radio 130 u): daño 40% y cura a los aliados 1% + 0,6% por nota gastada (máx. 2,8%). Gasta las notas acumuladas. Costo 28, cooldown 8500 ms. *(`catalog.js:36`, `runtime.js:51`)*
- **Silueta y forma:** Anillo con el signo de repetición (dos barras dobles con puntos: ||: :||) a los lados y una onda violeta que vuelve hacia el centro (se contrae) tras expandirse.
- **Color dominante:** Violeta `#c88aff` con crema.
- **Movimiento:** La onda sale y regresa (ida y vuelta de 8 cuadros); cada nota gastada añade una repetición.
- **Anticipación:** Las notas acumuladas giran a su alrededor, 3 cuadros.
- **Impacto:** Onda ida (r=130 u), 4 cuadros.
- **Disipación:** Onda de vuelta y cura sobre aliados (corazoncito de nota), 4 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 4 + disipación 4 = 11 cuadros
- **Tamaño sugerido del asset (px nativos):** 176x176 px (diámetro 260u = 2 x r 130u; 1,5 u/px)
- **Loop:** No.
- **Partículas / capas secundarias:** Notas violeta que vuelan al personaje.
- **Ícono 16x16:** signo de repetición. (hoy: glifo píxel `repeat+spark`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única violeta y la única en que la onda vuelve.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Alba Purificadora de Elyra (cura circular): luz verde/blanca; esta es violeta con signos de música.

### Definitiva - Todavía hay una salida

- **Mecánica (código):** Seis pulsos durante 4800 ms (uno cada 800 ms), radio 160 u: alternan daño (18%) y cura 1% con escudo 2% (sin acumular). Sin costo, cooldown 38000 ms. *(`catalog.js:36`, `runtime.js:52`, `exPulse` `runtime.js:17`)*
- **Silueta y forma:** Un telón de teatro vino se abre sobre el círculo de 160 u, un reflector cae sobre Dáriel y un pentagrama en espiral gira en el suelo; al final se enciende una puerta de servicio con cartel de SALIDA.
- **Color dominante:** Vino `#7a1f35` y ocre `#d6af77`, cartel `#fffaf0`.
- **Movimiento:** Cada compás (800 ms) un pulso: pares = onda vino (daño), impares = onda dorada (cura); la espiral gira una vuelta por 4800 ms.
- **Anticipación:** Pose de 650 ms: el telón cae y se abre, 6 cuadros.
- **Impacto:** Seis compases de 3 cuadros cada uno (18 cuadros).
- **Disipación:** La puerta se enciende, el telón se cierra, 8 cuadros.
- **Cuadros sugeridos:** anticipación 6 + impacto 18 + disipación 8 = 32 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 216x216 px (diámetro 320u = 2 x r 160u; 1,5 u/px)
- **Loop:** Sí: espiral y reflector en loop de 6 cuadros durante los 4800 ms.
- **Partículas / capas secundarias:** Luz cenital, telón con pliegues, aplausos fantasma (manos pequeñas) al terminar.
- **Ícono 16x16:** trompeta con un anillo. (hoy: glifo píxel `trumpet+ring`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única con puerta de salida y telón; los pulsos alternan color (vino/dorado).
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Que todos la escuchen de Baltra y El Gran Teatro de Velmira: campana colosal y máscaras gigantes; esta es un telón con reflector y puerta.

### Pasiva - Contrapunto

- **Mecánica (código):** Alternar habilidades distintas acumula hasta 3 notas; repetir la misma no suma (`expedition/runtime.js:30`). Hoy se muestran como texto "♪" sobre la cabeza (`expedition/render.js:34`).
- **Arte:** Sustituir el texto por 3 notas de 8 px sobre la cabeza que se encienden de a una (ocre → violeta) y se consumen con un destello al gastarse (3 cuadros).
