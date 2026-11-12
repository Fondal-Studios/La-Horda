# Bloques `03-mundo` — descripción y prompt de cada dibujo (227 bloques)

> Generado por `tools/art/build-runway-pack.py` desde `docs/production/asset-blocks.json`. Método: `../RECETA.md`. Estado del bloque = estado en la cola, no aprobación de arte.

## B056 — El Que Mora Debajo (ab_morador, jefe) — piezas/estados propios  
*Prioridad P0 · PENDIENTE*

- **`C-ENEMY-ab_morador`** — El Que Mora Debajo (ab_morador, jefe) — piezas/estados propios. Entidad de escenario/invocación de la arena abismo: se dibuja por partes o con arte compuesto; no camina en 4 direcciones. Criatura: — Comportamiento: — Ataques: —. Detalle y prompts por estado en enemigos/abismo.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/abismo/ab_morador/atlas.png`.
  - Formato: Según la ficha de origen: AB-BO-01/02 Ojo a escala de jefe (idle, parpadeo, daño, abierto/vulnerable, rayo, muerte; A-18: ojo abierto 128×128 dilatarse 6) y mandíbula con transparencia real. PNG RGBA, alfa 0/255, vecino más cercano, pies/ancla abajo-centro.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (El Que Mora Debajo, boss), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #a030ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (El Que Mora Debajo, boss), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #a030ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (El Que Mora Debajo, boss), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #a030ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (El Que Mora Debajo, boss), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #a030ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (El Que Mora Debajo, boss), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #a030ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (El Que Mora Debajo, boss), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #a030ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (El Que Mora Debajo, boss), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #a030ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (El Que Mora Debajo, boss), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #a030ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (El Que Mora Debajo, boss), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #a030ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png`

## B057 — Ícono de objeto "Corona del Invierno Sin Fin" (Mítico, Casco (casco)) / Ícono de objeto "Corazón del Averno" (Mítico, Pechera (pechera)) / Ícono de objeto "Martillo de la Tormenta Primigenia" (Mítico, Arma (arma)) / Ícono de objeto "Égida del Último Bastión" (Mítico, Escudo (escudo))  
*Prioridad P0 · PENDIENTE*

