# Ronda 1 — instrucciones del Evaluador al Pintor

### needles
- cobertura alta (55%): bajar el relleno para no tapar al enemigo  → perilla `fill`: -0.06
- menos marcas  → perilla `ticks`: -4
- marcas más cortas  → perilla `tick_len`: -0.04
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- borde más fino: la cobertura es excesiva  → perilla `rim`: -1
- menos chispas  → perilla `sparks`: -2
- estelas más finas  → perilla `thick`: -1
- agregar destellos brillantes (tono 5)  → perilla `sparks`: +2
- el arte actual tiene más trama interior: sumar marcas propias  → perilla `ticks`: +4
- el arte actual tiene más presencia central: glifo más grande  → perilla `glyph_scale`: +1
- probar otra familia de marcas  → perilla `deco`: pasar a la siguiente familia
- el arte actual cubre mejor la zona: ajustar el relleno  → perilla `fill`: -0.03
- el arte actual cubre mejor la zona: menos chispas  → perilla `sparks`: -2
  aplicado: fill: 0.12 → 0.06; fill: 0.06 → 0.03; ticks: 10 → 6; tick_len: 0.16 → 0.12; rim: 2 → 1; sparks: 4 → 2; glyph_scale: 1 → 2; deco: 2 → 0

### last_stitch
- se parece demasiado a otra habilidad del guardián (distancia 0.05): cambiar el tipo de marca  → perilla `deco`: +1
- segundo anillo para distinguirla  → perilla `inner_ring`: fijar 1
- el arte actual cubre mejor la zona: ajustar el relleno  → perilla `fill`: -0.03
- el arte actual cubre mejor la zona: menos chispas  → perilla `sparks`: -2
  aplicado: inner_ring: 0 → 1; fill: 0.14 → 0.12; sparks: 4 → 2

### stitch_zone
- poco detalle interior (3%): más marcas propias (estelas, hilos, runas)  → perilla `ticks`: +4
- marcas más largas  → perilla `tick_len`: +0.04
- el arte actual tiene más trama interior: sumar marcas propias  → perilla `ticks`: +4
- el arte actual tiene más presencia central: glifo más grande  → perilla `glyph_scale`: +1
- probar otra familia de marcas  → perilla `deco`: pasar a la siguiente familia
  aplicado: ticks: 8 → 12; ticks: 12 → 16; tick_len: 0.16 → 0.2; glyph_scale: 1 → 2; deco: 1 → 2
