# Auditoría 2 — por qué no hay más jugadores, y qué se hizo (octubre 2026)

Estado de las afirmaciones: **MEDIDO** (lo medí yo, con el comando indicado) · **LEÍDO** (leído en el código) · **PROPUESTO** (hipótesis sin datos de jugadores reales).

## 0. Lo que NO pude hacer (para que no se lea de más)
- **No tengo acceso a las estadísticas reales.** El panel del estudio (`fondalstudios.com`, medidor `/medir.js` y `/api/presencia`) vive en producción y este entorno no llega a ese dominio. El repositorio no guarda datos de jugadores (`server/data/saves` está vacío). Todo lo que sigue sale de mediciones locales del juego y de lectura de código, no del comportamiento de jugadores reales.
- **No pude publicar** en Fondal (mismo bloqueo de red) ni crear cuentas de redes. Dejé todo listo para publicar (ver §5).
- Los "jugadores" de las pruebas de usabilidad fueron personas simuladas por modelo (documentado en la Auditoría 1).

## 1. El cuello de botella más probable: la primera carga (MEDIDO)
`node tools/audit/loadtime.js` (red simulada de 12 Mbit/s y 60 ms, celular horizontal emulado):

| | Antes | Ahora |
|---|---|---|
| Bytes hasta poder tocar «Tocá para continuar» | 17,1 MB | **6,6 MB** |
| Tiempo hasta poder tocar | 14,5 s | **6,3 s** |
| Tiempo desde tocar hasta estar jugando | 12,8 s | **5,4 s** (y con TODO lo necesario cargado; antes terminaba con arte pendiente) |
| Segunda visita (caché) | 8,1 s | **0,4 s** |

Causa: la portada bajaba el atlas de los 38 guardianes (16,6 MB) aunque solo se ve uno, y la partida esperaba el arte de las 11 arenas (33 MB) para jugar una. Ahora hay carga por demanda: `ch:<guardián>` (solo los de tu partida), `ar:<arena>` (solo la arena elegida) y `common`; el resto baja de a poco en segundo plano (`js/assets/preload.js`, `lazy-images.js`).
**Lo que falta (PROPUESTO):** el JavaScript pesa 5,1 MB sin comprimir. Si el servidor de Fondal no sirve **gzip/brotli**, se baja entero: con compresión serían ~1,2 MB y la portada tocable en ~2–3 s en 4G. Es una configuración del servidor (no del repo). A 1 Mbit/s (3G) la portada sigue tardando ~50 s sin compresión: ahí está el mayor margen que queda.

## 2. Qué mirar en el panel de Fondal (para confirmar o descartar)
El medidor ya reporta: juego abierto → «listo» (primera carga terminada, ya se puede tocar) → empieza partida → termina. Con eso:
1. **Abierto → listo.** Si menos del ~70 % llega a «listo», el cuello de botella era la carga (lo que acabo de arreglar). Compará antes/después de publicar.
2. **Listo → empieza partida (entrenamiento incluido).** Si cae mucho, el problema es la entrada (elegir guardián, entrenamiento).
3. **Partida → termina (completada | salida).** Muchas «salidas» en el nivel 1–3 = onboarding/dificultad.
4. **Sesiones por visitante** (si el panel lo da): sin vuelta al día siguiente, falta retención.
Con un **export** (CSV/captura) o un token de lectura del panel puedo hacer el análisis de verdad; sin eso, §1 y §3 son lo más sólido que hay.

## 3. Otros cuellos de botella (LEÍDO / MEDIDO)
- **Entrenamiento largo antes del primer combate real** (MEDIDO con personas simuladas: ~5 min de 13 pasos; nadie lo saltaba). **Arreglado:** ahora son 5 pasos básicos (misión, mover, atacar, habilidad, esquivar) y un **punto de salida «▶ JUGAR YA»** (~1 min); las lecciones opcionales siguen disponibles y las demás las explica el Hechicero jugando (nuevo aviso de definitiva).
- **Compartir el juego no mostraba nada:** el HTML no tenía descripción, ni tarjeta para WhatsApp/Instagram/X, ni ícono de pestaña. **Arreglado:** metadatos Open Graph + Twitter + imagen 1200×630 (`assets/og/share.jpg`) con la URL de Fondal (`fondalstudios.com/la-horda/jugar/`).
- **Solo horizontal:** en vertical se ve «Girá tu dispositivo». Ya existe pantalla completa + bloqueo de orientación (`js/core/fullscreen.js`, funciona en Android); en iPhone no se puede bloquear. (PROPUESTO: aceptarlo; una versión vertical es otro juego.)
- **Monetización bloqueada por falta de pasarela:** el servidor solo aceptaba un proveedor genérico firmado; no se podía cobrar. **Arreglado:** adaptador de **Mercado Pago (Checkout Pro)** con conversión USD→ARS, verificación del pago contra la API de Mercado Pago y acreditación idempotente (19 chequeos; `docs/production/PREMIUM_CURRENCY.md`). Falta SOLO que cargues las variables de entorno y hagas una compra de prueba con el token `TEST-`.
- **Sin comunidad visible (cold start):** ya hay JUGAR YA con bots de nombres naturales y sala pública. Las salas de Guerra de Cristales siguen siendo por código (PROPUESTO: cola pública con bots de relleno, ver §4).

## 4. Lista priorizada de mejoras (impacto × confianza ÷ costo)
| # | Mejora | Tipo | Estado |
|---|---|---|---|
| 1 | Carga por demanda (portada 17→6,6 MB) | crecimiento | **hecho** |
| 2 | Comprimir JS/CSS en Fondal (gzip/brotli) | crecimiento | **a cargo de quien administra Fondal**, ~1 h |
| 3 | Tutorial corto con salida temprana | retención D0 | **hecho** |
| 4 | Metadatos para compartir + imagen | adquisición | **hecho** |
| 5 | Pasarela Mercado Pago | monetización | **hecho** (falta credencial) |
| 6 | Guerra de Cristales con el motor real (mismas habilidades/HUD) | modo de juego | **hecho** (PR #85) |
| 7 | Cola pública de Guerra de Cristales con bots de relleno | comunidad | propuesto (reutiliza `quick-play`) |
| 8 | Aviso «tu amigo te invita» con enlace corto y tarjeta | viralidad | propuesto |
| 9 | Racha diaria + recompensa visible en el hub (los desafíos diarios ya existen pero escondidos) | retención D1–D7 | propuesto |
| 10 | Coliseo PvP con habilidades reales (torneo de 8, espectador) | modo de juego | propuesto, diseño y riesgos en el hilo; es el trabajo más grande |
| 11 | Evento semanal con mutador (Horda Infinita) y ranking visible | retención | propuesto |
| 12 | Panel de embudo propio (`/api/gm`) con los 4 números de §2 | decisiones | propuesto |

## 5. Para publicar (lo dejo listo, no lo pude subir)
Publicar = copiar el build actual (`index.html`, `crystal-wars.html`, `manifest.webmanifest`, `css/`, `js/`, `assets/`) a `fondalstudios.com/la-horda/jugar/` y reiniciar el relay con el `server/` nuevo (el límite de mensajes y Mercado Pago son del servidor). Verificar con `node tools/crystal-wars/required-files.js` (lista de archivos obligatorios) y abrir la página: la portada debe poder tocarse en pocos segundos.
