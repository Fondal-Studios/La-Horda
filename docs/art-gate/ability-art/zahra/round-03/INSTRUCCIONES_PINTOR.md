# Ronda 3 — instrucciones del Evaluador al Pintor

### furnace
- cobertura alta (77%): bajar el relleno para no tapar al enemigo  → perilla `fill`: -0.06
- menos marcas  → perilla `ticks`: -4
- marcas más cortas  → perilla `tick_len`: -0.04
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- borde más fino: la cobertura es excesiva  → perilla `rim`: -1
- menos chispas  → perilla `sparks`: -2
- quitar el glifo: la cobertura es excesiva  → perilla `glyph_on`: fijar 0
- estelas más finas  → perilla `thick`: -1
- el centro está cargado (72%): despejar el relleno  → perilla `fill`: -0.09
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- glifo más chico  → perilla `glyph_scale`: fijar 1
- menos chispas: tapan el centro  → perilla `sparks`: -2
- menos marcas: tapan el centro  → perilla `ticks`: -2
- quitar el glifo: no cabe en una zona tan chica  → perilla `glyph_on`: fijar 0
- estelas más finas: tapan el centro  → perilla `thick`: -1
- menos estelas  → perilla `ticks`: -2
- agregar destellos brillantes (tono 5)  → perilla `sparks`: +2
- el arte actual tiene más trama interior: sumar marcas propias  → perilla `ticks`: +4
- el arte actual tiene más presencia central: glifo más grande  → perilla `glyph_scale`: +1
- probar otra familia de marcas  → perilla `deco`: pasar a la siguiente familia
- el arte actual cubre mejor la zona: ajustar el relleno  → perilla `fill`: -0.03
- el arte actual cubre mejor la zona: menos chispas  → perilla `sparks`: -2
  aplicado: fill: 0.09 → 0.06; fill: 0.06 → 0.0; ticks: 14 → 12; ticks: 12 → 10; ticks: 10 → 8; tick_len: 0.12 → 0.08; sparks: 1 → 0; glyph_scale: 2 → 1; deco: 0 → 1
