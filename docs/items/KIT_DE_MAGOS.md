# Kit de Magos — ítems que cambian la PASIVA

> Datos: `js/data/mage-kit.js` · Lógica: `js/systems/mage-passives.js` · Prueba: `tools/items/t_mage_kit.js`
> Pedido del dueño: ítems legendarios, míticos y únicos con cualidades especiales que afecten las habilidades **pasivas** de **todos los magos**, sin reescribir cada campeón.

## 1. Idea en una línea

Todo mago tiene un **medidor de pasiva** (0 a 100 %). Las piezas del kit actúan sobre ese medidor: lo llenan, lo conservan, lo gastan en ondas, lo reviven. Si el mago tiene **adaptador**, el medidor *es* un número real de su pasiva (calor, presión, residuos…); si no, usa una pasiva de **respaldo** ("Resonancia") que funciona con cualquier mago, incluso uno que se agregue mañana.

## 2. Las 12 piezas

Todas se **equipan solo en magos** (`roleCategory === "mago"`) y **nunca se venden** en la tienda. En la ficha dicen `❂ CAMBIA TU PASIVA — <poder> … (solo magos)`.

### Legendarios (7)

| Pieza | Ranura | Poder | Qué hace | Cae en (peso) |
|---|---|---|---|---|
| Diadema de la Voz Repetida | casco | **Cauce Desbordado** | Cada lanzamiento llena 20 % la pasiva (la definitiva, 40 %). Enfriamiento interno 0,4 s. | Laberinto 4, Micelial 2 |
| Túnica del Sobrante Sagrado | pechera | **Alquimia del Sobrante** | Con más de 80 % de energía, cada 1,2 s convierte 12 % de la energía máxima en 25 % de carga. | Micelial 4, Bosque 1 |
| Guantes del Tercer Sello | guantes | **Tercer Sello** | Cada 3.er lanzamiento resuena: onda de 110 px (30 % del daño, hasta +50 % con la pasiva llena) que ralentiza 20 % por 1,2 s y suma 10 % de carga. | Acuática 4, Laberinto 2 |
| Sandalias del Hechizo Recordado | botas | **Memoria de Hechizo** | Si un lanzamiento gasta 35 % o más de la pasiva, devuelve la mitad 0,6 s después. Cada 6 s. | Hielo 4, Abismo 2 |
| Égida del Velo Resonante | escudo | **Velo de Resonancia** | Al cruzar el 50 %: escudo de 8 % de la vida + 10 % de armadura 3 s (`kitBuff`). Cada 7 s. | Fortaleza 3, Abismo 3 |
| Cetro de la Marca Contagiosa | arma | **Marca Contagiosa** | La 3.ª habilidad marca hasta 4 enemigos (4 s): +8 % de daño de habilidades y cada golpe de habilidad sobre uno marcado carga 4 %. | Infernal 3, Fortaleza 2, Bosque 2 |
| Capucha del Canalizador Quieto | casco | **Pausa del Canalizador** | Quieto 0,7 s, la pasiva gana 7 % cada 0,5 s hasta 60 %. | Bosque 3, Minas 3 |

### Míticos (3, se fabrican con 3 legendarios del kit)

| Pieza | Ranura | Receta | Poder |
|---|---|---|---|
| Báculo del Coro Sin Fin | arma | Diadema de la Voz + Guantes del Tercer Sello + Cetro de la Marca | **Coro Sin Fin**: cada 9 s en combate la pasiva suena **dos veces** (0,45 s entre una y otra): su efecto propio + onda del 20 % del daño. |
| Manto de los Ciclos Eternos | pechera | Túnica del Sobrante + Sandalias del Hechizo + Égida del Velo | **Ciclo Eterno**: la definitiva **revive** la pasiva (carga máxima a los 0,5 s) y las habilidades pegan +12 % por 6 s. Cada 25 s. |
| Corona del Archivo Arcano | casco | Capucha del Canalizador + Sandalias del Hechizo + Guantes del Tercer Sello | **Archivo Arcano**: lanzar las 3 habilidades distintas en 9 s devuelve la energía del lanzamiento, suma 40 % de carga, acorta 1 s los enfriamientos y da +10 % de daño de habilidades 3,5 s. Cada 10 s. |

