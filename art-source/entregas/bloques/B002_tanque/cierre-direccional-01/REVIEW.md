# REVIEW — B002 Tanque direccional 01

Estado del componente: **VALIDADO / PENDIENTE_INTEGRACION_MAIN**.

Referencia obligatoria: `assets/ui/codex/champions/tanque.png` (Aldric, frente/lado/espalda).

## Resultado visual

- La fila frontal de lanzamiento y muerte se conserva byte por byte.
- Las filas laterales y traseras mantienen cabello castaño, capa azul, armadura plata y oro, escudo estrellado y espada corta.
- La capa y el emblema conservan lectura trasera; la caída termina tendida y no vuelve a reposo.
- Los 24 cuadros nuevos tienen alfa binaria, ancla consistente y ningún recorte de borde.
- La matriz real cubrió seis arenas, base y apariencias, densidades y escritorio/móvil. El gate de Caballero validó 12 escenas y 768 controles sin fallos ni errores.

## Fuente activa y continuidad

El candidato 04 reutiliza sin escala los cuadros nativos 16–23 de `assets/sprites/champions/tanque/codex-v1/atlas.png`, derivados de la identidad exacta del Códice. Las doce celdas de lanzamiento y las doce de muerte pasan el gate canónico. Los intentos imagegen 01/02 y la reutilización histórica 03 permanecen como evidencia rechazada.

El atlas integrado por PR182 se conserva en `assets/sprites/champions/tanque/v3/death.png` con SHA-256 `8dc632c0afb7d9df1808dfffb873e44584499abed27c84c5f2ddb5e5ad162d78`. El suplemento direccional vive en `death-directional.png`, SHA-256 `9358896c3b64a64bc97128fee3294dc2dad0ef16d2a82207f61685c50a539106`; esta separación evita reescribir evidencia histórica.

## Runtime y alcance

- Relay real: anfitrión y visitante táctil reciben dirección, temporizador de crecimiento y cuadros laterales reflejados; 0 errores.
- Renderer completo: cuatro corridas de 360 cuadros, 12 enemigos y 2 aliados, 361 limpiezas por corrida; p95 entre 2,3 y 2,5 ms y máximos entre 18,8 y 26,3 ms en el runner. No certifica móvil físico, GPU ni GC.
- No se modificaron balance, daño, área, tiempos, red compartida, skins ni habilidades.
- `Art production evidence`, `Caballero death component gate` y `Tanque directional runtime` pasan en el SHA funcional exacto `8d1c59b3392b639bdfa4426f5f7e2a0706815797`.

La publicación canónica se verifica aparte después de integrar; no se infiere desde GitHub.

## Contrato VisualPackage

El manifiesto global fue reconciliado con los registros efectivos del runtime. El fallo de QA del head `f240f1e6…` quedó preservado en `TEST_ATTEMPTS.json`; la corrección no modifica píxeles, consumidores, mecánicas ni gates. La validación local pasa 6/6 y queda sujeta a CI del nuevo head exacto.
