#!/usr/bin/env python3
"""Hoja de Runway (grilla sobre croma verde) -> atlas del motor (enemyAtlasPackLoad).
Pasos: croma verde -> alfa 0/255; recorte por celda (solo el cuerpo mayor, sin vecinos); escala comun a todos los cuadros
(por la altura del cuadro de referencia, nunca cuadro por cuadro); pies alineados en el mismo anchor; reduccion F a pixel nativo;
paleta propia de K colores por k-means (sin degrade); contorno oscuro de 1 px; atlas de 8 columnas.
Uso: python3 tools/art/runway/build_sheet.py <spec.json>   (spec: ver art-source/runway-enemies/<arena>/<tipo>/spec.json)
Salida: atlas.png + meta.json + preview.png en la carpeta de salida del spec. No instala: eso lo hace el spec/loader."""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from scipy.cluster.vq import kmeans2, vq

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))

def key_green(im):
    a = np.asarray(im.convert('RGB')).astype(np.int32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    green = (g - np.maximum(r, b)) > 55
    alpha = ~green
    alpha = ndi.binary_opening(alpha, iterations=1)
    out = np.dstack([a, (alpha * 255)]).astype(np.uint8)
    # despill: borde verdoso
    edge = alpha & ~ndi.binary_erosion(alpha, iterations=1)
    sp = edge & (out[..., 1] > np.maximum(out[..., 0], out[..., 2]))
    out[..., 1][sp] = np.maximum(out[..., 0], out[..., 2])[sp]
    return out

def row_figures(rgba, y0, y1, gap=10, minpx=400):
    """Figuras de una banda de filas: columnas de alfa unidas si el hueco entre ellas es menor que `gap` px (la grilla de Runway no es pareja)."""
    band = rgba[y0:y1]; occ = (band[..., 3] > 0).sum(0) > 0
    runs, st = [], None
    for x, v in enumerate(list(occ) + [False]):
        if v and st is None: st = x
        if not v and st is not None: runs.append([st, x]); st = None
    merged = []
    for r in runs:
        if merged and r[0] - merged[-1][1] < gap: merged[-1][1] = r[1]
        else: merged.append(r)
    figs = []
    for x0, x1 in merged:
        sub = band[:, x0:x1].copy()
        lab, n = ndi.label(sub[..., 3] > 0)
        if n == 0: continue
        sizes = ndi.sum(sub[..., 3] > 0, lab, range(1, n + 1))
        if sizes.sum() < minpx: continue
        keep = np.isin(lab, [i for i, z in enumerate(sizes, 1) if z >= sizes.max() * 0.02])
        sub[..., 3] = np.where(keep, 255, 0); ys, xs = np.where(keep)
        figs.append(sub[ys.min():ys.max() + 1, xs.min():xs.max() + 1])
    return figs

def row_bands(rgba, gap=14, minh=60):
    """Bandas de filas por huecos reales de alfa (Runway no respeta tercios exactos)."""
    occ = (rgba[..., 3] > 0).sum(1) > 2
    runs, st = [], None
    for y, v in enumerate(list(occ) + [False]):
        if v and st is None: st = y
        if not v and st is not None: runs.append([st, y]); st = None
    m = []
    for r in runs:
        if m and r[0] - m[-1][1] < gap: m[-1][1] = r[1]
        else: m.append(r)
    return [b for b in m if b[1] - b[0] >= minh]

def auto_layout(rowf):
    """Elige cuadros sin intervencion: descarta texto/restos/figuras fusionadas y reparte caminar, ataque, golpe y muerte por filas."""
    allf = [(r, i, f) for r, fl in rowf.items() for i, f in enumerate(fl)]
    hs = sorted(f.shape[0] for _, _, f in allf); med = hs[len(hs) // 2]
    ws = sorted(f.shape[1] for _, _, f in allf); medw = ws[len(ws) // 2]
    def ink(f): return float((f[..., 3] > 0).mean())
    good = {}
    for r, fl in rowf.items():
        keep = []
        for i, f in enumerate(fl):
            h, w = f.shape[:2]
            if w > medw * 1.7 or (h < med * 0.3) or ink(f) < 0.22: continue          # fusionadas, restos, texto
            keep.append(i)
        good[r] = keep
    rs = [r for r in sorted(good) if len(good[r]) >= 2]
    two = len(rs) == 2
    if not rs: raise SystemExit('auto: sin cuadros utiles')
    pick = lambda r, a, b: [(r, i) for i in good[r][a:b]]
    walk = pick(rs[0], 0, 6)
    atk = pick(rs[1], 0, 5) if len(rs) > 1 else walk[-3:]
    if two: atk = pick(rs[1], 0, len(good[rs[1]]) - 1)[:4]            # 2 filas: la ultima figura es el montoncito de la muerte
    tail = pick(rs[-1], 0, 99) if len(rs) > 2 else atk
    death = tail[-3:] if len(tail) >= 3 else tail
    if two: death = [atk[-1], pick(rs[1], 0, 99)[-1]]
    hit = [atk[-1]] if atk else [walk[-1]]
    idle = [walk[0], walk[min(1, len(walk) - 1)], walk[0], walk[min(2, len(walk) - 1)]]
    order = []
    for g in (walk, atk, hit, death, idle):
        for p in g:
            if p not in order: order.append(p)
    ix = lambda L: [list(p) for p in L]
    print('auto', {k: len(v) for k, v in dict(walk=walk, atk=atk, hit=hit, death=death).items()}, file=sys.stderr)
    return order, dict(walk=ix(walk), atk=ix(atk), hit=ix(hit), death=ix(death), idle=ix(idle))

def main():
    spec = json.load(open(sys.argv[1])); base = os.path.dirname(os.path.abspath(sys.argv[1]))
    sheet = Image.open(os.path.join(base, spec['sheet']))
    rgba = key_green(sheet); H, W = rgba.shape[:2]
    R, C = spec['rows'], spec['cols']; cw, ch = W / C, H / R
    F, K = spec.get('F', 2), spec.get('K', 32)
    order = [tuple(p) for p in spec.get('frames', [])]           # lista de [fila, col] en el orden del atlas
    rowf = {}
    even = [(int(r * ch), int((r + 1) * ch)) for r in range(R)]
    if 'bandsY' in spec: bands = spec['bandsY']
    else:
        bands = row_bands(rgba, spec.get('rowGap', 6)) if spec.get('autoRows', True) else even
        if len(bands) != R: bands = even          # filas pegadas: tercios parejos (Runway las reparte parejas)
    R = len(bands)
    for r in range(R):
        rowf[r] = row_figures(rgba, bands[r][0], bands[r][1], spec.get('gap', 10))
        print('fila', r, 'figuras', len(rowf[r]), [f'{i}:{f.shape[1]}x{f.shape[0]}' for i, f in enumerate(rowf[r])], file=sys.stderr)
    if '--list' in sys.argv:
        from PIL import ImageDraw
        cell = 150; sh = Image.new('RGBA', (max(len(v) for v in rowf.values()) * cell, R * (cell + 14)), (58, 66, 88, 255)); d = ImageDraw.Draw(sh)
        for r, fl in rowf.items():
            for i, f in enumerate(fl):
                im = Image.fromarray(f, 'RGBA'); im.thumbnail((cell - 6, cell - 6), Image.NEAREST); sh.alpha_composite(im, (i * cell + 3, r * (cell + 14) + 14)); d.text((i * cell + 4, r * (cell + 14)), f'{r},{i}', fill=(255, 255, 0, 255))
        sh.save(os.path.join(base, 'figs.png')); return
    if spec.get('auto'):
        order, spec['sets'] = auto_layout(rowf)
    bodies = []
    for r, c in order:
        if c >= len(rowf[r]): raise SystemExit(f'falta figura {r},{c} (fila {r} tiene {len(rowf[r])})')
        bodies.append(rowf[r][c])
    refH = max(b.shape[0] for b in bodies[:spec.get('refFrames', len(bodies))]) if spec.get('refFromIdle') is None else bodies[spec['refFromIdle']].shape[0]
    target = spec.get('targetH', 84)                    # alto nativo (px) del cuadro de referencia
    s = target / refH / 1.0
    cwid = max(int(round(b.shape[1] * s)) for b in bodies) + 6
    cwid = max(cwid, spec.get('minW', 0)); chei = int(round(max(b.shape[0] for b in bodies) * s)) + 8
    A = np.zeros((len(bodies), chei, cwid, 4), np.uint8)
    for i, b in enumerate(bodies):
        im = Image.fromarray(b, 'RGBA')
        nw, nh = max(1, round(im.width * s)), max(1, round(im.height * s))
        im = im.resize((nw, nh), Image.BOX)
        arr = np.asarray(im)
        # mismo suelo en todos los cuadros: pies sobre la linea chei-5; los cuadros de muerte (que quedan mas bajos) tambien
        x = (cwid - nw) // 2; y = chei - 5 - nh
        A[i, y:y + nh, x:x + nw] = arr
    # paleta propia: k-means sobre todos los cuadros
    al = A[..., 3] > 127
    flat = A[..., :3][al].astype(np.float64)
    rng = np.random.default_rng(7)
    cent, _ = kmeans2(flat[rng.choice(len(flat), min(60000, len(flat)), replace=False)], K, minit='++', seed=7, iter=20)
    idx = vq(flat, cent)[0]
    q = np.zeros_like(A); q[..., :3][al] = np.clip(cent[idx], 0, 255).astype(np.uint8); q[..., 3][al] = 255
    # contorno 1 px oscuro
    for i in range(len(q)):
        a = q[i, ..., 3] > 0
        ring = ndi.binary_dilation(a, structure=np.ones((3, 3), bool)) & ~a
        q[i][ring] = (*spec.get('outline', (16, 14, 26)), 255)
    cols = 8; rows = -(-len(q) // cols)
    atlas = np.zeros((rows * chei, cols * cwid, 4), np.uint8)
    for i in range(len(q)):
        atlas[(i // cols) * chei:(i // cols + 1) * chei, (i % cols) * cwid:(i % cols + 1) * cwid] = q[i]
    out = os.path.join(base, spec.get('out', 'out')); os.makedirs(out, exist_ok=True)
    Image.fromarray(atlas, 'RGBA').save(os.path.join(out, 'atlas.png'), optimize=True)
    sets = {k: [order.index(tuple(p)) for p in v] for k, v in spec['sets'].items()}
    meta = {'w': cwid, 'h': chei, 'cols': cols, 'refH': int(target), 'anchor': round((chei - 5) / chei, 4), 'sets': sets}
    json.dump(meta, open(os.path.join(out, 'meta.json'), 'w'))
    bg = Image.new('RGBA', (atlas.shape[1] * 3, atlas.shape[0] * 3), (58, 66, 88, 255))
    bg.alpha_composite(Image.fromarray(atlas, 'RGBA').resize((atlas.shape[1] * 3, atlas.shape[0] * 3), Image.NEAREST))
    bg.save(os.path.join(out, 'preview.png'))
    print(json.dumps(meta))

if __name__ == '__main__': main()
