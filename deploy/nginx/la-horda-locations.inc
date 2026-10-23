# Los "location" de La Horda, para pegar DENTRO del server { } de fondalstudios.com (ver fondalstudios.example.conf).
# Rutas públicas resultantes:
#   https://fondalstudios.com/la-horda/jugar/   -> el juego (archivos estáticos de /var/www/la-horda/current)
#   https://fondalstudios.com/la-horda/red/     -> el servidor de salas, cuentas y pagos (Node en 127.0.0.1:8787, prefijo recortado)
# Ajustá /etc/nginx/la-horda/ si copiaste los .inc a otro lado.

# ---- Servidor de salas / cuentas / pagos ----
# OJO: el juego abre el WebSocket en  wss://fondalstudios.com/la-horda/red  SIN barra final, y un WebSocket no sigue
# redirecciones: por eso la ruta exacta (sin barra) también va al servidor; NO se redirige.
location = /la-horda/red {
    include /etc/nginx/la-horda/la-horda-proxy.inc;
    include /etc/nginx/la-horda/la-horda-headers.inc;
    proxy_pass http://127.0.0.1:8787/;
}
location /la-horda/red/ {
    include /etc/nginx/la-horda/la-horda-proxy.inc;
    include /etc/nginx/la-horda/la-horda-headers.inc;
    # La barra final de proxy_pass RECORTA el prefijo: /la-horda/red/api/health llega al juego como /api/health.
    proxy_pass http://127.0.0.1:8787/;
}

# ---- El juego (estático) ----
location = /la-horda/jugar { return 301 /la-horda/jugar/; }

# La portada y lo que decide qué versión se usa: siempre se vuelve a preguntar al servidor (ETag: si no cambió, 304 liviano).
location = /la-horda/jugar/ { rewrite ^ /la-horda/jugar/index.html last; }
location ~ ^/la-horda/jugar/(index\.html|instalar\.html|crystal-wars\.html|sw\.js|sw-manifest\.json|deployment\.json|manifest\.webmanifest)$ {
    alias /var/www/la-horda/current/$1;
    include /etc/nginx/la-horda/la-horda-headers.inc;
    add_header Cache-Control "no-cache" always;
}

# Arte y audio (cambian poco): 1 día. Los archivos no llevan hash en el nombre; con GAME_PERF=1 el service worker valida por hash.
location ^~ /la-horda/jugar/assets/ {
    alias /var/www/la-horda/current/assets/;
    include /etc/nginx/la-horda/la-horda-headers.inc;
    add_header Cache-Control "public, max-age=86400" always;
    access_log off;
}

# Páginas legales (HTML): se revalidan siempre, para que un cambio de texto se vea enseguida.
location ^~ /la-horda/jugar/legal/ {
    alias /var/www/la-horda/current/legal/;
    index index.html;
    include /etc/nginx/la-horda/la-horda-headers.inc;
    add_header Cache-Control "no-cache" always;
}

# Código y estilos: 5 minutos y luego se revalida (si hay versión nueva, se ve en minutos, no en días).
location /la-horda/jugar/ {
    alias /var/www/la-horda/current/;
    include /etc/nginx/la-horda/la-horda-headers.inc;
    add_header Cache-Control "public, max-age=300, must-revalidate" always;
}
