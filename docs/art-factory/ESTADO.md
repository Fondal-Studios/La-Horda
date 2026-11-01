# Art Factory 2.0 — estado real (S0E)

Rama: `feature/s0e-art-factory`. Fecha: 2026-11-01. **No se produjo ni integró arte nuevo.**

## Módulo A — Inventario (HECHO, verificable)
`python3 tools/art-factory/scan.py docs/art-factory/inventory.json` escanea `assets/` (3.270 imágenes, 264 MB).
- 0 rotas (todas decodifican, ninguna vacía); 0 rutas citadas en el código que no existan.
- 1.753 con referencia literal en el código; 1.491 con referencia dinámica probable (el nombre aparece, la ruta se arma en ejecución); **22 huérfanas reales**; 4 duplicadas exactas (2 pares: `tiburon_joven/idle` = `idle2`; `convergencia/spark_1` = `star_0`).
- 100 imágenes de campeones/skins tienen píxeles semitransparentes (contrato de alfa binario de las skins propias).
- Límite: el escáner NO juzga calidad visual. Ningún asset se marca "aprobado"; esa etiqueta exige gates existentes y un evaluador independiente.

## Infraestructura existente (auditada; no se construyó otra)
- **El Pintor** (`tools/art/painter`, `tools/factory`): recompone hojas encargadas del roster (donantes + paleta + accesorios) con gate de estilo; no es un generador de imágenes. Un recolor del propio cuerpo de un campeón es lo que `docs/skins-audit` ya rechazó como "recolor puro", así que no sirve para skins premium.
- **Fondal Art Engine** (PR #232, borrador, 131 archivos, base antigua de main): pixrig nativo + proveedor FLUX (BFL) + adaptador ComfyUI local. Depende de `server/art-factory` (cola, panel GM, trabajador): **no se puede usar como paquete de herramientas suelto** (al copiarlo a esta base falla `Cannot find module '../../server/art-factory'` y 3 de 29 pruebas). Integrarlo implica tocar `server/` (dueño: otros agentes).

## Módulo C — ¿Hay generador operativo? NO
- ComfyUI local (`127.0.0.1:8188`): sin respuesta (http 000).
- Credencial del proveedor FLUX/BFL: el propio `BFL-TRIAL.md` documenta `BLOCKED_CREDENTIAL`; en este entorno no hay variables de API de imágenes configuradas. Además el ensayo autorizado (máx. USD 5) requiere una clave dedicada que no está disponible aquí. No se gastó nada.
- Resultado documentado por el motor: 14 atlas regenerados por pixrig, **idénticos** a los actuales y con contacto de borde; 0 diseños nuevos; "no hay generación de IA demostrada".

## Bloqueos externos (decisión del dueño)
1. Una clave BFL de prueba (tope USD 5, sin renovación) o un ComfyUI/modelo accesible desde el worker.
2. Decidir si se integra PR #232 (con su parte de servidor) o solo el pipeline de validación.
3. Evaluador visual independiente con las referencias del Códice.

## Qué NO puedo afirmar
Ninguna skin premium, sprite, animación, VFX ni asset de Ruinas/Gélida fue generado o reparado en este sprint.
