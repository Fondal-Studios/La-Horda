# Checklist de TODOS los campeones: qué tiene cada uno y qué le falta

> Generado por `tools/art/champ-checklist.py` desde `manifiestos/campeones_faltantes.json` (auditoría del repo, 2026-10-18; mide el juego real), los atlas registrados en el juego y `estado-campeones.json` (lo probado con Runway). No se edita a mano este .md: se regenera.

**Cómo leerlo.** `Lámina` = existe la lámina del Códice. `Atlas actual` = el atlas del cuerpo que el juego usa hoy (celda y columnas). `Estados que faltan o están repetidos` = se calcula de los `sets` del atlas que el juego usa HOY (un estado repetido es uno que reutiliza los mismos cuadros que otro, p. ej. lanzar = ataque). `Auditoría 18-oct` = lo que decía la auditoría vieja (prioridad entre paréntesis: P0 bloquea jugar bien, P1 se nota, P2 pulido); varias entradas ya se arreglaron. `Skins/formas` = recolores, placeholders o formas pendientes. `Runway` = lo que se probó y su resultado.

**Antes de generar nada de un campeón, leer su fila y su sección de notas.** Resultado medido (muestra: Tanque, 2026-11-12): Runway por imagen suelta o por video NO superó al atlas actual; ver `REGISTRO_RUNWAY.md` («NO REPETIR»).

**Campeones: 46.** Según la auditoría vieja (18-oct) 19 tenían faltantes de cuerpo; **mirá la columna «del atlas ACTUAL»: es la que manda**.

| Campeón | Lámina | Atlas actual | Estados que faltan o están repetidos (del atlas ACTUAL) | Auditoría 18-oct (puede estar vieja) | Skins/formas | Runway |
|---|---|---|---|---|---|---|
| **guerrero** | sí | 144×144, 4 col | layout estándar de 36 (sin sets declarados: no se puede medir acá) | lanzar (P1); muerte (P0); golpe (P1) | skin:falta | no probado |
| **libertador** | sí | 103×98, 8 col | faltan: attack_down, attack_up, ultimate_down, hit_down, death_down | ataque_abajo (P1); ataque_arriba (P1); golpe (P1); muerte (P0) | forma:falta | no probado |
| **myla** | sí | 112×112, 8 col | layout estándar de 36 (sin sets declarados: no se puede medir acá) | lanzar (P1); definitiva (P1); golpe (P1); muerte (P0) | forma:falta | no probado |
| **soporte** | sí | 112×112, 4 col | completo | lanzar (P1); golpe (P1); muerte (P0) | skin:falta | no probado |
| **tanque** | sí | 112×112, 4 col | layout estándar de 36 (sin sets declarados: no se puede medir acá) | lanzar (P1); muerte (P0); golpe (P1) | — | lamina limpia=hecho; clip walk down=aprobado; clip walk side=aprobado; clip walk up=generado; clip attack down=aprobado; clip attack side=aprobado; clip attack up=generado; clip cast=generado; clip ult=rechazado; clip death=generado; cuadros aprobados=rechazado; atlas armado=hecho; gates=rechazado; instalado motor=rechazado; captura antes despues=hecho |
| **ynara** | sí | 96×96, 4 col | completo | lanzar (P1); definitiva (P1); muerte (P0) | — | lamina limpia=hecho; clip cast=hecho; clip ult=hecho; cuadros aprobados=generado; atlas armado=hecho; gates=generado; instalado motor=hecho; captura antes despues=hecho |
| **aurelia** | sí | 112×112, 4 col | completo | — | skin:recolor, skin:recolor | no probado |
| **axiom** | sí | 112×112, 4 col | completo | ataque_abajo (P1); ataque_arriba (P1) | skin:falta | no probado |
| **cazadora** | sí | 192×160, 4 col | faltan: ultimate_down | ataque_abajo (P1); ataque_arriba (P1) | forma:falta | no probado |
| **facu_gm** | sí | 112×112, 4 col | completo | — | skin:recolor, skin:falta | no probado |
| **ilkan** | sí | 192×128, 8 col | faltan: attack_down, attack_up, ultimate_down | ataque_abajo (P1); ataque_arriba (P1) | skin:falta, skin:falta, forma:falta, forma:falta | no probado |
| **khepri** | sí | 112×112, 4 col | completo | — | skin:recolor | no probado |
| **mago** | sí | 112×112, 4 col | completo | caminar_abajo (P1); caminar_arriba (P1); ataque_abajo (P1); ataque_perfil (P1); ataque_arriba (P1) | skin:falta | no probado |
| **musashi** | sí | 192×160, 4 col | faltan: ultimate_down | ataque_abajo (P1); ataque_arriba (P1) | — | no probado |
| **nano_gm** | sí | 192×128, 8 col | completo | — | skin:recolor, skin:falta | no probado |
| **nigromante** | sí | 192×160, 4 col | faltan: ultimate_down | ataque_abajo (P1); ataque_arriba (P1) | forma:revisar, forma:falta | no probado |
| **oriel** | sí | 112×112, 4 col | completo | — | skin:recolor, skin:recolor | no probado |
| **profeta** | sí | 112×112, 4 col | completo | ataque_abajo (P1); ataque_arriba (P1) | — | no probado |
| **saelis** | sí | 112×112, 4 col | completo | — | skin:recolor, skin:recolor | no probado |
| **segador** | sí | 112×112, 4 col | completo | ataque_abajo (P1); ataque_arriba (P1) | — | no probado |
| **velmira** | sí | 112×112, 4 col | completo | — | skin:recolor, skin:recolor | no probado |
| **vesper** | sí | 112×112, 4 col | completo | — | skin:placeholder | no probado |
| **baltra** | sí | 112×112, 4 col | completo | — | — | no probado |
| **brakk** | sí | 112×112, 4 col | completo | — | — | no probado |
| **brasa** | sí | 96×96, 6 col | completo | definitiva (P2) | skin:falta | no probado |
| **bront** | sí | 112×112, 4 col | completo | — | — | no probado |
| **dariel** | sí | 112×112, 4 col | completo | — | — | no probado |
| **eslabon** | sí | 96×96, 6 col | completo | definitiva (P2) | skin:falta | no probado |
| **farolero** | sí | 96×96, 6 col | completo | definitiva (P2) | skin:falta | no probado |
| **iria** | sí | 96×96, 6 col | completo | definitiva (P2) | skin:falta | no probado |
| **morwen** | sí | 96×96, 6 col | completo | definitiva (P2) | skin:falta | no probado |
| **nahir** | sí | 112×112, 4 col | completo | — | — | no probado |
| **renko** | sí | 112×112, 4 col | completo | — | — | no probado |
| **sira** | sí | 112×112, 4 col | completo | — | — | no probado |
| **tibor** | sí | 112×112, 4 col | completo | — | — | no probado |
| **vhal** | sí | 112×112, 4 col | completo | — | — | no probado |
| **zahra** | sí | 112×112, 4 col | completo | — | — | no probado |
| **aelith** | sí | 112×112, 4 col | completo | — | — | no probado |
| **ilsa** | **NO** | 112×112, 4 col | completo | — | — | no probado |
| **kora** | **NO** | 112×112, 4 col | completo | — | — | no probado |
| **maura** | sí | 112×112, 4 col | completo | — | — | no probado |
| **morveth** | sí | 112×112, 4 col | completo | — | — | no probado |
| **orsa** | sí | 112×112, 4 col | completo | — | — | no probado |
| **solciju** | sí | 112×112, 4 col | completo | — | — | no probado |
| **veyra** | sí | 192×144, 8 col | completo | — | — | no probado |
| **vorn** | **NO** | 112×112, 4 col | completo | — | — | no probado |

