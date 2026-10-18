# Auditoría de VFX de habilidades — segunda mitad del roster (agente B)

Rama `claude/vfx-habilidades-b`. Alcance: los campeones cuya clave, en orden alfabético, cae en la **segunda mitad** de los 43 que
registra `CLASSES`. Con 43 claves la mitad es 21,5: este agente tomó los **21 de `myla` a `zahra`** (myla, nahir, nano_gm, nigromante,
oriel, orsa, profeta, renko, saelis, segador, sira, solciju, soporte, tanque, tibor, velmira, vesper, veyra, vhal, ynara, zahra).
**`musashi` es el campeón de borde** (el puesto 22 de 43): si el otro agente cuenta 21 + 22 o 22 + 21 lo decide su partición; aquí **no se tocó**
(no se modificó ningún archivo de `musashi`) y queda pendiente de confirmar a quién le toca. Ilkan (ex Eren) cae en la primera mitad y no se tocó.

Todo lo de esta rama es **solo visual**: no cambia daño, recargas, alcance, duración ni hitboxes, y no consume `Math.random`
(el azar de la simulación). Se comprobó con una prueba diferencial en el motor real (ver «Verificación»).

## Cómo se audita (reproducible)

```bash
python3 -m http.server 8961 --bind 127.0.0.1 &                # el juego (raíz del repo)
TAG=despues node tools/vfx/audit-abilities.js                 # hojas por campeón: 5 filas (básico, 3 hab., ulti) × 4 instantes (60/200/450/900 ms) a 844x390
KVB=0 TAG=antes node tools/vfx/audit-abilities.js             # lo mismo SIN los efectos nuevos (equivale a main): ?kvb=0 apaga js/champions/vfx-b/
python3 tools/vfx/make-compare.py                             # docs/vfx/compare/<campeón>.png: antes/después lado a lado
```

El script lanza cada habilidad en el motor real contra 10 muñecos agrupados, recorta alrededor del campeón (300×210 unidades de mundo, que es lo que
se ve en un 844×390), cuenta qué hizo cada una (sprites de efecto por clave, partículas, ondas, telegrafías, firma) y mide el costo de `update()+render()`.
Para cada habilidad se anotó: **¿tiene sprite/animación propia?**, **¿solo círculos y partículas genéricas?**, **¿se lee en 844×390?** y **¿el dibujo coincide con el área real?**

## Hallazgos globales (estado en `main`)

1. **Todas las habilidades de Expedición, Ascensión y Calidad cinco** de esta mitad mostraban el efecto
   genérico de `kitFx` (`js/champions/kit-shared.js`): un puñado de sprites **compartidos entre campeones sin relación** (`fxSplash`/`fxWave`/`fxVortex`/`fxWhirl` de la
   Arena Acuática, `fxIceCrystal`/`fxFrostRune` del Mago, `fxScytheSlash`/`fxSoulReapBurst` del Segador, `fxHolyShieldBubble` de Elyra, `fortFireBurst` de la Fortaleza…)
   más un anillo y una ráfaga de partículas. Resultado: **Renko lanzaba cristales de hielo azules; Saelis, Tibor y Velmira, remolinos de agua o chispas amarillas; Veyra y Vesper,
   la guadaña blanca/la calavera del Segador; Zahra, el estallido de fuego de la Fortaleza; Solciju, la calavera del Segador**.
2. **El dibujo no seguía el área real** en casi todas: el cono se pintaba al 60 % del alcance, el salto como una línea de partículas, los pulsos de zonas persistentes
   como un anillo fijo sin anticipación ni disipación.
3. **Habilidades sin ningún efecto propio**: toda la definitiva y las potenciaciones de los clásicos (`tanque`, `soporte`, `segador`, `profeta`: solo anillos del mismo color y un texto), las
   tres de `ynara` que no son zona, la Burbuja Cremosa de `myla` y la Encarnación del Abismo de `nigromante`.
4. **Ataques básicos**: todos los de esta mitad terminaban en la misma chispa blanca de `vfxHit`.
5. Sí había arte propio, y se **conservó**, en: la plaga del suelo, el gólem que se arma y las invocaciones de `nigromante`; la torre, el charco y el bebé del Berrinche de `myla`;
   los portales, la cicatriz y la fisura persistentes de `oriel`; el pozo, la órbita y el colapso de `vhal`; las plumas clavadas de `saelis`; las máscaras de `velmira`; el
   juicio de `nano_gm`; las zonas persistentes de Calidad cinco.

