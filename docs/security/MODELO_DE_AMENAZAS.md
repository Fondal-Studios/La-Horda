# Modelo de amenazas de La Horda

Fecha: 2026-10-19. Basado en lectura de `js/storage/save.js`, `js/net/net-core.js`, `js/net/account.js`,
`server/accounts.js`, `server/relay.js`, `server/wallet.js`, `server/entitlements.js`, `server/trades.js`.
El servidor **no se modificó** en este cambio. Lo que no se leyó o no se corrió no se afirma acá.

## 1. Qué es del cliente (y por lo tanto editable por el jugador)

El juego corre entero en el navegador y el guardado es un JSON en `localStorage` (`laHordaSave_v1`) que se sube tal cual a la
nube. Quien abre las herramientas del navegador puede cambiar:

- oro, gemas, niveles, XP, puntos de talento, maestrías, arenas superadas, derrotas, puntos de control, Libro/Códice;
- el inventario (objetos con sus números), reliquias, cromas/skins ya compradas en el guardado;
- las preferencias (`horda_prefs`, `horda_vol`...) y el nombre local;
- el código de las páginas que sirve su propio navegador (todo el juego).

Por eso **todo lo que sale del guardado es información declarada por el cliente, no verificada.** El normalizador de carga
(`js/storage/save-sanitize.js`) lo vuelve *robusto* (tipos, rangos, claves de prototipo, textos con `<>`), pero **no es
anti-trampas**: dentro de los topes (oro 1e9, nivel 99, etc.) el jugador sigue pudiendo ponerse lo que quiera.

El progreso de campaña y el oro son **solo-jugador**: hacer trampa en ellos no daña a nadie más. Eso es una decisión
aceptable y no se intenta impedir.

## 2. Qué valida el servidor hoy

(lectura de `server/accounts.js`, sin modificarlo)

| Tema | Qué hace el servidor | Qué NO hace |
|---|---|---|
| Cuentas | contraseñas con scrypt + sal; tokens de sesión de 32 bytes (solo se guarda su SHA-256); límites de intentos por usuario/IP y de altas por IP | no hay 2FA ni recuperación por correo |
| Guardado en la nube (`PUT /api/save`) | es un objeto, ≤ 512 KB, control de versión (409 `CONFLICT`), `entitlements.sanitizeSave` fuerza la propiedad de campeones Fundador / por concesión / sin publicar | **no valida oro, niveles, XP, inventario ni progreso**: lo que sube el cliente se guarda y se devuelve. `summarize(save)` toma `save.gold` del cliente solo para el aviso de conflicto (no es una autoridad) |
| Billetera Brasas (`server/wallet.js`) | el saldo vive en el servidor, no en el guardado; libro append-only con referencia única; precios del servidor | solo cosméticos; los pagos reales están apagados hasta configurar proveedor |
| Ranking semanal (`lbCheck`) | enteros acotados, semana vigente, duración mínima por ronda (`LB_ROUND_MIN_MS`), techo de puntaje por ronda y duración (`lbMaxScore`, generoso), límite de envíos y separación mínima | **el puntaje lo declara el cliente**: no se reproduce la partida. Un puntaje plausible pero falso entra. El techo frena lo imposible, no lo creíble |
| Intercambio de objetos (`server/trades.js`) | el relay decide el estado, uid "quemado" tras el commit, evita la duplicación aun con cortes | el contenido del objeto lo declara el cliente (el receptor lo re-sanea en `net-trade.js`); un objeto "inventado" en el guardado puede ofrecerse |
| Relay multijugador (`server/relay.js`) | salas, orígenes permitidos, nombres/chat sin `<>`, un solo campeón exclusivo por presencia | el **anfitrión** corre la simulación y es autoritativo para la sala: un anfitrión tramposo puede alterar la partida de sus invitados |

## 3. Qué NO es competitivo

Mientras el servidor no reproduzca ni verifique las partidas, estos datos **no deben presentarse como competitivos**:

- el **ranking semanal de Horda Infinita** (puntaje autodeclarado; solo plausibilidad). Cosmético: sus premios son solo
  cosméticos, y el texto del juego lo dice ("solo cosmético");
