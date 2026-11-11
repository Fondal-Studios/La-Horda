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

## 4. Compras dentro de Steam (decisión grande)

Hoy la tienda de Brasas cobra por una pasarela web (Mercado Pago) con cuenta propia. En general, Steam espera que lo que se
compra **dentro del juego** pase por Steam (microtransacciones de Steam) y no por una pasarela externa. **Confirmá la política vigente
en la documentación de Steamworks antes de decidir**, porque cambia. Opciones:

| Opción | Qué implica |
|---|---|
| A. Microtransacciones de Steam | Hay que integrar la API de Steam (InitTxn / FinalizeTxn) del lado del servidor y crear los artículos en Steamworks. Es trabajo de servidor y cuentas, que dejaste para después. |
| B. Quitar la compra con dinero real del build de Steam (`stage.mjs --beta-public` y ocultar la pestaña ✦ Brasas) | La versión de Steam sería solo jugable; las Brasas se ganan jugando o se compran solo en la web. Es lo más rápido para un primer lanzamiento. |

Regla del producto que se mantiene en cualquier caso: **las Brasas compran solo cosméticos** (nunca poder). El pack de bienvenida
vigente es `brasas_bienvenida_v2` (900 Brasas, sin campeones; `docs/economy/PRECIOS.md`).

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
