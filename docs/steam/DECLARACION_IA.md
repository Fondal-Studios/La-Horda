# Declaración de contenido generado con IA (Steam) — borrador para el dueño

Steam pide declarar el uso de IA generativa en el juego y describirlo. Este documento reúne **lo que el repo puede probar** y
marca **lo que solo el dueño puede confirmar**. No es asesoría legal: la declaración final la firma el dueño en Steamworks
(*Store Page → Content Survey / AI Disclosure*; confirmar el nombre exacto del formulario en el panel).

## Lo que está documentado en el repo

### 1. Runway (modelo `gen4_image`)
- **90 generaciones registradas** con recibo (`receipt.json`) en `art-source/`: 69 de guardianes (`runway-guardians`), 17 de mundo
  (`runway-world`: texturas y fachadas de arenas), 2 de HUD (`runway-hud`), 1 de enemigos (`runway-enemies`) y 1 de entrega
  de íconos de objetos (`entregas`).
- Cada recibo trae el prompt, el modelo, la relación de aspecto y un estado. Los recibos están en `GENERATED_NOT_APPROVED`
  (generado, no aprobado como arte final): **muchas generaciones son intentos descartados o referencias**, no arte del juego.
- El gasto está en `docs/beta-release/ART_CREDITS.md` (tasks de Runway por fecha).
- Uso en el flujo: la salida de Runway no se publica tal cual. Se reduce a escala nativa y pasa por herramientas deterministas
  del repo (`tools/art/`, `tools/art-world/`) y por revisión visual antes de integrarse.

### 2. ChatGPT (láminas del Códice)
- Según el dueño, las **láminas del Códice** (`assets/ui/codex/champions/*.webp`, una por guardián, 43 imágenes; los originales
  PNG siguen en el repo) vienen de ChatGPT. Eso no figura en ningún recibo: **solo está respaldado por la palabra del dueño**.
  Conviene conservar los chats o prompts originales como prueba.
- Esas láminas son la referencia de arte de cada guardián y se muestran en el Códice del juego.

### 3. Lo que NO es IA generativa
- Los pintores procedurales (`tools/art/painter/`, `tools/art-world/build-*.py`) son código determinista: recortan, recolorean y
  animan por píxel entero; no usan modelos.
- Audio: el repo no registra generación de audio con IA (`ART_CREDITS.md` solo lista Runway de imágenes). **Confirmar** si algún
  sonido o música se generó con IA; no hay evidencia en el repo en ningún sentido.

## Lo que tiene que confirmar el dueño antes de enviar

1. ¿Qué parte del arte final del juego (no solo de las pruebas) salió de una generación de IA? Hay que cruzar los recibos con lo que
   realmente se ve en el juego (guardianes, texturas de Ciudad Maldita y otras arenas, íconos de objetos).
2. ¿Las láminas del Códice se editaron a mano después de ChatGPT, o se usan tal cual?
3. ¿Hay textos (lore, descripciones) escritos con ayuda de IA? Steam también los incluye en la declaración.
4. ¿Se genera contenido con IA **mientras se juega**? No: el juego no llama a ningún modelo en tiempo de ejecución (verificado
   por ausencia en el código del cliente; confirmar para el servidor, que no se revisó para esto).
5. Derechos: confirmar que los términos de Runway y de ChatGPT que tenés contratados permiten uso comercial de lo generado.

## Texto sugerido para la ficha (ajustar a lo que confirmes)

> Parte del arte de La Horda (ilustraciones de referencia de los personajes y algunas texturas del mundo) se creó con
> herramientas de IA generativa de imágenes y después se redujo, retocó y animó con herramientas propias. El juego no genera
> contenido con IA mientras se juega.

*(No afirmar «sin IA» ni «100 % hecho a mano»: los recibos del repo lo contradicen.)*
