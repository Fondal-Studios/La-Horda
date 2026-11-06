#!/usr/bin/env python3
"""LA HORDA — EL ARQUITECTO DE ARTE DE HABILIDADES

Integra al juego las habilidades que el Evaluador aprobó (PASS). No toca mecánicas: reemplaza SOLO el arte de los decales /
rayos del motor de efectos (js/champions/vfx-b/pixfx.js: KVB_DEC / KVB_BEAM) por los cuadros pintados, conservando nombre,
cantidad de cuadros, borde = radio real, tinte por arena y la capa/duración con que cada receta ya los usa.
  · js/champions/vfx-unified/runtime.js   — reemplazo + tinte + `?ua=0` para volver al arte anterior (comparaciones A/B).
  · js/champions/vfx-unified/<guardian>.js — cuadros RLE de las habilidades aprobadas (generado, no se edita a mano).
  · index.html                            — etiquetas <script> después de vfx-b (idempotente).
Después corre la prueba de humo en el motor real (smoke-integration.js); si falla, REVIERTE todo lo que escribió.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import canon  # noqa: E402

UA_DIR = canon.ROOT / 'js' / 'champions' / 'vfx-unified'
INDEX = canon.ROOT / 'index.html'
ANCHOR = '<script src="js/champions/vfx-b/profeta.js"></script>'

RUNTIME = r"""'use strict';
/* js/champions/vfx-unified/runtime.js — arte de habilidades UNIFICADO (generado por tools/art/ability-art/architect.py).
   Reemplaza el dibujo de decales y rayos de js/champions/vfx-b/pixfx.js por cuadros de píxel pintados con el canon
   (rampa de 5 tonos, contorno 1 px, alfa 0/255, luz arriba-izquierda). NO toca daño, alcance, duración, hitboxes ni azar:
   conserva nombre, nº de cuadros, borde = radio real y el tinte por arena (kvbTintPal). ?ua=0 vuelve al arte anterior. */
