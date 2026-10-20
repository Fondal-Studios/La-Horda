# Libertador: componente de caída

Entrega parcial de B004. Añade cuatro cuadros de caída al Libertador base y una opción **Caída** en el Códice. No sustituye el atlas de 61 cuadros, la montura ni las apariencias. No añade un campeón o skin. Si el componente todavía no cargó, conserva el fallback anterior.

## Procedencia y alcance

- Fuente: `art-source/entregas/bloques/B004_libertador/campeones/atlas.png`, SHA-256 `b6325f4854ceca748d4807097ebae104209856277c43d6789ecc69ee2f546dc0`.
- Únicamente cuadros 32–35: extracción exacta RGBA, sin escalado, filtros, recolor ni duplicación. Manifiesto y recibo: `source.json` y `extraction.json`.
- `assets/sprites/champions/libertador/v2/death.png`: cuatro celdas112×112, refH71, apoyo106. La caída usa una secuencia frontal compartida por las orientaciones, igual que el fallback direccional existente del renderer; no se presenta como cuatro secuencias distintas.
- Los otros32 cuadros de la fuente NO están aprobados por esta entrega. El reemplazo completo B004 sigue en FIX y el taller #166 sigue separado.

## Validación ejecutada

- Detector nativo canónico, mismos umbrales: **4/4 sin incidencias**, `native.json`. El gate original de hojas36 no se modifica.
- Style Gate existente sobre la fuente: PASS de familia por sus medianas; no equivale a aprobación nativa de los36 cuadros.
- Motor real: **127 comprobaciones PASS**, `runtime.json`; niveles1/39/40/60/90/99, fases y retención de caída, resurrección, nuevo fallecimiento, snapshots de otro cliente con reloj distinto, carga `lazy=1`, Códice y tres apariencias reales.
- Disparo, recarga, bayoneta, Cabral, mando, definitiva y seis estados montados conservan sus clips. Los hashes del atlas base y caballo siguen idénticos.
- Roster Gate existente: **139 apariencias, cero fallos de escala/presentación**, `roster.json`.
- Skin Audit existente de Libertador: cero fallos y errores; conserva tres advertencias anteriores de orientación en caminar (`skins/report.json`).
- Fábrica: cinco pruebas Python de extracción/reemplazo; ver workflow `Libertador death component gate` para repetición en CI.

## Revisión visual

Revisor: Codex, inspección visual del contacto capturado en el renderer, no aprobación humana atribuida al owner. El contacto `runtime-contact.png` compara al Caballero, el Libertador actual y cada fase sin VFX. Se conservan casaca azul, charreteras doradas, capa roja, pelo oscuro y mosquete. El descenso del cuerpo corresponde a arrodillarse y caer; contornos nítidos y sin cuadros vecinos. **PASS limitado a este componente**, sujeto a los checks del commit candidato.

Estas pruebas gráficas no certifican balance, anticheat, transporte vivo ni rendimiento sostenido en teléfonos físicos. Las habilidades, estadísticas, talentos y protocolo no cambian; se mantienen los gates existentes del repositorio. Integración en main y despliegue público se verifican aparte. No cerrar todas las tareas B004 por esta entrega.

## Reproducción

```sh
python3 tools/factory/extract-authored-clip.py docs/art-gate/libertador-death/source.json /tmp/death.png /tmp/extraction.json
python3 -m unittest tools/factory/test_authored_clip.py tools/factory/test_authored_frame.py
node tools/art/check-authored-clip-density.js assets/sprites/champions/libertador/v2/death.png docs/art-gate/libertador-death/native.json
node tools/art/check-libertador-death.js
```

Playwright/Chromium y Pillow son necesarios. `CHROMIUM_PATH` permite seleccionar el Chromium instalado. Los reportes son evidencia, nunca un reemplazo de la ejecución.
