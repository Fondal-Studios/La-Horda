# Jefes y textos limpios

Críticas del crítico de combate (844x390): (1) pantalla llena de texto en peleas de jefe; (2) textos flotantes que repiten lo que ya se ve.

## 1. Jefes en celular apaisado (<= 500 px de alto)

Ya hecho por el PR de HUD móvil (`css/hud-mobile.css`), sin tocar: guía "Cómo sobrevivir" en 3 pictogramas, abajo al centro, 4,2 s;
Hechicero de 2 líneas; cola de carteles con prioridades (`js/ui/hud-text.js`) que ya esperaba al cartel grande de arena.

Medido en main antes de este PR (`antes-*.png`, `antes-medicion.json`): la guía ocupaba 18 % del alto (no 40 %), duraba 4,2 s, el nombre
del jefe salía cortado ("Guardián Ancestral Co…" porque el epíteto le quitaba el ancho) y "RUNA ACTIVA (1/4): LA HORDA SE FORTALECE" se partía en 2 renglones.

Completado aquí:
- `css/hud-mobile.css`: la guía pierde el encabezado (queda en `title`), pegada al borde (2 px), 14 % del alto, máx. 2 renglones de texto.
  Epíteto del jefe oculto en celular (queda en `title`): el nombre usa todo el ancho de la barra.
- `js/ui/boss-hud.js`: guía de 3 s (antes 4,2 s) o hasta el primer movimiento (joystick > 0,25 tras 0,5 s visible).
- `js/ui/hud-text.js`: la guía entra en la cola: mientras espera su turno o se ve, los carteles normales (runa, oleada, compañero caído) esperan; los urgentes siguen pasando.
- `bos-ruins.js`: "RUNA ACTIVA (n/4)" en un renglón.
- Medición: `node tools/ux/capture-boss-text.js docs/ux/jefes-limpios despues --assert` (carteles centrales simultáneos <= 1, guía <= 25 % del alto, nombre sin cortar, la guía se va al moverse).

## 2. Textos flotantes de palabras

- Se quitaron los que repiten un efecto visible: nombre de la habilidad lanzada (`¡GOLPE FUERTE!`, `Flecha Perforante`, `Trampa colocada`, `¡PLAGA DE LOS CONDENADOS!`,
  `¡GÓLEM!`, `¡PRESA ACORRALADA!`, `¡IMPULSO MÁXIMO!`, `¡MIL CORTES!`, ...), efectos de sets (`¡FRENESÍ!`, `¡RESONANCIA!`, ...), poderes míticos y procs de objetos.
  El daño numérico, la curación y el escudo no se tocaron.
- `js/rendering/effects.js`: sobre la cabeza del jugador pasan solo avisos que cambian la decisión (`FT_KEEP`: peligro, "lista/listo", combo, no se pudo lanzar, nivel, controles de arena) y los
  de clase `warn`; el resto de palabras de estado se funde en UNA cada `FT_STATUS_GAP_MS` = 1,5 s (global). Contadores en `FT_STATS`.
- Prueba: `node tools/quality/test-floating-text-rate.js` (30 s por guardián, autopiloto, 4 roles: tanque, asesino, mago, soporte).
  Umbrales: <= 0,40 palabras/s sobre el héroe, <= 1,20 palabras/s en total, y nunca dos palabras sobre el héroe a menos de 1,4 s.

### Medición (30 s por guardián, autopiloto, Bosque nivel 3, mismas semillas)

Palabras sobre el héroe por segundo, main -> este PR: tanque 0,27/0,40 -> 0,07; asesino (guerrero, cazadora, musashi) 0,23/0,40/0,57 -> 0,03/0,07/0,23;
mago (mago, nigromante) 0,30/0,27 -> 0,07; soporte (soporte, profeta) 0,20/0,33 -> 0,10/0,07. Total de palabras: máx. 0,73/s -> 0,50/s.
Los números de daño no cambian. El grueso que queda sobre el héroe son eventos de arena (`¡Raíces!`, `¡Emboscada!`) y avisos de "no se pudo lanzar" (`Sin objetivo`).
Antes (`antes-*`) / después (`despues-*`): capturas del jefe del Bosque a 844x390 en esta carpeta.

Nota: `tools/ux/test-tactical-panel.js` falla igual en main y en esta rama ("simulation keeps running while panel is open"); no es de este cambio.
