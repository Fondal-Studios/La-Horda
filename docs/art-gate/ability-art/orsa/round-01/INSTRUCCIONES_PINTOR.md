# Ronda 1 — instrucciones del Evaluador al Pintor

### pierce
- el arte actual zigzaguea (relámpago, hilo, tinta): dar forma irregular al rayo  → perilla `wave`: +1
- mayor amplitud de la ondulación  → perilla `wave_amp`: +1
  aplicado: wave_amp: 2 → 3

### discharge
- cobertura alta (53%): bajar el relleno para no tapar al enemigo  → perilla `fill`: -0.06
- menos marcas  → perilla `ticks`: -4
- marcas más cortas  → perilla `tick_len`: -0.04
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- borde más fino: la cobertura es excesiva  → perilla `rim`: -1
- menos chispas  → perilla `sparks`: -2
- se parece demasiado a otra habilidad del guardián (distancia 0.14): cambiar el tipo de marca  → perilla `deco`: +1
- segundo anillo para distinguirla  → perilla `inner_ring`: fijar 1
- el arte actual cubre mejor la zona: ajustar el relleno  → perilla `fill`: -0.03
- el arte actual cubre mejor la zona: menos chispas  → perilla `sparks`: -2
- activar el motivo temático del guardián (el arte actual lo tiene)  → perilla `motif_on`: fijar 1
- el arte actual tiene más trama temática: motivo más denso  → perilla `motif_n`: +1
  aplicado: fill: 0.14 → 0.09; fill: 0.09 → 0.06; ticks: 12 → 8; tick_len: 0.16 → 0.12; rim: 2 → 1; sparks: 4 → 2; sparks: 2 → 0; motif_n: 5 → 6

### brace
- el filo exterior no está contorneado en 33% del perímetro: engrosar el borde para que el contorno oscuro de 1 px cierre  → perilla `rim`: +1
- cobertura alta (81%): bajar el relleno para no tapar al enemigo  → perilla `fill`: -0.06
- menos marcas  → perilla `ticks`: -4
- marcas más cortas  → perilla `tick_len`: -0.04
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- borde más fino: la cobertura es excesiva  → perilla `rim`: -1
- menos chispas  → perilla `sparks`: -2
- quitar el glifo: la cobertura es excesiva  → perilla `glyph_on`: fijar 0
- el centro está cargado (66%): despejar el relleno  → perilla `fill`: -0.09
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- glifo más chico  → perilla `glyph_scale`: fijar 1
- menos chispas: tapan el centro  → perilla `sparks`: -2
- menos marcas: tapan el centro  → perilla `ticks`: -2
- quitar el glifo: no cabe en una zona tan chica  → perilla `glyph_on`: fijar 0
- se parece demasiado a otra habilidad del guardián (distancia 0.14): cambiar el tipo de marca  → perilla `deco`: +1
- segundo anillo para distinguirla  → perilla `inner_ring`: fijar 1
- activar el motivo temático del guardián (el arte actual lo tiene)  → perilla `motif_on`: fijar 1
- el arte actual tiene más trama temática: motivo más denso  → perilla `motif_n`: +1
- el arte actual tiene más trama interior: sumar marcas propias  → perilla `ticks`: +4
- el arte actual tiene más presencia central: glifo más grande  → perilla `glyph_scale`: +1
- probar otra familia de marcas  → perilla `deco`: pasar a la siguiente familia
  aplicado: rim: 2 → 1; fill: 0.14 → 0.09; fill: 0.09 → 0.0; ticks: 8 → 4; ticks: 4 → 2; tick_len: 0.16 → 0.12; sparks: 4 → 2; sparks: 2 → 0; glyph_on: 1 → 0; deco: 0 → 1; deco: 1 → 2; motif_n: 5 → 6

### anchor_zone
- el filo exterior no está contorneado en 29% del perímetro: engrosar el borde para que el contorno oscuro de 1 px cierre  → perilla `rim`: +1
- cobertura alta (63%): bajar el relleno para no tapar al enemigo  → perilla `fill`: -0.06
- menos marcas  → perilla `ticks`: -4
- marcas más cortas  → perilla `tick_len`: -0.04
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- borde más fino: la cobertura es excesiva  → perilla `rim`: -1
- menos chispas  → perilla `sparks`: -2
- quitar el glifo: la cobertura es excesiva  → perilla `glyph_on`: fijar 0
- se parece demasiado a otra habilidad del guardián (distancia 0.15): cambiar el tipo de marca  → perilla `deco`: +1
- segundo anillo para distinguirla  → perilla `inner_ring`: fijar 1
- activar el motivo temático del guardián (el arte actual lo tiene)  → perilla `motif_on`: fijar 1
- el arte actual tiene más trama temática: motivo más denso  → perilla `motif_n`: +1
- el arte actual tiene más trama interior: sumar marcas propias  → perilla `ticks`: +4
- el arte actual tiene más presencia central: glifo más grande  → perilla `glyph_scale`: +1
- probar otra familia de marcas  → perilla `deco`: pasar a la siguiente familia
- el arte actual cubre mejor la zona: ajustar el relleno  → perilla `fill`: -0.03
- el arte actual cubre mejor la zona: menos chispas  → perilla `sparks`: -2
- activar el motivo temático del guardián (el arte actual lo tiene)  → perilla `motif_on`: fijar 1
- el arte actual tiene más trama temática: motivo más denso  → perilla `motif_n`: +1
  aplicado: rim: 2 → 1; fill: 0.14 → 0.09; fill: 0.09 → 0.06; ticks: 8 → 4; tick_len: 0.16 → 0.12; sparks: 4 → 2; sparks: 2 → 0; glyph_on: 1 → 0; deco: 1 → 2; deco: 2 → 0; motif_n: 5 → 6; motif_n: 6 → 7; glyph_scale: 1 → 2

### sweep
- el arte actual tiene más cuerpo: subir el relleno trameado (techo del motor 24 %)  → perilla `fill`: +0.06
- el arte actual tiene más trama: sumar marcas  → perilla `ticks`: +2
- el arte actual tiene más presencia: borde más grueso  → perilla `rim`: +1
  aplicado: fill: 0.14 → 0.21; ticks: 10 → 12; rim: 2 → 3
