> Cierre posterior 22/10/2026: [correccion-01/CHECKPOINT.md](correccion-01/CHECKPOINT.md). Leerlo antes de reanudar; conserva este historial.

# Habilidades recientes — Solciju, primera pasada de identidad

22/10/2026. Base main `6334ff40b6514808ef0fe00b50bec15e19f10c25`.
Rama prevista: `art/recent-abilities-solciju-20261022`. Estado: EN_CORRECCION, NO_INTEGRAR.

## Trabajo concreto

Auditoría visual del renderer de las 20 habilidades (3 + definitiva) de Solciju, Veyra, Brakk, Morveth y Aelith. `before/` conserva cinco momentos de cada cast. Las definitivas llegan por `uf.solciju`, `uf.veyra`, `uf.brakk`, `uf.morveth`, `uf.aelith` y sí muestran formas diferentes. No se reemplazan. Las trazas registran KVB; los casts normales del motor SFA se comprueban en las capturas, no deben declararse ausentes por tener traza KVB vacía.

Primera pasada de Solciju sobre sus recetas nativas ya instaladas: mancha lobulada de vino, explosión con duelas, copa vertical y charco de fermentación de fallback. Cuatro atlas exportados del renderer (44 cuadros totales, incluidos finales transparentes de disipación), fuentes en `js/champions/vfx-b/solciju.js`. `hooks.js` deja de añadir el punch circular solo en los casts Q5 de Solciju. Conserva radios, anticipación de apuntado, temporizadores, cargas, daño, habilidades, cuerpos y skins. Gran Reserva con UF encendido conserva su forma de bodega existente; el charco nuevo es fallback con UF apagado.

La fuente se produce con el sistema de pintura nativo KVB existente; no se requiere regenerar cuerpos ni nuevas imágenes de personajes. Originales recuperables íntegros en la base citada. Atlas PNG son exportaciones de evidencia: no se agregó otro cargador ni PNG de producción duplicado.

## Clasificación, por componente

- B208 / A-FX-solciju-h1: GENERADO → EN_CORRECCION. Se distingue del círculo anterior, pero las cinco puntas de la mancha pueden leerse como estrella/sello. Corregir asimetría/curvatura en lote agrupado.
- B209 / A-FX-solciju-h2: GENERADO → EN_CORRECCION en la explosión (so_fuse); conservar barrica, mecha y radio real. Mismo defecto de silueta del charco.
- B210 / A-FX-solciju-h3: GENERADO. Copa reconocible en la comparación móvil; revisión inicial favorable, aún no VALIDADO integralmente. Faltan matriz de skins/arenas y checks del head.
- B490 / A-PROP-kvb-solciju-sol_reserve y B491 / A-PROP-kvb-solciju-sol_lees: EN_CORRECCION en fallback so_pool_idle. No cerrar B040 ni A-FX-solciju-ult por este cambio.
- Ninguno INTEGRADO_MAIN. Publicación pública no verificada. No se cierra un bloque entero.

## Evidencia y pruebas

`solciju-comparison.png` y `mobile-solciju-comparison.png`: antes/después en bosque, misma escala, cámara y semilla; `sceneHash` previo al cast idéntico en los ocho pares (4 apaisados, 4 verticales). Tiempos 80/250/500/800/1200 ms. La copia inicial no determinista fue reemplazada por esta evidencia controlada.

`fallback-after/`: UF apagado, 160/800/1600/2400/2700 ms, incluye explosión tras 2,4 s. `engine-off/`: fallback genérico con KVB apagado. Estas capturas no equivalen a una matriz de arenas ni a una revisión de todas las skins.

- Motor VFX B: PASS, 148 recetas, 3792 sprites, alfa suave 0, RNG de combate consumido 0, pool ≤128, expiración/reset, entradas hostiles y replay de red.
- `tools/quality-five/functional.js`: PASS, 132 checks.
- `tools/quality-five/online.js`: PASS, 23 checks; dos clientes con relay local sin modificaciones, cinco parejas y control táctil en invitado. No es publicación pública.
- `tools/vfx/export-solciju-kit.js`: cuatro recetas grabadas/reproducidas y límites con reduceFx on/off PASS. Cuatro atlas reexportados idénticos byte por byte.
- Revisión visual inicial: FIX en manchas por lectura de estrella; copa favorable. Las pruebas técnicas no levantan el FIX.

## Cómo reanudar

1. Leer PR abierto y su head actual, este checkpoint y `docs/production/CORRECTION_BATCH.json`. Mantener este PR como taller; no mergear mientras contenga FIX.
2. **Siguiente kit: Veyra**, B226/B227/B228, reutilizando `before/veyra-*.png`, canon `quality-five/veyra.js` y `vfx-b/veyra.js`. Luego Brakk y Morveth; Aelith normal sin duplicar PR191. No seguir puliendo una mancha de Solciju antes de esas primeras pasadas.
3. Hallazgo transversal pendiente: `quality-five/register.js` asigna `fx:'zone'` a las 20 demos del Códice. `codexSkillFx` respeta ese valor y la demo genérica no refleja la forma del renderer real. Corregir como componente visual independiente con evidencia del Códice; no afirmar que la partida usa esas demos.
4. En tanda de corrección, redondear manchas conservando IDs, escala y alfa. Revisar skins/arenas; repetir export, renderer, red y CI de SHA actual. Separar un componente aprobado si se quiere integrar sin arrastrar FIX.

Reproducir (Playwright y Chromium disponibles):

```sh
PLAYWRIGHT_MODULE=/ruta/playwright CHROMIUM_PATH=/ruta/chromium node tools/vfx/export-solciju-kit.js
PLAYWRIGHT_MODULE=/ruta/playwright CHROMIUM_PATH=/ruta/chromium ONLY=solciju OUT=/tmp/solciju-review node tools/vfx/capture-recent-kits.js
PLAYWRIGHT_MODULE=/ruta/playwright CHROMIUM_PATH=/ruta/chromium MOBILE=1 ONLY=solciju OUT=/tmp/solciju-mobile node tools/vfx/capture-recent-kits.js
```

Para reproducir before usar un checkout separado de la base indicada con el mismo arnés. No asumir persistencia del disco local. PR191–194 y PR166 conservados; Myla caída PR190 y Guerrero PR187 no se regeneraron. El inventario completo del proyecto sigue abierto.

## Cierre remoto verificado

PR195: https://github.com/drmarianojimenez94-sudo/La-Horda/pull/195 (borrador).
Produccion: 6a288654ac71f2b7faa63aeeed3fc6ae37874a82.
Diff remoto verificado: 65 archivos, solo dos de runtime visual; restantes son recetas, arneses y evidencia. Los 65 blobs coinciden con los hashes Git locales. CI aun en curso al cerrar, no se afirma PASS de CI. FIX impide merge aunque termine CI.
Este cierre modifica solo registro y hashes; retomar head actual de PR195. Proximo trabajo: Veyra B226/B227/B228, no otra iteracion de Solciju.
