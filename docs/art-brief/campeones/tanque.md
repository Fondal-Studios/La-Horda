# Aldric — El Último Bastión (Tanque) (`tanque`)

> **Especificación técnica** (atlas, paleta, alfa, nombres de archivo, export): `docs/art-brief/00_ESPECIFICACION_TECNICA.md`. Este brief NO la duplica; si ella fija otra escala de píxel, convertir con `px = u ÷ escala`.
> **Estilo:** `docs/ART_BIBLE.md` §7 (VFX libres, en capas propias, nunca pintados dentro del cuerpo) y §14 (densidad). **Unidades:** `u` = unidad de mundo; la pantalla muestra 650 u en el lado corto (`js/core/constants.js:20`); un campeón mide ~66–70 u (ART_BIBLE §2). **Escala de px usada acá (supuesto explícito):** decales y zonas de suelo 2,0 u/px (canon de suelos, ART_BIBLE §14); proyectiles, auras y efectos a escala de cuerpo 1,0 u/px (canon de campeones). Los tamaños en u son del código (a nivel base: maestría y talentos multiplican radio/alcance, `AREA` en `js/skills/abilities.js`); los px son conversión.
> **Tiempos:** casi todas las habilidades son instantáneas (el daño se aplica al lanzar). La pose de lanzamiento del héroe dura 420 ms (650 ms en definitiva); la anticipación del efecto debe caber ahí y en el premarcado del apuntado, sin retrasar el golpe, salvo donde se indica un retardo real.

## A. Identidad

- **Rol:** Tanque de línea (`roleCategory: tanque`), cuerpo a cuerpo (básico 78 u, 620 ms). Atrae a la Horda, protege al equipo y arrasa con su torbellino. Es la referencia oficial de estilo (ART_BIBLE §2).
- **Tono:** Heroico, sólido y protector: el Caballero. Acero azul, escudo, estandarte y chispas de metal; pesado y confiable, nunca siniestro ni brillante en exceso.
- **Fuentes del kit:** `js/data/champions.js:34`; `js/skills/abilities.js:999`; `js/skills/abilities.js:1070`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/tanque/atlas.png`: azul acero `#103090`/`#103070`, marrón cuero `#905030`/`#703010`, rojo oscuro `#703030`. Color de clase `#5f8fc4`, brillo `#a9cdf0` (`champions.js`). Es el Master Reference: no se rediseña.
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Azul acero (dominante) | `#5f8fc4` |
  | Azul claro (chispa y brillo) | `#a9cdf0` |
  | Azul profundo (sombra) | `#2f5a96` |
  | Azul-negro (contorno) | `#14213a` |
  | Blanco acero (destello) | `#f2fbff` |
  | Rojo provocación (solo la definitiva) | `#ff5a3d` |

- **Motivos visuales:** escudo, torbellino de hojas de acero, chispas de metal, estandarte, ondas de voz, aura que crece, sello de provocación rojo con signo "!".
- **Pasiva:** *Bastión* (aliados a ≤200 u reciben 8% menos de daño) no tiene indicador visual propio; no se pide arte.
- **NO debe parecerse a:** **Baltra** (campana, bronce y azul), **Bront** (acero gris-azul, placas) y **Brakk** (ocre): Aldric es azul acero con chispas, sin bronce ni placas. **Musashi** (`#5aa8d8`) y **Libertador** (`#2f4f9a`): el azul de Aldric es de armadura de caballero; evitar espadas finas o uniformes. **Thalen** (hielo/azul cristal): sin cristales. **Facu GM** (azul mar).

## B. Habilidades

Convención de cada ficha: *Mecánica* = lo que hace el código hoy (no se inventa nada); el resto es lo que se pide al dibujante. "Frames" = cuadros sugeridos por fase.

### Ataque básico — Golpe de Escudo

