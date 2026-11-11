# Guía de Steamworks para La Horda (para el dueño)

Qué hay que hacer fuera del repo, en orden, y qué parte ya está lista del lado del código. Lo que está **verificado** se dice;
lo demás es la configuración habitual de Steamworks y **hay que confirmarla en el panel**, porque Steam cambia sus pantallas.
Referencias: `docs/steam/README.md` (estado), `desktop/LEEME.md` (construcción y subida del build).

## 0. Antes de empezar (tuyo)

| Qué | Para qué |
|---|---|
| Cuenta de Steamworks (partner.steamgames.com), datos fiscales y bancarios, pago de Steam Direct | Sin esto no hay AppID. |
| Decidir precio, regiones y clasificación por edades | Steam lo pide para publicar. |
| Correo de soporte y textos legales definitivos | Hoy los textos están en BORRADOR (`js/data/legal-config.js`, `draft: true`) y el correo está vacío. |
| Decidir cómo se cobra dentro de Steam | Ver §4. |

## 1. Crear la aplicación

1. En Steamworks, crear la app del juego: obtenés el **AppID**.
2. Crear los **depots** (uno para Windows; otro para Linux / Steam Deck si se publica nativo) y anotar sus DepotID.
3. Copiar `desktop/steam_appid.txt.example` a `desktop/steam_appid.txt` (solo en tu máquina, **no se sube**) y poner el AppID real. Sirve para probar el juego con Steam abierto.

## 2. Logros (60 listos)

Ya existen en el repo:
- `docs/steam/achievements.csv` y `docs/steam/achievements.json`: `api_name`, nombre, descripción, oculto, categoría de los 60 logros.
- El juego llama a `HORDA_DESKTOP.unlockAchievement(id)` al cumplirlos (`js/systems/quests.js`). Si Steam no está, no pasa nada y el juego sigue.
- `node tools/steam/export-achievements.js` regenera los archivos desde los datos del juego (probado por `tools/ux/test-steam-achievements.js`).

Lo que hay que hacer en Steamworks:
1. *Stats & Achievements* → cargar los logros. Usar los **mismos `api_name`** del CSV: si el nombre no coincide, el desbloqueo no llega.
2. Subir un **ícono** por logro (hoy no existen: es trabajo de arte).
3. Publicar los cambios de la app (los logros no se ven hasta publicar).
4. Verificar con una cuenta de prueba: desbloquear uno jugando y mirar que aparece en Steam.
- **No verificado:** que `steamworks.js` (dependencia opcional del contenedor) se instale y desbloquee de verdad. Nunca se corrió con Steam real.

## 3. Steam Cloud

El contenedor escribe el guardado en un archivo (`saves/laHordaSave_v1.json`, escritura atómica y copia `.bak`: `desktop/save-mirror.js`).
En Steamworks → *Application → Steam Cloud* → Auto-Cloud, con la ruta de `desktop/LEEME.md` (raíz `WinAppDataRoaming`, subcarpeta
`La Horda/saves`, patrón `*.json`; en Linux `LinuxXdgConfigHome`). **Confirmar el nombre real de la carpeta** en una instalación
(depende de `productName`). Si dos máquinas divergen, el contenedor deja el archivo ajeno como `.conflict-<rev>.json`; **el juego
no avisa todavía al jugador** (pendiente de producto).

## 4. Compras dentro de Steam (DECIDIDO 2026-11-11: microtransacciones de Steam con dinero real en el build de Steam)

Decisión del dueño: la build de Steam vende Brasas con **microtransacciones de Steam** (la web puede seguir con su pasarela). Las
cuentas del juego se identifican con **Steam** (y con **Apple ID** donde corresponda). Regla que no cambia: las Brasas compran solo
cosméticos. Pack de bienvenida vigente: `brasas_bienvenida_v2` (`docs/economy/PRECIOS.md`).

Qué hay que construir (todo es trabajo de servidor y cuentas; hoy NO existe nada de esto):

