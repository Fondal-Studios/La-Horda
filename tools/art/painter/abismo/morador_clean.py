#!/usr/bin/env python3
"""El Que Mora Debajo / Tentáculo del Abismo: limpieza y repintado determinista (0 créditos).
- tex_carne.png traía texto de una captura de UI ("MATERIALES") dentro de la textura: se repinta limpia (carne con venas).
- Cuadros del ojo y tentáculo: se quitan barras/motas desconectadas del recorte (componentes sueltos).
Uso: python3 tools/art/painter/abismo/morador_clean.py [--install]"""
import sys, math, glob
from pathlib import Path
import numpy as np
import cv2
from PIL import Image
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
sys.path.insert(0, str(HERE.parent))
from enemy_paint import Canvas, ramp, limit_palette

FLESH = ramp('#5a1e44'); VEIN = ramp('#8a3050'); DARK = ramp('#2a0e30')
SRC = ROOT / 'assets/vfx/abismo'


def tex_carne():
    W, H = 56, 205; c = Canvas(W, H, '#1a0a22')
    c.part(np.ones((H, W), bool), DARK, edge=False, dither=True, depth=40, bias=0.25)
    for k in range(9):
        x0 = 3 + k * 6.4
        pts = [(x0 + math.sin(y / 17.0 + k * 1.7) * 4.0, y) for y in range(-6, H + 8, 10)]
        c.part(c.m_line(pts, 2.4 + (k % 3) * 0.7) & np.ones((H, W), bool), FLESH if k % 2 else VEIN, edge=False, bias=0.05)
    for k in range(14):
        x = (k * 37) % W; y = (k * 71) % H
        c.part(c.m_ellipse(x, y, 3.2, 2.2), DARK, edge=False, bias=-0.1)
        c.px(x - 1, y - 1, VEIN[3])
    a = np.zeros((H, W, 4), np.uint8); a[..., :3] = c.rgb; a[..., 3] = 255
    return a


def clean(path, tent=False):
    clean.tent = tent
    a = np.array(Image.open(path).convert('RGBA')); op = (a[..., 3] > 0).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(op, connectivity=8)
    big = st[1:, cv2.CC_STAT_AREA].max() if n > 1 else 1; H = a.shape[0]; drop = 0
    for i in range(1, n):
        x, y, w, h, ar = st[i]
        if i == 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA])): continue
        if ar < 0.03 * big or (w <= 3 and h >= 0.45 * H):
            a[lab == i] = 0; drop += 1
    op2 = (a[..., 3] > 0).astype(np.uint8)
    opn = cv2.morphologyEx(op2, cv2.MORPH_OPEN, np.ones((1, 5), np.uint8))
    Wd = a.shape[1]; edge = np.zeros_like(op2, bool); edge[:, :8] = True; edge[:, Wd - 8:] = True
    rm = edge & (op2 > 0) & (opn == 0)
    drop += int(rm.any()); a[rm] = 0
    lum = a[..., :3].astype(float).mean(-1)
    for x in list(range(0, 7)) + list(range(Wd - 7, Wd)):      # barras oscuras de recorte pegadas al borde
        col = a[:, x, 3] > 0
        if col.sum() > 0.55 * a.shape[0] and lum[col, x].mean() < 55:
            a[:, x] = 0; drop += 1
    if not clean.tent:                                         # esquinas negras del recorte: relleno desde el borde por píxeles casi negros
        dark = ((a[..., 3] > 0) & (a[..., :3].astype(float).mean(-1) < 30)) | (a[..., 3] == 0)
        n2, lab2 = cv2.connectedComponents(dark.astype(np.uint8), connectivity=4)
        edge_ids = set(np.unique(np.concatenate([lab2[0], lab2[-1], lab2[:, 0], lab2[:, -1]]))) - {0}
        yy, xx = np.mgrid[0:a.shape[0], 0:a.shape[1]]
        band = (np.minimum(np.minimum(yy, a.shape[0] - 1 - yy), np.minimum(xx, a.shape[1] - 1 - xx)) < 7)
        rm = np.isin(lab2, list(edge_ids)) & (a[..., 3] > 0) & band
        drop += int(rm.sum()); a[rm] = 0
    if not clean.tent:                                         # fondo cuadrado oscuro fuera del anillo del ojo
        yy, xx = np.mgrid[0:a.shape[0], 0:a.shape[1]]
        lum2 = a[..., :3].astype(float).mean(-1)
        cx, cy = a.shape[1] / 2, a.shape[0] / 2
        r = np.hypot((xx - cx) / (a.shape[1] * 0.47), (yy - cy) / (a.shape[0] * 0.47))
        rm = (r > 1.0) & (a[..., 3] > 0) & (lum2 < 60)
        drop += int(rm.sum()); a[rm] = 0
    return a, drop


def main():
    out = {'tex_carne': tex_carne()}
    tot = 0
    for p in sorted(glob.glob(str(SRC / 'ojo_*_[0-9].png'))) + [str(SRC / 'tent_grande_0.png')]:
        a, d = clean(p, 'tent' in p); out[Path(p).stem] = a; tot += d
    dst = SRC if '--install' in sys.argv else ROOT / 'tools/art/painter/out/abismo'
    dst.mkdir(parents=True, exist_ok=True)
    for k, a in out.items():
        Image.fromarray(a).save(dst / (k + '.png'), optimize=True)
    print('escrito', dst, len(out), 'componentes sueltos quitados:', tot)


if __name__ == '__main__': main()