const ABA = {off: (function(){ try{ return /[?&](ua|kvb)=0\b/.test(location.search); }catch(e){ return false; } })(), done: {}, orig: {}};
function abaDecodeRle(s, n){
  const out = new Uint8Array(n); let p = 0, i = 0;
  while(i < s.length){ const d = s.charCodeAt(i++) - 48; let j = i; while(j < s.length && s[j] !== ';') j++; const run = parseInt(s.slice(i, j), 10); i = j + 1; out.fill(d, p, p + run); p += run; }
  return out;
}
function abaFrameCanvas(idx, W, H, pal){
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), im = g.createImageData(W, H);
  const rgb = pal.map(h => kvbRGB(h));
  for(let k = 0; k < idx.length; k++){ const t = idx[k]; if(!t) continue; const col = rgb[t - 1]; im.data[k * 4] = col[0]; im.data[k * 4 + 1] = col[1]; im.data[k * 4 + 2] = col[2]; im.data[k * 4 + 3] = 255; }
  g.putImageData(im, 0, 0); return c;
}
// kind 'decal' (anillo / sector / zona viva) o 'beam' (baldosa). frames = cadenas RLE; w, h = tamaño de pintura.
function abaReplace(kind, name, w, h, pal, frames){
  if(ABA.off || ABA.done[name] || typeof KVB_DEC === 'undefined') return;
  const tab = kind === 'beam' ? KVB_BEAM : KVB_DEC; if(!tab[name]) return;
  ABA.orig[name] = tab[name]; ABA.done[name] = true;
  const dec = frames.map(s => abaDecodeRle(s, w * h));
  const paint = (g, q, S, f) => {
    const p = kind === 'beam' ? pal : kvbTintPal(pal); // las zonas toman la paleta de la arena en curso; los rayos no se tiñen
    const i = Math.max(0, Math.min(dec.length - 1, f));
    g.imageSmoothingEnabled = false; g.drawImage(abaFrameCanvas(dec[i], w, h, p), 0, 0, w, h, 0, 0, kind === 'beam' ? S : S, kind === 'beam' ? h : S);
  };
  if(kind === 'beam') tab[name] = {N: dec.length, tileW: ABA.orig[name].tileW, H: ABA.orig[name].H, paint: (g, q, W, H, f) => { g.imageSmoothingEnabled = false; g.drawImage(abaFrameCanvas(dec[Math.max(0, Math.min(dec.length - 1, f))], w, h, pal), 0, 0, w, h, 0, 0, W, H); }, head: ABA.orig[name].head};
  else tab[name] = {N: ABA.orig[name].N, paint: (g, q, S, f, N) => { const i = Math.round(f / Math.max(1, N - 1) * (dec.length - 1)); g.imageSmoothingEnabled = false; g.drawImage(abaFrameCanvas(dec[Math.max(0, Math.min(dec.length - 1, i))], w, h, kvbTintPal(pal)), 0, 0, w, h, 0, 0, S, S); }};
  for(const k of Object.keys(KVB_CACHE)) if(k.startsWith(name + '@') || k === 'b:' + name) delete KVB_CACHE[k];
}
"""


def rle(a):
    flat = a.ravel().astype(int)
    out, i = [], 0
    while i < len(flat):
        j = i
        while j < len(flat) and flat[j] == flat[i]:
            j += 1
        out.append(f'{flat[i]}{j - i};')
        i = j
    return ''.join(out)


def module_source(guardian, spec, results):
    pal = spec['palette']
    lines = ["'use strict';",
             f"/* js/champions/vfx-unified/{guardian}.js — GENERADO por tools/art/ability-art/architect.py desde specs/{guardian}.json. No editar a mano:",
             "   se vuelve a pintar con `python3 tools/art/ability-art/pipeline.py run specs/" + guardian + ".json`. */",
             '{']
    for ab in spec['abilities']:
        r = results.get(ab['id'])
        if not r or r['status'] != 'PASS':
            continue
        fr = r['frames']
        h, w = fr[0].shape
        kind = 'beam' if ab['kind'] == 'beam' else 'decal'
        lines.append(f"  // {ab['id']} · puntaje {r['score']} (arte anterior {r.get('baseline_total')}, mejora {r.get('improvement')})")
        lines.append(f"  abaReplace('{kind}', '{ab['replaces']}', {w}, {h}, {json.dumps(pal)}, [")
        for f in fr:
            lines.append(f"    '{rle(f)}',")
        lines.append('  ]);')
    lines.append('}')
    return '\n'.join(lines) + '\n'


def integrate(guardian, spec, results, smoke=True, base_url='http://127.0.0.1:8750/'):
    """Escribe módulos, enlaza index.html, corre la prueba de humo; revierte si falla. Devuelve (ok, detalle)."""
    passed = [a['id'] for a in spec['abilities'] if results.get(a['id'], {}).get('status') == 'PASS']
    if not passed:
        return False, 'nada que integrar (ninguna habilidad aprobada)'
    UA_DIR.mkdir(parents=True, exist_ok=True)
    rt, gm = UA_DIR / 'runtime.js', UA_DIR / f'{guardian}.js'
    index_before = INDEX.read_text(encoding='utf-8')
    prev = {p: p.read_text(encoding='utf-8') for p in (rt, gm) if p.exists()}
    rt.write_text(RUNTIME, encoding='utf-8')
    gm.write_text(module_source(guardian, spec, results), encoding='utf-8')
    tags = []
    for f in ('runtime.js', f'{guardian}.js'):
        t = f'<script src="js/champions/vfx-unified/{f}"></script>'
        if t not in index_before:
            tags.append(t)
    idx = index_before
    if tags:
        if ANCHOR not in idx:
            return False, 'no encuentro el ancla de vfx-b/profeta.js en index.html'
        # runtime primero, luego los guardianes; cada nuevo va al final del bloque unificado
        last = max([idx.rfind(f'<script src="js/champions/vfx-unified/{x}"></script>') for x in ['runtime.js']] + [-1])
        if last >= 0:
            m = list(re.finditer(r'<script src="js/champions/vfx-unified/[^"]+"></script>', idx))[-1]
            idx = idx[:m.end()] + '\n' + '\n'.join(tags) + idx[m.end():]
        else:
            idx = idx.replace(ANCHOR, ANCHOR + '\n' + '\n'.join(tags))
        INDEX.write_text(idx, encoding='utf-8')
    if not smoke:
        return True, f'integradas {passed} (sin prueba de humo)'
    p = subprocess.run(['node', str(canon.HERE / 'smoke-integration.js'), guardian, ','.join(passed)], capture_output=True, text=True,
                       env={**__import__('os').environ, 'BASE_URL': base_url}, timeout=400)
    if p.returncode != 0:
        INDEX.write_text(index_before, encoding='utf-8')
        for path in (rt, gm):
            if path in prev:
                path.write_text(prev[path], encoding='utf-8')
            elif path.exists():
                path.unlink()
        return False, 'REVERTIDO — la prueba de humo falló:\n' + (p.stdout + p.stderr)[-1500:]
    return True, f'integradas {passed}; humo OK: ' + p.stdout.strip().splitlines()[-1]
