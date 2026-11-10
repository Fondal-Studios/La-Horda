# La Horda — contenedor de escritorio (Steam)

Esta carpeta envuelve el juego (HTML5, sin build) en una aplicación de escritorio con Electron para publicarlo en Steam.

> **Estado real:** el código de esta carpeta está escrito y revisado con `node --check`, y `test-stage.mjs` pasa. **El binario de
> Electron NO se construyó ni se ejecutó nunca**: ni en Windows, ni en Linux, ni en Steam Deck. No se instaló Electron,
> electron-builder ni steamworks.js. La primera construcción la tiene que hacer alguien en una máquina con Windows (y probarla).
> El checklist completo está en `docs/steam/README.md`.

## Archivos

| Archivo | Para qué |
|---|---|
| `main.js` | Proceso principal: protocolo `app://lahorda/`, ventana 1280×720 redimensionable, F11 / Alt+Enter, sin menú, sin DevTools en producción, enlaces externos al navegador del sistema, bloqueo de código remoto, espejo del guardado, salida limpia. |
| `preload.js` | Puente `window.HORDA_DESKTOP` y el espejo de `localStorage` a disco (lee al arrancar, escribe cada 2 s si cambió). |
| `url-policy.js` | Reglas de URLs: lista blanca de parámetros, clasificación de navegación, rutas de archivo sin path traversal, teclas. Sin Electron. |
| `save-mirror.js` | Lectura / escritura atómica de `userData/saves/` y la regla que decide si se adopta el archivo. Sin Electron. |
| `stage.mjs` | Copia a `desktop/game/` **solo** lo que el juego carga (lista blanca). |
| `test-stage.mjs` | Prueba de `url-policy`, `save-mirror`, del staging y de que el staging carga en Chromium sin errores ni 404. |
| `electron-builder.yml` | Empaquetado a carpeta (`dir`) para Windows x64 y Linux x64. |
| `steam_appid.txt.example` | Plantilla. El AppID real lo da Steamworks; **no** se versiona ni viaja en el depot. |

## Qué necesita el dueño antes de empezar

1. **Cuenta de Steamworks** (partner.steamgames.com) con el pago de Steam Direct hecho y los datos fiscales y bancarios completos.
2. **AppID** del juego y **DepotID** de cada plataforma (los genera Steamworks al crear la aplicación; lo habitual es AppID+1 para Windows).
3. **steamcmd** instalado en la máquina que sube el build, y un usuario de Steam con permiso "Edit App Metadata" + "Publish App Changes" (conviene una cuenta solo para subir builds, con Steam Guard).
4. Una PC con **Windows 10/11 x64** y Node.js 20.11 o superior (para construir y probar). Para Steam Deck, además una máquina Linux x64 o el propio Deck.
5. **Íconos**: `desktop/build/icon.ico` (Windows, 256×256) y `desktop/build/icon.png` (Linux, 512×512). Hoy no existen; sin ellos el ejecutable sale con el ícono de Electron. Después hay que descomentar las líneas `icon:` de `electron-builder.yml`.
6. Decisiones pendientes listadas en `docs/steam/README.md` (compras, textos legales, declaración de arte con IA, modos visibles).

## Construir (en la máquina del dueño, NO en CI ni en este repo)

Todos los comandos se corren **dentro de `desktop/`**. `npm install` crea `desktop/node_modules` (ignorarlo en git); nunca instalar en la raíz del repo.

```bash
cd desktop
npm install                 # baja electron, electron-builder y (opcional) steamworks.js
node test-stage.mjs         # opcional pero recomendado; necesita Playwright (ver cabecera del archivo)
node stage.mjs              # arma desktop/game/ (~286 MB, ~4.000 archivos) con la lista blanca
npx electron .              # prueba en ventana, modo desarrollo (con DevTools)
npm run dist:win            # -> desktop/dist/win-unpacked/   (ejecutable "La Horda.exe")
npm run dist:linux          # -> desktop/dist/linux-unpacked/ (en una máquina Linux)
```

`stage.mjs --beta-public` arma el paquete de la beta pública (solo Campaña y Horda Infinita). Es una decisión del dueño; por omisión no se aplica.

### Probar el build antes de subirlo (lista mínima)

