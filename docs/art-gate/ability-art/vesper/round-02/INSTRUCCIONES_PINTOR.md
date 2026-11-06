# Ronda 2 — instrucciones del Evaluador al Pintor

### last_stitch
- cobertura alta (57%): bajar el relleno para no tapar al enemigo  → perilla `fill`: -0.06
- menos marcas  → perilla `ticks`: -4
- marcas más cortas  → perilla `tick_len`: -0.04
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- borde más fino: la cobertura es excesiva  → perilla `rim`: -1
- menos chispas  → perilla `sparks`: -2
- se parece demasiado a otra habilidad del guardián (distancia 0.08): cambiar el tipo de marca  → perilla `deco`: +1
- segundo anillo para distinguirla  → perilla `inner_ring`: fijar 1
- el arte actual tiene más trama interior: sumar marcas propias  → perilla `ticks`: +4
- el arte actual tiene más presencia central: glifo más grande  → perilla `glyph_scale`: +1
- probar otra familia de marcas  → perilla `deco`: pasar a la siguiente familia
- el arte actual cubre mejor la zona: ajustar el relleno  → perilla `fill`: -0.03
- el arte actual cubre mejor la zona: menos chispas  → perilla `sparks`: -2
  aplicado: fill: 0.12 → 0.06; fill: 0.06 → 0.03; ticks: 14 → 10; tick_len: 0.16 → 0.12; inner_ring: 1 → 0; rim: 3 → 2; sparks: 2 → 0; deco: 2 → 0; glyph_scale: 1 → 2
