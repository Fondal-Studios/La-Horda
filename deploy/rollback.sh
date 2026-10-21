#!/usr/bin/env bash
# VOLVER ATRÁS a la versión anterior del código y del sitio (los DATOS no se tocan).
#   sudo bash /opt/la-horda/deploy/rollback.sh              vuelve a la versión anterior a la última actualización
#   sudo bash /opt/la-horda/deploy/rollback.sh --list       muestra el historial de actualizaciones
#   sudo bash /opt/la-horda/deploy/rollback.sh --to COMMIT  vuelve a un commit puntual (de git log)
# Qué hace: git reset al commit anterior -> npm ci -> el sitio anterior (o lo reconstruye si ya no está) -> reinicia -> verifica.
# Qué NO hace: no restaura la base de datos. Las tablas nuevas que haya creado la versión nueva quedan (no molestan a la vieja).
# Si el problema son los DATOS (algo se borró o se corrompió): tools/release/restore.sh con una copia de /var/backups/la-horda.
# Variables opcionales: igual que update.sh.
set -Eeuo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$HERE/lib.sh"

APP_DIR="${APP_DIR:-/opt/la-horda}"
SITE_ROOT="${SITE_ROOT:-/var/www/la-horda}"
STATE_DIR="${STATE_DIR:-/var/lib/la-horda-deploy}"
LOG="$STATE_DIR/deploys.log"

if [ "${1:-}" = "--list" ]; then
  [ -f "$LOG" ] || { say "Todavía no hay actualizaciones registradas."; exit 0; }
  say "Historial (la última línea es la versión actual):"; sed 's/^/  /' "$LOG"; exit 0
fi

TO=""; REL=""; AUTO=0
while [ $# -gt 0 ]; do
  case "$1" in
    --to) TO="$2"; shift 2;; --release) REL="$2"; shift 2;; --auto) AUTO=1; shift;;
    *) die "Opción desconocida: $1 (usá --list, --to COMMIT)";;
  esac
done

[ "${ALLOW_NON_ROOT:-0}" = "1" ] || need_root
need_cmd git "sudo apt install git"; need_cmd node "Instalá Node."; need_cmd npm "Viene con Node."; need_cmd curl "sudo apt install curl"
[ -d "$APP_DIR/.git" ] || die "$APP_DIR no es un clon del repositorio."
PORT="$(env_get PORT)"; PORT="${PORT:-8787}"
BASE="${HEALTH_BASE:-http://127.0.0.1:$PORT}"
cd "$APP_DIR"

if [ -z "$TO" ]; then
  [ -f "$LOG" ] || die "No hay historial de actualizaciones: indicá el commit con --to COMMIT (git log --oneline)."
  LAST="$(tail -n1 "$LOG")"
  case "$LAST" in *ROLLBACK*) die "La última acción ya fue un rollback. Indicá a qué versión querés ir: --to COMMIT (mirá: git log --oneline y --list).";; esac
  TO="$(printf '%s' "$LAST" | sed -n 's/.* prev=\([0-9a-f]\{7,40\}\) .*/\1/p')"
  [ -n "$TO" ] || die "No pude leer la versión anterior del historial."
  REL=""   # el sitio anterior se busca más abajo
fi
git cat-file -e "$TO^{commit}" 2>/dev/null || die "El commit $TO no existe en este clon (git fetch origin y probá de nuevo)."
CURRENT="$(git rev-parse HEAD)"

step "Volviendo de $(git rev-parse --short "$CURRENT") a $(git rev-parse --short "$TO")"
git reset --hard --quiet "$TO"
say "Código: $(git log -1 --format='%h %s' | cut -c1-100)"

step "Dependencias del servidor"
( cd server && npm ci --omit=dev --no-audit --no-fund --loglevel=error ) || die "npm ci falló. El servidor puede estar inconsistente: pedí ayuda (los datos están intactos)."

step "Sitio del juego"
if [ -z "$REL" ] && [ -f "$LOG" ]; then REL="$(grep " new=$(git rev-parse HEAD) " "$LOG" | tail -n1 | sed -n 's/.* release=\(.*\)$/\1/p')"; fi
if [ -n "$REL" ] && [ -d "$REL" ]; then
  say "Se reutiliza el sitio armado antes: $REL"
else
  REL="$SITE_ROOT/releases/$(date -u +%Y%m%d-%H%M%S)-$(git rev-parse --short HEAD)-rollback"
  say "El sitio anterior ya no está: se reconstruye."
  rm -rf dist
  RELAY="$(env_get GAME_RELAY_URL)"; SITE="$(env_get GAME_SITE_URL)"; PERF="$(env_get GAME_PERF)"
  ( export GAME_PERF="${PERF:-1}"; [ -n "$RELAY" ] && export GAME_RELAY_URL="$RELAY"; [ -n "$SITE" ] && export GAME_SITE_URL="$SITE"
    node tools/build-static.mjs ) || die "No se pudo armar el sitio."
  mkdir -p "$SITE_ROOT/releases"; mv dist "$REL"; chmod -R a+rX "$REL"
fi
ln -sfn "$REL" "$SITE_ROOT/current.new" && mv -Tf "$SITE_ROOT/current.new" "$SITE_ROOT/current"

step "Reiniciando y verificando"
restart_service || die "No se pudo reiniciar el servicio."
wait_healthy "$BASE" 45 || die "El servidor no responde después de volver atrás. journalctl -u la-horda -n 80"
curl -fsS --max-time 5 "$BASE/health" | sed 's/^/  /' || true
mkdir -p "$STATE_DIR"
printf '%s new=%s prev=%s release=%s ROLLBACK%s\n' "$(date -u +%FT%TZ)" "$(git rev-parse HEAD)" "$CURRENT" "$REL" "$([ "$AUTO" = 1 ] && echo ' (automático)')" >> "$LOG"
say ""
say "LISTO: el servidor volvió a la versión $(git rev-parse --short HEAD). Los datos no se tocaron."
say "Para volver a la versión nueva cuando esté arreglada: sudo bash $HERE/update.sh"
