# Audio — créditos y licencias

Todo el audio de archivo de este directorio proviene de [OpenGameArt.org](https://opengameart.org) y está publicado
bajo **CC0 1.0 (dominio público)**: se puede usar, modificar y distribuir en un juego comercial sin atribución.
Se agradece igual a sus autores. La licencia de cada página se verificó el 2026-11-06 en su ficha ("License(s): CC0").
Se descartaron a propósito las pistas de la misma búsqueda con CC-BY (Ice Cave, Iced Village, The Past) para no
obligar a mostrar atribuciones.

Los archivos se **regeneran** con `python3 tools/audio/build-assets.py` (descarga, recorta, normaliza y codifica a MP3);
el detalle por archivo (origen y duración) está en `manifest.json`. El motor y su auditoría: `js/audio/sample-bank.js`,
`tools/audio/t_sample_bank.js`, `docs/audio/AUDITORIA_SONIDO.md`.

## Música (lo-fi retro)
| Uso | Tema | Origen |
|---|---|---|
| Título, pantalla previa | 8 Bit Lofi (~87 BPM) | https://opengameart.org/content/8-bit-lofi |
| Menús / Sala | happy lofi day (Rhodes) | https://opengameart.org/content/happy-lofi-day |
| Oleadas (alterna por arena y cada 3 niveles) | Fast Cheerful punk rock lo-fi (~134 BPM) | https://opengameart.org/content/fast-cheerful-punk-rock-lo-fi |
| | Lofi again (~125 BPM) | https://opengameart.org/content/lofi-again |
| | lofi hip hop (~120 BPM) | https://opengameart.org/content/lofi-hip-hop |
| Jefes | Lo-fi chiptune glitch D'n'B | https://opengameart.org/content/lo-fi-chiptune-glitch-dnb |

Cada tema se recortó (≤ 96 s), se cerró el bucle con un fundido cruzado de 2 s y se normalizó a ≈ -18 LUFS.

## Efectos
| Conjunto | Origen |
|---|---|
| Golpes de carne, roca, metal, madera, vidrio (hielo) | https://opengameart.org/content/75-cc0-breaking-falling-hit-sfx |
| Hechizos de fuego/arcanos, tajos, limo, rugidos | https://opengameart.org/content/80-cc0-rpg-sfx |
| Criaturas (rugidos, monstruos, daño) | https://opengameart.org/content/80-cc0-creature-sfx |
| Espadas | https://opengameart.org/content/20-sword-sound-effects-attacks-and-clashes |
| Impactos pesados | https://opengameart.org/content/10-impactshield-blocks |
| Magia | https://opengameart.org/content/magic-spell-sfx |

## Voces de campeón
| Voz | Origen |
|---|---|
| Masculina (RPG Male Adventurer) | https://opengameart.org/content/voice-clip-pack-male-adventurer-rpg |
| Femeninas ×3 (RPG Voice Starter Pack, tipos 1-3) | https://opengameart.org/content/female-rpg-voice-starter-pack |

Son 4 voces base; cada campeón usa una con su propio tono (`VOICES` en `js/audio/sample-bank.js`). No son actuaciones
únicas por personaje (ver la auditoría).