## Intentos descartados y notas (no repetir)

### tanque — Aldric, el Último Bastión
- ✘ 13 imágenes sueltas (gen4_image) para lanzar/muerte/golpe: ignora la pose o BAD_OUTPUT. NO repetir (ver ART_CREDITS.md)
- ✘ Atlas por video (gen4_turbo 2 s, 9 clips): conserva el diseño pero da menos pose que el atlas dibujado actual; ultimate indistinguible de lanzar. Usar video solo para caminatas, no para ataques/muerte.
- clip walk_down w1: art-source/runway-video/tanque/w1 (task 231bc178…, 25 cr). Diseño estable. wd3 (marcha, rodillas arriba) aprobado a ojo; wd2 y w1 rechazados: cuadros casi iguales ws1: zancada visible, cuadros distintos; menos vida de capa que el atlas actual wu1: cuadros casi idénticos, movimiento débil; sin reintento ad1: levanta y baja la espada, 4 cuadros distintos as1: espada atrás/adelante; menos dramático que el atlas actual au1: ok pero la espada cruza fuera de silueta ca1: levanta espada y escudo; pierde la guardia del atlas actual ul1 y ul2 (reintento con salto): no se distingue de lanzar, sin pico heroico de1: arrodilla y tiende; último cuadro de solo 23 px, menos digno que el actual el conjunto no supera al atlas actual (ver captura) candidato 448x1008 en art-source/runway-video/tanque/candidate/atlas.png style_gate PASS, pero roster_gate con el candidato: scaleFailures 4 (base 0) no instalado: no es claramente mejor art-source/captures/tanque/ | 2026-11-12: con gpt_image_2 el lanzar sale bien (hoja g1, task 7afade28…, 20 cr): candidato aceptado, sin integrar; falta probar muerte/definitiva con este modelo.

### ynara — Ynara, la Médica de los Refugios
- lanzar y definitiva con gpt_image_2 (hojas c1 y u1, 40 cr), instalados en el atlas (filas 10-11, cuadros 36-43). roster_gate 0 fallos; style_gate no aplica (celda 96); revisión de arte humana pendiente. gates=generado: solo pasó roster_gate (style_gate no aplica a celdas de 96); cuadros_aprobados=generado: sin revisión de arte humana.

