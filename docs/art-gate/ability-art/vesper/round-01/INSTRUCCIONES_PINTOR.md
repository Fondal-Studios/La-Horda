# Ronda 1 — instrucciones del Evaluador al Pintor

### needles
- cobertura alta (55%): bajar el relleno para no tapar al enemigo  → perilla `fill`: -0.06
- menos marcas  → perilla `ticks`: -4
- marcas más cortas  → perilla `tick_len`: -0.04
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- borde más fino: la cobertura es excesiva  → perilla `rim`: -1
- menos chispas  → perilla `sparks`: -2
- estelas más finas  → perilla `thick`: -1
- el arte actual cubre mejor la zona: ajustar el relleno  → perilla `fill`: -0.03
- el arte actual cubre mejor la zona: menos chispas  → perilla `sparks`: -2
- activar el motivo temático del guardián (el arte actual lo tiene)  → perilla `motif_on`: fijar 1
- el arte actual tiene más trama temática: motivo más denso  → perilla `motif_n`: +1
  aplicado: fill: 0.12 → 0.06; fill: 0.06 → 0.03; ticks: 10 → 6; tick_len: 0.16 → 0.12; rim: 2 → 1; sparks: 4 → 2; sparks: 2 → 0; motif_n: 5 → 6

### last_stitch
- cobertura alta (54%): bajar el relleno para no tapar al enemigo  → perilla `fill`: -0.06
- menos marcas  → perilla `ticks`: -4
- marcas más cortas  → perilla `tick_len`: -0.04
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- borde más fino: la cobertura es excesiva  → perilla `rim`: -1
- menos chispas  → perilla `sparks`: -2
- se parece demasiado a otra habilidad del guardián (distancia 0.05): cambiar el tipo de marca  → perilla `deco`: +1
- segundo anillo para distinguirla  → perilla `inner_ring`: fijar 1
- el arte actual cubre mejor la zona: ajustar el relleno  → perilla `fill`: -0.03
- el arte actual cubre mejor la zona: menos chispas  → perilla `sparks`: -2
- activar el motivo temático del guardián (el arte actual lo tiene)  → perilla `motif_on`: fijar 1
- el arte actual tiene más trama temática: motivo más denso  → perilla `motif_n`: +1
  aplicado: fill: 0.14 → 0.09; fill: 0.09 → 0.06; ticks: 14 → 10; tick_len: 0.16 → 0.12; rim: 3 → 2; sparks: 4 → 2; sparks: 2 → 0; motif_n: 5 → 6
