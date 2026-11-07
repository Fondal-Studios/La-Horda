# Ronda 3 — instrucciones del Evaluador al Pintor

### spin_idle
- cobertura alta (57%): bajar el relleno para no tapar al enemigo  → perilla `fill`: -0.06
- menos marcas  → perilla `ticks`: -4
- marcas más cortas  → perilla `tick_len`: -0.04
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- borde más fino: la cobertura es excesiva  → perilla `rim`: -1
- menos chispas  → perilla `sparks`: -2
- el centro está cargado (60%): despejar el relleno  → perilla `fill`: -0.09
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- glifo más chico  → perilla `glyph_scale`: fijar 1
- menos chispas: tapan el centro  → perilla `sparks`: -2
- menos marcas: tapan el centro  → perilla `ticks`: -2
- quitar el glifo: no cabe en una zona tan chica  → perilla `glyph_on`: fijar 0
- se parece demasiado a otra habilidad del guardián (distancia 0.05): cambiar el tipo de marca  → perilla `deco`: +1
- segundo anillo para distinguirla  → perilla `inner_ring`: fijar 1
- no supera al arte actual: ganar presencia en el borde  → perilla `rim`: +1
- no supera al arte actual: más destellos de luz  → perilla `sparks`: +2
- activar el motivo temático del guardián (el arte actual lo tiene)  → perilla `motif_on`: fijar 1
- el arte actual tiene más trama temática: motivo más denso  → perilla `motif_n`: +1
- el arte actual tiene más trama interior: sumar marcas propias  → perilla `ticks`: +4
- el arte actual tiene más presencia central: glifo más grande  → perilla `glyph_scale`: +1
- probar otra familia de marcas  → perilla `deco`: pasar a la siguiente familia
- el arte actual cubre mejor la zona: ajustar el relleno  → perilla `fill`: -0.03
- el arte actual cubre mejor la zona: menos chispas  → perilla `sparks`: -2
- activar el motivo temático del guardián (el arte actual lo tiene)  → perilla `motif_on`: fijar 1
- el arte actual tiene más trama temática: motivo más denso  → perilla `motif_n`: +1
  aplicado: ticks: 4 → 2; ticks: 2 → 0; tick_len: 0.12 → 0.08; inner_ring: 1 → 0; glyph_scale: 2 → 1; deco: 0 → 1; deco: 1 → 2; motif_n: 8 → 9; motif_n: 9 → 10
