# Ronda 1 — instrucciones del Evaluador al Pintor

### slash
- cobertura alta (58%): bajar el relleno para no tapar al enemigo  → perilla `fill`: -0.06
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
  aplicado: fill: 0.14 → 0.09; fill: 0.09 → 0.06; ticks: 8 → 4; tick_len: 0.16 → 0.12; rim: 2 → 1; sparks: 4 → 2; sparks: 2 → 0; motif_n: 5 → 6

### dash
- se parece demasiado a otra habilidad del guardián (distancia 0.00): cambiar el tipo de marca  → perilla `deco`: +1
- segundo anillo para distinguirla  → perilla `inner_ring`: fijar 1
- no supera al arte actual: ganar presencia en el borde  → perilla `rim`: +1
- no supera al arte actual: más destellos de luz  → perilla `sparks`: +2
- el arte actual zigzaguea (relámpago, hilo, tinta): dar forma irregular al rayo  → perilla `wave`: +1
- mayor amplitud de la ondulación  → perilla `wave_amp`: +1
  aplicado: deco: 0 → 1; inner_ring: 0 → 1; rim: 2 → 3; sparks: 4 → 6; wave: 0 → 1; wave_amp: 2 → 3
