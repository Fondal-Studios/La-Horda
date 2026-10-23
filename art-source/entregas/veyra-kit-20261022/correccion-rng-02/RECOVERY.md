# Corrección compartida RNG — inicio

23/10/2026 UTC. PR196, head previo cad319ecf7e4d8a41eda2e8c8f1ed95a16afddb7; main 6334ff40b6514808ef0fe00b50bec15e19f10c25. Último cierre remoto Aelith16a4d6f y checkpoints de ambos kits consultados. Sin otro trabajo concurrente detectado.

EN_CORRECCION / NO_INTEGRAR. Investigar con trazas el consumo Math.random omitido al reemplazar qualityFiveFx; conservar comportamiento del recorrido genérico de referencia, fuentes/atlas/UF y protocolos. No ajustar semilla ni compensar con llamadas aleatorias artificiales. Comprobar pools, presupuesto, culling y relay; guardar intentos. No hay producción ni validación nueva en este checkpoint inicial.

Reanudar desde este PR y ejecutar tools/vfx/parity-veyra-pact.js; instrumentar primera divergencia antes de cambiar hooks.js. Este archivo sin REMOTE_CLOSURE.json posterior significa ciclo incompleto: recuperar remoto y conservar evidencia.
