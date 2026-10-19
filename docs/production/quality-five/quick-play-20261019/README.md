# Fixture de Jugar ya — 2026-10-19

El test cargaba todos los assets de B después de abrir la sala de A, cuya espera real es8 segundos. En el entorno local esto produjo dos timeouts: B terminó como host de otra partida y no como invitado. El diagnóstico registró state=playing,role=host al esperar el ingreso de B. El juego había seguido su ruta prevista de inicio rápido.

Se preparan ambos navegadores antes de pulsar el botón de A. Se conservan la espera real, la consulta de sala pública, el clic de B, los requisitos de preparación, dos humanos/dos compañeros, nombres y fallback sin servidor. No se altera código runtime ni se aumentan timeouts.

Prueba específica ejecutada con relay real temporal:14 comprobaciones PASS (result.txt). El contenido del juego es el mismo ya validado por los PR146/148/150. Esta corrección modifica solamente la preparación de la prueba.
