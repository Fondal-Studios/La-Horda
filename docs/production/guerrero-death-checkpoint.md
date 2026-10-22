# B003: checkpoint de arte original

Actualización v3: nueva fuente, cuatro cuadros nativos PASS, scanner0/0/0 y133 comprobaciones de renderer PASS. Caída conectada en rama, con fallback, skins y maestro preservados. RefH79 calibrado mediante captura a escala real. Fuentes/receta/build en revision-death-v3; evidencia en docs/art-gate/guerrero-death. CI y merge pendientes. El atlas completo de taller conserva el fallo de sombreado heredado y no se instala. Las dos revisiones siguientes son historial rechazado, no el candidato v3 actual.

Dos fuentes nuevas y ocho cuadros de caída producidos en dos revisiones. Ninguna pasa el detector nativo completo: cuatro fallos ILUSTRACION por intento. Scanner y recetas reproducibles disponibles. Se conserva todo en taller; no hay modificación de assets jugables, renderer, economía ni guardados.

El problema es visual, no falta de autorización del owner. El siguiente intento debe corregir capucha/capa en píxel nativo; no recolorear otro campeón ni agregar ruido para falsear el gate. El atlas36 antiguo también conserva fallo de sombreado de caminatas; no instalarlo por aprobar solamente cuatro cuadros nuevos.

Mientras se resuelve B003, continuar B004 especializado y otros bloques independientes en docs/production/asset-blocks.json. No repetir las seis poses del Caballero validadas en PR186.
