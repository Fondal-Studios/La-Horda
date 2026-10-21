#!/usr/bin/env bash
# ACTUALIZAR La Horda en el servidor SIN perder datos:
#   copia de seguridad -> bajar la versión nueva -> instalar -> armar el sitio -> reiniciar -> verificar -> (si falla) volver atrás solo.
#   sudo bash /opt/la-horda/deploy/update.sh              actualiza a lo último de la rama (main)
#   sudo bash /opt/la-horda/deploy/update.sh --force      reconstruye aunque no haya cambios
# Es seguro repetirlo. Los datos (la base Postgres) NO se tocan: las tablas se crean/amplían sin borrar nada, y por eso volver a
# una versión anterior del código es posible (deploy/rollback.sh). Si querés volver también los DATOS: tools/release/restore.sh.
# Variables opcionales: APP_DIR (/opt/la-horda) · SITE_ROOT (/var/www/la-horda) · BRANCH (main) · ENV_FILE (/etc/la-horda/la-horda.env)
#   HEALTH_BASE (http://127.0.0.1:PUERTO) · RESTART_CMD ("systemctl restart la-horda"; con pm2: "pm2 restart la-horda")
#   KEEP_RELEASES (5) · SKIP_BACKUP=1 (NO recomendado) · ALLOW_NON_ROOT=1 (solo pruebas)
set -Eeuo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$HERE/lib.sh"

APP_DIR="${APP_DIR:-/opt/la-horda}"
SITE_ROOT="${SITE_ROOT:-/var/www/la-horda}"
STATE_DIR="${STATE_DIR:-/var/lib/la-horda-deploy}"
BRANCH="${BRANCH:-main}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"
FORCE=0; [ "${1:-}" = "--force" ] && FORCE=1

[ "${ALLOW_NON_ROOT:-0}" = "1" ] || need_root
need_cmd git "sudo apt install git"; need_cmd node "Instalá Node 22 (guía, paso 2)."; need_cmd npm "Viene con Node."; need_cmd curl "sudo apt install curl"
[ -d "$APP_DIR/.git" ] || die "$APP_DIR no es un clon del repositorio. Ver la guía, paso 3."
[ -r "$ENV_FILE" ] || die "No encuentro el archivo de entorno ($ENV_FILE). Ver la guía, paso 4."
PORT="$(env_get PORT)"; PORT="${PORT:-8787}"
BASE="${HEALTH_BASE:-http://127.0.0.1:$PORT}"
mkdir -p "$STATE_DIR" "$SITE_ROOT/releases"
cd "$APP_DIR"

step "1/8 Estado actual"
PREV="$(git rev-parse HEAD)"; PREV_REL="$(readlink -f "$SITE_ROOT/current" 2>/dev/null || true)"
say "Versión instalada: $(git log -1 --format='%h %s' | cut -c1-100)"
[ -z "$(git status --porcelain --untracked-files=no)" ] || die "Hay cambios locales en $APP_DIR (git status). Guardalos o descartalos antes de actualizar: no se pisa nada."

step "2/8 Buscando la versión nueva en GitHub (rama $BRANCH)"
git fetch --quiet origin "$BRANCH"
NEW="$(git rev-parse FETCH_HEAD)"
if [ "$NEW" = "$PREV" ] && [ "$FORCE" -eq 0 ]; then say "Ya está al día ($(git rev-parse --short HEAD)). Nada que hacer. (Usá --force para reconstruir igual.)"; exit 0; fi
git merge-base --is-ancestor "$PREV" "$NEW" || die "La rama del servidor tiene cambios propios que no están en origin/$BRANCH. No se actualiza solo: pedí ayuda."
say "Cambios que entran:"; git log --oneline "$PREV..$NEW" | head -n 15 | sed 's/^/  /'

step "3/8 Copia de seguridad ANTES de tocar nada"
if [ "${SKIP_BACKUP:-0}" = "1" ]; then warn "SKIP_BACKUP=1: se sigue SIN copia de seguridad. Si algo sale mal, los datos no se pueden recuperar."
else ENV_FILE="$ENV_FILE" bash "$APP_DIR/tools/release/backup.sh" || die "La copia de seguridad falló: NO se actualiza. Arreglá el backup primero."; fi

