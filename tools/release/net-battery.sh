#!/usr/bin/env bash
# Batería de red/cooperativo (1-4 jugadores, Campaña y Horda Infinita, desconexión). Levanta el sitio estático y un relay REAL en
# puertos locales, corre cada prueba con tiempo límite y deja un resumen. No relaja nada: registra PASS/FAIL tal cual.
#   bash tools/release/net-battery.sh <carpeta_salida>
set -u
OUT="${1:-/tmp/net-battery}"; mkdir -p "$OUT"; ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$ROOT"
export NODE_PATH="${NODE_PATH:-}:$ROOT/server/node_modules:$(npm root -g 2>/dev/null)"
python3 -m http.server 8771 >/dev/null 2>&1 & SITE_PID=$!
DATA_DIR="$(mktemp -d)" PORT=8799 node server/relay.js >"$OUT/relay.log" 2>&1 & RELAY_PID=$!
sleep 3
run(){ name="$1"; shift; ( timeout "${T:-280}" "$@" ) >"$OUT/$name.log" 2>&1; code=$?; echo "$name exit=$code :: $(tail -n1 "$OUT/$name.log" | cut -c1-140)" | tee -a "$OUT/summary.txt"; }
: >"$OUT/summary.txt"
export SITE=http://127.0.0.1:8771 RELAY=ws://127.0.0.1:8799 SE_BASE_URL=http://127.0.0.1:8771
for n in 1 2 3 4; do run "e2e_${n}_humanos" node tools/net-test/e2e.js $n; done
run endless_coop node tools/net-test/endless_coop.js
run ciudad_coop node tools/net-test/ciudad_coop.js
run disconnect node tools/net-test/disconnect.js
run campaign_gate node tools/net-test/campaign-gate.js
run boons_coop node tools/net-test/boons_coop.js
kill $SITE_PID $RELAY_PID 2>/dev/null; echo "FIN" >>"$OUT/summary.txt"
