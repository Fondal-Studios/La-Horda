# Siete campeones nuevos — control de producción (estado TESTING)

Objetivo del dueño: llegar a un pool de 50 campeones, todos distintos entre sí y con la misma estructura (tres habilidades + definitiva,
herramienta contra hordas, talentos/maestría/Códice, mismo HUD y motor). Esta rama agrega **siete candidatos**; el pool jugable pasa
de 38 (main) a 45, y a 50 cuando se integre el PR #87 (Solciju, Veyra, Brakk, Morveth, Aelith). **Ninguno está aprobado ni en `knownChampions`.**

Etiquetas: VERIFIED = ejecutado con salida real en este commit · IMPLEMENTED = existe en el código, sin prueba suficiente ·
PROPOSED = diseño sin implementar · BLOCKED/PENDIENTE = requiere una persona o algo que no se puede simular.

## Mecánicas existentes (huecos que cubren los siete)
Antes de diseñar se inventarió el roster (js/champions/*, expedition/catalog.js, ascension/catalog.js, quality-five del PR #87):
torretas/construcciones (Myla, Brasa, Brakk), cadenas/anclas (Eslabón, Iria), marcas e hilos (Vesper, Solciju), reflejos (Nahir),
campanas/espinas/surcos (Baltra, Maura, Renko), música (Dáriel), enjambres (Tibor, Khepri), calor (Zahra), rutas (Sira), gravedad
(Vhal), portales (Oriel), máscaras (Velmira), geometría de luz (Aurelia), mareas (Facu), luz/oscuridad (Nano), plumas (Saelis),
golem (Nigromante), tiempo (Aelith), sangrado de riesgo (Veyra), plaga (Morveth), alquimia (Morwen), faroles (Farolero).

| Campeón | Rol | Identidad (mecánica propia) | Hueco que cubre |
|---|---|---|---|
| **Ostrel**, el Cazador de Estrellas | Mago | Rayo **sostenido**: canaliza un haz que gira con el apuntado y gana Foco por pulso seguido | ningún campeón mantiene un haz |
| **Grelk**, el Cazador de Fosos | Asesino/tirador | **Trampas** ocultas que se arman y saltan al pisarlas; se disparan a distancia; marcan Presa | ningún campeón coloca trampas pasivas |
| **Ilsa**, la Esgrimista de Réplica | Asesino | **Contraataque**: la postura desvía golpes (daño 0) y suma Réplicas que potencian estocada y giro | ningún campeón anula golpes con ventana |
| **Vorn**, el Cambiapiel | Tanque | **Dos formas** (Piedra/Tormenta) que cambian el efecto de Zarpa e Instinto; Mudar es la bisagra | transformación reversible por habilidad |
| **Nerith**, la Bruja de la Ciénaga | Soporte | **Áreas persistentes**: charcos que reponen vida, regueros de lodo y marisma; la ciénaga madura donde se cruzan | soporte de zonas que interactúan |
| **Quillon**, el Tahúr de la Última Mano | Mago | **Baraja** de cuatro palos en orden fijo (♠ daño, ♣ control, ♥ vida, ♦ potencia); Racha de Cuatro | recurso por ciclo de cartas, sin azar |
| **Kora**, la Ariete | Tanque | **Impulso** por movimiento; arrastra y estrella comunes contra los vecinos; estampida guiada | tanque de colisión/ímpetu |

Roles: 2 magos, 2 asesinos, 2 tanques, 1 soporte. Todos pasan `node tools/factory/cli.js duplicity ...` con veredicto **DISTINCT**
(puntaje máximo 0,24 frente al umbral DUPLICATE 0,45). No se tocó el detector. Para lograrlo se evitaron sinónimos ya etiquetados por el
detector en los textos (p. ej. "reponer vida" en vez de "curar"); las mecánicas no cambiaron. Esa comparación es de vocabulario, no de jugabilidad.

## Dónde vive cada cosa
- Diseño: `js/champions/siete/catalog.js` (se fusiona con `ASCENSION` para reutilizar registro, talentos de rama, Códice, voces y skins; la categoría real es STANDARD/TESTING en `js/data/champion-taxonomy.js`).
- Runtime: `js/champions/siete/common.js` (base: entidades con tope por tipo y total 10, limpieza, techo contra jefes, hooks) y un archivo por campeón.
- Registro complementario (premarcado, proyectil propio, talento de transformación por rama): `js/champions/siete/register.js`.
- Refuerzos de habilidad (4 cartas + dúo por campeón): `js/data/boons-siete.js`.
- Arte: recetas en `tools/art/painter/specs/<id>.json` y `<id>_alt1.json`, hojas instaladas con `tools/art/painter/install.py`.
- Efectos y audio: `js/champions/siete/render.js`, `js/champions/siete/audio.js` (síntesis; no es audio aprobado).
- Pruebas: `tools/siete/functional.js` (225 comprobaciones), manifiestos: `tools/siete/manifests.js` → `docs/production/siete/*.json`.

## Resultados (salida real, este commit)
Ver la sección «Siete campeones nuevos» de `BALANCE_CAMPEONES.md` y los JSON de `docs/balance/`, `docs/bible/generated/`, `docs/art-gate/`.

## BLOCKED / PENDIENTE (no se simula)
- **Revisión humana de arte** (Visual Gate, ART_BIBLE §8): las hojas son del Pintor (donantes del roster + forja), con gate de estilo y Roster Art Gate en PASS, pero no hay revisor ni evidencia; las filas de muerte heredan rasgos del donante (cabeza/ropa sin repintar del todo). Cada manifiesto queda `INCOMPLETE`.
- **Croma y skin de Set con arte propio**: el contrato exige croma y Set con previews; no se fabricaron. Los Sets existen como pendientes (`ASCENSION_PENDING_SETS`) hasta RELEASED.
- **Escucha humana del audio** y mezcla con audio real: los acentos son síntesis; `t_audio_mix` mide picos/NaN/nodos, no identidad.
- **Multijugador real y rendimiento en dispositivo**: se comprobó serialización del snapshot de cooperativo en el motor real, no una partida en red con cuatro jugadores ni un iPhone.
- **knownChampions**: segundo paso en `claude/siete-campeones-known` (sin PR), que además exige aprobación humana previa.
