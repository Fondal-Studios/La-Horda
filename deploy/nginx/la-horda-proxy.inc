# Directivas comunes del proxy hacia el servidor del juego (127.0.0.1:8787). Se incluye en cada location que hace proxy_pass.
# Cada proxy_pass va en el location (con o sin barra final, ver la-horda-locations.inc y relay-subdominio.example.conf).

proxy_http_version 1.1;
proxy_set_header Host $host;

# WebSocket (salas multijugador)
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection $lh_connection_upgrade;

# IP REAL del jugador. El servidor la lee con TRUST_PROXY=1 para sus frenos de abuso (login, registro, API).
# - X-Forwarded-For se PISA (no se agrega a lo que mande el cliente): si no, cualquiera elegiría su IP y se saltearía los frenos.
# - Las cabeceras de CDN que el servidor también mira (cf-connecting-ip, true-client-ip, fly-client-ip) se borran: así un cliente
#   no puede mandarlas a mano. SI ponés Cloudflare adelante: cambiá $remote_addr por $http_cf_connecting_ip en la línea de
#   X-Forwarded-For Y permití solo las IP de Cloudflare en el firewall (si no, esa cabecera se puede falsificar).
proxy_set_header X-Forwarded-For $remote_addr;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header CF-Connecting-IP "";
proxy_set_header True-Client-IP "";
proxy_set_header Fly-Client-IP "";

# El webhook de Mercado Pago necesita llegar SIN cambios: la query (?data.id=...&type=payment) se conserva sola con proxy_pass,
# y las cabeceras x-signature y x-request-id pasan por defecto (nginx no las toca). NO agregues reglas que las borren ni
# reescrituras que cambien la query.

# Los mensajes de la partida son chicos y frecuentes: sin buffer, con conexiones largas (una sala puede durar horas).
proxy_buffering off;
proxy_read_timeout 3600s;
proxy_send_timeout 3600s;
proxy_connect_timeout 5s;

# El guardado en la nube pesa hasta ~528 KB; el resto de los pedidos es mucho menor.
client_max_body_size 1m;

# Freno general por IP (zona definida en la-horda-http.conf).
limit_req zone=lh_api burst=120 nodelay;
