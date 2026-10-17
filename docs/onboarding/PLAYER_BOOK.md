# Códice: propósito y primera partida

El libro sustituye el retrato del Hechicero en la introducción de campaña. Tres páginas explican propósito, primera victoria y progreso; la hoja gira al avanzar, con bloqueo de doble toque y soporte de movimiento reducido. La partida comienza únicamente con su botón. El Códice conserva el bestiario y arte existente y suma una portada con ruta de campaña, enlaces a arenas y objetivos por modo.

Arte: `assets/ui/codex/grimoire.webp`, generado con image_gen integrado, sin texto incrustado. Prompt: libro antiguo abierto de fantasía oscura en pixel art, cuero y esquinas de espadas, runas cian y cristales, guardián defendiendo una ciudad y ruta desde bosque a hielo e infierno, sin flores ni letras. El original se generó a 1254 × 1254; WebP conserva el tamaño. Revisión visual: silueta completa, espadas/runas visibles, sin texto accidental. Es ilustración de interfaz, no atlas de campeón.

Validación: `node tools/onboarding/book-test.cjs` comprueba páginas iniciales, repetición por perfil, bloqueo durante el giro, movimiento reducido, comienzo explícito y contenido del Códice. `node --check` y build estático. La prueba Playwright local quedó bloqueada porque no hay navegador instalado y el servidor de descargas devolvió un archivo inválido; no se certifica revisión visual en iPhone real.

Destino: rama `deploy/nano-independent`, sitio Render de pruebas `la-horda-nano`. No publicar en producción Fondal.
