# Investigación de música gratuita para La Horda

Fecha: 2026-10-26. **Resultado: la biblioteca de archivos quedó VACÍA.** No se incluyó ninguna pista.

## Qué pasó (limitación principal)

El entorno de la sesión sale a internet por un proxy con lista de hosts permitidos. Todos los hosts de
música devolvieron `403 CONNECT tunnel failed` (probados con curl; WebFetch ni resuelve el nombre):

`opengameart.org`, `freepd.com`, `incompetech.com`, `archive.org`, `commons.wikimedia.org`,
`freemusicarchive.org`, `itch.io`, `ccmixter.org`, `musopen.org`, `bandcamp.com`,
`cdn.jsdelivr.net`, `unpkg.com`, `upload.wikimedia.org`.

Solo funcionó `WebSearch` (resultados y resúmenes, no la página de la pista) y GitHub. Como el pedido
exige **verificar la licencia en la página de cada pista** y guardar su texto, URL y fecha, y eso no se
pudo hacer ni se pudo descargar un solo audio, **no se incorporó nada**: incluir música sin licencia
verificada en un repo público de un juego a monetizar es un riesgo legal que no corresponde asumir.
No se usaron métodos para evadir el proxy.

**Para destrabar:** permitir en Network access del entorno (Edit > Allowed domains) al menos
`opengameart.org` (y su CDN de archivos, que se ve al primer intento), `freepd.com`,
`incompetech.com` y `archive.org`; opcional `commons.wikimedia.org`, `upload.wikimedia.org`,
`freemusicarchive.org`, `ccmixter.org`. Alternativa: el dueño baja las pistas elegidas y las
sube; la herramienta de prueba valida el resto.

## Criterios

Legales (todos obligatorios): uso comercial, redistribución dentro del repo/juego, uso en videojuego.
Permitidas: **CC0 / dominio público (PDM)** y **CC BY 3.0/4.0** (atribución exacta). Descartadas siempre:
CC BY-NC, CC BY-ND, CC BY-SA (contagia a derivados; se evita), "gratis pero no redistribuible",
autor poco claro, Content ID. Por pista se guarda: URL de la página, autor, título, licencia con versión,
texto de atribución, fecha de verificación (campos de `assets/audio/music/CATALOGO.json`).

De calidad: loopable o con loop corto limpio; BPM compatible calma/intensa por arena; ogg 96-128 kbps,
normalizadas a un volumen coherente (ffmpeg está instalado en el entorno); biblioteca <= 30 MB y
<= 12 MB por tema.

## Fuentes evaluadas

Todo lo de esta tabla viene de **resultados de búsqueda, NO de la página de la pista**: son candidatos,
no verificados. Nada de esto se debe dar por bueno sin abrir cada página.

| Fuente / autor | Qué se vio (búsqueda) | Estado |
|---|---|---|
| OpenGameArt: SubspaceAudio "12 Indie game music loops", "4 Chiptunes (Adventure)", "5 Chiptunes (Action)" | Resumen: CC0, loops, ogg+wav. Para "5 Chiptunes (Action)" (Juhani Junkala) la búsqueda no mostró el campo de licencia; se atribuye a Junkala | Candidato prioritario (chiptune). Verificar autor y licencia en cada página |
| OpenGameArt: RandomMind "[Chiptune] Medieval: The Bard's Tale" | Resumen: CC0, versión loop wav | Candidato (folk medieval / tienda) |
| OpenGameArt: ImogiaGames "Audio - CC0 - 8Bit - Chiptune" | Colección curada CC0 (lista, no pack) | Candidato; verificar cada ítem |
| OpenGameArt: 3xBlast "Chiptune Interlude Pack" | CC BY 3.0, 5 loops | Candidato (CC BY, exige atribución) |
| ppeak "surpass your limits!" (13 tracks, OpenGameArt/itch.io) | Búsqueda: CC BY 4.0, crédito "PPEAK" | Candidato secundario (CC BY) |
| Eric Skiff "Resistor Anthems" | Anuncio del propio autor (2013): CC BY 3.0, usar comercial con crédito "Music: [pista] by Eric Skiff" | Candidato fuerte para chiptune/lo-fi. No se pudo confirmar que siga vigente en su sitio |
| Kevin MacLeod / incompetech, FreePD | No se llegó a consultar | Sin evaluar (host bloqueado). MacLeod es CC BY 4.0 en general y FreePD es CC0, **de memoria**: verificar |
| Internet Archive / netlabels, Wikimedia Commons, Musopen, FMA, ccMixter, itch.io CC0 | No se llegó a consultar | Sin evaluar (hosts bloqueados) |
| Visager, Tallbeard, Bogart VGM, Brandon Morris | No se consultaron | Sin evaluar; verificar licencia por pista |

### Descartadas

| Fuente | Motivo |
|---|---|
| Technodono "Chiptune inspired music pack" | CC BY-SA 4.0: descartada (SA) |
| Pixabay Music | Su Content License prohíbe distribuir el audio en forma "standalone" (un repo público con el .ogg lo es); además no es CC0 desde 2019. Descartada |
| Agregadores (Chosic y similares) | Solo valen si se verifica la licencia original en la fuente; sin acceso, no se pueden usar |

## Lo que NO se pudo verificar

- Licencia, autoría y estado actual de **cualquier** pista en su página.
- Calidad auditiva, loop, BPM y tonalidad reales (no hay forma de oír ni descargar en este entorno).
- Content ID (se evita con CC0/CC BY de fuentes primarias, pero requiere revisar cada pista).

## Qué se entregó igual (todo funciona con biblioteca vacía)

Reproductor por archivos listo (`js/audio/music-files.js`), mapa vacío (`js/data/music-map.js`),
catálogo vacío con su esquema, `CREDITS.md`, sección Opciones > Créditos > Música, y pruebas
(`tools/audio/t_music_catalog.js`, `t_music_player.js`, `t_music_boot.js`). Mientras no haya pistas,
el juego usa la música procedural de siempre. Ver `docs/audio/MAPA_MUSICAL.md` para el plan.
