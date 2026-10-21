#!/usr/bin/env bash
# RESTAURAR una copia de seguridad de La Horda (hecha con tools/release/backup.sh).
#   Ensayo (recomendado, no toca producción): restaurar en una base de PRUEBA y comparar números.
#       RESTORE_DATABASE_URL=postgresql://usuario@127.0.0.1:5432/lahorda_prueba bash tools/release/restore.sh /var/backups/la-horda/la-horda-AAAA.dump
#   Producción (reemplaza los datos actuales por los de la copia; DETENER el servicio primero):
#       sudo systemctl stop la-horda
#       sudo bash tools/release/restore.sh /var/backups/la-horda/la-horda-AAAA.dump --production
#       sudo systemctl start la-horda
# Protecciones: sin --production, RESTORE_DATABASE_URL es obligatoria y NO puede ser la de producción (DATABASE_URL).
# Con --production se pide escribir la palabra RESTAURAR y se hace antes una copia de lo que hay ("pre-restore").
# Solo toca las tablas horda_* de la copia. NUNCA imprime direcciones ni claves.
set -Eeuo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$HERE/../../deploy/lib.sh"

DUMP="${1:-}"; MODE="${2:-}"
[ -n "$DUMP" ] && [ -f "$DUMP" ] || die "Uso: bash tools/release/restore.sh ARCHIVO.dump [--production]"
need_cmd pg_restore "Instalá: sudo apt install postgresql-client"
need_cmd psql "Instalá: sudo apt install postgresql-client"
pg_restore --list "$DUMP" >/dev/null || die "El archivo no es una copia válida (pg_restore no lo puede leer)."

PROD="$(env_get DATABASE_URL)"
if [ "$MODE" = "--production" ]; then
  [ -n "$PROD" ] || die "No hay DATABASE_URL cargada."
  TARGET="$PROD"
  if systemctl is-active --quiet la-horda 2>/dev/null; then die "El servicio la-horda está corriendo. Detenelo antes: sudo systemctl stop la-horda"; fi
  say "Vas a REEMPLAZAR los datos de PRODUCCIÓN (cuentas, guardados, billetera) por los de: $DUMP"
  read -r -p "Escribí la palabra RESTAURAR para continuar: " ANS
  [ "$ANS" = "RESTAURAR" ] || die "Cancelado. No se tocó nada."
  step "Copia de seguridad de lo que hay AHORA (por si te arrepentís)"
  BACKUP_DIR="${BACKUP_DIR:-/var/backups/la-horda}" bash "$HERE/backup.sh" || die "No se pudo hacer la copia previa; no se restaura."
else
  TARGET="${RESTORE_DATABASE_URL:-}"
  [ -n "$TARGET" ] || die "Falta RESTORE_DATABASE_URL (una base de PRUEBA). Para producción usá --production."
  [ "$TARGET" != "$PROD" ] || die "RESTORE_DATABASE_URL es igual a la de producción. Usá otra base o --production."
fi

step "Restaurando"
# --clean --if-exists: reemplaza las tablas horda_* de la copia; no toca otras tablas de la base
( pg_connect "$TARGET"; pg_restore --clean --if-exists --single-transaction --no-owner --no-privileges --exit-on-error --dbname="$PGDATABASE" "$DUMP" ) 2>/tmp/la-horda-restore.err \
  || { sed 's#postgres[a-z]*://[^ ]*#<dirección oculta>#g' /tmp/la-horda-restore.err >&2; die "La restauración falló (arriba el motivo)."; }
rm -f /tmp/la-horda-restore.err

step "Verificación (cantidades en la base restaurada)"
for t in horda_users horda_saves horda_wallet horda_wallet_ledger horda_leaderboard; do
  n="$( ( pg_connect "$TARGET"; psql -Atc "SELECT count(*) FROM $t" ) 2>/dev/null || echo 'no existe')"
  printf '  %-22s %s\n' "$t" "$n"
done
say ""
say "Comprobá que los números tengan sentido (usuarios y movimientos de Brasas parecidos a los de la fecha de la copia)."
[ "$MODE" = "--production" ] && say "Ahora: sudo systemctl start la-horda  y  node tools/release/preflight.js --env-file $ENV_FILE --relay <url>"
exit 0
