# Ronda 2 — instrucciones del Evaluador al Pintor

### berserk_idle
- cobertura alta (56%): bajar el relleno para no tapar al enemigo  → perilla `fill`: -0.06
- menos marcas  → perilla `ticks`: -4
- marcas más cortas  → perilla `tick_len`: -0.04
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- borde más fino: la cobertura es excesiva  → perilla `rim`: -1
- menos chispas  → perilla `sparks`: -2
- el centro está cargado (50%): despejar el relleno  → perilla `fill`: -0.09
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- glifo más chico  → perilla `glyph_scale`: fijar 1
- menos chispas: tapan el centro  → perilla `sparks`: -2
- menos marcas: tapan el centro  → perilla `ticks`: -2
- se parece demasiado a otra habilidad del guardián (distancia 0.11): cambiar el tipo de marca  → perilla `deco`: +1
- segundo anillo para distinguirla  → perilla `inner_ring`: fijar 1
- el arte actual cubre mejor la zona: ajustar el relleno  → perilla `fill`: -0.03
- el arte actual cubre mejor la zona: menos chispas  → perilla `sparks`: -2
- activar el motivo temático del guardián (el arte actual lo tiene)  → perilla `motif_on`: fijar 1
- el arte actual tiene más trama temática: motivo más denso  → perilla `motif_n`: +1
  aplicado: fill: 0.15 → 0.09; fill: 0.09 → 0.0; ticks: 12 → 10; ticks: 10 → 8; tick_len: 0.16 → 0.12; inner_ring: 1 → 0; rim: 2 → 1; sparks: 4 → 2; sparks: 2 → 0; glyph_scale: 2 → 1; motif_n: 6 → 7