- **Mecánica (código):** Melee: golpea a todo enemigo a ≤78 u ("golpe corto en arco: alcanza a todos los enemigos frente a él"), enfriamiento 620 ms, pose 190 ms; destello de tajo a 38 u del héroe.
- **Tipo:** cuerpo a cuerpo (círculo de golpe) · **Fuente:** `js/data/champions.js:34`; `js/data/champion-identity.js:26`; `js/skills/abilities.js:235`
- **Silueta y forma:** Un empujón de escudo: una onda en media luna de 56 u frente al héroe, con borde de metal y 3 chispas.
- **Color dominante:** Azul claro `#a9cdf0` con destello `#f2fbff`.
- **Movimiento:** El escudo adelanta 8 u y retrocede en 3 cuadros; la onda sale desde el borde.
- **Anticipación:** Sin retardo (pose 190 ms): 1 cuadro con el escudo atrás.
- **Impacto:** Chispa metálica de 17 u y una muesca de abolladura.
- **Disipación:** Las chispas caen en 3 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 3 · disipación 3 (= 7 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Onda de escudo: 56×40 u → **56×40 px** nativos (1 u/px)
  - Impacto: 34×34 u → **34×34 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Sin extras.
- **Cómo se distingue de las otras del mismo campeón:** Es corto y azul claro; el Torbellino es un aro, la Embestida una estela, los gritos son auras.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Golpe de pala de Renko (marrón, terrones) y tajos de Segador (rojo): el de Aldric es una onda de escudo azul.

### Habilidad 1 — Torbellino

- **Mecánica (código):** `spin_channel`: sin apuntado; gira 2400 ms haciendo 0,5× cada 280 ms (≈8 golpes) a todo enemigo en 115 u. Coste 46, enfriamiento 9500 ms. El grito de guerra puede prolongarlo. Hoy: estallido de nivel (`#9fe3ff`/`#cdeeff`) al empezar y partículas giratorias.
- **Tipo:** canalización (aro giratorio que sigue al héroe) · **Fuente:** `js/data/champions.js:40`; `js/skills/abilities.js:999`; `js/core/update.js:699`
- **Silueta y forma:** Un aro de hojas de acero (6 filos curvos) de ⌀230 u que gira alrededor del héroe, con una estela circular y chispas en las puntas; el escudo marca el centro.
- **Color dominante:** Azul acero `#5f8fc4` y blanco acero `#f2fbff` en los filos; chispas `#9fe3ff`.
- **Movimiento:** Arranca con un estallido; gira a ~2 vueltas por segundo con un leve acelerado al principio y frenado al final; 8 destellos en las puntas coinciden con los 8 golpes.
- **Anticipación:** Pose de 420 ms: se agacha y arma el escudo; 2 cuadros de viento que lo rodea.
- **Impacto:** Destello radial de 115 u de radio al arrancar y chispas al golpear.
- **Disipación:** El aro frena y las hojas se disuelven en 4 cuadros.
- **Frames sugeridos:** anticipación 2 · impacto 3 · disipación 4 (= 9 cuadros) + bucle de 8 cuadros
- **Loop:** Aro giratorio en bucle de 8 cuadros durante 2,4 s (más largo si Grito de Guerra extiende el giro).
- **Tamaño de los assets:**
  - Aro de hojas (bucle): 230×230 u → **230×230 px** nativos (1 u/px)
  - Estela circular: 230×230 u → **115×115 px** nativos (2 u/px)
  - Destello de punta: 14×14 u → **14×14 px** nativos (1 u/px)
- **Partículas / capas secundarias:** El efecto crece por niveles de talento (`tierOf`: nivel ≥3, ≥5, ≥7): base + 3 capas opcionales (más hojas, runas, segundo anillo); entregar la base y las capas por separado. Ya existe ícono PNG propio (`assets/ui/skill-icons/torbellino.png`).
- **Ícono 16×16:** propuesta: conservar el PNG existente.
- **Cómo se distingue de las otras del mismo campeón:** Es el único aro giratorio y persistente; Embestida es lineal, Grito es una aura, la ulti un sello rojo.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Danza del Augurio (Ismara)** y **Mil Cortes (Musashi)**: giros con hoja. El de Aldric es un aro de hojas de acero azul, grande y duradero.

### Habilidad 2 — Embestida

- **Mecánica (código):** `charge_drag`: avanza 230 u en línea (premarcado `dash` de 30 u), 1,6×; el primer enemigo que toca (a ≤26 u + radio) queda aturdido 400 ms y arrastrado 260 ms. Coste 34, enfriamiento 6500 ms. Hoy: anillo de 34 u al arrancar, "slash" y rayo `#9fe3ff`/`#cdeeff` de 40 u al llegar, y un efecto de estela del sprite del Caballero (`dashFxTimer` 1050 ms).
- **Tipo:** desplazamiento (carga y arrastre) · **Fuente:** `js/data/champions.js:41`; `js/skills/abilities.js:1009`
- **Silueta y forma:** Una estela de velocidad azul de 230 × 40 u detrás de Aldric y un golpe de escudo de 60 u en el punto de llegada; el enemigo arrastrado queda "pegado" al escudo.
- **Color dominante:** Azul claro `#a9cdf0` y blanco `#f2fbff`; sombra `#2f5a96`.
- **Movimiento:** Líneas de velocidad en 3 cuadros desde el origen; el escudo golpea con compresión en el final; el enemigo rebota.
- **Anticipación:** Premarcado de salto (existente); 1 cuadro de agachado.
- **Impacto:** Choque de escudo con anillo de 40 u y sacudida corta.
- **Disipación:** La estela se alarga y se disuelve en 5 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 3 · disipación 5 (= 9 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Estela: 230×40 u → **230×40 px** nativos (1 u/px)
  - Choque de escudo: 80×80 u → **80×80 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Polvo en el suelo detrás de la estela (6 puntos). Ya existe ícono PNG propio (`assets/ui/skill-icons/embestida.png`).
- **Ícono 16×16:** propuesta: conservar el PNG existente.
- **Cómo se distingue de las otras del mismo campeón:** Es la única lineal y de movimiento; las otras son aros o auras sin desplazarse.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Paso escarlata (Veyra)**, **Costura de fuga (Vesper)**, **Carga de San Lorenzo (Libertador)**: dashes. El de Aldric es una estela azul con golpe de escudo; los otros: sangre carmesí, hilo violeta, caballo blanco.

### Habilidad 3 — Grito de Guerra

- **Mecánica (código):** `war_cry`: sin apuntado; 5000 ms: +24% de defensa, +16% de vida máxima y crece ×1,18 de tamaño. Sello de 46 u (`#8fd0ff`) alrededor y anillo de 56 u (450 ms). Coste 32, enfriamiento 8500 ms.
- **Tipo:** aura / buff personal (crecimiento) · **Fuente:** `js/data/champions.js:42`; `js/skills/abilities.js:1044`
- **Silueta y forma:** Ondas de voz (3 arcos concéntricos) que salen de la boca y un estandarte pequeño azul que se despliega a la espalda; el sello de 46 u de radio late bajo los pies.
- **Color dominante:** Azul `#8fd0ff` y azul acero `#5f8fc4`; estandarte con emblema blanco.
- **Movimiento:** Tres ondas salen en secuencia (cada 2 cuadros); el estandarte sube en 3 cuadros y ondea durante 5 s.
- **Anticipación:** Pose de 420 ms: pecho hinchado.
- **Impacto:** Anillo de 56 u y destello al crecer.
- **Disipación:** El estandarte baja y el sello se apaga en 4 cuadros.
- **Frames sugeridos:** anticipación 2 · impacto 3 · disipación 4 (= 9 cuadros) + bucle de 6 cuadros
- **Loop:** Estandarte y sello en bucle de 6 cuadros durante 5 s.
- **Tamaño de los assets:**
  - Sello bajo los pies: 92×92 u → **46×46 px** nativos (2 u/px)
  - Ondas de voz: 70×50 u → **70×50 px** nativos (1 u/px)
  - Estandarte: 20×40 u → **20×40 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Ya existe ícono PNG propio (`assets/ui/skill-icons/grito-de-guerra.png`).
- **Ícono 16×16:** propuesta: conservar el PNG existente.
- **Cómo se distingue de las otras del mismo campeón:** Azul y pequeña; la ulti es roja y de 230 u.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Bendición de Guerra (Elyra)** (rojo) y **Grito de Caravana (Ilkan)**: gritos de equipo. El de Aldric es personal, azul, con estandarte.

### Definitiva — Grito Provocador

- **Mecánica (código):** `taunt_provoke`: sin apuntado; todos los enemigos a ≤230 u quedan provocados 6000 ms (siguen a Aldric); +38% de defensa y +35% de vida máxima, el Torbellino dura ×2 y el héroe se "agiganta" (`colossalTimer`). Sello de radio 115 u (`#ff5a3d`) y anillo de 230 u (700 ms). Coste 0, enfriamiento 30000 ms.
- **Tipo:** aura en área (provocación) + transformación de tamaño · **Fuente:** `js/data/champions.js:44`; `js/skills/abilities.js:1070`
- **Silueta y forma:** Un sello de provocación rojo en el suelo (⌀230 u) con rayos radiales hacia cada enemigo y una marca "!" roja sobre cada provocado; Aldric agrandado con un aura roja a su alrededor.
- **Color dominante:** Rojo `#ff5a3d` con naranja `#ffb08a`; núcleo blanco `#f2fbff`. Excepción de paleta: es la única roja del kit, porque provoca.
- **Movimiento:** Onda roja de 230 u en 4 cuadros; los rayos tiran de los enemigos hacia Aldric (líneas que se acortan); el sello late 6 s.
- **Anticipación:** Pose de 650 ms: Aldric hincha el pecho y crece.
- **Impacto:** Anillo de 230 u con sacudida corta y flash rojo suave.
- **Disipación:** El sello y las marcas "!" se apagan en 6 cuadros.
- **Frames sugeridos:** anticipación 4 · impacto 5 · disipación 6 (= 15 cuadros) + bucle de 8 cuadros
- **Loop:** Sello y marcas "!" en bucle de 8 cuadros durante 6 s.
- **Tamaño de los assets:**
  - Sello de provocación: 230×230 u → **115×115 px** nativos (2 u/px)
  - Anillo de onda: 460×460 u → **230×230 px** nativos (2 u/px)
  - Marca "!" sobre enemigo: 14×20 u → **14×20 px** nativos (1 u/px)
  - Aura roja alrededor del cuerpo: 100×110 u → **100×110 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Líneas rojas finas del enemigo a Aldric (hasta ~12 visibles).
- **Ícono 16×16:** hoy `horn+up` (`js/ui/skill-pixel-glyphs.js:165`); propuesta: cuerno con flecha hacia arriba (mantener).
- **Cómo se distingue de las otras del mismo campeón:** La única roja y la única que apunta a los enemigos (el resto de su kit es azul y propio).
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Segador de Almas** (aura roja) y **Coloso de Arena (Ilkan)**: transformaciones rojas/arena. La de Aldric es un sello de provocación con marcas "!"; sin calaveras ni arena.

