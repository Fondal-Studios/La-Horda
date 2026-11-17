# Beta cerrada: guía del dueño (paso a paso)

Esta guía es para prender la **beta cerrada** en el servidor que ya tenés andando
(juego en `https://fondalstudios.com/la-horda/jugar/`, servidor en `wss://fondalstudios.com/la-horda/red`, en Fly.io).
No hace falta saber programar. Todo está **apagado** mientras no cargues las variables de abajo:
si no hacés nada, el juego sigue exactamente como hoy.

> **Nunca** pegues códigos de invitación, direcciones de base de datos ni claves en el repositorio, en un chat
> ni en capturas. Se cargan **solo** en Fly.io (o en Neon, para la base).

## 0. Qué trae el kit (tres interruptores)

| Interruptor (variable) | Qué hace | Si no la cargás |
|---|---|---|
| `BETA_INVITE_CODES` | Para **crear una cuenta nueva** hace falta un código de invitación. Las cuentas que ya existen siguen entrando igual. | Cualquiera crea cuenta (como hoy). |
| `BETA_REPORTS` | Botón **"Reportar un problema"** en Opciones y en Pausa → *Ayuda y opciones*. Se prende solo cuando cargás códigos de invitación. | Apagado (salvo que haya códigos). |
| `BETA_ERROR_REPORTS` | El juego te manda solo sus **errores de JavaScript** (agrupados, sin datos personales). | Apagado. |

Qué pasa con quien juega **sin cuenta**: la puerta controla solo la **creación de cuentas**. El juego se sigue
pudiendo abrir y jugar como invitado (el progreso queda en su dispositivo), la Red local (LAN) y el modo sin
conexión siguen iguales. Lo que queda reservado a los invitados con código es todo lo que necesita cuenta:
guardado en la nube, ranking semanal, Brasas y chat global. Los reportes, con la puerta prendida, también piden
cuenta (así no te llega correo basura de desconocidos).

## 1. OBLIGATORIO antes de invitar a nadie: la base de datos

Hoy el servidor publicado contesta `"store":"file","persistent":false` en
**https://fondalstudios.com/la-horda/red/api/health**. Eso quiere decir que guarda las cuentas en su propio
disco y **las pierde cada vez que se reinicia o se actualiza**. Con una beta cerrada eso es grave: los
invitados perderían su cuenta (y el contador de códigos y los reportes también se borrarían).

Hacé esto una sola vez (no está repetido acá a propósito: seguí las guías que ya existen):

1. **Crear la base gratis en Neon**: `docs/ACCOUNTS_DEPLOY.md`, sección *"Opción recomendada: Neon (gratis, no vence)"*
   (o `docs/ALFA_PASOS_DEL_DUENO.md`, paso **A**). Te queda una dirección que empieza con `postgresql://`.
2. **Cargarla en Fly.io** como secreto `DATABASE_URL`: `docs/ALFA_PASOS_DEL_DUENO.md`, paso **B.2**.
3. **Comprobar**: `docs/ALFA_PASOS_DEL_DUENO.md`, paso **C**. Tiene que decir
   `"store":"postgres","persistent":true,"status":"ready"`.

Las tablas nuevas de la beta (`horda_beta_invites`, `horda_beta_reports`, `horda_beta_errors`) se crean **solas**
la primera vez que arranca el servidor con la base: no tenés que correr nada a mano.

## 2. Que el servidor tenga esta versión

En **https://fondalstudios.com/la-horda/red/api/health** tiene que aparecer la palabra `"beta"`, por ejemplo
`"beta":{"invite":false,"reports":false,"errors":false}`. Si **no** aparece, el servidor tiene una versión
anterior: pedile a quien instaló el servidor que lo actualice (`docs/ALFA_PASOS_DEL_DUENO.md`, paso **D**,
*En Fly.io*). Hacelo **antes** de invitar gente, nunca durante una sesión de juego.

## 3. Prender la puerta con códigos de invitación

### 3.1 Elegí tus códigos

