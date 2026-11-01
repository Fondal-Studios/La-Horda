# Biblioteca de recetas de arte — versionada, no «arte aprobado»

La fábrica reutiliza recetas, contratos, referencias, hashes y evaluaciones. Eso evita repetir instrucciones y pagar por regenerar salidas idénticas; **no convierte inferencia externa en gratuita** ni reemplaza revisión artística.

## Receta ejecutable actual

`tools/factory/s0f/recipes/front-fixed-single-row-v2.json`, cargada por `recipe-library.js`, contiene el texto completo y los parámetros de `walk_down`:

- cámara frontal tres cuartos fija, sin perfil/espalda/giro;
- orden de apoyo/paso alternado, exactamente una fase por cuadro solicitado;
- identidad, paleta, vestimenta, arma y skin tomadas de las referencias del contrato existente;
- geometría y cantidad de cuadros tomadas del atlas registrado, no de una plantilla universal;
- versión y SHA del archivo para fijar el plan y detectar cambios.

La receta está **experimental**. Su texto de cuatro cuadros conserva exactamente el plan direccional preparado; no se agrega una instrucción oculta después de registrar su hash. Otros clips conservan su flujo explícito existente: la biblioteca no inventa una receta que todavía no fue definida.

## Aprendizaje conservado: Sylva, intento 3

`recipes/sylva-walk-attempt3-v1.json` es un registro de evidencia, **no una receta aprobada**. El intento con `nano-banana-2`, tarea `cde2981f-a685-4ec5-8b1b-2cff32043500`, consumió **7 créditos externos observados** (500 → 493; no equivalencia inventada en centavos API).

Resultado: cuatro cuadros / 7,7 % del atlas, puntuación técnica **100**, pero **rechazo visual**: el tercer cuadro gira a perfil y dos cuadros de paso son casi idénticos. No hubo aprobación ni integración. Los JSON de evaluación, revisión y créditos se conservan en `recipe-evidence/` con hashes; el PNG original se identifica por hash y permanece en el archivo local del piloto, no embebido en la biblioteca.

La nueva receta corrige esa ambigüedad de cámara y fases; **el fallo anterior no demuestra que la nueva receta funcione**.

## Estados y promoción

Evidencia: `attempted` → `technical-validated` → `visual-rejected` **o** aprobación visual independiente. `approved` requiere además las verificaciones de runtime; `integrated` exige autorización y evidencia del cambio en main. Ningún puntaje técnico, archivo de plantilla o declaración de quien generó la imagen concede esas aprobaciones.

Para cambiar comportamiento: crear una versión nueva, registrar su evidencia y regenerar el plan/hash antes de otro pedido. No modificar en silencio una receta ya usada por un pedido pago. Los parámetros propios de cada campeón/skin se derivan del contrato y referencias; no copiar la paleta o el arma de Sylva a otros campeones.

El registro de evidencia conserva observaciones y la revisión declarada; no autentica criptográficamente identidades humanas ni servicios externos.