Las recetas **comparten piezas a propósito** (Guantes del Tercer Sello en Coro y Archivo; Sandalias del Hechizo en Ciclo y Archivo): fabricar una consume la pieza y para la otra hace falta un segundo ejemplar. Los ingredientes de una receta empezada pesan más en el botín (`RECIPE_MISSING_BIAS`), igual que con los míticos de siempre. Cada receta anticipa el poder final (voz + sello + marca = coro; sobrante + memoria + velo = ciclo; quietud + memoria + sello = archivo).

### Únicos (2, jackpot)

| Pieza | Ranura | Poder | Apariencia y VFX |
|---|---|---|---|
| Corona de la Voz Antigua | casco | **La Voz Antigua**: cada lanzamiento hace sonar la pasiva (1 vez cada 1,5 s) con su efecto + onda del 20 %; con la pasiva a 90 %+ las habilidades 1-3 se recargan 20 % más rápido. | Halo violeta + 4 runas píxel que orbitan según la carga. |
| Toga de la Fase Final | pechera | **Fase del Último Ciclo**: con la pasiva llena entra en FASE 5 s (+25 % de velocidad, +10 % de daño, onda del 15 % en cada lanzamiento); al terminar queda en 35 %. Cada 22 s. | Halo celeste, runas y anillo de guiones durante la fase. |

Cada poder tiene un efecto visual propio (`kitFx`: runa, luz, rayo, hielo, escudo, fuego, viento; `kitBuff` para armadura/velocidad/daño) y las runas orbitantes (`drawMageKitAura`) muestran la carga de un vistazo. Ver "VFX" más abajo.

## 3. Restricción a magos (decisión de diseño)

- Las piezas tienen `roleOnly:"mago"`. `canEquipItem` (js/systems/items.js) compara con `CLASSES[k].roleCategory`; los demás guardianes **ven** las piezas en el inventario ("Solo magos", botón "No compatible") pero **no pueden equiparlas**.
- Defensa en profundidad: aunque un objeto llegue equipado a un no mago (partida vieja, intercambio), `heroMagePowers` solo reconoce magos y el poder queda inerte; `roleOnly` se lee del diseño si el objeto lo trae borrado.
- Los bots no usan el kit (`autoEquipBest` solo toma piezas diseñadas para su guardián).
- Se eligió restringir el equipo y no solo el efecto porque es lo más coherente con el sistema existente (los objetos de guardián ya son "Solo X") y evita que alguien se ponga una pieza cuyo texto no hace nada.

## 4. Dónde caen

- `MAGE_KIT_MIN_ARENA = {legendario:2, mitico:4, unico:6}` (Fortaleza, Micelial, Acuática). En Horda Infinita y Pesadilla/Infierno, siempre. Nada del kit cae en la Ciudad.
- Tiradas (`_rollMageKit`, js/systems/loot.js; las usan cofre **y** botín del piso): al caer un Legendario / Mítico / Único, con 20 % / 45 % / 55 % de probabilidad (mago jugando) o 5 % / 8 % / 10 % (otro rol) la pieza sale del kit, pesada por la afinidad de la arena de cada pieza. Los Legendarios de una receta empezada pesan más; lo que ya tenés, 0,3×.
- Tienda: `shopCatalog()` los excluye (como a los legendarios de build); `SHOP_MODE` queda intacto. Los Únicos no se fabrican.
- Colección (Inventario → Colección) tiene el grupo "Kit de Magos — cambian tu pasiva"; el panel de Recetas muestra los 3 míticos con la nota "(solo magos)"; el Códice de cada mago agrega "❂ Kit de Magos · cambia tu pasiva" con su modo (adaptador o Resonancia) y las piezas.

