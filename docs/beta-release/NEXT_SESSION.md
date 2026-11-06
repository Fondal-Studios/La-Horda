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
