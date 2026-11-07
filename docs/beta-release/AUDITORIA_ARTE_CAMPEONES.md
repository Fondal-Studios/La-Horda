# Auditoría de arte de campeones (46) — juego real vs Códice

Fecha 2026-11-07, rama main. Solo lectura (no se tocó código ni assets). Capturas en `docs/beta-release/audit-art/`:
`hoja_1.png` … `hoja_6.png` (8 guardianes por hoja; por fila: FRENTE+LADO de la hoja del Códice a la izquierda y, a x3, cuadros reales del juego: idle, caminar, ataque, muerte) e `ilkan_myla_atlases.png` (Coloso, berrinche de Myla, skins Legión y Merienda Mágica).

## Método
- Servidor local, Playwright, `?lazy=0&dev=1`, `assetsAllReady()`. Cada guardián se dibujó con `drawHeroBody` / `drawFallenHero` (camino real de partida, incluida la normalización de escala) con `_codexSkin:''` (apariencia base). Se registró qué imagen dibuja realmente cada guardián (hook de `drawImage`) y se midió el atlas: cuadros, bordes recortados, semitransparencia, colores, contorno oscuro.
- Animación: se contó cuántos cuadros distintos produce cada estado (idle/caminar/ataque/muerte).
- Hoja del Códice: `assets/ui/codex/champions/<id>.png` (existen 43; faltan **ilsa, vorn, kora**).
- Puntaje 0-100 = fidelidad al Códice (silueta, paleta, rasgos, equipo) + calidad pixel + escala/animación, juzgado a ojo sobre las hojas y apoyado en las métricas.

## Hallazgos globales
1. **Ningún atlas está recortado** (0 cuadros que toquen el borde) y casi no hay semitransparencia (0 salvo segador 0,2 %). Contorno 1 px presente en todos.
2. **Paleta limitada: solo 8 de 46** (tanque, guerrero, aelith, morveth, libertador-motion, myla, aurelia, ynara, saelis; 64-182 colores). El resto son atlas de color casi continuo (10 k-180 k colores) — es el estilo del generador, no «paleta de pixel art». Decisión de arte, no bug.
3. **`CODEX_GAMEPLAY_ART` solo cubre 4 guardianes** (guerrero, tanque, aelith, morveth). Los demás cargan su atlas por `champPackLoadAtlas` (`js/assets/champion-sprites.js`, `portadores-meta.js`, `*-meta.js`): hay arte nuevo instalado (codex-v1: tanque, guerrero, mago, axiom, musashi, cazadora, nigromante, ilkan, veyra, morveth, aelith, nano_gm) y arte de otra generación (v2/v3 o atlas.png en raíz).
4. No hay atlas «nuevo instalado pero no referenciado»: los `codex-v1` de todos los guardianes están referenciados; los atlas huérfanos (ilkan/v2/atlas.png, axiom/v2, cazadora/v2, musashi/v2, nigromante/v2, soporte/v2, nano_gm/atlas.png, veyra/atlas.png, tanque/atlas.png, profeta/atlas.png) son versiones viejas que ya no se dibujan. Los `.webp` de las rutas del juego coinciden píxel a píxel con sus PNG (309 comprobados): no hay WebP viejo.
5. Animación: caminar 3-4 cuadros distintos en todos (facu_gm, nano_gm, vhal, bront, oriel: procedural). **Idle = 1 cuadro en 45/46** (solo respira por escala/animfx). Ataque: 4 cuadros distintos en la mayoría; **Myla y Ilkan solo 2**, brasa/eslabon/morwen/farolero/iria/baltra/bront 3. Muerte con cuerpo propio en todos; mago 1 pose.
6. Escala: cuerpo de 59-70 px en casi todos tras la normalización; **facu_gm 80 px** (halo horneado), baltra/vhal/vorn 68-70.

