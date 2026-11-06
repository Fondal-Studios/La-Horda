# Ronda 1 — instrucciones del Evaluador al Pintor

### furnace
- cobertura alta (67%): bajar el relleno para no tapar al enemigo  → perilla `fill`: -0.06
- menos marcas  → perilla `ticks`: -4
- marcas más cortas  → perilla `tick_len`: -0.04
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- borde más fino: la cobertura es excesiva  → perilla `rim`: -1
- menos chispas  → perilla `sparks`: -2
- quitar el glifo: la cobertura es excesiva  → perilla `glyph_on`: fijar 0
- estelas más finas  → perilla `thick`: -1
- el centro está cargado (56%): despejar el relleno  → perilla `fill`: -0.09
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- glifo más chico  → perilla `glyph_scale`: fijar 1
- menos chispas: tapan el centro  → perilla `sparks`: -2
- menos marcas: tapan el centro  → perilla `ticks`: -2
- quitar el glifo: no cabe en una zona tan chica  → perilla `glyph_on`: fijar 0
- estelas más finas: tapan el centro  → perilla `thick`: -1
- menos estelas  → perilla `ticks`: -2
- agregar destellos brillantes (tono 5)  → perilla `sparks`: +2
- el arte actual cubre mejor la zona: ajustar el relleno  → perilla `fill`: -0.03
- el arte actual cubre mejor la zona: menos chispas  → perilla `sparks`: -2
  aplicado: fill: 0.14 → 0.09; fill: 0.09 → 0.0; ticks: 10 → 6; ticks: 6 → 4; ticks: 4 → 2; tick_len: 0.16 → 0.12; rim: 2 → 1; sparks: 4 → 2; sparks: 2 → 0; glyph_on: 1 → 0

### vent
- cobertura alta (53%): bajar el relleno para no tapar al enemigo  → perilla `fill`: -0.06
- menos marcas  → perilla `ticks`: -4
- marcas más cortas  → perilla `tick_len`: -0.04
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- borde más fino: la cobertura es excesiva  → perilla `rim`: -1
- menos chispas  → perilla `sparks`: -2
- se parece demasiado a otra habilidad del guardián (distancia 0.05): cambiar el tipo de marca  → perilla `deco`: +1
- segundo anillo para distinguirla  → perilla `inner_ring`: fijar 1
- el arte actual cubre mejor la zona: ajustar el relleno  → perilla `fill`: -0.03
- el arte actual cubre mejor la zona: menos chispas  → perilla `sparks`: -2
  aplicado: fill: 0.14 → 0.09; fill: 0.09 → 0.06; ticks: 12 → 8; tick_len: 0.16 → 0.12; rim: 3 → 2; sparks: 4 → 2; sparks: 2 → 0

### vent_zone
- poco detalle interior (3%): más marcas propias (estelas, hilos, runas)  → perilla `ticks`: +4
- marcas más largas  → perilla `tick_len`: +0.04
- el arte actual tiene más trama interior: sumar marcas propias  → perilla `ticks`: +4
- el arte actual tiene más presencia central: glifo más grande  → perilla `glyph_scale`: +1
- probar otra familia de marcas  → perilla `deco`: pasar a la siguiente familia
  aplicado: ticks: 8 → 12; ticks: 12 → 16; tick_len: 0.16 → 0.2; glyph_scale: 1 → 2; deco: 1 → 2