## 5. La capa "Pasiva de mago" (`js/systems/mage-passives.js`)

```
equipo (7 L + 3 M + 2 U) ──► heroMagePowers(classKey) ──► {mp_x:1}
                                   │
 ganchos de item-procs.js:  mageOnCast · mageOnHit · mageDamageMult · updateMagePassives
                                   │
                  medidor de pasiva (fracción 0..1)
                  ├─ adaptador (MAGE_PASSIVE_ADAPTERS[classKey]) → número REAL de la pasiva
                  └─ respaldo "Resonancia" (h._mp.res, 4 cargas) → cualquier otro mago
```

- **Inerte sin kit**: sin ninguna pieza equipada no se escribe nada en el héroe (`_mp` no se activa).
- **Adaptadores** (`MAGE_PASSIVE_ADAPTERS`): `{max, int?, get(h), set(h,v), fire(h)?}`. `max` es el tope **seguro** (Zahra se recalienta a 100 → tope 85). `fire` es el efecto propio cuando la pasiva "suena" (hoy solo Aelith: –0,5 s a las otras, sin bajar de 1 s, igual que su pasiva nativa). Los medidores enteros acumulan decimales hasta completar una unidad y nunca completan una que pase del tope del poder.
- **Respaldo "Resonancia"**: cada lanzamiento suma 1 carga (definitiva 2) de 4; con 4 cargas el siguiente lanzamiento las gasta en una onda de 120 px (40 % del daño, máx. 8 enemigos); se apaga 1 carga cada 7 s sin lanzar. Es la pasiva que ven los magos sin adaptador *mientras llevan una pieza del kit*.
- **Efecto sobre enemigos**: siempre con `damageEnemy(..., {fromProc:true})` sobre `enemies`: sin fuego amigo, sin recursión (`itemProcsOnHit` no se llama para `fromProc`), topes de blancos por onda (`resNovaMax = 8`).
- **Tiempo propio** (`mp.clock`, suma de `dt`): los enfriamientos internos no dependen de la partida entera y son deterministas en las pruebas.

### Qué magos usan adaptador y cuáles respaldo (16 magos, enumerados desde `CLASSES`)

| Modo | Magos |
|---|---|
| **Adaptador** (6) | Aelith (segundos hurtados, `aelithSeconds`, 0-2), Brasa (presión, `portPressure`, 0-3), Morwen (residuos, `portResidue`, 0-5), Zahra (calor prestado, `exState.heat`, tope seguro 85), Tibor (colonia viva, `exState.colony`, 0-100), Nano GM (Equilibrio Luz+Sombra, `ascState`, 0-3: nunca fuerza la Forma del Regente) |
| **Respaldo / Resonancia** (10) | Thalen (`mago`), Axiom, Ilvar (`nigromante`), Myla, Iria, Sira, Aurelia, Vhal, Solciju, Morveth |

Los 10 de respaldo tienen pasivas que dependen de entidades, marcas por objetivo o estado interno de cada kit (anclas de Iria, masa de Vhal, marcas de Solciju, infecciones de Morveth, nodos de Aurelia…) sin un número escalar que se pueda mover sin tocar el campeón; quedan como candidatos para adaptadores propios.

## 6. Cómo agregar un adaptador (o un mago nuevo)

- **Mago nuevo sin hacer nada**: con `roleCategory:"mago"` ya entra en `isMageClass`, recibe las piezas (`canEquipItem`) y todos los poderes funcionan con la Resonancia. La prueba `RESPALDO.*` lo verifica creando un mago ficticio en runtime.
- **Adaptador**: agregar a `MAGE_PASSIVE_ADAPTERS` una entrada con el número real de la pasiva:
  ```js
  mimago:{label:"Mi pasiva", max:5, int:true, get:h=>h.miCarga||0, set:(h,v)=>{ h.miCarga = v; }, fire(h){ /* opcional: efecto propio */ }}
  ```
  Elegir `max` como tope SEGURO (que el jugador no sufra: nada que dispare una penalidad), `int:true` si el valor es entero. Agregar el classKey a la prueba de adaptadores (`ADAPTADOR.*` en `tools/items/t_mage_kit.js`) con una aserción sobre el número real.