# vuelve atrás por su cuenta si algo falla de acá en adelante
rollback_auto() {
  local why="$1"
  printf '\nFALLÓ: %s\nVolviendo a la versión anterior (%s)...\n' "$why" "$(printf '%s' "$PREV" | cut -c1-8)" >&2
  ENV_FILE="$ENV_FILE" APP_DIR="$APP_DIR" SITE_ROOT="$SITE_ROOT" STATE_DIR="$STATE_DIR" HEALTH_BASE="$BASE" ALLOW_NON_ROOT=1 \
    bash "$HERE/rollback.sh" --to "$PREV" ${PREV_REL:+--release "$PREV_REL"} --auto || warn "El rollback automático también falló. Mirá: journalctl -u la-horda -n 80"
  exit 1
}

step "4/8 Bajando el código"
git merge --ff-only --quiet "$NEW" || rollback_auto "no se pudo traer el código nuevo"
say "Ahora: $(git log -1 --format='%h %s' | cut -c1-100)"

step "5/8 Instalando dependencias del servidor (npm ci)"
( cd server && npm ci --omit=dev --no-audit --no-fund --loglevel=error ) || rollback_auto "npm ci falló"
node --check server/relay.js || rollback_auto "el servidor nuevo tiene un error de sintaxis"

step "6/8 Armando el sitio del juego"
node tools/release/build-legal.js --check >/dev/null || rollback_auto "legal/*.html está desactualizado (corré node tools/release/build-legal.js y subí el cambio)"
REL="$SITE_ROOT/releases/$(date -u +%Y%m%d-%H%M%S)-$(git rev-parse --short HEAD)"
rm -rf dist
RELAY="$(env_get GAME_RELAY_URL)"; SITE="$(env_get GAME_SITE_URL)"; PERF="$(env_get GAME_PERF)"
( export GAME_PERF="${PERF:-1}"; [ -n "$RELAY" ] && export GAME_RELAY_URL="$RELAY"; [ -n "$SITE" ] && export GAME_SITE_URL="$SITE"
  node tools/build-static.mjs ) || rollback_auto "no se pudo armar el sitio"
mv dist "$REL"
for f in index.html legal/privacidad.html css/legal.css; do [ -f "$REL/$f" ] || rollback_auto "al sitio armado le falta $f"; done
chmod -R a+rX "$REL"
say "Sitio armado en $REL ($(du -sh "$REL" | cut -f1))"

step "7/8 Publicando y reiniciando"
ln -sfn "$REL" "$SITE_ROOT/current.new" && mv -Tf "$SITE_ROOT/current.new" "$SITE_ROOT/current"
restart_service || rollback_auto "no se pudo reiniciar el servicio"
say "Esperando que el servidor responda (hasta 45 s)..."
wait_healthy "$BASE" 45 || rollback_auto "el servidor no quedó sano después de reiniciar (/api/health)"
HEALTH="$(curl -fsS --max-time 5 "$BASE/health" || true)"; say "$HEALTH" | sed 's/^/  /'
case "$HEALTH" in *"relay OK"*) ;; *) rollback_auto "/health no dice 'relay OK'";; esac

step "8/8 Limpieza y registro"
printf '%s new=%s prev=%s release=%s\n' "$(date -u +%FT%TZ)" "$(git rev-parse HEAD)" "$PREV" "$REL" >> "$STATE_DIR/deploys.log"
# se conservan los últimos KEEP_RELEASES sitios (nunca el actual ni el anterior)
CUR="$(readlink -f "$SITE_ROOT/current")"
ls -1dt "$SITE_ROOT"/releases/*/ 2>/dev/null | tail -n +"$((KEEP_RELEASES + 1))" | while read -r d; do d="${d%/}"; [ "$d" = "$CUR" ] || [ "$d" = "$PREV_REL" ] || { say "Borrando sitio viejo: $(basename "$d")"; rm -rf "$d"; }; done

say ""
say "LISTO. Versión nueva en marcha. Para volver atrás: sudo bash $HERE/rollback.sh"
say "Chequeo completo (recomendado):  node $APP_DIR/tools/release/preflight.js --env-file $ENV_FILE --relay <URL pública del servidor> --url <URL pública del juego> --dist $SITE_ROOT/current"
