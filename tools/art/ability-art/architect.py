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


RUNTIME_SFA = r"""'use strict';
/* js/champions/vfx-unified/sfa-runtime.js — BORDE UNIFICADO para el motor skill-fx-a (generado por tools/art/ability-art/architect.py).
   El arte de cada tema (motivos, siluetas, colores) lo sigue horneando el motor; aquí se envuelve sfaBake para SUPERPONER, en el radio real,
   el borde pintado con el canon (aro con luz arriba-izquierda, contorno 1 px, marcas). La capa se pinta con la paleta del tema EFECTIVO
   (variantes ~h ~p ~k y tinte por arena). Solo (tipo|tema base|tamaño) con capa aprobada; el resto no cambia. No toca daño, alcance,
   duración ni azar. ?ua=0 vuelve al arte anterior. */
const ABS = {off: (function(){ try{ return /[?&](ua|sfa)=0\b/.test(location.search); }catch(e){ return false; } })(), map: {}, hits: 0, hooked: false, cache: new Map(), arena: null};
function abaSfaDecode(s, n){
  const out = new Uint8Array(n); let p = 0, i = 0;
  while(i < s.length){ const d = s.charCodeAt(i++) - 48; let j = i; while(j < s.length && s[j] !== ';') j++; const run = parseInt(s.slice(i, j), 10); i = j + 1; out.fill(d, p, p + run); p += run; }
  return out;
}
function abaSfaRgb(h){ const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function abaSfaOverlay(art, themes, size, w, h, frames){   // themes: nombre o lista de temas base que comparten esta capa
  if(ABS.off || typeof sfaBake !== 'function') return;
  const fr = frames.map(s => abaSfaDecode(s, w * h));
  for(const th of [].concat(themes)) ABS.map[art + '|' + th + '|' + size] = {w, h, fr};
  if(ABS.hooked) return; ABS.hooked = true;
  const orig = sfaBake;
  sfaBake = function(art, theme, size, arc){
    const base = orig.apply(this, arguments), o = ABS.map[art + '|' + String(theme).split('~')[0] + '|' + size];
    if(!o || !base || base.w !== o.w || base.h !== o.h || base.n !== o.fr.length) return base;
    const arena = sfaArenaKey(); if(arena !== ABS.arena){ ABS.cache.clear(); ABS.arena = arena; }
    const key = art + '|' + theme + '|' + size; let b = ABS.cache.get(key); if(b && b.src === base.cv) return b;
    let T = sfaTheme(theme); if(!T) return base;
    if(arena) T = sfaTintTheme(T, arena);
    const P = [T.pal.o, T.pal.d, T.pal.a, T.pal.b, T.pal.c].map(abaSfaRgb), n = o.fr.length;
    const cv = document.createElement('canvas'); cv.width = base.cv.width; cv.height = base.cv.height; const g = cv.getContext('2d'); g.drawImage(base.cv, 0, 0);
    const im = g.getImageData(0, 0, cv.width, cv.height);
    for(let f = 0; f < n; f++) for(let y = 0; y < o.h; y++) for(let x = 0; x < o.w; x++){ const t = o.fr[f][y * o.w + x]; if(!t) continue; const k = (y * cv.width + f * o.w + x) * 4, c = P[t - 1]; im.data[k] = c[0]; im.data[k + 1] = c[1]; im.data[k + 2] = c[2]; im.data[k + 3] = 255; }
    g.putImageData(im, 0, 0); b = {cv, w: base.w, h: base.h, n: base.n, src: base.cv}; ABS.cache.set(key, b); ABS.hits++; return b;
  };
}
"""