- **Poder nuevo**: sumarlo a `MAGE_POWERS` y a `MAGE_CFG` (data), la pieza a `MAGE_KIT_*`, la lógica en `mageOnCast` / `updateMagePassives` / `mageDamageMult`, un ícono 16×16 `item_<designId>` en `js/ui/pixel-icons.js` y un caso en `__measure` de la prueba (la cobertura itera `Object.keys(MAGE_POWERS)`).
- `AGENTS.md`: nada de esto agrega campeones ni toca `knownChampions`.

## 7. VFX por poder

| Poder | Efecto |
|---|---|
| Cauce Desbordado | aro de runas violetas (`kitFx('rune')`) en cada carga |
| Alquimia del Sobrante | destello dorado (`light`) |
| Tercer Sello | onda eléctrica amarilla (`bolt`) del radio real de la onda |
| Memoria de Hechizo | cristales de hielo (`ice`) + "MEMORIA" |
| Velo de Resonancia | burbuja (`shield`) + chevrón de armadura persistente de `kitBuff` |
| Marca Contagiosa | brasas sobre cada marcado + llamarada (`fire`) |
| Pausa del Canalizador | anillo que se cierra en los pies (`vfxShock`) |
| Coro Sin Fin | dos aros de runas seguidos + "CORO" |
| Ciclo Eterno | explosión de luz de definitiva (`light`, `ult`) + "CICLO ETERNO" |
| Archivo Arcano | chispas (`spark`, `ult`) + "ARCHIVO COMPLETO" |
| La Voz Antigua / Fase | halo + 4 runas orbitantes; en Fase, anillo de guiones y viento (`wind`) |

Las runas orbitantes (1-3 para legendarios/míticos según la carga, 4 en los Únicos) las dibuja `drawMageKitAura` desde `drawHero`; respetan "Reducir efectos intensos" porque `kitFx` usa `fxBudget`.

### Iconos

Las 12 piezas tienen ícono propio `item_<designId>` en `PXI_ART` (16×16, ≤ 6 colores, contorno automático; lo valida `node tools/art/check-pixel-icons.js`) y `js/ui/item-icons.js` lo estampa ×2 en la grilla del ícono de objeto (`_paintPixelArt`). El glifo `❂` de la ficha ("resonancia") es otro ícono 16×16 de `PXI_EMOJI`.

## 8. Multijugador (no se tocó `js/net/*` ni `server/`)

- Todo corre en la simulación del anfitrión, con los ganchos de siempre (`item-procs.js`). Un invitado equipa piezas vía `loadoutItems`/`itemPoolFor`, y `heroMagePowers` las lee por ese camino.
- `_mp` (estado) y `_mpMark` (marca en el enemigo) se agregan a `NET_SKIP_KEYS` **desde el módulo** (no se editó `net-game.js`: es el mismo patrón que `solciju.js`/`veyra.js`) para que no viajen en el snapshot. Al invitado solo le llegan `_mpRunes`, `_mpRgb`, `_mpUnique` y `_mpFase` (números y texto): alcanza para dibujar el aura y las runas.
- Limitación: los efectos de un solo disparo (aros, destellos) dependen de cómo el motor ya replique los VFX del anfitrión; el aura persistente sí se ve en el invitado. No se prueba con sesión de red real: **falta una prueba real de multiplayer**.

## 9. Resultados de pruebas

### `node tools/items/t_mage_kit.js` — 51 de 51 (TODO OK)

