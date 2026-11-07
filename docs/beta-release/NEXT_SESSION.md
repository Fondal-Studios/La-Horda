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

## Decisiones pendientes del propietario
1. **Atlas legacy del Mago** (`assets/sprites/champions/mago/atlas.png`, ~2 MB) sigue como respaldo (`MAGO_IMG`): quitarlo exige adaptar `check-thalen-codex-consumer.js` y `roster-loading-test.js` (se parece a relajar gates). ¿Autorizás?
2. **Runway**: saldo ~22 créditos. Los enemigos necesitan hojas con cuadros reales (no cuadros sueltos); estimar ~8 cr por imagen y varias imágenes por enemigo. ¿Recargar?
3. Fondal TV en páginas LAN: `js/net/fondal-tv.js` intenta bajar el script de la nube; ¿cortar la llamada?

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
