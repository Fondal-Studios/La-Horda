# Libertador: ataque trasero v4 — solo taller

Fuente generada con la herramienta integrada de imágenes. Se reemplazan exclusivamente los cuadros 20/21/23 del candidato v2 mediante la fábrica existente; los otros 33 permanecen idénticos. `assembly.json` conserva hash, recortes y altura; `reproduce.py` exige igualdad exacta de RGBA y reproduce el rechazo esperado.

Avance comprobado: el cuadro 21 pasa ahora el control nativo. El atlas queda en FIX con 20 y 23 rechazados, frente a tres rechazos en v3. Style Gate estricto de familia aprobado. No se alteraron umbrales ni excepciones.

No se instala en `assets`, no se registra como aprobado y no cierra B004. Todavía requiere corregir 20/23, revisión de continuidad de animación y una adaptación que conserve el pack especializado de 61 cuadros, caballo y habilidades del Libertador existente. Esta plantilla de 36 cuadros no puede sustituirlos directamente.

No se atribuye aprobación al owner ni se afirma publicación. Los originales v2/v3 se conservan para comparar y retomar sin volver a generar lo mismo.
