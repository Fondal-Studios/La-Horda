# Arte unificado de habilidades — Pintor → Evaluador → Arquitecto

Circuito para pintar los efectos de suelo de las habilidades de los guardianes (anillos, conos, zonas vivas, rayos) con **un solo
lenguaje de pixel art** (canon en `canon.py`, ver `docs/ART_BIBLE.md` §16) y decidir con números si la mejora entra al juego.

```
        ┌────────────── instrucciones (JSON + prosa) ──────────────┐
        ▼                                                           │
   PINTOR ──cuadros──▶ EVALUADOR ──FAIL──────────────────────────────┘
 (painter.py)         (evaluator.py)   ESCALADA tras 6 rondas o sin perillas → REDRAW REQUIRED (no se integra)
                           │ PASS (≥85, sin fallos duros, mejora ≥ +6 y sin regresión de riqueza/cobertura)
                           ▼
                      ARQUITECTO ──▶ js/champions/vfx-unified/*.js + index.html ──▶ prueba de humo en el motor real
                      (architect.py)                                                 (falla ⇒ revierte todo)
```

## Uso

```sh
python3 -m http.server 8750 &                                   # juego servido
# 1) línea base: arte ACTUAL del motor real (para medir la mejora)
node tools/art/ability-art/capture-baseline.js tools/art/ability-art/specs/vesper.json docs/art-gate/ability-art/vesper/baseline
# 2) lazo completo (pinta, evalúa, reintenta, integra lo aprobado)
python3 tools/art/ability-art/pipeline.py run tools/art/ability-art/specs/vesper.json   # --no-integrate para solo evaluar
# 3) verificación reproducible, sin navegador (la corre el CI)
python3 tools/art/ability-art/pipeline.py check tools/art/ability-art/specs/vesper.json
python3 -m unittest tools/art/ability-art/test_ability_art.py
# 4) antes/después en partida (hojas en docs/art-gate/ability-art/<guardián>/ingame)
node tools/art/ability-art/capture-ingame.js vesper docs/art-gate/ability-art/vesper/ingame bosque
```

`?ua=0` en la URL del juego vuelve al arte anterior (comparaciones A/B); `?kvb=0` apaga todos los efectos propios.

## Agregar un guardián

1. Copiar `specs/vesper.json`: `palette` (rampa de 5 tonos del guardián, la misma de su `vfx-b/*.js` o `skill-fx-a/c/*.js`),
   y una entrada por decal/rayo que hoy dibuja (`replaces` = nombre en `KVB_DEC`/`KVB_BEAM`, `baseline`/`baseline_beam` = el mismo,
   `radius` = radio real del kit, `glyph` = su sello: `star diamond cross ring bolt drop eye rune stitch scissors needle flame`).
2. Capturar la línea base y correr el lazo. Revisar las hojas de `round-NN/` y `INSTRUCCIONES_PINTOR.md`.
3. Una habilidad ESCALADA no se integra: queda documentada para repintado humano (`docs/ART_REPLACEMENT_QUEUE.md`).

## Qué mide el Evaluador (100 puntos)

técnica 20 (alfa 0/255 · paleta de la rampa · higiene de píxel) · borde en el radio real 15 · legibilidad 25 (cobertura · contraste
sobre las 13 arenas · suelo despejado, techo 45 % del centro) · movimiento 15 (pico, disipación limpia, sin parpadeo) · riqueza
visual 15 · identidad y distinción entre las habilidades del mismo guardián 10. Fallos duros: alfa suave, centro tapado, cobertura
excesiva, paleta ajena, borde que no llega al radio, animación estática.

**Límites (honestos):** el puntaje mide contrato técnico y legibilidad, no belleza. No sustituye la revisión visual humana
(`docs/ART_BIBLE.md` §8) ni los gates de rendimiento y multijugador. Solo cubre decales y rayos de suelo; los motivos pequeños
(partículas), auras, íconos y sprites de personaje quedan fuera de este circuito. No toca daño, alcance, duración ni hitboxes.
