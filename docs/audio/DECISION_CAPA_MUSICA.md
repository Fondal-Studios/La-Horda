# Capa de música de archivo — decisión provisional (2026-11-07)

Al llevar `integration/beta-20261101` a `main` había **dos capas de música de archivo**:
- `js/audio/sample-bank.js` (ya en `main`, conectada en `js/audio/audio.js`): música lo-fi de archivo.
- `js/audio/music-tracks.js` (de la integración): solo pistas aprobadas, ingesta CC0 con puerta de licencia.

Las dos a la vez sonarían superpuestas, así que **se conservó la de `main`** y no se trajo `music-tracks.js` ni su prueba.
Se conservaron los datos y herramientas de licencia: `docs/audio/library-catalog.json` (90 pistas CC0 con evidencia), `docs/audio/library-analysis.json`, `docs/audio/assignment-proposals.v1.json`, `assets/audio/music/assignments.v1.json`, `legal/MUSIC_CREDITS.md`, `tools/music/*`.

**Es una decisión provisional del implementador, no del dueño.** Para cambiarla: recuperar `js/audio/music-tracks.js` y `tools/audio/test-music-tracks.js` de `integration/beta-20261101`, cargar el script en `index.html` y decidir qué hace `SampleBank` (apagarlo o convivir).
