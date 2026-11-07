# Ronda 1 — instrucciones del Evaluador al Pintor

### nova32
- cobertura alta (60%): bajar el relleno para no tapar al enemigo  → perilla `fill`: -0.06
- menos marcas  → perilla `ticks`: -4
- marcas más cortas  → perilla `tick_len`: -0.04
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- borde más fino: la cobertura es excesiva  → perilla `rim`: -1
- menos chispas  → perilla `sparks`: -2
- el arte actual cubre mejor la zona: ajustar el relleno  → perilla `fill`: -0.03
- el arte actual cubre mejor la zona: menos chispas  → perilla `sparks`: -2
- activar el motivo temático del guardián (el arte actual lo tiene)  → perilla `motif_on`: fijar 1
- el arte actual tiene más trama temática: motivo más denso  → perilla `motif_n`: +1
  aplicado: ticks: 12 → 8; rim: 2 → 1

### nova128
- el cuerpo de la zona casi no se ve (8% del interior): subir el relleno trameado  → perilla `fill`: +0.06
- más marcas internas para dar cuerpo  → perilla `ticks`: +4
- el pico cae en 10% de la tira: llevarlo a ~30 %  → perilla `impact_at`: fijar 0.3
- poco movimiento: el glifo debe girar en pasos de 90°  → perilla `spin`: +1
- más chispas orbitando  → perilla `sparks`: +2
- poco detalle interior (1%): más marcas propias (estelas, hilos, runas)  → perilla `ticks`: +4
- marcas más largas  → perilla `tick_len`: +0.04
- el centro está vacío: glifo propio más grande  → perilla `glyph_scale`: +1
- se parece demasiado a otra habilidad del guardián (distancia 0.06): cambiar el tipo de marca  → perilla `deco`: +1
- segundo anillo para distinguirla  → perilla `inner_ring`: fijar 1
  aplicado: ticks: 12 → 16; impact_at: 0.3 → 0.32; tick_len: 0.08 → 0.12; deco: 0 → 1

### nova160
- cobertura baja (8%): subir el relleno trameado (techo 24 %)  → perilla `fill`: +0.06
- más marcas para que el área se lea de lejos  → perilla `ticks`: +4
- borde más grueso para ganar presencia  → perilla `rim`: +1
- el cuerpo de la zona casi no se ve (0% del interior): subir el relleno trameado  → perilla `fill`: +0.06
- más marcas internas para dar cuerpo  → perilla `ticks`: +4
- el pico cae en 0% de la tira: llevarlo a ~30 %  → perilla `impact_at`: fijar 0.3
- poco movimiento: el glifo debe girar en pasos de 90°  → perilla `spin`: +1
- más chispas orbitando  → perilla `sparks`: +2
- poco detalle interior (0%): más marcas propias (estelas, hilos, runas)  → perilla `ticks`: +4
- marcas más largas  → perilla `tick_len`: +0.04
- el centro está vacío: glifo propio más grande  → perilla `glyph_scale`: +1
  aplicado: ticks: 12 → 16; rim: 2 → 3; impact_at: 0.3 → 0.32; tick_len: 0.08 → 0.12

### nova192
- cobertura baja (6%): subir el relleno trameado (techo 24 %)  → perilla `fill`: +0.06
- más marcas para que el área se lea de lejos  → perilla `ticks`: +4
- borde más grueso para ganar presencia  → perilla `rim`: +1
- el cuerpo de la zona casi no se ve (0% del interior): subir el relleno trameado  → perilla `fill`: +0.06
- más marcas internas para dar cuerpo  → perilla `ticks`: +4
- el pico cae en 0% de la tira: llevarlo a ~30 %  → perilla `impact_at`: fijar 0.3
- poco movimiento: el glifo debe girar en pasos de 90°  → perilla `spin`: +1
- más chispas orbitando  → perilla `sparks`: +2
- poco detalle interior (0%): más marcas propias (estelas, hilos, runas)  → perilla `ticks`: +4
- marcas más largas  → perilla `tick_len`: +0.04
- el centro está vacío: glifo propio más grande  → perilla `glyph_scale`: +1
  aplicado: ticks: 12 → 16; rim: 2 → 3; impact_at: 0.3 → 0.32; tick_len: 0.08 → 0.12

### zone32
- cobertura alta (74%): bajar el relleno para no tapar al enemigo  → perilla `fill`: -0.06
- menos marcas  → perilla `ticks`: -4
- marcas más cortas  → perilla `tick_len`: -0.04
- quitar el anillo interior  → perilla `inner_ring`: fijar 0
- borde más fino: la cobertura es excesiva  → perilla `rim`: -1
- menos chispas  → perilla `sparks`: -2
- quitar el glifo: la cobertura es excesiva  → perilla `glyph_on`: fijar 0
- se parece demasiado a otra habilidad del guardián (distancia 0.08): cambiar el tipo de marca  → perilla `deco`: +1
- segundo anillo para distinguirla  → perilla `inner_ring`: fijar 1
  aplicado: ticks: 12 → 8; rim: 2 → 1; deco: 0 → 1