## Qué se hizo

Sistema nuevo en `js/champions/vfx-b/` (sin recursos de terceros; todo se genera por código al primer uso y queda en caché):

| Archivo | Qué es |
|---|---|
| `pixfx.js` | Motor: decales de suelo (`kvbDecal`), motivos pequeños (`kvbPart`/`kvbEmit`), rayos de baldosa (`kvbBeam`), pool propio de 128 entradas en dos capas (suelo y encima), RNG cosmético propio (**nunca** `Math.random`), `kvbFx` (se graba en el anfitrión y se repite en los invitados vía `NET_EVENT_FNS`), respeta «Reducir efectos» (`JUICE.reduceFx`), la carga adaptable (`vfxLoad`) y «Reducir movimiento». Sprites pixel: alfa 0/255, contorno oscuro de 1 px, translucidez por tramado Bayer 4×4 (no alfa suave), 1 píxel de arte ≈ 4,4 unidades de mundo. |
| `templates.js` | Plantillas de decal (anillo), sector (cono) y rayo con las **tres fases legibles**: anticipación (el borde converge y el glifo se forma), impacto (borde grueso en el radio real) y disipación (se deshace por tramado). |
| `hooks.js` | Enganches **sin tocar la mecánica**: envuelve `exCastFx`/`ascCastFx`/`qualityFiveFx` (puntos donde ya se dibujaba el efecto genérico, con el radio/origen/fin reales del lanzamiento), `castAbility`/`portadorCast` para los clásicos (el área se recompone con las mismas fórmulas de maestría/talentos/evolución), pieles de objetos persistentes (`portadorObjects`) que leen el estado real (radio, vida, pulsos restantes) y overlays por héroe que leen los temporizadores reales (giro, grito, furia, inmunidad…). |
| `<campeón>.js` | Una receta por habilidad, con paleta y motivos propios del campeón. |

El **premarcado** (`AIM_PROFILES`/`ACTION_AIM_PROFILES`) no se tocó: el efecto final cae exactamente donde el premarcado mostraba (cono, línea, salto o punto). Donde la mecánica
tiene dos radios (Alba Purificadora: cura 260 u y daña 160 u; Cerrar el circuito: golpe a 0,7·r y descarga a r) se dibujan **los dos**.

## Habilidad por habilidad

Leyenda de «Antes»: **G** = solo efecto genérico del motor/`kitFx` (sprite compartido con otros campeones), **0** = ningún efecto propio, **P** = arte propio ya existente (conservado).
«Se lee» es la lectura en 844×390 antes de este trabajo. Todas quedan con sprite/animación propia del campeón en el «Después».