| Pieza | Qué es | Depende de |
|---|---|---|
| Proveedor `steam` en `server/payments.js` | `ISteamMicroTxn/InitTxn` al comprar, `QueryTxn` y `FinalizeTxn` al confirmar; acredita al mismo libro idempotente de siempre (referencia por pedido). Sandbox primero (`ISteamMicroTxnSandbox`). | Tu AppID y la **clave de editor (publisher key)** de la Web API |
| Identidad Steam | El juego pide un *session ticket* a Steam; el servidor lo valida (`ISteamUserAuth/AuthenticateUserTicket`) y vincula el `steamid` a la cuenta. Sin steamid vinculado no se puede abrir una compra. | AppID, publisher key, `steamworks.js` funcionando en Electron |
| Puente en Electron | `HORDA_DESKTOP` tiene que exponer el ticket y la autorización de la compra (el overlay de Steam avisa que el jugador aprobó). | Probar `steamworks.js` en tu PC (nunca se corrió) |
| Artículos en Steamworks | Un artículo por pack (`brasas_500`, `brasas_1000`, …, `brasas_bienvenida_v2`) con su precio por región. | Tu cuenta de Steamworks |
| Inicio de sesión con Apple | *Sign in with Apple*: el servidor valida el token de Apple (JWKS de Apple) y vincula el `sub` a la cuenta. | Cuenta de **Apple Developer** (de pago), Service ID y dominio verificado |
| Reembolsos | Steam notifica reembolsos por la Web API; hay que revertir las Brasas como ya se hace con Mercado Pago (`reversePurchase`). | Proveedor `steam` hecho |

**Estado (2026-11-11): servidor ESCRITO y probado SOLO contra un Steam falso (pendiente de sandbox con tu AppID)** (`server/steam.js`, `server/test-steam.js`, 45 comprobaciones):
`POST /api/steam/login` (ticket → cuenta), `POST /api/steam/link` (vincular), checkout con `InitTxn` y `POST /api/wallet/steam/confirm`
(`QueryTxn` + `FinalizeTxn` + acreditación idempotente por pedido). Variables del servidor: `PAYMENTS_PROVIDER=steam`,
`STEAM_ENABLED=1`, `STEAM_APP_ID`, `STEAM_PUBLISHER_KEY`, `STEAM_MODE=sandbox|live`; en `live` además `STEAM_TICKET_IDENTITY` (obligatoria: ata el ticket
a este servicio). Cada pack tiene su `steamItemId` en `server/premium-packs.json`
(1001 = 500, 1002 = 1000, 1003 = 2500, 1004 = 5000, 1005 = 10000, 1006 = bienvenida v2): **crear esos artículos en Steamworks con esos IDs**.
Seguridad ya cubierta por pruebas: cada pedido se anota en el libro del servidor ANTES de pedirlo a Steam; un **barrido** (cada 5 min, `STEAM_SWEEP_MS`)
cierra y acredita pedidos aprobados aunque el jugador no vuelva, acredita los cerrados sin crédito (caída entre cobro y crédito) y **revierte reembolsos**
(`Refunded` / `Chargedback`) de los últimos 30 días; el pack de una sola vez no se cierra dos veces; un steamid no puede quedar en dos cuentas.
**Límites conocidos (revisión independiente, seguimientos antes de activar `live`):**
- **Una sola instancia del servidor:** los candados (por cuenta) viven en memoria; con dos instancias el barrido y las consultas podrían pisarse (p. ej. cerrar dos veces un pack de una sola vez). Si se escala, hace falta un candado en la base de datos.
- **Costo del barrido:** O(cuentas con Steam) lecturas del libro cada 5 min y una consulta a Steam por cada pedido sin acreditar de los últimos 7 días (los acreditados, cada 6 h durante 30 días). Un jugador puede acumular pedidos abandonados (hasta 8 cada 10 min) y el barrido lee solo los últimos 3.000 asientos de cada cuenta: el tope de pedidos pendientes por cuenta lo acota; falta cerrar los pedidos terminales (Init viejos, fallidos) para no consultarlos 7 días. Aceptable para el beta; no para miles de cuentas.
- **`PartialRefund` no se revierte.** Tanto la consulta del jugador como el barrido lo anotan una vez como `PAYMENT_STATUS_REVIEW` en el registro del servidor (el barrido con `via: sweep`). Revisión manual = mirar el panel de Steam.
- **Historial:** los asientos internos `steam_order:…` (monto 0) ya no se muestran al jugador ni en la ficha del Game Master (siguen en el libro).
- **Tope de pedidos pendientes:** 12 pedidos sin acreditar en 24 h por cuenta (`STEAM_PENDING_MAX`); el siguiente checkout da 429 con un mensaje claro y no llega a Steam. No cuentan los acreditados ni los que Steam no aceptó (`InitTxn` fallido: se anulan con un asiento `steam_order_void`). **Sí cuentan 24 h** los pedidos que el jugador abandona o cancela en el overlay (no hay forma de saberlo sin consultar a Steam): quien cancele 12 veces en un día queda bloqueado hasta que pase la ventana. El historial filtra sobre una ventana de las últimas 80 entradas, así que con mucha actividad de pedidos puede mostrar menos de 20 movimientos.
- No hay nonce de un solo uso del ticket (con `STEAM_TICKET_IDENTITY` queda atado al servicio); no se verifica la propiedad del juego (el juego es gratis).
- Las cuentas creadas solo con Steam no tienen recuperación por correo ni se unen a una cuenta previa de usuario/contraseña salvo con «vincular».
- El nombre de usuario de las cuentas de Steam (`steam` + 8 dígitos) no es único; la unicidad real es la clave interna (`steam` + steamid).

