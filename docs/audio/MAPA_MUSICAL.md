# Mapa musical (plan)

`js/data/music-map.js` está **vacío (todo null)** porque no hay pistas verificadas (ver
`INVESTIGACION_MUSICA.md`). Esta tabla es el **género objetivo** por arena, elegido por identidad
(`docs/arena-identity/`), para completar cuando se sumen pistas. No hay títulos: no se eligió ninguna
pista concreta porque no se pudo verificar ni oír ninguna.

## Idea de diseño

Cada arena: una base **calma** lo-fi / chiptune bitonal (dos voces de pulso, poca percusión, saturación
suave) y una **intensa** del mismo BPM (o doble) con más ritmo; el jefe tiene la suya. El reproductor
sube a la intensa cuando la intensidad del director se sostiene >= 0.6 por 2,5 s (o hay élite/jefe), y
vuelve a calma con intensidad <= 0.3 sostenida 8 s y 20 s mínimos desde el último cambio. Cruce de 1,8 s.

| Arena | Calma | Intensa / jefe | Porque |
|---|---|---|---|
| Menú / Hub | pixel-lofi chill | - | Tema propio, relajado, sin compás de combate |
| Tienda | folk medieval chiptune | - | Cálido, corto, no cansa |
| Ciudad Maldita | chiptune lo-fi eólico, campana | chiptune urgente | Decadencia y luto; tono menor |
| Fortaleza (Fábrica) | synthwave oscuro industrial | percusión mecánica | Pistones y yunques |
| Bosque | folk/ambient suave | tribal + chiptune | Natural; la horda irrumpe |
| Micelial | ambient húmedo, lo-fi | synth pulsante | Orgánico y extraño |
| Gélida | ambient frío con campanas | orquestal oscuro ligero | Cristalino y vasto |
| Acuática | lo-fi chill sumergido | synthwave medio | Gotas, reverb larga |
| Laberinto | dungeon/ambient dron | percusión de piedra | Tensión sostenida |
| Abismo | ambient oscuro | orquestal épico | Vacío enorme |
| Minas | chiptune seco, picos | percusión de guerra | Túnel, metal |
| Infernal | synthwave oscuro | boss/combate intenso, tambores | Fuego y guerra |
| Divina | ambient luminoso, coro suave | orquestal épico | Contraste con Infernal |
| Coliseo / Cristales | chiptune competitivo medio | combate intenso | Duelos |
| Victoria / Derrota | jingle corto, sin loop | - | Cierre de partida |

Honestidad: esto es un plan por género, no una selección auditiva. Al elegir pistas reales, el dueño
debe escucharlas.
