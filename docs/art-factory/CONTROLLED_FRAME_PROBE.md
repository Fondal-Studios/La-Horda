# V4: prueba controlada de un cuadro (experimental)

V4 **no** es una fábrica aprobada de animaciones. El único piloto autorizado es Sylva `walk_down`, cuadro de atlas **3** (índice cero): rodilla izquierda de pantalla elevada, apoyo derecho. La referencia de identidad conserva aspecto chibi, paleta y mano del arco; el esquema determinista solo indica geometría de piernas, no estilo ni proporciones adultas.

## Selección explícita

```js
{
  kind: 'animation', action: 'walk_down',
  generationMode: 'single-frame', frameClips: ['walk_down'], frameIndices: [3]
}
```

`frameIndices` requiere acción y modo explícitos, pertenencia al clip, índices enteros y ausencia de duplicados. El manifiesto externo debe conservar exactamente modo, clips e índices, además de hashes de contrato, texto enviado, referencias y salida. Un trabajo `walk_down-frame-3` se reutiliza en el plan completo mixto solo si esos datos coinciden.

La CLI puede mostrar el plan **sin red ni gasto**:

```sh
node tools/factory/cli.js generate animation cazadora walk_down --generation-mode single-frame --frames 3 --provider runway --dry-run --run-dir /ruta/absoluta/nueva
```

No se conectó este selector a la UI: la UI existente mantiene su flujo anterior. No se deben anunciar botones o capacidad per-frame automática inexistentes.

## Plan mixto y presupuesto

`generationMode: 'single-frame'` divide **solo** `walk_down`; los otros clips siguen usando sus tiras existentes. Sin filtro `frameIndices`, los contratos actuales producen:

| Alcance | Pedidos | Reserva API local a 10 centavos/pedido | Ejemplo externo a 7 créditos/pedido |
|---|---:|---:|---:|
| Una prueba de Sylva | 1 | 10 centavos | 7 créditos |
| Sylva completa, método mixto | 16 | 160 centavos | 112 créditos |
| Escarcha completa, método mixto | 19 | 190 centavos | 133 créditos |

Los 7 créditos son una estimación basada en pilotos previos, no una garantía de precio ni un saldo verificado. Créditos del conector y reserva de API son libros distintos. El total mixto es 35 pedidos; reutilizar una prueba aceptada deja 34 pendientes. Esta tabla **no autoriza** su ejecución. Las reservas del lote/día se verifican antes de cualquier pedido y un presupuesto insuficiente bloquea el lote completo.

## Límites y revisión

- Guía PNG/SVG creada mediante geometría determinista con margen mínimo del 20% en todos los lados; solo piernas cambian entre fases, sin espejo del cuerpo.
- Fondo de salida verde uniforme, cuerpo/arco/pies completos; ninguna aprobación visual automática.
- Un cuadro aislado no demuestra un ciclo de caminar ni continuidad con los demás cuadros, aunque la evaluación técnica pase.
- Si el piloto vuelve a fallar la pose, se detiene y se reconsidera el método; no se repiten lotes ni prompts indefinidamente.
- La integración sigue siendo preparación de assets y parche para revisión; no instalación, merge ni despliegue automático.
