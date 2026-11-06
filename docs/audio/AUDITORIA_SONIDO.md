# Auditoría de sonido — 2026-11-06

Alcance: música de menús y de partida (lo-fi retro con licencia libre), efectos de habilidades e impactos, voces de
campeón y la auditoría completa del audio existente. Todo se midió con herramientas del repositorio (no hay parlantes en
el entorno de pruebas: lo **no** medible se lista aparte como pendiente de oído humano).

Reproducir: `node tools/audio/audit-sound.js --json docs/audio/audit-results.json` (auditoría de este documento),
`node tools/audio/t_sample_bank.js` (prueba funcional de la capa de muestras), `node tools/audio/t_audio_mix.js`
(regresión del motor sintético, ya existía). Regenerar los archivos de audio: `python3 tools/audio/build-assets.py`.

## 1. Qué se agregó

| Pieza | Detalle |
|---|---|
| Música | 6 temas **CC0** de OpenGameArt en `assets/audio/music/`: título (8 Bit Lofi, ~87 BPM), Sala/menús (Rhodes), 3 de oleada (~120-135 BPM, rotan por arena y cada 3 niveles) y 1 de jefe (chiptune glitch D'n'B). Créditos y enlaces: `assets/audio/CREDITS.md`. |
| Efectos | 73 muestras CC0 (golpes de carne/roca/metal/madera/vidrio, espadas, impactos pesados, fuego, magia, limo, rugidos y monstruos). Se **suman** como capa al golpe sintético existente (`playSfx` → `SampleBank.layer`), por material del enemigo y arma del héroe. |
| Habilidades | `castAbility` llama a `SampleBank.abilityAudio` para **cualquier** héroe (antes solo el jugador local tenía un "cast" genérico). 11 familias de sonido según elemento / tipo / texto de la habilidad (fuego, hielo, rayo, apoyo, tajo, impacto, oscuro, tiro, movimiento, construcción, magia). |
| Voces | 77 clips CC0 (1 voz masculina + 3 femeninas). Cada campeón usa una con su tono (`VOICES`); los 24 campeones nuevos derivan voz y tono de su título ("la/el"). Gritos de habilidad (voces femeninas dicen el elemento: *fire*, *ice*, *heal*, *curse*…), ultimate, daño, muerte, victoria. |
| Ajustes | Opciones → **Estilo**: *Lo-fi retro* (por defecto) / *Original* (la música sintetizada de `music-score.js`, intacta). Se recuerda en el navegador. |
| Red de seguridad | Si un archivo no carga o el formato no se soporta, sigue sonando la música sintetizada: nunca queda en silencio por esto. Victoria y derrota siguen siendo los golpes sintetizados. |

## 2. Resultados medidos

| Medida | Resultado |
|---|---|
| Sonoridad de los 6 temas | -18,4 a -18,5 LUFS (dispersión 0,1 LU) |
| Pico real (true peak) de los temas | -2,1 a -7,4 dBTP (ninguno recorta) |
| Bucles | sin clic: error en la costura ≤ 0,02 (≤ al p99 local); 1 s de relleno a cada lado para evitar los artefactos de los extremos del MP3 |
| Ritmo (ataques/s) | menús 3,9 y 5,0 · partida 8,7 / 12,3 / 7,7 / jefe 6,6 → toda la partida es más movida que cualquier menú |
| BPM estimado | título 87, Sala 98, oleadas 133 / 124 / 61*, jefe 90* (*la estimación automática confunde mitad/doble tiempo; el ritmo se juzga por ataques/s) |
| Mezcla en vivo (AudioContext real) | música sola -20 dBFS RMS · combate +7 dB sobre la música (-12,6) · pico final -1,3 dBFS (el techo sigue en -1) · voz con pico -4,7 |
| Peso en disco | música 5,3 MB (se baja solo la que se usa) · efectos 0,33 MB · voces 0,31 MB |
| Memoria decodificada | 69 MB en el peor caso medido (2 temas + efectos + 1 banco de voz) |
| Cobertura de sonidos | 221 nombres `playSfx("…")` en el código, todos definidos tras la corrección; 241 sonidos de arena con `play()` válido |
| Voces simultáneas | 8 campeones gritando ultimates a la vez → hablan 2 como máximo |
| Costo por cuadro | sin cambio medible (regresión `t_audio_mix.js`: 0,24 ms promedio por cuadro con 4 efectos/cuadro) |

## 3. Hallazgos y correcciones

