# Libertador: ataque de espalda v3, 20/10/2026

Fuente original generada con la herramienta integrada. Tres fases: apuntar, retroceso y recuperación; mosquete con bayoneta, identidad naval/roja/dorada preservada. No instalada.

Se ensamblan únicamente20/21/23 mediante `tools/factory/replace-authored-frame.py`, altura66, NEAREST y alfa binaria. Se comprueba igualdad RGBA exacta de los33 cuadros restantes contra revision-native-v2/preflight/atlas.png. Las tres fuentes individuales están conectadas y pasan la fábrica sin eliminar fragmentos ni alterar la paleta.

Resultado: Style Gate de familia PASS, detector nativo FIX20/21/23 (sombreado suave0.410/0.432/0.412; ruido72.6/74.1/68.3). No se cambian umbrales. No constituye avance integrado ni cierre de tareas. Continúa siendo incorrecto sustituir el pack especializado61 y el caballo por esta plantilla36.

Reproducir con `python3 .../reproduce.py` desde la raíz del repo. Requiere Pillow/NumPy/SciPy/Playwright y CHROMIUM_PATH, NODE_PATH según instalación. Salida nueva en directorio temporal; todos los originales conservados.

Próximo paso: redibujar los clusters nativos de ataque; evitar otra ilustración ampliada. Mientras tanto continuar pendientes independientes de cosméticos; no bloquear todo el inventario por B004.
