#!/usr/bin/env python3
"""Hoja de Runway (N poses sobre croma verde) -> celdas de atlas (96x96 por defecto).
Pasos: croma -> alfa 0/255 (sin halo verde); separa los N personajes por componentes conectados (dilatados, para que el aro y el pelo
queden con su cuerpo) y los ordena de izquierda a derecha; ESCALA COMUN a todos los cuadros (por la altura del cuadro de referencia:
--ref-index con --ref-h px; nunca cuadro por cuadro; solo se baja la escala comun si el cuadro mas grande no cabe en la celda);
reduccion a pixel nativo por promedio de area (respeta los bloques de la fuente) + cuantizacion a la paleta del propio atlas
(--palette-from) o a <=K colores sin degrade; contorno oscuro de 1 px; UNA silueta conectada por cuadro; pies en la misma fila
(--feet-row) y centrado horizontal.
  python3 tools/art/sheet-to-cells.py <hoja.png> --out <dir> [--n 4] [--cell 96] [--ref-index 3] [--ref-h 76] [--feet-row 89]
       [--palette-from assets/sprites/champions/ynara/atlas.png] [--colors 32] [--scale S] [--max-h 88] [--gap 8]
Salida: <dir>/cells/cell_XX.png, <dir>/strip.png (cuadros en fila) y <dir>/report.json (escala, alturas, colores, componentes). No instala."""
import argparse, json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from scipy.cluster.vq import kmeans2

