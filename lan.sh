#!/usr/bin/env sh
# LA HORDA · JUGAR EN RED LOCAL (Mac / Linux): doble clic o `./lan.sh`. Ver docs/beta-release/MULTIJUGADOR_LOCAL.md
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo "Falta Node.js (version 18 o mas). Instalalo desde https://nodejs.org y volve a ejecutar este archivo."
  exit 1
fi
exec node tools/lan/host.js "$@"
