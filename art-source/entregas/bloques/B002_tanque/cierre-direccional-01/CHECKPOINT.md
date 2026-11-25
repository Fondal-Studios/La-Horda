# CHECKPOINT — B002 Tanque direccional 01

- Base auditada: `b7d92968d3324f298bd64bd9c7cbd33be1ab434e` (`main`).
- Rama: `art/tanque-directional-kit-20261118`; PR [#310](https://github.com/Fondal-Studios/La-Horda/pull/310).
- Componente validado: sólo lanzamiento y muerte lateral/trasera del cuerpo base de Aldric.
- Referencia exacta: `assets/ui/codex/champions/tanque.png`; lanzamiento lateral/trasero reutiliza sin escala los cuadros nativos 16–23 de `assets/sprites/champions/tanque/codex-v1/atlas.png`.
- Conservado: cuerpo, daño, filas frontales, Baluarte, Bastión Ancestral, Paladín del Juicio, habilidades, balance y mecánicas.
- Salidas activas: `cast.png` 4×3 de 144 px y `death-directional.png` 4×3 de 112 px. `death.png` mantiene byte por byte el recibo histórico de PR182.
- Consumidores: `drawKnightWarCryCast` elige la dirección real; `drawChampPackDeath` resuelve dirección incluso para un invitado recién decodificado.
- Estado de arte y runtime: **VALIDADO** en el SHA funcional `8d1c59b3392b639bdfa4426f5f7e2a0706815797`; integración en `main` aún pendiente.
- Evidencia nueva: densidad 12/12 por atlas, seis arenas en escritorio/móvil, 768 controles visuales, relay anfitrión/invitado táctil y cuatro corridas de renderer completo sin errores.
- Intentos imagegen 01/02 y reutilización histórica 03 permanecen rechazados y preservados; no son fuentes activas.
- Próximo paso: confirmar todos los workflows del checkpoint documental, dejar PR listo y mergear normalmente con `expected_head_sha`; después verificar PR, `main` y publicación por separado.

## Reconciliación VisualPackage

- El head documental `f240f1e6c8b13ee90e3efe83d095da1e2babdf29` pasó 19/20 workflows; el único rojo fue QA central porque `assets/visual-packages/manifest.v1.json` aún describía una fila para `tanque_cast` y `tanque_death`.
- Regenerado desde los registros reales: 119 paquetes, `tanque_cast` 576×432 con frente/lado/espalda y `tanque_death` en `death-directional.png` 448×336 con frente/lado/espalda.
- Pruebas nuevas locales: `tools/visual-package/test.js` 6/6 y `cli.js check` con 0 errores. Pendiente repetir todos los workflows sobre el nuevo SHA exacto antes de integrar.