| Campeón | Habilidad | Antes | Después |
|---|---|---|---|
| **Myla** | Básico | G chispa | impacto de yogur (gotas crema/rosa) |
| | Torre de Yogur | P | sin cambios (arte propio) |
| | Yogurazo | P (charco) | charco con burbujas vivas, estallido al caer y al secarse |
| | Burbuja Cremosa | G anillo fino, no se leía | burbuja de yogur alrededor mientras dura el escudo real |
| | BERRINCHE | P (bebé) | aro de ondas de llanto + lágrimas |
| **Nahir** | Astillas errantes | G chispas amarillas, cono al 60 % | abanico de vidrio aguamarina al alcance real + astillas que vuelan |
| | Reflejo fugitivo | G | estela del salto + espejo oval en pie (con su copia tenue) que estalla al desaparecer |
| | Corte cruzado | G | corte lineal + un eco que sale de cada reflejo real |
| | Galería de nadie | G | tres espejos con estallido de 80 u + triángulo de luz entre ellos |
| **Nano GM** | Sentencia Umbría | G calavera | decreto negro con filo dorado + explosión de 70 u en la punta |
| | Edicto de Luz | G | ley dorada en el suelo (radio real) con pergamino |
| | Inversión | G | estela + estallido mitad blanco / mitad negro |
| | Juicio del GM | G + P (juicio) | esquirlas blancas/negras y ley que cae; la división de la arena es la del objeto real |
| **Nigromante (Ilvar)** | Cosecha, Gólem, Plaga | P | sin cambios |
| | Encarnación del Abismo | 0 | estallido de abismo al absorber + aura de llamas verdes y almas mientras dura el Demonio |
| **Oriel** | Abrir Cicatriz | G remolino azul de agua | dos portales rosa con pétalos |
| | Eco de la Cicatriz | G | pulso de grietas con el radio real en cada portal abierto |
| | Paso entre Mundos | G calavera | grieta de salida + pulso de llegada |
| | La Gran Cicatriz | G | fisura enorme con esquirlas y brillos |
| **Orsa** | Perno conductor | G `fxBolt` | rayo de cobre quebrado con ramales, chispas en la punta |
| | Apoyar la culata | G | ancla con tornillos mientras dura la postura real + un perno por disparo reforzado |
| | Cerrar el circuito | G | circuito en el radio de golpe + anillo punteado en el de la descarga |
| | Tormenta de rescate | G | nube + un barrido cónico por pulso + descarga final de radio real |
| **Ismara (Profeta)** | Básico | G | impacto turquesa |
| | Destino Restaurado | 0 anillo | reloj que rebobina sobre el aliado curado |
| | Visión del Inmortal | 0 | burbuja sobre el aliado mientras dura la inmunidad real + ojo |
| | Danza del Augurio | 0 anillo | aro de daño y aro interno de aturdimiento (los dos radios reales) |
| | Ascensión del Elegido | 0 | hilo al aliado fusionado + aura mientras dura |
| **Renko** | Surco de contención | G cristales de hielo azules | franja de tierra removida + estaca con nombre |
| | Montículo | G | aro de terrones con brotes (radio real) |
| | Devolver a la tierra | G | golpe con grietas + terrones |
| | Aquí siguen los nombres | G | 3 sacudidas con grietas, una por pulso real; la última, con piedras |
| **Saelis** | Abanico de Plumas | G remolino de agua | cinco carriles de pluma (±.42 rad, los reales) con plumas que vuelan |
| | Ráfaga Ascendente | G | ráfaga en el radio real con plumas y nubecitas |
| | Llamado del Plumaje | G | las plumas doradas vuelan de regreso (aviso original conservado) |
| | Cielo de Plumas | G agua | nube de plumas y puffs en el radio real |
| **Segador** | Tajo | G arco blanco | guadaña roja que barre el abanico real (con −30 % de la Armadura nivel 5+) |
| | Armadura de la Furia | 0 | aro de pinchos mientras dura `furyArmorTimer` |
| | Último Aliento | 0 | latido + corazón rojo |
| | Segador de Almas | G calavera | aura de furia pulsante + almas que suben mientras dura `berserkTimer` |
| **Sira** | Línea de tinta | G runas heladas | franja de tinta con salpicaduras y cruces de mapa |
| | Volver sobre los pasos | G | rebobinado por el trazo con chevrones + brújula |
| | Borrar el camino | G | goma sobre el trazo real (o círculo de 80 u si no hay ruta) |
| | Atlas de los ausentes | G | mapa de pergamino sobre la ruta con 3 pulsos |
| | (pasiva visible) rastro | línea fina de 2 px | huellas de tinta que se desvanecen |
| **Solciju** | Vino maldito | G calavera | salpicadura de vino en el radio real |
| | Barrica añeja | G + P (anillo) | barrica que cae, mecha que cuenta el tiempo REAL y astillas al estallar |
| | Brindis a solas | G escudo celeste | copa dorada en alto |
| | Gran Reserva | G | charco de vino con 4 pulsos y uvas |
| **Elyra (Soporte)** | Alba Purificadora | G sprite blanco | aro de curación 260 u + sol de daño 160 u (los dos radios reales) |
| | Bendición de Guerra | 0 | espadas rojas sobre cada aliado alcanzado |
| | Escudo Sagrado | 0 | escudos azules sobre cada aliado alcanzado |
| | Bendición Suprema | G | sol dorado + espada y escudo + alas |
| **Aldric (Tanque)** | Torbellino | 0 anillos | aro de hojas de acero con el radio real y mientras dura el giro |
| | Embestida | 0 | estela de velocidad + impacto de escudo |
| | Grito de Guerra | 0 | ondas de voz + estandarte mientras dura |
| | Grito Provocador | 0 | aro de provocación + «!» sobre cada enemigo provocado mientras dura su temporizador |
| **Tibor** | Nube obrera | G chispas amarillas | nube con abejas que vuelan dentro de la zona real y panal |
| | Volvé a casa | G escudo celeste | las abejas regresan |
| | Polen de aviso | G | nube de polen en el radio real |
| | El cielo zumba | G | colmena mayor con panal y enjambre |
| **Velmira** | Máscara Arrojada | G chispas | la máscara activa vuela girando, con confeti de su color |
| | Coro de Rostros | G runas | cuatro máscaras en órbita + pulso |
| | Cambio de Rostro | G | cambio de máscara sobre ella |
| | El Gran Teatro | G | cuatro máscaras gigantes, una por acto |
| **Vesper** | Agujas de penumbra | G calavera | abanico de hilos y agujas que cruzan el cono real |
| | Costura de fuga | G | costura de puntadas que pulsa 4 veces sobre el trazo real |
| | Deshilachar | G guadaña | corte circular con tijeras e hilos |
| | La última puntada | G | bordado circular fijo + un corte por pulso |
| **Veyra** | Abrir la herida | G guadaña blanca | tres tajos carmesí en el abanico + garra |
| | Paso escarlata | G | estela de sangre + herida en la llegada |
| | Pacto de dolor | G escudo celeste | sello que late bajo ella mientras dura la velocidad real |
| | La última herida | G | herida enorme en el radio real |
| **Vhal** | Estrella Errante | G rayo | cometa con estrella de 5 puntas |
| | Pozo Gravitatorio | G + P | espiral que atrae con polvo estelar hacia el centro |
| | Órbita | G | arco de estrellas |
| | Colapso | G + P | atracción de estrellas hacia el centro (el estallido final es el del objeto) |
| **Ynara** | Básico | G | corazones |
| | Mirada fulminante | 0 | abanico de luz rosa al alcance real |
| | Estrogonof reparador | 0 (solo aro) | vapor y corazones que suben del plato + aro de la fuente |
| | No quiero seguir esta conversación | 0 | cortina de agua con corriente y gotas sobre la banda real |
| | Santa Paciencia | 0 (solo aro) | halo del santuario con pulso en cada ronda |
| **Zahra** | Boca de horno | G `fortFireBurst` | cono de llamas al alcance real |
| | Enfriar | G salpicadura de agua | nube de vapor en el radio real |
| | Paso de ceniza | G fuego | estela de ceniza con brasas + un pulso por tramo |
| | Abrir todas las válvulas | G fuego | válvulas, vapor y brasas, 4 pulsos |

