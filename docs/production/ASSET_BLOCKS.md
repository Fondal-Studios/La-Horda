# Producción de assets por bloques

Cola reproducible: `asset-blocks.json`. Se conservan los731 IDs de bloque existentes y las1244 entradas; no se empieza un inventario paralelo.86 entradas son seguimientos agregados de kits y no representan otros86 dibujos. Los179 iconos HUD exportados no se cierran por mera existencia de PNG: su gate visual sigue pendiente.

| Frente | Bloques | Tareas aún sin cierre documental |
|---|---:|---:|
| Cuerpos, animaciones y formas |42|67|
| Combate y efectos |252|308|
| Mundo, enemigos, jefes y arenas |227|473|
| Iconos e interfaz |76|238|
| Skins y sets |48|45|
| Seguimientos agregados |86|86|

Total1217 registros abiertos después de verificar el cierre de la muerte de Tanque (#182). Es un contador documental, no1217 archivos ausentes. Las entregas #180 (12 poses de locomoción) y #183 (19 iconos de equipo) no tienen equivalencia directa con tareas faltantes originales: no se restan arbitrariamente. Las skins adicionales ya mergeadas requieren cotejo individual con el inventario antes de cerrar sus tareas.

## Orden de ejecución

1. B002 Caballero: muerte integrada #182; seis poses de reacción al golpe en esta entrega. Auditar la solicitud de lanzamiento contra los tres paquetes de habilidades existentes antes de producir sustitutos.
2. B003 Guerrero: corregir las poses de daño, lanzamiento y caída del candidato guardado. No instalar la hoja antigua con36 fallos nativos.
3. B004 Libertador: locomoción y caída integradas; completar estados de arma/mando en PR166, conservando contrato61 y caballo.
4. B005 Myla: lanzamiento, definitiva, golpe y muerte.
5. Continuar los demás bloques por prioridad original, un componente verificable por entrega. B006 conserva su decisión pendiente documentada; no bloquea los demás.

Cada cierre exige fuentes/receta, atlas y preview, gate nativo/técnico, revisión visual a escala del juego, pruebas del renderer y regresiones, commit y PR. Cerrar una pose nunca cierra todo su bloque. Integración en main y publicación se registran por separado.

## Reanudar

`python tools/factory/production-blocks.py` verifica cobertura total sin duplicados y que la cola coincida con el control. `--write` regenera la cola, nunca aprueba arte. `python tools/factory/reconcile-art-production.py` verifica evidencias históricas antes de modificar estados con `--write`. Consultar ramas/PR actuales antes de continuar; no repetir las fuentes guardadas de esta entrega.
