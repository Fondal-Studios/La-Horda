#!/usr/bin/env bash
# Funciones comunes de los scripts de deploy/ y tools/release/{backup,restore}.sh. Se carga con "source"; no se ejecuta solo.
# NUNCA imprime valores secretos (ni DATABASE_URL ni claves): solo avisa si faltan.

ENV_FILE="${ENV_FILE:-/etc/la-horda/la-horda.env}"

say()  { printf '%s\n' "$*"; }
step() { printf '\n== %s\n' "$*"; }
warn() { printf 'AVISO: %s\n' "$*" >&2; }
die()  { printf '\nERROR: %s\n' "$*" >&2; exit 1; }

# env_get NOMBRE -> imprime el valor de NOMBRE: primero del entorno actual, si no, del archivo de entorno (sin comillas).
env_get() {
  local k="$1" v="${!1:-}" line
  if [ -z "$v" ] && [ -r "$ENV_FILE" ]; then
    line="$(grep -E "^[[:space:]]*${k}=" "$ENV_FILE" | tail -n1 || true)"
    v="${line#*=}"; v="${v%$'\r'}"
    case "$v" in \"*\") v="${v#\"}"; v="${v%\"}";; \'*\') v="${v#\'}"; v="${v%\'}";; esac
  fi
  printf '%s' "$v"
}

need_root() { [ "$(id -u)" -eq 0 ] || die "Corré este script con sudo (como administrador): sudo bash $0"; }
need_cmd()  { command -v "$1" >/dev/null 2>&1 || die "Falta el programa '$1'. $2"; }

# restart_service: reinicia con RESTART_CMD (por defecto systemd). Con pm2: RESTART_CMD="pm2 restart la-horda"
restart_service() { ${RESTART_CMD:-systemctl restart la-horda}; }

# wait_healthy URL [segundos]: espera a que /health diga "relay OK" y /api/health diga ok:true
wait_healthy() {
  local base="$1" max="${HEALTH_WAIT:-${2:-45}}" i body
  for i in $(seq 1 "$max"); do
    body="$(curl -fsS --max-time 3 "$base/api/health" 2>/dev/null || true)"
    case "$body" in *'"ok":true'*) return 0;; esac
    sleep 1
  done
  return 1
}

# pg_connect URL: deja listas las variables PGHOST/PGUSER/PGPASSWORD/... para pg_dump/pg_restore/psql SIN poner la dirección en la
# línea de comandos (así no se ve en "ps"). Hay que llamarla dentro de un subshell: ( pg_connect "$URL"; pg_dump ... )
pg_connect() {
  local here; here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  need_cmd node "Instalá Node (guía, paso 2)."
  eval "$(PG_URL_IN="$1" node "$here/pg-env.js")" || die "La dirección de la base de datos no es válida."
}
