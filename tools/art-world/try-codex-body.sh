#!/usr/bin/env bash
# Evalúa UN cuerpo del Códice recuperado de #241 sobre la rama actual: lo agrega al registro CODEX_GAMEPLAY_ART en un worktree aparte,
# corre las pruebas que rechazaron a #241 y deja captura antes/después. Uso: bash tools/art-world/try-codex-body.sh <tanque|aelith|morveth> <puerto> <salida>
set -u
C="$1"; PORT="$2"; OUT="$3"; mkdir -p "$OUT"; ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; B=origin/fix/recover-generated-art-20261029
W="$OUT/wt_$C"; rm -rf "$W"; git -C "$ROOT" worktree add -q --detach "$W" HEAD; cd "$W"; ln -sf "$ROOT/server/node_modules" server/node_modules
python3 - "$C" "$ROOT" "$B" <<'PY'
import json,re,subprocess,sys,os
c,root,B=sys.argv[1:4]
sh=lambda *a: subprocess.run(['git','-C',root,*a],capture_output=True,text=True).stdout
full=sh('show',f'{B}:js/assets/codex-champion-meta.js'); i=full.index('const CODEX_GAMEPLAY_ART'); rest=full[full.index('{',i):]
d,_=json.JSONDecoder().raw_decode(rest)
p='js/assets/codex-champion-meta.js'; s=open(p).read(); j=s.index('const CODEX_GAMEPLAY_ART'); r2=s[s.index('{',j):]; cur,end=json.JSONDecoder().raw_decode(r2)
cur[c]=d[c]; open(p,'w').write(s[:j]+'const CODEX_GAMEPLAY_ART = '+json.dumps(cur,indent=1)+s[j+len('const CODEX_GAMEPLAY_ART')+len(r2[:end])+3:] if False else s[:j]+'const CODEX_GAMEPLAY_ART = '+json.dumps(cur,indent=1)+r2[end:])
for f in (f'assets/sprites/champions/{c}/codex-v1/atlas.png',f'assets/sprites/champions/{c}/codex-v1/preview.png'):
    os.makedirs(os.path.dirname(f),exist_ok=True); open(f,'wb').write(subprocess.run(['git','-C',root,'show',f'{B}:{f}'],capture_output=True).stdout)
m=open('js/assets/asset-manifest.js').read()
if f'champions/{c}/codex-v1/atlas.png' not in m:
    m=m.replace('  "assets/sprites/champions/guerrero/codex-v1/atlas.png",\n',f'  "assets/sprites/champions/guerrero/codex-v1/atlas.png",\n  "assets/sprites/champions/{c}/codex-v1/atlas.png",\n',1); open('js/assets/asset-manifest.js','w').write(m)
PY
export NODE_PATH="server/node_modules:$(npm root -g)"; python3 -m http.server "$PORT" >/dev/null 2>&1 & SRV=$!; sleep 2
export SE_BASE_URL="http://127.0.0.1:$PORT" SITE="http://127.0.0.1:$PORT"
: >"$OUT/$C.summary"
for t in tools/items/t_cromas.js tools/collection/browser-collection.js tools/coliseum/flow.js tools/lanes/test-sides.js tools/art/roster-loading-test.js; do
  timeout 290 node $t >"$OUT/$C.$(basename $t).log" 2>&1; code=$?; echo "$t exit=$code :: $(grep -E '^FAIL|SUMMARY|^PASS|"status"' "$OUT/$C.$(basename $t).log" | tail -1 | cut -c1-150)" >>"$OUT/$C.summary"; done
kill $SRV 2>/dev/null; echo "FIN" >>"$OUT/$C.summary"
