# NEXT_SESSION — cómo seguir con la beta (actualizado 2026-11-07)

## Qué quedó integrado en esta tanda
- Arte nuevo de campeones + `.webp` sincronizados (CI `webp-sync`) + `ASSET_VER` (rompe caché). (#282)
- **Mago/Thalen**: clave canónica `CHAMP_PACK.mago`, muerte animada (1→4 cuadros), metadata real (42 cuadros). Skins de Ascensión animan ataque/cast. Ult de Myla.
- **Atlas de arte claro**: `docs/art/ATLAS_ARTE.md/.json` (`node tools/art/build-art-atlas.js`, `--check` en CI) + `docs/art/ATLAS_VIGENTE.json`; test `tests/art-runtime-clips.test.js`.
- **Jefes**: Núcleo Micelial, Raíz de Absorción, Morador y Tentáculo del Abismo (0 créditos, pintor).
- **Arenas** (Runway, 48 cr): estatua central y faroles de Ciudad, pentagrama Infernal, templo Acuática, medallón Laberinto, rejilla de lava Fortaleza.
- **Limpieza**: 226 archivos viejos borrados (3,4 MB).
- **Multijugador local (LAN)**: `npm run lan` / `lan.bat` / `lan.sh`, docs en `MULTIJUGADOR_LOCAL.md`.
- **Interfaz**: piso de 14 px, tutoriales por pantalla (`js/ui/screen-tips.js`), guía "Cómo se juega" (7 pestañas), opciones de ayuda.

## Tanda 2 (2026-11-08): retención de la Horda + seguridad
- **Auditoría integral**: 52/100 «preparado para beta pública»; ítems/sets 58, cosméticos 52, retención 45 (informe en la conversación; puntos críticos abajo).
- **Hecho**: reliquias de la Horda (elegir 1 de 3 tras la ronda 3 y cada jefe; `docs/beta-release/HORDA_MEJORAS.md`); probador libre de apariencias + catálogo único (`js/data/cosmetics-catalog.js`) + pestañas Sets/Apariencias separadas; racha diaria sin tiempo jugado ni Brasas; seguridad: lista blanca de eventos de red (`netPlayEvent`) y escape en el lobby (CodeQL net-game.js:232 y net-lobby.js:162); CI: `circuit` en paralelo, atlas regenerado, 6 iconos VFX más chicos.
- **Pendiente (decisión del dueño)**: Pack de bienvenida US$6,99 con 3 guardianes (`server/premium-packs.json`, `championGifts:3`) contradice «Brasas = solo cosméticos»; cosméticos `bp:*` del pase (alas/auras/efectos) sin arte.
- **Puntos críticos restantes de la auditoría**: ranking verificable de la Horda (servidor); carga en frío 14,7 s/17 MB (bundle + caché); cosméticos del pase con arte y precio final; música por arena y ronda; micro-animación de idles de 1 cuadro; empaquetado y legales para tiendas; sinergias de set 2/4/6 con cruces; Rangos de Cicatriz (ascensiones); validar racha en servidor; arte propio para manifestaciones.
- **Riesgos conocidos**: balance de reliquias medido solo con piloto automático (ajustar `firstRound`/`hrelOfferRound` con jugadores reales); el cambio de 6 iconos VFX conviene mirarlo con ojos de arte; CodeQL: 4 alertas restantes son falsos positivos/bajas (`founder-presence.js:44`, `relay.js:136`, `talents.js:104`, `net-game.js:770`).

## Decisiones del propietario (resueltas 2026-11-07)
1. **Revisión independiente**: «Cambio la regla del aprobador humano para siempre» → `reviews/POLITICA.json` (`aprobacionHumana:false`); siguen R1, R2, R4, R5, R6, R7. Cada merge a main necesita un registro `reviews/<rama>.json` (QA, arquitectura, staging en `beta/…`, aprobación) cuyo SHA sea el del contenido; solo el registro puede cambiar después. Seguimiento recomendado: proteger main con checks requeridos y CODEOWNERS sobre `reviews/` (las identidades de los revisores son autodeclaradas).
2. **Pin de Aelith**: actualizado (`reconstruct.py` BASELINE_PINS.registry = `art-source/aelith-recovery-20261102/manifest.json` registry.sha256 = sha256 de `js/champions/ascension/art.js` con la línea de Aelith reemplazada por su original).
3. **Atlas viejo del Mago**: BORRADO (incluido el de Crystal Wars, repuntado a `mago/codex-v1`) y gates de Thalen adaptados sin debilitarlos.
4. **Runway**: seguimos con lo que hay (~22 créditos; no recargar por ahora).
5. **Fondal TV**: NO se toca (función compartida de todos los juegos del estudio). **Modo LAN de compu**: máximo 4 jugadores y una sola cámara alejada en la pantalla de la anfitriona.

## Reliquias de la Horda (retención de la Horda Infinita)
- Decisiones dentro de la partida: tras la ronda 3 y cada jefe/subjefe, 1 de 3 reliquias (24, con etiquetas, rarezas, topes y sinergias). Diseño, tabla, topes y cómo balancear: `HORDA_MEJORAS.md`. Pruebas: `tools/balance/relics_budget.js`, `tools/ux/test-horde-relics.js`, `tools/net-test/relics_coop.js`; workflow `Reliquias de la Horda`.
- Pendiente: tanda con jugadores reales (¿alguna etiqueta domina?, ¿ritmo de ofertas?), y dispositivos reales para el mando y el táctil de la pantalla de elección.

## Seguimiento tras el merge
- Capa de cámara LAN (`js/net/net-lan.js`, `lanCamStep`): confirmar con el otro desarrollador de la cámara local y probar con dos dispositivos reales (lanes/coliseo no deben verse afectados).
- Endurecer el servidor LAN: bind por defecto a todas las interfaces, CORS `*` en `/lan.json`, WebSocket sin allowlist de Origin; tests de path traversal de `resolveStatic`.
- `tools/perf/bump-asset-version.js --check` no verifica nada (sale 0).
- Restos del nombre `candidate-vs-legacy-fallback.png` y el id `mago_codex` en `assets/visual-packages/manifest.v1.json`.

## Arte pendiente (priorizado)
- Campeones con idle de 1 cuadro (25): tanque, guerrero, axiom, musashi, cazadora, nigromante, vesper, nahir, baltra, maura, dariel, orsa, tibor, zahra, renko, sira, khepri, velmira, vhal, bront, oriel, solciju, brakk, morveth, aelith.
- Campeones con arte viejo (9): libertador, ynara, myla, facu_gm, aurelia, saelis, ilsa, vorn, kora (falta cuerpo `codex-v1`).
- Skins/cromas con 1 cuadro (90): ver el atlas. Convergencia (Mago), Legión (Ilkan).
- Enemigos (12 FALTA_ANIMACION, 1 ARTE_VIEJO) y jefes en lámina de 2 poses: golem_cuerpos, minotauro, leviatan, dragon_forja, micelio, ab_carcelero, ab_morador, cm_*, mn_titan, mn_cerbero; madre_espora, cm_cometa. Abismo: ab_devorador, ab_tejedor, ab_errante, ab_acechador, ab_heraldo, ab_jinete, ab_tentaculo. Micelial y Minas: sabueso, infectado, peregrino, hinchado, chaman, mn_*.
- Arenas: ver `docs/beta-release/art-repair/AUDITORIA_ARENAS.md` (vetas/estandartes Fortaleza, props Infernal/Acuática, obeliscos Laberinto, Divina sin pack, suelo Micelial, Abismo piso, casas de Ciudad).
- Lección: el pintor determinista genérico NO mejora al arte actual; hace falta Runway con el Códice o trabajo a mano.

## Verificaciones pendientes (no automatizables acá)
- Dispositivos reales: iPhone/Android, mando físico, WiFi LAN real, firewall Windows.
- Revisión humana del arte de Ilsa/Vorn/Kora y de lo pintado en esta tanda (sin evaluación independiente).
- `circuit` (CI) se cancela a los 10 min en todas las corridas: diagnosticar.
- `tools/ciudad/smoke.js` falla en victoria/resultados_civiles también en main; `test-libro-unico` falla 2 chequeos en main; `t_server_param` falla 1 en main.
- Pase de batalla de 30 días y token de partida del ranking (server/battlepass.js), traducción legal por abogado, build nativo Steam/IAP.

## Probador libre, Sets vs Apariencias y rachas (decisiones del dueño, sesión posterior)
- **Probador libre**: la ficha de cualquier guardián (aunque no lo tengas) abre Sets y Apariencias; probar no equipa ni escribe el guardado (`tools/collection/free-tryon.js`). Catálogo único en `js/data/cosmetics-catalog.js` (solo lee; ids y precios intactos). Las 15 manifestaciones son "Efecto de habilidades" (VER EFECTO lanza la definitiva teñida), ya no skins con sprite prestado.
- **Sets = poder** (se ganan jugando, nunca Brasas) y **Apariencias = identidad** (Brasas/pase/logro/ascensión): pestañas separadas (`tools/collection/sets-vs-looks.js`).
- **Rachas**: sin plantillas por tiempo jugado; racha diaria con hitos 3/7/14 (cofre/título/marco) y congelador semanal ganado jugando (`tools/items/t_quests_streak.js`). El reloj del cliente solo se frena con "último día visto"; **la validación fuerte (día contado por el servidor) falta y va al servidor**.
- Pendiente: precios/ofertas y `server/premium-packs.json` (decisión del dueño); arte propio para las manifestaciones (hoy solo tiñen el efecto); pase de batalla (`bp:*`) aún sin cosméticos del catálogo por guardián.