## Quién tiene arte viejo
- **Claro (6):** soporte (v3, contorno grueso), segador (v2), profeta (v2 parcheado), libertador (v2 + motion + death mezclados), facu_gm (halo horneado), Coloso de Ilkan (procedural v2). Más 3 skins/formas viejas: Legión de Ilkan, Merienda Mágica de Myla, berrinche de Myla.
- **Redibujo flojo (5):** myla, saelis, aurelia, ynara (muerte), mago (ataque).
- **Sin referencia de Códice (3):** ilsa, vorn, kora.
- Los 12 con `codex-v1`/4 cuerpos Códice, y ~20 más, son fieles.

## Por qué el dueño no ve Ilkan y Myla actualizados (causas verificadas)
**Ilkan**
1. El humano base YA está actualizado (`ilkan/codex-v1/atlas.png`, #258, 1 nov; registrado en `champion-sprites.js:434`; en la captura coincide con el Códice). Es una ruta NUEVA, así que no hay caché vieja.
2. Pero cuando el jugador tiene el set completo/skin equipada, `drawSetSkin` (`js/systems/set-effects.js`, `activeSetSkinId`) corre ANTES que el atlas base y dibuja `skins/legion/atlas.png` (procedural, tools/art/ilkan/build.py, 1 nov, sin repintar). Es un sprite violeta diminuto muy distinto del Códice. Mismo para el Coloso: `ilkan_colossus` = `v2/colossus.png`, procedural, aunque el pase del 6 nov solo mejoró la transformación (`tf`).
3. `ilkan/v2/colossus.png` se sobrescribió en la MISMA ruta el 6 nov.
**Myla**
1. `myla/atlas.png` y `myla/v2/death.png` se sobrescribieron en la MISMA ruta (añadidos 1 nov, reinstalados 6 nov, commits 5d16fdb7 / 9e0b2085). Los archivos de `assets/` no llevan hash en el nombre: nginx (`deploy/nginx/la-horda-locations.inc`) los sirve con `Cache-Control: public, max-age=86400` (Apache 86400 igual) y el service worker solo valida por hash si se publicó estampado con `tools/perf/stamp-sw.js`. Resultado: quien ya abrió el juego sigue viendo la Myla anterior hasta 24 h o un recargado forzado, mientras el JS (5 min) ya apunta al nuevo cuadro.
   - Lo mismo afecta a aurelia, ilsa, libertador v2, maura, saelis, ynara, profeta v2 y ilkan colossus (todos reescritos in situ el 6 nov).
2. Con el set Merienda Mágica completo se dibuja `skins/merienda_magica/atlas.png` (chef azul, 1 nov, no actualizada), y con «Berrinche» (talento tantrum) `myla/berrinche.png` (1 nov) a escala x1.35 con el estilo anterior (bebé en pañal). El cambio del 6 nov afectó solo a la base y a la croma arándanos.
3. La base nueva es solo parcialmente fiel (12 cuadros, cuchara de palo fino, ataque de 2 cuadros), por lo que «no se nota» el cambio.

## Tabla de PEOR a MEJOR
| # | Guardián | Puntaje | Problema concreto | Causa probable (archivo) | Acción sugerida |
|---|---|---|---|---|---|
| 1 | facu_gm | 56 | Sprite 80 px de alto (resto 59-70): lleva baked una capa/halo translúcido azul y arcos que no están en el Códice; idle con 1 cuadro, caminar procedural (30 variantes). Pierde la silueta limpia | facu_gm/atlas.png (1 nov, nunca repintado) | Repintar con tools/art/painter desde la hoja del Códice, sin el halo horneado (moverlo a VFX) |
| 2 | myla | 58 | Base reinstalada (atlas.png 6 nov, 12 cuadros) pero fiel solo a medias: cuchara = palo fino sin gota, idle=1 cuadro, caminar 3 poses, ataque 2 cuadros distintos. Skins y berrinche siguen viejas (ver causa) | myla/atlas.png; myla/berrinche.png y skins/merienda_magica/atlas.png (1 nov) | Repintar cuchara; rehacer berrinche y Merienda Mágica desde la base nueva; más cuadros de ataque |
| 3 | libertador | 60 | Tres packs mezclados (v2/atlas, v3/motion 48 colores, v2/death 47 colores): estilos distintos entre idle/caminar y ataque; ataque encoge el sprite; la muerte es un cuerpo rotado ilegible | libertador/v2/atlas.png + v3/motion.png + v2/death.png (parches del 6 nov) | Atlas único Runway/painter 112x112 con idle/walk/attack/death del mismo pase |
| 4 | soporte | 62 | Contorno negro grueso de 2 px y capucha verde/blanca tipo chibi: es el estilo VIEJO; el Códice es dorado/crema con halo. Ataque = misma pose que caminar | soporte/v3/atlas.png (1 nov); el Códice no se instaló | Reinstalar cuerpo Códice (codex-v1) como en Tanque/Guerrero o repintar |
| 5 | ilkan | 62 | Humano OK (codex-v1, 62 cuadros). Pero el Coloso es la columna de arena procedural v2 (no se parece al Códice) y la skin Legión es un atlas procedural diminuto violeta de 128x111; el ataque cambia la cara (máscara dorada) | ilkan/v2/colossus.png, ilkan/skins/legion/{atlas,colossus}.png (procedural tools/art/ilkan/build.py) | Repintar Coloso (hoja de diseño) y rehacer skin Legión desde codex-v1; revisar cuadros attack_side |
| 6 | segador | 64 | Estilo más realista/oscuro que el Códice (calavera, hoz); idle y caminar con distinta escala; 0,2 % de píxeles semitransparentes; la muerte es una explosión de partículas, no un cuerpo | segador/v2/atlas.webp (oct) | Repintar desde la hoja del Códice con painter; fijar muerte propia |
| 7 | saelis | 64 | Sprite pequeño y ralo (108 colores, mucho detalle perdido: alas/halo); muerte = 12 puntos dispersos semitransparentes | saelis/atlas.png (reinstalado 6 nov, de #259) | Regenerar con Runway a 112 px y re-pintar muerte |
| 8 | profeta | 66 | Idle con cara tapada y borroso (se pierde capucha dorada); ataque con arco azul enorme fuera de escala | profeta/v2/atlas.png (parche 6 nov) | Reinstalar atlas Códice o repintar idle/attack |
| 9 | aurelia | 66 | Sprite chico y con pocos píxeles (64 colores, contorno claro 58 %); detalle dorado del Códice se pierde; muerte casi invisible | aurelia/atlas.png (6 nov) | Regenerar con Runway / repintar con painter |
| 10 | kora | 70 | Sin hoja de Códice (no hay referencia). Artefacto: franja naranja translúcida en el brazo durante el ataque | kora/atlas.png (12 oct) | Crear hoja de Códice y arreglar cuadros de ataque |
| 11 | ynara | 70 | Fiel al Códice pero la muerte es un bloque semitransparente deformado (3 cuadros solapados); 182 colores | ynara/atlas.png (6 nov), death_* [24,25,26] | Repintar muerte; el resto aceptable |
| 12 | mago | 74 | Idle bien (codex-v1), pero el cuadro de ataque cambia de estilo/escala (más chico, magenta) y la muerte tiene 1 sola pose | mago/codex-v1/atlas.png y respaldo mago.png | Rehacer attack_* con la misma escala |
| 13 | ilsa | 76 | Sin hoja de Códice; idle con pelo ruidoso (ruido de píxeles sueltos) | ilsa/atlas.png (6 nov) | Hoja de Códice + limpieza de idle |
| 14 | vorn | 76 | Sin hoja de Códice; casco y ropa algo planos; ataque con el torso cambiado | vorn/atlas.png (14 oct) | Hoja de Códice y pase de repintado |
| 15 | vhal | 80 | Buen diseño; tamaño 70 px (algo alto); idle con capa difusa | vhal/atlas.png | Opcional: ajustar escala |
| 16 | khepri | 82 | Fiel pero idle simplificado respecto de la hoja (pierde garras doradas) | khepri/atlas.png | — |
| 17 | bront | 82 | Fiel; ataque cambia mucho la forma (campana) | bront/atlas.png | — |
| 18 | velmira | 84 | Fiel; máscaras pierden definición | velmira/atlas.png | — |
| 19 | oriel | 84 | Fiel; atlas con 19 k colores | oriel/atlas.png | — |
| 20 | maura | 84 | Fiel; idle más pequeño (59 px) | maura/atlas.png | — |
| 21 | solciju | 84 | Fiel; muerte un poco borrosa | solciju/atlas.png | — |
| 22 | renko | 85 | Fiel; sprite alto de 65 px | renko/atlas.png | — |
| 23 | sira | 85 | Fiel; sprite alto 67 px | sira/atlas.png | — |
| 24 | tibor | 86 | Fiel | tibor/atlas.png | — |
| 25 | zahra | 86 | Fiel | zahra/atlas.png | — |
| 26 | orsa | 86 | Fiel | orsa/atlas.png | — |
| 27 | dariel | 86 | Fiel | dariel/atlas.png | — |
| 28 | baltra | 86 | Fiel; escala 68 px | baltra/atlas.png | — |
| 29 | nahir | 86 | Fiel | nahir/atlas.png | — |
| 30 | vesper | 86 | Fiel | vesper/atlas.png | — |
| 31 | iria | 86 | Fiel | iria/atlas.webp | — |
| 32 | farolero | 86 | Fiel; ataque cambia de arma | farolero/atlas.webp | — |
| 33 | morwen | 88 | Fiel | morwen/atlas.webp | — |
| 34 | eslabon | 88 | Fiel | eslabon/atlas.webp | — |
| 35 | brasa | 88 | Fiel | brasa/atlas.webp | — |
| 36 | nano_gm | 88 | Fiel; atlas 112 cuadros | nano_gm/codex-v2/atlas.png | — |
| 37 | brakk | 88 | Fiel | brakk/atlas.png | — |
| 38 | axiom | 88 | Fiel; muerte plana | axiom/codex-v1/atlas.png | — |
| 39 | aelith | 90 | Fiel, 127 colores | aelith/codex-v1/atlas.png | — |
| 40 | morveth | 90 | Fiel, 127 colores | morveth/codex-v1/atlas.png | — |
| 41 | veyra | 90 | Fiel | veyra/codex-v1/atlas.png | — |
| 42 | musashi | 90 | Fiel | musashi/codex-v1/atlas.png | — |
| 43 | cazadora | 90 | Fiel | cazadora/codex-v1/atlas.png | — |
| 44 | nigromante | 90 | Fiel | nigromante/codex-v1/atlas.png | — |
| 45 | tanque | 92 | Fiel, 127 colores, outline 1 px | tanque/codex-v1/atlas.png | — |
| 46 | guerrero | 92 | Fiel, 127 colores | guerrero/codex-v1/atlas.png | — |

## Top-15 prioridad para la beta
1. **myla** (base + berrinche + Merienda Mágica; además caché de ruta fija).
2. **ilkan** (Coloso procedural, skin Legión, ataque).
3. **soporte** (reinstalar cuerpo Códice).
4. **libertador** (unificar atlas, muerte).
5. **facu_gm** (quitar halo horneado, escala).
6. **segador** (repintar).
7. **profeta** (idle/attack).
8. **saelis** (sprite chico, muerte).
9. **aurelia** (detalle).
10. **kora** (artefacto en ataque + sin hoja Códice).
11. **ynara** (muerte).
12. **mago** (ataque).
13. **ilsa** y 14. **vorn** (hoja de Códice y repintado).
15. **Infra:** versionar rutas de arte (p. ej. `atlas.v2.png` o `?v=hash`) y estampar el service worker, para que no se vean atlas viejos tras actualizar; idle de 1 cuadro en 45/46 como mejora general.
