# Cabeceras de seguridad para todo lo que sirve La Horda. Se incluye DENTRO de cada location (nginx NO hereda
# los add_header de un nivel superior si el location define alguno propio: por eso va como include en cada uno).
# HSTS: arrancá con max-age corto (86400 = 1 día) mientras probás; cuando todo ande por HTTPS subilo a 31536000 (1 año).
# No agregues includeSubDomains ni preload salvo que TODOS los subdominios de fondalstudios.com vayan por HTTPS.
add_header Strict-Transport-Security "max-age=86400" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header X-Frame-Options "SAMEORIGIN" always;
# CSP mínima: evita que otra página meta el juego en un marco (clickjacking) y bloquea <base>/<object>. No restringe scripts a
# propósito: el juego usa scripts y estilos en línea; una CSP estricta rompería el juego sin una prueba larga.
add_header Content-Security-Policy "frame-ancestors 'self'; base-uri 'self'; object-src 'none'" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=()" always;
