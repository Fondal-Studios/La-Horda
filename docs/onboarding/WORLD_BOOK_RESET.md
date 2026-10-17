# Libro de apertura y reinicio único

La apertura contiene ocho capítulos y seis ilustraciones: mundo antiguo, guerra, Sello, Cuatro Guardianes, corrupción, regreso de la Horda y objetivos del jugador. Se muestra durante la carga inicial, tiene páginas animadas, pausa, navegación, salto y reproducción desde el hub. Los textos son HTML accesible y se adaptan a móvil. No agrega voces sintéticas.

El libro breve se muestra antes de campaña (incluye reintentos), Horda Infinita, práctica de Cristales/Coliseo y preparación multijugador. El invitado lee antes de marcar LISTO; el anfitrión antes de iniciar. Un arranque recibido del anfitrión cierra el libro del invitado para no cubrir el combate.

En Cuenta, «Reiniciar y elegir tres guardianes» pide una confirmación que enumera todas las pérdidas. Solo actúa sobre la cuenta autenticada. Borra progreso, campeones, equipo, cosméticos, oro, gemas, saldo premium y ranking. Conserva acceso, permisos e historial contable. No hay un borrado automático de usuarios. Los permisos no restauran campeones otorgados antes del reinicio. El jugador elige tres distintos; el primero es principal y recibe la única skin inicial.

Servidor: POST /api/account/reset-once exige confirmación y versión. Postgres bloquea la cuenta y reemplaza guardado, saldo y ranking en una transacción. El adaptador de archivos usa intención persistida recuperable y serializa guardados por cuenta. El uso se guarda fuera del JSON del cliente. Una generación nueva rechaza copias anteriores incluso con force; las tres elecciones se guardan como una lista que solo permite agregar hasta tres. La autoridad general sobre progreso normal sigue siendo el sistema preexistente de guardados del cliente.

Validación: API de cuentas completa (0 fallos); reinicio concurrente/segundo uso/restauración vieja/saldo/ranking/persistencia; mismo escenario SQL con motor PostgreSQL embebido PGlite; navegador Chromium 153 en 1280×800 y 390×844, sin errores JS, vuelta de página y tres elecciones (cuarta rechazada); pruebas de libro y reduced motion.

Arte: assets/ui/codex/world-chronicle.webp. Generado con la herramienta integrada imagegen. Prompt: atlas narrativo 3×2 de seis pinturas de crónica medieval oscura, sin textos, con ciudad antigua, guerra contra sombras, cuatro Guardianes sellando un portal, Forjador dividiendo el Sello, reinos corrompidos y tres nuevos héroes defendiendo civiles. La fuente de arte no modifica reglas de juego.
