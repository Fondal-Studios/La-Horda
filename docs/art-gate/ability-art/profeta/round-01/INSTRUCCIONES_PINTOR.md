# Ronda 1 — instrucciones del Evaluador al Pintor

### stun
- el filo exterior no está contorneado en 33% del perímetro: engrosar el borde para que el contorno oscuro de 1 px cierre  → perilla `rim`: +1
- cobertura alta (75%): bajar el relleno para no tapar al enemigo  → perilla `fill`: -0.06
- menos marcas  → perilla `ticks`: -4
- marcas más cortas  → perilla `tick_len`: -0.04
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- borde más fino: la cobertura es excesiva  → perilla `rim`: -1
- menos chispas  → perilla `sparks`: -2
- quitar el glifo: la cobertura es excesiva  → perilla `glyph_on`: fijar 0
- se parece demasiado a otra habilidad del guardián (distancia 0.16): cambiar el tipo de marca  → perilla `deco`: +1
- segundo anillo para distinguirla  → perilla `inner_ring`: fijar 1
- el arte actual cubre mejor la zona: ajustar el relleno  → perilla `fill`: -0.03
- el arte actual cubre mejor la zona: menos chispas  → perilla `sparks`: -2
- activar el motivo temático del guardián (el arte actual lo tiene)  → perilla `motif_on`: fijar 1
- el arte actual tiene más trama temática: motivo más denso  → perilla `motif_n`: +1
  aplicado: rim: 2 → 1; fill: 0.14 → 0.09; fill: 0.09 → 0.06; ticks: 8 → 4; tick_len: 0.16 → 0.12; sparks: 4 → 2; sparks: 2 → 0; glyph_on: 1 → 0; deco: 0 → 1; motif_n: 5 → 6
