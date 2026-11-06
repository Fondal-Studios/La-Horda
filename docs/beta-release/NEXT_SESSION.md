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

**Hecho (07:23 UTC):** ranking personal en el camino persistente; `server/battlepass.js` + test (archivo y Postgres). Siguiente: UI de cliente del pase (pestaña en el hub: nivel, ruta free/premium, desafíos, reclamar con `requestId`), luego arte restante y pila de PR. Para Postgres local: `su postgres -c "pg_ctl -D /var/tmp/horda-pgtest/data -o '-p 54329 -c listen_addresses=127.0.0.1 -k /var/tmp/horda-pgtest' start"` y `HORDA_TEST_PG_URL=postgres://postgres@127.0.0.1:54329/<db horda_test_*>`.

**Hecho (08:23 UTC):** UI del pase de batalla (botón 🎖 en la barra superior del hub) con test de punta a punta. Siguiente: arte de Minas/Abismo/Fúngico/Ruinas/Gélida y campeones (Runway, saldo 935), pila de PR (#263→#265→#236), luego QA E2E de ambos modos y builds. Recordar: correr la suite completa del servidor y los tests de UI ANTES de empujar.

**Hecho (09:23 UTC):** #265 evaluado y extraída la compra segura (referencia pendiente). Hallazgo: Minas ya tiene textura de tierra por zona (6) y es funcional → sin gasto. **Límite honesto:** `gen4_image` produce imágenes sueltas; los campeones necesitan cuadros de animación coherentes (lanzamientos, definitivas, caídas, backlog B002–B049), que NO se obtienen bien con esa herramienta: usar el pipeline del repo (`tools/art/painter`, `tools/factory/cli.js`, donantes/atlas) con revisión humana de arte. Siguiente: #263/#261 integrables a la espera de revisión independiente; #236; arte de Abismo/Fúngico; QA E2E de ambos modos.

**Hecho también (09:23):** #236 evaluado e incorporado (fix + tests). Cola de PR restante: #263/#261 (integrables, esperan revisión independiente), #265 (decidir implementación de la ficha de apariencia), #241 (rechazado por QA --fast en integration/beta: 4 regresiones, reparar), #267/#270 (arte, evaluador artístico), #232 (conflictos), #259/#253/#252/#254/#255/#249/#250 (extraer), #256/#257/#268/#231 (bloqueados/NO_INTEGRAR), #92/#246 (archivar), #90/#239 (extraer).

**Hecho (10:23):** batería de red ejecutada y registrada (ver QA_EVIDENCE.md). Prioridad nueva alta: diagnosticar `e2e.js 1` (solitario) y `campaign-gate.js` (fallan igual en main) y el flaky de `e2e.js 4`. Abismo: regeneración rechazada (ver ART_CREDITS.md).

## Arte de guardianes — método (pedido del propietario: pintor ↔ evaluador, sin cancelar)
Orden: Guerrero ✅ → Tanque → Aelith → Morveth (los tres siguen solo en #241: extraer cada uno y correr `t_cromas`, `browser-collection`, `coliseum/flow`, `lanes/test-sides`, su `check-*`, `roster-loading-test`; el que rompa cromas se devuelve al pintor con la causa: las cromas derivan del atlas viejo) → Mago (más simple que el Códice) → Coloso de Ilkan (procedural; sin Códice del Coloso: pedir/generar concepto) → skins y cromas → jefes y enemigos → arenas (decorado y sprites dibujados). Cada bloque aceptado: captura antes/después en `evidence/guardianes/` y enviarla al propietario. Si un bloque no pasa: el evaluador escribe defectos concretos y el pintor reintenta (máx. 3), luego cambia de estrategia.
Herramienta del pintor: `node tools/art-world/runway-guardian.js <guardián> <intento> "<prompt con @codex y @pose>" <codex.png> [pose.png]` (8 cr por imagen; el pintor genera estático de alta fidelidad: sirve para conceptos y cuadros sueltos, no para animar un atlas completo).

**Bloques de guardianes aceptados:** Guerrero (#241), Mago (#270). Siguiente: Tanque, Aelith, Morveth (de #241, uno por uno; vigilar cromas), Aelith también tiene #267 (lanzamiento de espalda), luego Coloso de Ilkan.

**Bloques de guardianes aceptados:** Guerrero, Mago, Tanque. **Devueltos:** Aelith y Morveth (arreglar `js/systems/cromas.js` para recolorear el atlas del cuerpo nuevo; instrucción exacta en RESULTADOS_PR.md). Luego: Aelith #267 (lanzamiento de espalda), Coloso de Ilkan, skins/cromas, jefes y enemigos, arenas. `tools/art-world/try-codex-body.sh <champ> <puerto> <salida>` evalúa un cuerpo; correr de a uno (en paralelo dan falsos fallos).

**Intento 1 de reparación de cromas (Aelith/Morveth): fallido** — ver RESULTADOS_PR.md. Requiere decisión de revisión independiente sobre el contrato `REGISTRO.grilla_segun_contrato_propio_o_croma`. Mientras tanto seguir con: Coloso de Ilkan, #267 (Aelith lanzamiento), jefes y enemigos, arenas.

**Enemigos/jefes (11:42):** auditoría objetiva hecha (ver INVENTARIO_ARTE.md): 36 de 104 con caminata ≤2 cuadros; jefes con 8/11 estados clonados. Siguiente en arte: elegir 1 jefe (Minotauro o Leviatán) y producir cuadros de caminata/estados con el pipeline de fábrica (no `gen4_image` para secuencias); Titán de Piedra: evaluar recolor de paleta al Códice.

**Habilidades de campeones (otra sesión lleva enemigos):** ability-gate 43/43 PASS (mecánica). Galería real `tools/art-world/ability-gallery.js <salida> <a,b,c>` (ABILITY_ARENA=fortaleza). Revisados Ilkan, Guerrero, Mago, Tanque: sin defectos. Siguiente: correr la galería para los 39 restantes (lotes de 3-4 por corrida, ~1 min c/u), anotar defectos concretos con captura y devolverlos al pintor; luego Coloso de Ilkan, #267 y skins/cromas. Ver INVENTARIO_KITS_HABILIDADES.md (checkpoints de kits desactualizados).

**Galería de habilidades (12:26):** 12 guardianes más revisados, sin roturas; flag de legibilidad en Axiom (definitiva). La corrida en segundo plano sigue con el resto (si la sesión se reinició: `ABILITY_ARENA=fortaleza node tools/art-world/ability-gallery.js <salida> a,b,c` y `python3 tools/art-world/ability-sheets.py <salida>`).

**Aplicado (12:5x):** Plaga del Nigromante rehecha en pixel art nativo. Pendiente: la vista previa del Códice del Nigromante aún usa `nigroPlagueBurst` (imagen pintada); revisar la definitiva «Encarnación del Abismo» si el propietario también la quiere cambiar; seguir la galería con el resto de guardianes.

**Habilidades (13:0x):** inventario de efectos pintados hecho (`INVENTARIO_FX_PINTADOS.md`): 27 usos en 8 guardianes; sin otro caso tan malo como la Plaga. Siguiente: revisar a ojo las 18 hojas pendientes (Nahir…Zahra), luego decidir con el director de arte: definitivas que aclaran el fondo (Axiom, Libertador), sustituir `cadena-relampagos` por un haz SFA (5 guardianes), Coloso de Ilkan.

## Siguiente (2026-11-06 tarde)
1. Extraer cuerpos de campeones de #232 (Art Engine) y #90 (Ilsa/Vorn/Kora) de a uno con `tools/art-world/try-codex-body.sh` + `check-codex-body.js` (secuencial).
2. Libertador: decidir con el propietario (hoja de referencia con Runway para artista, ≤60 créditos). Myla: decisión independiente sobre el hash del gate.
3. Revisión independiente y CI remoto de #261/#263/#236/#241-parcial; #265 necesita decisión de diseño.

## Actualización (noche 2026-11-06)
- Barrido de PR con cuerpos de campeones COMPLETO (ver RESULTADOS_PR): integrados Guerrero, Tanque, Mago, Aelith, Morveth, Saelis, Aurelia, Maura, Ynara y Myla (con revisión independiente y prueba de fidelidad nueva). #90 (Ilsa/Vorn/Kora) = campeones nuevos, fuera de la beta.
- Libertador: hoja de referencia + atlas candidato en `art-source/runway-guardians/libertador/` (24 créditos gastados de 60 autorizados; quedan 36 para las poses de bayoneta/ultimate/montado). Saldo Runway ≈ 710.
- Pendiente de arte de guardianes: poses propias de Libertador, croma `myla_arandanos` y caída de Myla contra el nuevo master, Coloso de Ilkan.