Cubre datos y recetas, ficha, iconos, tienda, restricción a magos, caída por arena, fabricación, **los 16 magos × los 12 poderes (192 mediciones con el código real)**, adaptadores, mago nuevo sin adaptador, topes, limpieza, partida larga y balance. Salida resumida:

| Bloque | Resultado |
|---|---|
| Datos / recetas / ficha / iconos / tienda | 7 L + 3 M + 2 U = 12 piezas, 6 ranuras, un poder distinto por pieza, recetas de 3 legendarios del kit, ficha "CAMBIA TU PASIVA", íconos 16×16 ≤ 6 colores, 0 piezas en la tienda |
| Restricción | los 16 magos equipan todo el kit; ningún otro rol (27 guardianes) puede; un no mago con la pieza forzada no recibe el poder |
| Caída | mínimos 2/4/6 verificados por arena; a un mago le cae más del doble que a otro rol; la afinidad de arena pesa; el piso también lo suelta |
| **Cobertura** | 16 magos × 12 poderes: todos miden un efecto (cargas, energía, daño de onda, ralentización, escudo, marcas con +8 %, disparos del Coro, medidor al máximo con el Ciclo, energía devuelta + −1 s de enfriamientos + +10 % con el Archivo, runas y enfriamiento −20 % con la Voz, velocidad + onda + cierre en 35 % con la Fase); sin kit la capa está inerte; 0 llamadas a `damageHero` (sin fuego amigo) |
| Adaptadores | Aelith (segundos hurtados + −0,5 s a las otras), Brasa (presión), Morwen (residuos 5/5), Zahra (calor ≤ 85), Tibor (colonia), Nano GM (Equilibrio 3, sin Forma del Regente) |
| Mago nuevo | `CLASSES.mago_nuevo_prueba` sin adaptador arranca, usa la Resonancia y los 12 poderes miden efecto; la Resonancia gasta 4 cargas en una onda y se apaga sola; un adaptador que lanza una excepción no rompe a otro mago |
| Topes y limpieza | onda ≤ 8 blancos; el Coro hace exactamente 2 disparos por ciclo y su cola nunca pasa de 2; morir vacía colas y efectos; quitar el equipo apaga runas y Fase; una partida nueva no deja marcas ni estado; `_mp`/`_mpMark` en `NET_SKIP_KEYS` |
| Partida larga | 60 s con 14 enemigos y 6 piezas del kit: sin excepciones, mismos enemigos al final, cola ≤ 2 |

**Balance** (escenario sintético: 40 s contra maniquíes quietos, rotación fija con la energía real del guardián, 2 semillas; `horda` = 12 juntos, `jefe` = 1). `poderes` es el kit completo CON sus poderes contra las MISMAS piezas SIN poderes (lo que aportan los poderes); `total` es contra no llevar nada (kit ofensivo / kit defensivo):

| Mago | Escenario | Poderes (kit ofensivo) | Poderes (kit defensivo) | Total vs sin equipo | Control: 6 míticos/legendarios que ya existían |
|---|---|---|---|---|---|
| Thalen (respaldo) | horda | +31 % | +20 % | +42 % / +29 % | +362 % |
| Thalen | jefe | +11 % | — | +27 % | — |
| Aelith (adaptador) | horda | **+33 %** (peor caso) | +17 % | +58 % / +39 % | +185 % |
| Aelith | jefe | +13 % | — | +17 % | — |
| Vhal (respaldo) | horda | +29 % | +7 % | +70 % / +42 % | +147 % |
| Vhal | jefe | +12 % | — | +34 % | — |

El límite pedido (~+35 % de DPS efectivo) se cumple por poco en el peor caso (horda densa de 12, kit ofensivo): **+33 %**; contra un jefe, +11 a +13 %. Las propiedades de las piezas (daño de habilidad, enfriamiento, vida…) son del orden de las demás piezas diseñadas y quedan lejos del equipo existente (el control rinde de +147 % a +362 %). Se afinaron los números de las ondas (Resonancia de 100 % a 40 %, Tercer Sello de 80 % a 30 %, Coro y Voz de 60/50 % a 20 %, Fase de 60 % a 15 %) y el Archivo (de +15 % a +10 %) hasta entrar en el límite. El balance NO se midió con `tools/playtest/campaign.js` (partidas completas): queda pendiente.

