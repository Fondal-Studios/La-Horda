# NEXT SESSION
1. Revisión independiente (otro agente, sin ver mi veredicto) de `patches/pr271-repair-*.patch`; aplicarlo sobre `fix/campaign-start-visible` (requiere permiso de push a esa rama) y dejar correr CI.
2. Ciclo #236 (merge limpio; correr `tools/regression/t_hielo_enemy_lifecycle.js`).
3. Pila UI #261→#263→#265. Luego H2 (ocultar Cristales/Coliseo), H3 (ranking personal), H4 (pase).
Entorno: `cd server && npm ci`; Playwright en /opt/pw-browsers; Runway saldo 15 (no gastar).
Prompt: "Continuá la Operación Beta Pública de La Horda desde docs/beta-release/NEXT_SESSION.md".
Sin automatización en segundo plano.

## Arte: casas de Ciudad Maldita (pedido del propietario: que parezca un pueblo)
Hoy `js/arenas/ciudad/cm-render.js` dibuja casas con rectángulos + textura `tex_techo` repetida (techo ~l.338-362; casas lejanas ~l.80-108). Referencia: `assets/ui/codex/arenas/ciudad.jpg`.
Pipeline propuesto (no hecho): 1) generar 6-8 fachadas variadas con `node tools/art-world/runway-world.js gen <id>` (agregar prompts en JOBS; solo vista frontal oblicua; ~8 cr c/u ≈ 64 cr) · 2) quitar verde croma, reducir a escala nativa (2 u/px, ≤250 tonos) · 3) dibujar la fachada/techo por edificio en vez de `_cmFillPat` conservando colisión y fundido de techo · 4) prueba en renderer real (móvil/escritorio) + evaluador independiente 85/100 · 5) PR mínimo. Backlog relacionado: B061 (techos), B062 (Refugio/Capilla/Torre/Campanario), CM-T02 (pared con ventanas/puerta).

## Plan de arte por arena (tras ver `evidence/arenas-antes-10.png`, capturas del renderer real; script `tools/art-world/shot-arenas.js <base-url> <prefijo>`)
Proceso por arena (el mismo de Ciudad Maldita): referencia = portada del Códice `assets/ui/codex/arenas/<arena>.jpg` → `tools/art-world/runway-world.js` (agregar prompts en JOBS; ~8 créditos por imagen) → reducir a 96 px con costura continua y ≤64 tonos → reemplazar la textura `assets/vfx/<arena>/tex_*.png` (+ .webp sin pérdida) → captura antes/después → `tools/art/pixel-density.js --strict` + humo de la arena → registrar en ART_CREDITS.md.
Orden por necesidad visual (a ojo, sin evaluación independiente todavía):
1. **Fábrica Sin Fin (fortaleza)**: suelo plano y oscuro, casi sin identidad industrial → suelo de chapa/rejilla, tuberías, cintas.
2. **Laberinto**: piso liso con un solo círculo → losas de piedra dorada, muros con jeroglíficos.
3. **Minas Profundas**: escasas formaciones → vetas de cristal, rieles, madera de apuntalamiento.
4. **Abismo**: solo anillo sobre negro → plataformas de piedra con grietas y fondo de vacío con detalles.
5. **Reino Fúngico, Infernal, Acuática**: revisar detalle de suelo/bordes.
6. **Ruinas Célticas y Gélida**: ya tienen arte del Códice (PR #244/#245); solo revisar densidad.
Después: campeones (backlog `docs/production/asset-blocks.json`: B002–B006 cuerpos pendientes, B007–B049 definitivas, B056–B092 jefes/élites/enemigos) siguiendo el contrato de `tools/factory/cli.js` y los gates de AGENTS.md. Nada de esto está aprobado por evaluador independiente.

**Hecho en ejecución 06:23 UTC:** arena 02 Fábrica Sin Fin (suelos pintados). Siguiente en la lista: 2. Laberinto, 3. Minas, 4. Abismo, 5. Fúngico/Infernal/Acuática. Saldo 959. Pendiente además: pila PR (#263→#265→#236), token de partida, pase de batalla.

**Hecho también (06:23 UTC):** pisos de Laberinto, Infernal y Acuática (mecanismo `FLOOR_PAINTED` en arena.js: para otra arena basta agregar su entrada y `assets/vfx/<arena>/tex_piso.png`). Siguiente: Minas, Abismo, Fúngico (revisar si usan `buildFloorTile` o render propio), Ruinas/Gélida (densidad), luego muros/props y campeones. Antes de integrar a main: correr `tools/regression` (NOT RUN) y revisión independiente.
