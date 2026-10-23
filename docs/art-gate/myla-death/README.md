# Myla — caída base de cuatro cuadros

**Visual Gate: PASS — revisión asistida por Codex, 22/10/2026.** No atribuida a Nano. El componente jugable es únicamente `assets/sprites/champions/myla/v2/death.png`; lanzamiento/golpe de la hoja fuente siguen EN_CORRECCION y no están instalados.

Evidencia del renderer real de `b95d6f54f5573e77f8d390a73dd87e43bd804d70`: [Actions39768883095](https://github.com/drmarianojimenez94-sudo/La-Horda/actions/runs/39768883095), artefacto12420973299, ZIP SHA256`ce4ffaaaf0ab07353774a4628b00d2a3bc48281692075f2b958cb94b283f04df`.

- Fuente y extracción reproducibles en `art-source/entregas/bloques/B005_myla/revision-01/`.
- Atlas SHA256`694aaef8acbac523dc5f1fb5e5949a7060c91d4e3074733bdc669e84c5452e63`; RGBA idéntico a extracción; cuatro siluetas, alfa binaria, halo0, fragmentos0.
- Detector canónico en navegador:4/4 PASS. Ese primer run usó estimación0.85u/px; `native-real-scale.json` reclasifica las mismas métricas decodificadas con la fórmula exacta24×2.7/82=0.7902439024390244u/px (misma escala comprobada por renderer). El workflow ya usa el valor exacto para siguientes heads. Ningún umbral cambiado.
- Renderer:139 checks PASS, cero errores; cuatro cuadros en cuatro vistas a niveles1/39/40/60/90/99, pose final, reinicio al revivir, seis snapshots de invitado decodificados, skins, fallback, Berrinche y hashes preservados. Son pruebas de renderer/red local, no de conexión física entre dispositivos.
- Regresiones:Guerrero133/Tanque135/Libertador127 PASS; roster141 apariencias, escala/presentación/errores0.

## Revisión visual

Inspeccionados `runtime-comparison.png` a tamaño del juego, contacto de fuente y `roster-sheet.png` del mismo run (Caballero y Myla bajo mismo zoom). Se conserva pelo castaño, lazo rosa, vestido rosa/blanco y forma de la cara; contorno nítido y densidad compatibles. Secuencia: pérdida de equilibrio sentada, cabeza baja, caída lateral, reposo de costado. El menor alto corresponde a la postura, sin estirar cuadros individualmente. Cuatro poses comparten ancla106 y escala uniforme. No hay fragmentos, halo ni contaminación entre celdas. La secuencia es breve (170ms por cuadro), con retención final del motor existente. No se afirma prueba en teléfono físico.

## Estado

Componente VALIDADO; todo B005 continúa abierto. Merge solo después de checks/workflows y reviews del head final, sin bypass, con expected_head_sha. Publicación pública del juego PENDIENTE_VERIFICACION incluso después del merge.
