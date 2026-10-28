# Fondal Art Engine — generación ejecutable, cobertura parcial

**Proyecto incompleto. No fusionar como fábrica terminada ni desplegar los candidatos sin gate visual/runtime.**

El PR #232 incorpora producción real con el motor nativo `pixrig`, un adaptador HTTP para ComfyUI **local**, validación PNG y por fotograma, conservación de contratos de animación, promoción con recibos ligados a hashes y producción aislada en Actions. El proveedor ComfyUI tiene pruebas de protocolo con un servidor de prueba; **no se ha ejecutado un modelo de IA real**. El generador nativo sí se ejecutó: 14 atlas / 656 cuadros reproducidos, idénticos en píxeles al juego actual. Un candidato adicional del Ángel Corrompido recupera geometría cortada mediante overscan y pasa el gate técnico; se integró en la rama del PR con PNG/WebP, metadatos y rollback tras revisión visual y prueba del renderer real. No está desplegado en main.

## Uso

Node >=22, Python >=3.12; `pip install -r tools/fondal-art-engine/requirements.txt`.

```sh
node --test tools/fondal-art-engine/*.test.js
python -m unittest discover -s tools/fondal-art-engine -p 'test_*.py'
node tools/fondal-art-engine/inventory.js --out /tmp/fondal-inventory
node tools/fondal-art-engine/audit.js /tmp/fondal-consumers.json
node tools/fondal-art-engine/production.js generate tools/fondal-art-engine/recipes.json /tmp/fondal-new-run
node tools/fondal-art-engine/runtime-check.js /tmp/fondal-runtime
```

La carpeta de producción debe ser nueva. Un lote termina todos sus trabajos, conserva errores y devuelve código 1 si hay rechazos o fallos. `summary.json` distingue generado, corregido, integrado, reutilizado, rechazado, fallido y pendiente de revisión. La generación no instala ni aprueba arte. La cuenta `generated` incluye regeneraciones; no mide diseños nuevos.

## Estado verificable

Ver [RESULTS.md](RESULTS.md), [operaciones](OPERATIONS.md) y [recibos del 28 de octubre](runs/2026-10-28/native-batch.json). Las 14 recetas actuales cubren ciertos enemigos/jefes; **no cubren todos los campeones, skins, escenarios, UI ni expansiones**. No se considera una plantilla histórica un trabajo generable, ni un PNG existente un asset aprobado. No hay sustituciones de estadísticas, habilidades o hitboxes.