- De **4 a 64 caracteres**, sin comas y sin dos puntos (`:`). Ejemplos: `HORDA-AMIGOS`, `PRENSA-2026`, `DISCORD-NOV`.
- No importa si el jugador lo escribe en mayúsculas o minúsculas, ni si deja espacios al principio o al final.
- Un código por grupo te sirve para saber de dónde vino cada cuenta (el panel muestra cuántas veces se usó cada uno).
- **Tope de usos** (opcional): agregá `:N` al final. `PRENSA-2026:20` = como mucho 20 cuentas con ese código.
  Sin `:N` no tiene tope.

### 3.2 Cargalos en Fly.io

**Opción A, desde el panel (sin consola)**: como en `docs/ALFA_PASOS_DEL_DUENO.md` paso **B.2**:
*Secrets* → *New secret* → **Name** `BETA_INVITE_CODES`, **Value** la lista separada por comas, por ejemplo

```
HORDA-AMIGOS,PRENSA-2026:20,DISCORD-NOV:100
```

**Opción B, desde la consola** (quien tenga `flyctl` instalado), reemplazando `<tu-app>` por el nombre de la app en Fly.io:

```
fly secrets set BETA_INVITE_CODES="HORDA-AMIGOS,PRENSA-2026:20,DISCORD-NOV:100" -a <tu-app>
```

Fly.io reinicia el servidor solo (alrededor de un minuto).

**Opcional, sin el código en claro**: si preferís que ni siquiera la configuración tenga los códigos escritos,
quien te ayuda puede convertirlos con `node tools/beta/invite-hash.js HORDA-AMIGOS PRENSA-2026:20` (no usa
internet ni guarda nada) y cargar lo que imprime (`sha256:…`) en lugar de la lista. Los jugadores siguen
escribiendo el código normal. El servidor **nunca** guarda los códigos en la base: solo una huella (hash) y cuántas veces se usó.

### 3.3 Comprobá

En **https://fondalstudios.com/la-horda/red/api/health** tiene que decir `"beta":{"invite":true,"reports":true,…}`.
En el juego: **Crear cuenta** muestra un campo nuevo, **"Código de invitación"**.

Qué ve un jugador:

| Si… | Mensaje |
|---|---|
| no escribe código | *La beta es cerrada: escribí tu código de invitación.* |
| el código no existe | *Ese código de invitación no es válido. Revisalo o pedile uno nuevo a quien te invitó.* |
| el código llegó a su tope | *Ese código de invitación ya se usó todas las veces permitidas. Pedí uno nuevo.* |

### 3.4 Cambiar o apagar

- **Agregar o quitar códigos**: volvé a cargar `BETA_INVITE_CODES` con la lista **completa** nueva. Los contadores
  de los códigos que siguen en la lista se conservan. Un código que sacás deja de servir para cuentas nuevas
  (las cuentas que ya creó siguen funcionando).
- **Apagar la puerta** (registro libre otra vez): borrá el secreto (*Secrets* → borrar `BETA_INVITE_CODES`, o
  `fly secrets unset BETA_INVITE_CODES -a <tu-app>`).
- Si cargás la variable con un texto donde **ningún** código es válido (por ejemplo `ab`), la puerta queda
  **cerrada para todos** (nadie crea cuentas) y el panel lo avisa. Nunca se abre sola por un error de tipeo.

## 4. Leer los reportes y los errores

1. Entrá al juego con tu cuenta de dueño (o una con permiso de administración).
2. Abrí el panel **Game Master** (Opciones → *Entrar como Game Master*, o agregá `#game-master` al final de la dirección del juego).
3. Pestaña **"Beta cerrada"**. Ahí ves:
   - si cada interruptor está prendido;
   - cada código (solo sus primeras letras) y cuántas veces se usó, con su tope;
   - los **100 reportes más nuevos**: número, categoría (bug, balance, idea, otro), fecha, cuenta, el texto
     y el contexto técnico (versión, pantalla del juego, arena, nivel, campeón, tamaño de pantalla, navegador
     y los últimos errores);
   - los **errores de JavaScript** agrupados: cuántas veces pasó (`×12`), el mensaje, el archivo y la línea, la versión.

