# B635 — Brasa, Calderera de las Profundidades

2026-10-19. Primera de cinco skins adicionales del ciclo Q5. Campeón existente: `brasa`; cosmético nuevo: `brasa_abisal`. No cuenta como campeón nuevo. Rama `chatgpt/brasa-abyssal-skin-20261019`.

## Estado verificable

Implementada y probada localmente. Pendiente CI y merge; no declarada publicada. Revisión visual asistida por Codex del fuente, atlas y captura del renderer real: identidad conservada, atuendo y mochila diferentes, proporción y contorno coherentes. No es una aprobación humana inventada ni estado INTEGRADO_CLAUDE.

Fuente original generado con imagegen, transparencia real, sin donantes ni recolor. SHA-256 `86e6992a4c7e078e3ab8b0a074dca0361375f6c5d0445036ba01a080c2b1c3dd`. Importado con `tools/factory/import-authored-sheet.py`; manifiesto e informe preservados. Atlas 448×1008, 36 poses; frente/perfil/espalda, izquierda por espejo. Caminar y atacar tienen secuencias direccionales; cast/ultimate/hit/death comparten poses frontales según el contrato existente. Sonido y VFX originales de Brasa se reutilizan explícitamente.

## Pruebas locales

- Fábrica: 36 poses; alpha binaria, cero halos, cero fragmentos. Style Gate PASS.
- Roster Gate: 137 apariencias, cero errores de escala o presentación.
- Todas las skins: 5917 comprobaciones, cero fallos/errores JS.
- Tienda: 29 comprobaciones; catálogo 267 ítems, 43 campeones, 78 apariencias.
- `node tools/art/test-brasa-abyssal.js`: 12 controles de compra/equipamiento/guardado/carga remota/anims/estadísticas/progreso, todos aprobados; detector canónico de densidad sobre los 36 frames sin excepciones.
- Estas pruebas usan guardados aislados, nunca cuentas/billeteras reales. Sin cambios al kit, talentos ni maestría.

## Reproducción

```sh
python tools/factory/import-authored-sheet.py art-source/entregas/bloques/B635_brasa_abisal/fuentes/importacion.json /tmp/brasa-import
cmp /tmp/brasa-import/atlas.png assets/sprites/champions/brasa/skins/brasa_abisal/atlas.png
python tools/art/painter/style_gate.py assets/sprites/champions/brasa/skins/brasa_abisal/atlas.png
# Servir raíz del repo y configurar SE_BASE_URL, ROSTER_BASE_URL, NODE_PATH y CHROMIUM_PATH según entorno.
node tools/art/roster_gate.js
node tools/art/unique_skins/check.js
node tools/collection/shop-pricing-browser.js
node tools/art/test-brasa-abyssal.js
```

## Próximo paso

La prueba real de dos clientes ya pasó (7 controles, skin del host y del invitado visible en ambos renderers, habilidades funcionales, catálogo del servidor). Pendiente CI y validación del despliegue. Las otras cuatro skins adicionales siguen pendientes; no abrir otros cinco campeones para ocultar esta deuda. El lote Q5 original ya está en main y su despliegue Fondal fue comprobado el 2026-10-19 (evidencia en PR #146).

Revalidado después de integrar main `7b6b67c4` (PR #147) y las correcciones de #146. Workflow `brasa-abyssal.yml` reproduce la importación, valida todos los cosméticos y ejecuta la prueba de dos clientes.
