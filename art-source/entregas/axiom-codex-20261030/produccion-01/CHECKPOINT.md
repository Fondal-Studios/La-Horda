# CHECKPOINT — Axiom Códice producción 01

Estado: **GENERADO / EN_CORRECCION / NO_INTEGRAR**. Referencia corporal exacta: `assets/ui/codex/champions/axiom.png` SHA-256 `1e68edc3414be5dcc3be771778aabf737345c0479666d3315e80e74e522f887b`, usando sus sprites pequeños de frente/lado/espalda. Referencias de skins: los atlas runtime vigentes `skin_sistema` y `axiom_piedra`; se usan sólo para material y paleta, no para heredar su grilla rota.

Candidate04 reemplaza la fuente corporal anterior: 36 poses a escala uniforme, 36/36 no vacías y únicas, alfa binaria, cero contacto con bordes y revisión visual de fuente aprobable. Sistema y Código Ámbar conservan exactamente esa geometría y pasan el mismo control técnico 36/36; sus identidades visuales corresponden a los atlas vigentes. Las tres hojas siguen **sin instalación** y sin afirmación de gameplay, renderer, skins en partida, relay o CI.

PR239 conserva sus 12 poses `FIX_NOT_APPROVED` sin instalación y no se sobreescribe. Candidate03, la fuente solapada y todos los intentos fallidos permanecen en este taller. Siguiente: extraer una rama fresca después del cierre de arenas, instalar base+dos skins con metadatos 112×112/4 columnas, ejecutar antes/después real en seis arenas y móvil/escritorio, secuencias, muerte, skins y relay; sólo entonces separar un PR integrable y correr CI del head exacto.
