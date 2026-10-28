# Fondal Art Engine — operaciones seguras

Estado: **infraestructura inicial; NO es un generador de imágenes funcional**.

## Ejecutar localmente (Node >=18)
```bash
node --test tools/fondal-art-engine/*.test.js
node tools/fondal-art-engine/inventory.js --out /tmp/fondal-inventory
node tools/fondal-art-engine/pipeline.js --out /tmp/fondal-jobs
```

El escáner coteja rutas declaradas y existentes; **no valida calidad artística**. El planificador produce candidatos y requiere reconciliación. El proveedor `dry-run` nunca genera ni cobra. No hay credenciales, servicios pagos, despliegue ni escritura en los assets del juego.

## Próximos hitos antes de producción
1. Ejecutar los tests en un checkout completo y comprobar el esquema real del manifiesto.
2. Añadir lectura de consumidores reales (JS), estados de PR y canon visual.
3. Implementar validadores de PNG, dimensiones, alfa, baseline, conectividad, animaciones y licencias.
4. Añadir un adaptador de proveedor con estimación de costo, límites de presupuesto, claves por secretos y reintentos.
5. Generar un lote piloto (campeón, enemigo, mapa), verificar capturas en juego y revisión humana.
6. Solo después habilitar lotes grandes, con límites y rollback por rama.

## Seguridad
No se fusiona a `main` automáticamente. No se aprueban assets solo porque existe un archivo. No se envían imágenes privadas ni se gastan créditos sin autorización explícita.
