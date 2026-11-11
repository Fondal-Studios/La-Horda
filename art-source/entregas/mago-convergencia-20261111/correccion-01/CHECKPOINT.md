# Mago / Convergencia — corrección 01

Fecha: 2026-11-11 UTC  
Base fresca: `main` `1981677d4a8bcab8c8864500a0f1eb0bb3e12953`  
PR: #291  
Parent remoto: `16aafeb841727690f1521d3f7eb4e4d472831792`  
Estado: **EN_CORRECCION / FIX_NOT_APPROVED / NO_INTEGRAR**

## Recuperación

El scratch anterior fue eliminado. `REMOTE_CLOSURE.json` seguía íntegro, pero al reconstruir el checkout se verificó que los dos PNG de producción 01 habían quedado truncados durante su subida remota: Pillow no puede decodificarlos y sus hashes no coinciden con el manifiesto. La fuente visible se recuperó desde el resultado conservado y se regeneraron candidatos válidos en este bloque. No se atribuye equivalencia byte a byte con el original perdido.

## Corrección agrupada

1. `source-candidate-01.png`: edición de la hoja completa para limpiar bordes, alfa, grilla y continuidad. Empeoró la contaminación: 126299 píxeles rojos, 46124 amarillos y 1052886 con alfa parcial. Rechazada.
2. `source-front-row-02.png`: estrategia dividida por secuencia, ocho fases frontales. Conserva mejor la identidad de Thalen/Ángel Arcano y reduce la contaminación a 155 píxeles rojos y 163 amarillos, pero todavía contiene 413590 píxeles con alfa parcial. Rechazada para extracción.

No se aplicó umbral, filtro ni cuantización para convertir los fallos en PASS. No se creó atlas y el asset instalado permanece intacto.

## Evidencia nueva

- Ambos PNG locales decodifican completamente.
- `SOURCE_DIAGNOSTIC.json` registra tamaño, alfa y contaminación por intento.
- `PREVIEW.png` permite revisar ambos candidatos sobre damero.
- La generación por filas demuestra una reducción cromática superior al 99 %, pero no resuelve el requisito de alfa binaria.

## Próximo paso

Mantener la generación por secuencias cortas, pero sólo continuar si la herramienta puede entregar alfa nativa binaria. Si no, registrar capacidad bloqueada y avanzar la auditoría independiente del siguiente cuerpo antiguo sin instalar una fuente defectuosa. Antes de cualquier integración: completar cinco filas, ensamblar fuente completa, revisar continuidad, extraer atlas candidato, gameplay a escala, móvil/escritorio, apariencias, arenas, multijugador y CI exacto.

