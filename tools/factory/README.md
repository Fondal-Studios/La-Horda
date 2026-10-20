# Champion Factory

## Importación de fuentes originales

`python tools/factory/import-authored-sheet.py source.json output-directory` importa
una fuente RGBA de 36 poses (4 columnas × 9 filas) al atlas 112×112 del motor.
El manifiesto declara `source`, `sourceSha256` y `targetHeight` (70 por defecto).
Usa el detector de pies existente; `bottomAnchorFrames` permite declarar poses cuya
base necesita anclaje inferior explícito tras revisión visual.
Rechaza huellas incorrectas, falta de transparencia, siluetas cortadas en el borde,
poses ausentes/fusionadas, desorden de grilla y clipping al escalar uniformemente.
Separa componentes para no arrastrar armas de celdas vecinas. Produce atlas, preview
y recibo **IMPORTED_NOT_APPROVED**; no instala ni aprueba contenido automáticamente.
Revisión visual, estilo, roster y contratos siguen siendo obligatorios antes de integrar.
Pruebas: `python -m unittest tools/factory/test_import_authored_sheet.py`.

Pipeline de incorporación, sin generación ficticia de arte ni cambios silenciosos del roster.

```sh
node tools/factory/cli.js new guardian docs/production/guardian.json
node tools/factory/cli.js validate docs/production/guardian.json
node --test tools/factory/test.js
node tools/factory/cli.js gate reference
node tools/factory/cli.js gate all
```

`new` no sobrescribe archivos. Completar concepto, kit y referencias al código real; producir arte y previews usando el estilo de `docs/ART_BIBLE.md`. Completar revisión de estilo con reviewer/evidencia y SHA-256 del atlas (la huella impide reutilizar una aprobación de otro atlas por accidente). PNG: se valida encabezado/grilla, no decodificación ni contenido de cada frame. Revisar visualmente thumbnails, clipping y animación. `validate` devuelve **INCOMPLETE** o **STRUCTURAL_PASS**, nunca permiso de merge. Un archivo de evidencia existente no demuestra que la prueba pasó: ejecutar gates sobre el commit candidato.

Los gates reutilizan herramientas de balance, visual, audio, red y FPS. Requieren Playwright/browser y, según script, servidor local: consultar sus cabeceras. Se ejecutan en serie para evitar colisiones de puertos existentes. `all` se detiene ante el primer fallo y devuelve código no cero. No modificar `knownChampions` para saltar normalización/entrada.

El contrato exige tres skills + ultimate, horda útil, talentos/maestría/Códice, atlas/previews, skin/croma/Set, lore de apariencia, límites de entidades y evidencias. Tiene rechazo de huérfanos, recolors clasificados como skins, referencias rotas, cambio de estadísticas por cosmético, frame grid incompatible y recompensa de Set inválida. No puede inferir calidad de lore, arte o game feel de JSON. Registros existentes no se convierten automáticamente a este contrato; el retrofit debe conservar identidad y usar evidencia real.

Flujo: generar → completar → implementar → validar contrato → test específico de kit → simular → revisar visual/audio → medir performance → probar cooperativo → reparar → repetir → aprobar. El pipeline no autoescribe código de habilidades ni assets; automatiza tareas repetibles y hace explícitos los huecos del paquete. Los manifiestos de candidatos incompletos no se registran en runtime.

Auditoría del roster actual (servidor local ya levantado):

```sh
FACTORY_BASE_URL=http://127.0.0.1:8750 node tools/factory/audit-roster.js docs/production/roster-audit.json
```

Lee registros inicializados, incluidos módulos tardíos, y detecta kits incompletos, descripciones/cooldowns ausentes, lore, talentos y Sets faltantes. La detección de AoE por radio/cadenas es solamente un indicio: requiere simulación de gameplay. El informe no convierte registros heredados en paquetes aprobados.

Prueba de eventos sobre motor real (API y reloj simulados, no reemplaza tests server):

```sh
FACTORY_BASE_URL=http://127.0.0.1:8805 node tools/factory/event-runtime.js
```

Los eventos con jefe seleccionan el encuentro nativo de su arena (nueve directores aprobados, nivel 10), no trasplantan controladores contextuales a mapas incompatibles. Hielo exige derrotar la forma final. El Set configurado dirige tiradas de Set y garantiza una pieza al derrotar al jefe durante el evento. La recompensa cosmética requiere ticket de cuenta, victoria final y validación temporal/objetivo del servidor; tiene retry en Resultados y propiedad idempotente. Los recibos ya ganados sobreviven a recargas en una cola local de hasta 20 por servidor/cuenta (sin sesión ni token); se restauran al entrar y se eliminan al confirmar, invalidarse o vencer. `node tools/alpha/event-receipts-test.js` prueba persistencia, cambios de cuenta/servidor y reintentos. Esto no es anticheat autoritativo: la simulación Alpha sigue en el cliente/host. El servidor valida permisos, catálogo, cuenta, ticket y repetición. Los multiplicadores temporales expiran sin sobrescribir configuración normal.

## Gates ejecutables de progreso y habilidades

- `gate talents`: carga/migración local y nube, niveles 1/39/40/60/90/99, idempotencia, maestría irreversible y caché por nivel.
- `gate abilities`: medición diferencial de efectos en el motor y canario negativo; los clásicos conservan diagnóstico INFO.
- `gate resources`: entradas reales de lanzamiento en 38 campeones a seis niveles; rechaza gasto sin energía, durante cooldown, pausa o muerte, y comprueba recursos finitos. Informa explícitamente excepciones por estado del kit y la definitiva transformada de Ilkan.
- `gate passives`: pasivas clásicas con daño, curación y límites medidos.
- `gate style`: métricas del roster en modo estricto; candidatos vacíos, ilegibles, incompletos o de formato incorrecto fallan. Los formatos ajenos al pintor se enumeran como omitidos, nunca PASS.

