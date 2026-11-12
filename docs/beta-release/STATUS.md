# STATUS (2026-11-06, sesión 1, continúa por tarea programada horaria)
- H0 Fase Cero: hecha. main = ef415626.
- Entregado en la rama de trabajo (sin PR, sin evaluación independiente): casas de Ciudad Maldita; alcance de la beta (`BETA_PUBLIC=1`); ranking por ronda personal + orden ronda→puntaje→tiempo (archivo y Postgres real); Brasas solo cosméticos (`PIECES_FOR_BRASAS=false`, doc `docs/economy/BRASAS_SOLO_COSMETICOS.md`).
- PR: #271 parche empujado a su rama; #261 merge con main empujado a su rama; #263 evaluado. Ninguno fusionado a main (falta revisión independiente + CI remoto).
- Créditos Runway: saldo 935; gastados 80 en esta sesión (10 imágenes). Arenas con arte nuevo (candidatas, sin evaluación independiente): Ciudad Maldita (casas), Fábrica Sin Fin, Laberinto, Infernal y Acuática (suelos).
- Pase de batalla listo en backend y cliente (R10/R11, falta arte/precio final) y ranking personal también en el camino persistente. Pendiente: arte de Minas/Abismo/Fúngico/Ruinas/Gélida y campeones, pila PR (#263→#265→#236), builds nativas, QA E2E, roster verificado.
- Automatización real: tarea programada trig_01GuPc2QF4Wuu5XdX7NFKJjb (cada hora, minuto 23, en esta sesión).

- Ejecución 09:23 UTC: #265 evaluado (extracción) y compra segura incorporada; #236 evaluado e incorporado (fix verificado: falla sin él, pasa con él); #241 devuelto con defectos. Disposiciones finales (MERGEADO_Y_VERIFICADO etc.): **0 de 24** — ningún PR se cierra sin revisión independiente y CI remoto.

## Actualización 2026-11-06 (tarde)
- Cuerpos del Códice integrados (candidatos, sin revisión independiente): Guerrero, Tanque, Mago, **Aelith, Morveth** (cromas recoloreando el cuerpo nuevo, sin tocar gates) y atlas más fieles de **Saelis, Aurelia, Maura, Ynara** (#259). Myla excluida (hash aprobado en `check-myla-death`). Capturas en `evidence/guardianes/`.
- Brecha abierta: Libertador (sin PR con cuerpo fiel), Coloso de Ilkan (procedural).

## Actualización 2026-11-06 (noche)
- Integrados además: **Coloso de Ilkan** (espíritu de arena pintado), **Libertador** completo (a pie, combate, caballo, caída; revisión independiente con condiciones atendidas), **Myla** (maestro #259, croma y caída), **Profeta** (repintada), y **#90** (Ilsa/Vorn/Kora, TESTING). Auditoría visual de los 43: el resto está a ≈80 % o más del Códice.
- Saldo Runway: **238 créditos** (por debajo del umbral de 250 de la tarea programada: las ejecuciones programadas NO deben gastar hasta que el propietario cargue más). Gasto de la jornada ≈ 500 créditos, todos registrados en `ART_CREDITS.md` (incluye ≈ 100 en intentos fallidos `BAD_OUTPUT`, que se cobran).

### Ejecución programada 15:18 UTC
- Saldo Runway 238 (<250): no se gastó. Regla de economía reverificada sobre la rama (`PIECES_FOR_BRASAS=false`): `server/test-wallet.js` 65/65, `test-wallet-pieces.js` 35/35, `tools/items/t_piezas_brasas.js` y `t_skins_brasas.js` PASS.

### Idiomas ES · EN · PT (nuevo)
- Selector en pantalla de título, botón en el hub y lista en Opciones; persistencia + `?lang=`. Traductor en caliente (`js/i18n/i18n.js`), diccionarios generados (`tools/i18n/build.py`), CI `i18n.yml` (prueba funcional + cobertura ≥97 % en EN y PT sobre un recorrido de 1.205 textos de interfaz: EN 100 %, PT ≈99 %).
- **Pendiente (Fase 2)**: talentos, Códice/lore de jefes y enemigos, historia, misiones, bendiciones, textos de servidor y páginas legales siguen en español (fallback). Detalle en `docs/i18n/README.md`.

### Estado al 2026-11-07 (ejecución programada 02:23 UTC)
- Evaluaciones independientes de diseño: 71 → 75 → **76/100** (objetivo 85). Informes: `EVALUACION_DISENO*.md`, `UX_EQUIPO_*.md`.
- Hecho: idiomas ES/EN/PT con diccionarios de ~11.9k entradas; título rediseñado (5 héroes vs. jefe de hielo, CTA apilado, fondo de toda La Horda); pausa/opciones/hub simplificados sin quitar opciones.
- Bloqueo real: `compare-icons` fija «43 campeones, 301 íconos»; la rama tiene 46 (Ilsa, Vorn, Kora de #90). Actualizar ese número del gate requiere aprobación humana.
- Sin merge a `main`: falta puntaje ≥85, CI verde y decisión del propietario. Runway sigue <250 créditos: sin gasto.

### Ejecución programada 20:23 UTC (2026-11-10)
- PR #288 fusionada en `main` (eb0d0578) con revisión independiente (QA, arquitectura, integrador; reservas en `reviews/`). Rama de trabajo rehecha desde `main`.
- Flake `t_identity` BOS corregido en la prueba (causa dentro del test: `bossStrikes` pendientes; no se vio bug de juego; 10/10 corridas locales, sin log archivado); queda la firma INF y falta nombrar el emisor del golpe. Runway sin gasto (saldo <250).

### Ronda 2026-11-11 (autorizada por el dueño)
- Códice a WebP (−79 MB), paquete de escritorio sin PNG con gemelo WebP (210 → 152 MB), recorrido de tienda/Códice sin 404 (`desktop/test-stage.mjs`).
- i18n lote 376 (botones de compra con Brasas por patrón y restos visibles).
- **Pack de bienvenida sin campeones** (decisión del dueño): `brasas_bienvenida_v2` = 500 + 400 Brasas por US$ 6,99, solo apariencias; el pack original queda `retired` (no se vende; los pagos pendientes se acreditan y quien ya lo compró conserva sus 3 elecciones). `server/test-wallet.js` 67/67.
- **Guardado en la nube**: si `accountApplyCloud` falla al aplicar, ya no adelanta la versión: conserva lo local, marca `acct.needPull` y reintenta con espera creciente (`tools/regression/t_save_resilience.js` [G]).
- Runway: `creditBalance` = 2 (no alcanza para generar; 1 imagen = 8). Sin gasto.

- i18n lote 377 (2026-11-11): tooltips de talentos con «Sinergias» (cabeza «Nombre — descripción» + líneas de sinergia, formas «cada punto da» y «por punto en A, B y C») por patrones recursivos + 16 nombres de talentos; prueba en `tools/i18n/test-i18n.js`. Quedan nombres de piezas generadas y claves internas de enemigos sin traducir.

### Paquete de instrucciones de Runway (2026-11-12)
- `docs/art-brief/runway-pack/`: README con el prompt maestro, `RECETA.md` (método con referencias @codex/@pose, criterio de aceptación, reducción determinista, gates), `POSES_CAMPEON.md` (36 poses y movimiento), `ENEMIGOS_GUIA.md`, 46 fichas de campeón con sus 36 prompts, 104 criaturas en 12 arenas con 9 estados cada una, los 731 bloques / 1.244 items de la cola con descripción, método y prompt, y `COSTOS.md` (≈ 959 imágenes: ≈ 7.700 créditos si todo sale a la primera, ≈ 19.000 con reintentos razonables; saldo actual 2).
- Generado por `python3 tools/art/build-runway-pack.py` desde `node tools/art/dump-game-data.js`; cobertura y sincronía verificadas por `python3 tools/art/test-runway-pack.py` (CI: `art-production-evidence.yml`). Nuevo `tools/art/pose-ref.py` recorta el cuadro actual de un atlas como `@pose`.
- NO verificado: que Runway devuelva cada pose con la calidad pedida (hay descartes registrados); el paquete ordena el método y el gasto, no garantiza el resultado.
- **Mergeado en `main` (PR #296, a27c48b7)** con revisión independiente sellada a 878f57ed y 15/15 checks en verde. Unificación del 2026-11-12: cada enemigo/jefe sin atlas propio tiene un «Paso 0» (diseño con Runway, `tools/art-world/runway-design.js`) y la cadena `gen_sheet` → `install` → `walk_batch`; ilsa, kora y vorn tienen Paso 0 para crear su lámina del Códice; sin tope de créditos por decisión del dueño (2026-11-12). Costos recalculados (8 cr/imagen, 5 cr/hoja de enemigo; ×2,5 es supuesto). Saldo de Runway al 2026-11-12: 0–2 créditos: no se generó nada.
