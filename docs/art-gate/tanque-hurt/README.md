# Caballero: reacción al golpe

Seis poses originales: impacto y recuperación de frente, perfil derecho y espalda; izquierda espejada. El componente se usa únicamente con hurtTimer positivo en la apariencia base. Conserva el atlas maestro, las skins, el daño, duración de invulnerabilidad, habilidades y guardados. El paquete de habilidades existente mantiene prioridad. Si falta el suplemento se conserva el renderer anterior.

Art Gate: v1/v2 rechazadas por ILUSTRACION en las dos espaldas. v3 pasa seis cuadros con el detector canónico sin excepciones, scanner halo2 (reflejos de metal), semialfa0 y fragmentos0. Revisión visual asistida sobre runtime-comparison.png: misma identidad, espada/escudo presentes, cuatro orientaciones legibles. Style Gate estricto de familia PASS sobre el atlas de montaje; no aprueba los cuadros viejos del candidato completo. Solo hurt.png entra al runtime.

234 comprobaciones del renderer real: niveles1/39/40/60/90/99, cuatro orientaciones, tiempos160/81/80/1, preservación de propiedades, carga incompleta, skins y prioridades;24 snapshots reproducidos en segunda página con netDecode. No es una partida del servidor oficial ni una aprobación atribuida a Nano.

Fuentes, intentos rechazados, recetas y extracción: art-source/entregas/bloques/B002_tanque/revision-hurt-v{1,2,3}/. Reproducción con tools/factory/reproduce-authored-component.py. La caída de #182 continúa preservada. La tarea tanque.cuerpo.golpe seguirá sin cierre documental hasta que esta entrega esté mergeada y su commit pueda verificarse.

## Corrección de carga

Se reprodujo invisibilidad con los tres atlas de habilidades vacíos: el módulo vendor no dibujaba, pero drawKnightAbilityFx devolvía éxito. Ahora comprueba la imagen base/croma antes de tomar prioridad; si falta, dibuja el cuerpo o la reacción al golpe. Las tres pruebas fallaron antes del arreglo y pasan después, junto con tres casos adicionales sin daño. No se altera el vendor ni la lógica de combate.

CI expuso además una prueba intermitente de Horda Infinita que comparaba enemigos aleatorios con posibles afijos distintos. El fixture usa dos esqueletos equivalentes y exige exactamente+22% de velocidad. Suite completa PASS; quitar temporalmente el multiplicador real provoca FAIL, luego se restaura el archivo de producción idéntico. No se bajan umbrales ni se omiten errores.
