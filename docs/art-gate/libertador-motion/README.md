# Libertador: componente de locomoción

Se integran doce cuadros de movimiento/descanso de la apariencia base: cuatro frontales, cuatro de perfil y cuatro de espalda; izquierda espejada. Es una integración parcial y explícita de B004, no una sustitución del atlas especializado de 61 cuadros ni el cierre del paquete completo. Los ataques direccionales y otros cuadros del taller todavía no se instalan.

La fuente v7 corrige pequeños huecos del contorno mediante la fábrica sin borrar/recolorear ningún píxel original: 19 añadidos, halo0/semialfa0/fragmentos0. La fuente v6 original y su hash se conservan; generación y recetas anteriores están en PR #166, checkpoint d75d6a18c9abc861969e3780e182525cd205fafd. `source.json` y `extraction.json` prueban la extracción RGBA exacta de los doce cuadros seleccionados. Densidad nativa36/36 y Style Gate estricto PASS sobre la fuente; no se usan excepciones.

El renderer elige el componente únicamente para locomoción base. Conserva disparo, recarga, bayoneta, Cabral, mando, definitiva, caballo, hit, ataques en movimiento, clips nombrados del Códice y todas las apariencias. Si el nuevo pack aún no cargó, dibuja el atlas anterior. No cambia reglas, daño, tiempos, stats ni progresión. Los factores de presentación se regeneran con el Roster Gate; solo cambia la fila base de Libertador.

Validación local:
- 261 comprobaciones de renderer real: niveles1/39/40/60/90/99, cuatro direcciones, idle/walk, espejo, conservación de datos jugables, lazy loading, fallback, skins y snapshots decodificados en una segunda página. No equivale a una partida por el relay público.
- 127 comprobaciones de muerte, reanimación y estados especializados existentes.
- Skin audit del pack especializado: cero fallos/errores; conserva tres avisos heurísticos previos sobre cuadros46/47/60 del atlas antiguo. El nuevo componente tiene sus propias comprobaciones de dirección; no se ocultan ni se atribuyen esos avisos a cuadros nuevos.
- Roster Gate: 141 apariencias, cero fallos de escala, presentación o errores.
- Nueve pruebas de fábrica: extracción, sustitución y reparación; canarios contra sobrescritura, clipping, cambios de píxeles originales y entradas inválidas.
- Talent Gate: seis niveles, migración, maestría irreversible y nube PASS. Referencias de balance sincronizadas. Ability Gate estricto sin fallos nuevos; conserva diagnósticos INFO de kits clásicos, incluido Libertador. No se declara que este cambio de arte resuelva esas carencias.

Revisión visual realizada sobre `runtime-comparison.png` y `walk-0..3.png`, renderizados por el motor junto al Caballero: diseño, uniforme, capa, mosquete y proporciones coherentes; contorno limpio y cuatro vistas legibles. El arma elevada de espalda conserva su punta. La comparación del atlas anterior usa la normalización de presentación actual; no es una captura histórica del despliegue.

PASS del componente de locomoción. Pendiente: integrar/validar por separado los ataques y demás estados del taller, además del backlog general de assets. No se atribuye una aprobación manual a Nano. Merge y publicación canónica se comprueban separadamente.
