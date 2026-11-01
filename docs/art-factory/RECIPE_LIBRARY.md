# Biblioteca de recetas de arte — versionada, no «arte aprobado»

La fábrica reutiliza recetas, contratos, referencias, hashes y evaluaciones. Eso evita repetir instrucciones y pagar por regenerar salidas idénticas; **no convierte inferencia externa en gratuita** ni reemplaza revisión artística.

## Recetas ejecutables versionadas

`tools/factory/s0f/recipes/front-fixed-single-row-v2.json`, cargada por `recipe-library.js`, contiene el texto completo y los parámetros de `walk_down`:

- cámara frontal tres cuartos fija, sin perfil/espalda/giro;
- orden de apoyo/paso alternado, exactamente una fase por cuadro solicitado;
- identidad, paleta, vestimenta, arma y skin tomadas de las referencias del contrato existente;
- geometría y cantidad de cuadros tomadas del atlas registrado, no de una plantilla universal;
- versión y SHA del archivo para fijar el plan y detectar cambios.

La receta v2 permanece **experimental y falló en el ensayo descrito abajo**. El módulo selecciona explícitamente la versión activa; una versión siguiente no hereda aprobación por reutilizar esta estructura. Su texto de cuatro cuadros conserva exactamente el plan direccional preparado; no se agrega una instrucción oculta después de registrar su hash. Otros clips conservan su flujo explícito existente: la biblioteca no inventa una receta que todavía no fue definida.

## Aprendizaje conservado: Sylva, intento 3

`recipes/sylva-walk-attempt3-v1.json` es un registro de evidencia, **no una receta aprobada**. El intento con `nano-banana-2`, tarea `cde2981f-a685-4ec5-8b1b-2cff32043500`, consumió **7 créditos externos observados** (500 → 493; no equivalencia inventada en centavos API).

Resultado: cuatro cuadros / 7,7 % del atlas, puntuación técnica **100**, pero **rechazo visual**: el tercer cuadro gira a perfil y dos cuadros de paso son casi idénticos. No hubo aprobación ni integración. Los JSON de evaluación, revisión y créditos se conservan en `recipe-evidence/` con hashes; el PNG original se identifica por hash y permanece en el archivo local del piloto, no embebido en la biblioteca.

La receta direccional intentó corregir esa ambigüedad de cámara y fases; **el fallo anterior no demuestra que la nueva receta funcione**.

La versión siguiente, `front-fixed-solid-green-v3.json`, conserva esas lecciones con fondo verde obligatorio. Sigue **experimental**: su existencia no equivale a una generación, validación o aprobación.

## Aprendizaje conservado: receta v2, intento 1

`recipes/sylva-walk-v2-attempt1-v1.json` registra la tarea `3450dd4a-e11e-415f-a0a4-4ca41ae1f187` con `nano-banana-2`: **7 créditos observados** (493 → 486), **14 créditos netos acumulados** en estos dos pilotos con salida.

La imagen es RGB, sin alfa, y trae un damero de transparencia **dibujado dentro de la imagen**. El ensamblador esperaba cuatro poses separables y encontró una. Resultado real: `ASSEMBLY_REJECTED` / `BLOCKED_INCOMPLETE`, **sin atlas, sin evaluación numérica, sin aprobación ni integración**. El estado y la revisión también registran una marcha poco convincente, con poses repetidas.

Aprendizaje reutilizable: exigir fondo plano `#00FF00`, prohibir el damero y la transparencia simulada, y especificar geometría de apoyo/paso distinta para cada pierna. No se relajan los controles para aceptar la salida defectuosa. Esa corrección pertenece a **otra versión experimental**, con nuevo prompt/hash; el registro no autoriza por sí mismo otra llamada paga.

No existe `assembly.json` en esta corrida porque ninguna tira se ensambló: `state.json`, conservado con hash, es la evidencia del fallo. El «0 centavos» del importador significa que importar no hizo una solicitud API; **no significa que la imagen externa haya sido gratuita**.

## Estados y promoción

Evidencia: `attempted` → `technical-validated` → `visual-rejected` **o** aprobación visual independiente. `approved` requiere además las verificaciones de runtime; `integrated` exige autorización y evidencia del cambio en main. Ningún puntaje técnico, archivo de plantilla o declaración de quien generó la imagen concede esas aprobaciones.

Para cambiar comportamiento: crear una versión nueva, registrar su evidencia y regenerar el plan/hash antes de otro pedido. No modificar en silencio una receta ya usada por un pedido pago. Los parámetros propios de cada campeón/skin se derivan del contrato y referencias; no copiar la paleta o el arma de Sylva a otros campeones.

El registro de evidencia conserva observaciones y la revisión declarada; no autentica criptográficamente identidades humanas ni servicios externos.