**Cliente HECHO y probado con un contenedor y un Steam falsos** (`tools/collection/steam-client.js`, 24 comprobaciones): botón «Entrar con Steam» en la pantalla de
cuenta, compra con aviso legal y sondeo cada 2,5 s hasta 5 minutos (el pedido pendiente se guarda y se retoma al volver), y vinculación
de una cuenta clásica al comprar. El puente de Electron expone `HORDA_DESKTOP.steamTicket()` (`desktop/main.js`, `preload.js`):
**NO VERIFICADO** con `steamworks.js` real (los nombres `getAuthTicketForWebApi` / `getSessionTicketWithSteamId` hay que confirmarlos; si usás
`getAuthTicketForWebApi`, la misma cadena va en `STEAM_TICKET_IDENTITY` del servidor y `LAHORDA_STEAM_IDENTITY` del build).
**Falta:** actualizar los textos legales (hoy mencionan Mercado Pago como medio de pago) y probar todo en sandbox con tu AppID (nombres de campos,
estados reales de `QueryTxn`, comportamiento de `FinalizeTxn`).

**Lo que se puede construir y probar sin credenciales:** el servidor completo contra un Steam falso (como ya se hace con Mercado Pago
en `server/test-payments-mp.js`). **Lo que solo se puede validar con tus credenciales:** que Steam real acepte los pedidos
(sandbox), que el ticket de sesión sea válido y que el overlay de aprobación funcione dentro de Electron.

Aviso de política: Steam suele pedir que quien juega en Steam pueda hacerlo con su identidad de Steam. Exigir además un Apple ID para jugar
en PC es poco habitual y puede ir contra las reglas de la ficha; recomiendo que **Steam sea la identidad principal** y Apple una
vinculación opcional. Confirmalo en la documentación vigente de Steamworks antes de publicar.

## 5. Página de la tienda

Todo tuyo / de arte: capturas, tráiler, descripción, cápsulas (varios tamaños), etiquetas y la **declaración de IA**
(`docs/steam/DECLARACION_IA.md`). Quitar los textos «ALFA / gratis / en tu celu / sin instalar» del juego visible para Steam
(el staging ya quita los metadatos web de `index.html`, pero los textos del juego siguen).

## 6. Construir y subir

1. Construir en tu máquina (`desktop/LEEME.md`): `npm run dist:win` (y `dist:linux` en Linux). **Nunca se construyó**:
   la primera vez hay que confirmar las claves de `electron-builder.yml` (`extraResources`, `electronFuses`).
2. Probar el build con `docs/steam/PRUEBAS_ELECTRON.md` antes de subir nada.
3. Subir con `steamcmd` y el `app_build_<AppID>.vdf` de `desktop/LEEME.md` (plantilla incluida).
4. Asignar el build a una **rama privada** con contraseña, instalarlo desde el cliente de Steam y repetir las pruebas.
   Recién después pasarlo a `default`.
5. En Steamworks, enviar la app a **revisión de Valve** (ficha de la tienda y build); suele demorar unos días hábiles.

## 6b. Íconos y fuentes

- Íconos del ejecutable: faltan `desktop/build/icon.ico` (256×256) e `icon.png` (512×512); sin ellos sale con el ícono de Electron.
- Fuentes Press Start 2P y VT323 (licencia SIL OFL): falta incluir el `OFL.txt` correspondiente en el repo.

## Resumen de qué es de quién

| Tarea | Quién |
|---|---|
| Cuenta, AppID, depots, precio, edades | Dueño |
| Cargar los 60 logros y sus íconos | Dueño (CSV listo) |
| Steam Cloud (Auto-Cloud) | Dueño (rutas listas) |
| Decidir A o B del §4 | Dueño; si es A, hace falta trabajo de servidor |
| Textos legales y correo de soporte | Dueño |
| Construir, probar y subir el build | Dueño (guía lista) |
| Íconos, capturas, tráiler, cápsulas | Dueño / arte |
