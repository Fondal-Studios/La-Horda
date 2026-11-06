# Ronda 1 — instrucciones del Evaluador al Pintor

### gaze
- cobertura alta (75%): bajar el relleno para no tapar al enemigo  → perilla `fill`: -0.06
- menos marcas  → perilla `ticks`: -4
- marcas más cortas  → perilla `tick_len`: -0.04
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- borde más fino: la cobertura es excesiva  → perilla `rim`: -1
- menos chispas  → perilla `sparks`: -2
- quitar el glifo: la cobertura es excesiva  → perilla `glyph_on`: fijar 0
- estelas más finas  → perilla `thick`: -1
- el centro está cargado (60%): despejar el relleno  → perilla `fill`: -0.09
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- glifo más chico  → perilla `glyph_scale`: fijar 1
- menos chispas: tapan el centro  → perilla `sparks`: -2
- menos marcas: tapan el centro  → perilla `ticks`: -2
- quitar el glifo: no cabe en una zona tan chica  → perilla `glyph_on`: fijar 0
- estelas más finas: tapan el centro  → perilla `thick`: -1
- menos estelas  → perilla `ticks`: -2
- agregar destellos brillantes (tono 5)  → perilla `sparks`: +2
  aplicado: fill: 0.14 → 0.09; fill: 0.09 → 0.0; ticks: 8 → 4; ticks: 4 → 2; ticks: 2 → 0; tick_len: 0.16 → 0.12; rim: 2 → 1; sparks: 4 → 2; sparks: 2 → 0; glyph_on: 1 → 0
