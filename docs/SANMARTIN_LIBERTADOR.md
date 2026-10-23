# El Libertador (José de San Martín)

Campeón completo agregado sin tocar el kit de los demás. Este documento es la referencia técnica: dónde vive cada
cosa, cómo se mapean las animaciones, qué sonidos se usan, qué arte falta y cómo se prueba.

> Este archivo reemplaza a `docs/SANMARTIN_EREN.md`, que documentaba además a un segundo campeón. Ese campeón fue
> reemplazado por **Ilkan**, un personaje original: ver `docs/ILKAN_REWORK.md` (diseño, qué cambió, migración,
> pruebas y referencia técnica). Las partes compartidas (`champ-shared.js`, `champion-tuning.js`) siguen siendo comunes.

## Archivos

| Qué | Dónde |
|---|---|
| Balance (TODOS los números de sus habilidades) | `js/data/champion-tuning.js` (`SM_CFG`) |
| Datos de clase (stats, botones, cooldowns, textos) | `js/data/champions.js` (`CLASSES.libertador`) |
| Lógica (básico, habilidades, pasiva, IA, dibujo, HUD) | `js/champions/libertador.js` |
| Piezas comunes (efectos de mundo `champFx`, reglas por rango, ganchos de stats) | `js/champions/champ-shared.js` |
| Talentos y maestrías | `js/data/talent-trees.js` (`TALENT_TREES.libertador`) |
| Arte fuente / recorte / atlas | `art-source/redraw/libertador.png`, `tools/art/redraw/{sheets_se,build_se}.py` |
| Arte en juego | `assets/sprites/champions/libertador/v2/` (`atlas.png`, `horse.png`, `fx/*.png`) |
| Pruebas | `tools/regression/t_champs_se.js` (SM 1-13, equipo, bots), `tools/net-test/champs_se.js` (cooperativo) |

### Enganches al motor (los únicos puntos tocados fuera de sus archivos)

- `castAbility` (`js/skills/abilities.js`): los `kind` nuevos derivan a `libertadorCast`. `triggerBasic` deriva a
  `libertadorBasic`. `useSkill`/`useUltimate`: bloqueos y ganchos por campeón.
- `js/systems/combat.js`: multiplicadores de daño hecho/recibido (`heroDmgOutMult`, `heroDmgTakenMult`,
  `enemyVulnMult`), muerte evitada (`heroPreventDeath`, Soldado Cabral).
- `js/core/update.js` y `js/ai/allies.js`: velocidad (`heroSpeedMult`, que también bloquea el movimiento durante
  embestidas/cinemáticas), `updateChampExtras` por héroe y `updateChampFx`.
- IA: `botTryAbilities` deriva a `botLibertador` (no se usa como rival de la Arena Divina: `noDivinaFoe`).
- Red: `champFx` está en `NET_COLLS`; todo el estado vive en el héroe y viaja solo en el snapshot. El invitado pide
  las definitivas con los mensajes de intención de siempre (`cast`, `ult`).

Para rebalancear: tocar solo `champion-tuning.js` (y los cooldowns/costos en `champions.js`).

## Decisiones técnicas

- **Granaderos espectrales / jinetes del Cruce** = VFX sin IA ni colisión; el daño es UNA zona lógica.
- **Cordillera** = siluetas en los bordes de la pantalla (vista cenital, sin horizonte).
- **Reglas por rango** (`seKnock`): comunes se desplazan; élite/subélite tambalean (aturdimiento corto);
  jefes/subjefes NUNCA se desplazan (reciben daño y defensa rota).
- **Sin zoom de cámara**: la cámara del juego tiene zoom fijo y cambiarlo rompe la escala acordada en todas las
  pantallas (ver `t_camera.js`).

## Mapeo de animaciones — `CHAMP_PACK.libertador` (a pie)

| Estado | Set | Cuadros |
|---|---|---|
| quieto | `idle_down` / `idle_side` / `idle_up` | 4 / 1 / 1 |
| caminar | `walk_down` / `walk_side` / `walk_up` | 4 c/u |
| disparo (Fusil) | `fire` (+ retroceso de `SM_CFG.musket.recoilPx`) | 4 |
| recarga visible | `reload` (avanza con el enfriamiento del básico) | 6 |
| Bayoneta | `bayo_pre` → `bayo_emb` (embestida) → `bayo_imp` (impacto) / `bayo_rem` (remate con poca vida) | 4 c/u |
| ¡Granaderos! | `command` | 5 |
| Soldado Cabral | `cabral` | 5 |
| Cruce (levantar el sable) | `ult_cast` | 1 |

`CHAMP_PACK.libertador_horse` (misma escala de píxel): `mount` 4, `charge` 5, `dismount` 4, `m_idle` 1, `m_atk` 3
(sable corvo), `m_run` 3.

## Audio

Sintetizado en `js/audio/audio.js` (WebAudio, sin archivos): `musket`, `musketOfficer`, `blade`, `bugle` (clarín),
`gallop`; además se reutilizan `boom`, `bigKill`, `shield`. **Faltan grabaciones reales** (se pueden reemplazar sin
tocar la lógica): disparo de fusil de chispa, clarín de caballería, relincho/galope.

## Arte faltante (no se inventó)

- San Martín: sin cuadros de **golpe recibido** ni de **muerte** en la hoja (usa el destello de daño genérico y la
  caída genérica). El caballo solo tiene vista **lateral** (hacia arriba/abajo se dibuja el lateral).
- Los FX espectrales (granaderos fantasma, escarcha) estaban pintados semitransparentes sobre el damero: se limpió el
  gris (`ghost_clean` en `build_se.py`), sin agregar píxeles.

## Pruebas

```bash
python3 -m http.server 8771 &                                   # desde la raíz
node tools/regression/t_champs_se.js /tmp/se_out                # chequeos + capturas
(cd server && PORT=8799 node relay.js &) ; node tools/net-test/champs_se.js   # cooperativo
```

Nota: los muñecos de prueba del Bosque se regeneran (regla de la arena), por eso la suite mide el daño acumulado
(`e.__dmg`) en vez de la vida.
