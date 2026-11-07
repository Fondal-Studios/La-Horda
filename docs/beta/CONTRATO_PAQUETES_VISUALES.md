# Contrato VisualPackage v1 — integración funcional vs. producción visual

**Límite:** la fábrica de arte produce y aprueba apariencias; la integración las carga y las usa. Este contrato es la
única superficie compartida. Cambiar un paquete *compatible* no exige tocar combate, balance, colisiones, progreso ni red.

## Piezas
- `assets/visual-packages/manifest.v1.json` — **derivado** de las 103 registraciones reales `champPackLoadAtlas(key, src, meta)`
  (`node tools/visual-package/cli.js build --write`). Describe, no impone: respeta `w/h/cols/sets/anchor/refH/fix/footX` de cada atlas
  (incluido el espejo por complemento: cuadro negativo `~f`). Paquetes legacy: `timings` y `attachmentPoints` en `null` (no declarados).
- `assets/visual-packages/candidates.v1.json` — candidatos pendientes (hoy **vacío**: ninguna apariencia nueva activa).
- `tools/visual-package/cli.js check` — manifiesto = registraciones actuales; sha256 y dimensiones; cuadros dentro de capacidad;
  y para candidatos (estricto): `packageVersion` semver, `champion/skin`, `timings` por estado, `attachmentPoints{weapon,fx}`
  (null explícito si no aplica), direcciones down/up/side, `fallback` = paquete integrado.
- `js/assets/visual-packages.js` — activa un candidato **solo** si `activation.enabled`, `visualApproval=approved` y
  `technicalValidation=pass`; precarga aparte, verifica dimensiones y, si falla, conserva el integrado y lo registra en
  `VisualPackages.log` / `VisualPackages.report()` (el respaldo no oculta errores). Selección, Códice, vista previa y partida leen `CHAMP_PACK[key]`, por lo que reciben el reemplazo sin cambios.

## Ciclo de vida (campo `lifecycle`)
`generated` → `technicalValidation` → `visualApproval` (exige `review{reviewer,evidence}`) → `integrated` → `inGameVerification`.
Generado ≠ validado ≠ aprobado ≠ integrado ≠ verificado en partida; el validador rechaza saltarse etapas.

## Incorporar un paquete tardío
1. La fábrica entrega atlas + entrada de candidato (estricta) con hashes. 2. `cli.js check` y `node tools/visual-package/test.js`.
3. Revisión visual comparada (misma cámara/escala/fondo) → `approved` con evidencia. 4. `activation.enabled=true` en una PR propia.
5. Repetir: roster-loading-test, test de selección/Códice, `qa.js --fast`. **Si cambia el contrato** (campos, versión), es una integración nueva, no un reemplazo de imagen.
6. Rollback: `activation.enabled=false` (o quitar la entrada); el integrado nunca se borra mientras haya candidato.