## Verificación (corrida en este entorno)

- `node tools/vfx/verify-mechanics.js` — cada habilidad (básico, 3 habilidades y definitiva) de los 21 campeones, **con y sin** los efectos nuevos, misma semilla y mismos
  enemigos, huella de vida/posición/estados de cada enemigo y héroe, recargas y objetos en 4 instantes: **105 de 105 idénticas**, 0 errores de página. Con `CANARY=1` (un efecto que
  sí resta 1 de vida) la prueba **falla como debe**, así que no es decorativa.
- `node tools/vfx/test-vfx-b.js` — sin `Math.random`, pool acotado a 128 aun con 5000 lanzamientos, expiración y limpieza, argumentos hostiles (NaN, ∞, negativos, texto),
  vínculos contra habilidades reales del roster, grabación y repetición en red, y **todos los sprites con alfa 0/255** (2802 cuadros revisados).
- `node tools/bible/ability-gate.js --strict` — **0 campeones nuevos que no pasan, 0 errores de página** (43 campeones). Los INFO de clásicos son preexistentes y no cambian.
  Además se comparó el filtro con y sin efectos (`ABILITY_BASE_URL=http://127.0.0.1:8961/?kvb=0`) en Zahra, Vhal, Oriel y Veyra: **las cuatro siguen en PASS, pero la categoría CONTROL medida en
  cuatro habilidades (Paso de ceniza, Paso escarlata, Pozo Gravitatorio, Abrir Cicatriz) aparece con los efectos apagados y no con los nuevos**. Causa probable, **no trazada hasta el proc exacto**: los efectos genéricos
  reemplazados llamaban a `Math.random` (`vfxBurst`, ~3400 llamadas menos en un lanzamiento de Zahra) y el filtro siembra ese mismo generador, así que la secuencia de azar de la simulación se desplaza
  y algún estado con probabilidad (de objetos, sets o refuerzos) cae distinto; con azar constante (`verify-mechanics.js`) no hay ninguna diferencia. Es un efecto colateral de **dejar de consumir el azar de la simulación
  con partículas**, no un cambio de daño, control ni alcance de las habilidades.