def key_green(im):
    a = np.asarray(im.convert('RGB')).astype(np.int32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    green = (g - np.maximum(r, b)) > 55
    alpha = ndi.binary_opening(~green, iterations=1)
    out = np.dstack([a, alpha * 255]).astype(np.uint8)
    edge = alpha & ~ndi.binary_erosion(alpha, iterations=2)       # despill: sin borde verdoso
    sp = edge & (out[..., 1] > np.maximum(out[..., 0], out[..., 2]))
    out[..., 1][sp] = np.maximum(out[..., 0], out[..., 2])[sp]
    return out, alpha

def split_figures(alpha, n, link, trim=0):
    lab, k = ndi.label(ndi.binary_dilation(alpha, iterations=link))
    sizes = ndi.sum(alpha, lab, range(1, k + 1))
    keep = list(np.argsort(sizes)[::-1][:n] + 1)
    if len(keep) < n: sys.exit(f'solo {len(keep)} figuras separadas (se pidieron {n}); baja --link')
    figs = []
    for l in keep:
        m = (lab == l) & alpha
        if trim:   # sombra de suelo pintada por el modelo: se recortan las ultimas filas del cuadro
            yb = np.where(m.any(1))[0].max(); m[yb - trim + 1:] = False
        ys, xs = np.where(m); figs.append((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1, m))
    figs.sort(key=lambda f: f[0])
    return figs

def srgb_lab(rgb):
    c = rgb / 255.0; c = np.where(c > .04045, ((c + .055) / 1.055) ** 2.4, c / 12.92)
    M = np.array([[.4124, .3576, .1805], [.2126, .7152, .0722], [.0193, .1192, .9505]])
    xyz = c @ M.T / np.array([.9505, 1, 1.089]); f = np.where(xyz > .008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)

def build_palette(path, K):
    a = np.asarray(Image.open(path).convert('RGBA')).reshape(-1, 4); px = a[a[:, 3] > 200][:, :3].astype(float)
    ctr, _ = kmeans2(px[np.random.RandomState(7).choice(len(px), min(60000, len(px)), replace=False)], K, minit='++', seed=7, iter=25)
    ctr = np.unique(np.clip(np.round(ctr), 0, 255).astype(np.uint8), axis=0)
    # color de contorno: mediana de los pixeles de borde del atlas propio
    A = np.asarray(Image.open(path).convert('RGBA')); op = A[..., 3] > 200
    edge = op & ~ndi.binary_erosion(op, iterations=1); ec = np.median(A[edge][:, :3], 0).astype(np.uint8)
    return ctr, tuple(int(v) for v in ec)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('sheet'); ap.add_argument('--out', required=True)
    ap.add_argument('--n', type=int, default=4); ap.add_argument('--cell', type=int, default=96)
    ap.add_argument('--ref-index', type=int, default=3); ap.add_argument('--ref-h', type=float, default=76)
    ap.add_argument('--scale', type=float, default=None, help='escala comun explicita (px nativos por px de hoja); anula --ref-*')
    ap.add_argument('--feet-row', type=int, default=None); ap.add_argument('--max-h', type=int, default=None)
    ap.add_argument('--palette-from', default=None); ap.add_argument('--colors', type=int, default=32)
    ap.add_argument('--link', type=int, default=14, help='dilatacion (px de hoja) para unir aro/pelo con su cuerpo')
    ap.add_argument('--gap', type=int, default=3, help='huecos de este tamano (px nativos) entre aro y cuerpo se puentean')
    ap.add_argument('--outline', default=None)
    ap.add_argument('--trim-feet', type=int, default=0, help='recorta las ultimas N filas de cada figura de la hoja (sombra de suelo del modelo)')
    a = ap.parse_args(); C = a.cell; feet = a.feet_row if a.feet_row is not None else int(round(C * 0.9375)) - 1
    max_h = a.max_h or feet + 1 - 2
    im = Image.open(a.sheet); rgba, alpha = key_green(im)
    figs = split_figures(alpha, a.n, a.link, a.trim_feet)
    hs = [f[3] - f[1] for f in figs]; ws = [f[2] - f[0] for f in figs]
    s = a.scale if a.scale else a.ref_h / hs[a.ref_index]
    s_fit = min(max_h / max(hs), (C - 6) / max(ws))
    clamped = s > s_fit
    if clamped: s = s_fit
    pal, oc = build_palette(a.palette_from, a.colors) if a.palette_from else (None, None)
    oc = tuple(int(v) for v in a.outline.split(',')) if a.outline else (oc or (42, 28, 24))
    plab = srgb_lab(pal.astype(float)) if pal is not None else None
    os.makedirs(os.path.join(a.out, 'cells'), exist_ok=True); cells = []; rep = []
    for i, (x0, y0, x1, y1, m) in enumerate(figs):
        sub = rgba[y0:y1, x0:x1, :3].astype(float); ma = m[y0:y1, x0:x1].astype(float)
        nw, nh = max(1, round((x1 - x0) * s)), max(1, round((y1 - y0) * s))
        # promedio de area con alfa premultiplicado (respeta los bloques; sin degrade porque luego se cuantiza y se binariza)
        pm = Image.fromarray(np.uint8(np.dstack([sub * ma[..., None], ma * 255]).clip(0, 255)), 'RGBA')
        A = np.asarray(ma * 255, np.uint8); a_s = np.asarray(Image.fromarray(A).resize((nw, nh), Image.BOX)).astype(float) / 255
        rgb_s = np.asarray(Image.fromarray(np.uint8(sub * ma[..., None])).resize((nw, nh), Image.BOX)).astype(float)
        rgb_s = rgb_s / np.maximum(a_s[..., None], 1e-3)
        al = a_s >= 0.5
        al = ndi.binary_closing(np.pad(al, 3), iterations=1)[3:-3, 3:-3] | al
        lab, k = ndi.label(al, np.ones((3, 3)))
        if k > 1:   # una silueta: el cuerpo mayor + lo que este a <= gap px (aro); lo demas son restos
            sizes = ndi.sum(al, lab, range(1, k + 1)); main = lab == (np.argmax(sizes) + 1)
            near = ndi.binary_dilation(main, iterations=a.gap)
            al = np.isin(lab, [j for j in range(1, k + 1) if (near & (lab == j)).any() and sizes[j - 1] >= 3])
        rgb_s = np.clip(rgb_s, 0, 255)
        if plab is not None:
            q = rgb_s.reshape(-1, 3); d = ((srgb_lab(q)[:, None, :] - plab[None]) ** 2).sum(-1); rgb_s = pal[d.argmin(1)].reshape(nh, nw, 3)
        out = np.zeros((nh + 4, nw + 4, 4), np.uint8); out[2:-2, 2:-2, :3] = rgb_s.astype(np.uint8); out[2:-2, 2:-2, 3] = al * 255
        solid = out[..., 3] > 0
        ring = ndi.binary_dilation(solid, structure=ndi.generate_binary_structure(2, 1)) & ~solid
        out[ring] = (*oc, 255)
        # puente del aro: si tras el contorno sigue habiendo >1 componente (8-conectividad), se une con el contorno al cuerpo mas cercano
        lab2, k2 = ndi.label(out[..., 3] > 0, np.ones((3, 3)))
        if k2 > 1:
            sizes = ndi.sum(out[..., 3] > 0, lab2, range(1, k2 + 1)); mn = np.argmax(sizes) + 1
            for j in range(1, k2 + 1):
                if j == mn: continue
                ys, xs = np.where(lab2 == j); ym, xm = np.where(lab2 == mn)
                d = (ys[:, None] - ym[None]) ** 2 + (xs[:, None] - xm[None]) ** 2; p, q2 = np.unravel_index(d.argmin(), d.shape)
                (y_a, x_a), (y_b, x_b) = (ys[p], xs[p]), (ym[q2], xm[q2])
                for t in np.linspace(0, 1, int(max(abs(y_b - y_a), abs(x_b - x_a))) + 2):
                    yy, xx = int(round(y_a + (y_b - y_a) * t)), int(round(x_a + (x_b - x_a) * t))
                    if out[yy, xx, 3] == 0: out[yy, xx] = (*oc, 255)
        ys, xs = np.where(out[..., 3] > 0); crop = out[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
        ch, cw = crop.shape[:2]
        if ch > feet + 1 or cw > C: sys.exit(f'cuadro {i}: {cw}x{ch} no cabe en {C}x{feet + 1}')
        cell = np.zeros((C, C, 4), np.uint8); oy = feet - ch + 1; ox = int(round(C / 2 - cw / 2)); ox = max(0, min(C - cw, ox))
        cell[oy:oy + ch, ox:ox + cw] = crop
        Image.fromarray(cell, 'RGBA').save(os.path.join(a.out, 'cells', f'cell_{i:02d}.png')); cells.append(cell)
        l3, k3 = ndi.label(cell[..., 3] > 0, np.ones((3, 3)))
        rep.append({'i': i, 'bbox_w': int(cw), 'bbox_h': int(ch), 'feet_row': int(oy + ch - 1), 'components': int(k3),
                    'colors': int(len(np.unique(cell[cell[..., 3] > 0][:, :3], axis=0))), 'sheet_h': int(hs[i])})
    Image.fromarray(np.concatenate(cells, 1), 'RGBA').save(os.path.join(a.out, 'strip.png'))
    json.dump({'scale': s, 'scale_clamped_to_fit': bool(clamped), 'cell': C, 'outline': oc, 'frames': rep}, open(os.path.join(a.out, 'report.json'), 'w'), indent=1)
    print(json.dumps({'scale': round(s, 4), 'clamped': bool(clamped), 'frames': rep}))

if __name__ == '__main__': main()
