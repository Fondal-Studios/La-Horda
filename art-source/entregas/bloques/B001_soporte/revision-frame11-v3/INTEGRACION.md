# Soporte v3: candidato de integración

Atlas de 36 poses de la fábrica existente, con sustitución focal del cuadro 11.
Se conserva el diseño, los otros 35 cuadros RGBA y el atlas v2. No cambia estadísticas, habilidades, progreso ni permisos.

Fuente: revision-frame11-v3/source.png. Ensamblado NEAREST uniforme a altura 76 y apoyo 106.
Atlas SHA256: 6a4159258e35d515e405023dcb322526af6a437a3102ae097fa9c87e128fcc34.
Preflight 39302849899: 36/36 nativos, Style Gate PASS, cuerpo 68 y pies 106 en cuadro corregido.
No equivale por sí solo a aprobación de integración.

Conecta caminar/ataque en cuatro vistas (izquierda espejo), lanzamiento, definitiva y muerte.
El selector de animación acepta la marca clásica de definitiva ya sincronizada por el protocolo.
Prueba de renderer: seis niveles, 36 cuadros, lanzamiento real y snapshot invitado con reloj distinto.
Pruebas de roster, skins, Balance, Ability, Talent y regresiones deben pasar antes de merge.
No se certifica despliegue público ni sesión NanoGM mediante este candidato.
