# Thalen Códice — cierre captura gameplay 01

Estado: **EN_CORRECCION / FIX / NO_INTEGRAR**.

Producción probada: `1a5b1c34b71f429d3511de1f5a882b538f12aa47`. Base main auditada: `54aa936fa254112044e29493179893dd0f8694d6`. PR268 permanece borrador.

## Evidencia nueva

- Workflow: Champion entry balance, run `41901036789`, job `126823195700`.
- Artefacto: `13360032549`, digest `sha256:c3abda0d82afea624ca4aec2c0d88dcf55ffd8fe457a59caf448e2417e197231`.
- El arnés pasó: 43 campeones, 3384 renders del roster; Thalen 36/36; Convergencia 4/4; candidato y fallback; gameplay 48 escenas, seis hojas y cero errores de página.
- Matriz real de `render()`: seis arenas, base/Convergencia, escritorio/viewport móvil, candidato/fallback legado.
- Se preservó una hoja de revisión JPEG y el JSON exacto; los seis PNG originales quedan identificados por SHA-256 en el JSON y en el artefacto CI.

## Revisión visual real

La evidencia es **FIX**, no Art Gate PASS. En Bosque la iluminación y los efectos densos ocultan gran parte del cuerpo; en móvil el héroe queda demasiado pequeño para juzgar continuidad y silueta; aliados/enemigos se superponen al sujeto. Las arenas restantes prueban enganche y contraste general, pero no permiten aprobar todas las animaciones ni la identidad a escala nativa. La comparación confirma que el fallback y el candidato producen escenas distintas para base y que Convergencia conserva prioridad, pero la composición densa no sirve como aprobación final del cuerpo.

## Fallos externos preservados

- El job principal falló después de generar y subir la evidencia: `public-onboarding` no pudo pulsar Continuar porque el pie legal interceptó eventos.
- `lanes` falló fuera del componente; Safari quedó cancelado durante instalación de WebKit.
- No se modificaron esos gates, UI, mecánicas, balance, red, cuentas, cobros ni infraestructura.

## Próximo paso

Corregir el arnés agrupando composición: capturas sparse y densas con el sujeto despejado, recorte a escala de gameplay y secuencia temporal legible, manteniendo las mismas seis arenas y ambos viewports. Después completar relay de dos clientes, rendimiento del renderer y Art Gate. No regenerar las 36 poses ni repetir el consumidor aislado.
