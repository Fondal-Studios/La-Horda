# Caballero: muerte animada original

La apariencia base ahora tiene cuatro cuadros propios de caída en vez de girar la pose de pie. La secuencia termina tendida, conserva espada y escudo y usa el reloj local de animación; reanimar y volver a morir reinicia la secuencia. Es un componente suplementario: el atlas maestro permanece byte por byte idéntico (SHA256109c4766dc9fb979c026ed6a12d99079ef58e4f0fd18d91d0b64da6829a4df90), al igual que el camino de dibujo vivo y el Códice existente.

Solo se aplica a la apariencia base. Baluarte y Bastión Ancestral conservan su arte de muerte; si el suplemento no terminó de cargar, se mantiene la caída anterior. La secuencia se comparte entre orientaciones; no se anuncian cuatro muertes direccionales. No cambia hitbox, vida, daño, controles, inventarios ni guardados.

Resultados locales:135 comprobaciones del renderer real (niveles1/39/40/60/90/99, orientaciones, poses, reposo final, reanimación, segundo fallecimiento, skins, fallback y seis snapshots reproducidos en una segunda página);127 de regresión de Libertador;141 apariencias sin fallos de escala/presentación. El atlas original se verifica por hash y el dibujo vivo conserva sus píxeles con/sin suplemento.

Art Gate del componente: nativo4/4 PASS sin excepciones; Style Gate de familia PASS; scanner semialfa0/fragmentos0/halo6 (umbral15, reflejos legítimos revisados). Revisión visual contra el Caballero del motor en runtime-comparison.png: identidad, proporciones, arma y escudo coherentes en los cuatro cuadros. La fuente y receta reproducible viven en art-source/entregas/bloques/B002_tanque/revision-death-v3/. El atlas fuente completo sigue sin aprobación: no reemplazar el maestro por él.

No es una aprobación atribuida a Nano ni una prueba de despliegue público. Las pruebas guest ejercitan codificador/decodificador real, no una partida por el servidor oficial. Balance y talentos no se modifican; los workflows generales se ejecutan antes del merge.
