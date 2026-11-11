# Intentos de corrección

## Recuperación remota

- `produccion-01/REMOTE_CLOSURE.json`: decodificación exacta PASS.
- `produccion-01/source-generated-01.png`: PNG remoto corrupto, FAIL.
- `produccion-01/PREVIEW.png`: PNG remoto corrupto, FAIL.
- Los hashes descargados difieren del manifiesto de producción 01. La causa observada es truncado de la transferencia binaria; no se modificó runtime.

## Intento 01 — edición de hoja completa

- PNG 1585×992 decodifica PASS.
- 1052886 píxeles con alfa parcial.
- 126299 rojos y 46124 amarillos saturados.
- Resultado: REJECT.

## Intento 02 — fila frontal aislada

- PNG 2172×724 decodifica PASS.
- Ocho fases visualmente separadas y continuidad frontal preliminar favorable.
- 413590 píxeles con alfa parcial.
- 155 rojos y 163 amarillos saturados: reducción cromática superior al 99 % frente al intento 01.
- Resultado: REJECT para atlas; fuente preservada.

## Pruebas no ejecutadas

No se ejecutaron consumidor, gameplay, relay, rendimiento ni CI artístico porque ningún candidato cumple todavía la compuerta de fuente nativa.

