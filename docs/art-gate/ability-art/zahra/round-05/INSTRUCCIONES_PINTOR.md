# Ronda 5 — instrucciones del Evaluador al Pintor

### furnace
- cobertura alta (59%): bajar el relleno para no tapar al enemigo  → perilla `fill`: -0.06
- menos marcas  → perilla `ticks`: -4
- marcas más cortas  → perilla `tick_len`: -0.04
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- borde más fino: la cobertura es excesiva  → perilla `rim`: -1
- menos chispas  → perilla `sparks`: -2
- estelas más finas  → perilla `thick`: -1
- el centro está cargado (77%): despejar el relleno  → perilla `fill`: -0.09
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- glifo más chico  → perilla `glyph_scale`: fijar 1
- menos chispas: tapan el centro  → perilla `sparks`: -2
- menos marcas: tapan el centro  → perilla `ticks`: -2
- quitar el glifo: no cabe en una zona tan chica  → perilla `glyph_on`: fijar 0
- estelas más finas: tapan el centro  → perilla `thick`: -1
- menos estelas  → perilla `ticks`: -2
- activar el motivo temático del guardián (el arte actual lo tiene)  → perilla `motif_on`: fijar 1
- el arte actual tiene más trama temática: motivo más denso  → perilla `motif_n`: +1
- el arte actual tiene más trama interior: sumar marcas propias  → perilla `ticks`: +4
- el arte actual tiene más presencia central: glifo más grande  → perilla `glyph_scale`: +1
- probar otra familia de marcas  → perilla `deco`: pasar a la siguiente familia
  aplicado: deco: 0 → 1

### vent_zone
- cobertura alta (53%): bajar el relleno para no tapar al enemigo  → perilla `fill`: -0.06
- menos marcas  → perilla `ticks`: -4
- marcas más cortas  → perilla `tick_len`: -0.04
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- borde más fino: la cobertura es excesiva  → perilla `rim`: -1
- menos chispas  → perilla `sparks`: -2
- activar el motivo temático del guardián (el arte actual lo tiene)  → perilla `motif_on`: fijar 1
- el arte actual tiene más trama temática: motivo más denso  → perilla `motif_n`: +1
- el arte actual tiene más trama interior: sumar marcas propias  → perilla `ticks`: +4
- el arte actual tiene más presencia central: glifo más grande  → perilla `glyph_scale`: +1
- probar otra familia de marcas  → perilla `deco`: pasar a la siguiente familia
- el arte actual cubre mejor la zona: ajustar el relleno  → perilla `fill`: -0.03
- el arte actual cubre mejor la zona: menos chispas  → perilla `sparks`: -2
- activar el motivo temático del guardián (el arte actual lo tiene)  → perilla `motif_on`: fijar 1
- el arte actual tiene más trama temática: motivo más denso  → perilla `motif_n`: +1
  aplicado: fill: 0.06 → 0.0; ticks: 16 → 14; tick_len: 0.12 → 0.08; deco: 2 → 0