Estas pruebas se complementan: recursos finitos no demuestran daño correcto, la comparación de categorías no certifica duración ni multijugador, y el gate de estilo numérico no sustituye la revisión visual contra el Caballero.

### Evidencia de producción y exportaciones existentes

- `python3 tools/factory/reconcile-art-production.py [--write]`: concilia únicamente las integraciones explícitas de `docs/production/art-integrations.json`. Comprueba ascendencia del merge, metadatos, hashes de fuente/atlas, dimensiones y pruebas guardadas antes de tocar el inventario. Las exportaciones PXI requieren además comprobar el merge, la correspondencia exacta tarea/bloque, el hash del renderizador, PNG/RGBA y coincidencia con el renderizador real (necesita Playwright/Chromium). Un PNG existente no cierra una tarea. Publicación se comprueba por separado.
- `node tools/factory/export-runtime-icons.js [--write]`: exporta 19 íconos pendientes usando `_pxiCanvas` real, con paleta, nombres accesibles y hashes RGBA. Sin `--write` exige coincidencia exacta de píxeles RGBA y recibo (incluye hash del PNG guardado; admite diferencias de compresión del navegador). No crea diseños nuevos.
- `python3 tools/factory/prepare-grid-atlas.py FUENTE SALIDA`: preparación técnica en staging, con el normalizador/importador existentes. No instala ni aprueba arte.
- `python3 tools/factory/replace-authored-frame.py MANIFIESTO SALIDA`: ensambla un reemplazo de autor con hashes; conserva los otros 35 cuadros sin cambios. No aprueba arte.
- `node tools/art/check-authored-density.js ATLAS REPORTE [escala]`: detector canónico por cada uno de los 36 cuadros; rechaza cuadros vacíos. Complementa el Style Gate por medianas. Un PASS técnico tampoco reemplaza revisión visual ni prueba a escala de runtime.

B001 Soporte v3 se integró tras validación en PR #163; evidencia en `docs/art-gate/soporte-v3/`. El reemplazo completo B004 sigue en FIX: no reutilizar su hoja como si hubiera aprobado el Art Gate. Las extracciones de clips independientes necesitan validación propia y no cierran el resto de B004. Fuentes y reportes están preservados para continuar sin repetir generaciones.

El ensamblador de un cuadro admite `targetHeight` entero de1 a106, en píxeles de silueta completa; por defecto conserva la altura original. Se calibra explícitamente cuando el arma ocupa una proporción diferente y no permite igualar el cuerpo usando solo la altura total. Escala uniforme NEAREST, pies106 y otros35 cuadros intactos; rechaza clipping y valores inválidos. No es aprobación del arte. Pruebas: `python -m unittest tools/factory/test_authored_frame.py`.

### Compatibilidad de animaciones antes de sustituir un atlas

`node tools/factory/check-animation-contract.js --key PACK --candidate propuesta.json [--runtime archivo.js --symbol P] [--output reporte.json]`

La propuesta contiene `key`, `atlas` (PNG real dentro del repo) y `meta` (w/h/cols/sets como en champPackLoadAtlas).
Compara los clips declarados con el registro actual, rechaza clips perdidos/acortados, grillas inválidas y cuadros fuera del PNG (incluido espejo por complemento).
Para renderers especiales, `--runtime` extrae llamadas literales a `_smFrame(P, "clip", ...)`.
No reemplazar El Libertador por una plantilla36: perdería mosquete, recarga, bayoneta, mando y fases propias.
Conservar también el pack montado; cambiar de arma en una fase equivocada requiere redibujar.

`COMPATIBLE_NOT_ART_APPROVAL` verifica solo contrato declarado. No certifica contenido visual, efectos, habilidades implementadas, red, Style Gate ni Visual Gate.
Seguir ejecutando los gates existentes y observando el renderer real. No agregar nombres ficticios para esconder poses faltantes.
Pruebas: `node --test tools/factory/test-animation-contract.js`; el canario de Libertador debe ser rechazado por los clips reales ausentes.

### Componentes sin sustitución del atlas completo

`python3 tools/factory/extract-authored-clip.py MANIFIESTO SALIDA RECIBO` extrae cuadros únicos en orden, con SHA-256 de fuente y RGBA por cuadro. No escala, filtra ni cambia la paleta. Rechaza grillas inválidas, duplicados, cuadros vacíos y alfa parcial. El recibo `EXTRACTED_NOT_APPROVED` no aprueba arte. Para un clip de cuatro cuadros112×112: `node tools/art/check-authored-clip-density.js ATLAS REPORTE` reutiliza el detector canónico sin cambiar umbrales; su alcance son esos cuatro cuadros. El checker de hojas36 conserva sus exigencias. Completar revisión visual, escala, Códice, skins, fallback, renderer y red antes de integrar. Prueba: `python3 -m unittest tools/factory/test_authored_clip.py`.

- `python3 tools/factory/repair-outline-gaps.py MANIFIESTO STAGING`: repara huecos pequeños en un contorno oscuro ya existente tras diagnóstico visual. Conserva todo píxel opaco original, no redimensiona y registra coordenadas/hashes. Rechaza fuentes recortadas, alfa parcial, defectos extensos y escritura en assets. No transforma una ilustración ni aprueba el arte. Pruebas: `python3 -m unittest tools/factory/test_outline_gaps.py`.
