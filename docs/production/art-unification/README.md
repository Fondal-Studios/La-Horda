# Arte de campo y jefes — 16/10/2026

VISUAL GATE: PASS para esta entrega de 32 diseños. Revisión visual en el motor a escala de juego y captura móvil 844×390. No certifica todo el arte histórico del juego.

## Integración
16 objetos ambientales y 16 criaturas (12 jefes y cuatro criaturas de campo), con PNG y WebP sin pérdidas. Cada criatura tiene cuatro poses: reposo, dos pasos y ataque; vista tres cuartos y espejo. No son atlas de cuatro direcciones. Se conservan kits, estadísticas y efectos de combate existentes.

Convergencia tiene 178 objetos nuevos y 168 sólidos simétricos; árboles, rocas, carros, huesos, altares, torres azules/ámbar ordenadas por profundidad. Los árboles se atenúan si ocultan héroes. Héroes y monstruos colisionan con troncos, respetando los corredores de los tres carriles y el acceso a bases, campamentos y épicos. Coliseo incorpora columnas y braseros fuera del área de lucha. Bosque renueva árboles y arcos conservando colisiones. Seis arenas reciben restos y vegetación.

Carga diferida por arena y respaldo PNG ante errores WebP. Arte anterior de monstruos como respaldo durante carga. La definitiva Frankenstein del Nigromante ya está en main mediante PR #95.

## Recuperación
El mantenimiento automático eliminó el checkout anterior durante una publicación incompleta. Se recuperaron de GitHub las cuatro fuentes originales (12 jefes y 16 objetos). La fuente de cuatro criaturas de carriles no llegó a subirse ni se encontró en Library: se reconstruyó con imagegen, conservando conceptos y dirección visual. Esta distinción evita afirmar que es una recuperación idéntica de esa hoja. Se reconstruyó la integración y se volvieron a ejecutar las pruebas de carga, navegación, colisión y renderizado.

## Validación
- battlefield-results.json y fallback.json: 32 imágenes cargadas; simetría, colisión, corredores despejados, todos los objetivos accesibles y reconstrucción determinista; cero excepciones.
- technical-scan.txt: 0/32 PNG marcados. Importador verifica alfa y RGB visible idénticos en PNG/WebP.
- gameplay.png: captura real del motor. contact.png: criaturas renderizadas con alturas de mundo reales.
- lanes-simulation.txt y coliseum-simulation.txt: simulaciones ejecutadas antes de la recuperación con la misma integración funcional; sin NaN ni fuego amigo. Las pruebas posteriores a recuperación son battlefield-results y fallback.

Comandos: `python3 tools/art/import-battlefield.py`, `node tools/art/battlefield-test.js`, `FALLBACK=1 node tools/art/battlefield-test.js`, `python3 tools/art/scan_sprites.py --dir battlefield`.

## Límites
No se implementó matchmaking público ni se auditó un iPhone físico. Permanecen diferencias de detalle en enemigos comunes antiguos. La valoración visual previa de 7,5/10 fue interna y limitada a la entrega; no constituye crítica independiente ni una nota del juego completo frente a un indie con beneficio neto verificado.