- **`C-ITEM-myth_corona_invierno`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Corona del Invierno Sin Fin" (Mítico, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/myth_corona_invierno.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Corona del Invierno Sin Fin" (Mítico, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-myth_corazon_averno`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Corazón del Averno" (Mítico, Pechera (pechera)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/myth_corazon_averno.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Corazón del Averno" (Mítico, Pechera (pechera)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-myth_martillo_tormenta`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Martillo de la Tormenta Primigenia" (Mítico, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/myth_martillo_tormenta.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Martillo de la Tormenta Primigenia" (Mítico, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-myth_egida_bastion`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Égida del Último Bastión" (Mítico, Escudo (escudo)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/myth_egida_bastion.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Égida del Último Bastión" (Mítico, Escudo (escudo)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B058 — Ícono de objeto "Guadaña de la Cosecha Roja" (Mítico, Arma (arma)) / Ícono de objeto "Báculo del Alba Eterna" (Mítico, Arma (arma)) / Ícono de objeto "Grimorio del Vacío Hambriento" (Mítico, Guantes (guantes)) / Ícono de objeto "Hoja del Eclipse" (Mítico, Arma (arma))  
*Prioridad P0 · PENDIENTE*

- **`C-ITEM-myth_guadana_roja`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Guadaña de la Cosecha Roja" (Mítico, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/myth_guadana_roja.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Guadaña de la Cosecha Roja" (Mítico, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-myth_baculo_alba`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Báculo del Alba Eterna" (Mítico, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/myth_baculo_alba.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Báculo del Alba Eterna" (Mítico, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-myth_grimorio_vacio`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Grimorio del Vacío Hambriento" (Mítico, Guantes (guantes)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/myth_grimorio_vacio.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Grimorio del Vacío Hambriento" (Mítico, Guantes (guantes)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-myth_hoja_eclipse`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Hoja del Eclipse" (Mítico, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/myth_hoja_eclipse.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Hoja del Eclipse" (Mítico, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B059 — Ícono de objeto "Corona del Archimago Eclipsado" (Único, Casco (casco)) / Ícono de objeto "Yelmo del Coloso Errante" (Único, Casco (casco)) / Ícono de objeto "Arco de la Luna Roja" (Único, Arma (arma))  
*Prioridad P0 · PENDIENTE*

- **`C-ITEM-uniq_corona_archimago`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Corona del Archimago Eclipsado" (Único, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Mago. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/uniq_corona_archimago.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Corona del Archimago Eclipsado" (Único, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-uniq_yelmo_coloso`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Yelmo del Coloso Errante" (Único, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Tanque. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/uniq_yelmo_coloso.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Yelmo del Coloso Errante" (Único, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-uniq_arco_lunaroja`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Arco de la Luna Roja" (Único, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: La Cazadora. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/uniq_arco_lunaroja.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Arco de la Luna Roja" (Único, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B060 — CM-C01 Aldeano / mujer / niño · caminata frente y espalda / CM-C02 Escondido (agachado, temblando)  
*Prioridad P0 · PENDIENTE*

- **`D-CIUDAD-CM-C01`** — Objeto de equipo (ícono y/o sprite). CM-C01 Aldeano / mujer / niño · caminata frente y espalda. Ciudad Maldita: escolta (hoy solo perfil) (PARCIAL).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-c01_aldeano_mujer_nino_caminata.png`.
  - Formato: 32×48 · 8 cuadros × 2 vistas × 3 civiles. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, CM-C01 Aldeano / mujer / niño · caminata frente y espalda, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`
- **`D-CIUDAD-CM-C02`** — Objeto de equipo (ícono y/o sprite). CM-C02 Escondido (agachado, temblando). Ciudad Maldita: estado HIDDEN / IDLE con peligro (FALTA).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-c02_escondido_agachado_temblando.png`.
  - Formato: 32×48 · 4 cuadros × 3 civiles. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, CM-C02 Escondido (agachado, temblando), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B061 — CM-T01 Techos de tejas: tile + bordes + cumbrera + chimenea / CM-T02 Cara de pared exterior con ventanas y puerta abierta / CM-T03 Techo dañado / con agujeros / en llamas (3 estados) / CM-T04 Ruinas de edificio derrumbado  
*Prioridad P0 · PENDIENTE*

- **`D-CIUDAD-CM-T01`** — Objeto de equipo (ícono y/o sprite). CM-T01 Techos de tejas: tile + bordes + cumbrera + chimenea. Ciudad Maldita: todas las casas (PARCIAL).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-t01_techos_de_tejas_tile_bordes.png`.
  - Formato: tiles 32×32, 9-slice. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, CM-T01 Techos de tejas: tile + bordes + cumbrera + chimenea, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/ciudad/tex_adoquin.png`
- **`D-CIUDAD-CM-T02`** — Objeto de equipo (ícono y/o sprite). CM-T02 Cara de pared exterior con ventanas y puerta abierta. Ciudad Maldita: frente de las casas (PARCIAL).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-t02_cara_de_pared_exterior_con.png`.
  - Formato: tiles 32×64. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, CM-T02 Cara de pared exterior con ventanas y puerta abierta, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/ciudad/tex_adoquin.png`
- **`D-CIUDAD-CM-T03`** — Objeto de equipo (ícono y/o sprite). CM-T03 Techo dañado / con agujeros / en llamas (3 estados). Ciudad Maldita: estructuras DAÑADA y CRÍTICA (FALTA).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-t03_techo_danado_con_agujeros_en.png`.
  - Formato: tiles 32×32 por estado. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, CM-T03 Techo dañado / con agujeros / en llamas (3 estados), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/ciudad/tex_adoquin.png`
- **`D-CIUDAD-CM-T04`** — Objeto de equipo (ícono y/o sprite). CM-T04 Ruinas de edificio derrumbado. Ciudad Maldita: estructura DESTRUIDA (FALTA).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-t04_ruinas_de_edificio_derrumbado.png`.
  - Formato: 256×160 · 2 variantes. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, CM-T04 Ruinas de edificio derrumbado, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/ciudad/tex_adoquin.png`

## B062 — CM-T06 Refugio / Capilla / Torre de Vigía / Campanario (edificios propios) / CM-T07 Puerta de Evacuación (reja arriba / abajo / rota) / CM-T09 Escenario de la catedral (tablas, telón, reflectores)  
*Prioridad P0 · PENDIENTE*

- **`D-CIUDAD-CM-T06`** — Objeto de equipo (ícono y/o sprite). CM-T06 Refugio / Capilla / Torre de Vigía / Campanario (edificios propios). Ciudad Maldita: estructuras (FALTA).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-t06_refugio_capilla_torre_de.png`.
  - Formato: 256×256 c/u · 4 estados. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, CM-T06 Refugio / Capilla / Torre de Vigía / Campanario (edificios propios), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/ciudad/tex_adoquin.png`
- **`D-CIUDAD-CM-T07`** — Objeto de equipo (ícono y/o sprite). CM-T07 Puerta de Evacuación (reja arriba / abajo / rota). Ciudad Maldita: estructura crítica (PARCIAL).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-t07_puerta_de_evacuacion_reja.png`.
  - Formato: 340×150 · 3 estados. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, CM-T07 Puerta de Evacuación (reja arriba / abajo / rota), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/ciudad/tex_adoquin.png`
- **`D-CIUDAD-CM-T09`** — Objeto de equipo (ícono y/o sprite). CM-T09 Escenario de la catedral (tablas, telón, reflectores). Ciudad Maldita: pelea del Presentador (FALTA).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-t09_escenario_de_la_catedral.png`.
  - Formato: 900×420. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, CM-T09 Escenario de la catedral (tablas, telón, reflectores), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/ciudad/tex_adoquin.png`

## B063 — CM-P02 Ovación final (canalización 3 s)  
*Prioridad P0 · PENDIENTE*

- **`D-CIUDAD-CM-P02`** — Forma de jefe de Ciudad Maldita. CM-P02 Ovación final (canalización 3 s). Ciudad Maldita: Acto III (FALTA).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-p02_ovacion_final_canalizacion_3_s.png`.
  - Formato: 128×160 · 8 cuadros en bucle. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art boss form sprite, CM-P02 Ovación final (canalización 3 s), large, facing the camera, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B064 — GO-01 Manchas de suelo por material (sangre, icor, hueso, escarcha, ceniza, esporas)  
*Prioridad P0 · PENDIENTE*

- **`D-COMBATE-GO-01`** — Objeto de equipo (ícono y/o sprite). GO-01 Manchas de suelo por material (sangre, icor, hueso, escarcha, ceniza, esporas). Gore: Manchas de suelo por material (sangre, icor, hueso, escarcha, ceniza, esporas). Estado: PROCEDURAL. Archivo(s): `js/rendering/gore.js` (`addDecal`)
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/_comunes/go-01_manchas_de_suelo_por_material.png`.
  - Formato: Ver ficha GO-01 en LA_HORDA_COMBAT_MISSING_ASSETS.md. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, GO-01 Manchas de suelo por material (sangre, icor, hueso, escarcha, ceniza, esporas), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`

## B065 — MN-A03 Portal Infernal · cruce (destello al atravesar) / MN-A04 Puerta del Umbral · cerrada / quebrándose / abierta / MN-A06 Lanzallamas de Cerbero · cono / MN-A07 Brasero · encendido / parpadeo / apagado  
*Prioridad P0 · PENDIENTE*

- **`D-MINAS-MN-A03`** — Objeto de equipo (ícono y/o sprite). MN-A03 Portal Infernal · cruce (destello al atravesar). Minas Profundas: el instante de la victoria (FALTA).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/minas/mn-a03_portal_infernal_cruce.png`.
  - Formato: 192×192 · 8 cuadros. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, MN-A03 Portal Infernal · cruce (destello al atravesar), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/minas/cadena_tension_2.png`
- **`D-MINAS-MN-A04`** — Objeto de equipo (ícono y/o sprite). MN-A04 Puerta del Umbral · cerrada / quebrándose / abierta. Minas Profundas: fondo del sector Umbral (SUSTITUTO (arco dibujado + `puerta_mina` recoloreada)).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/minas/mn-a04_puerta_del_umbral_cerrada.png`.
  - Formato: 320×224 · 1 + 6 + 1 cuadros. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, MN-A04 Puerta del Umbral · cerrada / quebrándose / abierta, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/minas/cadena_tension_2.png`
- **`D-MINAS-MN-A06`** — Objeto de equipo (ícono y/o sprite). MN-A06 Lanzallamas de Cerbero · cono. Minas Profundas: ataque principal del jefe (PARCIAL (se estira `mnFlame` de la hoja)).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/minas/mn-a06_lanzallamas_de_cerbero_cono.png`.
  - Formato: 320×128 · inicio 3 + bucle 6 + fin 3 cuadros, apuntando a la derecha. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, MN-A06 Lanzallamas de Cerbero · cono, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/minas/cadena_tension_2.png`
- **`D-MINAS-MN-A07`** — Objeto de equipo (ícono y/o sprite). MN-A07 Brasero · encendido / parpadeo / apagado. Minas Profundas: fuente de luz de los sectores profundos (SUSTITUTO (`lampara_apaga_*`)).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/minas/mn-a07_brasero_encendido_parpadeo.png`.
  - Formato: 48×64 · 4 + 4 + 1 cuadros. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, MN-A07 Brasero · encendido / parpadeo / apagado, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/minas/lampara_apaga_0.png`

## B066 — MN-A08 Farol · parpadeo  
*Prioridad P0 · PENDIENTE*

- **`D-MINAS-MN-A08`** — Objeto de equipo (ícono y/o sprite). MN-A08 Farol · parpadeo. Minas Profundas: fuente de luz más común (PARCIAL (1 cuadro + oscurecido por código)).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/minas/mn-a08_farol_parpadeo.png`.
  - Formato: 48×64 · 4 cuadros en bucle + 1 apagado. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, MN-A08 Farol · parpadeo, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/minas/lampara_apaga_0.png`

## B069 — Jinete Sin Cabeza (ab_jinete, elite, arena abismo)  
*Prioridad P0 · PENDIENTE*

- **`C-ENEMY-ab_jinete`** — Jinete Sin Cabeza (ab_jinete, elite, arena abismo). Enemigo elite de la arena abismo. Estados que el motor rellena clonando/espejando en vez de dibujar: 7 de 11 (idle, walk_D, walk_U, attack_D, attack_U, hit, hit_D). Criatura: El Jinete Sin Cabeza de las viejas leyendas. En el Abismo carga sin mirar, porque no tiene con qué. Comportamiento: Marca la trayectoria (flechas) y carga. Ataques: Carga que empuja fuerte a TODO lo que toque. Detalle y prompts por estado en enemigos/abismo.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/abismo/ab_jinete/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Jinete Sin Cabeza, elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6040a0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Jinete Sin Cabeza, elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6040a0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Jinete Sin Cabeza, elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #6040a0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Jinete Sin Cabeza, elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #6040a0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Jinete Sin Cabeza, elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6040a0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Jinete Sin Cabeza, elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #6040a0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Jinete Sin Cabeza, elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #6040a0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Jinete Sin Cabeza, elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6040a0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Jinete Sin Cabeza, elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6040a0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/bosses/bosque/doblador_guerrero/v2/atlas.png`

## B070 — Campanero (cm_campanero, elite, arena ciudad)  
*Prioridad P0 · PENDIENTE*

- **`C-ENEMY-cm_campanero`** — Campanero (cm_campanero, elite, arena ciudad). Enemigo elite de la arena ciudad. Estados que el motor rellena clonando/espejando en vez de dibujar: 1 de 11 (idle). Criatura: Pervierte las campanas de la ciudad. Si completa su ritual, atrae refuerzos de la Horda. Comportamiento: Camina hasta una campana y CANALIZA. Si termina, llegan refuerzos (y se revelan civiles cerca). Ataques: Campanazo que empuja, Canalizar la campana. Detalle y prompts por estado en enemigos/ciudad.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/ciudad/cm_campanero/atlas.png`.
  - Formato: Celda actual 45×41 (refH 31 px, 2.95 u/px): rehacer a ≈136×120 (refH ≈91 px) para llegar a ≈1,0 u/px. Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Campanero, elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b06030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Campanero, elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b06030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Campanero, elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #b06030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Campanero, elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #b06030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Campanero, elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b06030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Campanero, elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #b06030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Campanero, elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #b06030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Campanero, elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b06030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Campanero, elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b06030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B071 — Dama del Bosque (dama_bosque, elite, arena bosque)  
*Prioridad P0 · PENDIENTE*

- **`C-ENEMY-dama_bosque`** — Dama del Bosque (dama_bosque, elite, arena bosque). Enemigo elite de la arena bosque. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Las Damas del Bosque cantaban para que los árboles crecieran. Ahora cantan para que las raíces aprieten. Comportamiento: Mantiene distancia y lanza magia de la naturaleza. Ataques: Proyectil de espinas, Hechizo de raíces. Detalle y prompts por estado en enemigos/bosque.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/bosque/dama_bosque/atlas.png`.
  - Formato: Rehacer a pixel art con contorno 1 px y 2–3 tonos por color (no degradé); resolución nativa ≈1,0 u/px. Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Dama del Bosque, elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #2e3a2e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Dama del Bosque, elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #2e3a2e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Dama del Bosque, elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #2e3a2e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Dama del Bosque, elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #2e3a2e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Dama del Bosque, elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #2e3a2e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Dama del Bosque, elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #2e3a2e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Dama del Bosque, elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #2e3a2e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Dama del Bosque, elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #2e3a2e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Dama del Bosque, elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #2e3a2e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B072 — Demonio Hechicero (demonio_mago, elite, arena infernal)  
*Prioridad P0 · PENDIENTE*

- **`C-ENEMY-demonio_mago`** — Demonio Hechicero (demonio_mago, elite, arena infernal). Enemigo elite de la arena infernal. Estados que el motor rellena clonando/espejando en vez de dibujar: 4 de 11 (idle, hit, hit_D, death). Criatura: Hechiceros de la Horda. Aprendieron magia de los que corrompieron. Comportamiento: Mantiene distancia y lanza fuego. Ataques: Proyectil de fuego. Detalle y prompts por estado en enemigos/infernal.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/infernal/demonio_mago/atlas.png`.
  - Formato: Rehacer a pixel art con contorno 1 px y 2–3 tonos por color (no degradé); resolución nativa ≈1,0 u/px. Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Demonio Hechicero, elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a63ad. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Demonio Hechicero, elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a63ad. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Demonio Hechicero, elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a63ad. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Demonio Hechicero, elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a63ad. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Demonio Hechicero, elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a63ad. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Demonio Hechicero, elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a63ad. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Demonio Hechicero, elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a63ad. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Demonio Hechicero, elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a63ad. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Demonio Hechicero, elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a63ad. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B073 — Esfinge (esfinge, elite, arena laberinto)  
*Prioridad P0 · PENDIENTE*

- **`C-ENEMY-esfinge`** — Esfinge (esfinge, elite, arena laberinto). Enemigo elite de la arena laberinto. Estados que el motor rellena clonando/espejando en vez de dibujar: 6 de 11 (idle, walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: La Esfinge del Laberinto: cuerpo de león de arena y melena que arde como las antorchas del Guardián. Custodiaba los caminos; ahora los cierra. Comportamiento: Élite pesado que llega en los niveles altos. Ataques: Zarpazo, Embestida. Detalle y prompts por estado en enemigos/laberinto.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/laberinto/esfinge/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Esfinge, elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b3923f. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Esfinge, elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b3923f. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Esfinge, elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #b3923f. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Esfinge, elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #b3923f. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Esfinge, elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b3923f. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Esfinge, elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #b3923f. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Esfinge, elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #b3923f. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Esfinge, elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b3923f. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Esfinge, elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b3923f. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png`

## B074 — Gólem (golem, elite, arena infernal)  
*Prioridad P0 · PENDIENTE*

- **`C-ENEMY-golem`** — Gólem (golem, elite, arena infernal). Enemigo elite de la arena infernal. Estados que el motor rellena clonando/espejando en vez de dibujar: 7 de 11 (idle, walk_D, walk_U, attack_D, attack_U, hit, hit_D). Criatura: Gólems de roca fundida que sostienen las paredes de la dimensión de la Horda. Comportamiento: Lento y pesado. Ataques: Pisotón que aturde, Roca a distancia. Detalle y prompts por estado en enemigos/infernal.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/infernal/golem/atlas.png`.
  - Formato: Rehacer a pixel art con contorno 1 px y 2–3 tonos por color (no degradé); resolución nativa ≈1,0 u/px. Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Gólem, elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6b6f52. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Gólem, elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6b6f52. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Gólem, elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #6b6f52. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Gólem, elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #6b6f52. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Gólem, elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6b6f52. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Gólem, elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #6b6f52. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Gólem, elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #6b6f52. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Gólem, elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6b6f52. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Gólem, elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6b6f52. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/minas/mn_titan/atlas.png`

## B075 — Devoraluz (mn_devoraluz, elite, arena minas)  
*Prioridad P0 · PENDIENTE*

- **`C-ENEMY-mn_devoraluz`** — Devoraluz (mn_devoraluz, elite, arena minas). Enemigo elite de la arena minas. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Un depredador que no viene por los guardianes: viene por la luz. Recorre la mina apagando cada fuente que encuentra. Comportamiento: Élite especial (evento): elige una luz, viaja hasta ella, la devora con un aviso largo y busca la siguiente. Ataques: Devorar luz (se interrumpe con un golpe fuerte), Aliento de oscuridad en cono: apaga antorchas. Detalle y prompts por estado en enemigos/minas.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/minas/mn_devoraluz/atlas.png`.
  - Formato: Celda actual 68×49 (refH 44 px, 2.63 u/px): rehacer a ≈176×128 (refH ≈116 px) para llegar a ≈1,0 u/px. Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Devoraluz, elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #a020c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Devoraluz, elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #a020c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Devoraluz, elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #a020c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Devoraluz, elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #a020c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Devoraluz, elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #a020c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Devoraluz, elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #a020c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Devoraluz, elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #a020c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Devoraluz, elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #a020c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Devoraluz, elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #a020c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/minas/mn_titan/atlas.png`

## B076 — Tritón de las Fosas (tiburon_blanco, elite, arena acuatica)  
*Prioridad P0 · PENDIENTE*

- **`C-ENEMY-tiburon_blanco`** — Tritón de las Fosas (tiburon_blanco, elite, arena acuatica). Enemigo elite de la arena acuatica. Estados que el motor rellena clonando/espejando en vez de dibujar: 11 de 11 (idle, walk_R, walk_L, walk_D, walk_U, attack, attack_D, attack_U, hit, hit_D, death). Criatura: El más grande de los tiburones de las ruinas. Dicen que el Leviatán lo dejó vivir para que cace por él. Comportamiento: Élite: embiste y muerde fuerte. Ataques: Embestida, Mordida. Detalle y prompts por estado en enemigos/acuatica.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/acuatica/tiburon_blanco/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Tiburón Blanco, elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #dfe6ec. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Tiburón Blanco, elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #dfe6ec. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Tiburón Blanco, elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #dfe6ec. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Tiburón Blanco, elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #dfe6ec. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Tiburón Blanco, elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #dfe6ec. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Tiburón Blanco, elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #dfe6ec. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Tiburón Blanco, elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #dfe6ec. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Tiburón Blanco, elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #dfe6ec. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Tiburón Blanco, elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #dfe6ec. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/acuatica/anguila_electrica/idle_01.png`

## B077 — Demonio Mayor (demonio_mayor, jefe, arena infernal)  
*Prioridad P0 · PENDIENTE*

- **`C-ENEMY-demonio_mayor`** — Demonio Mayor (demonio_mayor, jefe, arena infernal). Enemigo jefe de la arena infernal. Estados que el motor rellena clonando/espejando en vez de dibujar: 4 de 11 (idle, hit, hit_D, death). Criatura: — Comportamiento: — Ataques: —. Detalle y prompts por estado en enemigos/infernal.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/infernal/demonio_mayor/atlas.png`.
  - Formato: Rehacer a pixel art con contorno 1 px y 2–3 tonos por color (no degradé); resolución nativa ≈1,0 u/px. Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Demonio Mayor, boss), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b02a20. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Demonio Mayor, boss), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b02a20. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Demonio Mayor, boss), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #b02a20. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Demonio Mayor, boss), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #b02a20. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Demonio Mayor, boss), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b02a20. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Demonio Mayor, boss), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #b02a20. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Demonio Mayor, boss), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #b02a20. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Demonio Mayor, boss), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b02a20. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Demonio Mayor, boss), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b02a20. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/minas/mn_titan/atlas.png`

## B078 — Jinete Sin Cabeza (jinete_sin_cabeza, jefe, arena bosque)  
*Prioridad P0 · PENDIENTE*

- **`C-ENEMY-jinete_sin_cabeza`** — Jinete Sin Cabeza (jinete_sin_cabeza, jefe, arena bosque). Enemigo jefe de la arena bosque. Estados que el motor rellena clonando/espejando en vez de dibujar: 7 de 11 (idle, walk_D, walk_U, attack_D, attack_U, hit, hit_D). Criatura: — Comportamiento: — Ataques: —. Detalle y prompts por estado en enemigos/divina.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/bosque/jinete_sin_cabeza/atlas.png`.
  - Formato: Rehacer a pixel art con contorno 1 px y 2–3 tonos por color (no degradé); resolución nativa ≈1,0 u/px. Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Jinete Sin Cabeza, boss), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #5a5a62. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Jinete Sin Cabeza, boss), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #5a5a62. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Jinete Sin Cabeza, boss), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #5a5a62. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Jinete Sin Cabeza, boss), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #5a5a62. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Jinete Sin Cabeza, boss), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #5a5a62. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Jinete Sin Cabeza, boss), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #5a5a62. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Jinete Sin Cabeza, boss), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #5a5a62. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Jinete Sin Cabeza, boss), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #5a5a62. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Jinete Sin Cabeza, boss), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #5a5a62. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/bosses/bosque/doblador_guerrero/v2/atlas.png`

## B079 — Cangrejo Araña (cangrejo_acorazado, normal, arena acuatica)  
*Prioridad P0 · PENDIENTE*

- **`C-ENEMY-cangrejo_acorazado`** — Cangrejo Araña (cangrejo_acorazado, normal, arena acuatica). Enemigo normal de la arena acuatica. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Cangrejos de patas larguísimas que crecieron dentro de las armaduras de los soldados ahogados: el caparazón es de hierro oxidado y los ojos, brasas bajo el agua. Comportamiento: Lento y duro; se clava en el lugar y pincha. Ataques: Tenaza. Detalle y prompts por estado en enemigos/acuatica.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/acuatica/cangrejo_acorazado/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Cangrejo Araña, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b0402c. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Cangrejo Araña, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b0402c. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Cangrejo Araña, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #b0402c. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Cangrejo Araña, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #b0402c. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Cangrejo Araña, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b0402c. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Cangrejo Araña, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #b0402c. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Cangrejo Araña, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #b0402c. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Cangrejo Araña, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b0402c. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Cangrejo Araña, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b0402c. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/laberinto/escorpion_gigante/walk-strip.png`

## B080 — Perro del Albañal (cm_perro, normal, arena ciudad)  
*Prioridad P0 · PENDIENTE*

- **`C-ENEMY-cm_perro`** — Perro del Albañal (cm_perro, normal, arena ciudad). Enemigo normal de la arena ciudad. Estados que el motor rellena clonando/espejando en vez de dibujar: 3 de 11 (idle, attack_D, attack_U). Criatura: Perros deformes que viven en los desagües. Se mueven en manada y huelen el miedo. Comportamiento: Sale por las rejillas. Rápido y frágil. Ataques: Mordida, Salto con aviso. Detalle y prompts por estado en enemigos/ciudad.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/ciudad/cm_perro/atlas.png`.
  - Formato: Celda actual 37×29 (refH 16 px, 2.59 u/px): rehacer a ≈96×72 (refH ≈41 px) para llegar a ≈1,0 u/px. Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Perro del Albañal, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6a3a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Perro del Albañal, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6a3a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Perro del Albañal, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #6a3a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Perro del Albañal, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #6a3a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Perro del Albañal, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6a3a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Perro del Albañal, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #6a3a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Perro del Albañal, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #6a3a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Perro del Albañal, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6a3a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Perro del Albañal, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6a3a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/micelial/sabueso/atlas.png`

## B081 — Medusa Eléctrica (medusa_electrica, normal, arena acuatica)  
*Prioridad P0 · PENDIENTE*

- **`C-ENEMY-medusa_electrica`** — Medusa Eléctrica (medusa_electrica, normal, arena acuatica). Enemigo normal de la arena acuatica. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Medusas que absorbieron la energía de los cristales perdidos en el fondo. Brillan porque están cargadas. Comportamiento: Flota y descarga al contacto. Ataques: Descarga eléctrica. Detalle y prompts por estado en enemigos/acuatica.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/acuatica/medusa_electrica/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Medusa Eléctrica, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a6fd8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Medusa Eléctrica, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a6fd8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Medusa Eléctrica, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a6fd8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Medusa Eléctrica, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a6fd8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Medusa Eléctrica, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a6fd8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Medusa Eléctrica, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a6fd8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Medusa Eléctrica, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a6fd8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Medusa Eléctrica, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a6fd8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Medusa Eléctrica, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a6fd8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/laberinto/medusa/walk-strip.png`

## B082 — Sirena Abisal (sirena_abisal, normal, arena acuatica)  
*Prioridad P0 · PENDIENTE*

- **`C-ENEMY-sirena_abisal`** — Sirena Abisal (sirena_abisal, normal, arena acuatica). Enemigo normal de la arena acuatica. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (idle, attack_D, attack_U, hit_D, death). Criatura: Sirenas que cantaban para guiar a los barcos. Ahora cantan para que los barcos se hundan. Comportamiento: Ataca a distancia. Ataques: Canto / proyectil de agua. Detalle y prompts por estado en enemigos/acuatica.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/acuatica/sirena_abisal/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Sirena Abisal, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #3a5a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Sirena Abisal, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #3a5a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Sirena Abisal, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #3a5a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Sirena Abisal, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #3a5a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Sirena Abisal, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #3a5a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Sirena Abisal, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #3a5a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Sirena Abisal, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #3a5a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Sirena Abisal, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #3a5a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Sirena Abisal, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #3a5a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/laberinto/medusa/walk-strip.png`

## B083 — Ahogado de las Ruinas (tiburon_joven, normal, arena acuatica)  
*Prioridad P0 · PENDIENTE*

- **`C-ENEMY-tiburon_joven`** — Ahogado de las Ruinas (tiburon_joven, normal, arena acuatica). Enemigo normal de la arena acuatica. Estados que el motor rellena clonando/espejando en vez de dibujar: 11 de 11 (idle, walk_R, walk_L, walk_D, walk_U, attack, attack_D, attack_U, hit, hit_D, death). Criatura: Tiburones de las ruinas hundidas. Desde que el agua se volvió inestable nadan en círculos que no terminan. Comportamiento: Rápido, ataca de frente. Ataques: Mordida. Detalle y prompts por estado en enemigos/acuatica.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/acuatica/tiburon_joven/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Tiburón Joven, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #4a78a8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Tiburón Joven, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #4a78a8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Tiburón Joven, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #4a78a8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Tiburón Joven, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #4a78a8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Tiburón Joven, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #4a78a8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Tiburón Joven, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #4a78a8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Tiburón Joven, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #4a78a8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Tiburón Joven, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #4a78a8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Tiburón Joven, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #4a78a8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/acuatica/anguila_electrica/idle_01.png`

## B084 — Acechante de los Tejados (cm_acechante, subelite, arena ciudad)  
*Prioridad P0 · PENDIENTE*

- **`C-ENEMY-cm_acechante`** — Acechante de los Tejados (cm_acechante, subelite, arena ciudad). Enemigo subelite de la arena ciudad. Estados que el motor rellena clonando/espejando en vez de dibujar: 1 de 11 (idle). Criatura: Una criatura que se mueve entre los tejados y las cornisas. Cae sobre sus objetivos. Comportamiento: Salta entre tejados (no se lo puede herir arriba), cae con aviso, pelea y vuelve a subir. Ataques: Caída desde el tejado (círculo rojo en el piso). Detalle y prompts por estado en enemigos/ciudad.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/ciudad/cm_acechante/atlas.png`.
  - Formato: Celda actual 30×41 (refH 21 px, 2.67 u/px): rehacer a ≈80×112 (refH ≈56 px) para llegar a ≈1,0 u/px. Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Acechante de los Tejados, sub-elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9a3040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Acechante de los Tejados, sub-elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9a3040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Acechante de los Tejados, sub-elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #9a3040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Acechante de los Tejados, sub-elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #9a3040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Acechante de los Tejados, sub-elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9a3040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Acechante de los Tejados, sub-elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #9a3040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Acechante de los Tejados, sub-elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #9a3040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Acechante de los Tejados, sub-elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9a3040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Acechante de los Tejados, sub-elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9a3040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B085 — Demonio Menor (demonio_menor, subelite, arena infernal)  
*Prioridad P0 · PENDIENTE*

- **`C-ENEMY-demonio_menor`** — Demonio Menor (demonio_menor, subelite, arena infernal). Enemigo subelite de la arena infernal. Estados que el motor rellena clonando/espejando en vez de dibujar: 4 de 11 (idle, hit, hit_D, death). Criatura: Demonios menores de la Horda: pequeños, crueles y siempre en llamas. Comportamiento: Hace llover fuego sobre tu posición. Ataques: Lluvia de fuego. Detalle y prompts por estado en enemigos/infernal.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/infernal/demonio_menor/atlas.png`.
  - Formato: Rehacer a pixel art con contorno 1 px y 2–3 tonos por color (no degradé); resolución nativa ≈1,0 u/px. Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Demonio Menor, sub-elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #d94a1e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Demonio Menor, sub-elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #d94a1e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Demonio Menor, sub-elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #d94a1e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Demonio Menor, sub-elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #d94a1e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Demonio Menor, sub-elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #d94a1e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Demonio Menor, sub-elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #d94a1e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Demonio Menor, sub-elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #d94a1e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Demonio Menor, sub-elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #d94a1e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Demonio Menor, sub-elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #d94a1e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B086 — A-03 Ángel Corrompido (forma 1 del jefe final)  
*Prioridad P0 · PENDIENTE*

- **`C-FORMA-angel_corrompido`** — Forma/transformación de jefe. A-03 Ángel Corrompido (forma 1 del jefe final). Forma/pieza de jefe (fuente: LA_HORDA_MISSING_ASSETS.md / LA_HORDA_COMBAT_MISSING_ASSETS.md / LA_HORDA_CODEX_MISSING_ASSETS.md; código: js/arenas/infernal/inf-hechicero.js).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/jefes/angel_corrompido/`.
  - Formato: Celda 128×128: idle 6, cast 8, ataque 8, daño 3, muerte 12 (+4 cristales orbitando aparte). Hoy es el Hechicero recoloreado con alas procedurales (TINTED en enemy_coverage.js). PNG RGBA, alfa 0/255, vecino más cercano; atlas por animación, píxel nativo ≈1,0 u/px.
  - Prompt: `Pixel art boss form sprite, A-03 Ángel Corrompido (forma 1 del jefe final), large, facing the camera, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/bosses/infernal/hechicero/angel/atlas.png`

## B087 — HS-01 Hechicero Supremo "angelical" con alas de luz (retrato grande, 4 cuadros de respiración)  
*Prioridad P0 · PENDIENTE*

- **`C-FORMA-hechicero_alado`** — Forma/transformación de jefe. HS-01 Hechicero Supremo "angelical" con alas de luz (retrato grande, 4 cuadros de respiración). Forma/pieza de jefe (fuente: LA_HORDA_MISSING_ASSETS.md / LA_HORDA_COMBAT_MISSING_ASSETS.md / LA_HORDA_CODEX_MISSING_ASSETS.md; código: js/ui/run-intro.js).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/jefes/hechicero_alado/`.
  - Formato: Retrato de pantalla previa (run-intro): tamaño a definir con Claude (≥ canon 1,0 u/px); hoy sprite real + alas procedurales en canvas. PNG RGBA, alfa 0/255, vecino más cercano; atlas por animación, píxel nativo ≈1,0 u/px.
  - Prompt: `Pixel art boss form sprite, HS-01 Hechicero Supremo "angelical" con alas de luz (retrato grande, 4 cuadros de respiración), large, facing the camera, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/bosses/hielo/mago_hielo_cristal/v2/atlas.png`

## B088 — A-02 Pared agrietada del Laberinto (intacta, agrietada ×3, derrumbe ×8, escombro)  
*Prioridad P0 · PENDIENTE*

- **`D-MEC-A-02`** — Objeto de equipo (ícono y/o sprite). A-02 Pared agrietada del Laberinto (intacta, agrietada ×3, derrumbe ×8, escombro). Mecánica/regla de jefe de la arena laberinto hoy dibujada por código o con arte prestado (fuente: LA_HORDA_MISSING_ASSETS.md).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/laberinto/pared_agrietada.png`.
  - Formato: Tramo horizontal 64×32 y vertical 32×64 tileables; 2 direcciones. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo, loops sin costura.
  - Prompt: `Pixel art game item icon, A-02 Pared agrietada del Laberinto (intacta, agrietada ×3, derrumbe ×8, escombro), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/skins/manada/sigil_0.png`

## B089 — Retrato/hoja de campo de batalla "dragon_forja"  
*Prioridad P0 · PENDIENTE*

- **`C-BF-dragon_forja`** — Monstruo de campo de batalla (Guerra de Cristales). Retrato/hoja de campo de batalla "dragon_forja". El juego dibuja el tipo "dragon_forja" con esta tira en TODAS las arenas (entities.js:309 llama battlefieldDrawMonster primero; verificado ejecutando enemy_coverage.js: la fuente de idle/walk es assets/sprites/battlefield/dragon_forja.png).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/jefes/dragon_forja/atlas.png`.
  - Formato: Reentregar como atlas de píxel nativo: cuerpo ≈206 px de alto (1,0 u/px; banda aceptable 86–458 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. Poses: reposo, caminar 4–6, ataque 4, golpe 2, muerte 6 (+ habilidades del jefe). PNG RGBA, alfa 0/255, vecino más cercano, atlas 8 columnas, celdas iguales.
  - Prompt: `Pixel art monster sprite, Retrato/hoja de campo de batalla "dragon_forja", side view facing right, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png`, `tools/art/battlefield_pixelize.py (reduce a la grilla nativa)`

## B090 — Retrato/hoja de campo de batalla "leviatan"  
*Prioridad P0 · PENDIENTE*

- **`C-BF-leviatan`** — Monstruo de campo de batalla (Guerra de Cristales). Retrato/hoja de campo de batalla "leviatan". El juego dibuja el tipo "leviatan" con esta tira en TODAS las arenas (entities.js:309 llama battlefieldDrawMonster primero; verificado ejecutando enemy_coverage.js: la fuente de idle/walk es assets/sprites/battlefield/leviatan.png).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/jefes/leviatan/atlas.png`.
  - Formato: Reentregar como atlas de píxel nativo: cuerpo ≈230 px de alto (1,0 u/px; banda aceptable 96–511 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. Poses: reposo, caminar 4–6, ataque 4, golpe 2, muerte 6 (+ habilidades del jefe). PNG RGBA, alfa 0/255, vecino más cercano, atlas 8 columnas, celdas iguales.
  - Prompt: `Pixel art monster sprite, Retrato/hoja de campo de batalla "leviatan", side view facing right, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png`, `tools/art/battlefield_pixelize.py (reduce a la grilla nativa)`

## B091 — Retrato/hoja de campo de batalla "micelio"  
*Prioridad P0 · PENDIENTE*

- **`C-BF-micelio`** — Monstruo de campo de batalla (Guerra de Cristales). Retrato/hoja de campo de batalla "micelio". El juego dibuja el tipo "micelio" con esta tira en TODAS las arenas (entities.js:309 llama battlefieldDrawMonster primero; verificado ejecutando enemy_coverage.js: la fuente de idle/walk es assets/sprites/battlefield/micelio.png).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/jefes/micelio/atlas.png`.
  - Formato: Reentregar como atlas de píxel nativo: cuerpo ≈185 px de alto (1,0 u/px; banda aceptable 77–411 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. Poses: reposo, caminar 4–6, ataque 4, golpe 2, muerte 6 (+ habilidades del jefe). PNG RGBA, alfa 0/255, vecino más cercano, atlas 8 columnas, celdas iguales.
  - Prompt: `Pixel art monster sprite, Retrato/hoja de campo de batalla "micelio", side view facing right, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/arenas/minas/mn_titan/atlas.png`, `tools/art/battlefield_pixelize.py (reduce a la grilla nativa)`

## B092 — Retrato/hoja de campo de batalla "minotauro"  
*Prioridad P0 · PENDIENTE*

- **`C-BF-minotauro`** — Monstruo de campo de batalla (Guerra de Cristales). Retrato/hoja de campo de batalla "minotauro". El juego dibuja el tipo "minotauro" con esta tira en TODAS las arenas (entities.js:309 llama battlefieldDrawMonster primero; verificado ejecutando enemy_coverage.js: la fuente de idle/walk es assets/sprites/battlefield/minotauro.png).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/jefes/minotauro/atlas.png`.
  - Formato: Reentregar como atlas de píxel nativo: cuerpo ≈196 px de alto (1,0 u/px; banda aceptable 82–436 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. Poses: reposo, caminar 4–6, ataque 4, golpe 2, muerte 6 (+ habilidades del jefe). PNG RGBA, alfa 0/255, vecino más cercano, atlas 8 columnas, celdas iguales.
  - Prompt: `Pixel art monster sprite, Retrato/hoja de campo de batalla "minotauro", side view facing right, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/arenas/minas/mn_titan/atlas.png`, `tools/art/battlefield_pixelize.py (reduce a la grilla nativa)`

## B093 — Portada de arena "Abismo" (JPG 960×420)  
*Prioridad P0 · PENDIENTE*

- **`D-PORTADA-abismo`** — Portada de arena (ilustración). Portada de arena "Abismo" (JPG 960×420). Códice (codex.js:270), Libro de la Horda (teñida de tinta), ficha de arena (arena-briefing.js:58), campamento (camp.js:204,298), pantallas de historia (story.js:340).
  - Método: runway (ilustración, sin reducir a pixel). Entrega: `art-source/entregas/2026-10_mundo/portadas/abismo.png`.
  - Formato: PNG 960×420 pixel art nativo (o grilla nativa que se acuerde, p. ej. 480×210 ×2), sin texto, sin degradé de compresión, ≤ 250 tonos, ≤ 170 KB. Componer para que el centro-derecha quede legible (el Libro recorta/panea).
  - Prompt: `Dark fantasy illustration cover of the arena, Portada de arena "Abismo" (JPG 960×420), wide composition, painterly, strong silhouette, no text.`
  - Referencias: `assets/sprites/battlefield/oak.png`, `assets/vfx/ciudad/tex_calle.png`

## B094 — Portada de arena "Ciudad Maldita" (JPG 960×420)  
*Prioridad P0 · PENDIENTE*

- **`D-PORTADA-ciudad`** — Portada de arena (ilustración). Portada de arena "Ciudad Maldita" (JPG 960×420). Códice (codex.js:270), Libro de la Horda (teñida de tinta), ficha de arena (arena-briefing.js:58), campamento (camp.js:204,298), pantallas de historia (story.js:340).
  - Método: runway (ilustración, sin reducir a pixel). Entrega: `art-source/entregas/2026-10_mundo/portadas/ciudad.png`.
  - Formato: PNG 960×420 pixel art nativo (o grilla nativa que se acuerde, p. ej. 480×210 ×2), sin texto, sin degradé de compresión, ≤ 250 tonos, ≤ 170 KB. Componer para que el centro-derecha quede legible (el Libro recorta/panea).
  - Prompt: `Dark fantasy illustration cover of the arena, Portada de arena "Ciudad Maldita" (JPG 960×420), wide composition, painterly, strong silhouette, no text.`
  - Referencias: `assets/sprites/battlefield/oak.png`, `assets/vfx/ciudad/tex_calle.png`

## B095 — Portada de arena "Infernal" (JPG 960×420)  
*Prioridad P0 · PENDIENTE*

- **`D-PORTADA-infernal`** — Portada de arena (ilustración). Portada de arena "Infernal" (JPG 960×420). Códice (codex.js:270), Libro de la Horda (teñida de tinta), ficha de arena (arena-briefing.js:58), campamento (camp.js:204,298), pantallas de historia (story.js:340).
  - Método: runway (ilustración, sin reducir a pixel). Entrega: `art-source/entregas/2026-10_mundo/portadas/infernal.png`.
  - Formato: PNG 960×420 pixel art nativo (o grilla nativa que se acuerde, p. ej. 480×210 ×2), sin texto, sin degradé de compresión, ≤ 250 tonos, ≤ 170 KB. Componer para que el centro-derecha quede legible (el Libro recorta/panea).
  - Prompt: `Dark fantasy illustration cover of the arena, Portada de arena "Infernal" (JPG 960×420), wide composition, painterly, strong silhouette, no text.`
  - Referencias: `assets/sprites/battlefield/oak.png`, `assets/vfx/ciudad/tex_calle.png`

## B096 — Portada de arena "Minas Profundas" (JPG 960×420)  
*Prioridad P0 · PENDIENTE*

- **`D-PORTADA-minas`** — Portada de arena (ilustración). Portada de arena "Minas Profundas" (JPG 960×420). Códice (codex.js:270), Libro de la Horda (teñida de tinta), ficha de arena (arena-briefing.js:58), campamento (camp.js:204,298), pantallas de historia (story.js:340).
  - Método: runway (ilustración, sin reducir a pixel). Entrega: `art-source/entregas/2026-10_mundo/portadas/minas.png`.
  - Formato: PNG 960×420 pixel art nativo (o grilla nativa que se acuerde, p. ej. 480×210 ×2), sin texto, sin degradé de compresión, ≤ 250 tonos, ≤ 170 KB. Componer para que el centro-derecha quede legible (el Libro recorta/panea).
  - Prompt: `Dark fantasy illustration cover of the arena, Portada de arena "Minas Profundas" (JPG 960×420), wide composition, painterly, strong silhouette, no text.`
  - Referencias: `assets/sprites/battlefield/oak.png`, `assets/vfx/ciudad/tex_calle.png`

## B286 — Foco de Convergencia (foco_convergencia, subelite) — piezas/estados propios / Foco de Hielo (foco_hielo, subelite) — piezas/estados propios / Tentáculo del Leviatán (lev_tentaculo, subelite) — piezas/estados propios / Núcleo Micelial (nucleo_micelial, subelite) — piezas/estados propios  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-foco_convergencia`** — Foco de Convergencia (foco_convergencia, subelite) — piezas/estados propios. Entidad de escenario/invocación de la arena infernal: se dibuja por partes o con arte compuesto; no camina en 4 direcciones. Criatura: — Comportamiento: — Ataques: —. Detalle y prompts por estado en enemigos/otras.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/infernal/foco_convergencia/atlas.png`.
  - Formato: Según la ficha de origen: A-05 Focos de Convergencia (48×96; idle 6 + quiebre 8; 4 colores). PNG RGBA, alfa 0/255, vecino más cercano, pies/ancla abajo-centro.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Foco de Convergencia, sub-elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #ffd27a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Foco de Convergencia, sub-elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #ffd27a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Foco de Convergencia, sub-elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #ffd27a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Foco de Convergencia, sub-elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #ffd27a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Foco de Convergencia, sub-elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #ffd27a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Foco de Convergencia, sub-elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #ffd27a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Foco de Convergencia, sub-elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #ffd27a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Foco de Convergencia, sub-elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #ffd27a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Foco de Convergencia, sub-elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #ffd27a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png`
- **`C-ENEMY-foco_hielo`** — Foco de Hielo (foco_hielo, subelite) — piezas/estados propios. Entidad de escenario/invocación de la arena hielo: se dibuja por partes o con arte compuesto; no camina en 4 direcciones. Criatura: — Comportamiento: — Ataques: —. Detalle y prompts por estado en enemigos/otras.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/hielo/foco_hielo/atlas.png`.
  - Formato: Según la ficha de origen: A-07 Foco de Hielo (48×96; idle 6 + quiebre 8). PNG RGBA, alfa 0/255, vecino más cercano, pies/ancla abajo-centro.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Foco de Hielo, sub-elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #bfe8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Foco de Hielo, sub-elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #bfe8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Foco de Hielo, sub-elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #bfe8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Foco de Hielo, sub-elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #bfe8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Foco de Hielo, sub-elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #bfe8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Foco de Hielo, sub-elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #bfe8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Foco de Hielo, sub-elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #bfe8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Foco de Hielo, sub-elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #bfe8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Foco de Hielo, sub-elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #bfe8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png`
- **`C-ENEMY-lev_tentaculo`** — Tentáculo del Leviatán (lev_tentaculo, subelite) — piezas/estados propios. Entidad de escenario/invocación de la arena acuatica: se dibuja por partes o con arte compuesto; no camina en 4 direcciones. Criatura: — Comportamiento: — Ataques: —. Detalle y prompts por estado en enemigos/otras.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/acuatica/lev_tentaculo/atlas.png`.
  - Formato: Según la ficha de origen: A-06 Tentáculos del Leviatán (64×128; emerger 4, idle 4, acción 6, hundirse 4; 3 variantes). PNG RGBA, alfa 0/255, vecino más cercano, pies/ancla abajo-centro.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Tentáculo del Leviatán, sub-elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9a4ac0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Tentáculo del Leviatán, sub-elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9a4ac0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Tentáculo del Leviatán, sub-elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #9a4ac0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Tentáculo del Leviatán, sub-elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #9a4ac0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Tentáculo del Leviatán, sub-elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9a4ac0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Tentáculo del Leviatán, sub-elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #9a4ac0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Tentáculo del Leviatán, sub-elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #9a4ac0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Tentáculo del Leviatán, sub-elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9a4ac0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Tentáculo del Leviatán, sub-elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9a4ac0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png`
- **`C-ENEMY-nucleo_micelial`** — Núcleo Micelial (nucleo_micelial, subelite) — piezas/estados propios. Entidad de escenario/invocación de la arena micelial: se dibuja por partes o con arte compuesto; no camina en 4 direcciones. Criatura: Corazones de la colonia que brotan del suelo. Cada uno es un pedazo de la Madre intentando crecer. Comportamiento: No se mueve: crece en 4 etapas. Ataques: Infecta el piso, Al madurar escupe enemigos. Detalle y prompts por estado en enemigos/micelial.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/micelial/nucleo_micelial/atlas.png`.
  - Formato: Según la ficha de origen: A-08 Red micelial: núcleo/raíz-tendón (raíz 64×24 latido 4). PNG RGBA, alfa 0/255, vecino más cercano, pies/ancla abajo-centro.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Núcleo Micelial, sub-elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c060ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Núcleo Micelial, sub-elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c060ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Núcleo Micelial, sub-elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #c060ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Núcleo Micelial, sub-elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #c060ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Núcleo Micelial, sub-elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c060ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Núcleo Micelial, sub-elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #c060ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Núcleo Micelial, sub-elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #c060ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Núcleo Micelial, sub-elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c060ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Núcleo Micelial, sub-elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c060ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png`

## B287 — Raíz de Absorción (raiz_absorcion, subelite) — piezas/estados propios / La Madre Espora (madre_espora, jefe) — piezas/estados propios / Tentáculo del Abismo (ab_tentaculo, subelite) — piezas/estados propios / Gran Número (cm_cometa, normal) — piezas/estados propios  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-raiz_absorcion`** — Raíz de Absorción (raiz_absorcion, subelite) — piezas/estados propios. Entidad de escenario/invocación de la arena micelial: se dibuja por partes o con arte compuesto; no camina en 4 direcciones. Criatura: Las raíces con las que el Micelio Primigenio se alimenta de los caídos. Comportamiento: Se estira desde un cadáver hasta el Micelio. Ataques: Cura al Micelio mientras vive. Detalle y prompts por estado en enemigos/micelial.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/micelial/raiz_absorcion/atlas.png`.
  - Formato: Según la ficha de origen: A-08 Red micelial: raíz-tendón. PNG RGBA, alfa 0/255, vecino más cercano, pies/ancla abajo-centro.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Raíz de Absorción, sub-elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #e070ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Raíz de Absorción, sub-elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #e070ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Raíz de Absorción, sub-elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #e070ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Raíz de Absorción, sub-elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #e070ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Raíz de Absorción, sub-elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #e070ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Raíz de Absorción, sub-elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #e070ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Raíz de Absorción, sub-elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #e070ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Raíz de Absorción, sub-elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #e070ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Raíz de Absorción, sub-elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #e070ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png`
- **`C-ENEMY-madre_espora`** — La Madre Espora (madre_espora, jefe) — piezas/estados propios. Entidad de escenario/invocación de la arena micelial: se dibuja por partes o con arte compuesto; no camina en 4 direcciones. Criatura: — Comportamiento: — Ataques: —. Detalle y prompts por estado en enemigos/micelial.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/micelial/madre_espora/atlas.png`.
  - Formato: Según la ficha de origen: Madre Espora: frames completos del cuerpo (hoy retrato por partes en el escenario). PNG RGBA, alfa 0/255, vecino más cercano, pies/ancla abajo-centro.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (La Madre Espora, boss), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #ff60d0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (La Madre Espora, boss), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #ff60d0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (La Madre Espora, boss), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #ff60d0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (La Madre Espora, boss), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #ff60d0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (La Madre Espora, boss), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #ff60d0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (La Madre Espora, boss), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #ff60d0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (La Madre Espora, boss), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #ff60d0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (La Madre Espora, boss), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #ff60d0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (La Madre Espora, boss), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #ff60d0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png`
- **`C-ENEMY-ab_tentaculo`** — Tentáculo del Abismo (ab_tentaculo, subelite) — piezas/estados propios. Entidad de escenario/invocación de la arena abismo: se dibuja por partes o con arte compuesto; no camina en 4 direcciones. Criatura: Uno de los brazos de El Que Mora Debajo. Asoma por los bordes cuando el Ojo está despierto. Comportamiento: Aplasta y agrieta los bordes. Ataques: Aplastar. Detalle y prompts por estado en enemigos/abismo.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/abismo/ab_tentaculo/atlas.png`.
  - Formato: Según la ficha de origen: AB-BO-03 Tentáculo de combate (surgir, idle, preparación, aplastar, daño, hundirse). PNG RGBA, alfa 0/255, vecino más cercano, pies/ancla abajo-centro.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Tentáculo del Abismo, sub-elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a3ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Tentáculo del Abismo, sub-elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a3ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Tentáculo del Abismo, sub-elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a3ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Tentáculo del Abismo, sub-elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a3ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Tentáculo del Abismo, sub-elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a3ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Tentáculo del Abismo, sub-elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a3ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Tentáculo del Abismo, sub-elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a3ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Tentáculo del Abismo, sub-elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a3ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Tentáculo del Abismo, sub-elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a3ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png`
- **`C-ENEMY-cm_cometa`** — Gran Número (cm_cometa, normal) — piezas/estados propios. Entidad de escenario/invocación de la arena ciudad: se dibuja por partes o con arte compuesto; no camina en 4 direcciones. Criatura: — Comportamiento: — Ataques: —. Detalle y prompts por estado en enemigos/otras.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/ciudad/cm_cometa/atlas.png`.
  - Formato: Según la ficha de origen: A-09 Cometa del Gran Número (vuelo 6 + impacto 5, 48×48). PNG RGBA, alfa 0/255, vecino más cercano, pies/ancla abajo-centro.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Gran Número, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #ff8030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Gran Número, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #ff8030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Gran Número, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #ff8030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Gran Número, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #ff8030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Gran Número, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #ff8030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Gran Número, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #ff8030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Gran Número, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #ff8030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Gran Número, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #ff8030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Gran Número, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #ff8030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png`

## B288 — Silueta base "Hoja" (Arma): sable curvo y liviano, filo fino / Silueta base "Filo" (Arma): hoja recta ancha con el filo brillante, cargada / Silueta base "Colmillo" (Arma): daga curva como un colmillo, gotas en la punta / Silueta base "Espada" (Arma): espada larga de guardia ancha, empuñadura liviana  
*Prioridad P1 · PENDIENTE*

- **`C-ITEM-base_arma_hoja`** — Objeto de equipo (ícono y/o sprite). Silueta base "Hoja" (Arma): sable curvo y liviano, filo fino. Cubre ~90 %% del botín: una silueta GRIS NEUTRO que el juego tiñe por material de familia (no pintar color de familia).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/base_arma_hoja.png`.
  - Formato: PNG 64×64 en grises neutros (4–6 tonos), contorno 1 px, alfa 0/255, sin marco ni texto.
  - Prompt: `Pixel art game item icon, Silueta base "Hoja" (Arma): sable curvo y liviano, filo fino, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-base_arma_filo`** — Objeto de equipo (ícono y/o sprite). Silueta base "Filo" (Arma): hoja recta ancha con el filo brillante, cargada. Cubre ~90 %% del botín: una silueta GRIS NEUTRO que el juego tiñe por material de familia (no pintar color de familia).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/base_arma_filo.png`.
  - Formato: PNG 64×64 en grises neutros (4–6 tonos), contorno 1 px, alfa 0/255, sin marco ni texto.
  - Prompt: `Pixel art game item icon, Silueta base "Filo" (Arma): hoja recta ancha con el filo brillante, cargada, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-base_arma_colmillo`** — Objeto de equipo (ícono y/o sprite). Silueta base "Colmillo" (Arma): daga curva como un colmillo, gotas en la punta. Cubre ~90 %% del botín: una silueta GRIS NEUTRO que el juego tiñe por material de familia (no pintar color de familia).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/base_arma_colmillo.png`.
  - Formato: PNG 64×64 en grises neutros (4–6 tonos), contorno 1 px, alfa 0/255, sin marco ni texto.
  - Prompt: `Pixel art game item icon, Silueta base "Colmillo" (Arma): daga curva como un colmillo, gotas en la punta, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-base_arma_espada`** — Objeto de equipo (ícono y/o sprite). Silueta base "Espada" (Arma): espada larga de guardia ancha, empuñadura liviana. Cubre ~90 %% del botín: una silueta GRIS NEUTRO que el juego tiñe por material de familia (no pintar color de familia).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/base_arma_espada.png`.
  - Formato: PNG 64×64 en grises neutros (4–6 tonos), contorno 1 px, alfa 0/255, sin marco ni texto.
  - Prompt: `Pixel art game item icon, Silueta base "Espada" (Arma): espada larga de guardia ancha, empuñadura liviana, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B289 — Silueta base "Hacha" (Arma): hacha de una mano con hoja pesada / Silueta base "Cetro" (Arma): cetro corto con una gema en la cabeza / Silueta base "Escudo" (Escudo): escudo de cometa con remaches / Silueta base "Rodela" (Escudo): rodela redonda y liviana  
*Prioridad P1 · PENDIENTE*

- **`C-ITEM-base_arma_hacha`** — Objeto de equipo (ícono y/o sprite). Silueta base "Hacha" (Arma): hacha de una mano con hoja pesada. Cubre ~90 %% del botín: una silueta GRIS NEUTRO que el juego tiñe por material de familia (no pintar color de familia).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/base_arma_hacha.png`.
  - Formato: PNG 64×64 en grises neutros (4–6 tonos), contorno 1 px, alfa 0/255, sin marco ni texto.
  - Prompt: `Pixel art game item icon, Silueta base "Hacha" (Arma): hacha de una mano con hoja pesada, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-base_arma_cetro`** — Objeto de equipo (ícono y/o sprite). Silueta base "Cetro" (Arma): cetro corto con una gema en la cabeza. Cubre ~90 %% del botín: una silueta GRIS NEUTRO que el juego tiñe por material de familia (no pintar color de familia).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/base_arma_cetro.png`.
  - Formato: PNG 64×64 en grises neutros (4–6 tonos), contorno 1 px, alfa 0/255, sin marco ni texto.
  - Prompt: `Pixel art game item icon, Silueta base "Cetro" (Arma): cetro corto con una gema en la cabeza, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-base_escudo_escudo`** — Objeto de equipo (ícono y/o sprite). Silueta base "Escudo" (Escudo): escudo de cometa con remaches. Cubre ~90 %% del botín: una silueta GRIS NEUTRO que el juego tiñe por material de familia (no pintar color de familia).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/base_escudo_escudo.png`.
  - Formato: PNG 64×64 en grises neutros (4–6 tonos), contorno 1 px, alfa 0/255, sin marco ni texto.
  - Prompt: `Pixel art game item icon, Silueta base "Escudo" (Escudo): escudo de cometa con remaches, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-base_escudo_rodela`** — Objeto de equipo (ícono y/o sprite). Silueta base "Rodela" (Escudo): rodela redonda y liviana. Cubre ~90 %% del botín: una silueta GRIS NEUTRO que el juego tiñe por material de familia (no pintar color de familia).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/base_escudo_rodela.png`.
  - Formato: PNG 64×64 en grises neutros (4–6 tonos), contorno 1 px, alfa 0/255, sin marco ni texto.
  - Prompt: `Pixel art game item icon, Silueta base "Rodela" (Escudo): rodela redonda y liviana, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B290 — Silueta base "Égida" (Escudo): escudo redondo con un emblema radiante / Silueta base "Pavés" (Escudo): escudo torre alto / Silueta base "Yelmo" (Casco): yelmo cerrado con visera / Silueta base "Capucha" (Casco): capucha de tela con sombra adentro  
*Prioridad P1 · PENDIENTE*

- **`C-ITEM-base_escudo_egida`** — Objeto de equipo (ícono y/o sprite). Silueta base "Égida" (Escudo): escudo redondo con un emblema radiante. Cubre ~90 %% del botín: una silueta GRIS NEUTRO que el juego tiñe por material de familia (no pintar color de familia).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/base_escudo_egida.png`.
  - Formato: PNG 64×64 en grises neutros (4–6 tonos), contorno 1 px, alfa 0/255, sin marco ni texto.
  - Prompt: `Pixel art game item icon, Silueta base "Égida" (Escudo): escudo redondo con un emblema radiante, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-base_escudo_paves`** — Objeto de equipo (ícono y/o sprite). Silueta base "Pavés" (Escudo): escudo torre alto. Cubre ~90 %% del botín: una silueta GRIS NEUTRO que el juego tiñe por material de familia (no pintar color de familia).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/base_escudo_paves.png`.
  - Formato: PNG 64×64 en grises neutros (4–6 tonos), contorno 1 px, alfa 0/255, sin marco ni texto.
  - Prompt: `Pixel art game item icon, Silueta base "Pavés" (Escudo): escudo torre alto, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-base_casco_yelmo`** — Objeto de equipo (ícono y/o sprite). Silueta base "Yelmo" (Casco): yelmo cerrado con visera. Cubre ~90 %% del botín: una silueta GRIS NEUTRO que el juego tiñe por material de familia (no pintar color de familia).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/base_casco_yelmo.png`.
  - Formato: PNG 64×64 en grises neutros (4–6 tonos), contorno 1 px, alfa 0/255, sin marco ni texto.
  - Prompt: `Pixel art game item icon, Silueta base "Yelmo" (Casco): yelmo cerrado con visera, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-base_casco_capucha`** — Objeto de equipo (ícono y/o sprite). Silueta base "Capucha" (Casco): capucha de tela con sombra adentro. Cubre ~90 %% del botín: una silueta GRIS NEUTRO que el juego tiñe por material de familia (no pintar color de familia).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/base_casco_capucha.png`.
  - Formato: PNG 64×64 en grises neutros (4–6 tonos), contorno 1 px, alfa 0/255, sin marco ni texto.
  - Prompt: `Pixel art game item icon, Silueta base "Capucha" (Casco): capucha de tela con sombra adentro, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B291 — Silueta base "Corona" (Casco): corona de puntas con gemas / Silueta base "Máscara" (Casco): máscara de guerra con ojos rasgados / Silueta base "Coraza" (Pechera): coraza de placas / Silueta base "Pechera" (Pechera): peto acolchado con correas  
*Prioridad P1 · PENDIENTE*

- **`C-ITEM-base_casco_corona`** — Objeto de equipo (ícono y/o sprite). Silueta base "Corona" (Casco): corona de puntas con gemas. Cubre ~90 %% del botín: una silueta GRIS NEUTRO que el juego tiñe por material de familia (no pintar color de familia).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/base_casco_corona.png`.
  - Formato: PNG 64×64 en grises neutros (4–6 tonos), contorno 1 px, alfa 0/255, sin marco ni texto.
  - Prompt: `Pixel art game item icon, Silueta base "Corona" (Casco): corona de puntas con gemas, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-base_casco_mascara`** — Objeto de equipo (ícono y/o sprite). Silueta base "Máscara" (Casco): máscara de guerra con ojos rasgados. Cubre ~90 %% del botín: una silueta GRIS NEUTRO que el juego tiñe por material de familia (no pintar color de familia).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/base_casco_mascara.png`.
  - Formato: PNG 64×64 en grises neutros (4–6 tonos), contorno 1 px, alfa 0/255, sin marco ni texto.
  - Prompt: `Pixel art game item icon, Silueta base "Máscara" (Casco): máscara de guerra con ojos rasgados, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-base_pechera_coraza`** — Objeto de equipo (ícono y/o sprite). Silueta base "Coraza" (Pechera): coraza de placas. Cubre ~90 %% del botín: una silueta GRIS NEUTRO que el juego tiñe por material de familia (no pintar color de familia).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/base_pechera_coraza.png`.
  - Formato: PNG 64×64 en grises neutros (4–6 tonos), contorno 1 px, alfa 0/255, sin marco ni texto.
  - Prompt: `Pixel art game item icon, Silueta base "Coraza" (Pechera): coraza de placas, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-base_pechera_pechera`** — Objeto de equipo (ícono y/o sprite). Silueta base "Pechera" (Pechera): peto acolchado con correas. Cubre ~90 %% del botín: una silueta GRIS NEUTRO que el juego tiñe por material de familia (no pintar color de familia).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/base_pechera_pechera.png`.
  - Formato: PNG 64×64 en grises neutros (4–6 tonos), contorno 1 px, alfa 0/255, sin marco ni texto.
  - Prompt: `Pixel art game item icon, Silueta base "Pechera" (Pechera): peto acolchado con correas, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B292 — Silueta base "Manto" (Pechera): manto con capucha caída / Silueta base "Cota" (Pechera): cota de malla / Silueta base "Guanteletes" (Guantes): guanteletes de placas / Silueta base "Guantes" (Guantes): guantes de cuero ajustados  
*Prioridad P1 · PENDIENTE*

- **`C-ITEM-base_pechera_manto`** — Objeto de equipo (ícono y/o sprite). Silueta base "Manto" (Pechera): manto con capucha caída. Cubre ~90 %% del botín: una silueta GRIS NEUTRO que el juego tiñe por material de familia (no pintar color de familia).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/base_pechera_manto.png`.
  - Formato: PNG 64×64 en grises neutros (4–6 tonos), contorno 1 px, alfa 0/255, sin marco ni texto.
  - Prompt: `Pixel art game item icon, Silueta base "Manto" (Pechera): manto con capucha caída, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-base_pechera_cota`** — Objeto de equipo (ícono y/o sprite). Silueta base "Cota" (Pechera): cota de malla. Cubre ~90 %% del botín: una silueta GRIS NEUTRO que el juego tiñe por material de familia (no pintar color de familia).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/base_pechera_cota.png`.
  - Formato: PNG 64×64 en grises neutros (4–6 tonos), contorno 1 px, alfa 0/255, sin marco ni texto.
  - Prompt: `Pixel art game item icon, Silueta base "Cota" (Pechera): cota de malla, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-base_guantes_guanteletes`** — Objeto de equipo (ícono y/o sprite). Silueta base "Guanteletes" (Guantes): guanteletes de placas. Cubre ~90 %% del botín: una silueta GRIS NEUTRO que el juego tiñe por material de familia (no pintar color de familia).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/base_guantes_guanteletes.png`.
  - Formato: PNG 64×64 en grises neutros (4–6 tonos), contorno 1 px, alfa 0/255, sin marco ni texto.
  - Prompt: `Pixel art game item icon, Silueta base "Guanteletes" (Guantes): guanteletes de placas, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-base_guantes_guantes`** — Objeto de equipo (ícono y/o sprite). Silueta base "Guantes" (Guantes): guantes de cuero ajustados. Cubre ~90 %% del botín: una silueta GRIS NEUTRO que el juego tiñe por material de familia (no pintar color de familia).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/base_guantes_guantes.png`.
  - Formato: PNG 64×64 en grises neutros (4–6 tonos), contorno 1 px, alfa 0/255, sin marco ni texto.
  - Prompt: `Pixel art game item icon, Silueta base "Guantes" (Guantes): guantes de cuero ajustados, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B293 — Silueta base "Brazales" (Guantes): brazales con runas / Silueta base "Puños" (Guantes): puños con nudilleras / Silueta base "Botas" (Botas): botas de cuero altas / Silueta base "Grebas" (Botas): grebas de placas  
*Prioridad P1 · PENDIENTE*

- **`C-ITEM-base_guantes_brazales`** — Objeto de equipo (ícono y/o sprite). Silueta base "Brazales" (Guantes): brazales con runas. Cubre ~90 %% del botín: una silueta GRIS NEUTRO que el juego tiñe por material de familia (no pintar color de familia).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/base_guantes_brazales.png`.
  - Formato: PNG 64×64 en grises neutros (4–6 tonos), contorno 1 px, alfa 0/255, sin marco ni texto.
  - Prompt: `Pixel art game item icon, Silueta base "Brazales" (Guantes): brazales con runas, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-base_guantes_punos`** — Objeto de equipo (ícono y/o sprite). Silueta base "Puños" (Guantes): puños con nudilleras. Cubre ~90 %% del botín: una silueta GRIS NEUTRO que el juego tiñe por material de familia (no pintar color de familia).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/base_guantes_punos.png`.
  - Formato: PNG 64×64 en grises neutros (4–6 tonos), contorno 1 px, alfa 0/255, sin marco ni texto.
  - Prompt: `Pixel art game item icon, Silueta base "Puños" (Guantes): puños con nudilleras, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-base_botas_botas`** — Objeto de equipo (ícono y/o sprite). Silueta base "Botas" (Botas): botas de cuero altas. Cubre ~90 %% del botín: una silueta GRIS NEUTRO que el juego tiñe por material de familia (no pintar color de familia).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/base_botas_botas.png`.
  - Formato: PNG 64×64 en grises neutros (4–6 tonos), contorno 1 px, alfa 0/255, sin marco ni texto.
  - Prompt: `Pixel art game item icon, Silueta base "Botas" (Botas): botas de cuero altas, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-base_botas_grebas`** — Objeto de equipo (ícono y/o sprite). Silueta base "Grebas" (Botas): grebas de placas. Cubre ~90 %% del botín: una silueta GRIS NEUTRO que el juego tiñe por material de familia (no pintar color de familia).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/base_botas_grebas.png`.
  - Formato: PNG 64×64 en grises neutros (4–6 tonos), contorno 1 px, alfa 0/255, sin marco ni texto.
  - Prompt: `Pixel art game item icon, Silueta base "Grebas" (Botas): grebas de placas, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B294 — Silueta base "Sandalias" (Botas): sandalias atadas / Silueta base "Pasos" (Botas): botas livianas con alas o plumas  
*Prioridad P1 · PENDIENTE*

- **`C-ITEM-base_botas_sandalias`** — Objeto de equipo (ícono y/o sprite). Silueta base "Sandalias" (Botas): sandalias atadas. Cubre ~90 %% del botín: una silueta GRIS NEUTRO que el juego tiñe por material de familia (no pintar color de familia).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/base_botas_sandalias.png`.
  - Formato: PNG 64×64 en grises neutros (4–6 tonos), contorno 1 px, alfa 0/255, sin marco ni texto.
  - Prompt: `Pixel art game item icon, Silueta base "Sandalias" (Botas): sandalias atadas, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-base_botas_pasos`** — Objeto de equipo (ícono y/o sprite). Silueta base "Pasos" (Botas): botas livianas con alas o plumas. Cubre ~90 %% del botín: una silueta GRIS NEUTRO que el juego tiñe por material de familia (no pintar color de familia).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/base_botas_pasos.png`.
  - Formato: PNG 64×64 en grises neutros (4–6 tonos), contorno 1 px, alfa 0/255, sin marco ni texto.
  - Prompt: `Pixel art game item icon, Silueta base "Pasos" (Botas): botas livianas con alas o plumas, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B295 — Ícono de objeto "Esquirla de Tundraverx" (Legendario con nombre, Arma (arma)) / Ícono de objeto "Manto del Glaciar Dormido" (Legendario con nombre, Pechera (pechera)) / Ícono de objeto "Ojo del Ventisquero" (Legendario con nombre, Guantes (guantes)) / Ícono de objeto "Ascua de Belial" (Legendario con nombre, Arma (arma))  
*Prioridad P1 · PENDIENTE*

- **`C-ITEM-leg_tundraverx`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Esquirla de Tundraverx" (Legendario con nombre, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/leg_tundraverx.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Esquirla de Tundraverx" (Legendario con nombre, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-leg_glaciar_manto`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Manto del Glaciar Dormido" (Legendario con nombre, Pechera (pechera)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/leg_glaciar_manto.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Manto del Glaciar Dormido" (Legendario con nombre, Pechera (pechera)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-leg_ventisquero`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Ojo del Ventisquero" (Legendario con nombre, Guantes (guantes)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/leg_ventisquero.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Ojo del Ventisquero" (Legendario con nombre, Guantes (guantes)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-leg_belial`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Ascua de Belial" (Legendario con nombre, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/leg_belial.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Ascua de Belial" (Legendario con nombre, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B296 — Ícono de objeto "Guanteletes del Herrero Caído" (Legendario con nombre, Guantes (guantes)) / Ícono de objeto "Yelmo de Brasa Viva" (Legendario con nombre, Casco (casco)) / Ícono de objeto "Cadena de Ysolde" (Legendario con nombre, Arma (arma)) / Ícono de objeto "Botas del Relámpago Errante" (Legendario con nombre, Botas (botas))  
*Prioridad P1 · PENDIENTE*

- **`C-ITEM-leg_herrero_caido`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Guanteletes del Herrero Caído" (Legendario con nombre, Guantes (guantes)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/leg_herrero_caido.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Guanteletes del Herrero Caído" (Legendario con nombre, Guantes (guantes)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-leg_brasa_viva`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Yelmo de Brasa Viva" (Legendario con nombre, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/leg_brasa_viva.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Yelmo de Brasa Viva" (Legendario con nombre, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-leg_ysolde`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Cadena de Ysolde" (Legendario con nombre, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/leg_ysolde.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Cadena de Ysolde" (Legendario con nombre, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-leg_relampago_errante`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Botas del Relámpago Errante" (Legendario con nombre, Botas (botas)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/leg_relampago_errante.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Botas del Relámpago Errante" (Legendario con nombre, Botas (botas)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B297 — Ícono de objeto "Brazal de la Descarga" (Legendario con nombre, Guantes (guantes)) / Ícono de objeto "Muro de Kaelen" (Legendario con nombre, Escudo (escudo)) / Ícono de objeto "Pechera del Juramento Roto" (Legendario con nombre, Pechera (pechera)) / Ícono de objeto "Yelmo del Centinela" (Legendario con nombre, Casco (casco))  
*Prioridad P1 · PENDIENTE*

- **`C-ITEM-leg_descarga`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Brazal de la Descarga" (Legendario con nombre, Guantes (guantes)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/leg_descarga.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Brazal de la Descarga" (Legendario con nombre, Guantes (guantes)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-leg_kaelen`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Muro de Kaelen" (Legendario con nombre, Escudo (escudo)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/leg_kaelen.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Muro de Kaelen" (Legendario con nombre, Escudo (escudo)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-leg_juramento_roto`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Pechera del Juramento Roto" (Legendario con nombre, Pechera (pechera)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/leg_juramento_roto.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Pechera del Juramento Roto" (Legendario con nombre, Pechera (pechera)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-leg_centinela`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Yelmo del Centinela" (Legendario con nombre, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/leg_centinela.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Yelmo del Centinela" (Legendario con nombre, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B298 — Ícono de objeto "Hoja Sedienta de Morrah" (Legendario con nombre, Arma (arma)) / Ícono de objeto "Guantes del Carnicero" (Legendario con nombre, Guantes (guantes)) / Ícono de objeto "Botas de la Cacería Roja" (Legendario con nombre, Botas (botas)) / Ícono de objeto "Lágrima de Seraphine" (Legendario con nombre, Casco (casco))  
*Prioridad P1 · PENDIENTE*

- **`C-ITEM-leg_morrah`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Hoja Sedienta de Morrah" (Legendario con nombre, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/leg_morrah.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Hoja Sedienta de Morrah" (Legendario con nombre, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-leg_carnicero`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Guantes del Carnicero" (Legendario con nombre, Guantes (guantes)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/leg_carnicero.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Guantes del Carnicero" (Legendario con nombre, Guantes (guantes)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-leg_caceria_roja`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Botas de la Cacería Roja" (Legendario con nombre, Botas (botas)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/leg_caceria_roja.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Botas de la Cacería Roja" (Legendario con nombre, Botas (botas)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-leg_seraphine`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Lágrima de Seraphine" (Legendario con nombre, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/leg_seraphine.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Lágrima de Seraphine" (Legendario con nombre, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B299 — Ícono de objeto "Túnica del Peregrino" (Legendario con nombre, Pechera (pechera)) / Ícono de objeto "Sandalias del Primer Alba" (Legendario con nombre, Botas (botas)) / Ícono de objeto "Diadema de los Mil Sellos" (Legendario con nombre, Casco (casco)) / Ícono de objeto "Dedos de Ceniza Arcana" (Legendario con nombre, Guantes (guantes))  
*Prioridad P1 · PENDIENTE*

- **`C-ITEM-leg_peregrino`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Túnica del Peregrino" (Legendario con nombre, Pechera (pechera)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/leg_peregrino.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Túnica del Peregrino" (Legendario con nombre, Pechera (pechera)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-leg_alba_sandalias`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Sandalias del Primer Alba" (Legendario con nombre, Botas (botas)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/leg_alba_sandalias.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Sandalias del Primer Alba" (Legendario con nombre, Botas (botas)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-leg_mil_sellos`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Diadema de los Mil Sellos" (Legendario con nombre, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/leg_mil_sellos.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Diadema de los Mil Sellos" (Legendario con nombre, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-leg_ceniza_arcana`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Dedos de Ceniza Arcana" (Legendario con nombre, Guantes (guantes)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/leg_ceniza_arcana.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Dedos de Ceniza Arcana" (Legendario con nombre, Guantes (guantes)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B300 — Ícono de objeto "Pasos del Umbral" (Legendario con nombre, Botas (botas)) / Ícono de objeto "Filo de Medianoche" (Legendario con nombre, Arma (arma)) / Ícono de objeto "Máscara del Acecho Nocturno" (Legendario con nombre, Casco (casco)) / Ícono de objeto "Guantes del Duelista Silencioso" (Legendario con nombre, Guantes (guantes))  
*Prioridad P1 · PENDIENTE*

- **`C-ITEM-leg_umbral`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Pasos del Umbral" (Legendario con nombre, Botas (botas)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/leg_umbral.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Pasos del Umbral" (Legendario con nombre, Botas (botas)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-leg_medianoche`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Filo de Medianoche" (Legendario con nombre, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/leg_medianoche.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Filo de Medianoche" (Legendario con nombre, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-leg_acecho`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Máscara del Acecho Nocturno" (Legendario con nombre, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/leg_acecho.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Máscara del Acecho Nocturno" (Legendario con nombre, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-leg_duelista`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Guantes del Duelista Silencioso" (Legendario con nombre, Guantes (guantes)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/leg_duelista.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Guantes del Duelista Silencioso" (Legendario con nombre, Guantes (guantes)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B301 — Ícono de objeto "Escudo del Juggernaut" (Objeto de campeón, Escudo (escudo)) / Ícono de objeto "Corona del Paladín Eterno" (Objeto de campeón, Pechera (pechera)) / Ícono de objeto "Garra del Cazador" (Objeto de campeón, Botas (botas)) / Ícono de objeto "Colmillo del Verdugo" (Objeto de campeón, Arma (arma))  
*Prioridad P1 · PENDIENTE*

- **`C-ITEM-tanque_leg`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Escudo del Juggernaut" (Objeto de campeón, Escudo (escudo)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Tanque. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/tanque_leg.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Escudo del Juggernaut" (Objeto de campeón, Escudo (escudo)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-tanque_mit`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Corona del Paladín Eterno" (Objeto de campeón, Pechera (pechera)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Tanque. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/tanque_mit.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Corona del Paladín Eterno" (Objeto de campeón, Pechera (pechera)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-guerrero_leg`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Garra del Cazador" (Objeto de campeón, Botas (botas)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Asesino. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/guerrero_leg.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Garra del Cazador" (Objeto de campeón, Botas (botas)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-guerrero_mit`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Colmillo del Verdugo" (Objeto de campeón, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Asesino. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/guerrero_mit.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Colmillo del Verdugo" (Objeto de campeón, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B302 — Ícono de objeto "Cristal de Invierno Eterno" (Objeto de campeón, Casco (casco)) / Ícono de objeto "Corazón del Muro Eterno" (Objeto de campeón, Arma (arma)) / Ícono de objeto "Cáliz de Sobreabundancia" (Objeto de campeón, Pechera (pechera)) / Ícono de objeto "Aura de la Consagración" (Objeto de campeón, Arma (arma))  
*Prioridad P1 · PENDIENTE*

- **`C-ITEM-mago_leg`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Cristal de Invierno Eterno" (Objeto de campeón, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Mago. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/mago_leg.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Cristal de Invierno Eterno" (Objeto de campeón, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-mago_mit`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Corazón del Muro Eterno" (Objeto de campeón, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Mago. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/mago_mit.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Corazón del Muro Eterno" (Objeto de campeón, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-soporte_leg`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Cáliz de Sobreabundancia" (Objeto de campeón, Pechera (pechera)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Soporte. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/soporte_leg.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Cáliz de Sobreabundancia" (Objeto de campeón, Pechera (pechera)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-soporte_mit`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Aura de la Consagración" (Objeto de campeón, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Soporte. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/soporte_mit.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Aura de la Consagración" (Objeto de campeón, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B303 — Ícono de objeto "Yugo de la Furia" (Objeto de campeón, Pechera (pechera)) / Ícono de objeto "Corazón Carmesí" (Objeto de campeón, Arma (arma)) / Ícono de objeto "Fragmento de Recarga" (Objeto de campeón, Botas (botas)) / Ícono de objeto "Núcleo de Ejecución Forzada" (Objeto de campeón, Arma (arma))  
*Prioridad P1 · PENDIENTE*

- **`C-ITEM-segador_leg`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Yugo de la Furia" (Objeto de campeón, Pechera (pechera)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Segador Olvidado. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/segador_leg.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Yugo de la Furia" (Objeto de campeón, Pechera (pechera)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-segador_mit`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Corazón Carmesí" (Objeto de campeón, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Segador Olvidado. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/segador_mit.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Corazón Carmesí" (Objeto de campeón, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-axiom_leg`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Fragmento de Recarga" (Objeto de campeón, Botas (botas)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Axiom. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/axiom_leg.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Fragmento de Recarga" (Objeto de campeón, Botas (botas)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-axiom_mit`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Núcleo de Ejecución Forzada" (Objeto de campeón, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Axiom. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/axiom_mit.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Núcleo de Ejecución Forzada" (Objeto de campeón, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B304 — Ícono de objeto "Lágrima del Augurio" (Objeto de campeón, Casco (casco)) / Ícono de objeto "Cáliz del Sacrificio Menor" (Objeto de campeón, Pechera (pechera))  
*Prioridad P1 · PENDIENTE*

- **`C-ITEM-profeta_leg`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Lágrima del Augurio" (Objeto de campeón, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: La Profeta. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/profeta_leg.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Lágrima del Augurio" (Objeto de campeón, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-profeta_mit`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Cáliz del Sacrificio Menor" (Objeto de campeón, Pechera (pechera)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: La Profeta. Set: —.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/profeta_mit.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Cáliz del Sacrificio Menor" (Objeto de campeón, Pechera (pechera)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B305 — AB-SB-02 Pieza de cadena (eslabón, tramo, cadena rota, gancho) / AB-BO-04 Siluetas gigantes para el fondo de la fase 3 (cuerpo, tentáculos lejanos) / AB-FX-01 Derrumbe de plataforma (polvo y piedras que caen, 8 frames) / AB-FX-02 Reconstrucción (fragmentos que suben con luz arcana, 8 frames)  
*Prioridad P1 · PENDIENTE*

- **`D-ABISMO-SB-02`** — Objeto de equipo (ícono y/o sprite). AB-SB-02 Pieza de cadena (eslabón, tramo, cadena rota, gancho). Arena del Abismo. Hoy: hoy la cadena es procedural
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/abismo/ab_sb_02.png`.
  - Formato: Según el texto (Pieza de cadena (eslabón, tramo, cadena rota, gancho)). PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo ≈2,0 u/px para suelo y plataformas, 1,0 u/px para personajes.
  - Prompt: `Pixel art game item icon, AB-SB-02 Pieza de cadena (eslabón, tramo, cadena rota, gancho), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abismo/tex_piso.png`
- **`D-ABISMO-BO-04`** — Objeto de equipo (ícono y/o sprite). AB-BO-04 Siluetas gigantes para el fondo de la fase 3 (cuerpo, tentáculos lejanos). Arena del Abismo. Hoy: hoy se reutiliza el tentáculo grande
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/abismo/ab_bo_04.png`.
  - Formato: Según el texto (Siluetas gigantes para el fondo de la fase 3 (cuerpo, tentáculos lejanos)). PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo ≈2,0 u/px para suelo y plataformas, 1,0 u/px para personajes.
  - Prompt: `Pixel art game item icon, AB-BO-04 Siluetas gigantes para el fondo de la fase 3 (cuerpo, tentáculos lejanos), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abismo/tex_piso.png`
- **`D-ABISMO-FX-01`** — Objeto de equipo (ícono y/o sprite). AB-FX-01 Derrumbe de plataforma (polvo y piedras que caen, 8 frames). Arena del Abismo. Hoy: hoy son partículas genéricas
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/abismo/ab_fx_01.png`.
  - Formato: Según el texto (Derrumbe de plataforma (polvo y piedras que caen, 8 frames)). PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo ≈2,0 u/px para suelo y plataformas, 1,0 u/px para personajes.
  - Prompt: `Pixel art game item icon, AB-FX-01 Derrumbe de plataforma (polvo y piedras que caen, 8 frames), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abismo/tex_piso.png`
- **`D-ABISMO-FX-02`** — Objeto de equipo (ícono y/o sprite). AB-FX-02 Reconstrucción (fragmentos que suben con luz arcana, 8 frames). Arena del Abismo. Hoy: hoy partículas + contorno
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/abismo/ab_fx_02.png`.
  - Formato: Según el texto (Reconstrucción (fragmentos que suben con luz arcana, 8 frames)). PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo ≈2,0 u/px para suelo y plataformas, 1,0 u/px para personajes.
  - Prompt: `Pixel art game item icon, AB-FX-02 Reconstrucción (fragmentos que suben con luz arcana, 8 frames), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abismo/tex_piso.png`

## B306 — AB-PR-01 Orbe del Heraldo (vuelo 6, estallido 6) a 64 px  
*Prioridad P1 · PENDIENTE*

- **`D-ABISMO-PR-01`** — Objeto de equipo (ícono y/o sprite). AB-PR-01 Orbe del Heraldo (vuelo 6, estallido 6) a 64 px. Arena del Abismo. Hoy: el actual es de 3 frames chicos
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/abismo/ab_pr_01.png`.
  - Formato: Según el texto (Orbe del Heraldo (vuelo 6, estallido 6) a 64 px). PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo ≈2,0 u/px para suelo y plataformas, 1,0 u/px para personajes.
  - Prompt: `Pixel art game item icon, AB-PR-01 Orbe del Heraldo (vuelo 6, estallido 6) a 64 px, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abismo/tex_piso.png`

## B307 — CM-C03 Cargado por el Raptor (pose colgando) / CM-C04 Pánico (brazos arriba, corriendo)  
*Prioridad P1 · PENDIENTE*

- **`D-CIUDAD-CM-C03`** — Objeto de equipo (ícono y/o sprite). CM-C03 Cargado por el Raptor (pose colgando). Ciudad Maldita: estado KIDNAPPED (hoy usa "caída") (FALTA).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-c03_cargado_por_el_raptor_pose.png`.
  - Formato: 32×48 · 4 cuadros × 3 civiles. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, CM-C03 Cargado por el Raptor (pose colgando), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`
- **`D-CIUDAD-CM-C04`** — Objeto de equipo (ícono y/o sprite). CM-C04 Pánico (brazos arriba, corriendo). Ciudad Maldita: estado PANIC (hoy usa "correr") (PARCIAL).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-c04_panico_brazos_arriba_corriendo.png`.
  - Formato: 32×48 · 6 cuadros × 3 civiles. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, CM-C04 Pánico (brazos arriba, corriendo), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B308 — CM-T05 Muebles de interior (mesa, cama, alacena, chimenea, alfombra) / CM-T08 Estatua maldita con fuente (vista superior) / CM-T10 Rejilla de cloaca, campana en el piso, farol, barricada  
*Prioridad P1 · PENDIENTE*

- **`D-CIUDAD-CM-T05`** — Objeto de equipo (ícono y/o sprite). CM-T05 Muebles de interior (mesa, cama, alacena, chimenea, alfombra). Ciudad Maldita: interiores (FALTA).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-t05_muebles_de_interior_mesa_cama.png`.
  - Formato: 32–64 px, 1 cuadro c/u. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, CM-T05 Muebles de interior (mesa, cama, alacena, chimenea, alfombra), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/ciudad/tex_adoquin.png`
- **`D-CIUDAD-CM-T08`** — Objeto de equipo (ícono y/o sprite). CM-T08 Estatua maldita con fuente (vista superior). Ciudad Maldita: plaza central (PARCIAL).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-t08_estatua_maldita_con_fuente.png`.
  - Formato: 200×220 · 4 cuadros de agua. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, CM-T08 Estatua maldita con fuente (vista superior), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/ciudad/tex_adoquin.png`
- **`D-CIUDAD-CM-T10`** — Objeto de equipo (ícono y/o sprite). CM-T10 Rejilla de cloaca, campana en el piso, farol, barricada. Ciudad Maldita: props de gameplay (PARCIAL).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-t10_rejilla_de_cloaca_campana_en.png`.
  - Formato: 48–96 px. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, CM-T10 Rejilla de cloaca, campana en el piso, farol, barricada, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/ciudad/tex_adoquin.png`

## B309 — CM-P03 Retrato para diálogos  
*Prioridad P1 · PENDIENTE*

- **`D-CIUDAD-CM-P03`** — Forma de jefe de Ciudad Maldita. CM-P03 Retrato para diálogos. Ciudad Maldita: carteles del jefe (FALTA).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-p03_retrato_para_dialogos.png`.
  - Formato: 96×96 · 1 cuadro + 1 hablando. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art boss form sprite, CM-P03 Retrato para diálogos, large, facing the camera, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B310 — CM-V01 Indicador de secuestro (flecha / grillete sobre el Raptor) / CM-V02 Destello de rescate (escudo verde que sube) / CM-V03 Cono de reflector (Marca del espectáculo) / CM-V04 Telón a pantalla completa (apagón y final)  
*Prioridad P1 · PENDIENTE*

- **`D-CIUDAD-CM-V01`** — Objeto de equipo (ícono y/o sprite). CM-V01 Indicador de secuestro (flecha / grillete sobre el Raptor). Ciudad Maldita: Raptor con civil (FALTA).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-v01_indicador_de_secuestro_flecha.png`.
  - Formato: 32×32 · 4 cuadros. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, CM-V01 Indicador de secuestro (flecha / grillete sobre el Raptor), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`D-CIUDAD-CM-V02`** — Objeto de equipo (ícono y/o sprite). CM-V02 Destello de rescate (escudo verde que sube). Ciudad Maldita: +1 RESCATADO (FALTA).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-v02_destello_de_rescate_escudo.png`.
  - Formato: 64×64 · 8 cuadros. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, CM-V02 Destello de rescate (escudo verde que sube), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`D-CIUDAD-CM-V03`** — Objeto de equipo (ícono y/o sprite). CM-V03 Cono de reflector (Marca del espectáculo). Ciudad Maldita: Presentador / Dama (PARCIAL).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-v03_cono_de_reflector_marca_del.png`.
  - Formato: 128×256 · 6 cuadros. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, CM-V03 Cono de reflector (Marca del espectáculo), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`D-CIUDAD-CM-V04`** — Objeto de equipo (ícono y/o sprite). CM-V04 Telón a pantalla completa (apagón y final). Ciudad Maldita: transiciones del nivel 9 y la muerte del jefe (FALTA).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-v04_telon_a_pantalla_completa.png`.
  - Formato: 960×540 · 12 cuadros. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, CM-V04 Telón a pantalla completa (apagón y final), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`

## B311 — GO-02 Trozos desmembrados por material (6 × 4 piezas) / GO-03 Overlays de muerte: congelado (estatua), carbonizado, electrocutado / BR-01 7 objetos × (intacto, a punto de estallar, restos)  
*Prioridad P1 · PENDIENTE*

- **`D-COMBATE-GO-02`** — Objeto de equipo (ícono y/o sprite). GO-02 Trozos desmembrados por material (6 × 4 piezas). Gore: Trozos desmembrados por material (6 × 4 piezas). Estado: PROCEDURAL. Archivo(s): `goreChunks`
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/_comunes/go-02_trozos_desmembrados_por.png`.
  - Formato: Ver ficha GO-02 en LA_HORDA_COMBAT_MISSING_ASSETS.md. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, GO-02 Trozos desmembrados por material (6 × 4 piezas), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`D-COMBATE-GO-03`** — Objeto de equipo (ícono y/o sprite). GO-03 Overlays de muerte: congelado (estatua), carbonizado, electrocutado. Gore: Overlays de muerte: congelado (estatua), carbonizado, electrocutado. Estado: PROCEDURAL (filtro + horneado). Archivo(s): `vfxDrawDying`, `_bakeCorpse`
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/_comunes/go-03_overlays_de_muerte_congelado.png`.
  - Formato: Ver ficha GO-03 en LA_HORDA_COMBAT_MISSING_ASSETS.md. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, GO-03 Overlays de muerte: congelado (estatua), carbonizado, electrocutado, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`D-COMBATE-BR-01`** — Objeto de equipo (ícono y/o sprite). BR-01 7 objetos × (intacto, a punto de estallar, restos). Destructibles: 7 objetos × (intacto, a punto de estallar, restos). Estado: PROCEDURAL (pixel en código). Archivo(s): `js/systems/breakables.js`
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/_comunes/br-01_7_objetos_intacto_a_punto_de.png`.
  - Formato: Ver ficha BR-01 en LA_HORDA_COMBAT_MISSING_ASSETS.md. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, BR-01 7 objetos × (intacto, a punto de estallar, restos), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`

## B312 — MN-B04 Antorcha personal del guardián / MN-B05 Jaula del montacargas + cable / MN-B06 Escombros del Titán / MN-B09 Retrato de Cerbero para carteles  
*Prioridad P1 · PENDIENTE*

- **`D-MINAS-MN-B04`** — Objeto de equipo (ícono y/o sprite). MN-B04 Antorcha personal del guardián. Minas Profundas: cada guardián lleva luz propia (SUSTITUTO (solo el círculo de luz)).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/minas/mn-b04_antorcha_personal_del_guardian.png`.
  - Formato: 16×32 · 4 cuadros en bucle + 1 "sofocada" (Escupidor). PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, MN-B04 Antorcha personal del guardián, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/minas/lampara_apaga_0.png`
- **`D-MINAS-MN-B05`** — Objeto de equipo (ícono y/o sprite). MN-B05 Jaula del montacargas + cable. Minas Profundas: entrada de cada sector (descenso) (SUSTITUTO (dibujada por código)).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/minas/mn-b05_jaula_del_montacargas_cable.png`.
  - Formato: 96×112 · 1 cuadro + 4 cuadros de bajada. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, MN-B05 Jaula del montacargas + cable, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/minas/cadena_tension_2.png`
- **`D-MINAS-MN-B06`** — Objeto de equipo (ícono y/o sprite). MN-B06 Escombros del Titán. Minas Profundas: derrumbes del Titán (bloquean y cubren) (SUSTITUTO (roca de la hoja recortada)).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/minas/mn-b06_escombros_del_titan.png`.
  - Formato: 3 variantes de 64×48. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, MN-B06 Escombros del Titán, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/minas/cadena_tension_2.png`
- **`D-MINAS-MN-B09`** — Objeto de equipo (ícono y/o sprite). MN-B09 Retrato de Cerbero para carteles. Minas Profundas: cartel de jefe y Códice (PARCIAL (recorte del cuerpo)).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/minas/mn-b09_retrato_de_cerbero_para.png`.
  - Formato: 96×96 · 1 quieto + 1 rugiendo. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, MN-B09 Retrato de Cerbero para carteles, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/minas/cadena_tension_2.png`

## B313 — MN-B10 Carteles de sector  
*Prioridad P1 · PENDIENTE*

- **`D-MINAS-MN-B10`** — Objeto de equipo (ícono y/o sprite). MN-B10 Carteles de sector. Minas Profundas: cartel del descenso con profundidad (FALTA (texto sobre fondo)).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/minas/mn-b10_carteles_de_sector.png`.
  - Formato: 480×96 · 6 placas de madera o hierro con el nombre del sector. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, MN-B10 Carteles de sector, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/minas/cadena_tension_2.png`

## B314 — Prop de decorado "infColumn+v" (infernal, canvas 30×70) / Prop de decorado "infAltar" (infernal, canvas 64×44) / Prop de decorado "infStatue" (infernal, canvas 34×62) / Prop de decorado "infBrazier" (infernal, canvas 18×26)  
*Prioridad P1 · PENDIENTE*

- **`D-PROP-infcolumn`** — Prop decorativo de la arena. Prop de decorado "infColumn+v" (infernal, canvas 30×70). Decorado/landmark de la arena infernal dibujado por código: aidArtInfColumn (js/rendering/arena-props.js:39). Varias variantes (+v).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/infernal/prop_infcolumn.png`.
  - Formato: PNG 30×70 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px. 2–3 variantes.
  - Prompt: `Pixel art environment prop, Prop de decorado "infColumn+v" (infernal, canvas 30×70), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`
- **`D-PROP-infaltar`** — Prop decorativo de la arena. Prop de decorado "infAltar" (infernal, canvas 64×44). Decorado/landmark de la arena infernal dibujado por código: aidArtInfAltar (js/rendering/arena-props.js:64). 
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/infernal/prop_infaltar.png`.
  - Formato: PNG 64×44 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px.
  - Prompt: `Pixel art environment prop, Prop de decorado "infAltar" (infernal, canvas 64×44), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`
- **`D-PROP-infstatue`** — Prop decorativo de la arena. Prop de decorado "infStatue" (infernal, canvas 34×62). Decorado/landmark de la arena infernal dibujado por código: aidArtInfStatue (js/rendering/arena-props.js:84). 
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/infernal/prop_infstatue.png`.
  - Formato: PNG 34×62 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px.
  - Prompt: `Pixel art environment prop, Prop de decorado "infStatue" (infernal, canvas 34×62), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`
- **`D-PROP-infbrazier`** — Prop decorativo de la arena. Prop de decorado "infBrazier" (infernal, canvas 18×26). Decorado/landmark de la arena infernal dibujado por código: aidArtInfBrazier (js/rendering/arena-props.js:98). 
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/infernal/prop_infbrazier.png`.
  - Formato: PNG 18×26 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px.
  - Prompt: `Pixel art environment prop, Prop de decorado "infBrazier" (infernal, canvas 18×26), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`

## B315 — Prop de decorado "infFissure+v" (infernal, canvas 150×60) / Prop de decorado "icePillar+v" (hielo, canvas 30×80) / Prop de decorado "iceCluster+v" (hielo, canvas 44×36) / Prop de decorado "iceArch" (hielo, canvas 110×80)  
*Prioridad P1 · PENDIENTE*

- **`D-PROP-inffissure`** — Prop decorativo de la arena. Prop de decorado "infFissure+v" (infernal, canvas 150×60). Decorado/landmark de la arena infernal dibujado por código: aidArtInfFissure (js/rendering/arena-props.js:121). Varias variantes (+v).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/infernal/prop_inffissure.png`.
  - Formato: PNG 150×60 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px. 2–3 variantes.
  - Prompt: `Pixel art environment prop, Prop de decorado "infFissure+v" (infernal, canvas 150×60), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`
- **`D-PROP-icepillar`** — Prop decorativo de la arena. Prop de decorado "icePillar+v" (hielo, canvas 30×80). Decorado/landmark de la arena hielo dibujado por código: aidArtIcePillar (js/rendering/arena-props.js:137). Varias variantes (+v).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/hielo/prop_icepillar.png`.
  - Formato: PNG 30×80 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px. 2–3 variantes.
  - Prompt: `Pixel art environment prop, Prop de decorado "icePillar+v" (hielo, canvas 30×80), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`
- **`D-PROP-icecluster`** — Prop decorativo de la arena. Prop de decorado "iceCluster+v" (hielo, canvas 44×36). Decorado/landmark de la arena hielo dibujado por código: aidArtIceCluster (js/rendering/arena-props.js:155). Varias variantes (+v).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/hielo/prop_icecluster.png`.
  - Formato: PNG 44×36 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px. 2–3 variantes.
  - Prompt: `Pixel art environment prop, Prop de decorado "iceCluster+v" (hielo, canvas 44×36), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`
- **`D-PROP-icearch`** — Prop decorativo de la arena. Prop de decorado "iceArch" (hielo, canvas 110×80). Decorado/landmark de la arena hielo dibujado por código: aidArtIceArch (js/rendering/arena-props.js:165). 
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/hielo/prop_icearch.png`.
  - Formato: PNG 110×80 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px.
  - Prompt: `Pixel art environment prop, Prop de decorado "iceArch" (hielo, canvas 110×80), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`

## B316 — Prop de decorado "iceStatue" (hielo, canvas 32×66) / Prop de decorado "snowDrift+v" (hielo, canvas 110×50) / Prop de decorado "iceCrack+v" (hielo, canvas 120×70) / Prop de decorado "menhir+v" (bosque, canvas 24×60)  
*Prioridad P1 · PENDIENTE*

- **`D-PROP-icestatue`** — Prop decorativo de la arena. Prop de decorado "iceStatue" (hielo, canvas 32×66). Decorado/landmark de la arena hielo dibujado por código: aidArtIceStatue (js/rendering/arena-props.js:182). 
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/hielo/prop_icestatue.png`.
  - Formato: PNG 32×66 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px.
  - Prompt: `Pixel art environment prop, Prop de decorado "iceStatue" (hielo, canvas 32×66), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`
- **`D-PROP-snowdrift`** — Prop decorativo de la arena. Prop de decorado "snowDrift+v" (hielo, canvas 110×50). Decorado/landmark de la arena hielo dibujado por código: aidArtSnowDrift (js/rendering/arena-props.js:211). Varias variantes (+v).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/hielo/prop_snowdrift.png`.
  - Formato: PNG 110×50 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px. 2–3 variantes.
  - Prompt: `Pixel art environment prop, Prop de decorado "snowDrift+v" (hielo, canvas 110×50), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`
- **`D-PROP-icecrack`** — Prop decorativo de la arena. Prop de decorado "iceCrack+v" (hielo, canvas 120×70). Decorado/landmark de la arena hielo dibujado por código: aidArtIceCrack (js/rendering/arena-props.js:214). Varias variantes (+v).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/hielo/prop_icecrack.png`.
  - Formato: PNG 120×70 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px. 2–3 variantes.
  - Prompt: `Pixel art environment prop, Prop de decorado "iceCrack+v" (hielo, canvas 120×70), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`
- **`D-PROP-menhir`** — Prop decorativo de la arena. Prop de decorado "menhir+v" (bosque, canvas 24×60). Decorado/landmark de la arena bosque dibujado por código: aidArtMenhir (js/rendering/arena-props.js:225). Varias variantes (+v).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/bosque/prop_menhir.png`.
  - Formato: PNG 24×60 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px. 2–3 variantes.
  - Prompt: `Pixel art environment prop, Prop de decorado "menhir+v" (bosque, canvas 24×60), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`

## B317 — Prop de decorado "ancientTree+v" (bosque, canvas 100×130) / Prop de decorado "celticStatue" (bosque, canvas 30×64) / Prop de decorado "ruinArch" (bosque, canvas 96×80) / Prop de decorado "moss+v" (bosque, canvas 100×54)  
*Prioridad P1 · PENDIENTE*

- **`D-PROP-ancienttree`** — Prop decorativo de la arena. Prop de decorado "ancientTree+v" (bosque, canvas 100×130). Decorado/landmark de la arena bosque dibujado por código: aidArtAncientTree (js/rendering/arena-props.js:244). Varias variantes (+v).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/bosque/prop_ancienttree.png`.
  - Formato: PNG 100×130 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px. 2–3 variantes.
  - Prompt: `Pixel art environment prop, Prop de decorado "ancientTree+v" (bosque, canvas 100×130), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`
- **`D-PROP-celticstatue`** — Prop decorativo de la arena. Prop de decorado "celticStatue" (bosque, canvas 30×64). Decorado/landmark de la arena bosque dibujado por código: aidArtCelticStatue (js/rendering/arena-props.js:264). 
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/bosque/prop_celticstatue.png`.
  - Formato: PNG 30×64 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px.
  - Prompt: `Pixel art environment prop, Prop de decorado "celticStatue" (bosque, canvas 30×64), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`
- **`D-PROP-ruinarch`** — Prop decorativo de la arena. Prop de decorado "ruinArch" (bosque, canvas 96×80). Decorado/landmark de la arena bosque dibujado por código: aidArtRuinArch (js/rendering/arena-props.js:274). 
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/bosque/prop_ruinarch.png`.
  - Formato: PNG 96×80 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px.
  - Prompt: `Pixel art environment prop, Prop de decorado "ruinArch" (bosque, canvas 96×80), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`
- **`D-PROP-moss`** — Prop decorativo de la arena. Prop de decorado "moss+v" (bosque, canvas 100×54). Decorado/landmark de la arena bosque dibujado por código: aidArtMoss (js/rendering/arena-props.js:303). Varias variantes (+v).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/bosque/prop_moss.png`.
  - Formato: PNG 100×54 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px. 2–3 variantes.
  - Prompt: `Pixel art environment prop, Prop de decorado "moss+v" (bosque, canvas 100×54), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`

## B318 — Prop de decorado "roots+v" (bosque, canvas 160×80) / Prop de decorado "obelisk" (laberinto, canvas 26×90) / Prop de decorado "sandDrift+v" (laberinto, canvas 120×50) / Prop de decorado "brokenTiles+v" (laberinto, canvas 80×50)  
*Prioridad P1 · PENDIENTE*

- **`D-PROP-roots`** — Prop decorativo de la arena. Prop de decorado "roots+v" (bosque, canvas 160×80). Decorado/landmark de la arena bosque dibujado por código: aidArtRoots (js/rendering/arena-props.js:307). Varias variantes (+v).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/bosque/prop_roots.png`.
  - Formato: PNG 160×80 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px. 2–3 variantes.
  - Prompt: `Pixel art environment prop, Prop de decorado "roots+v" (bosque, canvas 160×80), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`
- **`D-PROP-obelisk`** — Prop decorativo de la arena. Prop de decorado "obelisk" (laberinto, canvas 26×90). Decorado/landmark de la arena laberinto dibujado por código: aidArtObelisk (js/rendering/arena-props.js:332). 
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/laberinto/prop_obelisk.png`.
  - Formato: PNG 26×90 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px.
  - Prompt: `Pixel art environment prop, Prop de decorado "obelisk" (laberinto, canvas 26×90), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`
- **`D-PROP-sanddrift`** — Prop decorativo de la arena. Prop de decorado "sandDrift+v" (laberinto, canvas 120×50). Decorado/landmark de la arena laberinto dibujado por código: aidArtSandDrift (js/rendering/arena-props.js:363). Varias variantes (+v).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/laberinto/prop_sanddrift.png`.
  - Formato: PNG 120×50 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px. 2–3 variantes.
  - Prompt: `Pixel art environment prop, Prop de decorado "sandDrift+v" (laberinto, canvas 120×50), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`
- **`D-PROP-brokentiles`** — Prop decorativo de la arena. Prop de decorado "brokenTiles+v" (laberinto, canvas 80×50). Decorado/landmark de la arena laberinto dibujado por código: aidArtBrokenTiles (js/rendering/arena-props.js:367). Varias variantes (+v).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/laberinto/prop_brokentiles.png`.
  - Formato: PNG 80×50 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px. 2–3 variantes.
  - Prompt: `Pixel art environment prop, Prop de decorado "brokenTiles+v" (laberinto, canvas 80×50), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`

## B319 — Prop de decorado "sandRipples+v" (laberinto, canvas 130×60) / Prop de decorado "infSpike+v" (infernal, canvas 30×64)  
*Prioridad P1 · PENDIENTE*

- **`D-PROP-sandripples`** — Prop decorativo de la arena. Prop de decorado "sandRipples+v" (laberinto, canvas 130×60). Decorado/landmark de la arena laberinto dibujado por código: aidArtSandRipples (js/rendering/arena-props.js:431). Varias variantes (+v).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/laberinto/prop_sandripples.png`.
  - Formato: PNG 130×60 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px. 2–3 variantes.
  - Prompt: `Pixel art environment prop, Prop de decorado "sandRipples+v" (laberinto, canvas 130×60), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`
- **`D-PROP-infspike`** — Prop decorativo de la arena. Prop de decorado "infSpike+v" (infernal, canvas 30×64). Decorado/landmark de la arena infernal dibujado por código: aidArtInfernalSpike (js/rendering/arena-props.js:448). Varias variantes (+v).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/infernal/prop_infspike.png`.
  - Formato: PNG 30×64 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px. 2–3 variantes.
  - Prompt: `Pixel art environment prop, Prop de decorado "infSpike+v" (infernal, canvas 30×64), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`

## B320 — Suelo/tile de la arena "bosque" / Suelo/tile de la arena "hielo" / Suelo/tile de la arena "laberinto" / Suelo/tile de la arena "infernal"  
*Prioridad P1 · PENDIENTE*

- **`D-SUELO-bosque`** — Textura de suelo repetible, vista cenital. Suelo/tile de la arena "bosque". Hoy el piso se genera por código (buildFloorTile, tile procedural de 160×160 con placas de piedra, js/rendering/arena.js:25). FLOOR_THEME[bosque].
  - Método: runway + pintor (textura repetible). Entrega: `art-source/entregas/2026-10_mundo/arenas/bosque/tex_piso.png`.
  - Formato: PNG sin costuras (tile repetible), 2,0 u/px (≈64×64 o 96×96 px nativos), ≤ 250 tonos, sin JPG ni degradé, 3–4 variantes de piedra/terreno + 1 de borde. Es FONDO: poco contraste (la horda debe leerse primero).
  - Prompt: `Seamless tileable top-down ground texture, Suelo/tile de la arena "bosque", pixel art, muted dark-fantasy palette, no objects, no text.`
  - Referencias: `assets/vfx/ciudad/tex_calle.png`, `assets/vfx/minas/tex_piso_galerias.png`
- **`D-SUELO-hielo`** — Textura de suelo repetible, vista cenital. Suelo/tile de la arena "hielo". Hoy el piso se genera por código (buildFloorTile, tile procedural de 160×160 con placas de piedra, js/rendering/arena.js:25). FLOOR_THEME[hielo].
  - Método: runway + pintor (textura repetible). Entrega: `art-source/entregas/2026-10_mundo/arenas/hielo/tex_piso.png`.
  - Formato: PNG sin costuras (tile repetible), 2,0 u/px (≈64×64 o 96×96 px nativos), ≤ 250 tonos, sin JPG ni degradé, 3–4 variantes de piedra/terreno + 1 de borde. Es FONDO: poco contraste (la horda debe leerse primero).
  - Prompt: `Seamless tileable top-down ground texture, Suelo/tile de la arena "hielo", pixel art, muted dark-fantasy palette, no objects, no text.`
  - Referencias: `assets/vfx/ciudad/tex_calle.png`, `assets/vfx/minas/tex_piso_galerias.png`
- **`D-SUELO-laberinto`** — Textura de suelo repetible, vista cenital. Suelo/tile de la arena "laberinto". Hoy el piso se genera por código (buildFloorTile, tile procedural de 160×160 con placas de piedra, js/rendering/arena.js:25). FLOOR_THEME[laberinto].
  - Método: runway + pintor (textura repetible). Entrega: `art-source/entregas/2026-10_mundo/arenas/laberinto/tex_piso.png`.
  - Formato: PNG sin costuras (tile repetible), 2,0 u/px (≈64×64 o 96×96 px nativos), ≤ 250 tonos, sin JPG ni degradé, 3–4 variantes de piedra/terreno + 1 de borde. Es FONDO: poco contraste (la horda debe leerse primero).
  - Prompt: `Seamless tileable top-down ground texture, Suelo/tile de la arena "laberinto", pixel art, muted dark-fantasy palette, no objects, no text.`
  - Referencias: `assets/vfx/ciudad/tex_calle.png`, `assets/vfx/minas/tex_piso_galerias.png`
- **`D-SUELO-infernal`** — Textura de suelo repetible, vista cenital. Suelo/tile de la arena "infernal". Hoy el piso se genera por código (buildFloorTile, tile procedural de 160×160 con placas de piedra, js/rendering/arena.js:25). FLOOR_THEME[infernal].
  - Método: runway + pintor (textura repetible). Entrega: `art-source/entregas/2026-10_mundo/arenas/infernal/tex_piso.png`.
  - Formato: PNG sin costuras (tile repetible), 2,0 u/px (≈64×64 o 96×96 px nativos), ≤ 250 tonos, sin JPG ni degradé, 3–4 variantes de piedra/terreno + 1 de borde. Es FONDO: poco contraste (la horda debe leerse primero).
  - Prompt: `Seamless tileable top-down ground texture, Suelo/tile de la arena "infernal", pixel art, muted dark-fantasy palette, no objects, no text.`
  - Referencias: `assets/vfx/ciudad/tex_calle.png`, `assets/vfx/minas/tex_piso_galerias.png`

## B331 — Autómata de Hierro (automata, elite, arena fortaleza)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-automata`** — Autómata de Hierro (automata, elite, arena fortaleza). Enemigo elite de la arena fortaleza. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Obreros de hierro programados para no detenerse nunca. La Horda solo cambió una línea de su protocolo: "obedecer" por "aplastar". Comportamiento: Lento, blindado (recibe menos daño) y de frente. Ataques: Golpe frontal en cono, Protocolo de Embestida (línea con 1 s de aviso). Detalle y prompts por estado en enemigos/fortaleza.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/fortaleza/automata/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Autómata de Hierro, elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #5a5a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Autómata de Hierro, elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #5a5a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Autómata de Hierro, elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #5a5a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Autómata de Hierro, elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #5a5a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Autómata de Hierro, elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #5a5a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Autómata de Hierro, elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #5a5a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Autómata de Hierro, elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #5a5a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Autómata de Hierro, elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #5a5a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Autómata de Hierro, elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #5a5a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B332 — Chamán de la Colonia (chaman, elite, arena micelial)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-chaman`** — Chamán de la Colonia (chaman, elite, arena micelial). Enemigo elite de la arena micelial. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Los chamanes hablan con la Madre Espora. Ella les contesta con esporas, y ellos las reparten. Comportamiento: Apoyo prioritario: se queda atrás y potencia a los demás. Ataques: Bolas de esporas, Regeneración canalizada, Aura que potencia. Detalle y prompts por estado en enemigos/micelial.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/micelial/chaman/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Chamán de la Colonia, elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9050e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Chamán de la Colonia, elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9050e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Chamán de la Colonia, elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #9050e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Chamán de la Colonia, elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #9050e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Chamán de la Colonia, elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9050e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Chamán de la Colonia, elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #9050e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Chamán de la Colonia, elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #9050e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Chamán de la Colonia, elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9050e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Chamán de la Colonia, elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9050e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B333 — Verdugo (cm_verdugo, elite, arena ciudad)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-cm_verdugo`** — Verdugo (cm_verdugo, elite, arena ciudad). Enemigo elite de la arena ciudad. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Un monstruo colosal que derriba puertas, muros y refugios. Sus golpes son lentos pero devastadores. Comportamiento: Va por los EDIFICIOS (refugios, capilla, puerta de evacuación). Si te le plantás, te pelea a vos. Ataques: Golpe vertical con aviso (cono), Destruye estructura. Detalle y prompts por estado en enemigos/ciudad.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/ciudad/cm_verdugo/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Verdugo, elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7a2a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Verdugo, elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7a2a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Verdugo, elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #7a2a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Verdugo, elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #7a2a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Verdugo, elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7a2a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Verdugo, elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #7a2a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Verdugo, elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #7a2a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Verdugo, elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7a2a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Verdugo, elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7a2a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B334 — Cù-Sìth (cu_sith, elite, arena bosque)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-cu_sith`** — Cù-Sìth (cu_sith, elite, arena bosque). Enemigo elite de la arena bosque. Estados que el motor rellena clonando/espejando en vez de dibujar: 6 de 11 (idle, walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: El Cù-Sìth era el perro de los elfos, el que avisaba la muerte con tres aullidos. Hoy la trae él mismo. Comportamiento: Élite. Muy rápido; elige al guardián más separado del grupo, le aúlla tres veces y al tercer aullido salta en línea recta. Ataques: Mordida, Tres Aullidos: salto en línea marcada. Detalle y prompts por estado en enemigos/bosque.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/bosque/cu_sith/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Cù-Sìth, elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #3e6b3e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Cù-Sìth, elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #3e6b3e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Cù-Sìth, elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #3e6b3e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Cù-Sìth, elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #3e6b3e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Cù-Sìth, elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #3e6b3e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Cù-Sìth, elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #3e6b3e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Cù-Sìth, elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #3e6b3e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Cù-Sìth, elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #3e6b3e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Cù-Sìth, elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #3e6b3e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/micelial/sabueso/atlas.png`

## B335 — Demonio de Hielo y Fuego (demonio_hielo_fuego, elite, arena hielo)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-demonio_hielo_fuego`** — Demonio de Hielo y Fuego (demonio_hielo_fuego, elite, arena hielo). Enemigo elite de la arena hielo. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Un demonio de la Horda que se quedó demasiado tiempo en la Gélida. Arde por dentro y se congela por fuera. Comportamiento: Pelea a media distancia. Ataques: Lanzallamas de Hielo (canalizado, escarcha acumulable), Muro de Hielo (colisión real). Detalle y prompts por estado en enemigos/hielo.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/hielo/demonio_hielo_fuego/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Demonio de Hielo y Fuego, elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #4a6ea8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Demonio de Hielo y Fuego, elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #4a6ea8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Demonio de Hielo y Fuego, elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #4a6ea8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Demonio de Hielo y Fuego, elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #4a6ea8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Demonio de Hielo y Fuego, elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #4a6ea8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Demonio de Hielo y Fuego, elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #4a6ea8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Demonio de Hielo y Fuego, elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #4a6ea8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Demonio de Hielo y Fuego, elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #4a6ea8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Demonio de Hielo y Fuego, elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #4a6ea8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B336 — Tundraverx, Soberano de Hielo (dragon_hielo, elite, arena hielo)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-dragon_hielo`** — Tundraverx, Soberano de Hielo (dragon_hielo, elite, arena hielo). Enemigo elite de la arena hielo. Estados que el motor rellena clonando/espejando en vez de dibujar: 7 de 11 (idle, walk_D, walk_U, attack_D, attack_U, hit, hit_D). Criatura: — Comportamiento: — Ataques: —. Detalle y prompts por estado en enemigos/hielo.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/hielo/dragon_hielo/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Tundraverx, Soberano de Hielo, elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7fc0f0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Tundraverx, Soberano de Hielo, elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7fc0f0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Tundraverx, Soberano de Hielo, elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #7fc0f0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Tundraverx, Soberano de Hielo, elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #7fc0f0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Tundraverx, Soberano de Hielo, elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7fc0f0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Tundraverx, Soberano de Hielo, elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #7fc0f0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Tundraverx, Soberano de Hielo, elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #7fc0f0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Tundraverx, Soberano de Hielo, elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7fc0f0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Tundraverx, Soberano de Hielo, elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7fc0f0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png`

## B337 — Druida de Arena (druida_arena, elite, arena laberinto)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-druida_arena`** — Druida de Arena (druida_arena, elite, arena laberinto). Enemigo elite de la arena laberinto. Estados que el motor rellena clonando/espejando en vez de dibujar: 6 de 11 (idle, attack_D, attack_U, hit, hit_D, death). Criatura: Druidas que hablaban con la arena del desierto y la usaban para ocultar el Laberinto. Ahora lo usan para que no salgas. Comportamiento: Mantiene distancia y lanza magia. Ataques: Proyectil de arena, Tormenta. Detalle y prompts por estado en enemigos/laberinto.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/laberinto/druida_arena/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Druida de Arena, elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c2a05a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Druida de Arena, elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c2a05a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Druida de Arena, elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #c2a05a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Druida de Arena, elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #c2a05a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Druida de Arena, elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c2a05a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Druida de Arena, elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #c2a05a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Druida de Arena, elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #c2a05a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Druida de Arena, elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c2a05a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Druida de Arena, elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c2a05a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B338 — Ent (ent, elite, arena bosque)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-ent`** — Ent (ent, elite, arena bosque). Enemigo elite de la arena bosque. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Árboles tan viejos como las Ruinas que despertaron con la corrupción. Lentos como las estaciones, duros como la piedra. Comportamiento: Tanque lento que avanza y aplasta. Ataques: Golpe de rama, Pisotón. Detalle y prompts por estado en enemigos/bosque.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/bosque/ent/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Ent, elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #5a4a2e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Ent, elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #5a4a2e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Ent, elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #5a4a2e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Ent, elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #5a4a2e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Ent, elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #5a4a2e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Ent, elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #5a4a2e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Ent, elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #5a4a2e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Ent, elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #5a4a2e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Ent, elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #5a4a2e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png`

## B339 — Hinchado (hinchado, elite, arena micelial)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-hinchado`** — Hinchado (hinchado, elite, arena micelial). Enemigo elite de la arena micelial. Estados que el motor rellena clonando/espejando en vez de dibujar: 7 de 11 (idle, walk_D, walk_U, attack, attack_D, attack_U, hit_D). Criatura: Un cuerpo que el micelio llenó hasta reventar. Camina despacio porque sabe que no hace falta correr. Comportamiento: Tanque lento. Ataques: Puñetazo en cono, Explosión preparada (1,6 s de aviso). Detalle y prompts por estado en enemigos/micelial.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/micelial/hinchado/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Hinchado, elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #e06a30. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Hinchado, elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #e06a30. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Hinchado, elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #e06a30. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Hinchado, elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #e06a30. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Hinchado, elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #e06a30. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Hinchado, elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #e06a30. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Hinchado, elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #e06a30. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Hinchado, elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #e06a30. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Hinchado, elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #e06a30. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png`

## B340 — Consumidor Luminoso (mn_consumidor, elite, arena minas)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-mn_consumidor`** — Consumidor Luminoso (mn_consumidor, elite, arena minas). Enemigo elite de la arena minas. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Una criatura parasitaria que se alimenta de la energía de los cristales y las lámparas. Comportamiento: Se prende a una fuente y le absorbe la energía (parpadea, se apaga). Potencia a los enemigos cercanos. Ataques: Absorción (la luz parpadea y se apaga), Aura de potenciación, Golpe si lo encarás. Detalle y prompts por estado en enemigos/minas.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/minas/mn_consumidor/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Consumidor Luminoso, elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #3a70c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Consumidor Luminoso, elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #3a70c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Consumidor Luminoso, elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #3a70c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Consumidor Luminoso, elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #3a70c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Consumidor Luminoso, elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #3a70c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Consumidor Luminoso, elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #3a70c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Consumidor Luminoso, elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #3a70c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Consumidor Luminoso, elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #3a70c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Consumidor Luminoso, elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #3a70c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B341 — Minero Corrompido (mn_minero, elite, arena minas)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-mn_minero`** — Minero Corrompido (mn_minero, elite, arena minas). Enemigo elite de la arena minas. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Un antiguo minero fusionado con el mineral. Sus golpes son lentos, pero rompen barricadas… y apagan la luz. Comportamiento: Pesado. Si el equipo está lejos, camina hasta una luz y la rompe. Ataques: Golpe pesado en cono (aviso): apaga las fuentes cercanas, Roca lanzada (círculo). Detalle y prompts por estado en enemigos/minas.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/minas/mn_minero/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Minero Corrompido, elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a5a30. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Minero Corrompido, elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a5a30. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Minero Corrompido, elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a5a30. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Minero Corrompido, elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a5a30. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Minero Corrompido, elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a5a30. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Minero Corrompido, elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a5a30. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Minero Corrompido, elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a5a30. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Minero Corrompido, elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a5a30. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Minero Corrompido, elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a5a30. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B342 — Verdugo de Vapor (verdugo, elite, arena fortaleza)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-verdugo`** — Verdugo de Vapor (verdugo, elite, arena fortaleza). Enemigo elite de la arena fortaleza. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Verdugos de la Fábrica con calderas en la espalda. Cuando abren las válvulas ya no sienten el dolor… ni el propio. Comportamiento: Hacha en cono; se acelera cuando entra en Sobrepresión. Ataques: Hachazo en cono, Sobrepresión: +60% velocidad y +40% daño. Detalle y prompts por estado en enemigos/fortaleza.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/fortaleza/verdugo/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Verdugo de Vapor, elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6a3a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Verdugo de Vapor, elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6a3a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Verdugo de Vapor, elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #6a3a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Verdugo de Vapor, elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #6a3a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Verdugo de Vapor, elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6a3a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Verdugo de Vapor, elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #6a3a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Verdugo de Vapor, elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #6a3a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Verdugo de Vapor, elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6a3a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Verdugo de Vapor, elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6a3a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B343 — Ángel Caído de Hielo (angel_caido_hielo, jefe, arena hielo)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-angel_caido_hielo`** — Ángel Caído de Hielo (angel_caido_hielo, jefe, arena hielo). Enemigo jefe de la arena hielo. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: — Comportamiento: — Ataques: —. Detalle y prompts por estado en enemigos/hielo.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/hielo/angel_caido_hielo/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Ángel Caído de Hielo, boss), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #bfe0f5. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Ángel Caído de Hielo, boss), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #bfe0f5. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Ángel Caído de Hielo, boss), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #bfe0f5. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Ángel Caído de Hielo, boss), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #bfe0f5. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Ángel Caído de Hielo, boss), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #bfe0f5. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Ángel Caído de Hielo, boss), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #bfe0f5. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Ángel Caído de Hielo, boss), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #bfe0f5. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Ángel Caído de Hielo, boss), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #bfe0f5. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Ángel Caído de Hielo, boss), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #bfe0f5. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/bosses/bosque/doblador_guerrero/v2/atlas.png`

## B344 — Caballero de la Armadura Oxidada (caballero, jefe, arena fortaleza)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-caballero`** — Caballero de la Armadura Oxidada (caballero, jefe, arena fortaleza). Enemigo jefe de la arena fortaleza. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: — Comportamiento: — Ataques: —. Detalle y prompts por estado en enemigos/fortaleza.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/fortaleza/caballero/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Caballero de la Armadura Oxidada, boss), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7a3a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Caballero de la Armadura Oxidada, boss), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7a3a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Caballero de la Armadura Oxidada, boss), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #7a3a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Caballero de la Armadura Oxidada, boss), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #7a3a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Caballero de la Armadura Oxidada, boss), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7a3a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Caballero de la Armadura Oxidada, boss), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #7a3a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Caballero de la Armadura Oxidada, boss), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #7a3a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Caballero de la Armadura Oxidada, boss), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7a3a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Caballero de la Armadura Oxidada, boss), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7a3a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/bosses/bosque/doblador_guerrero/v2/atlas.png`

## B345 — El Mago Gélido (mago_hielo_cristal, jefe, arena hielo)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-mago_hielo_cristal`** — El Mago Gélido (mago_hielo_cristal, jefe, arena hielo). Enemigo jefe de la arena hielo. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: — Comportamiento: — Ataques: —. Detalle y prompts por estado en enemigos/hielo.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/hielo/mago_hielo_cristal/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (El Mago Gélido, boss), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c9e6ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (El Mago Gélido, boss), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c9e6ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (El Mago Gélido, boss), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #c9e6ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (El Mago Gélido, boss), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #c9e6ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (El Mago Gélido, boss), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c9e6ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (El Mago Gélido, boss), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #c9e6ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (El Mago Gélido, boss), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #c9e6ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (El Mago Gélido, boss), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c9e6ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (El Mago Gélido, boss), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c9e6ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/bosses/bosque/doblador_guerrero/v2/atlas.png`

## B346 — Engendro Encadenado (engendro, normal, arena fortaleza)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-engendro`** — Engendro Encadenado (engendro, normal, arena fortaleza). Enemigo normal de la arena fortaleza. Estados que el motor rellena clonando/espejando en vez de dibujar: 9 de 11 (idle, walk_D, walk_U, attack, attack_D, attack_U, hit, hit_D, death). Criatura: Mitades de un Prisionero que siguen moviéndose por pura costumbre. Rápidas, torpes y ciegas. Comportamiento: Corre en zigzag, más rápido que el Prisionero. Ataques: Arañazo. Detalle y prompts por estado en enemigos/fortaleza.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/fortaleza/engendro/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Engendro Encadenado, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b08a7a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Engendro Encadenado, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b08a7a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Engendro Encadenado, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #b08a7a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Engendro Encadenado, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #b08a7a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Engendro Encadenado, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b08a7a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Engendro Encadenado, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #b08a7a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Engendro Encadenado, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #b08a7a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Engendro Encadenado, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b08a7a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Engendro Encadenado, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b08a7a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/abismo/ab_errante/atlas.png`

## B347 — Enjambre de Hadas (enjambre_hadas, normal, arena bosque)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-enjambre_hadas`** — Enjambre de Hadas (enjambre_hadas, normal, arena bosque). Enemigo normal de la arena bosque. Estados que el motor rellena clonando/espejando en vez de dibujar: 8 de 11 (idle, walk_D, walk_U, attack, attack_D, attack_U, hit, hit_D). Criatura: Un enjambre de hadas que antes iluminaba los senderos. Ahora su luz quema. Comportamiento: Revolotea y ataca desde lejos. Cada una brilla de un color: verde, rosa u oro. Ataques: Chispa de luz a distancia. Detalle y prompts por estado en enemigos/bosque.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/bosque/enjambre_hadas/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Enjambre de Hadas, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #d68ce0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Enjambre de Hadas, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #d68ce0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Enjambre de Hadas, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #d68ce0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Enjambre de Hadas, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #d68ce0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Enjambre de Hadas, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #d68ce0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Enjambre de Hadas, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #d68ce0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Enjambre de Hadas, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #d68ce0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Enjambre de Hadas, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #d68ce0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Enjambre de Hadas, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #d68ce0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/bosque/enjambre_hadas/v3/atlas.png`

## B348 — Escorpión Gigante (escorpion_gigante, normal, arena laberinto)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-escorpion_gigante`** — Escorpión Gigante (escorpion_gigante, normal, arena laberinto). Enemigo normal de la arena laberinto. Estados que el motor rellena clonando/espejando en vez de dibujar: 7 de 11 (idle, walk_U, attack_D, attack_U, hit, hit_D, death). Criatura: Los escorpiones del Laberinto se alimentan de los que se pierden. Nunca pasan hambre. Comportamiento: Rápido y en grupo. Ataques: Aguijón, Tenazas. Detalle y prompts por estado en enemigos/laberinto.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/laberinto/escorpion_gigante/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Escorpión Gigante, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c99a4a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Escorpión Gigante, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c99a4a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Escorpión Gigante, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #c99a4a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Escorpión Gigante, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #c99a4a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Escorpión Gigante, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c99a4a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Escorpión Gigante, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #c99a4a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Escorpión Gigante, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #c99a4a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Escorpión Gigante, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c99a4a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Escorpión Gigante, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c99a4a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/laberinto/escorpion_gigante/walk-strip.png`

## B349 — Gólem de Piedra (golem_piedra, normal, arena laberinto)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-golem_piedra`** — Gólem de Piedra (golem_piedra, normal, arena laberinto). Enemigo normal de la arena laberinto. Estados que el motor rellena clonando/espejando en vez de dibujar: 8 de 11 (idle, walk_D, walk_U, attack_D, attack_U, hit, hit_D, death). Criatura: Piedras del propio Laberinto que el Guardián levantaba para cerrar caminos. Ahora cierran el tuyo. Comportamiento: Tanque lento. Ataques: Golpe de piedra, Lanzar roca. Detalle y prompts por estado en enemigos/laberinto.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/laberinto/golem_piedra/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Gólem de Piedra, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a8a82. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Gólem de Piedra, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a8a82. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Gólem de Piedra, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a8a82. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Gólem de Piedra, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a8a82. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Gólem de Piedra, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a8a82. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Gólem de Piedra, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a8a82. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Gólem de Piedra, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a8a82. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Gólem de Piedra, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a8a82. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Gólem de Piedra, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a8a82. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png`

## B350 — Hada de Escarcha (hada_escarcha, normal, arena hielo)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-hada_escarcha`** — Hada de Escarcha (hada_escarcha, normal, arena hielo). Enemigo normal de la arena hielo. Estados que el motor rellena clonando/espejando en vez de dibujar: 8 de 11 (idle, walk_D, walk_U, attack, attack_D, attack_U, hit, hit_D). Criatura: Hadas que se quedaron dormidas en la nieve cuando el Mago Gélido cerró el paso. Despertaron frías por dentro y con hambre de calor. Comportamiento: Esbirro. Llegan de a tres; si hay un brasero encendido cerca, lo rodean y le roban el calor. Si no, revolotean alrededor del guardián y pican de a una. Ataques: Picotazo helado, Robar el calor: el brasero se apaga mucho antes. Detalle y prompts por estado en enemigos/hielo.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/hielo/hada_escarcha/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Hada de Escarcha, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #bfe4ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Hada de Escarcha, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #bfe4ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Hada de Escarcha, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #bfe4ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Hada de Escarcha, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #bfe4ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Hada de Escarcha, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #bfe4ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Hada de Escarcha, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #bfe4ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Hada de Escarcha, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #bfe4ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Hada de Escarcha, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #bfe4ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Hada de Escarcha, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #bfe4ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/bosque/enjambre_hadas/v3/atlas.png`

## B351 — Bestia del Bosque (bestia_bosque, subelite, arena bosque)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-bestia_bosque`** — Bestia del Bosque (bestia_bosque, subelite, arena bosque). Enemigo subelite de la arena bosque. Estados que el motor rellena clonando/espejando en vez de dibujar: 8 de 11 (idle, walk_D, walk_U, attack_D, attack_U, hit, hit_D, death). Criatura: Las bestias del bosque fueron las primeras en oler la corrupción. Crecieron, se volvieron más fieras y aprendieron a cazar en manada. Comportamiento: Carga de frente y salta desde las emboscadas. Ataques: Zarpazo, Embestida. Detalle y prompts por estado en enemigos/bosque.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/bosque/bestia_bosque/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Bestia del Bosque, sub-elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a6a42. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Bestia del Bosque, sub-elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a6a42. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Bestia del Bosque, sub-elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a6a42. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Bestia del Bosque, sub-elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a6a42. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Bestia del Bosque, sub-elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a6a42. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Bestia del Bosque, sub-elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a6a42. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Bestia del Bosque, sub-elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a6a42. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Bestia del Bosque, sub-elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a6a42. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Bestia del Bosque, sub-elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a6a42. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/micelial/sabueso/atlas.png`

## B352 — Doppelgänger — Arquera (doblador_arquera, subjefe, arena bosque)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-doblador_arquera`** — Doppelgänger — Arquera (doblador_arquera, subjefe, arena bosque). Enemigo subjefe de la arena bosque. Estados que el motor rellena clonando/espejando en vez de dibujar: 6 de 11 (walk_D, walk_U, attack_D, attack_U, hit, hit_D). Criatura: — Comportamiento: — Ataques: —. Detalle y prompts por estado en enemigos/bosque.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/bosque/doblador_arquera/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Arquera, mini-boss), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9a9a9a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Arquera, mini-boss), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9a9a9a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Arquera, mini-boss), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #9a9a9a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Arquera, mini-boss), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #9a9a9a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Arquera, mini-boss), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9a9a9a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Arquera, mini-boss), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #9a9a9a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Arquera, mini-boss), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #9a9a9a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Arquera, mini-boss), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9a9a9a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Arquera, mini-boss), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9a9a9a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/bosses/bosque/doblador_guerrero/v2/atlas.png`

## B353 — Doppelgänger — Clérigo (doblador_clerigo, subjefe, arena bosque)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-doblador_clerigo`** — Doppelgänger — Clérigo (doblador_clerigo, subjefe, arena bosque). Enemigo subjefe de la arena bosque. Estados que el motor rellena clonando/espejando en vez de dibujar: 6 de 11 (walk_D, walk_U, attack_D, attack_U, hit, hit_D). Criatura: — Comportamiento: — Ataques: —. Detalle y prompts por estado en enemigos/bosque.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/bosque/doblador_clerigo/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Clérigo, mini-boss), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b0b0b0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Clérigo, mini-boss), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b0b0b0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Clérigo, mini-boss), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #b0b0b0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Clérigo, mini-boss), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #b0b0b0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Clérigo, mini-boss), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b0b0b0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Clérigo, mini-boss), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #b0b0b0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Clérigo, mini-boss), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #b0b0b0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Clérigo, mini-boss), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b0b0b0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Clérigo, mini-boss), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b0b0b0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/bosses/bosque/doblador_guerrero/v2/atlas.png`

## B354 — Doppelgänger — Guerrero (doblador_guerrero, subjefe, arena bosque)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-doblador_guerrero`** — Doppelgänger — Guerrero (doblador_guerrero, subjefe, arena bosque). Enemigo subjefe de la arena bosque. Estados que el motor rellena clonando/espejando en vez de dibujar: 6 de 11 (walk_D, walk_U, attack_D, attack_U, hit, hit_D). Criatura: — Comportamiento: — Ataques: —. Detalle y prompts por estado en enemigos/bosque.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/bosque/doblador_guerrero/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Guerrero, mini-boss), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a8a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Guerrero, mini-boss), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a8a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Guerrero, mini-boss), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a8a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Guerrero, mini-boss), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a8a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Guerrero, mini-boss), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a8a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Guerrero, mini-boss), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a8a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Guerrero, mini-boss), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a8a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Guerrero, mini-boss), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a8a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Guerrero, mini-boss), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a8a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/bosses/bosque/doblador_guerrero/v2/atlas.png`

## B355 — Doppelgänger — Pícaro (doblador_picaro, subjefe, arena bosque)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-doblador_picaro`** — Doppelgänger — Pícaro (doblador_picaro, subjefe, arena bosque). Enemigo subjefe de la arena bosque. Estados que el motor rellena clonando/espejando en vez de dibujar: 6 de 11 (walk_D, walk_U, attack_D, attack_U, hit, hit_D). Criatura: — Comportamiento: — Ataques: —. Detalle y prompts por estado en enemigos/bosque.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/bosque/doblador_picaro/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Pícaro, mini-boss), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #707070. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Pícaro, mini-boss), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #707070. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Pícaro, mini-boss), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #707070. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Pícaro, mini-boss), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #707070. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Pícaro, mini-boss), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #707070. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Pícaro, mini-boss), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #707070. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Pícaro, mini-boss), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #707070. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Pícaro, mini-boss), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #707070. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Doppelgänger — Pícaro, mini-boss), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #707070. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/bosses/bosque/doblador_guerrero/v2/atlas.png`

## B356 — Guardián del Laberinto (guardian_laberinto, subjefe, arena laberinto)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-guardian_laberinto`** — Guardián del Laberinto (guardian_laberinto, subjefe, arena laberinto). Enemigo subjefe de la arena laberinto. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: — Comportamiento: — Ataques: —. Detalle y prompts por estado en enemigos/laberinto.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/laberinto/guardian_laberinto/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Guardián del Laberinto, mini-boss), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a7a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Guardián del Laberinto, mini-boss), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a7a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Guardián del Laberinto, mini-boss), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a7a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Guardián del Laberinto, mini-boss), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a7a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Guardián del Laberinto, mini-boss), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a7a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Guardián del Laberinto, mini-boss), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a7a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Guardián del Laberinto, mini-boss), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a7a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Guardián del Laberinto, mini-boss), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a7a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Guardián del Laberinto, mini-boss), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a7a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/bosses/bosque/doblador_guerrero/v2/atlas.png`

## B357 — Kraken Joven (kraken_joven, subjefe, arena acuatica)  
*Prioridad P1 · PENDIENTE*

- **`C-ENEMY-kraken_joven`** — Kraken Joven (kraken_joven, subjefe, arena acuatica). Enemigo subjefe de la arena acuatica. Estados que el motor rellena clonando/espejando en vez de dibujar: 8 de 11 (idle, walk_L, walk_D, walk_U, attack, attack_D, attack_U, hit_D). Criatura: — Comportamiento: — Ataques: —. Detalle y prompts por estado en enemigos/acuatica.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/acuatica/kraken_joven/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Kraken Joven, mini-boss), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6a3a6e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Kraken Joven, mini-boss), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6a3a6e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Kraken Joven, mini-boss), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #6a3a6e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Kraken Joven, mini-boss), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #6a3a6e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Kraken Joven, mini-boss), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6a3a6e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Kraken Joven, mini-boss), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #6a3a6e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Kraken Joven, mini-boss), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #6a3a6e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Kraken Joven, mini-boss), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6a3a6e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Kraken Joven, mini-boss), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6a3a6e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/minas/mn_titan/atlas.png`

## B360 — A-10 Caballero de la Armadura Oxidada: 3 estados de calor + shock térmico  
*Prioridad P1 · PENDIENTE*

- **`C-FORMA-caballero_calor`** — Forma/transformación de jefe. A-10 Caballero de la Armadura Oxidada: 3 estados de calor + shock térmico. Forma/pieza de jefe (fuente: LA_HORDA_MISSING_ASSETS.md / LA_HORDA_COMBAT_MISSING_ASSETS.md / LA_HORDA_CODEX_MISSING_ASSETS.md; código: js/arenas/fortaleza/fort-bosses.js).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/jefes/caballero_calor/`.
  - Formato: Misma celda que su atlas actual ×3 estados (oscuro, rojo, incandescente) + shock térmico 8 cuadros. PNG RGBA, alfa 0/255, vecino más cercano; atlas por animación, píxel nativo ≈1,0 u/px.
  - Prompt: `Pixel art boss form sprite, A-10 Caballero de la Armadura Oxidada: 3 estados de calor + shock térmico, large, facing the camera, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/arenas/fortaleza/caballero/atlas.png`

## B361 — CX-ANI-01 Dobladores (4): animaciones de habilidad propias  
*Prioridad P1 · PENDIENTE*

- **`C-FORMA-dobladores_habilidades`** — Forma/transformación de jefe. CX-ANI-01 Dobladores (4): animaciones de habilidad propias. Forma/pieza de jefe (fuente: LA_HORDA_MISSING_ASSETS.md / LA_HORDA_COMBAT_MISSING_ASSETS.md / LA_HORDA_CODEX_MISSING_ASSETS.md; código: js/data/champions.js (dobladores)).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/jefes/dobladores_habilidades/`.
  - Formato: Hoy solo idle, caminar, ataque, golpe y muerte (celdas ≈55–58×60–63, refH 53–54). Pedir las poses de cast/habilidad de cada uno. PNG RGBA, alfa 0/255, vecino más cercano; atlas por animación, píxel nativo ≈1,0 u/px.
  - Prompt: `Pixel art boss form sprite, CX-ANI-01 Dobladores (4): animaciones de habilidad propias, large, facing the camera, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/bosses/hielo/mago_hielo_cristal/v2/atlas.png`

## B362 — A-04 Rey de la Horda (forma final)  
*Prioridad P1 · PENDIENTE*

- **`C-FORMA-rey_horda`** — Forma/transformación de jefe. A-04 Rey de la Horda (forma final). Forma/pieza de jefe (fuente: LA_HORDA_MISSING_ASSETS.md / LA_HORDA_COMBAT_MISSING_ASSETS.md / LA_HORDA_CODEX_MISSING_ASSETS.md; código: js/arenas/infernal).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/jefes/rey_horda/`.
  - Formato: Celda 192×192: idle 6, ataque 10, rugido 8, muerte 14. Hoy usa el cuerpo del Demonio Mayor. PNG RGBA, alfa 0/255, vecino más cercano; atlas por animación, píxel nativo ≈1,0 u/px.
  - Prompt: `Pixel art boss form sprite, A-04 Rey de la Horda (forma final), large, facing the camera, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/bosses/infernal/demonio_mayor/atlas.png`

## B363 — HS-03 Transformación Hechicero → Gólem (8 cuadros) y Gólem → Demonio (6 cuadros)  
*Prioridad P1 · PENDIENTE*

- **`C-FORMA-transformaciones`** — Forma/transformación de jefe. HS-03 Transformación Hechicero → Gólem (8 cuadros) y Gólem → Demonio (6 cuadros). Forma/pieza de jefe (fuente: LA_HORDA_MISSING_ASSETS.md / LA_HORDA_COMBAT_MISSING_ASSETS.md / LA_HORDA_CODEX_MISSING_ASSETS.md; código: hechEnemyTick, hechGolemBroken).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/jefes/transformaciones/`.
  - Formato: Celdas del jefe final; hoy 3 fases de la hoja + partículas. PNG RGBA, alfa 0/255, vecino más cercano; atlas por animación, píxel nativo ≈1,0 u/px.
  - Prompt: `Pixel art boss form sprite, HS-03 Transformación Hechicero → Gólem (8 cuadros) y Gólem → Demonio (6 cuadros), large, facing the camera, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/bosses/hielo/mago_hielo_cristal/v2/atlas.png`

## B364 — A-05 Focos de Convergencia ×4 (idle 6 + quiebre 8; 4 colores)  
*Prioridad P1 · PENDIENTE*

- **`D-MEC-A-05`** — Objeto de equipo (ícono y/o sprite). A-05 Focos de Convergencia ×4 (idle 6 + quiebre 8; 4 colores). Mecánica/regla de jefe de la arena infernal hoy dibujada por código o con arte prestado (fuente: LA_HORDA_MISSING_ASSETS.md).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/infernal/focos_convergencia.png`.
  - Formato: 48×96 por cuadro. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo, loops sin costura.
  - Prompt: `Pixel art game item icon, A-05 Focos de Convergencia ×4 (idle 6 + quiebre 8; 4 colores), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/skins/manada/sigil_0.png`

## B365 — A-06 Tentáculos del Leviatán por función (GOLPE/AGARRE/CORRIENTE)  
*Prioridad P1 · PENDIENTE*

- **`D-MEC-A-06`** — Objeto de equipo (ícono y/o sprite). A-06 Tentáculos del Leviatán por función (GOLPE/AGARRE/CORRIENTE). Mecánica/regla de jefe de la arena acuatica hoy dibujada por código o con arte prestado (fuente: LA_HORDA_MISSING_ASSETS.md).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/acuatica/tentaculos_leviatan.png`.
  - Formato: 64×128; emerger 4, idle 4, acción 6, hundirse 4; 3 variantes + anillo de agarre 4. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo, loops sin costura.
  - Prompt: `Pixel art game item icon, A-06 Tentáculos del Leviatán por función (GOLPE/AGARRE/CORRIENTE), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/skins/manada/sigil_0.png`

## B366 — A-07 Foco de Hielo (idle 6 + quiebre 8)  
*Prioridad P1 · PENDIENTE*

- **`D-MEC-A-07`** — Objeto de equipo (ícono y/o sprite). A-07 Foco de Hielo (idle 6 + quiebre 8). Mecánica/regla de jefe de la arena hielo hoy dibujada por código o con arte prestado (fuente: LA_HORDA_MISSING_ASSETS.md).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/hielo/foco_hielo.png`.
  - Formato: 48×96. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo, loops sin costura.
  - Prompt: `Pixel art game item icon, A-07 Foco de Hielo (idle 6 + quiebre 8), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/skins/manada/sigil_0.png`

## B367 — A-08 Red micelial: raíz-tendón (tileable) y Corazón abierto  
*Prioridad P1 · PENDIENTE*

- **`D-MEC-A-08`** — Objeto de equipo (ícono y/o sprite). A-08 Red micelial: raíz-tendón (tileable) y Corazón abierto. Mecánica/regla de jefe de la arena micelial hoy dibujada por código o con arte prestado (fuente: LA_HORDA_MISSING_ASSETS.md).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/micelial/red_micelial.png`.
  - Formato: Raíz 64×24 latido 4; corazón 128×128 latido 6. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo, loops sin costura.
  - Prompt: `Pixel art game item icon, A-08 Red micelial: raíz-tendón (tileable) y Corazón abierto, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/minas/cadena_tension_2.png`

## B368 — A-09 Cometa del Gran Número (vuelo 6, impacto 5; + versión "reflejado" dorada)  
*Prioridad P1 · PENDIENTE*

- **`D-MEC-A-09`** — Objeto de equipo (ícono y/o sprite). A-09 Cometa del Gran Número (vuelo 6, impacto 5; + versión "reflejado" dorada). Mecánica/regla de jefe de la arena ciudad hoy dibujada por código o con arte prestado (fuente: LA_HORDA_MISSING_ASSETS.md).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/ciudad/cometa_gran_numero.png`.
  - Formato: 48×48. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo, loops sin costura.
  - Prompt: `Pixel art game item icon, A-09 Cometa del Gran Número (vuelo 6, impacto 5; + versión "reflejado" dorada), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/skins/manada/sigil_0.png`

## B369 — A-11 Brasero de hielo (encendido 6 loop, apagado 1, prendiéndose 4, congelado 3)  
*Prioridad P1 · PENDIENTE*

- **`D-MEC-A-11`** — Objeto de equipo (ícono y/o sprite). A-11 Brasero de hielo (encendido 6 loop, apagado 1, prendiéndose 4, congelado 3). Mecánica/regla de jefe de la arena hielo hoy dibujada por código o con arte prestado (fuente: LA_HORDA_MISSING_ASSETS.md).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/hielo/brasero_hielo.png`.
  - Formato: 48×64. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo, loops sin costura.
  - Prompt: `Pixel art game item icon, A-11 Brasero de hielo (encendido 6 loop, apagado 1, prendiéndose 4, congelado 3), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/minas/lampara_apaga_0.png`

## B370 — A-12 Sellos de piedra I / II / III (apagado 1, encendido 4 loop, error 3)  
*Prioridad P1 · PENDIENTE*

- **`D-MEC-A-12`** — Objeto de equipo (ícono y/o sprite). A-12 Sellos de piedra I / II / III (apagado 1, encendido 4 loop, error 3). Mecánica/regla de jefe de la arena laberinto hoy dibujada por código o con arte prestado (fuente: LA_HORDA_MISSING_ASSETS.md).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/laberinto/sellos_piedra.png`.
  - Formato: 64×64, 3 variantes. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo, loops sin costura.
  - Prompt: `Pixel art game item icon, A-12 Sellos de piedra I / II / III (apagado 1, encendido 4 loop, error 3), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/skins/manada/sigil_0.png`

## B371 — A-13 Corriente, remolino, chorro y charco conductor  
*Prioridad P1 · PENDIENTE*

- **`D-MEC-A-13`** — Objeto de equipo (ícono y/o sprite). A-13 Corriente, remolino, chorro y charco conductor. Mecánica/regla de jefe de la arena acuatica hoy dibujada por código o con arte prestado (fuente: LA_HORDA_MISSING_ASSETS.md).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/acuatica/corriente_chorro_charco.png`.
  - Formato: Corriente 64×32 tileable (6); remolino 96×96 (8); chorro 32×32 + columna 32×96 (6); charco 64×40 (1+4+5). PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo, loops sin costura.
  - Prompt: `Pixel art game item icon, A-13 Corriente, remolino, chorro y charco conductor, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/skins/manada/sigil_0.png`

## B372 — A-14 Runa del menhir y maleza de emboscada  
*Prioridad P1 · PENDIENTE*

- **`D-MEC-A-14`** — Objeto de equipo (ícono y/o sprite). A-14 Runa del menhir y maleza de emboscada. Mecánica/regla de jefe de la arena bosque hoy dibujada por código o con arte prestado (fuente: LA_HORDA_MISSING_ASSETS.md).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/bosque/runa_maleza.png`.
  - Formato: Runa 32×64 (cargando 4, lista 4 loop, disparo 5); maleza 48×40 (1+4+4+6). PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo, loops sin costura.
  - Prompt: `Pixel art game item icon, A-14 Runa del menhir y maleza de emboscada, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/skins/manada/sigil_0.png`

## B373 — Retrato/hoja de campo de batalla "ab_carcelero"  
*Prioridad P1 · PENDIENTE*

- **`C-BF-ab_carcelero`** — Monstruo de campo de batalla (Guerra de Cristales). Retrato/hoja de campo de batalla "ab_carcelero". El juego dibuja el tipo "ab_carcelero" con esta tira en TODAS las arenas (entities.js:309 llama battlefieldDrawMonster primero; verificado ejecutando enemy_coverage.js: la fuente de idle/walk es assets/sprites/battlefield/ab_carcelero.png).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/jefes/ab_carcelero/atlas.png`.
  - Formato: Reentregar como atlas de píxel nativo: cuerpo ≈170 px de alto (1,0 u/px; banda aceptable 71–378 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. Poses: reposo, caminar 4–6, ataque 4, golpe 2, muerte 6 (+ habilidades del jefe). PNG RGBA, alfa 0/255, vecino más cercano, atlas 8 columnas, celdas iguales.
  - Prompt: `Pixel art monster sprite, Retrato/hoja de campo de batalla "ab_carcelero", side view facing right, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/arenas/abismo/ab_carcelero/atlas.png`, `tools/art/battlefield_pixelize.py (reduce a la grilla nativa)`

## B374 — Retrato/hoja de campo de batalla "cm_dama"  
*Prioridad P1 · PENDIENTE*

- **`C-BF-cm_dama`** — Monstruo de campo de batalla (Guerra de Cristales). Retrato/hoja de campo de batalla "cm_dama". El juego dibuja el tipo "cm_dama" con esta tira en TODAS las arenas (entities.js:309 llama battlefieldDrawMonster primero; verificado ejecutando enemy_coverage.js: la fuente de idle/walk es assets/sprites/battlefield/cm_dama.png).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/jefes/cm_dama/atlas.png`.
  - Formato: Reentregar como atlas de píxel nativo: cuerpo ≈125 px de alto (1,0 u/px; banda aceptable 52–278 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. Poses: reposo, caminar 4–6, ataque 4, golpe 2, muerte 6 (+ habilidades del jefe). PNG RGBA, alfa 0/255, vecino más cercano, atlas 8 columnas, celdas iguales.
  - Prompt: `Pixel art monster sprite, Retrato/hoja de campo de batalla "cm_dama", side view facing right, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_dama/atlas.png`, `tools/art/battlefield_pixelize.py (reduce a la grilla nativa)`

## B375 — Retrato/hoja de campo de batalla "cm_maestro"  
*Prioridad P1 · PENDIENTE*

- **`C-BF-cm_maestro`** — Monstruo de campo de batalla (Guerra de Cristales). Retrato/hoja de campo de batalla "cm_maestro". El juego dibuja el tipo "cm_maestro" con esta tira en TODAS las arenas (entities.js:309 llama battlefieldDrawMonster primero; verificado ejecutando enemy_coverage.js: la fuente de idle/walk es assets/sprites/battlefield/cm_maestro.png).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/jefes/cm_maestro/atlas.png`.
  - Formato: Reentregar como atlas de píxel nativo: cuerpo ≈112 px de alto (1,0 u/px; banda aceptable 47–249 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. Poses: reposo, caminar 4–6, ataque 4, golpe 2, muerte 6 (+ habilidades del jefe). PNG RGBA, alfa 0/255, vecino más cercano, atlas 8 columnas, celdas iguales.
  - Prompt: `Pixel art monster sprite, Retrato/hoja de campo de batalla "cm_maestro", side view facing right, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_maestro/atlas.png`, `tools/art/battlefield_pixelize.py (reduce a la grilla nativa)`

## B376 — Retrato/hoja de campo de batalla "cm_presentador"  
*Prioridad P1 · PENDIENTE*

- **`C-BF-cm_presentador`** — Monstruo de campo de batalla (Guerra de Cristales). Retrato/hoja de campo de batalla "cm_presentador". El juego dibuja el tipo "cm_presentador" con esta tira en TODAS las arenas (entities.js:309 llama battlefieldDrawMonster primero; verificado ejecutando enemy_coverage.js: la fuente de idle/walk es assets/sprites/battlefield/cm_presentador.png).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/jefes/cm_presentador/atlas.png`.
  - Formato: Reentregar como atlas de píxel nativo: cuerpo ≈138 px de alto (1,0 u/px; banda aceptable 58–307 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. Poses: reposo, caminar 4–6, ataque 4, golpe 2, muerte 6 (+ habilidades del jefe). PNG RGBA, alfa 0/255, vecino más cercano, atlas 8 columnas, celdas iguales.
  - Prompt: `Pixel art monster sprite, Retrato/hoja de campo de batalla "cm_presentador", side view facing right, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_presentador/atlas.png`, `tools/art/battlefield_pixelize.py (reduce a la grilla nativa)`

## B377 — Retrato/hoja de campo de batalla "cm_tramoyista"  
*Prioridad P1 · PENDIENTE*

- **`C-BF-cm_tramoyista`** — Monstruo de campo de batalla (Guerra de Cristales). Retrato/hoja de campo de batalla "cm_tramoyista". El juego dibuja el tipo "cm_tramoyista" con esta tira en TODAS las arenas (entities.js:309 llama battlefieldDrawMonster primero; verificado ejecutando enemy_coverage.js: la fuente de idle/walk es assets/sprites/battlefield/cm_tramoyista.png).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/jefes/cm_tramoyista/atlas.png`.
  - Formato: Reentregar como atlas de píxel nativo: cuerpo ≈138 px de alto (1,0 u/px; banda aceptable 58–307 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. Poses: reposo, caminar 4–6, ataque 4, golpe 2, muerte 6 (+ habilidades del jefe). PNG RGBA, alfa 0/255, vecino más cercano, atlas 8 columnas, celdas iguales.
  - Prompt: `Pixel art monster sprite, Retrato/hoja de campo de batalla "cm_tramoyista", side view facing right, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_tramoyista/atlas.png`, `tools/art/battlefield_pixelize.py (reduce a la grilla nativa)`

## B378 — Retrato/hoja de campo de batalla "golem_cuerpos"  
*Prioridad P1 · PENDIENTE*

- **`C-BF-golem_cuerpos`** — Monstruo de campo de batalla (Guerra de Cristales). Retrato/hoja de campo de batalla "golem_cuerpos". El juego dibuja el tipo "golem_cuerpos" con esta tira en TODAS las arenas (entities.js:309 llama battlefieldDrawMonster primero; verificado ejecutando enemy_coverage.js: la fuente de idle/walk es assets/sprites/battlefield/golem_cuerpos.png).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/jefes/golem_cuerpos/atlas.png`.
  - Formato: Reentregar como atlas de píxel nativo: cuerpo ≈218 px de alto (1,0 u/px; banda aceptable 91–484 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. Poses: reposo, caminar 4–6, ataque 4, golpe 2, muerte 6 (+ habilidades del jefe). PNG RGBA, alfa 0/255, vecino más cercano, atlas 8 columnas, celdas iguales.
  - Prompt: `Pixel art monster sprite, Retrato/hoja de campo de batalla "golem_cuerpos", side view facing right, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/bosses/infernal/hechicero/golem/v2/atlas.png`, `tools/art/battlefield_pixelize.py (reduce a la grilla nativa)`

## B379 — Retrato/hoja de campo de batalla "king-colossus"  
*Prioridad P1 · PENDIENTE*

- **`C-BF-king-colossus`** — Monstruo de campo de batalla (Guerra de Cristales). Retrato/hoja de campo de batalla "king-colossus". Monstruo del modo Cristales/Convergencia (battlefieldMonsterKey, js/rendering/battlefield-art.js:8-14).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/jefes/king-colossus/atlas.png`.
  - Formato: Reentregar como atlas de píxel nativo: cuerpo ≈174 px de alto (1,0 u/px; banda aceptable 72–387 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. Poses: reposo, caminar 4–6, ataque 4, golpe 2, muerte 6 (+ habilidades del jefe). PNG RGBA, alfa 0/255, vecino más cercano, atlas 8 columnas, celdas iguales.
  - Prompt: `Pixel art monster sprite, Retrato/hoja de campo de batalla "king-colossus", side view facing right, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/arenas/minas/mn_titan/atlas.png`, `tools/art/battlefield_pixelize.py (reduce a la grilla nativa)`

## B380 — Retrato/hoja de campo de batalla "mn_cerbero"  
*Prioridad P1 · PENDIENTE*

- **`C-BF-mn_cerbero`** — Monstruo de campo de batalla (Guerra de Cristales). Retrato/hoja de campo de batalla "mn_cerbero". El juego dibuja el tipo "mn_cerbero" con esta tira en TODAS las arenas (entities.js:309 llama battlefieldDrawMonster primero; verificado ejecutando enemy_coverage.js: la fuente de idle/walk es assets/sprites/battlefield/mn_cerbero.png).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/jefes/mn_cerbero/atlas.png`.
  - Formato: Reentregar como atlas de píxel nativo: cuerpo ≈160 px de alto (1,0 u/px; banda aceptable 67–356 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. Poses: reposo, caminar 4–6, ataque 4, golpe 2, muerte 6 (+ habilidades del jefe). PNG RGBA, alfa 0/255, vecino más cercano, atlas 8 columnas, celdas iguales.
  - Prompt: `Pixel art monster sprite, Retrato/hoja de campo de batalla "mn_cerbero", side view facing right, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/arenas/minas/mn_cerbero/atlas.png`, `tools/art/battlefield_pixelize.py (reduce a la grilla nativa)`

## B381 — Retrato/hoja de campo de batalla "mn_titan"  
*Prioridad P1 · PENDIENTE*

- **`C-BF-mn_titan`** — Monstruo de campo de batalla (Guerra de Cristales). Retrato/hoja de campo de batalla "mn_titan". El juego dibuja el tipo "mn_titan" con esta tira en TODAS las arenas (entities.js:309 llama battlefieldDrawMonster primero; verificado ejecutando enemy_coverage.js: la fuente de idle/walk es assets/sprites/battlefield/mn_titan.png).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/jefes/mn_titan/atlas.png`.
  - Formato: Reentregar como atlas de píxel nativo: cuerpo ≈174 px de alto (1,0 u/px; banda aceptable 72–387 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. Poses: reposo, caminar 4–6, ataque 4, golpe 2, muerte 6 (+ habilidades del jefe). PNG RGBA, alfa 0/255, vecino más cercano, atlas 8 columnas, celdas iguales.
  - Prompt: `Pixel art monster sprite, Retrato/hoja de campo de batalla "mn_titan", side view facing right, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/arenas/minas/mn_titan/atlas.png`, `tools/art/battlefield_pixelize.py (reduce a la grilla nativa)`

## B382 — Retrato/hoja de campo de batalla "scavenger"  
*Prioridad P1 · PENDIENTE*

- **`C-BF-scavenger`** — Monstruo de campo de batalla (Guerra de Cristales). Retrato/hoja de campo de batalla "scavenger". Monstruo del modo Cristales/Convergencia (battlefieldMonsterKey, js/rendering/battlefield-art.js:8-14).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/jefes/scavenger/atlas.png`.
  - Formato: Reentregar como atlas de píxel nativo: cuerpo ≈58 px de alto (1,0 u/px; banda aceptable 24–129 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. Poses: reposo, caminar 4–6, ataque 4, golpe 2, muerte 6 (+ habilidades del jefe). PNG RGBA, alfa 0/255, vecino más cercano, atlas 8 columnas, celdas iguales.
  - Prompt: `Pixel art monster sprite, Retrato/hoja de campo de batalla "scavenger", side view facing right, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`, `tools/art/battlefield_pixelize.py (reduce a la grilla nativa)`

## B383 — Retrato/hoja de campo de batalla "stone-dragon"  
*Prioridad P1 · PENDIENTE*

- **`C-BF-stone-dragon`** — Monstruo de campo de batalla (Guerra de Cristales). Retrato/hoja de campo de batalla "stone-dragon". Monstruo del modo Cristales/Convergencia (battlefieldMonsterKey, js/rendering/battlefield-art.js:8-14).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/jefes/stone-dragon/atlas.png`.
  - Formato: Reentregar como atlas de píxel nativo: cuerpo ≈160 px de alto (1,0 u/px; banda aceptable 67–356 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. Poses: reposo, caminar 4–6, ataque 4, golpe 2, muerte 6 (+ habilidades del jefe). PNG RGBA, alfa 0/255, vecino más cercano, atlas 8 columnas, celdas iguales.
  - Prompt: `Pixel art monster sprite, Retrato/hoja de campo de batalla "stone-dragon", side view facing right, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png`, `tools/art/battlefield_pixelize.py (reduce a la grilla nativa)`

## B384 — Retrato/hoja de campo de batalla "thornbeast"  
*Prioridad P1 · PENDIENTE*

- **`C-BF-thornbeast`** — Monstruo de campo de batalla (Guerra de Cristales). Retrato/hoja de campo de batalla "thornbeast". Monstruo del modo Cristales/Convergencia (battlefieldMonsterKey, js/rendering/battlefield-art.js:8-14).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/jefes/thornbeast/atlas.png`.
  - Formato: Reentregar como atlas de píxel nativo: cuerpo ≈66 px de alto (1,0 u/px; banda aceptable 28–147 px), contorno 1 px, 2–3 tonos por color, SIN degradé de pintura. Poses: reposo, caminar 4–6, ataque 4, golpe 2, muerte 6 (+ habilidades del jefe). PNG RGBA, alfa 0/255, vecino más cercano, atlas 8 columnas, celdas iguales.
  - Prompt: `Pixel art monster sprite, Retrato/hoja de campo de batalla "thornbeast", side view facing right, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/arenas/micelial/sabueso/atlas.png`, `tools/art/battlefield_pixelize.py (reduce a la grilla nativa)`

## B385 — Portada de arena "Acuática" (JPG 960×420)  
*Prioridad P1 · PENDIENTE*

- **`D-PORTADA-acuatica`** — Portada de arena (ilustración). Portada de arena "Acuática" (JPG 960×420). Códice (codex.js:270), Libro de la Horda (teñida de tinta), ficha de arena (arena-briefing.js:58), campamento (camp.js:204,298), pantallas de historia (story.js:340).
  - Método: runway (ilustración, sin reducir a pixel). Entrega: `art-source/entregas/2026-10_mundo/portadas/acuatica.png`.
  - Formato: PNG 960×420 pixel art nativo (o grilla nativa que se acuerde, p. ej. 480×210 ×2), sin texto, sin degradé de compresión, ≤ 250 tonos, ≤ 170 KB. Componer para que el centro-derecha quede legible (el Libro recorta/panea).
  - Prompt: `Dark fantasy illustration cover of the arena, Portada de arena "Acuática" (JPG 960×420), wide composition, painterly, strong silhouette, no text.`
  - Referencias: `assets/sprites/battlefield/oak.png`, `assets/vfx/ciudad/tex_calle.png`

## B386 — Portada de arena "Bosque/Ruinas" (JPG 960×420)  
*Prioridad P1 · PENDIENTE*

- **`D-PORTADA-bosque`** — Portada de arena (ilustración). Portada de arena "Bosque/Ruinas" (JPG 960×420). Códice (codex.js:270), Libro de la Horda (teñida de tinta), ficha de arena (arena-briefing.js:58), campamento (camp.js:204,298), pantallas de historia (story.js:340).
  - Método: runway (ilustración, sin reducir a pixel). Entrega: `art-source/entregas/2026-10_mundo/portadas/bosque.png`.
  - Formato: PNG 960×420 pixel art nativo (o grilla nativa que se acuerde, p. ej. 480×210 ×2), sin texto, sin degradé de compresión, ≤ 250 tonos, ≤ 170 KB. Componer para que el centro-derecha quede legible (el Libro recorta/panea).
  - Prompt: `Dark fantasy illustration cover of the arena, Portada de arena "Bosque/Ruinas" (JPG 960×420), wide composition, painterly, strong silhouette, no text.`
  - Referencias: `assets/sprites/battlefield/oak.png`, `assets/vfx/ciudad/tex_calle.png`

## B387 — Portada de arena "Divina" (JPG 960×420)  
*Prioridad P1 · PENDIENTE*

- **`D-PORTADA-divina`** — Portada de arena (ilustración). Portada de arena "Divina" (JPG 960×420). Códice (codex.js:270), Libro de la Horda (teñida de tinta), ficha de arena (arena-briefing.js:58), campamento (camp.js:204,298), pantallas de historia (story.js:340).
  - Método: runway (ilustración, sin reducir a pixel). Entrega: `art-source/entregas/2026-10_mundo/portadas/divina.png`.
  - Formato: PNG 960×420 pixel art nativo (o grilla nativa que se acuerde, p. ej. 480×210 ×2), sin texto, sin degradé de compresión, ≤ 250 tonos, ≤ 170 KB. Componer para que el centro-derecha quede legible (el Libro recorta/panea).
  - Prompt: `Dark fantasy illustration cover of the arena, Portada de arena "Divina" (JPG 960×420), wide composition, painterly, strong silhouette, no text.`
  - Referencias: `assets/sprites/battlefield/oak.png`, `assets/vfx/ciudad/tex_calle.png`

## B388 — Portada de arena "Fábrica/Fortaleza" (JPG 960×420)  
*Prioridad P1 · PENDIENTE*

- **`D-PORTADA-fortaleza`** — Portada de arena (ilustración). Portada de arena "Fábrica/Fortaleza" (JPG 960×420). Códice (codex.js:270), Libro de la Horda (teñida de tinta), ficha de arena (arena-briefing.js:58), campamento (camp.js:204,298), pantallas de historia (story.js:340).
  - Método: runway (ilustración, sin reducir a pixel). Entrega: `art-source/entregas/2026-10_mundo/portadas/fortaleza.png`.
  - Formato: PNG 960×420 pixel art nativo (o grilla nativa que se acuerde, p. ej. 480×210 ×2), sin texto, sin degradé de compresión, ≤ 250 tonos, ≤ 170 KB. Componer para que el centro-derecha quede legible (el Libro recorta/panea).
  - Prompt: `Dark fantasy illustration cover of the arena, Portada de arena "Fábrica/Fortaleza" (JPG 960×420), wide composition, painterly, strong silhouette, no text.`
  - Referencias: `assets/sprites/battlefield/oak.png`, `assets/vfx/ciudad/tex_calle.png`

## B389 — Portada de arena "Gélida" (JPG 960×420)  
*Prioridad P1 · PENDIENTE*

- **`D-PORTADA-hielo`** — Portada de arena (ilustración). Portada de arena "Gélida" (JPG 960×420). Códice (codex.js:270), Libro de la Horda (teñida de tinta), ficha de arena (arena-briefing.js:58), campamento (camp.js:204,298), pantallas de historia (story.js:340).
  - Método: runway (ilustración, sin reducir a pixel). Entrega: `art-source/entregas/2026-10_mundo/portadas/hielo.png`.
  - Formato: PNG 960×420 pixel art nativo (o grilla nativa que se acuerde, p. ej. 480×210 ×2), sin texto, sin degradé de compresión, ≤ 250 tonos, ≤ 170 KB. Componer para que el centro-derecha quede legible (el Libro recorta/panea).
  - Prompt: `Dark fantasy illustration cover of the arena, Portada de arena "Gélida" (JPG 960×420), wide composition, painterly, strong silhouette, no text.`
  - Referencias: `assets/sprites/battlefield/oak.png`, `assets/vfx/ciudad/tex_calle.png`

## B390 — Portada de arena "Laberinto" (JPG 960×420)  
*Prioridad P1 · PENDIENTE*

- **`D-PORTADA-laberinto`** — Portada de arena (ilustración). Portada de arena "Laberinto" (JPG 960×420). Códice (codex.js:270), Libro de la Horda (teñida de tinta), ficha de arena (arena-briefing.js:58), campamento (camp.js:204,298), pantallas de historia (story.js:340).
  - Método: runway (ilustración, sin reducir a pixel). Entrega: `art-source/entregas/2026-10_mundo/portadas/laberinto.png`.
  - Formato: PNG 960×420 pixel art nativo (o grilla nativa que se acuerde, p. ej. 480×210 ×2), sin texto, sin degradé de compresión, ≤ 250 tonos, ≤ 170 KB. Componer para que el centro-derecha quede legible (el Libro recorta/panea).
  - Prompt: `Dark fantasy illustration cover of the arena, Portada de arena "Laberinto" (JPG 960×420), wide composition, painterly, strong silhouette, no text.`
  - Referencias: `assets/sprites/battlefield/oak.png`, `assets/vfx/ciudad/tex_calle.png`

## B391 — Portada de arena "Reino Fúngico" (JPG 960×420)  
*Prioridad P1 · PENDIENTE*

- **`D-PORTADA-micelial`** — Portada de arena (ilustración). Portada de arena "Reino Fúngico" (JPG 960×420). Códice (codex.js:270), Libro de la Horda (teñida de tinta), ficha de arena (arena-briefing.js:58), campamento (camp.js:204,298), pantallas de historia (story.js:340).
  - Método: runway (ilustración, sin reducir a pixel). Entrega: `art-source/entregas/2026-10_mundo/portadas/micelial.png`.
  - Formato: PNG 960×420 pixel art nativo (o grilla nativa que se acuerde, p. ej. 480×210 ×2), sin texto, sin degradé de compresión, ≤ 250 tonos, ≤ 170 KB. Componer para que el centro-derecha quede legible (el Libro recorta/panea).
  - Prompt: `Dark fantasy illustration cover of the arena, Portada de arena "Reino Fúngico" (JPG 960×420), wide composition, painterly, strong silhouette, no text.`
  - Referencias: `assets/sprites/battlefield/oak.png`, `assets/vfx/ciudad/tex_calle.png`

## B495 — Ícono de objeto "Espada de Lucifer" (Set, Arma (arma)) / Ícono de objeto "Escudo de Lucifer" (Set, Escudo (escudo)) / Ícono de objeto "Casco de Lucifer" (Set, Casco (casco)) / Ícono de objeto "Pechera de Lucifer" (Set, Pechera (pechera))  
*Prioridad P2 · PENDIENTE*

- **`C-ITEM-lucifer_arma`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Espada de Lucifer" (Set, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Set de Lucifer.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/lucifer_arma.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Espada de Lucifer" (Set, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-lucifer_escudo`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Escudo de Lucifer" (Set, Escudo (escudo)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Set de Lucifer.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/lucifer_escudo.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Escudo de Lucifer" (Set, Escudo (escudo)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-lucifer_casco`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Casco de Lucifer" (Set, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Set de Lucifer.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/lucifer_casco.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Casco de Lucifer" (Set, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-lucifer_pechera`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Pechera de Lucifer" (Set, Pechera (pechera)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Set de Lucifer.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/lucifer_pechera.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Pechera de Lucifer" (Set, Pechera (pechera)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B496 — Ícono de objeto "Guantes de Lucifer" (Set, Guantes (guantes)) / Ícono de objeto "Botas de Lucifer" (Set, Botas (botas)) / Ícono de objeto "Colmillo del Glaciar" (Set, Arma (arma)) / Ícono de objeto "Diadema de Escarcha" (Set, Casco (casco))  
*Prioridad P2 · PENDIENTE*

- **`C-ITEM-lucifer_guantes`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Guantes de Lucifer" (Set, Guantes (guantes)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Set de Lucifer.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/lucifer_guantes.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Guantes de Lucifer" (Set, Guantes (guantes)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-lucifer_botas`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Botas de Lucifer" (Set, Botas (botas)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Set de Lucifer.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/lucifer_botas.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Botas de Lucifer" (Set, Botas (botas)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-glaciar_arma`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Colmillo del Glaciar" (Set, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Pacto del Glaciar.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/glaciar_arma.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Colmillo del Glaciar" (Set, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-glaciar_casco`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Diadema de Escarcha" (Set, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Pacto del Glaciar.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/glaciar_casco.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Diadema de Escarcha" (Set, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B497 — Ícono de objeto "Coraza del Invierno" (Set, Pechera (pechera)) / Ícono de objeto "Garras Gélidas" (Set, Guantes (guantes)) / Ícono de objeto "Bastión del Coloso" (Set, Escudo (escudo)) / Ícono de objeto "Yelmo del Coloso" (Set, Casco (casco))  
*Prioridad P2 · PENDIENTE*

- **`C-ITEM-glaciar_pechera`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Coraza del Invierno" (Set, Pechera (pechera)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Pacto del Glaciar.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/glaciar_pechera.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Coraza del Invierno" (Set, Pechera (pechera)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-glaciar_guantes`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Garras Gélidas" (Set, Guantes (guantes)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Pacto del Glaciar.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/glaciar_guantes.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Garras Gélidas" (Set, Guantes (guantes)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-coloso_escudo`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Bastión del Coloso" (Set, Escudo (escudo)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Corazón del Coloso.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/coloso_escudo.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Bastión del Coloso" (Set, Escudo (escudo)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-coloso_casco`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Yelmo del Coloso" (Set, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Corazón del Coloso.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/coloso_casco.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Yelmo del Coloso" (Set, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B498 — Ícono de objeto "Corazón de Piedra" (Set, Pechera (pechera)) / Ícono de objeto "Pisada del Coloso" (Set, Botas (botas)) / Ícono de objeto "Pala del Sepulturero" (Set, Arma (arma)) / Ícono de objeto "Capucha del Réquiem" (Set, Casco (casco))  
*Prioridad P2 · PENDIENTE*

- **`C-ITEM-coloso_pechera`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Corazón de Piedra" (Set, Pechera (pechera)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Corazón del Coloso.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/coloso_pechera.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Corazón de Piedra" (Set, Pechera (pechera)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-coloso_botas`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Pisada del Coloso" (Set, Botas (botas)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Corazón del Coloso.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/coloso_botas.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Pisada del Coloso" (Set, Botas (botas)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-sepulturero_arma`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Pala del Sepulturero" (Set, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Réquiem del Sepulturero.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/sepulturero_arma.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Pala del Sepulturero" (Set, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-sepulturero_casco`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Capucha del Réquiem" (Set, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Réquiem del Sepulturero.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/sepulturero_casco.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Capucha del Réquiem" (Set, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B499 — Ícono de objeto "Mortaja Cosida" (Set, Pechera (pechera)) / Ícono de objeto "Manos de Tierra" (Set, Guantes (guantes)) / Ícono de objeto "Cetro del Relámpago" (Set, Arma (arma)) / Ícono de objeto "Corona de Nubes" (Set, Casco (casco))  
*Prioridad P2 · PENDIENTE*

- **`C-ITEM-sepulturero_pechera`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Mortaja Cosida" (Set, Pechera (pechera)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Réquiem del Sepulturero.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/sepulturero_pechera.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Mortaja Cosida" (Set, Pechera (pechera)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-sepulturero_guantes`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Manos de Tierra" (Set, Guantes (guantes)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Réquiem del Sepulturero.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/sepulturero_guantes.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Manos de Tierra" (Set, Guantes (guantes)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-tempestad_arma`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Cetro del Relámpago" (Set, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Tempestad Eterna.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/tempestad_arma.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Cetro del Relámpago" (Set, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-tempestad_casco`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Corona de Nubes" (Set, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Tempestad Eterna.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/tempestad_casco.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Corona de Nubes" (Set, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B500 — Ícono de objeto "Guantes de Descarga" (Set, Guantes (guantes)) / Ícono de objeto "Botas del Rayo" (Set, Botas (botas)) / Ícono de objeto "Hacha Sedienta" (Set, Arma (arma)) / Ícono de objeto "Piel del Berserker" (Set, Pechera (pechera))  
*Prioridad P2 · PENDIENTE*

- **`C-ITEM-tempestad_guantes`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Guantes de Descarga" (Set, Guantes (guantes)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Tempestad Eterna.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/tempestad_guantes.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Guantes de Descarga" (Set, Guantes (guantes)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-tempestad_botas`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Botas del Rayo" (Set, Botas (botas)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Tempestad Eterna.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/tempestad_botas.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Botas del Rayo" (Set, Botas (botas)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-berserker_arma`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Hacha Sedienta" (Set, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Sangre del Berserker.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/berserker_arma.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Hacha Sedienta" (Set, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-berserker_pechera`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Piel del Berserker" (Set, Pechera (pechera)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Sangre del Berserker.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/berserker_pechera.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Piel del Berserker" (Set, Pechera (pechera)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B501 — Ícono de objeto "Puños de Sangre" (Set, Guantes (guantes)) / Ícono de objeto "Botas de la Carga" (Set, Botas (botas)) / Ícono de objeto "Égida del Juramento" (Set, Escudo (escudo)) / Ícono de objeto "Yelmo del Guardián" (Set, Casco (casco))  
*Prioridad P2 · PENDIENTE*

- **`C-ITEM-berserker_guantes`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Puños de Sangre" (Set, Guantes (guantes)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Sangre del Berserker.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/berserker_guantes.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Puños de Sangre" (Set, Guantes (guantes)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-berserker_botas`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Botas de la Carga" (Set, Botas (botas)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Sangre del Berserker.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/berserker_botas.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Botas de la Carga" (Set, Botas (botas)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-guardian_escudo`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Égida del Juramento" (Set, Escudo (escudo)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Juramento del Guardián.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/guardian_escudo.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Égida del Juramento" (Set, Escudo (escudo)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-guardian_casco`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Yelmo del Guardián" (Set, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Juramento del Guardián.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/guardian_casco.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Yelmo del Guardián" (Set, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B502 — Ícono de objeto "Peto Juramentado" (Set, Pechera (pechera)) / Ícono de objeto "Guanteletes de la Promesa" (Set, Guantes (guantes)) / Ícono de objeto "Báculo del Alba" (Set, Arma (arma)) / Ícono de objeto "Aureola Profética" (Set, Casco (casco))  
*Prioridad P2 · PENDIENTE*

- **`C-ITEM-guardian_pechera`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Peto Juramentado" (Set, Pechera (pechera)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Juramento del Guardián.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/guardian_pechera.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Peto Juramentado" (Set, Pechera (pechera)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-guardian_guantes`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Guanteletes de la Promesa" (Set, Guantes (guantes)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Juramento del Guardián.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/guardian_guantes.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Guanteletes de la Promesa" (Set, Guantes (guantes)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-alba_arma`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Báculo del Alba" (Set, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Profecía del Alba.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/alba_arma.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Báculo del Alba" (Set, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-alba_casco`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Aureola Profética" (Set, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Profecía del Alba.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/alba_casco.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Aureola Profética" (Set, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B503 — Ícono de objeto "Túnica del Amanecer" (Set, Pechera (pechera)) / Ícono de objeto "Sandalias de Luz" (Set, Botas (botas)) / Ícono de objeto "Colmillo de la Sombra" (Set, Arma (arma)) / Ícono de objeto "Máscara del Acecho" (Set, Casco (casco))  
*Prioridad P2 · PENDIENTE*

- **`C-ITEM-alba_pechera`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Túnica del Amanecer" (Set, Pechera (pechera)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Profecía del Alba.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/alba_pechera.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Túnica del Amanecer" (Set, Pechera (pechera)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-alba_botas`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Sandalias de Luz" (Set, Botas (botas)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Profecía del Alba.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/alba_botas.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Sandalias de Luz" (Set, Botas (botas)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-cazador_arma`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Colmillo de la Sombra" (Set, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Sombra del Cazador.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/cazador_arma.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Colmillo de la Sombra" (Set, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-cazador_casco`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Máscara del Acecho" (Set, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Sombra del Cazador.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/cazador_casco.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Máscara del Acecho" (Set, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B504 — Ícono de objeto "Guantes Silenciosos" (Set, Guantes (guantes)) / Ícono de objeto "Pasos de Sombra" (Set, Botas (botas)) / Ícono de objeto "Orbe del Arcano" (Set, Arma (arma)) / Ícono de objeto "Ojo Abierto" (Set, Casco (casco))  
*Prioridad P2 · PENDIENTE*

- **`C-ITEM-cazador_guantes`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Guantes Silenciosos" (Set, Guantes (guantes)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Sombra del Cazador.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/cazador_guantes.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Guantes Silenciosos" (Set, Guantes (guantes)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-cazador_botas`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Pasos de Sombra" (Set, Botas (botas)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Sombra del Cazador.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/cazador_botas.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Pasos de Sombra" (Set, Botas (botas)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-arcano_arma`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Orbe del Arcano" (Set, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Ojo del Arcano.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/arcano_arma.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Orbe del Arcano" (Set, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-arcano_casco`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Ojo Abierto" (Set, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Ojo del Arcano.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/arcano_casco.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Ojo Abierto" (Set, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B505 — Ícono de objeto "Dedos del Sello" (Set, Guantes (guantes)) / Ícono de objeto "Pasos del Vacío" (Set, Botas (botas)) / Ícono de objeto "Corona del Rey Errante" (Set, Casco (casco)) / Ícono de objeto "Manto de los Pasillos" (Set, Pechera (pechera))  
*Prioridad P2 · PENDIENTE*

- **`C-ITEM-arcano_guantes`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Dedos del Sello" (Set, Guantes (guantes)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Ojo del Arcano.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/arcano_guantes.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Dedos del Sello" (Set, Guantes (guantes)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-arcano_botas`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Pasos del Vacío" (Set, Botas (botas)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Ojo del Arcano.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/arcano_botas.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Pasos del Vacío" (Set, Botas (botas)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-laberinto_casco`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Corona del Rey Errante" (Set, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Rey del Laberinto.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/laberinto_casco.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Corona del Rey Errante" (Set, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-laberinto_pechera`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Manto de los Pasillos" (Set, Pechera (pechera)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Rey del Laberinto.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/laberinto_pechera.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Manto de los Pasillos" (Set, Pechera (pechera)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B506 — Ícono de objeto "Guantes del Cartógrafo" (Set, Guantes (guantes)) / Ícono de objeto "Botas del Rey" (Set, Botas (botas)) / Ícono de objeto "Pavés del Baluarte" (Set, Escudo (escudo)) / Ícono de objeto "Yelmo del Baluarte" (Set, Casco (casco))  
*Prioridad P2 · PENDIENTE*

- **`C-ITEM-laberinto_guantes`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Guantes del Cartógrafo" (Set, Guantes (guantes)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Rey del Laberinto.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/laberinto_guantes.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Guantes del Cartógrafo" (Set, Guantes (guantes)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-laberinto_botas`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Botas del Rey" (Set, Botas (botas)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Universal. Set: Rey del Laberinto.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/laberinto_botas.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Botas del Rey" (Set, Botas (botas)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-baluarte_escudo`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Pavés del Baluarte" (Set, Escudo (escudo)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Tanque. Set: Baluarte Inquebrantable.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/baluarte_escudo.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Pavés del Baluarte" (Set, Escudo (escudo)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-baluarte_casco`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Yelmo del Baluarte" (Set, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Tanque. Set: Baluarte Inquebrantable.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/baluarte_casco.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Yelmo del Baluarte" (Set, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B507 — Ícono de objeto "Coraza del Baluarte" (Set, Pechera (pechera)) / Ícono de objeto "Grebas del Baluarte" (Set, Botas (botas)) / Ícono de objeto "Colmillo Nocturno" (Set, Arma (arma)) / Ícono de objeto "Capucha Nocturna" (Set, Casco (casco))  
*Prioridad P2 · PENDIENTE*

- **`C-ITEM-baluarte_pechera`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Coraza del Baluarte" (Set, Pechera (pechera)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Tanque. Set: Baluarte Inquebrantable.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/baluarte_pechera.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Coraza del Baluarte" (Set, Pechera (pechera)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-baluarte_botas`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Grebas del Baluarte" (Set, Botas (botas)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Tanque. Set: Baluarte Inquebrantable.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/baluarte_botas.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Grebas del Baluarte" (Set, Botas (botas)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-nocturno_arma`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Colmillo Nocturno" (Set, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Asesino. Set: Sombra Nocturna.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/nocturno_arma.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Colmillo Nocturno" (Set, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-nocturno_casco`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Capucha Nocturna" (Set, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Asesino. Set: Sombra Nocturna.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/nocturno_casco.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Capucha Nocturna" (Set, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B508 — Ícono de objeto "Guantes del Degollador" (Set, Guantes (guantes)) / Ícono de objeto "Pasos Nocturnos" (Set, Botas (botas)) / Ícono de objeto "Bastón de la Convergencia" (Set, Arma (arma)) / Ícono de objeto "Capucha Tricolor" (Set, Casco (casco))  
*Prioridad P2 · PENDIENTE*

- **`C-ITEM-nocturno_guantes`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Guantes del Degollador" (Set, Guantes (guantes)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Asesino. Set: Sombra Nocturna.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/nocturno_guantes.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Guantes del Degollador" (Set, Guantes (guantes)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-nocturno_botas`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Pasos Nocturnos" (Set, Botas (botas)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Asesino. Set: Sombra Nocturna.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/nocturno_botas.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Pasos Nocturnos" (Set, Botas (botas)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-convergencia_arma`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Bastón de la Convergencia" (Set, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Mago. Set: Convergencia Elemental.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/convergencia_arma.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Bastón de la Convergencia" (Set, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-convergencia_casco`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Capucha Tricolor" (Set, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Mago. Set: Convergencia Elemental.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/convergencia_casco.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Capucha Tricolor" (Set, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B509 — Ícono de objeto "Túnica de los Tres Elementos" (Set, Pechera (pechera)) / Ícono de objeto "Sellos Elementales" (Set, Guantes (guantes)) / Ícono de objeto "Báculo del Custodio" (Set, Arma (arma)) / Ícono de objeto "Mitra del Custodio" (Set, Casco (casco))  
*Prioridad P2 · PENDIENTE*

- **`C-ITEM-convergencia_pechera`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Túnica de los Tres Elementos" (Set, Pechera (pechera)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Mago. Set: Convergencia Elemental.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/convergencia_pechera.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Túnica de los Tres Elementos" (Set, Pechera (pechera)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-convergencia_guantes`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Sellos Elementales" (Set, Guantes (guantes)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Mago. Set: Convergencia Elemental.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/convergencia_guantes.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Sellos Elementales" (Set, Guantes (guantes)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-custodio_arma`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Báculo del Custodio" (Set, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Soporte. Set: Bendición del Custodio.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/custodio_arma.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Báculo del Custodio" (Set, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-custodio_casco`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Mitra del Custodio" (Set, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Soporte. Set: Bendición del Custodio.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/custodio_casco.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Mitra del Custodio" (Set, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B510 — Ícono de objeto "Hábito del Custodio" (Set, Pechera (pechera)) / Ícono de objeto "Sandalias del Custodio" (Set, Botas (botas)) / Ícono de objeto "Guadaña de la Marea" (Set, Arma (arma)) / Ícono de objeto "Coraza Carmesí" (Set, Pechera (pechera))  
*Prioridad P2 · PENDIENTE*

- **`C-ITEM-custodio_pechera`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Hábito del Custodio" (Set, Pechera (pechera)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Soporte. Set: Bendición del Custodio.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/custodio_pechera.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Hábito del Custodio" (Set, Pechera (pechera)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-custodio_botas`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Sandalias del Custodio" (Set, Botas (botas)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Soporte. Set: Bendición del Custodio.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/custodio_botas.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Sandalias del Custodio" (Set, Botas (botas)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-marea_arma`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Guadaña de la Marea" (Set, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Segador Olvidado. Set: Marea Roja.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/marea_arma.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Guadaña de la Marea" (Set, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-marea_pechera`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Coraza Carmesí" (Set, Pechera (pechera)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Segador Olvidado. Set: Marea Roja.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/marea_pechera.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Coraza Carmesí" (Set, Pechera (pechera)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B511 — Ícono de objeto "Garras de la Marea" (Set, Guantes (guantes)) / Ícono de objeto "Botas del Olvido" (Set, Botas (botas)) / Ícono de objeto "Núcleo Raíz" (Set, Arma (arma)) / Ícono de objeto "Visor de Depuración" (Set, Casco (casco))  
*Prioridad P2 · PENDIENTE*

- **`C-ITEM-marea_guantes`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Garras de la Marea" (Set, Guantes (guantes)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Segador Olvidado. Set: Marea Roja.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/marea_guantes.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Garras de la Marea" (Set, Guantes (guantes)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-marea_botas`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Botas del Olvido" (Set, Botas (botas)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Segador Olvidado. Set: Marea Roja.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/marea_botas.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Botas del Olvido" (Set, Botas (botas)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-sistema_arma`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Núcleo Raíz" (Set, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Axiom. Set: Acceso Raíz.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/sistema_arma.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Núcleo Raíz" (Set, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-sistema_casco`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Visor de Depuración" (Set, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Axiom. Set: Acceso Raíz.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/sistema_casco.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Visor de Depuración" (Set, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B512 — Ícono de objeto "Guantes de Compilación" (Set, Guantes (guantes)) / Ícono de objeto "Pasos Asíncronos" (Set, Botas (botas)) / Ícono de objeto "Velo de la Profecía" (Set, Casco (casco)) / Ícono de objeto "Manto del Augurio" (Set, Pechera (pechera))  
*Prioridad P2 · PENDIENTE*

- **`C-ITEM-sistema_guantes`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Guantes de Compilación" (Set, Guantes (guantes)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Axiom. Set: Acceso Raíz.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/sistema_guantes.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Guantes de Compilación" (Set, Guantes (guantes)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-sistema_botas`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Pasos Asíncronos" (Set, Botas (botas)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Axiom. Set: Acceso Raíz.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/sistema_botas.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Pasos Asíncronos" (Set, Botas (botas)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-profecia_casco`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Velo de la Profecía" (Set, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: La Profeta. Set: La Última Profecía.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/profecia_casco.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Velo de la Profecía" (Set, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-profecia_pechera`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Manto del Augurio" (Set, Pechera (pechera)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: La Profeta. Set: La Última Profecía.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/profecia_pechera.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Manto del Augurio" (Set, Pechera (pechera)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B513 — Ícono de objeto "Brazales del Destino" (Set, Guantes (guantes)) / Ícono de objeto "Pasos del Presagio" (Set, Botas (botas)) / Ícono de objeto "Bokken del Errante" (Set, Arma (arma)) / Ícono de objeto "Kasa del Errante" (Set, Casco (casco))  
*Prioridad P2 · PENDIENTE*

- **`C-ITEM-profecia_guantes`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Brazales del Destino" (Set, Guantes (guantes)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: La Profeta. Set: La Última Profecía.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/profecia_guantes.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Brazales del Destino" (Set, Guantes (guantes)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-profecia_botas`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Pasos del Presagio" (Set, Botas (botas)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: La Profeta. Set: La Última Profecía.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/profecia_botas.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Pasos del Presagio" (Set, Botas (botas)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-errante_arma`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Bokken del Errante" (Set, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Musashi. Set: El Rōnin Errante.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/errante_arma.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Bokken del Errante" (Set, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-errante_casco`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Kasa del Errante" (Set, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Musashi. Set: El Rōnin Errante.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/errante_casco.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Kasa del Errante" (Set, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B514 — Ícono de objeto "Tekko del Errante" (Set, Guantes (guantes)) / Ícono de objeto "Waraji del Errante" (Set, Botas (botas)) / Ícono de objeto "Arco de la Manada" (Set, Arma (arma)) / Ícono de objeto "Capucha del Rastreador" (Set, Casco (casco))  
*Prioridad P2 · PENDIENTE*

- **`C-ITEM-errante_guantes`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Tekko del Errante" (Set, Guantes (guantes)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Musashi. Set: El Rōnin Errante.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/errante_guantes.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Tekko del Errante" (Set, Guantes (guantes)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-errante_botas`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Waraji del Errante" (Set, Botas (botas)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Musashi. Set: El Rōnin Errante.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/errante_botas.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Waraji del Errante" (Set, Botas (botas)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-manada_arma`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Arco de la Manada" (Set, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: La Cazadora. Set: La Manada.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/manada_arma.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Arco de la Manada" (Set, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-manada_casco`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Capucha del Rastreador" (Set, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: La Cazadora. Set: La Manada.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/manada_casco.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Capucha del Rastreador" (Set, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B515 — Ícono de objeto "Guantes de la Cuerda Tensa" (Set, Guantes (guantes)) / Ícono de objeto "Botas del Sendero" (Set, Botas (botas)) / Ícono de objeto "Fusil del Granadero" (Set, Arma (arma)) / Ícono de objeto "Morrión del Granadero" (Set, Casco (casco))  
*Prioridad P2 · PENDIENTE*

- **`C-ITEM-manada_guantes`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Guantes de la Cuerda Tensa" (Set, Guantes (guantes)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: La Cazadora. Set: La Manada.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/manada_guantes.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Guantes de la Cuerda Tensa" (Set, Guantes (guantes)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-manada_botas`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Botas del Sendero" (Set, Botas (botas)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: La Cazadora. Set: La Manada.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/manada_botas.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Botas del Sendero" (Set, Botas (botas)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-granadero_arma`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Fusil del Granadero" (Set, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: El Libertador. Set: Uniforme del Granadero.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/granadero_arma.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Fusil del Granadero" (Set, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-granadero_casco`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Morrión del Granadero" (Set, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: El Libertador. Set: Uniforme del Granadero.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/granadero_casco.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Morrión del Granadero" (Set, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B516 — Ícono de objeto "Casaca Azul" (Set, Pechera (pechera)) / Ícono de objeto "Botas de Caballería" (Set, Botas (botas)) / Ícono de objeto "Cetro del Réquiem" (Set, Arma (arma)) / Ícono de objeto "Corona de Huesos" (Set, Casco (casco))  
*Prioridad P2 · PENDIENTE*

- **`C-ITEM-granadero_pechera`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Casaca Azul" (Set, Pechera (pechera)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: El Libertador. Set: Uniforme del Granadero.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/granadero_pechera.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Casaca Azul" (Set, Pechera (pechera)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-granadero_botas`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Botas de Caballería" (Set, Botas (botas)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: El Libertador. Set: Uniforme del Granadero.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/granadero_botas.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Botas de Caballería" (Set, Botas (botas)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-requiem_arma`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Cetro del Réquiem" (Set, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Nigromante. Set: Réquiem del Señor de la Muerte.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/requiem_arma.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Cetro del Réquiem" (Set, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-requiem_casco`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Corona de Huesos" (Set, Casco (casco)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Nigromante. Set: Réquiem del Señor de la Muerte.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/requiem_casco.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Corona de Huesos" (Set, Casco (casco)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B517 — Ícono de objeto "Mortaja del Señor" (Set, Pechera (pechera)) / Ícono de objeto "Garras de la Tumba" (Set, Guantes (guantes)) / Ícono de objeto "Hoces de la Caravana" (Set, Arma (arma)) / Ícono de objeto "Arnés de Faroles" (Set, Pechera (pechera))  
*Prioridad P2 · PENDIENTE*

- **`C-ITEM-requiem_pechera`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Mortaja del Señor" (Set, Pechera (pechera)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Nigromante. Set: Réquiem del Señor de la Muerte.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/requiem_pechera.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Mortaja del Señor" (Set, Pechera (pechera)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-requiem_guantes`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Garras de la Tumba" (Set, Guantes (guantes)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Nigromante. Set: Réquiem del Señor de la Muerte.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/requiem_guantes.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Garras de la Tumba" (Set, Guantes (guantes)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-legion_arma`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Hoces de la Caravana" (Set, Arma (arma)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Ilkan, el Caminante de Dunas. Set: Caravana de Medianoche.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/legion_arma.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Hoces de la Caravana" (Set, Arma (arma)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-legion_pechera`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Arnés de Faroles" (Set, Pechera (pechera)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Ilkan, el Caminante de Dunas. Set: Caravana de Medianoche.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/legion_pechera.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Arnés de Faroles" (Set, Pechera (pechera)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B518 — Ícono de objeto "Empuñaduras de Cristal" (Set, Guantes (guantes)) / Ícono de objeto "Botas de Arena" (Set, Botas (botas))  
*Prioridad P2 · PENDIENTE*

- **`C-ITEM-legion_guantes`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Empuñaduras de Cristal" (Set, Guantes (guantes)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Ilkan, el Caminante de Dunas. Set: Caravana de Medianoche.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/legion_guantes.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Empuñaduras de Cristal" (Set, Guantes (guantes)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`
- **`C-ITEM-legion_botas`** — Objeto de equipo (ícono y/o sprite). Ícono de objeto "Botas de Arena" (Set, Botas (botas)). Inventario, cofre, recetario (js/ui/item-icons.js: hoy ícono procedural provisorio; ITEM_ICON_ART está vacío). Uso: Ilkan, el Caminante de Dunas. Set: Caravana de Medianoche.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/objetos/legion_botas.png`.
  - Formato: PNG 64×64, fondo transparente, contorno 1 px, 2–3 tonos por color, paleta 4–6 colores + contorno, alfa 0/255. SIN marco de rareza ni texto (los dibuja el juego).
  - Prompt: `Pixel art game item icon, Ícono de objeto "Botas de Arena" (Set, Botas (botas)), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/ui/skill-icons/embestida.png`, `assets/sprites/champions/baltra/preview.png`

## B519 — Retrato del Códice de Minas "titan" (JPG 192×208) / Retrato del Códice de Minas "titan_full" (JPG 314×286) / Retrato del Códice de Minas "cerbero" (JPG 420×357) / Retrato del Códice de Minas "devoraluz" (JPG 192×319)  
*Prioridad P2 · PENDIENTE*

- **`C-CODEX-minas-titan`** — Retrato del Códice (ilustración). Retrato del Códice de Minas "titan" (JPG 192×208). Se precarga con MINAS_TEX (js/assets/minas-meta.js; js/arenas/minas/mn-render.js:20). No encontré dónde se dibuja: confirmar con Claude antes de pintar.
  - Método: runway o ChatGPT (ilustración, sin reducir a pixel). Entrega: `art-source/entregas/2026-10_mundo/codice/minas_titan.png`.
  - Formato: PNG pixel art, mismo tamaño de lienzo (192×208) o su grilla nativa; sin JPG, sin degradé de compresión, ≤ 250 tonos.
  - Prompt: `Dark fantasy character portrait illustration, Retrato del Códice de Minas "titan" (JPG 192×208), half body, painterly, consistent with the Códice style, no text, no frame.`
  - Referencias: `assets/sprites/arenas/minas/mn_titan/atlas.png`
- **`C-CODEX-minas-titan_full`** — Retrato del Códice (ilustración). Retrato del Códice de Minas "titan_full" (JPG 314×286). Se precarga con MINAS_TEX (js/assets/minas-meta.js; js/arenas/minas/mn-render.js:20). No encontré dónde se dibuja: confirmar con Claude antes de pintar.
  - Método: runway o ChatGPT (ilustración, sin reducir a pixel). Entrega: `art-source/entregas/2026-10_mundo/codice/minas_titan_full.png`.
  - Formato: PNG pixel art, mismo tamaño de lienzo (314×286) o su grilla nativa; sin JPG, sin degradé de compresión, ≤ 250 tonos.
  - Prompt: `Dark fantasy character portrait illustration, Retrato del Códice de Minas "titan_full" (JPG 314×286), half body, painterly, consistent with the Códice style, no text, no frame.`
  - Referencias: `assets/sprites/arenas/minas/mn_titan/atlas.png`
- **`C-CODEX-minas-cerbero`** — Retrato del Códice (ilustración). Retrato del Códice de Minas "cerbero" (JPG 420×357). Se precarga con MINAS_TEX (js/assets/minas-meta.js; js/arenas/minas/mn-render.js:20). No encontré dónde se dibuja: confirmar con Claude antes de pintar.
  - Método: runway o ChatGPT (ilustración, sin reducir a pixel). Entrega: `art-source/entregas/2026-10_mundo/codice/minas_cerbero.png`.
  - Formato: PNG pixel art, mismo tamaño de lienzo (420×357) o su grilla nativa; sin JPG, sin degradé de compresión, ≤ 250 tonos.
  - Prompt: `Dark fantasy character portrait illustration, Retrato del Códice de Minas "cerbero" (JPG 420×357), half body, painterly, consistent with the Códice style, no text, no frame.`
  - Referencias: `assets/sprites/arenas/minas/mn_titan/atlas.png`
- **`C-CODEX-minas-devoraluz`** — Retrato del Códice (ilustración). Retrato del Códice de Minas "devoraluz" (JPG 192×319). Se precarga con MINAS_TEX (js/assets/minas-meta.js; js/arenas/minas/mn-render.js:20). No encontré dónde se dibuja: confirmar con Claude antes de pintar.
  - Método: runway o ChatGPT (ilustración, sin reducir a pixel). Entrega: `art-source/entregas/2026-10_mundo/codice/minas_devoraluz.png`.
  - Formato: PNG pixel art, mismo tamaño de lienzo (192×319) o su grilla nativa; sin JPG, sin degradé de compresión, ≤ 250 tonos.
  - Prompt: `Dark fantasy character portrait illustration, Retrato del Códice de Minas "devoraluz" (JPG 192×319), half body, painterly, consistent with the Códice style, no text, no frame.`
  - Referencias: `assets/sprites/arenas/minas/mn_titan/atlas.png`

## B520 — Retrato del Códice de Minas "devoraluz_full" (JPG 252×320) / Retrato del Códice de Minas "esclavo" (JPG 222×198) / Retrato del Códice de Minas "insecto" (JPG 222×194) / Retrato del Códice de Minas "acechador" (JPG 222×190)  
*Prioridad P2 · PENDIENTE*

- **`C-CODEX-minas-devoraluz_full`** — Retrato del Códice (ilustración). Retrato del Códice de Minas "devoraluz_full" (JPG 252×320). Se precarga con MINAS_TEX (js/assets/minas-meta.js; js/arenas/minas/mn-render.js:20). No encontré dónde se dibuja: confirmar con Claude antes de pintar.
  - Método: runway o ChatGPT (ilustración, sin reducir a pixel). Entrega: `art-source/entregas/2026-10_mundo/codice/minas_devoraluz_full.png`.
  - Formato: PNG pixel art, mismo tamaño de lienzo (252×320) o su grilla nativa; sin JPG, sin degradé de compresión, ≤ 250 tonos.
  - Prompt: `Dark fantasy character portrait illustration, Retrato del Códice de Minas "devoraluz_full" (JPG 252×320), half body, painterly, consistent with the Códice style, no text, no frame.`
  - Referencias: `assets/sprites/arenas/minas/mn_titan/atlas.png`
- **`C-CODEX-minas-esclavo`** — Retrato del Códice (ilustración). Retrato del Códice de Minas "esclavo" (JPG 222×198). Se precarga con MINAS_TEX (js/assets/minas-meta.js; js/arenas/minas/mn-render.js:20). No encontré dónde se dibuja: confirmar con Claude antes de pintar.
  - Método: runway o ChatGPT (ilustración, sin reducir a pixel). Entrega: `art-source/entregas/2026-10_mundo/codice/minas_esclavo.png`.
  - Formato: PNG pixel art, mismo tamaño de lienzo (222×198) o su grilla nativa; sin JPG, sin degradé de compresión, ≤ 250 tonos.
  - Prompt: `Dark fantasy character portrait illustration, Retrato del Códice de Minas "esclavo" (JPG 222×198), half body, painterly, consistent with the Códice style, no text, no frame.`
  - Referencias: `assets/sprites/arenas/minas/mn_titan/atlas.png`
- **`C-CODEX-minas-insecto`** — Retrato del Códice (ilustración). Retrato del Códice de Minas "insecto" (JPG 222×194). Se precarga con MINAS_TEX (js/assets/minas-meta.js; js/arenas/minas/mn-render.js:20). No encontré dónde se dibuja: confirmar con Claude antes de pintar.
  - Método: runway o ChatGPT (ilustración, sin reducir a pixel). Entrega: `art-source/entregas/2026-10_mundo/codice/minas_insecto.png`.
  - Formato: PNG pixel art, mismo tamaño de lienzo (222×194) o su grilla nativa; sin JPG, sin degradé de compresión, ≤ 250 tonos.
  - Prompt: `Dark fantasy character portrait illustration, Retrato del Códice de Minas "insecto" (JPG 222×194), half body, painterly, consistent with the Códice style, no text, no frame.`
  - Referencias: `assets/sprites/arenas/minas/mn_titan/atlas.png`
- **`C-CODEX-minas-acechador`** — Retrato del Códice (ilustración). Retrato del Códice de Minas "acechador" (JPG 222×190). Se precarga con MINAS_TEX (js/assets/minas-meta.js; js/arenas/minas/mn-render.js:20). No encontré dónde se dibuja: confirmar con Claude antes de pintar.
  - Método: runway o ChatGPT (ilustración, sin reducir a pixel). Entrega: `art-source/entregas/2026-10_mundo/codice/minas_acechador.png`.
  - Formato: PNG pixel art, mismo tamaño de lienzo (222×190) o su grilla nativa; sin JPG, sin degradé de compresión, ≤ 250 tonos.
  - Prompt: `Dark fantasy character portrait illustration, Retrato del Códice de Minas "acechador" (JPG 222×190), half body, painterly, consistent with the Códice style, no text, no frame.`
  - Referencias: `assets/sprites/arenas/minas/mn_titan/atlas.png`

## B521 — Retrato del Códice de Minas "minero" (JPG 222×205) / Retrato del Códice de Minas "escupidor" (JPG 222×253) / Retrato del Códice de Minas "consumidor" (JPG 222×270)  
*Prioridad P2 · PENDIENTE*

- **`C-CODEX-minas-minero`** — Retrato del Códice (ilustración). Retrato del Códice de Minas "minero" (JPG 222×205). Se precarga con MINAS_TEX (js/assets/minas-meta.js; js/arenas/minas/mn-render.js:20). No encontré dónde se dibuja: confirmar con Claude antes de pintar.
  - Método: runway o ChatGPT (ilustración, sin reducir a pixel). Entrega: `art-source/entregas/2026-10_mundo/codice/minas_minero.png`.
  - Formato: PNG pixel art, mismo tamaño de lienzo (222×205) o su grilla nativa; sin JPG, sin degradé de compresión, ≤ 250 tonos.
  - Prompt: `Dark fantasy character portrait illustration, Retrato del Códice de Minas "minero" (JPG 222×205), half body, painterly, consistent with the Códice style, no text, no frame.`
  - Referencias: `assets/sprites/arenas/minas/mn_titan/atlas.png`
- **`C-CODEX-minas-escupidor`** — Retrato del Códice (ilustración). Retrato del Códice de Minas "escupidor" (JPG 222×253). Se precarga con MINAS_TEX (js/assets/minas-meta.js; js/arenas/minas/mn-render.js:20). No encontré dónde se dibuja: confirmar con Claude antes de pintar.
  - Método: runway o ChatGPT (ilustración, sin reducir a pixel). Entrega: `art-source/entregas/2026-10_mundo/codice/minas_escupidor.png`.
  - Formato: PNG pixel art, mismo tamaño de lienzo (222×253) o su grilla nativa; sin JPG, sin degradé de compresión, ≤ 250 tonos.
  - Prompt: `Dark fantasy character portrait illustration, Retrato del Códice de Minas "escupidor" (JPG 222×253), half body, painterly, consistent with the Códice style, no text, no frame.`
  - Referencias: `assets/sprites/arenas/minas/mn_titan/atlas.png`
- **`C-CODEX-minas-consumidor`** — Retrato del Códice (ilustración). Retrato del Códice de Minas "consumidor" (JPG 222×270). Se precarga con MINAS_TEX (js/assets/minas-meta.js; js/arenas/minas/mn-render.js:20). No encontré dónde se dibuja: confirmar con Claude antes de pintar.
  - Método: runway o ChatGPT (ilustración, sin reducir a pixel). Entrega: `art-source/entregas/2026-10_mundo/codice/minas_consumidor.png`.
  - Formato: PNG pixel art, mismo tamaño de lienzo (222×270) o su grilla nativa; sin JPG, sin degradé de compresión, ≤ 250 tonos.
  - Prompt: `Dark fantasy character portrait illustration, Retrato del Códice de Minas "consumidor" (JPG 222×270), half body, painterly, consistent with the Códice style, no text, no frame.`
  - Referencias: `assets/sprites/arenas/minas/mn_titan/atlas.png`

## B522 — Aura de set "Set de Lucifer" (Fuego · riesgo · agresión) / Aura de set "Pacto del Glaciar" (Hielo · control) / Aura de set "Corazón del Coloso" (Tanque · absorber) / Aura de set "Réquiem del Sepulturero" (Invocaciones · no-muertos)  
*Prioridad P2 · PENDIENTE*

- **`C-SET-aura-set_de_lucifer`** — Aura de set (efecto cosmético). Aura de set "Set de Lucifer" (Fuego · riesgo · agresión). Anillo elíptico bajo los pies con 2+ piezas (punteado/parcial) y pleno con el set completo. Hoy procedural. Opcional.
  - Método: código procedural + pintor. Entrega: `art-source/entregas/2026-10_mundo/sets/aura_set_de_lucifer.png`.
  - Formato: Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(255,110,40), vista 3/4 cenital. PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art aura effect, Aura de set "Set de Lucifer" (Fuego · riesgo · agresión), ring around a standing character, palette from the champion, plain dark background, no text.`
  - Referencias: `assets/vfx/skills/ventisca.png`
- **`C-SET-aura-pacto_del_glaciar`** — Aura de set (efecto cosmético). Aura de set "Pacto del Glaciar" (Hielo · control). Anillo elíptico bajo los pies con 2+ piezas (punteado/parcial) y pleno con el set completo. Hoy procedural. Opcional.
  - Método: código procedural + pintor. Entrega: `art-source/entregas/2026-10_mundo/sets/aura_pacto_del_glaciar.png`.
  - Formato: Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(150,220,255), vista 3/4 cenital. PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art aura effect, Aura de set "Pacto del Glaciar" (Hielo · control), ring around a standing character, palette from the champion, plain dark background, no text.`
  - Referencias: `assets/vfx/skills/ventisca.png`
- **`C-SET-aura-corazon_del_coloso`** — Aura de set (efecto cosmético). Aura de set "Corazón del Coloso" (Tanque · absorber). Anillo elíptico bajo los pies con 2+ piezas (punteado/parcial) y pleno con el set completo. Hoy procedural. Opcional.
  - Método: código procedural + pintor. Entrega: `art-source/entregas/2026-10_mundo/sets/aura_corazon_del_coloso.png`.
  - Formato: Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(230,190,110), vista 3/4 cenital. PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art aura effect, Aura de set "Corazón del Coloso" (Tanque · absorber), ring around a standing character, palette from the champion, plain dark background, no text.`
  - Referencias: `assets/vfx/skills/ventisca.png`
- **`C-SET-aura-requiem_del_sepulturero`** — Aura de set (efecto cosmético). Aura de set "Réquiem del Sepulturero" (Invocaciones · no-muertos). Anillo elíptico bajo los pies con 2+ piezas (punteado/parcial) y pleno con el set completo. Hoy procedural. Opcional.
  - Método: código procedural + pintor. Entrega: `art-source/entregas/2026-10_mundo/sets/aura_requiem_del_sepulturero.png`.
  - Formato: Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(122,212,138), vista 3/4 cenital. PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art aura effect, Aura de set "Réquiem del Sepulturero" (Invocaciones · no-muertos), ring around a standing character, palette from the champion, plain dark background, no text.`
  - Referencias: `assets/vfx/skills/ventisca.png`

## B523 — Aura de set "Tempestad Eterna" (Electricidad · cadena · movilidad) / Aura de set "Sangre del Berserker" (Riesgo · recompensa) / Aura de set "Juramento del Guardián" (Protección cooperativa) / Aura de set "Profecía del Alba" (Soporte · curación)  
*Prioridad P2 · PENDIENTE*

- **`C-SET-aura-tempestad_eterna`** — Aura de set (efecto cosmético). Aura de set "Tempestad Eterna" (Electricidad · cadena · movilidad). Anillo elíptico bajo los pies con 2+ piezas (punteado/parcial) y pleno con el set completo. Hoy procedural. Opcional.
  - Método: código procedural + pintor. Entrega: `art-source/entregas/2026-10_mundo/sets/aura_tempestad_eterna.png`.
  - Formato: Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(150,190,255), vista 3/4 cenital. PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art aura effect, Aura de set "Tempestad Eterna" (Electricidad · cadena · movilidad), ring around a standing character, palette from the champion, plain dark background, no text.`
  - Referencias: `assets/vfx/skills/ventisca.png`
- **`C-SET-aura-sangre_del_berserker`** — Aura de set (efecto cosmético). Aura de set "Sangre del Berserker" (Riesgo · recompensa). Anillo elíptico bajo los pies con 2+ piezas (punteado/parcial) y pleno con el set completo. Hoy procedural. Opcional.
  - Método: código procedural + pintor. Entrega: `art-source/entregas/2026-10_mundo/sets/aura_sangre_del_berserker.png`.
  - Formato: Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(230,50,40), vista 3/4 cenital. PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art aura effect, Aura de set "Sangre del Berserker" (Riesgo · recompensa), ring around a standing character, palette from the champion, plain dark background, no text.`
  - Referencias: `assets/vfx/skills/ventisca.png`
- **`C-SET-aura-juramento_del_guardian`** — Aura de set (efecto cosmético). Aura de set "Juramento del Guardián" (Protección cooperativa). Anillo elíptico bajo los pies con 2+ piezas (punteado/parcial) y pleno con el set completo. Hoy procedural. Opcional.
  - Método: código procedural + pintor. Entrega: `art-source/entregas/2026-10_mundo/sets/aura_juramento_del_guardian.png`.
  - Formato: Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(143,208,255), vista 3/4 cenital. PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art aura effect, Aura de set "Juramento del Guardián" (Protección cooperativa), ring around a standing character, palette from the champion, plain dark background, no text.`
  - Referencias: `assets/vfx/skills/ventisca.png`
- **`C-SET-aura-profecia_del_alba`** — Aura de set (efecto cosmético). Aura de set "Profecía del Alba" (Soporte · curación). Anillo elíptico bajo los pies con 2+ piezas (punteado/parcial) y pleno con el set completo. Hoy procedural. Opcional.
  - Método: código procedural + pintor. Entrega: `art-source/entregas/2026-10_mundo/sets/aura_profecia_del_alba.png`.
  - Formato: Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(255,230,140), vista 3/4 cenital. PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art aura effect, Aura de set "Profecía del Alba" (Soporte · curación), ring around a standing character, palette from the champion, plain dark background, no text.`
  - Referencias: `assets/vfx/skills/ventisca.png`

## B524 — Aura de set "Sombra del Cazador" (Asesino · objetivo único) / Aura de set "Ojo del Arcano" (Mago · rotación) / Aura de set "Rey del Laberinto" (Movimiento · posicionamiento) / Aura de set "Baluarte Inquebrantable" (Tanque · masa · control)  
*Prioridad P2 · PENDIENTE*

- **`C-SET-aura-sombra_del_cazador`** — Aura de set (efecto cosmético). Aura de set "Sombra del Cazador" (Asesino · objetivo único). Anillo elíptico bajo los pies con 2+ piezas (punteado/parcial) y pleno con el set completo. Hoy procedural. Opcional.
  - Método: código procedural + pintor. Entrega: `art-source/entregas/2026-10_mundo/sets/aura_sombra_del_cazador.png`.
  - Formato: Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(190,120,255), vista 3/4 cenital. PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art aura effect, Aura de set "Sombra del Cazador" (Asesino · objetivo único), ring around a standing character, palette from the champion, plain dark background, no text.`
  - Referencias: `assets/vfx/skills/ventisca.png`
- **`C-SET-aura-ojo_del_arcano`** — Aura de set (efecto cosmético). Aura de set "Ojo del Arcano" (Mago · rotación). Anillo elíptico bajo los pies con 2+ piezas (punteado/parcial) y pleno con el set completo. Hoy procedural. Opcional.
  - Método: código procedural + pintor. Entrega: `art-source/entregas/2026-10_mundo/sets/aura_ojo_del_arcano.png`.
  - Formato: Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(200,140,255), vista 3/4 cenital. PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art aura effect, Aura de set "Ojo del Arcano" (Mago · rotación), ring around a standing character, palette from the champion, plain dark background, no text.`
  - Referencias: `assets/vfx/skills/ventisca.png`
- **`C-SET-aura-rey_del_laberinto`** — Aura de set (efecto cosmético). Aura de set "Rey del Laberinto" (Movimiento · posicionamiento). Anillo elíptico bajo los pies con 2+ piezas (punteado/parcial) y pleno con el set completo. Hoy procedural. Opcional.
  - Método: código procedural + pintor. Entrega: `art-source/entregas/2026-10_mundo/sets/aura_rey_del_laberinto.png`.
  - Formato: Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(220,200,150), vista 3/4 cenital. PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art aura effect, Aura de set "Rey del Laberinto" (Movimiento · posicionamiento), ring around a standing character, palette from the champion, plain dark background, no text.`
  - Referencias: `assets/vfx/skills/ventisca.png`
- **`C-SET-aura-baluarte_inquebrantable`** — Aura de set (efecto cosmético). Aura de set "Baluarte Inquebrantable" (Tanque · masa · control). Anillo elíptico bajo los pies con 2+ piezas (punteado/parcial) y pleno con el set completo. Hoy procedural. Opcional.
  - Método: código procedural + pintor. Entrega: `art-source/entregas/2026-10_mundo/sets/aura_baluarte_inquebrantable.png`.
  - Formato: Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(170,200,235), vista 3/4 cenital. PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art aura effect, Aura de set "Baluarte Inquebrantable" (Tanque · masa · control), ring around a standing character, palette from the champion, plain dark background, no text.`
  - Referencias: `assets/vfx/skills/ventisca.png`

## B525 — Aura de set "Sombra Nocturna" (Asesino · sangrado · desaparecer) / Aura de set "Convergencia Elemental" (Mago · fuego + hielo + rayo) / Aura de set "Bendición del Custodio" (Soporte · salvar a tiempo) / Aura de set "Marea Roja" (Berserker · riesgo · furia)  
*Prioridad P2 · PENDIENTE*

- **`C-SET-aura-sombra_nocturna`** — Aura de set (efecto cosmético). Aura de set "Sombra Nocturna" (Asesino · sangrado · desaparecer). Anillo elíptico bajo los pies con 2+ piezas (punteado/parcial) y pleno con el set completo. Hoy procedural. Opcional.
  - Método: código procedural + pintor. Entrega: `art-source/entregas/2026-10_mundo/sets/aura_sombra_nocturna.png`.
  - Formato: Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(150,60,90), vista 3/4 cenital. PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art aura effect, Aura de set "Sombra Nocturna" (Asesino · sangrado · desaparecer), ring around a standing character, palette from the champion, plain dark background, no text.`
  - Referencias: `assets/vfx/skills/ventisca.png`
- **`C-SET-aura-convergencia_elemental`** — Aura de set (efecto cosmético). Aura de set "Convergencia Elemental" (Mago · fuego + hielo + rayo). Anillo elíptico bajo los pies con 2+ piezas (punteado/parcial) y pleno con el set completo. Hoy procedural. Opcional.
  - Método: código procedural + pintor. Entrega: `art-source/entregas/2026-10_mundo/sets/aura_convergencia_elemental.png`.
  - Formato: Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(200,150,255), vista 3/4 cenital. PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art aura effect, Aura de set "Convergencia Elemental" (Mago · fuego + hielo + rayo), ring around a standing character, palette from the champion, plain dark background, no text.`
  - Referencias: `assets/vfx/skills/ventisca.png`
- **`C-SET-aura-bendicion_del_custodio`** — Aura de set (efecto cosmético). Aura de set "Bendición del Custodio" (Soporte · salvar a tiempo). Anillo elíptico bajo los pies con 2+ piezas (punteado/parcial) y pleno con el set completo. Hoy procedural. Opcional.
  - Método: código procedural + pintor. Entrega: `art-source/entregas/2026-10_mundo/sets/aura_bendicion_del_custodio.png`.
  - Formato: Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(255,235,160), vista 3/4 cenital. PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art aura effect, Aura de set "Bendición del Custodio" (Soporte · salvar a tiempo), ring around a standing character, palette from the champion, plain dark background, no text.`
  - Referencias: `assets/vfx/skills/ventisca.png`
- **`C-SET-aura-marea_roja`** — Aura de set (efecto cosmético). Aura de set "Marea Roja" (Berserker · riesgo · furia). Anillo elíptico bajo los pies con 2+ piezas (punteado/parcial) y pleno con el set completo. Hoy procedural. Opcional.
  - Método: código procedural + pintor. Entrega: `art-source/entregas/2026-10_mundo/sets/aura_marea_roja.png`.
  - Formato: Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(220,40,40), vista 3/4 cenital. PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art aura effect, Aura de set "Marea Roja" (Berserker · riesgo · furia), ring around a standing character, palette from the champion, plain dark background, no text.`
  - Referencias: `assets/vfx/skills/ventisca.png`

## B526 — Aura de set "Acceso Raíz" (Axiom · reglas rotas) / Aura de set "La Última Profecía" (Profeta · destino · salvar) / Aura de set "El Rōnin Errante" (Musashi · paciencia · un solo corte) / Aura de set "La Manada" (Cazadora · marca → presa → lobo)  
*Prioridad P2 · PENDIENTE*

- **`C-SET-aura-acceso_raiz`** — Aura de set (efecto cosmético). Aura de set "Acceso Raíz" (Axiom · reglas rotas). Anillo elíptico bajo los pies con 2+ piezas (punteado/parcial) y pleno con el set completo. Hoy procedural. Opcional.
  - Método: código procedural + pintor. Entrega: `art-source/entregas/2026-10_mundo/sets/aura_acceso_raiz.png`.
  - Formato: Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(70,240,210), vista 3/4 cenital. PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art aura effect, Aura de set "Acceso Raíz" (Axiom · reglas rotas), ring around a standing character, palette from the champion, plain dark background, no text.`
  - Referencias: `assets/vfx/skills/ventisca.png`
- **`C-SET-aura-la_ultima_profecia`** — Aura de set (efecto cosmético). Aura de set "La Última Profecía" (Profeta · destino · salvar). Anillo elíptico bajo los pies con 2+ piezas (punteado/parcial) y pleno con el set completo. Hoy procedural. Opcional.
  - Método: código procedural + pintor. Entrega: `art-source/entregas/2026-10_mundo/sets/aura_la_ultima_profecia.png`.
  - Formato: Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(120,240,220), vista 3/4 cenital. PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art aura effect, Aura de set "La Última Profecía" (Profeta · destino · salvar), ring around a standing character, palette from the champion, plain dark background, no text.`
  - Referencias: `assets/vfx/skills/ventisca.png`
- **`C-SET-aura-el_ronin_errante`** — Aura de set (efecto cosmético). Aura de set "El Rōnin Errante" (Musashi · paciencia · un solo corte). Anillo elíptico bajo los pies con 2+ piezas (punteado/parcial) y pleno con el set completo. Hoy procedural. Opcional.
  - Método: código procedural + pintor. Entrega: `art-source/entregas/2026-10_mundo/sets/aura_el_ronin_errante.png`.
  - Formato: Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(160,210,255), vista 3/4 cenital. PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art aura effect, Aura de set "El Rōnin Errante" (Musashi · paciencia · un solo corte), ring around a standing character, palette from the champion, plain dark background, no text.`
  - Referencias: `assets/vfx/skills/ventisca.png`
- **`C-SET-aura-la_manada`** — Aura de set (efecto cosmético). Aura de set "La Manada" (Cazadora · marca → presa → lobo). Anillo elíptico bajo los pies con 2+ piezas (punteado/parcial) y pleno con el set completo. Hoy procedural. Opcional.
  - Método: código procedural + pintor. Entrega: `art-source/entregas/2026-10_mundo/sets/aura_la_manada.png`.
  - Formato: Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(140,220,120), vista 3/4 cenital. PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art aura effect, Aura de set "La Manada" (Cazadora · marca → presa → lobo), ring around a standing character, palette from the champion, plain dark background, no text.`
  - Referencias: `assets/vfx/skills/ventisca.png`

## B527 — Aura de set "Uniforme del Granadero" (Libertador · disparo pesado) / Aura de set "Réquiem del Señor de la Muerte" (Nigromante · legión · almas) / Aura de set "Legión de Reconocimiento" (Eren · maniobras · el Portador)  
*Prioridad P2 · PENDIENTE*

- **`C-SET-aura-uniforme_del_granadero`** — Aura de set (efecto cosmético). Aura de set "Uniforme del Granadero" (Libertador · disparo pesado). Anillo elíptico bajo los pies con 2+ piezas (punteado/parcial) y pleno con el set completo. Hoy procedural. Opcional.
  - Método: código procedural + pintor. Entrega: `art-source/entregas/2026-10_mundo/sets/aura_uniforme_del_granadero.png`.
  - Formato: Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(90,130,220), vista 3/4 cenital. PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art aura effect, Aura de set "Uniforme del Granadero" (Libertador · disparo pesado), ring around a standing character, palette from the champion, plain dark background, no text.`
  - Referencias: `assets/vfx/skills/ventisca.png`
- **`C-SET-aura-requiem_del_senor_de_la_muerte`** — Aura de set (efecto cosmético). Aura de set "Réquiem del Señor de la Muerte" (Nigromante · legión · almas). Anillo elíptico bajo los pies con 2+ piezas (punteado/parcial) y pleno con el set completo. Hoy procedural. Opcional.
  - Método: código procedural + pintor. Entrega: `art-source/entregas/2026-10_mundo/sets/aura_requiem_del_senor_de_la_muerte.png`.
  - Formato: Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(90,230,140), vista 3/4 cenital. PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art aura effect, Aura de set "Réquiem del Señor de la Muerte" (Nigromante · legión · almas), ring around a standing character, palette from the champion, plain dark background, no text.`
  - Referencias: `assets/vfx/skills/ventisca.png`
- **`C-SET-aura-legion_de_reconocimiento`** — Aura de set (efecto cosmético). Aura de set "Legión de Reconocimiento" (Eren · maniobras · el Portador). Anillo elíptico bajo los pies con 2+ piezas (punteado/parcial) y pleno con el set completo. Hoy procedural. Opcional.
  - Método: código procedural + pintor. Entrega: `art-source/entregas/2026-10_mundo/sets/aura_legion_de_reconocimiento.png`.
  - Formato: Tira horizontal de 8 cuadros de 128×64 (1024×64), bucle sin costura, color base rgb(200,90,60), vista 3/4 cenital. PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art aura effect, Aura de set "Legión de Reconocimiento" (Eren · maniobras · el Portador), ring around a standing character, palette from the champion, plain dark background, no text.`
  - Referencias: `assets/vfx/skills/ventisca.png`

## B528 — VFX de proc "Estallido Ígneo" (kill_explode) / VFX de proc "Tormenta Encadenada" (basic_chain) / VFX de proc "Resonancia Arcana" (skill_nova) / VFX de proc "Festín de Almas" (kill_heal)  
*Prioridad P2 · PENDIENTE*

- **`C-PROC-kill_explode`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Estallido Ígneo" (kill_explode). Efecto corto de un proc de objeto/mítico/único: Al matar, el enemigo puede estallar en llamas y dañar a los cercanos. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/kill_explode.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Estallido Ígneo" (kill_explode), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`C-PROC-basic_chain`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Tormenta Encadenada" (basic_chain). Efecto corto de un proc de objeto/mítico/único: Cada 4 golpes básicos sale un rayo que salta entre enemigos. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/basic_chain.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Tormenta Encadenada" (basic_chain), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`C-PROC-skill_nova`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Resonancia Arcana" (skill_nova). Efecto corto de un proc de objeto/mítico/único: Al lanzar una habilidad, una onda de energía golpea a tu alrededor. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/skill_nova.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Resonancia Arcana" (skill_nova), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`C-PROC-kill_heal`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Festín de Almas" (kill_heal). Efecto corto de un proc de objeto/mítico/único: Cada baja te cura; las bajas de élite curan mucho más. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/kill_heal.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Festín de Almas" (kill_heal), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`

## B529 — VFX de proc "Égida" (hit_shield) / VFX de proc "Escarcha Viva" (basic_freeze) / VFX de proc "Furia Creciente" (combo_ramp) / VFX de proc "Golpe Sísmico" (crit_quake)  
*Prioridad P2 · PENDIENTE*

- **`C-PROC-hit_shield`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Égida" (hit_shield). Efecto corto de un proc de objeto/mítico/único: Un golpe fuerte recibido te da un escudo (cada 8 s). Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/hit_shield.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Égida" (hit_shield), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`C-PROC-basic_freeze`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Escarcha Viva" (basic_freeze). Efecto corto de un proc de objeto/mítico/único: Tus básicos ralentizan; cada 6 golpes congelan al objetivo. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/basic_freeze.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Escarcha Viva" (basic_freeze), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`C-PROC-combo_ramp`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Furia Creciente" (combo_ramp). Efecto corto de un proc de objeto/mítico/único: Golpear seguido acumula daño y velocidad de ataque (hasta 10). Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/combo_ramp.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Furia Creciente" (combo_ramp), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`C-PROC-crit_quake`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Golpe Sísmico" (crit_quake). Efecto corto de un proc de objeto/mítico/único: Los críticos generan una onda de choque que aturde. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/crit_quake.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Golpe Sísmico" (crit_quake), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`

## B530 — VFX de proc "Aliento Glacial" (frost_aura) / VFX de proc "Brasa Viva" (ignite_basic) / VFX de proc "Filo Sediento" (bleed_basic) / VFX de proc "Paso del Cazador" (haste_on_kill)  
*Prioridad P2 · PENDIENTE*

- **`C-PROC-frost_aura`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Aliento Glacial" (frost_aura). Efecto corto de un proc de objeto/mítico/único: Los enemigos cerca tuyo se mueven un 18% más lento. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/frost_aura.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Aliento Glacial" (frost_aura), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`C-PROC-ignite_basic`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Brasa Viva" (ignite_basic). Efecto corto de un proc de objeto/mítico/único: Tus golpes básicos prenden fuego al objetivo. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/ignite_basic.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Brasa Viva" (ignite_basic), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`C-PROC-bleed_basic`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Filo Sediento" (bleed_basic). Efecto corto de un proc de objeto/mítico/único: Tus golpes básicos abren heridas que sangran. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/bleed_basic.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Filo Sediento" (bleed_basic), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`C-PROC-haste_on_kill`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Paso del Cazador" (haste_on_kill). Efecto corto de un proc de objeto/mítico/único: Cada baja te da velocidad de movimiento (se acumula hasta 10). Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/haste_on_kill.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Paso del Cazador" (haste_on_kill), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`

## B531 — VFX de proc "Guardia Juramentada" (ally_ward) / VFX de proc "Represalia" (retaliate) / VFX de proc "Gracia Veloz" (heal_haste) / VFX de proc "Filo del Verdugo" (execute_edge)  
*Prioridad P2 · PENDIENTE*

- **`C-PROC-ally_ward`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Guardia Juramentada" (ally_ward). Efecto corto de un proc de objeto/mítico/único: Los aliados cerca tuyo reciben 10% menos daño. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/ally_ward.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Guardia Juramentada" (ally_ward), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`C-PROC-retaliate`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Represalia" (retaliate). Efecto corto de un proc de objeto/mítico/único: Quien te golpea cuerpo a cuerpo recibe parte del daño y queda aturdido. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/retaliate.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Represalia" (retaliate), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`C-PROC-heal_haste`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Gracia Veloz" (heal_haste). Efecto corto de un proc de objeto/mítico/único: Curar a un aliado les da a los dos velocidad por 2,5 s. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/heal_haste.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Gracia Veloz" (heal_haste), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`C-PROC-execute_edge`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Filo del Verdugo" (execute_edge). Efecto corto de un proc de objeto/mítico/único: +60% de daño a enemigos comunes y élites con menos de 20% de vida. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/execute_edge.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Filo del Verdugo" (execute_edge), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`

## B532 — VFX de proc "Descarga Arcana" (shock_skill) / VFX de proc "Avivar las Llamas" (burn_vs) / VFX de proc "Frío que Quiebra" (cold_crit) / VFX de proc "Esporas Pútridas" (spore_rot)  
*Prioridad P2 · PENDIENTE*

- **`C-PROC-shock_skill`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Descarga Arcana" (shock_skill). Efecto corto de un proc de objeto/mítico/único: Tus habilidades pueden electrocutar: aturden un instante y saltan a otro enemigo. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/shock_skill.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Descarga Arcana" (shock_skill), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`C-PROC-burn_vs`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Avivar las Llamas" (burn_vs). Efecto corto de un proc de objeto/mítico/único: +25% de daño contra enemigos que están ardiendo. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/burn_vs.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Avivar las Llamas" (burn_vs), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`C-PROC-cold_crit`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Frío que Quiebra" (cold_crit). Efecto corto de un proc de objeto/mítico/único: +50% de daño crítico contra enemigos ralentizados o congelados. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/cold_crit.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Frío que Quiebra" (cold_crit), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`C-PROC-spore_rot`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Esporas Pútridas" (spore_rot). Efecto corto de un proc de objeto/mítico/único: Tus golpes básicos pudren al objetivo: daño en el tiempo y +8% de daño recibido durante 3 s. Si muere podrido, contagia a un enemigo cercano. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/spore_rot.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Esporas Pútridas" (spore_rot), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`

## B533 — VFX de proc "Invierno Sin Fin" (myth_winter) / VFX de proc "Combustión Perpetua" (myth_inferno) / VFX de proc "Tormenta Viva" (myth_storm) / VFX de proc "Último Bastión" (myth_bastion)  
*Prioridad P2 · PENDIENTE*

- **`C-PROC-myth_winter`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Invierno Sin Fin" (myth_winter). Efecto corto de un proc de objeto/mítico/único: Cada 3 ralentizaciones sobre el mismo enemigo lo CONGELÁS (1,2 s). Los congelados que mueren estallan en esquirlas que ralentizan y encadenan el frío.. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/myth_winter.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Invierno Sin Fin" (myth_winter), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`C-PROC-myth_inferno`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Combustión Perpetua" (myth_inferno). Efecto corto de un proc de objeto/mítico/único: El fuego se CONTAGIA: cada enemigo en llamas prende a otro cercano cada segundo. Los que mueren ardiendo explotan.. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/myth_inferno.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Combustión Perpetua" (myth_inferno), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`C-PROC-myth_storm`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Tormenta Viva" (myth_storm). Efecto corto de un proc de objeto/mítico/único: Cada 3 habilidades, una TORMENTA te sigue 4 s descargando rayos sobre los enemigos cercanos (aturden un instante).. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/myth_storm.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Tormenta Viva" (myth_storm), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`C-PROC-myth_bastion`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Último Bastión" (myth_bastion). Efecto corto de un proc de objeto/mítico/único: Los golpes fuertes que recibís se ACUMULAN; tu siguiente habilidad libera una onda que devuelve ese daño x2,5 y aturde. Los aliados cerca tuyo reciben 12% menos daño.. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/myth_bastion.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Último Bastión" (myth_bastion), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`

## B534 — VFX de proc "Cosecha Roja" (myth_harvest) / VFX de proc "Alba Eterna" (myth_dawn) / VFX de proc "Eco del Vacío" (myth_echo) / VFX de proc "Eclipse" (myth_eclipse)  
*Prioridad P2 · PENDIENTE*

- **`C-PROC-myth_harvest`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Cosecha Roja" (myth_harvest). Efecto corto de un proc de objeto/mítico/único: Tus básicos hacen SANGRAR. Los que sangran reciben +20% de daño; matar a uno te cura y contagia el sangrado a 3 enemigos cercanos.. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/myth_harvest.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Cosecha Roja" (myth_harvest), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`C-PROC-myth_dawn`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Alba Eterna" (myth_dawn). Efecto corto de un proc de objeto/mítico/único: Cada curación deja SUELO CONSAGRADO por 3 s: cura a los aliados y quema a los enemigos que lo pisan.. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/myth_dawn.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Alba Eterna" (myth_dawn), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`C-PROC-myth_echo`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Eco del Vacío" (myth_echo). Efecto corto de un proc de objeto/mítico/único: Tus habilidades tienen 25% de probabilidad de REPETIRSE solas al 60% de poder (las de desplazamiento e invocación no).. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/myth_echo.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Eco del Vacío" (myth_echo), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`C-PROC-myth_eclipse`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Eclipse" (myth_eclipse). Efecto corto de un proc de objeto/mítico/único: Tus críticos MARCAN al enemigo: si baja de 25% de vida, tu próximo golpe lo EJECUTA (no a jefes ni subjefes). +25% de daño crítico contra jefes.. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/myth_eclipse.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Eclipse" (myth_eclipse), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`

## B535 — VFX de proc "Fuego del Vacío" (uniq_archimago) / VFX de proc "Paso del Coloso" (uniq_juggernaut) / VFX de proc "Luna Roja" (uniq_lunaroja)  
*Prioridad P2 · PENDIENTE*

- **`C-PROC-uniq_archimago`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Fuego del Vacío" (uniq_archimago). Efecto corto de un proc de objeto/mítico/único: Tu fuego se vuelve violeta y quema el doble de tiempo. El Muro de Fuego te sigue. La Cadena de Relámpago salta 3 veces más y deja a cada objetivo en llamas.. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/uniq_archimago.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Fuego del Vacío" (uniq_archimago), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`C-PROC-uniq_juggernaut`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Paso del Coloso" (uniq_juggernaut). Efecto corto de un proc de objeto/mítico/único: Te agrandás un 15% y cada paso hace temblar el suelo: los enemigos pegados a vos se tambalean. La Embestida deja una grieta que aturde a todo lo que cruza.. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/uniq_juggernaut.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Paso del Coloso" (uniq_juggernaut), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`
- **`C-PROC-uniq_lunaroja`** — Objeto de equipo (ícono y/o sprite). VFX de proc "Luna Roja" (uniq_lunaroja). Efecto corto de un proc de objeto/mítico/único: Tus flechas son de sangre: cada una hace sangrar y, contra tu Presa, atraviesa. El Lobo Espectral aparece siempre que marcás una Presa nueva (cada 20 s).. Hoy partículas y ondas del VFX central.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/vfx_items/uniq_lunaroja.png`.
  - Formato: Tira de 6 cuadros de 64×64 (384×64), corta y chica (que el proc se note sin tapar al enemigo). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art game item icon, VFX de proc "Luna Roja" (uniq_lunaroja), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`

## B536 — AB-FX-03 Caída al vacío (estela violeta hacia abajo, 6 frames) / AB-FX-04 Rescate (destello de manos que suben, 6 frames) / AB-TG-01 Runa de derrumbe (borde de plataforma que se agrieta en rojo, loop 6) / AB-TG-02 Aviso de mandíbula (anillo de dientes en el piso, 6)  
*Prioridad P2 · PENDIENTE*

- **`D-ABISMO-FX-03`** — Objeto de equipo (ícono y/o sprite). AB-FX-03 Caída al vacío (estela violeta hacia abajo, 6 frames). Arena del Abismo. Hoy: hoy el cuerpo se hunde por código
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/abismo/ab_fx_03.png`.
  - Formato: Según el texto (Caída al vacío (estela violeta hacia abajo, 6 frames)). PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo ≈2,0 u/px para suelo y plataformas, 1,0 u/px para personajes.
  - Prompt: `Pixel art game item icon, AB-FX-03 Caída al vacío (estela violeta hacia abajo, 6 frames), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abismo/tex_piso.png`
- **`D-ABISMO-FX-04`** — Objeto de equipo (ícono y/o sprite). AB-FX-04 Rescate (destello de manos que suben, 6 frames). Arena del Abismo. Hoy: hoy partículas "holy"
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/abismo/ab_fx_04.png`.
  - Formato: Según el texto (Rescate (destello de manos que suben, 6 frames)). PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo ≈2,0 u/px para suelo y plataformas, 1,0 u/px para personajes.
  - Prompt: `Pixel art game item icon, AB-FX-04 Rescate (destello de manos que suben, 6 frames), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abismo/tex_piso.png`
- **`D-ABISMO-TG-01`** — Objeto de equipo (ícono y/o sprite). AB-TG-01 Runa de derrumbe (borde de plataforma que se agrieta en rojo, loop 6). Arena del Abismo. Hoy: hoy línea punteada roja procedural (legible)
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/abismo/ab_tg_01.png`.
  - Formato: Según el texto (Runa de derrumbe (borde de plataforma que se agrieta en rojo, loop 6)). PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo ≈2,0 u/px para suelo y plataformas, 1,0 u/px para personajes.
  - Prompt: `Pixel art game item icon, AB-TG-01 Runa de derrumbe (borde de plataforma que se agrieta en rojo, loop 6), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abismo/tex_piso.png`
- **`D-ABISMO-TG-02`** — Objeto de equipo (ícono y/o sprite). AB-TG-02 Aviso de mandíbula (anillo de dientes en el piso, 6). Arena del Abismo. Hoy: hoy anillo procedural
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/abismo/ab_tg_02.png`.
  - Formato: Según el texto (Aviso de mandíbula (anillo de dientes en el piso, 6)). PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo ≈2,0 u/px para suelo y plataformas, 1,0 u/px para personajes.
  - Prompt: `Pixel art game item icon, AB-TG-02 Aviso de mandíbula (anillo de dientes en el piso, 6), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abismo/tex_piso.png`

## B537 — AB-PR-02 Fragmento del jefe (caída 4, impacto 4)  
*Prioridad P2 · PENDIENTE*

- **`D-ABISMO-PR-02`** — Objeto de equipo (ícono y/o sprite). AB-PR-02 Fragmento del jefe (caída 4, impacto 4). Arena del Abismo. Hoy: hoy se usa `abMorShards`
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/abismo/ab_pr_02.png`.
  - Formato: Según el texto (Fragmento del jefe (caída 4, impacto 4)). PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo ≈2,0 u/px para suelo y plataformas, 1,0 u/px para personajes.
  - Prompt: `Pixel art game item icon, AB-PR-02 Fragmento del jefe (caída 4, impacto 4), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abismo/tex_piso.png`

## B538 — CM-C05 Entrando al refugio (de espaldas, se desvanece) / CM-C06 Variantes extra (anciano, herrero, monja)  
*Prioridad P2 · PENDIENTE*

- **`D-CIUDAD-CM-C05`** — Objeto de equipo (ícono y/o sprite). CM-C05 Entrando al refugio (de espaldas, se desvanece). Ciudad Maldita: estado RESCUED (FALTA).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-c05_entrando_al_refugio_de.png`.
  - Formato: 32×48 · 6 cuadros × 3 civiles. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, CM-C05 Entrando al refugio (de espaldas, se desvanece), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`
- **`D-CIUDAD-CM-C06`** — Objeto de equipo (ícono y/o sprite). CM-C06 Variantes extra (anciano, herrero, monja). Ciudad Maldita: variedad en la ciudad (FALTA).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-c06_variantes_extra_anciano.png`.
  - Formato: 32×48 · set completo como la hoja. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, CM-C06 Variantes extra (anciano, herrero, monja), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B539 — CM-V05 Zona segura en el piso (anillo verde con runas)  
*Prioridad P2 · PENDIENTE*

- **`D-CIUDAD-CM-V05`** — Objeto de equipo (ícono y/o sprite). CM-V05 Zona segura en el piso (anillo verde con runas). Ciudad Maldita: refugios y puerta (FALTA).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/ciudad/cm-v05_zona_segura_en_el_piso_anillo.png`.
  - Formato: 256×180 · 8 cuadros en bucle. PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo.
  - Prompt: `Pixel art game item icon, CM-V05 Zona segura en el piso (anillo verde con runas), centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/abilities/soulReapBurst_04.png`

## B540 — Prop de decorado "infPentagram" (infernal, canvas 280×200) / Prop de decorado "scorch+v" (varias, canvas 90×50) / Prop de decorado "frozenLake" (hielo, canvas 300×200) / Prop de decorado "ritualCircle" (bosque, canvas 300×210)  
*Prioridad P2 · PENDIENTE*

- **`D-PROP-infpentagram`** — Prop decorativo de la arena. Prop de decorado "infPentagram" (infernal, canvas 280×200). Decorado/landmark de la arena infernal dibujado por código: aidArtInfPentagram (js/rendering/arena-props.js:105). 
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/infernal/prop_infpentagram.png`.
  - Formato: PNG 280×200 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px.
  - Prompt: `Pixel art environment prop, Prop de decorado "infPentagram" (infernal, canvas 280×200), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`
- **`D-PROP-scorch`** — Prop decorativo de la arena. Prop de decorado "scorch+v" (varias, canvas 90×50). Decorado/landmark de la arena varias dibujado por código: aidArtScorch (js/rendering/arena-props.js:132). Varias variantes (+v).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/varias/prop_scorch.png`.
  - Formato: PNG 90×50 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px. 2–3 variantes.
  - Prompt: `Pixel art environment prop, Prop de decorado "scorch+v" (varias, canvas 90×50), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`
- **`D-PROP-frozenlake`** — Prop decorativo de la arena. Prop de decorado "frozenLake" (hielo, canvas 300×200). Decorado/landmark de la arena hielo dibujado por código: aidArtFrozenLake (js/rendering/arena-props.js:193). 
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/hielo/prop_frozenlake.png`.
  - Formato: PNG 300×200 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px.
  - Prompt: `Pixel art environment prop, Prop de decorado "frozenLake" (hielo, canvas 300×200), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`
- **`D-PROP-ritualcircle`** — Prop decorativo de la arena. Prop de decorado "ritualCircle" (bosque, canvas 300×210). Decorado/landmark de la arena bosque dibujado por código: aidArtRitualCircle (js/rendering/arena-props.js:286). 
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/bosque/prop_ritualcircle.png`.
  - Formato: PNG 300×210 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px.
  - Prompt: `Pixel art environment prop, Prop de decorado "ritualCircle" (bosque, canvas 300×210), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`

## B541 — Prop de decorado "stream" (bosque, canvas 420×90) / Prop de decorado "minoChamber" (laberinto, canvas 420×290) / Prop de decorado "sunkColumn+v" (acuatica, canvas 30×76) / Prop de decorado "tomb" (acuatica, canvas 56×36)  
*Prioridad P2 · PENDIENTE*

- **`D-PROP-stream`** — Prop decorativo de la arena. Prop de decorado "stream" (bosque, canvas 420×90). Decorado/landmark de la arena bosque dibujado por código: aidArtStream (js/rendering/arena-props.js:319). 
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/bosque/prop_stream.png`.
  - Formato: PNG 420×90 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px.
  - Prompt: `Pixel art environment prop, Prop de decorado "stream" (bosque, canvas 420×90), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`
- **`D-PROP-minochamber`** — Prop decorativo de la arena. Prop de decorado "minoChamber" (laberinto, canvas 420×290). Decorado/landmark de la arena laberinto dibujado por código: aidArtMinotaurChamber (js/rendering/arena-props.js:341). 
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/laberinto/prop_minochamber.png`.
  - Formato: PNG 420×290 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px.
  - Prompt: `Pixel art environment prop, Prop de decorado "minoChamber" (laberinto, canvas 420×290), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`
- **`D-PROP-sunkcolumn`** — Prop decorativo de la arena. Prop de decorado "sunkColumn+v" (acuatica, canvas 30×76). Decorado/landmark de la arena acuatica dibujado por código: aidArtSunkColumn (js/rendering/arena-props.js:373). Varias variantes (+v).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/acuatica/prop_sunkcolumn.png`.
  - Formato: PNG 30×76 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px. 2–3 variantes.
  - Prompt: `Pixel art environment prop, Prop de decorado "sunkColumn+v" (acuatica, canvas 30×76), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`
- **`D-PROP-tomb`** — Prop decorativo de la arena. Prop de decorado "tomb" (acuatica, canvas 56×36). Decorado/landmark de la arena acuatica dibujado por código: aidArtTomb (js/rendering/arena-props.js:386). 
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/acuatica/prop_tomb.png`.
  - Formato: PNG 56×36 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px.
  - Prompt: `Pixel art environment prop, Prop de decorado "tomb" (acuatica, canvas 56×36), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`

## B542 — Prop de decorado "coral+v" (acuatica, canvas 44×40) / Prop de decorado "shipwreck" (acuatica, canvas 150×80) / Prop de decorado "sunkTemple" (acuatica, canvas 340×230) / Prop de decorado "angelStatue" (divina, canvas 40×70)  
*Prioridad P2 · PENDIENTE*

- **`D-PROP-coral`** — Prop decorativo de la arena. Prop de decorado "coral+v" (acuatica, canvas 44×40). Decorado/landmark de la arena acuatica dibujado por código: aidArtCoral (js/rendering/arena-props.js:396). Varias variantes (+v).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/acuatica/prop_coral.png`.
  - Formato: PNG 44×40 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px. 2–3 variantes.
  - Prompt: `Pixel art environment prop, Prop de decorado "coral+v" (acuatica, canvas 44×40), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`
- **`D-PROP-shipwreck`** — Prop decorativo de la arena. Prop de decorado "shipwreck" (acuatica, canvas 150×80). Decorado/landmark de la arena acuatica dibujado por código: aidArtShipwreck (js/rendering/arena-props.js:404). 
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/acuatica/prop_shipwreck.png`.
  - Formato: PNG 150×80 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px.
  - Prompt: `Pixel art environment prop, Prop de decorado "shipwreck" (acuatica, canvas 150×80), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`
- **`D-PROP-sunktemple`** — Prop decorativo de la arena. Prop de decorado "sunkTemple" (acuatica, canvas 340×230). Decorado/landmark de la arena acuatica dibujado por código: aidArtSunkTemple (js/rendering/arena-props.js:418). 
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/acuatica/prop_sunktemple.png`.
  - Formato: PNG 340×230 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px.
  - Prompt: `Pixel art environment prop, Prop de decorado "sunkTemple" (acuatica, canvas 340×230), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`
- **`D-PROP-angelstatue`** — Prop decorativo de la arena. Prop de decorado "angelStatue" (divina, canvas 40×70). Decorado/landmark de la arena divina dibujado por código: aidArtAngelStatue (js/rendering/arena-props.js:438). 
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/divina/prop_angelstatue.png`.
  - Formato: PNG 40×70 px nativos (el canvas procedural actual; a 1,0–2,0 u/px), base apoyada abajo-centro (ancla 0,5/0,98), alfa 0/255, contorno 1 px.
  - Prompt: `Pixel art environment prop, Prop de decorado "angelStatue" (divina, canvas 40×70), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/battlefield/column.png`, `assets/sprites/battlefield/altar.png`

## B543 — Incrustación de suelo "inlay-ciudad" (64×40, 3 variantes) / Incrustación de suelo "inlay-fortaleza" (64×40, 3 variantes) / Incrustación de suelo "inlay-bosque" (64×40, 3 variantes) / Incrustación de suelo "inlay-micelial" (64×40, 3 variantes)  
*Prioridad P2 · PENDIENTE*

- **`D-PROP-inlay-ciudad`** — Prop decorativo de la arena. Incrustación de suelo "inlay-ciudad" (64×40, 3 variantes). Narrativa ambiental plana sin colisión (aidArtInlay, js/rendering/arena-props.js:457-). Hoy geométrica por código con 3 colores.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/ciudad/inlay_<v>.png`.
  - Formato: PNG 64×40 ×3 variantes, 3 tonos de la paleta de la arena, aspecto gastado/fragmentado (no debe leerse como un pickup). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art environment prop, Incrustación de suelo "inlay-ciudad" (64×40, 3 variantes), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/ciudad/tex_adoquin.png`
- **`D-PROP-inlay-fortaleza`** — Prop decorativo de la arena. Incrustación de suelo "inlay-fortaleza" (64×40, 3 variantes). Narrativa ambiental plana sin colisión (aidArtInlay, js/rendering/arena-props.js:457-). Hoy geométrica por código con 3 colores.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/fortaleza/inlay_<v>.png`.
  - Formato: PNG 64×40 ×3 variantes, 3 tonos de la paleta de la arena, aspecto gastado/fragmentado (no debe leerse como un pickup). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art environment prop, Incrustación de suelo "inlay-fortaleza" (64×40, 3 variantes), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/ciudad/tex_adoquin.png`
- **`D-PROP-inlay-bosque`** — Prop decorativo de la arena. Incrustación de suelo "inlay-bosque" (64×40, 3 variantes). Narrativa ambiental plana sin colisión (aidArtInlay, js/rendering/arena-props.js:457-). Hoy geométrica por código con 3 colores.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/bosque/inlay_<v>.png`.
  - Formato: PNG 64×40 ×3 variantes, 3 tonos de la paleta de la arena, aspecto gastado/fragmentado (no debe leerse como un pickup). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art environment prop, Incrustación de suelo "inlay-bosque" (64×40, 3 variantes), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/ciudad/tex_adoquin.png`
- **`D-PROP-inlay-micelial`** — Prop decorativo de la arena. Incrustación de suelo "inlay-micelial" (64×40, 3 variantes). Narrativa ambiental plana sin colisión (aidArtInlay, js/rendering/arena-props.js:457-). Hoy geométrica por código con 3 colores.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/micelial/inlay_<v>.png`.
  - Formato: PNG 64×40 ×3 variantes, 3 tonos de la paleta de la arena, aspecto gastado/fragmentado (no debe leerse como un pickup). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art environment prop, Incrustación de suelo "inlay-micelial" (64×40, 3 variantes), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/ciudad/tex_adoquin.png`

## B544 — Incrustación de suelo "inlay-hielo" (64×40, 3 variantes) / Incrustación de suelo "inlay-acuatica" (64×40, 3 variantes) / Incrustación de suelo "inlay-laberinto" (64×40, 3 variantes) / Incrustación de suelo "inlay-abismo" (64×40, 3 variantes)  
*Prioridad P2 · PENDIENTE*

- **`D-PROP-inlay-hielo`** — Prop decorativo de la arena. Incrustación de suelo "inlay-hielo" (64×40, 3 variantes). Narrativa ambiental plana sin colisión (aidArtInlay, js/rendering/arena-props.js:457-). Hoy geométrica por código con 3 colores.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/hielo/inlay_<v>.png`.
  - Formato: PNG 64×40 ×3 variantes, 3 tonos de la paleta de la arena, aspecto gastado/fragmentado (no debe leerse como un pickup). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art environment prop, Incrustación de suelo "inlay-hielo" (64×40, 3 variantes), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/ciudad/tex_adoquin.png`
- **`D-PROP-inlay-acuatica`** — Prop decorativo de la arena. Incrustación de suelo "inlay-acuatica" (64×40, 3 variantes). Narrativa ambiental plana sin colisión (aidArtInlay, js/rendering/arena-props.js:457-). Hoy geométrica por código con 3 colores.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/acuatica/inlay_<v>.png`.
  - Formato: PNG 64×40 ×3 variantes, 3 tonos de la paleta de la arena, aspecto gastado/fragmentado (no debe leerse como un pickup). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art environment prop, Incrustación de suelo "inlay-acuatica" (64×40, 3 variantes), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/ciudad/tex_adoquin.png`
- **`D-PROP-inlay-laberinto`** — Prop decorativo de la arena. Incrustación de suelo "inlay-laberinto" (64×40, 3 variantes). Narrativa ambiental plana sin colisión (aidArtInlay, js/rendering/arena-props.js:457-). Hoy geométrica por código con 3 colores.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/laberinto/inlay_<v>.png`.
  - Formato: PNG 64×40 ×3 variantes, 3 tonos de la paleta de la arena, aspecto gastado/fragmentado (no debe leerse como un pickup). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art environment prop, Incrustación de suelo "inlay-laberinto" (64×40, 3 variantes), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/ciudad/tex_adoquin.png`
- **`D-PROP-inlay-abismo`** — Prop decorativo de la arena. Incrustación de suelo "inlay-abismo" (64×40, 3 variantes). Narrativa ambiental plana sin colisión (aidArtInlay, js/rendering/arena-props.js:457-). Hoy geométrica por código con 3 colores.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/abismo/inlay_<v>.png`.
  - Formato: PNG 64×40 ×3 variantes, 3 tonos de la paleta de la arena, aspecto gastado/fragmentado (no debe leerse como un pickup). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art environment prop, Incrustación de suelo "inlay-abismo" (64×40, 3 variantes), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/ciudad/tex_adoquin.png`

## B545 — Incrustación de suelo "inlay-minas" (64×40, 3 variantes) / Incrustación de suelo "inlay-infernal" (64×40, 3 variantes) / Incrustación de suelo "inlay-divina" (64×40, 3 variantes) / Incrustación de suelo "inlay-coliseo" (64×40, 3 variantes)  
*Prioridad P2 · PENDIENTE*

- **`D-PROP-inlay-minas`** — Prop decorativo de la arena. Incrustación de suelo "inlay-minas" (64×40, 3 variantes). Narrativa ambiental plana sin colisión (aidArtInlay, js/rendering/arena-props.js:457-). Hoy geométrica por código con 3 colores.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/minas/inlay_<v>.png`.
  - Formato: PNG 64×40 ×3 variantes, 3 tonos de la paleta de la arena, aspecto gastado/fragmentado (no debe leerse como un pickup). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art environment prop, Incrustación de suelo "inlay-minas" (64×40, 3 variantes), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/ciudad/tex_adoquin.png`
- **`D-PROP-inlay-infernal`** — Prop decorativo de la arena. Incrustación de suelo "inlay-infernal" (64×40, 3 variantes). Narrativa ambiental plana sin colisión (aidArtInlay, js/rendering/arena-props.js:457-). Hoy geométrica por código con 3 colores.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/infernal/inlay_<v>.png`.
  - Formato: PNG 64×40 ×3 variantes, 3 tonos de la paleta de la arena, aspecto gastado/fragmentado (no debe leerse como un pickup). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art environment prop, Incrustación de suelo "inlay-infernal" (64×40, 3 variantes), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/ciudad/tex_adoquin.png`
- **`D-PROP-inlay-divina`** — Prop decorativo de la arena. Incrustación de suelo "inlay-divina" (64×40, 3 variantes). Narrativa ambiental plana sin colisión (aidArtInlay, js/rendering/arena-props.js:457-). Hoy geométrica por código con 3 colores.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/divina/inlay_<v>.png`.
  - Formato: PNG 64×40 ×3 variantes, 3 tonos de la paleta de la arena, aspecto gastado/fragmentado (no debe leerse como un pickup). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art environment prop, Incrustación de suelo "inlay-divina" (64×40, 3 variantes), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/ciudad/tex_adoquin.png`
- **`D-PROP-inlay-coliseo`** — Prop decorativo de la arena. Incrustación de suelo "inlay-coliseo" (64×40, 3 variantes). Narrativa ambiental plana sin colisión (aidArtInlay, js/rendering/arena-props.js:457-). Hoy geométrica por código con 3 colores.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/coliseo/inlay_<v>.png`.
  - Formato: PNG 64×40 ×3 variantes, 3 tonos de la paleta de la arena, aspecto gastado/fragmentado (no debe leerse como un pickup). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art environment prop, Incrustación de suelo "inlay-coliseo" (64×40, 3 variantes), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/ciudad/tex_adoquin.png`

## B546 — Incrustación de suelo "inlay-convergencia" (64×40, 3 variantes)  
*Prioridad P2 · PENDIENTE*

- **`D-PROP-inlay-convergencia`** — Prop decorativo de la arena. Incrustación de suelo "inlay-convergencia" (64×40, 3 variantes). Narrativa ambiental plana sin colisión (aidArtInlay, js/rendering/arena-props.js:457-). Hoy geométrica por código con 3 colores.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/convergencia/inlay_<v>.png`.
  - Formato: PNG 64×40 ×3 variantes, 3 tonos de la paleta de la arena, aspecto gastado/fragmentado (no debe leerse como un pickup). PNG RGBA, alfa 0/255, vecino más cercano.
  - Prompt: `Pixel art environment prop, Incrustación de suelo "inlay-convergencia" (64×40, 3 variantes), oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/ciudad/tex_adoquin.png`

## B547 — Suelo/tile de la arena "divina" / Suelo/tile de la arena "acuatica" / Textura del Abismo "tex_carne" (PALETA_EXCESIVA) / Textura del Abismo "tex_tentaculo" (PALETA_EXCESIVA)  
*Prioridad P2 · PENDIENTE*

- **`D-SUELO-divina`** — Textura de suelo repetible, vista cenital. Suelo/tile de la arena "divina". Hoy el piso se genera por código (buildFloorTile, tile procedural de 160×160 con placas de piedra, js/rendering/arena.js:25). FLOOR_THEME[divina].
  - Método: runway + pintor (textura repetible). Entrega: `art-source/entregas/2026-10_mundo/arenas/divina/tex_piso.png`.
  - Formato: PNG sin costuras (tile repetible), 2,0 u/px (≈64×64 o 96×96 px nativos), ≤ 250 tonos, sin JPG ni degradé, 3–4 variantes de piedra/terreno + 1 de borde. Es FONDO: poco contraste (la horda debe leerse primero).
  - Prompt: `Seamless tileable top-down ground texture, Suelo/tile de la arena "divina", pixel art, muted dark-fantasy palette, no objects, no text.`
  - Referencias: `assets/vfx/ciudad/tex_calle.png`, `assets/vfx/minas/tex_piso_galerias.png`
- **`D-SUELO-acuatica`** — Textura de suelo repetible, vista cenital. Suelo/tile de la arena "acuatica". Hoy el piso se genera por código (buildFloorTile, tile procedural de 160×160 con placas de piedra, js/rendering/arena.js:25). FLOOR_THEME[acuatica].
  - Método: runway + pintor (textura repetible). Entrega: `art-source/entregas/2026-10_mundo/arenas/acuatica/tex_piso.png`.
  - Formato: PNG sin costuras (tile repetible), 2,0 u/px (≈64×64 o 96×96 px nativos), ≤ 250 tonos, sin JPG ni degradé, 3–4 variantes de piedra/terreno + 1 de borde. Es FONDO: poco contraste (la horda debe leerse primero).
  - Prompt: `Seamless tileable top-down ground texture, Suelo/tile de la arena "acuatica", pixel art, muted dark-fantasy palette, no objects, no text.`
  - Referencias: `assets/vfx/ciudad/tex_calle.png`, `assets/vfx/minas/tex_piso_galerias.png`
- **`D-SUELO-abismo-tex_carne`** — Textura de suelo repetible, vista cenital. Textura del Abismo "tex_carne" (PALETA_EXCESIVA). Piel del Que Mora Debajo / tentáculos (assets/vfx/abismo/tex_carne.png, 56×205).
  - Método: runway + pintor (textura repetible). Entrega: `art-source/entregas/2026-10_mundo/arenas/abismo/tex_carne.png`.
  - Formato: PNG 56×205 mismo lienzo, ≤ 250 tonos (hoy 345), sin degradé.
  - Prompt: `Seamless tileable top-down ground texture, Textura del Abismo "tex_carne" (PALETA_EXCESIVA), pixel art, muted dark-fantasy palette, no objects, no text.`
  - Referencias: `assets/vfx/abismo/tex_piso.png`
- **`D-SUELO-abismo-tex_tentaculo`** — Textura de suelo repetible, vista cenital. Textura del Abismo "tex_tentaculo" (PALETA_EXCESIVA). Piel del Que Mora Debajo / tentáculos (assets/vfx/abismo/tex_tentaculo.png, 56×205).
  - Método: runway + pintor (textura repetible). Entrega: `art-source/entregas/2026-10_mundo/arenas/abismo/tex_tentaculo.png`.
  - Formato: PNG 56×205 mismo lienzo, ≤ 250 tonos (hoy 549), sin degradé.
  - Prompt: `Seamless tileable top-down ground texture, Textura del Abismo "tex_tentaculo" (PALETA_EXCESIVA), pixel art, muted dark-fantasy palette, no objects, no text.`
  - Referencias: `assets/vfx/abismo/tex_piso.png`

## B567 — Devorador de Piedra (ab_devorador, elite, arena abismo)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-ab_devorador`** — Devorador de Piedra (ab_devorador, elite, arena abismo). Enemigo elite de la arena abismo. Estados que el motor rellena clonando/espejando en vez de dibujar: 1 de 11 (idle). Criatura: Una bestia que come piedra. Cada paso que da agrieta el mundo un poco más. Comportamiento: Pesado. Ataques: Pisotón que agrieta. Detalle y prompts por estado en enemigos/abismo.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/abismo/ab_devorador/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Devorador de Piedra, elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a6a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Devorador de Piedra, elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a6a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Devorador de Piedra, elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a6a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Devorador de Piedra, elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a6a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Devorador de Piedra, elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a6a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Devorador de Piedra, elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a6a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Devorador de Piedra, elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a6a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Devorador de Piedra, elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a6a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Devorador de Piedra, elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a6a5a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/abismo/ab_errante/atlas.png`

## B568 — Ángel de Hielo y Cristal (angel_hielo, elite, arena hielo)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-angel_hielo`** — Ángel de Hielo y Cristal (angel_hielo, elite, arena hielo). Enemigo elite de la arena hielo. Estados que el motor rellena clonando/espejando en vez de dibujar: 4 de 11 (idle, attack_D, attack_U, hit_D). Criatura: Ángeles tallados en cristal por el Mago Gélido, cuando todavía cuidaba el sello. Guardan la forma de un rezo que ya nadie dice. Comportamiento: Élite. Mantiene distancia, lanza cristal y canaliza el Prisma Helado bajo los pies de hasta dos guardianes. Ataques: Disparo de cristal, Prisma Helado: círculo con aviso, daño + 2 cargas de escarcha. Detalle y prompts por estado en enemigos/hielo.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/hielo/angel_hielo/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Ángel de Hielo y Cristal, elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9ec8e8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Ángel de Hielo y Cristal, elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9ec8e8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Ángel de Hielo y Cristal, elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #9ec8e8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Ángel de Hielo y Cristal, elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #9ec8e8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Ángel de Hielo y Cristal, elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9ec8e8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Ángel de Hielo y Cristal, elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #9ec8e8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Ángel de Hielo y Cristal, elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #9ec8e8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Ángel de Hielo y Cristal, elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9ec8e8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Ángel de Hielo y Cristal, elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9ec8e8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B569 — Dragoncito de Hielo (dragoncito_hielo, elite, arena hielo)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-dragoncito_hielo`** — Dragoncito de Hielo (dragoncito_hielo, elite, arena hielo). Enemigo elite de la arena hielo. Estados que el motor rellena clonando/espejando en vez de dibujar: 4 de 11 (idle, attack_D, attack_U, hit_D). Criatura: Crías de los dragones de la montaña. Todavía no saben volar bien, pero su aliento ya congela. Comportamiento: Élite. Dispara bolas de escarcha en arco y cada tanto se planta para soplar un cono helado. Ataques: Disparo de escarcha (en arco), Aliento de Escarcha: cono con aviso, daño + 1 carga de escarcha. Detalle y prompts por estado en enemigos/hielo.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/hielo/dragoncito_hielo/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Dragoncito de Hielo, elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #a8dcff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Dragoncito de Hielo, elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #a8dcff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Dragoncito de Hielo, elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #a8dcff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Dragoncito de Hielo, elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #a8dcff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Dragoncito de Hielo, elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #a8dcff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Dragoncito de Hielo, elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #a8dcff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Dragoncito de Hielo, elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #a8dcff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Dragoncito de Hielo, elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #a8dcff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Dragoncito de Hielo, elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #a8dcff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/abismo/ab_errante/atlas.png`

## B570 — Guardián Ancestral Corrompido (guardian_ancestral, jefe, arena bosque)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-guardian_ancestral`** — Guardián Ancestral Corrompido (guardian_ancestral, jefe, arena bosque). Enemigo jefe de la arena bosque. Estados que el motor rellena clonando/espejando en vez de dibujar: 3 de 11 (attack_D, attack_U, hit_D). Criatura: — Comportamiento: — Ataques: —. Detalle y prompts por estado en enemigos/bosque.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/bosque/guardian_ancestral/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Guardián Ancestral Corrompido, boss), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #3f6a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Guardián Ancestral Corrompido, boss), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #3f6a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Guardián Ancestral Corrompido, boss), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #3f6a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Guardián Ancestral Corrompido, boss), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #3f6a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Guardián Ancestral Corrompido, boss), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #3f6a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Guardián Ancestral Corrompido, boss), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #3f6a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Guardián Ancestral Corrompido, boss), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #3f6a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Guardián Ancestral Corrompido, boss), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #3f6a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Guardián Ancestral Corrompido, boss), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #3f6a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/bosses/bosque/doblador_guerrero/v2/atlas.png`

## B571 — Errante del Vacío (ab_errante, normal, arena abismo)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-ab_errante`** — Errante del Vacío (ab_errante, normal, arena abismo). Enemigo normal de la arena abismo. Estados que el motor rellena clonando/espejando en vez de dibujar: 1 de 11 (idle). Criatura: Lo que queda de los que cayeron al Abismo antes que vos. Siguen caminando por el borde, buscando algo que perdieron. Comportamiento: Cuerpo a cuerpo. Ataques: Golpe fuerte con aviso (cono) que EMPUJA. Detalle y prompts por estado en enemigos/abismo.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/abismo/ab_errante/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Errante del Vacío, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a4a6a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Errante del Vacío, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a4a6a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Errante del Vacío, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a4a6a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Errante del Vacío, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a4a6a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Errante del Vacío, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a4a6a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Errante del Vacío, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a4a6a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Errante del Vacío, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a4a6a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Errante del Vacío, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a4a6a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Errante del Vacío, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a4a6a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B572 — Anguila Eléctrica (anguila_electrica, normal, arena acuatica)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-anguila_electrica`** — Anguila Eléctrica (anguila_electrica, normal, arena acuatica). Enemigo normal de la arena acuatica. Estados que el motor rellena clonando/espejando en vez de dibujar: 6 de 11 (idle, walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Anguilas que atraviesan las corrientes como relámpagos vivos. Comportamiento: Se mueve rápido y encadena descargas. Ataques: Cadena Eléctrica. Detalle y prompts por estado en enemigos/acuatica.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/acuatica/anguila_electrica/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Anguila Eléctrica, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #3a7a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Anguila Eléctrica, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #3a7a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Anguila Eléctrica, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #3a7a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Anguila Eléctrica, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #3a7a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Anguila Eléctrica, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #3a7a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Anguila Eléctrica, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #3a7a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Anguila Eléctrica, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #3a7a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Anguila Eléctrica, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #3a7a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Anguila Eléctrica, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #3a7a8a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/abismo/ab_errante/atlas.png`

## B573 — Carcelero Deforme (carcelero, normal, arena fortaleza)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-carcelero`** — Carcelero Deforme (carcelero, normal, arena fortaleza). Enemigo normal de la arena fortaleza. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Los antiguos carceleros de la Fábrica nunca dejaron sus puestos. La Horda les soldó las cadenas a la carne y les dejó una sola orden: que nadie salga. Comportamiento: Avanza de frente y castiga a quien se aleje del grupo. Ataques: Golpe de maza, Tirón de Cadena: aviso en línea, te arrastra hasta 200 u (esquivable). Detalle y prompts por estado en enemigos/fortaleza.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/fortaleza/carcelero/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Carcelero Deforme, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a4a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Carcelero Deforme, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a4a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Carcelero Deforme, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a4a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Carcelero Deforme, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a4a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Carcelero Deforme, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a4a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Carcelero Deforme, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a4a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Carcelero Deforme, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a4a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Carcelero Deforme, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a4a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Carcelero Deforme, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a4a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B574 — Espectro Ciudadano (cm_espectro, normal, arena ciudad)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-cm_espectro`** — Espectro Ciudadano (cm_espectro, normal, arena ciudad). Enemigo normal de la arena ciudad. Estados que el motor rellena clonando/espejando en vez de dibujar: 1 de 11 (idle). Criatura: Almas atrapadas en la maldición de la ciudad. Frágiles pero numerosas. Comportamiento: Atraviesa paredes. Drena a un guardián o asusta a un civil. Ataques: Drenado (se cura), Posesión: el civil entra en pánico. Detalle y prompts por estado en enemigos/ciudad.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/ciudad/cm_espectro/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Espectro Ciudadano, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7ab0e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Espectro Ciudadano, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7ab0e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Espectro Ciudadano, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #7ab0e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Espectro Ciudadano, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #7ab0e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Espectro Ciudadano, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7ab0e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Espectro Ciudadano, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #7ab0e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Espectro Ciudadano, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #7ab0e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Espectro Ciudadano, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7ab0e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Espectro Ciudadano, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7ab0e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/abismo/ab_errante/atlas.png`

## B575 — Espejismo de la Dama (cm_espejismo, normal, arena ciudad)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-cm_espejismo`** — Espejismo de la Dama (cm_espejismo, normal, arena ciudad). Enemigo normal de la arena ciudad. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: — Comportamiento: — Ataques: —. Detalle y prompts por estado en enemigos/otras.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/ciudad/cm_espejismo/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Espejismo de la Dama, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c02040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Espejismo de la Dama, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c02040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Espejismo de la Dama, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #c02040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Espejismo de la Dama, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #c02040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Espejismo de la Dama, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c02040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Espejismo de la Dama, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #c02040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Espejismo de la Dama, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #c02040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Espejismo de la Dama, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c02040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Espejismo de la Dama, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c02040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B576 — Saqueador Maldito (cm_saqueador, normal, arena ciudad)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-cm_saqueador`** — Saqueador Maldito (cm_saqueador, normal, arena ciudad). Enemigo normal de la arena ciudad. Estados que el motor rellena clonando/espejando en vez de dibujar: 1 de 11 (idle). Criatura: Antiguos habitantes de la ciudad. La Horda les dejó las manos y les sacó todo lo demás: ahora saquean las casas de sus vecinos. Comportamiento: Cuerpo a cuerpo y en grupo. Si no hay guardianes cerca, va por los civiles. Ataques: Corte, Embestida con aviso (cono), Golpe a un civil con aviso (!). Detalle y prompts por estado en enemigos/ciudad.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/ciudad/cm_saqueador/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Saqueador Maldito, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a3030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Saqueador Maldito, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a3030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Saqueador Maldito, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a3030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Saqueador Maldito, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a3030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Saqueador Maldito, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a3030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Saqueador Maldito, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a3030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Saqueador Maldito, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a3030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Saqueador Maldito, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a3030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Saqueador Maldito, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a3030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B577 — Sectario Fanático (cm_sectario, normal, arena ciudad)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-cm_sectario`** — Sectario Fanático (cm_sectario, normal, arena ciudad). Enemigo normal de la arena ciudad. Estados que el motor rellena clonando/espejando en vez de dibujar: 3 de 11 (idle, hit, hit_D). Criatura: Fanáticos que todavía adoran al Presentador. Atacan en grupo y se sacrifican para explotar. Comportamiento: Cuerpo a cuerpo; herido o pegado a vos, se prepara para ESTALLAR. Ataques: Golpe, Explosión con aviso (daña guardianes, civiles y edificios). Detalle y prompts por estado en enemigos/ciudad.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/ciudad/cm_sectario/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Sectario Fanático, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b02020. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Sectario Fanático, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b02020. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Sectario Fanático, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #b02020. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Sectario Fanático, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #b02020. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Sectario Fanático, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b02020. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Sectario Fanático, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #b02020. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Sectario Fanático, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #b02020. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Sectario Fanático, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b02020. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Sectario Fanático, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b02020. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B578 — Servo de Cristal (cristal_servo, normal, arena hielo)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-cristal_servo`** — Servo de Cristal (cristal_servo, normal, arena hielo). Enemigo normal de la arena hielo. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Esquirlas del poder del Mago que toman forma por unos segundos. Comportamiento: Chusma que te rodea. Ataques: Golpe de cristal. Detalle y prompts por estado en enemigos/hielo.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/hielo/cristal_servo/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Servo de Cristal, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9ec8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Servo de Cristal, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9ec8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Servo de Cristal, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #9ec8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Servo de Cristal, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #9ec8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Servo de Cristal, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9ec8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Servo de Cristal, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #9ec8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Servo de Cristal, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #9ec8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Servo de Cristal, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9ec8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Servo de Cristal, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #9ec8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/bosque/enjambre_hadas/v3/atlas.png`

## B579 — Cristal Volador (cristal_volador, normal, arena hielo)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-cristal_volador`** — Cristal Volador (cristal_volador, normal, arena hielo). Enemigo normal de la arena hielo. Estados que el motor rellena clonando/espejando en vez de dibujar: 6 de 11 (walk_D, walk_U, attack_D, attack_U, hit, hit_D). Criatura: Cristales que flotan alrededor del Mago y disparan su frío. Comportamiento: Vuela y dispara desde lejos. Ataques: Proyectil de escarcha. Detalle y prompts por estado en enemigos/hielo.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/hielo/cristal_volador/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Cristal Volador, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #bfe8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Cristal Volador, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #bfe8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Cristal Volador, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #bfe8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Cristal Volador, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #bfe8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Cristal Volador, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #bfe8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Cristal Volador, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #bfe8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Cristal Volador, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #bfe8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Cristal Volador, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #bfe8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Cristal Volador, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #bfe8ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/bosque/enjambre_hadas/v3/atlas.png`

## B580 — Dragón de Bronce (dragon_bronce, normal, arena fortaleza)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-dragon_bronce`** — Dragón de Bronce (dragon_bronce, normal, arena fortaleza). Enemigo normal de la arena fortaleza. Estados que el motor rellena clonando/espejando en vez de dibujar: 6 de 11 (idle, walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Juguetes de guerra de una civilización que ya no existe: dragones de bronce que volaban sobre sus fundiciones. La Horda los despertó sin apagarles el fuego. Comportamiento: Acosa en órbita y baja en picada. Ataques: Mordida en picada, Aliento de Vapor (cono que ralentiza). Detalle y prompts por estado en enemigos/fortaleza.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/fortaleza/dragon_bronce/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Dragón de Bronce, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c07a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Dragón de Bronce, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c07a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Dragón de Bronce, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #c07a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Dragón de Bronce, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #c07a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Dragón de Bronce, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c07a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Dragón de Bronce, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #c07a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Dragón de Bronce, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #c07a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Dragón de Bronce, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c07a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Dragón de Bronce, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c07a3a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/abismo/ab_errante/atlas.png`

## B581 — Duende del Bosque (duende_bosque, normal, arena bosque)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-duende_bosque`** — Duende del Bosque (duende_bosque, normal, arena bosque). Enemigo normal de la arena bosque. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Los duendes cuidaban los menhires de las Ruinas. Cuando el Guardián Ancestral se pudrió, ellos se pudrieron con él, pero todavía defienden las piedras: de vos. Comportamiento: Chusma rápida que llega en grupo. Ataques: Cuchillada. Detalle y prompts por estado en enemigos/bosque.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/bosque/duende_bosque/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Duende del Bosque, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7a9a4a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Duende del Bosque, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7a9a4a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Duende del Bosque, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #7a9a4a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Duende del Bosque, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #7a9a4a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Duende del Bosque, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7a9a4a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Duende del Bosque, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #7a9a4a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Duende del Bosque, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #7a9a4a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Duende del Bosque, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7a9a4a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Duende del Bosque, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7a9a4a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B582 — Esqueleto (esqueleto, normal, arena infernal)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-esqueleto`** — Esqueleto (esqueleto, normal, arena infernal). Enemigo normal de la arena infernal. Estados que el motor rellena clonando/espejando en vez de dibujar: 4 de 11 (idle, hit, hit_D, death). Criatura: Los primeros soldados de la Horda: huesos de todos los que cayeron en su dimensión. Comportamiento: Chusma que llega en masa. Ataques: Espadazo. Detalle y prompts por estado en enemigos/infernal.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/infernal/esqueleto/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Esqueleto, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #ece4cc. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Esqueleto, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #ece4cc. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Esqueleto, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #ece4cc. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Esqueleto, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #ece4cc. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Esqueleto, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #ece4cc. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Esqueleto, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #ece4cc. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Esqueleto, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #ece4cc. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Esqueleto, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #ece4cc. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Esqueleto, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #ece4cc. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B583 — Gólem de Cristal (golem_cristal, normal, arena hielo)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-golem_cristal`** — Gólem de Cristal (golem_cristal, normal, arena hielo). Enemigo normal de la arena hielo. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Guardianes que el Mago Gélido invoca para blindarse. Comportamiento: Protege al Mago. Ataques: Pisotón, Lanzar cristal, Embestida. Detalle y prompts por estado en enemigos/hielo.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/hielo/golem_cristal/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Gólem de Cristal, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6fa8e8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Gólem de Cristal, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6fa8e8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Gólem de Cristal, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #6fa8e8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Gólem de Cristal, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #6fa8e8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Gólem de Cristal, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6fa8e8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Gólem de Cristal, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #6fa8e8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Gólem de Cristal, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #6fa8e8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Gólem de Cristal, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6fa8e8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Gólem de Cristal, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6fa8e8. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png`

## B584 — Gólem de Hielo (golem_hielo, normal, arena hielo)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-golem_hielo`** — Gólem de Hielo (golem_hielo, normal, arena hielo). Enemigo normal de la arena hielo. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Hielo que aprendió a caminar. El Mago Gélido los levantaba para custodiar el paso de la montaña. Comportamiento: Tanque lento. Ataques: Golpe helado. Detalle y prompts por estado en enemigos/hielo.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/hielo/golem_hielo/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Gólem de Hielo, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8fc4e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Gólem de Hielo, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8fc4e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Gólem de Hielo, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #8fc4e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Gólem de Hielo, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8fc4e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Gólem de Hielo, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8fc4e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Gólem de Hielo, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #8fc4e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Gólem de Hielo, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8fc4e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Gólem de Hielo, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8fc4e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Gólem de Hielo, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8fc4e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png`

## B585 — Infectado Micelial (infectado, normal, arena micelial)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-infectado`** — Infectado Micelial (infectado, normal, arena micelial). Enemigo normal de la arena micelial. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Viajeros que durmieron donde no debían. El micelio los encontró y ahora camina con sus cuerpos. Comportamiento: Masa cuerpo a cuerpo. Ataques: Golpe. Detalle y prompts por estado en enemigos/micelial.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/micelial/infectado/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Infectado Micelial, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b050c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Infectado Micelial, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b050c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Infectado Micelial, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #b050c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Infectado Micelial, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #b050c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Infectado Micelial, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b050c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Infectado Micelial, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #b050c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Infectado Micelial, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #b050c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Infectado Micelial, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b050c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Infectado Micelial, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b050c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B586 — Lobo Ártico (lobo_artico, normal, arena hielo)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-lobo_artico`** — Lobo Ártico (lobo_artico, normal, arena hielo). Enemigo normal de la arena hielo. Estados que el motor rellena clonando/espejando en vez de dibujar: 4 de 11 (idle, hit, hit_D, death). Criatura: Manadas que cruzaban la tundra antes del invierno eterno. El frío del Mago Gélido les congeló la mirada. Comportamiento: Rápido, llega en manada. Ataques: Mordida. Detalle y prompts por estado en enemigos/hielo.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/hielo/lobo_artico/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Lobo Ártico, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #cfe4ee. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Lobo Ártico, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #cfe4ee. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Lobo Ártico, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #cfe4ee. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Lobo Ártico, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #cfe4ee. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Lobo Ártico, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #cfe4ee. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Lobo Ártico, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #cfe4ee. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Lobo Ártico, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #cfe4ee. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Lobo Ártico, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #cfe4ee. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Lobo Ártico, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #cfe4ee. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/micelial/sabueso/atlas.png`

## B587 — Esclavo Enlazado (mn_esclavo, normal, arena minas)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-mn_esclavo`** — Esclavo Enlazado (mn_esclavo, normal, arena minas). Enemigo normal de la arena minas. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Antiguos mineros esclavizados por la oscuridad. Siguen encadenados a sus herramientas y a la mina que los tragó. Comportamiento: Numerosos y persistentes. En la oscuridad se vuelven más agresivos. Ataques: Golpe con la bola de cadena, Tirón de cadena en línea (con aviso). Detalle y prompts por estado en enemigos/minas.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/minas/mn_esclavo/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Esclavo Enlazado, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a5040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Esclavo Enlazado, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a5040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Esclavo Enlazado, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a5040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Esclavo Enlazado, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a5040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Esclavo Enlazado, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a5040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Esclavo Enlazado, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a5040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Esclavo Enlazado, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a5040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Esclavo Enlazado, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a5040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Esclavo Enlazado, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a5040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B588 — Insecto de Cristal (mn_insecto, normal, arena minas)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-mn_insecto`** — Insecto de Cristal (mn_insecto, normal, arena minas). Enemigo normal de la arena minas. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Criaturas que habitan en las vetas de cristal rojo. Salen de las paredes y los techos en enjambre. Comportamiento: Rápidos y frágiles; salen de a tres de las paredes y columnas. Ataques: Mordida, Estallido de esquirlas al morir (aviso corto). Detalle y prompts por estado en enemigos/minas.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/minas/mn_insecto/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Insecto de Cristal, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c02030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Insecto de Cristal, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c02030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Insecto de Cristal, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #c02030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Insecto de Cristal, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #c02030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Insecto de Cristal, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c02030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Insecto de Cristal, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #c02030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Insecto de Cristal, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #c02030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Insecto de Cristal, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c02030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Insecto de Cristal, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c02030. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/abismo/ab_errante/atlas.png`

## B589 — Prisionero Ensamblado (prisionero, normal, arena fortaleza)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-prisionero`** — Prisionero Ensamblado (prisionero, normal, arena fortaleza). Enemigo normal de la arena fortaleza. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Lo que queda de los presos que la Fábrica nunca liberó, cosidos con engranajes y tubos. Ya no recuerdan su nombre; recuerdan el hambre. Comportamiento: Enjambre en zigzag que busca rodearte. Ataques: Garras. Detalle y prompts por estado en enemigos/fortaleza.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/fortaleza/prisionero/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Prisionero Ensamblado, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #a07a6a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Prisionero Ensamblado, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #a07a6a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Prisionero Ensamblado, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #a07a6a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Prisionero Ensamblado, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #a07a6a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Prisionero Ensamblado, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #a07a6a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Prisionero Ensamblado, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #a07a6a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Prisionero Ensamblado, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #a07a6a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Prisionero Ensamblado, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #a07a6a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Prisionero Ensamblado, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #a07a6a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B590 — Sabueso Cordyceps (sabueso, normal, arena micelial)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-sabueso`** — Sabueso Cordyceps (sabueso, normal, arena micelial). Enemigo normal de la arena micelial. Estados que el motor rellena clonando/espejando en vez de dibujar: 6 de 11 (walk_D, walk_U, attack, attack_D, attack_U, hit_D). Criatura: Perros tomados por el cordyceps. Siguen el rastro de los vivos por el brillo que dejan en las esporas. Comportamiento: Llega de a 2-3 y rodea. Ataques: Salto corto con aviso, Mordida. Detalle y prompts por estado en enemigos/micelial.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/micelial/sabueso/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Sabueso Cordyceps, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #e0304a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Sabueso Cordyceps, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #e0304a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Sabueso Cordyceps, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #e0304a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Sabueso Cordyceps, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #e0304a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Sabueso Cordyceps, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #e0304a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Sabueso Cordyceps, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #e0304a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Sabueso Cordyceps, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #e0304a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Sabueso Cordyceps, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #e0304a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Sabueso Cordyceps, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #e0304a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/micelial/sabueso/atlas.png`

## B591 — Zombi (zombie, normal, arena infernal)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-zombie`** — Zombi (zombie, normal, arena infernal). Enemigo normal de la arena infernal. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Cuerpos que la Horda no terminó de vaciar. Lentos, pero no paran. Comportamiento: Lento, te rodea. Ataques: Golpe. Detalle y prompts por estado en enemigos/infernal.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/infernal/zombie/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Zombi, common enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6d7d55. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Zombi, common enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6d7d55. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Zombi, common enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #6d7d55. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Zombi, common enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #6d7d55. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Zombi, common enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6d7d55. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Zombi, common enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #6d7d55. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Zombi, common enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #6d7d55. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Zombi, common enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6d7d55. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Zombi, common enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6d7d55. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B592 — Acechador del Borde (ab_acechador, subelite, arena abismo)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-ab_acechador`** — Acechador del Borde (ab_acechador, subelite, arena abismo). Enemigo subelite de la arena abismo. Estados que el motor rellena clonando/espejando en vez de dibujar: 4 de 11 (idle, attack, attack_D, attack_U). Criatura: Criaturas que viven colgadas bajo las plataformas. Suben por el borde que da al vacío. Comportamiento: Rápido, busca tu flanco del lado del vacío. Ataques: Salto con aviso (círculo + línea) que empuja. Detalle y prompts por estado en enemigos/abismo.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/abismo/ab_acechador/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Acechador del Borde, sub-elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7a4ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Acechador del Borde, sub-elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7a4ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Acechador del Borde, sub-elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #7a4ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Acechador del Borde, sub-elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #7a4ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Acechador del Borde, sub-elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7a4ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Acechador del Borde, sub-elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #7a4ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Acechador del Borde, sub-elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #7a4ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Acechador del Borde, sub-elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7a4ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Acechador del Borde, sub-elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #7a4ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/abismo/ab_errante/atlas.png`

## B593 — Heraldo del Ojo (ab_heraldo, subelite, arena abismo)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-ab_heraldo`** — Heraldo del Ojo (ab_heraldo, subelite, arena abismo). Enemigo subelite de la arena abismo. Estados que el motor rellena clonando/espejando en vez de dibujar: 1 de 11 (idle). Criatura: Los heraldos anuncian al Ojo. Donde flotan, la gravedad se tuerce. Comportamiento: A distancia. Ataques: Orbe lento con marca en el piso, Zona gravitatoria que atrae a héroes Y horda. Detalle y prompts por estado en enemigos/abismo.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/abismo/ab_heraldo/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Heraldo del Ojo, sub-elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b050ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Heraldo del Ojo, sub-elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b050ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Heraldo del Ojo, sub-elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #b050ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Heraldo del Ojo, sub-elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #b050ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Heraldo del Ojo, sub-elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b050ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Heraldo del Ojo, sub-elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #b050ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Heraldo del Ojo, sub-elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #b050ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Heraldo del Ojo, sub-elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b050ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Heraldo del Ojo, sub-elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #b050ff. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B594 — Tejedor del Vacío (ab_tejedor, subelite, arena abismo)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-ab_tejedor`** — Tejedor del Vacío (ab_tejedor, subelite, arena abismo). Enemigo subelite de la arena abismo. Estados que el motor rellena clonando/espejando en vez de dibujar: 1 de 11 (idle). Criatura: Teje hilos de vacío entre las ruinas, como una araña que sostiene lo que no debería flotar. Comportamiento: Tiende filamentos entre dos puntos. Ataques: Filamentos: cruzarlos frena y tira un poco. Detalle y prompts por estado en enemigos/abismo.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/abismo/ab_tejedor/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Tejedor del Vacío, sub-elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c060e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Tejedor del Vacío, sub-elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c060e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Tejedor del Vacío, sub-elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #c060e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Tejedor del Vacío, sub-elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #c060e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Tejedor del Vacío, sub-elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c060e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Tejedor del Vacío, sub-elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #c060e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Tejedor del Vacío, sub-elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #c060e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Tejedor del Vacío, sub-elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c060e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Tejedor del Vacío, sub-elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c060e0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B595 — Acechador de Esporas (acechador, subelite, arena micelial)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-acechador`** — Acechador de Esporas (acechador, subelite, arena micelial). Enemigo subelite de la arena micelial. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Un depredador que el micelio fabricó a propósito: vive bajo tierra y sale cuando late algo cerca. Comportamiento: Se entierra, avanza, avisa y salta. Ataques: Salto desde abajo (círculo + línea + siseo), Zarpazo. Detalle y prompts por estado en enemigos/micelial.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/micelial/acechador/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Acechador de Esporas, sub-elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6a5ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Acechador de Esporas, sub-elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6a5ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Acechador de Esporas, sub-elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #6a5ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Acechador de Esporas, sub-elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #6a5ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Acechador de Esporas, sub-elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6a5ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Acechador de Esporas, sub-elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #6a5ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Acechador de Esporas, sub-elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #6a5ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Acechador de Esporas, sub-elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6a5ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Acechador de Esporas, sub-elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #6a5ad0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/abismo/ab_errante/atlas.png`

## B596 — Araña Mecánica (arana, subelite, arena fortaleza)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-arana`** — Araña Mecánica (arana, subelite, arena fortaleza). Enemigo subelite de la arena fortaleza. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Arañas de mantenimiento que reparaban las máquinas de la Fábrica. Siguen reparando: ahora a los monstruos. Comportamiento: Mantiene distancia y dispara pernos. Ataques: Pernos a distancia, Red de Cadenas (zona que ralentiza, con aviso). Detalle y prompts por estado en enemigos/fortaleza.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/fortaleza/arana/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Araña Mecánica, sub-elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a5a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Araña Mecánica, sub-elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a5a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Araña Mecánica, sub-elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a5a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Araña Mecánica, sub-elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a5a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Araña Mecánica, sub-elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a5a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Araña Mecánica, sub-elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #8a5a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Araña Mecánica, sub-elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8a5a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Araña Mecánica, sub-elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a5a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Araña Mecánica, sub-elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8a5a2a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/laberinto/escorpion_gigante/walk-strip.png`

## B597 — Plañidera (cm_planidera, subelite, arena ciudad)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-cm_planidera`** — Plañidera (cm_planidera, subelite, arena ciudad). Enemigo subelite de la arena ciudad. Estados que el motor rellena clonando/espejando en vez de dibujar: 1 de 11 (idle). Criatura: El espíritu de una antigua habitante de la ciudad. Su lamento enloquece a los vivos. Comportamiento: A distancia; mantiene la distancia. Ataques: Lágrima (proyectil), Grito de Pánico con aviso (círculo). Detalle y prompts por estado en enemigos/ciudad.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/ciudad/cm_planidera/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Plañidera, sub-elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c05060. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Plañidera, sub-elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c05060. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Plañidera, sub-elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #c05060. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Plañidera, sub-elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #c05060. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Plañidera, sub-elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c05060. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Plañidera, sub-elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #c05060. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Plañidera, sub-elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #c05060. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Plañidera, sub-elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c05060. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Plañidera, sub-elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c05060. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B598 — Raptor (cm_raptor, subelite, arena ciudad)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-cm_raptor`** — Raptor (cm_raptor, subelite, arena ciudad). Enemigo subelite de la arena ciudad. Estados que el motor rellena clonando/espejando en vez de dibujar: 1 de 11 (idle). Criatura: Busca a los vivos, los agarra y trata de llevárselos hacia un portal o una salida. Nadie sabe adónde. Comportamiento: Busca civiles (no prioriza a los guardianes). Estados: busca, persigue, agarra, escapa, interrumpido. Ataques: Agarrar civil (aviso), Huida con el civil hacia un borde. Detalle y prompts por estado en enemigos/ciudad.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/ciudad/cm_raptor/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Raptor, sub-elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #a04040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Raptor, sub-elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #a04040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Raptor, sub-elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #a04040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Raptor, sub-elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #a04040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Raptor, sub-elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #a04040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Raptor, sub-elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #a04040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Raptor, sub-elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #a04040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Raptor, sub-elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #a04040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Raptor, sub-elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #a04040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B599 — Esqueleto Cornudo (esqueleto_h, subelite, arena infernal)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-esqueleto_h`** — Esqueleto Cornudo (esqueleto_h, subelite, arena infernal). Enemigo subelite de la arena infernal. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Esqueletos cornudos: guerreros que la Horda premió con más huesos. Comportamiento: Gira su arma cuando estás cerca. Ataques: Giro de arma, Embestida en línea recta. Detalle y prompts por estado en enemigos/infernal.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/infernal/esqueleto_h/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Esqueleto Cornudo, sub-elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #ded4b4. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Esqueleto Cornudo, sub-elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #ded4b4. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Esqueleto Cornudo, sub-elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #ded4b4. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Esqueleto Cornudo, sub-elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #ded4b4. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Esqueleto Cornudo, sub-elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #ded4b4. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Esqueleto Cornudo, sub-elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #ded4b4. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Esqueleto Cornudo, sub-elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #ded4b4. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Esqueleto Cornudo, sub-elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #ded4b4. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Esqueleto Cornudo, sub-elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #ded4b4. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B600 — Medusa (medusa, subelite, arena laberinto)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-medusa`** — Medusa (medusa, subelite, arena laberinto). Enemigo subelite de la arena laberinto. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (idle, attack_D, attack_U, hit_D, death). Criatura: La Medusa del Laberinto convertía en piedra a los ladrones de tumbas. Los que ves en las paredes no son estatuas. Comportamiento: Aparece a partir del nivel 5. Ataques: Mirada petrificante, Serpientes. Detalle y prompts por estado en enemigos/laberinto.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/laberinto/medusa/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Medusa, sub-elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #5a8a5e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Medusa, sub-elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #5a8a5e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Medusa, sub-elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #5a8a5e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Medusa, sub-elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #5a8a5e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Medusa, sub-elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #5a8a5e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Medusa, sub-elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #5a8a5e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Medusa, sub-elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #5a8a5e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Medusa, sub-elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #5a8a5e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Medusa, sub-elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #5a8a5e. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/enemies/laberinto/medusa/walk-strip.png`

## B601 — Acechador Ciego (mn_acechador, subelite, arena minas)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-mn_acechador`** — Acechador Ciego (mn_acechador, subelite, arena minas). Enemigo subelite de la arena minas. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Una criatura adaptada por completo a la oscuridad. No tiene ojos: no le hacen falta. Comportamiento: A OSCURAS se oculta (solo se le ven los ojos) y caza al guardián que quedó aislado en la sombra. En la luz se lo ve y busca volver a la oscuridad. Ataques: Emboscada: marca el lugar (círculo violeta con !) y salta, Garras. Detalle y prompts por estado en enemigos/minas.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/minas/mn_acechador/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Acechador Ciego, sub-elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c0a8a0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Acechador Ciego, sub-elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c0a8a0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Acechador Ciego, sub-elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #c0a8a0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Acechador Ciego, sub-elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #c0a8a0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Acechador Ciego, sub-elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c0a8a0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Acechador Ciego, sub-elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #c0a8a0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Acechador Ciego, sub-elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #c0a8a0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Acechador Ciego, sub-elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c0a8a0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Acechador Ciego, sub-elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #c0a8a0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/abismo/ab_errante/atlas.png`

## B602 — Escupidor de Oscuridad (mn_escupidor, subelite, arena minas)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-mn_escupidor`** — Escupidor de Oscuridad (mn_escupidor, subelite, arena minas). Enemigo subelite de la arena minas. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Expulsa masa de oscuridad. Donde cae, la luz se muere un rato. Comportamiento: A distancia; mantiene la distancia. Ataques: Bola oscura (aviso de línea): crea una ZONA DE OSCURIDAD donde cae, Apaga la antorcha del guardián que golpea. Detalle y prompts por estado en enemigos/minas.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/minas/mn_escupidor/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Escupidor de Oscuridad, sub-elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8030c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Escupidor de Oscuridad, sub-elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8030c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Escupidor de Oscuridad, sub-elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #8030c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Escupidor de Oscuridad, sub-elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8030c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Escupidor de Oscuridad, sub-elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8030c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Escupidor de Oscuridad, sub-elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #8030c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Escupidor de Oscuridad, sub-elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #8030c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Escupidor de Oscuridad, sub-elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8030c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Escupidor de Oscuridad, sub-elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #8030c0. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B603 — Peregrino Enraizado (peregrino, subelite, arena micelial)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-peregrino`** — Peregrino Enraizado (peregrino, subelite, arena micelial). Enemigo subelite de la arena micelial. Estados que el motor rellena clonando/espejando en vez de dibujar: 5 de 11 (walk_D, walk_U, attack_D, attack_U, hit_D). Criatura: Peregrinos que buscaban un santuario en las cavernas. Echaron raíces en el camino, literalmente. Comportamiento: Camina disparando poco… hasta que se planta. Ataques: Disparo de esporas, Plantado: dispara más lejos, más seguido y más fuerte. Detalle y prompts por estado en enemigos/micelial.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/micelial/peregrino/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Peregrino Enraizado, sub-elite enemy), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #80c040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Peregrino Enraizado, sub-elite enemy), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #80c040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Peregrino Enraizado, sub-elite enemy), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #80c040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Peregrino Enraizado, sub-elite enemy), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #80c040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Peregrino Enraizado, sub-elite enemy), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #80c040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Peregrino Enraizado, sub-elite enemy), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #80c040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Peregrino Enraizado, sub-elite enemy), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #80c040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Peregrino Enraizado, sub-elite enemy), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #80c040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Peregrino Enraizado, sub-elite enemy), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #80c040. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/arenas/ciudad/cm_verdugo/atlas.png`

## B604 — Hechicero Supremo (hechicero_supremo, subjefe, arena infernal)  
*Prioridad P2 · PENDIENTE*

- **`C-ENEMY-hechicero_supremo`** — Hechicero Supremo (hechicero_supremo, subjefe, arena infernal). Enemigo subjefe de la arena infernal. Estados que el motor rellena clonando/espejando en vez de dibujar: 4 de 11 (walk_U, attack_D, attack_U, hit_D). Criatura: — Comportamiento: — Ataques: —. Detalle y prompts por estado en enemigos/infernal.md.
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/enemigos/infernal/hechicero_supremo/atlas.png`.
  - Formato: Mantener el diseño; densidad canon ≈1,0 u/px (banda 0,45–2,4). Pedir hoja COMPLETA (no cuadros sueltos): idle 4, walk de perfil 4–6 + walk de frente y de espalda (4–6 c/u), ataque de perfil/frente/espalda (3–4), golpe 2 (perfil y frente), muerte 4–6, más las poses de habilidad propias del tipo. Atlas PNG RGBA, celdas iguales, 8 columnas, pies en la fila anchor×alto de la celda, perfil mirando a la DERECHA (la izquierda la espeja el juego), alfa 0/255, contorno 1 px.
  - Prompt: `idle: Pixel art game enemy sprite of the creature in @codex (Hechicero Supremo, mini-boss), redrawn in the pose of @pose (standing idle, guard stance), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #e8c27a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_side: Pixel art game enemy sprite of the creature in @codex (Hechicero Supremo, mini-boss), redrawn in the pose of @pose (walk cycle, side profile, mid-stride), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #e8c27a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_down: Pixel art game enemy sprite of the creature in @codex (Hechicero Supremo, mini-boss), redrawn in the pose of @pose (walk cycle facing the camera, mid-stride), facing the camera. Keep the @codex design and palette exactly. Dominant color #e8c27a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `walk_up: Pixel art game enemy sprite of the creature in @codex (Hechicero Supremo, mini-boss), redrawn in the pose of @pose (walk cycle seen from behind, mid-stride), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #e8c27a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_side: Pixel art game enemy sprite of the creature in @codex (Hechicero Supremo, mini-boss), redrawn in the pose of @pose (attack strike in side profile, the creature's signature attack at full extension), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #e8c27a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_down: Pixel art game enemy sprite of the creature in @codex (Hechicero Supremo, mini-boss), redrawn in the pose of @pose (attack strike facing the camera at full extension), facing the camera. Keep the @codex design and palette exactly. Dominant color #e8c27a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `atk_up: Pixel art game enemy sprite of the creature in @codex (Hechicero Supremo, mini-boss), redrawn in the pose of @pose (attack strike seen from behind at full extension), seen from behind (back to the camera). Keep the @codex design and palette exactly. Dominant color #e8c27a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `hit: Pixel art game enemy sprite of the creature in @codex (Hechicero Supremo, mini-boss), redrawn in the pose of @pose (hurt reaction, recoiling backward), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #e8c27a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Prompt: `death: Pixel art game enemy sprite of the creature in @codex (Hechicero Supremo, mini-boss), redrawn in the pose of @pose (death, collapsing and falling to the ground), in side profile facing right. Keep the @codex design and palette exactly. Dominant color #e8c27a. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, no text, no effects, plain dark background.`
  - Referencias: `assets/sprites/bosses/bosque/doblador_guerrero/v2/atlas.png`

## B609 — A-20 Dragón de la Forja huyendo herido  
*Prioridad P2 · PENDIENTE*

- **`C-FORMA-dragon_huida`** — Forma/transformación de jefe. A-20 Dragón de la Forja huyendo herido. Forma/pieza de jefe (fuente: LA_HORDA_MISSING_ASSETS.md / LA_HORDA_COMBAT_MISSING_ASSETS.md / LA_HORDA_CODEX_MISSING_ASSETS.md; código: js/arenas/fortaleza/fort-bosses.js).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/jefes/dragon_huida/`.
  - Formato: Celda del dragón, 6 cuadros. PNG RGBA, alfa 0/255, vecino más cercano; atlas por animación, píxel nativo ≈1,0 u/px.
  - Prompt: `Pixel art boss form sprite, A-20 Dragón de la Forja huyendo herido, large, facing the camera, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/arenas/fortaleza/dragon_forja/atlas.png`

## B610 — A-19 Escudo de raíces del Guardián Ancestral  
*Prioridad P2 · PENDIENTE*

- **`C-FORMA-escudo_raices`** — Forma/transformación de jefe. A-19 Escudo de raíces del Guardián Ancestral. Forma/pieza de jefe (fuente: LA_HORDA_MISSING_ASSETS.md / LA_HORDA_COMBAT_MISSING_ASSETS.md / LA_HORDA_CODEX_MISSING_ASSETS.md; código: js/arenas).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/jefes/escudo_raices/`.
  - Formato: 128×128, bucle 6. PNG RGBA, alfa 0/255, vecino más cercano; atlas por animación, píxel nativo ≈1,0 u/px.
  - Prompt: `Pixel art boss form sprite, A-19 Escudo de raíces del Guardián Ancestral, large, facing the camera, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/sprites/bosses/hielo/mago_hielo_cristal/v2/atlas.png`

## B611 — A-15 Fisura de la Horda (abrir 6, 3 etapas ×4, sellada) y sigilos HORDA/VIDA/PIEL  
*Prioridad P2 · PENDIENTE*

- **`D-MEC-A-15`** — Objeto de equipo (ícono y/o sprite). A-15 Fisura de la Horda (abrir 6, 3 etapas ×4, sellada) y sigilos HORDA/VIDA/PIEL. Mecánica/regla de jefe de la arena infernal hoy dibujada por código o con arte prestado (fuente: LA_HORDA_MISSING_ASSETS.md).
  - Método: runway + pintor. Entrega: `art-source/entregas/2026-10_mundo/arenas/infernal/fisura_sigilos.png`.
  - Formato: Fisura 96×48; sigilo 32×32 ×3 (6 cuadros). PNG RGBA, alfa 0/255, vecino más cercano, píxel nativo, loops sin costura.
  - Prompt: `Pixel art game item icon, A-15 Fisura de la Horda (abrir 6, 3 etapas ×4, sellada) y sigilos HORDA/VIDA/PIEL, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.`
  - Referencias: `assets/vfx/skins/manada/sigil_0.png`

