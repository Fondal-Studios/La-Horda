# Intentos y pruebas — corrección 02

## Auditoría fresca

- Main `a27c48b74344a090047deeaa77f2363243ef1d8c` y PR abiertos auditados.
- PR291 continúa como taller único de Convergencia.
- Checkpoint, REMOTE_CLOSURE, REVIEW, recipe, manifest, TEST_ATTEMPTS y cola de corrección 01 releídos.

## Intento 03 — fila frontal aislada

- PNG 2172×724 decodifica: PASS.
- SHA-256: `064a3ad02e451f537cdc4a103c5eb4b9ecc9549d4ac7bbedbaf9f593c5a83b99`.
- Ocho poses visibles y diferenciadas: PASS preliminar.
- Alfa binaria: FAIL; 448.678 píxeles parciales, 262 opacos.
- Contaminación cromática: FAIL; 10.490 rojos y 13.053 amarillos sospechosos.
- Gutters: FAIL; todas las divisiones conceptuales contactan borde lateral.
- Revisión visual: séptima fase comprimida y escala/encuadre variables.
- Resultado: REJECT para extracción e integración.

No se ejecutaron atlas, consumidor, gameplay, relay, rendimiento ni CI porque la fuente no supera la compuerta inicial.