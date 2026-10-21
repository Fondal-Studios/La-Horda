#!/usr/bin/env bash
# COPIA DE SEGURIDAD de La Horda (cuentas, guardados en la nube, billetera de Brasas y su libro, ranking, panel).
#   bash tools/release/backup.sh                 -> escribe /var/backups/la-horda/la-horda-AAAAMMDD-HHMMSS.dump
#   BACKUP_DIR=/mnt/disco bash tools/release/backup.sh
# Variables (del entorno o de /etc/la-horda/la-horda.env, nunca se imprimen):
#   DATABASE_URL        base Postgres a copiar. Sin ella: se copia DATA_DIR (modo archivos) en un .tar.gz.
#   BACKUP_ONLY_HORDA   1 (por defecto) = solo las tablas horda_* (sirve si la base se comparte con otra app). 0 = toda la base.
#   BACKUP_DIR          carpeta destino (por defecto /var/backups/la-horda)
#   KEEP_DAYS           cuántos días se conservan las copias (por defecto 14)
# Qué garantiza: la copia se genera en un archivo temporal, se VERIFICA (pg_restore --list) y recién ahí se publica con su
# nombre final. Si algo falla, sale con error y NO borra copias viejas.
# Qué NO garantiza: que la restauración funcione en TU servidor (probala: tools/release/restore.sh) ni que la copia esté en otro
# lugar físico (copiala afuera: ver la guía, sección "Copias de seguridad"). Una copia en el mismo disco no sirve si el disco muere.
# Programarla (como root):  echo '17 3 * * * root /opt/la-horda/tools/release/backup.sh >> /var/log/la-horda-backup.log 2>&1' > /etc/cron.d/la-horda-backup
set -Eeuo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../deploy/lib.sh
source "$HERE/../../deploy/lib.sh"

BACKUP_DIR="${BACKUP_DIR:-/var/backups/la-horda}"
KEEP_DAYS="${KEEP_DAYS:-14}"
TS="$(date -u +%Y%m%d-%H%M%S)"
umask 077
mkdir -p "$BACKUP_DIR"

DB="$(env_get DATABASE_URL)"
ONLY="$(env_get BACKUP_ONLY_HORDA)"; ONLY="${ONLY:-1}"

if [ -n "$DB" ]; then
  need_cmd pg_dump "Instalá el cliente de Postgres: sudo apt install postgresql-client (la versión tiene que ser igual o mayor que la de la base)."
  need_cmd pg_restore "Viene con postgresql-client."
  if [ "$ONLY" = "1" ] && command -v psql >/dev/null 2>&1; then
    NT="$( ( pg_connect "$DB"; psql -Atc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'horda\_%'" ) 2>/dev/null || echo err)"
    if [ "$NT" = "0" ]; then
      say "La base todavía no tiene tablas de La Horda (servidor nuevo, nunca arrancó): no hay nada que copiar."
      say "Si esto NO es un servidor nuevo, revisá que DATABASE_URL apunte a la base correcta."
      exit 0
    fi
  fi
  OUT="$BACKUP_DIR/la-horda-$TS.dump"; TMP="$OUT.partial"
  trap 'rm -f "$TMP"' EXIT
  ARGS=(--format=custom --no-owner --no-privileges --file="$TMP")
  [ "$ONLY" = "1" ] && ARGS+=(--table='horda_*')
  # la dirección se pasa por variables PG* del proceso (no por línea de comandos: no se ve en "ps")
  ( pg_connect "$DB"; pg_dump "${ARGS[@]}" ) 2>"$TMP.err" || { sed 's#postgres[a-z]*://[^ ]*#<dirección oculta>#g' "$TMP.err" >&2; rm -f "$TMP.err"; die "pg_dump falló (arriba el motivo). No se creó ninguna copia."; }
  rm -f "$TMP.err"
  [ -s "$TMP" ] || die "La copia salió vacía."
  N="$(pg_restore --list "$TMP" | grep -c 'TABLE DATA' || true)"
  [ "$N" -ge 1 ] || die "La copia no contiene datos de tablas (¿no existen las tablas horda_*?)."
  mv "$TMP" "$OUT"; trap - EXIT
  say "Copia lista: $OUT ($(du -h "$OUT" | cut -f1), $N tablas con datos)"
else
  DIR="$(env_get DATA_DIR)"; DIR="${DIR:-/var/lib/la-horda}"
  [ -d "$DIR" ] || die "No hay DATABASE_URL y tampoco existe la carpeta de datos ($DIR)."
  OUT="$BACKUP_DIR/la-horda-files-$TS.tar.gz"
  tar -C "$(dirname "$DIR")" -czf "$OUT.partial" "$(basename "$DIR")"
  tar -tzf "$OUT.partial" >/dev/null || die "El archivo comprimido no se puede leer."
  mv "$OUT.partial" "$OUT"
  say "Copia de archivos lista: $OUT ($(du -h "$OUT" | cut -f1))"
fi

# Limpieza: solo después de una copia nueva y verificada
find "$BACKUP_DIR" -maxdepth 1 -type f \( -name 'la-horda-*.dump' -o -name 'la-horda-files-*.tar.gz' \) -mtime +"$KEEP_DAYS" -print -delete | sed 's/^/Borrada (vieja): /' || true
say "Copias que hay ahora:"; ls -1t "$BACKUP_DIR" | head -n 5 | sed 's/^/  /'
say "Recordá copiar esta carpeta a OTRO lugar (otro servidor, almacenamiento en la nube): ver docs/commercial/DESPLIEGUE_FONDAL.md."