- Pruebas existentes que tocan estas habilidades, todas igual que en `main`: `tools/portadores/test-elyra.js` (OK), `test-ynara.js` (38/38), `test-myla.js` (**5 fallos de talentos que ya fallan en `main`**, idénticos con
  y sin esta rama), `tools/quality/test-ability-resources.js`, `test-classic-passives.js`, `test-nano-render.js`, `test-projectile-identity.js`, `test-vfx-pools.js`, `tools/audio/test-combat-rng.js`
  (el sonido no cambia el azar), `tools/ux/test-ability-inspector.js`, `tools/bible/champion-validator.js --strict`, `node --test tools/regression/test-aim-hostiles.js` y `tools/factory/test.js`, y `tools/portadores/online-ynara.js` (multijugador con Ynara y otros).

## Costo por frame

Medido con `tools/vfx/bench-cost.js` (cada campeón lanza su kit completo en bucle contra 12 muñecos con el pool de efectos llevado al tope de 128 entradas: es el **peor caso**, no el juego normal;
alterna `KVB.off` y mide aparte el tiempo propio de las funciones de `vfx-b`).

- **Medición en máquina tranquila** (primera corrida, 21 campeones, 3 repeticiones, sin calentamiento): el frame medio fue de 11,3 ms sin los efectos y 10,5 ms con ellos (Δ −0,8 ms: es ruido, el orden de las corridas favorecía a la segunda). Con eso solo se puede decir que **la diferencia queda dentro del ruido de la medición**.
- **Medición con la máquina saturada** (carga de 80–100 en 4 núcleos por otros procesos; los frames tardaron 100–300 ms, así que el tiempo absoluto no sirve): lo único que se pudo medir con fiabilidad es el **tiempo propio de `vfx-b` como fracción del frame**,
  y en los 7 campeones más cargados (oriel, zahra, soporte, vhal, velmira, tibor, renko) fue de **3,6 % a 6,9 % del frame, media 4,9 %** en ese peor caso con el pool al tope. Traducido a una máquina normal (~10 ms por frame) son del orden de **0,4–0,7 ms por frame**, y menos en juego normal (el pool rara vez pasa de 60 entradas).
- Los dos controles que la acotan por diseño: pool de 128 (si se llena se descartan los efectos secundarios y se conservan los prioritarios) y recorte por visibilidad (`inView`); con «Reducir efectos» (`JUICE.reduceFx`) o con `vfxLoad` bajo las ráfagas de motivos se reducen al 40–60 %.
- **Sin medir** en un móvil real ni con GPU. Si el costo preocupa, el siguiente paso barato es bajar `KVB.MAX` a 96 o cachear los decales ya escalados.

## Pendientes

- **Revisión humana de arte**: todo lo generado por código está pensado con la gramática de `docs/ART_BIBLE.md` (§7: personajes pixel + VFX modernos; paleta acotada, contorno de 1 px, alfa 0/255),
  pero no sustituye el visual gate ni una revisión de un artista: sobre todo la lectura de los tramados en pantallas chicas reales y la elección de motivos.
- **Musashi** (campeón de borde, ver arriba) y el resto de la primera mitad: a cargo del otro agente.
- **Pruebas en dispositivo real** (móvil de gama baja) y multijugador con latencia: aquí solo se midió en Chromium sin GPU y con el relay local.
- **Pasivas con efecto visible**: se cubrieron el rastro de Sira, la aura de la postura de Orsa y la burbuja de Veyra; las pasivas sin lectura propia (p. ej. Nigromante, Ynara «inmaculada») no se tocaron.