### Compuertas del repositorio

| Compuerta | Resultado |
|---|---|
| `node tools/bible/ability-gate.js --strict` | PASS: 43 campeones, 0 nuevos que no pasan, 0 errores de página (el kit no agrega habilidades) |
| `node tools/balance/check-entry-reference.js` | PASS |
| `node tools/balance/entry-gate.js` | PASS (`registered:43`, 75 simulaciones; sin cambios: no se agregó ningún campeón ni se tocó `knownChampions`) |
| `node tools/art/check-pixel-icons.js` | OK: 97 íconos 16×16 (≤ 6 colores) |
| `node tools/art/emoji-lint.js --strict` | sin violaciones |
| `node tools/ux/test-text-overflow.js` | PASS: ninguna pantalla con texto fuera de su marco |
| `t_build_uniques`, `t_ground_loot`, `t_coherencia_tablas`, `t_codex_book_logic`, `t_reactions`, `t_roles`, `tools/collection/t_shop_rotation.js` | OK |

Los archivos generados (`docs/bible/generated/ability-gate.json`, `docs/balance/entry-gate-results.json`) se restauraron con `git checkout --` y no se commitean.

### Fallas que YA existían en `origin/main` (idénticas con y sin el kit)

Se corrió el mismo conjunto contra un export de `origin/main` (en otro puerto; sus únicos extras son errores de carga de imágenes por ese árbol parcial). Mismas fallas, ninguna del kit:

- `t_items.js`: `TEST.reinicio_unico_de_la_etapa_de_prueba` y `TEST.respaldo_del_guardado_anterior` (laboratorio de pruebas).
- `t_synergies.js`: 9 fallas (tooltips de sinergia "ahora +0 %", reinicio del árbol de talentos, `COOP.sinergia_del_invitado_es_suya`).
- `t_codex.js`: `MENU.hub_accesos` (el menú tiene "DESAFÍOS").
- `t_sets.js`: `SKIN.color_en_los_eventos_de_red`.
- `t_resonance.js`: `TypeError … null (reading 'click')`.
- `t_itemization.js`: `ICON.identidad_visual_distinta`: 266 URLs distintas de 281 piezas (94,7 %) contra un piso de 95 %. Sin el kit son 254 de 269 (94,4 %): el kit **mejora** el cociente porque sus 12 íconos son propios. (Este test no corrió en el export de `origin/main` por un timeout de carga; el cociente sin el kit se calculó sobre el mismo árbol excluyendo las piezas del kit.)

## 10. Limitaciones y fuera de alcance

- 10 de los 16 magos usan la Resonancia de respaldo: el kit mueve *su medidor* y la onda, no la mecánica propia de su pasiva (anclas, masa, marcas…). Candidatos a adaptador propio cuando alguien defina un número seguro para moverlos.
- Tibor arranca con la colonia al 100 %: sus poderes de llenado solo se notan después de gastar nubes (la Memoria de Hechizo, el Velo y el Ciclo sí actúan).
- Los bots y aliados no equipan el kit.
- No se regeneró `LA_HORDA_ITEM_ASSET_MANIFEST.md` (el generador clasifica por `named`/`mythic` y mezclaría el kit con los legendarios con nombre; hay que ajustarlo antes de regenerar).
- Sin sesión de red real, sin prueba de performance en dispositivo y sin revisión de arte/audio (`STRUCTURAL_PASS` no los sustituye). Sin sonido propio por poder.
- El balance se midió con un escenario sintético (maniquíes quietos), no con `tools/playtest/campaign.js` completo.
