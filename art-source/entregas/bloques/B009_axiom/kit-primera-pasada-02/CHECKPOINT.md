# Axiom — cierre de primera pasada de habilidades

2026-10-22. Continúa PR194, primer commit3006688d87d740392748b8a9eca14cb5a15f1832. Esta entrega suma4fuentes originales,4atlas diagnósticos y4previews, receta con prompts y hashes, manifiesto, auditoría de existentes y cola de corrección por componente.

B430 Paquete Corrupto11, B111 Error40422, B112 Sobrescribir15, B113 Teletransporte16:64 celdas candidatas. No son64frames aprobados. Force Quit28 ya guardados en primera-pasada-01 no se repite. Toda la tanda EN_CORRECCION / FIX_NO_INTEGRAR; cero componentes instalados y publicación no verificada. No se cierran bloques completos.

Se verificaron5tiras existentes y sus dimensiones contra effect-atlases.js. Se conserva el renderer, que usa bursts18fps y altura90u; también ventana procedural N44 y glifo básico. La fuente vieja de err404/overwrite contiene cuerpo/texto; no se declara bug en partida sin comprobar máscaras. Se producen capasFX separadas exigidas por el brief, no se afirma ausencia de habilidades.

Prueba reproducible: `python art-source/entregas/bloques/B009_axiom/kit-primera-pasada-02/build.py`. Comprueba hashes y exporta recortes fijos con vecino más cercano y alfa original, sin maquillar fallos. technical.json contiene cajas/bordes por frame, alfa y celdas reservadas; estos controles no aprueban arte. Revisión visual de cuatro previews realizada.

Fallos y siguiente corrección exacta: corrections.json. Semialfa en las4fuentes; nube coloreada en Error404 y Teletransporte; borde0–11 en Error404; cubo básico demasiado redondo; faltan subcapas tile/cabeza de Sobrescribir y trazo188x24 de Teletransporte. Este último se mantiene como pendiente explícito, no como producido. Añadir todo a la tanda común de PR193 junto a Myla/Aelith/Aurelia y Force Quit.

Siguiente primera pasada: Baltra B010; leer brief, fuentes/main y PR antes de producir. Si otro ciclo empezó Baltra, continuar el próximo no ocupado. No repetir Axiom ni iterar los frames fallidos ahora. Para integrar Axiom: corrección original, contratos por capa, Art Gate visual a escala real, renderer/hitbox, pruebas de carga/coste/multiplayer y checks del headSHA.

Myla PR190: el job safari-engine119792794260 fue cancelado durante instalaciónWebKit; se solicitó rerun del mismo job. Los demás workflows habían completado; revisar intento actual antes de merge. No saltar gate.
