# Ronda 3 — instrucciones del Evaluador al Pintor

### nova128
- el cuerpo de la zona casi no se ve (1% del interior): subir el relleno trameado  → perilla `fill`: +0.06
- más marcas internas para dar cuerpo  → perilla `ticks`: +4
- poco detalle interior (1%): más marcas propias (estelas, hilos, runas)  → perilla `ticks`: +4
- marcas más largas  → perilla `tick_len`: +0.04
- el centro está vacío: glifo propio más grande  → perilla `glyph_scale`: +1
  aplicado: tick_len: 0.16 → 0.2

### nova160
- el cuerpo de la zona casi no se ve (1% del interior): subir el relleno trameado  → perilla `fill`: +0.06
- más marcas internas para dar cuerpo  → perilla `ticks`: +4
- poco detalle interior (1%): más marcas propias (estelas, hilos, runas)  → perilla `ticks`: +4
- marcas más largas  → perilla `tick_len`: +0.04
- el centro está vacío: glifo propio más grande  → perilla `glyph_scale`: +1
  aplicado: tick_len: 0.16 → 0.2

### nova192
- cobertura baja (12%): subir el relleno trameado (techo 24 %)  → perilla `fill`: +0.06
- más marcas para que el área se lea de lejos  → perilla `ticks`: +4
- borde más grueso para ganar presencia  → perilla `rim`: +1
- el cuerpo de la zona casi no se ve (1% del interior): subir el relleno trameado  → perilla `fill`: +0.06
- más marcas internas para dar cuerpo  → perilla `ticks`: +4
- poco detalle interior (0%): más marcas propias (estelas, hilos, runas)  → perilla `ticks`: +4
- marcas más largas  → perilla `tick_len`: +0.04
- el centro está vacío: glifo propio más grande  → perilla `glyph_scale`: +1
  aplicado: tick_len: 0.16 → 0.2

### zone32
- cobertura alta (71%): bajar el relleno para no tapar al enemigo  → perilla `fill`: -0.06
- menos marcas  → perilla `ticks`: -4
- marcas más cortas  → perilla `tick_len`: -0.04
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- borde más fino: la cobertura es excesiva  → perilla `rim`: -1
- menos chispas  → perilla `sparks`: -2
- quitar el glifo: la cobertura es excesiva  → perilla `glyph_on`: fijar 0
- se parece demasiado a otra habilidad del guardián (distancia 0.07): cambiar el tipo de marca  → perilla `deco`: +1
- segundo anillo para distinguirla  → perilla `inner_ring`: fijar 1
  aplicado: ticks: 4 → 0