- cualquier **comparación de oro/nivel/progreso** entre jugadores;
- los resultados de **partidas cooperativas** (dependen del anfitrión);
- la **Guerra de Cristales / Coliseo** competitivos si se usaran para premios: hoy son modos casuales con simulación del anfitrión.

Lo que sí tiene autoridad del servidor: propiedad de campeones especiales, saldo de Brasas, cuentas y sesiones.

## 4. Amenazas específicas y estado

| # | Amenaza | Estado tras este cambio |
|---|---|---|
| 1 | Guardado con `gold:"NaN"`, `Infinity`, objetos o `__proto__` | **Confirmada** (antes: `Object.assign(defaultSave(), parsed)` sin validar: un `gold` string se cargaba como string y un `__proto__` propio cambiaba el prototipo del guardado). **Mitigada** con `saveSanitize` en la carga (local, nube y código de guardado). Sigue siendo editable dentro de los topes |
| 2 | Enlace `?server=wss://host-ajeno` o `horda_server` que redirige relay y API de cuentas (usuario y contraseña viajan a la API) | **Confirmada** (y también `?api=`, que fijaba `ACCOUNT_API_BASE` sin ninguna comprobación). **Mitigada**: un host que no sea el oficial (`fondalstudios.com`), el servidor anterior (`la-horda-relay.onrender.com`), o localhost/127.0.0.1/[::1] **no se usa hasta que el jugador acepte un aviso**; la aceptación vale solo para esa pestaña. Un jugador que acepta el aviso sigue expuesto: es una decisión suya, el aviso lo dice |
| 3 | Claves editables: `checkpoints`, `arenaDefeats`, `defeatLegacy`, `codexBook` | **Confirmada** la edición (también `Infinity` en `checkpoints.xp/gold`, que `checkpointsNormalize` dejaba pasar). Se sanean tipos y rangos. Editar punto de control/derrotas sigue siendo trampa solo-jugador. `horda_prefs` **no** era vulnerable: `js/core/prefs.js` ya acepta solo claves y valores conocidos (se agregó prueba) |
| 4 | `innerHTML` con datos de red o guardado | **Parcialmente confirmada**: casi todo ya estaba escapado; se corrigieron 4 puntos (nombre de puesto y anfitrión en la sala, feed de Cristales/Coliseo) y se limpian los textos de objetos y los números del guardado. Detalle en `INNERHTML_AUDIT.md` |
| 5 | Invitación con servidor (`netJoinWithCode` con `inv.server` → `net.serverOverride`) | **No se tocó.** Solo cambia el servidor de salas; el token de cuenta solo se envía al relay del mismo host que la API (`accountPresenceToken`), así que una invitación no filtra credenciales. Un servidor de salas ajeno sí puede ver el nombre y el guardián |

## 5. Qué requeriría un servidor autoritativo (recomendación, sin implementar)

Para que ranking, oro y progreso sean confiables:

1. **Simulación o verificación en el servidor.** Opciones: (a) el servidor corre la simulación determinista de la partida
   (el juego ya tiene RNG con semilla y reloj virtual en `tools/regression/t_det.js`, lo que ayuda) y los clientes solo
   mandan entradas; (b) el cliente sube un *replay* (semilla + entradas) y el servidor lo reproduce para validar el
   puntaje antes de aceptarlo.
2. **Economía en el servidor.** Oro, gemas y XP como saldos del servidor con libro de movimientos (como ya hace
   `wallet.js` para Brasas); las partidas acreditan recompensas calculadas por el servidor, no por el cliente. El guardado
   del cliente quedaría como caché.
3. **Inventario con identidad firmada.** Los objetos nacen en el servidor (uid + firma HMAC de sus números); el intercambio
   y el guardado rechazan objetos sin firma válida.
4. **Salas con el servidor como árbitro**, o al menos verificación estadística de los resultados del anfitrión.
5. **Detección de anomalías**: límites de ganancia por hora, auditoría de saltos de oro/nivel entre versiones del guardado
   en la nube (el control de versión ya existe: se puede comparar cada subida con la anterior).

Costo: es un rediseño de arquitectura (hoy el relay solo reenvía mensajes). Mientras no exista, la recomendación es
mantener el ranking y el progreso etiquetados como **sociales/cosméticos**, no competitivos, y no ligar premios con valor
real (Brasas/dinero) al oro, al nivel ni al ranking.