- Abre en ventana 1280×720, se puede redimensionar, F11 y Alt+Enter alternan pantalla completa, cerrar la ventana termina el proceso.
- Ctrl+Shift+I, F12, Ctrl+R y F5 no hacen nada. No hay barra de menú.
- Jugar una partida, cerrar, volver a abrir: el progreso sigue. En `%APPDATA%/La Horda/saves/` (Windows) o `~/.config/La Horda/saves/` (Linux) aparece `laHordaSave_v1.json`.
- Un enlace externo (legales, soporte) abre el navegador del sistema, no una ventana del juego.
- Sin Internet: el juego arranca y se juega en solitario.
- Para probar Steam en desarrollo: copiar `steam_appid.txt.example` a `steam_appid.txt`, poner el AppID real y tener Steam abierto. Ese archivo **no** se sube.

## Subir a Steam (SteamPipe)

1. En Steamworks → *SteamPipe → Depots*: crear un depot para Windows (y otro para Linux / Steam Deck si se publica nativo).
2. En Steamworks → *Installation → General*: opción de lanzamiento Windows `La Horda.exe`; Linux `la-horda-desktop` (confirmar el nombre real del ejecutable en `dist/linux-unpacked/`).
3. Crear fuera del repo (tienen datos de la cuenta) `app_build_<AppID>.vdf`:

```
"AppBuild"
{
  "AppID" "<AppID>"
  "Desc" "La Horda <versión>"
  "ContentRoot" "<ruta absoluta a>/desktop/dist/"
  "BuildOutput" "<ruta absoluta a>/steam-build-output/"
  "Depots"
  {
    "<DepotID Windows>"
    {
      "FileMapping" { "LocalPath" "win-unpacked/*" "DepotPath" "." "recursive" "1" }
      "FileExclusion" "*.pdb"
      "FileExclusion" "steam_appid.txt"
    }
    "<DepotID Linux>"
    {
      "FileMapping" { "LocalPath" "linux-unpacked/*" "DepotPath" "." "recursive" "1" }
      "FileExclusion" "steam_appid.txt"
    }
  }
}
```

4. Subir: `steamcmd +login <usuario_de_builds> +run_app_build <ruta absoluta>/app_build_<AppID>.vdf +quit`
5. En Steamworks → *SteamPipe → Builds*: asignar el build a una rama **privada** (por ejemplo `beta`, con contraseña), instalarlo desde el cliente de Steam y repetir la lista de pruebas. Recién después pasarlo a `default`.
6. Steam Cloud (opcional): *Application → Steam Cloud* → Auto-Cloud, raíz `WinAppDataRoaming`, subdirectorio `La Horda/saves`, patrón `*.json` (y la raíz equivalente de Linux: `LinuxXdgConfigHome`, `La Horda/saves`). Cuota sugerida: 20 MB, 30 archivos. **No verificado**: el nombre exacto de la carpeta depende de `productName`; comprobarlo en la máquina.

## Cómo funciona (resumen para quien lo mantenga)

- **Origen fijo `app://lahorda/`.** El guardado está en `localStorage`, que depende del origen. `file://` no sirve (fuentes y `fetch` bloqueados, canvas "tainted") y `http://localhost:PUERTO` cambia de origen si cambia el puerto. **No cambiar ni el esquema ni el host después de publicar: los jugadores perderían el guardado.**
- **Parámetros de desarrollo.** Solo pasan `return`, `cw`, `room` y `mode`. `?dev=1`, `?devxp=`, `?server=`, `?api=`, `?debug=1`, `?res=`, `?lazy=`, `?webp=`, `?sw=` y cualquier otro se quitan en dos lugares (el protocolo redirige y `will-navigate` reescribe). Además `?dev=1` exige un host privado y `lahorda` no lo es. El código de esas funciones sigue viajando dentro del paquete (solo no se puede activar desde la URL).
- **Código remoto.** Se cancela cualquier script, marco u objeto que no venga de `app://lahorda/`. Efecto conocido: "Jugar en la tele" (que baja un SDK de la web) no funciona en el build de Steam.
- **Guardado en disco.** Ver la cabecera de `save-mirror.js`. `localStorage` sigue siendo la fuente; el archivo es una copia con número de revisión. Si otra máquina subió una revisión más nueva y la local tiene cambios sin espejar, **gana la local** y el archivo ajeno queda en `saves/<clave>.conflict-<rev>.json`.
- **PNG y WebP.** El staging lleva los dos (65 MB de PNG "duplicados"). No se pueden quitar todavía: ver la cabecera de `stage.mjs`.

## Lo que este contenedor NO resuelve

Pantalla de salir al escritorio dentro del juego, pausa al perder el foco (el contenedor emite los eventos `lahorda-blur` / `lahorda-focus` pero el juego no los escucha), logros de Steam (el puente `HORDA_DESKTOP.unlockAchievement` existe pero el juego no lo llama), compras, escala de interfaz en 1440p. Todo eso es código del juego: está en `docs/steam/README.md`.