### Críticos (corregidos)
1. **`playSfx("pickup")` no existía** — llamado desde `lanes-core.js` y `arena-objectives.js` (comprar/recoger objetivos): sonaba **mudo**. Se definió en `js/audio/audio.js` (`SFX_CFG.pickup` + sonido). La auditoría ahora falla si algún `playSfx("literal")` no tiene definición.
2. **Bucle de la música con salto audible** (error propio de la primera versión, detectado por la auditoría): `loudnorm` dinámico cambiaba el nivel entre el final y el comienzo, y el fundido cruzado de `ffmpeg` no producía el tramo. Se rehízo el armado en numpy (ganancia constante, fundido de potencia constante, relleno de 1 s) y el bucle usa `loopStart`/`loopEnd`.
3. **Efectos y voces con pico > -1 dBFS** tras codificar a MP3 (3 archivos): el build ahora verifica el pico del archivo **final** (≤ -1,5 dBFS) y baja la ganancia hasta cumplirlo.
4. **Estado viejo de un contexto de audio** podía dejar el sintético mudo si se recreaba el contexto (`holds()` ahora exige que el contexto sea el vigente).

### Importantes (corregidos)
5. **Latencia percibida en golpes**: varios impactos traían hasta 327 ms de subida casi inaudible antes del golpe. El build recorta desde -32 dB (deja 4 ms): ningún efecto tiene > 40 ms de silencio inicial.
6. **Memoria**: un tema decodificado pesa ~30 MB; sin tope, recorrer menú → 3 oleadas → jefe llegaba a ~190 MB. Ahora quedan como máximo 2 temas decodificados, y las voces se bajan **por banco** solo cuando un héroe de la partida las usa.
7. **Habilidades de 24 campeones nuevos** traen `kind:"expedition"/"ascension"` sin elemento: caían todas en "magia". Se leen nombre y descripción; la familia genérica bajó de 139/172 a 54/172 habilidades.
8. **El arnés `t_audio_mix.js`** mide la partitura sintetizada y ahora fija `horda_music_style=synth` (sin eso medía el silencio del sintético mientras suena el lo-fi). Estado: 0 fallas.
9. Un campeón nuevo sin entrada en `VOICES` ya no queda mudo ni con voz al azar: voz y tono estables derivados de su clave y título.

### Opcionales (no se hicieron; quedan priorizados)
| # | Ítem | Por qué no ahora |
|---|---|---|
| O1 | **Voces propias por campeón** (actuación de voz encargada) | Hay 4 voces base reutilizadas con tono distinto: sirve como identidad sonora, **no** equivale a un doblaje único. Ya están los puntos de enganche (`VOICES`, eventos `skill/ult/hurt/death/victory`). |
| O2 | Deslizador de **Voces** aparte (hoy van por Efectos) | Requiere un nodo de ganancia y su fila en Opciones y en Pausa. |
| O3 | **Música adaptativa** en el lo-fi (las capas por intensidad y las fases del jefe existen solo en el sintético) | Los temas son estéreo ya mezclado; se podría filtrar/subir volumen por intensidad con un paso-bajo. Conviene probarlo de oído. |
| O4 | Voz de héroes **ajenos** en muerte (cooperativo/bots) y voz del **jefe** | Hoy hablan al lanzar habilidades; la muerte ajena no. |
| O5 | Estandarizar la sonoridad **entre los 241 sonidos de arena sintéticos** (cada arena los mezcla a su criterio) | Fuera del alcance: medir y normalizar toca balance por arena. |
| O6 | Pausar el contexto con la pestaña oculta (ahorro de batería) | Hoy sigue sonando en segundo plano, como antes. |

### Pendiente de oído humano (no se puede medir sin parlantes)
- Que los 3 temas de oleada y el de jefe **se sientan** a la altura de cada arena (la rotación es por arena, no por ambientación).
- Que las voces femeninas dichas en inglés (*fire!*, *ice!*) convivan con un juego en español (se pueden quitar: `FEM_CALL` en `sample-bank.js`).
- Balance subjetivo música/efectos en parlante de celular y auriculares; deslizadores de Opciones siguen disponibles.
- Tono de las voces graves (`axiom`, `segador`, `ilkan` a 0,66-0,76× pueden sonar a "cámara lenta").

## 4. Licencias

Todas las fuentes son **CC0** (verificado en la ficha de cada página el 2026-11-06). Se descartaron a propósito las pistas CC-BY de la misma búsqueda para no obligar a mostrar atribuciones. `legal/` no requiere cambios por este audio; los créditos voluntarios están en `assets/audio/CREDITS.md`. Si se agrega un tema nuevo: confirmar CC0 en su ficha, sumarlo a `build-assets.py` y volver a correr ambas auditorías.