def place_unified(idx, new_tags=()):
    """Coloca TODAS las etiquetas de vfx-unified juntas, después del último script de vfx-b (los decales deben existir cuando se reemplazan):
    runtimes primero, luego los módulos en su orden. Idempotente."""
    pat = re.compile(r'<script src="js/champions/vfx-unified/[^"]+"></script>\n?')
    existing = [m.group(0).strip() for m in pat.finditer(idx)]
    idx = pat.sub('', idx)
    tags = []
    for t in existing + list(new_tags):
        if t not in tags:
            tags.append(t)
    tags.sort(key=lambda t: 0 if t.endswith('/runtime.js"></script>') or t.endswith('/sfa-runtime.js"></script>') else 1)
    last = list(re.finditer(r'<script src="js/champions/vfx-b/[^"]+"></script>', idx))[-1]
    return idx[:last.end()] + '\n' + '\n'.join(tags) + idx[last.end():]


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
    lines = ["'use strict';",
             f"/* js/champions/vfx-unified/{guardian}.js — GENERADO por tools/art/ability-art/architect.py desde specs/{guardian}.json. No editar a mano:",
             "   se vuelve a pintar con `python3 tools/art/ability-art/pipeline.py run specs/" + guardian + ".json`. */",
             '{']
    for ab in spec['abilities']:
        r = results.get(ab['id'])
        if not r or r['status'] != 'PASS':
            continue
        pal = canon.ramp_hex_for(spec, ab)
        fr = r['frames']
        h, w = fr[0].shape
        kind = 'beam' if ab['kind'] == 'beam' else 'decal'
        lines.append(f"  // {ab['id']} · puntaje {r['score']} (arte anterior {r.get('baseline_total')}, mejora {r.get('improvement')})")
        if spec.get('engine') == 'sfa':
            sf = ab['sfa']
            lines.append(f"  abaSfaOverlay('{sf['art']}', '{sf['theme']}', {sf['size']}, {w}, {h}, [")
        else:
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
    sfa = spec.get('engine') == 'sfa'
    rtname = 'sfa-runtime.js' if sfa else 'runtime.js'
    rt, gm = UA_DIR / rtname, UA_DIR / f'{guardian}.js'
    index_before = INDEX.read_text(encoding='utf-8')
    prev = {p: p.read_text(encoding='utf-8') for p in (rt, gm) if p.exists()}
    rt.write_text(RUNTIME_SFA if sfa else RUNTIME, encoding='utf-8')
    gm.write_text(module_source(guardian, spec, results), encoding='utf-8')
    tags = [f'<script src="js/champions/vfx-unified/{f}"></script>' for f in (rtname, f'{guardian}.js')]
    INDEX.write_text(place_unified(index_before, tags), encoding='utf-8')
    if not smoke:
        return True, f'integradas {passed} (sin prueba de humo)'
    p = subprocess.run(['node', str(canon.HERE / ('smoke-sfa.js' if sfa else 'smoke-integration.js')), guardian, ','.join(passed)], capture_output=True, text=True,
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


# ---------------------------------------------------------------- skill-fx-a: una sola capa compartida por todos los temas aprobados
def sfa_collect(spec_paths):
    """[(tema, tamaño, w, h, frames)] de lo APROBADO en cada ficha sfa_*, repintado desde la ficha final (determinista)."""
    import painter
    items = []
    for sp in spec_paths:
        spec = canon.load_json(sp)
        g = spec['guardian']
        sm = canon.load_json(canon.OUT_DOCS / g / 'summary.json')
        final = canon.load_json(canon.OUT_DOCS / g / 'spec.final.json')
        for ab in final['abilities']:
            if sm['state'].get(ab['id'], {}).get('status') == 'PASS':
                fr = painter.frames_for(g, ab)
                items.append((ab['sfa']['theme'], ab['sfa']['size'], fr[0].shape[1], fr[0].shape[0], fr, ab['sfa']['art']))
    return items


def sfa_module_source(items):
    groups = {}
    for theme, size, w, h, fr, art in items:
        key = (art, size, w, h, tuple(rle(f) for f in fr))
        groups.setdefault(key, []).append(theme)
    lines = ["'use strict';",
             "/* js/champions/vfx-unified/sfa_overlay.js — GENERADO por tools/art/ability-art/architect.py (integrate_sfa) desde specs/sfa_*.json.",
             "   Borde unificado compartido por los temas de skill-fx-a aprobados. No editar a mano: python3 tools/art/ability-art/pipeline.py run-sfa. */", '{']
    for (art, size, w, h, frs), themes in sorted(groups.items(), key=lambda kv: (kv[0][0], kv[0][1])):
        lines.append(f"  abaSfaOverlay('{art}', {json.dumps(sorted(themes))}, {size}, {w}, {h}, [")
        for f in frs:
            lines.append(f"    '{f}',")
        lines.append('  ]);')
    lines.append('}')
    return '\n'.join(lines) + '\n'


def integrate_sfa(spec_paths, smoke=True, base_url='http://127.0.0.1:8750/'):
    items = sfa_collect(spec_paths)
    if not items:
        return False, 'nada que integrar'
    UA_DIR.mkdir(parents=True, exist_ok=True)
    rt, gm = UA_DIR / 'sfa-runtime.js', UA_DIR / 'sfa_overlay.js'
    index_before = INDEX.read_text(encoding='utf-8')
    prev = {p: p.read_text(encoding='utf-8') for p in (rt, gm) if p.exists()}
    rt.write_text(RUNTIME_SFA, encoding='utf-8')
    gm.write_text(sfa_module_source(items), encoding='utf-8')
    INDEX.write_text(place_unified(index_before, [f'<script src="js/champions/vfx-unified/{f}"></script>' for f in ('sfa-runtime.js', 'sfa_overlay.js')]), encoding='utf-8')
    combo = canon.OUT_DOCS / 'sfa_overlay'
    combo.mkdir(parents=True, exist_ok=True)
    abil = [{'id': f'{t}_{art}{s}', 'sfa': {'art': art, 'theme': t, 'size': s}} for t, s, w, h, fr, art in items]
    canon.save_json(combo / 'combined.json', {'guardian': 'sfa_overlay', 'abilities': abil})
    if smoke:
        p = subprocess.run(['node', str(canon.HERE / 'smoke-sfa.js'), str(combo / 'combined.json'), ','.join(x['id'] for x in abil)], capture_output=True, text=True,
                           env={**__import__('os').environ, 'BASE_URL': base_url}, timeout=900)
        if p.returncode != 0:
            INDEX.write_text(index_before, encoding='utf-8')
            for path in (rt, gm):
                path.write_text(prev[path], encoding='utf-8') if path in prev else (path.unlink() if path.exists() else None)
            return False, 'REVERTIDO — la prueba de humo falló:\n' + (p.stdout + p.stderr)[-1500:]
        return True, f'{len(items)} capas en {len({t for t, *_ in items})} temas; humo OK: ' + p.stdout.strip().splitlines()[-1]
    return True, f'{len(items)} capas (sin humo)'
