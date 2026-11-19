# CHECKPOINT — B002 Tanque direccional 01

- Base fresca: `b7d92968d3324f298bd64bd9c7cbd33be1ab434e` (`main`, PR297 Myla ya integrado).
- Rama local: `art/tanque-directional-kit-20261118`.
- Componente: sólo lanzamiento y muerte lateral/trasera del cuerpo base de Aldric.
- Conservado: cuerpo Códice, daño direccional, lanzamiento/muerte frontal, Baluarte, Bastión Ancestral, Paladín del Juicio, habilidades y mecánicas.
- Fuentes: dos originales imagegen, Códice exacto y las filas frontales aprobadas, todos preservados.
- Salidas: `cast.png` 4x3 de 144 px; `death.png` 4x3 de 112 px; 12 cuadros por atlas.
- Consumidores: `drawKnightWarCryCast` elige dirección real; `drawChampPackDeath` resuelve dirección incluso en un invitado recién decodificado.
- Estado: **EN_CORRECCION / FIX / NO_INTEGRAR**.
- Bloqueo concreto: Chromium local no puede abrir su socket de singleton; el workflow exacto fue ampliado para ejecutar reproducción, densidad y renderer en CI.
- Próximo paso: subir taller remoto, ejecutar CI del head exacto y sólo si queda verde completar matriz visual real seis arenas, skins, móvil/escritorio y relay.
