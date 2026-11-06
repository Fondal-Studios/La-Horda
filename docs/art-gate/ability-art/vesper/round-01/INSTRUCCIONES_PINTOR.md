# Ronda 1 — instrucciones del Evaluador al Pintor

### needles
- cobertura alta (55%): bajar el relleno para no tapar al enemigo  → perilla `fill`: -0.06
- menos marcas  → perilla `ticks`: -4
- marcas más cortas  → perilla `tick_len`: -0.04
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- borde más fino: la cobertura es excesiva  → perilla `rim`: -1
- estelas más finas  → perilla `thick`: -1
- el centro está cargado (41%): despejar el relleno  → perilla `fill`: -0.09
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- glifo más chico  → perilla `glyph_scale`: fijar 1
- estelas más finas: tapan el centro  → perilla `thick`: -1
- menos estelas  → perilla `ticks`: -2
- agregar destellos brillantes (tono 5)  → perilla `sparks`: +2
- el arte actual tiene más trama interior: sumar marcas propias  → perilla `ticks`: +4
- el arte actual tiene más presencia central: glifo más grande  → perilla `glyph_scale`: +1
- probar otra familia de marcas (rayos largos)  → perilla `deco`: fijar 2
  aplicado: fill: 0.12 → 0.06; ticks: 10 → 6; tick_len: 0.16 → 0.12; rim: 2 → 1; fill: 0.06 → 0.0; ticks: 6 → 4; sparks: 4 → 6; ticks: 4 → 8; glyph_scale: 1 → 2

### unpick
- cobertura alta (44%): bajar el relleno para no tapar al enemigo  → perilla `fill`: -0.06
- menos marcas  → perilla `ticks`: -4
- marcas más cortas  → perilla `tick_len`: -0.04
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- borde más fino: la cobertura es excesiva  → perilla `rim`: -1
- se parece demasiado a otra habilidad del guardián (distancia 0.06): cambiar el tipo de marca  → perilla `deco`: +1
- segundo anillo para distinguirla  → perilla `inner_ring`: fijar 1
  aplicado: fill: 0.14 → 0.09; ticks: 8 → 4; tick_len: 0.16 → 0.12; rim: 2 → 1; deco: 0 → 1; inner_ring: 0 → 1

### last_stitch
- cobertura alta (54%): bajar el relleno para no tapar al enemigo  → perilla `fill`: -0.06
- menos marcas  → perilla `ticks`: -4
- marcas más cortas  → perilla `tick_len`: -0.04
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- borde más fino: la cobertura es excesiva  → perilla `rim`: -1
- el centro está cargado (40%): despejar el relleno  → perilla `fill`: -0.09
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- glifo más chico  → perilla `glyph_scale`: fijar 1
- se parece demasiado a otra habilidad del guardián (distancia 0.06): cambiar el tipo de marca  → perilla `deco`: +1
- segundo anillo para distinguirla  → perilla `inner_ring`: fijar 1
  aplicado: fill: 0.14 → 0.09; ticks: 14 → 10; tick_len: 0.16 → 0.12; rim: 3 → 2; fill: 0.09 → 0.0; inner_ring: 0 → 1

### stitch_zone
- poco detalle interior (3%): más marcas propias (estelas, hilos, runas)  → perilla `ticks`: +4
- marcas más largas  → perilla `tick_len`: +0.04
- el arte actual tiene más trama interior: sumar marcas propias  → perilla `ticks`: +4
- el arte actual tiene más presencia central: glifo más grande  → perilla `glyph_scale`: +1
- probar otra familia de marcas (rayos largos)  → perilla `deco`: fijar 2
  aplicado: ticks: 8 → 12; tick_len: 0.16 → 0.2; ticks: 12 → 16; glyph_scale: 1 → 2; deco: 1 → 2