Para alguien técnico, lo mismo sale en JSON con la sesión de un administrador:
`GET /api/gm/beta/reports?limit=100`, `GET /api/gm/beta/errors?limit=100`, `GET /api/gm/beta/invites`.

### 4.1 Reportes sin puerta, o apagarlos

- Sin códigos de invitación pero con reportes: secreto `BETA_REPORTS` = `1` (en ese caso también pueden reportar invitados sin cuenta).
- Con códigos pero **sin** reportes: `BETA_REPORTS` = `0`.

### 4.2 Errores automáticos

Secreto `BETA_ERROR_REPORTS` = `1`. Para apagarlo, borralo. Conviene prenderlo durante la beta y mirar la pestaña
una vez por día: un error que aparece muchas veces (`×` alto) en la misma línea es el primero a arreglar.

## 5. Qué se guarda (privacidad)

- **Reporte**: categoría, texto (hasta 1000 caracteres; si alguien escribe un correo, se guarda tapado como `[correo]`),
  el número de cuenta de quien lo mandó (si tenía sesión) y el contexto técnico de arriba. **No** se guarda la IP, el correo de la cuenta ni la ubicación.
- **Errores**: mensaje, archivo y línea (sin la dirección completa), versión del juego y un contador. Sin cuenta ni IP.
- **Códigos**: solo la huella del código y el número de usos.

## 6. Límites (contra abusos)

| Qué | Límite |
|---|---|
| Reportes por cuenta (o por IP si no hay cuenta) | 5 cada 10 minutos |
| Reportes por IP | 15 por hora |
| Tamaño de un reporte | 1000 caracteres de texto, 8 KB en total |
| Reportes guardados | los últimos 5000 |
| Errores enviados por cada jugador | 20 por sesión (los repetidos se suman al contador) |
| Envíos de errores por IP | 30 cada 10 minutos |
| Errores distintos guardados | 1000 |
| Intentos de crear cuenta (con o sin código) por IP | los mismos de siempre (`REGISTER_MAX_IP`, 10 por hora) |

En un evento con un solo wifi (todos salen con la misma IP), mirá la tabla del paso **B.3** de `docs/ALFA_PASOS_DEL_DUENO.md` (`API_MAX_IP`, `REGISTER_MAX_IP`).

## 7. Si algo no anda

| Pasa esto | Hacé esto |
|---|---|
| No aparece "Código de invitación" al crear cuenta | Revisá el paso 3.3: si `/api/health` no dice `"invite":true`, el secreto no se cargó o el servidor es viejo (paso 2). Recargá el juego. |
| Un invitado dice que su código "no es válido" | Revisá que lo esté escribiendo igual (las mayúsculas no importan) y que el código esté en la lista actual. |
| "ya se usó todas las veces permitidas" | Subí el tope (`PRENSA-2026:40`) o dale otro código. |
| No aparece el botón "Reportar un problema" | `/api/health` tiene que decir `"reports":true`. El jugador tiene que recargar el juego. |
| Las cuentas desaparecieron después de un reinicio | Falta la base de datos: paso 1. |

## Para técnicos

- Código: `server/beta-kit.js` (servidor), `js/net/beta-kit.js` (botón, diálogo y errores), campo de invitación en `js/net/account.js`, pestaña en `js/ui/admin.js`.
- Pruebas: `server/test-beta-kit.js` (dentro de `cd server && npm test`; con `BETA_KIT_PG_URL` corre contra Postgres),
  `server/test-postgres.js` (tablas y topes atómicos entre dos procesos) y `tools/beta/report-dialog-browser.js` (navegador).
- Las cuentas nuevas de Steam también piden código si la puerta está prendida. Las cuentas reservadas que el operador crea con `FOUNDER_SIGNUP_CODE` no gastan código.
