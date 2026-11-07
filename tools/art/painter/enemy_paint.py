#!/usr/bin/env python3
"""LA HORDA — PINTOR DE ENEMIGOS (tools/art/painter/enemy_paint.py)

Pintor DETERMINISTA para enemigos (sin generador de imágenes, sin azar: misma entrada -> mismos bytes).
Cada criatura se arma con formas (elipses, cápsulas, polígonos) pintadas atrás->adelante. El sombreado sale
de un campo de altura (distancia al borde) con luz arriba-izquierda, cuantizado a rampas de 4 tonos por material;
cada parte lleva su contorno interior y la silueta final un contorno exterior de 1 px (sin halo, sin alfa parcial).
Todo se dibuja a escala nativa (1 px de arte = 1 px del atlas), mirando a la DERECHA (el juego espeja con fx).

Salida por criatura: atlas.png (cuadros de w x h, 8 columnas) + meta.json (mismo formato que ENEMY_RUNWAY_SHEETS:
w, h, cols, refH, anchor, sets) + preview.png. Paleta <= 48 colores por atlas (se verifica y se reduce si hace falta).

Uso:
  python3 tools/art/painter/enemy_paint.py build <id|all> [--out DIR]     # pinta y deja atlas+meta en DIR/<id>/
  python3 tools/art/painter/enemy_paint.py install <id|all>               # copia a assets/sprites/enemies/<arena>/<id>/v2/
Las criaturas viven en tools/art/painter/enemies/<id>.py (función draw(c, P) + SPEC).
"""
import json, math, sys, importlib, argparse
from pathlib import Path
import numpy as np
from PIL import Image
import cv2

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
LIGHT = np.array([-0.55, -0.70])  # arriba-izquierda


# ------------------------------------------------------------------ color
def hex2rgb(h):
    h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], float)


def ramp(base, n=4, warm=True):
    """Rampa oscuro->claro de n tonos desde un color base (sombras frías/saturadas, luces cálidas)."""
    b = hex2rgb(base) if isinstance(base, str) else np.array(base, float)
    out = []
    for i in range(n):
        k = i / (n - 1)               # 0 oscuro .. 1 claro
        f = 0.30 + 1.05 * k           # factor de luz (base cae en ~0.62)
        c = b * f
        if k < 0.5:                   # sombras: hacia violeta/azul oscuro
            c = c * 0.9 + np.array([10, 4, 22]) * (0.5 - k) * 1.2
        else:                         # luces: hacia cálido
            c = c + np.array([30, 18, 4]) * (k - 0.5) * (1.4 if warm else 0.6)
        out.append(np.clip(c, 0, 255))
    return [tuple(int(round(v)) for v in c) for c in out]


# ------------------------------------------------------------------ lienzo
class Canvas:
    def __init__(self, w, h, outline='#140a10'):
        self.w, self.h = w, h
        self.rgb = np.zeros((h, w, 3), np.uint8)
        self.a = np.zeros((h, w), bool)
        self.outline = tuple(int(v) for v in hex2rgb(outline))
        self.yy, self.xx = np.mgrid[0:h, 0:w]
        self.flash = 0.0   # 0..1: aclara todo (cuadro de golpe)
        self.fade = 1.0    # <1: disuelve (muerte) quitando píxeles por patrón fijo

    # ---- máscaras
    def m_ellipse(self, cx, cy, rx, ry, rot=0.0):
        dx, dy = self.xx + 0.5 - cx, self.yy + 0.5 - cy
        if rot:
            c, s = math.cos(rot), math.sin(rot); dx, dy = dx * c + dy * s, -dx * s + dy * c
        return (dx / max(rx, .5)) ** 2 + (dy / max(ry, .5)) ** 2 <= 1.0

    def m_poly(self, pts):
        im = np.zeros((self.h, self.w), np.uint8)
        cv2.fillPoly(im, [np.round(np.array(pts, float)).astype(np.int32)], 1, lineType=cv2.LINE_8)
        return im.astype(bool)

    def m_capsule(self, p0, p1, r0, r1=None):
        r1 = r0 if r1 is None else r1
        x0, y0 = p0; x1, y1 = p1
        dx, dy = x1 - x0, y1 - y0; L2 = dx * dx + dy * dy or 1e-6
        px, py = self.xx + 0.5 - x0, self.yy + 0.5 - y0
        t = np.clip((px * dx + py * dy) / L2, 0, 1)
        qx, qy = x0 + t * dx, y0 + t * dy
        r = r0 + (r1 - r0) * t
        return (self.xx + 0.5 - qx) ** 2 + (self.yy + 0.5 - qy) ** 2 <= r * r

    def m_line(self, pts, r=1.0):
        m = np.zeros((self.h, self.w), bool)
        for a, b in zip(pts[:-1], pts[1:]): m |= self.m_capsule(a, b, r)
        return m

    # ---- pintura
    def part(self, mask, mat, edge=True, bias=0.0, dither=True, depth=None, over=True):
        """Pinta `mask` con la rampa `mat` (lista de 4 tonos). bias>0 aclara, <0 oscurece."""
        if not mask.any(): return mask
        m8 = mask.astype(np.uint8)
        d = cv2.distanceTransform(m8, cv2.DIST_L2, 3)
        R = depth if depth else max(2.0, min(6.0, d.max()))
        hgt = np.minimum(d, R) / R
        hgt = np.sqrt(hgt)
        hgt = cv2.GaussianBlur(hgt.astype(np.float32), (0, 0), 0.9)
        gx = cv2.Sobel(hgt, cv2.CV_32F, 1, 0, ksize=3) / 8.0
        gy = cv2.Sobel(hgt, cv2.CV_32F, 0, 1, ksize=3) / 8.0
        # el gradiente apunta al interior; la luz da en bordes que miran a la luz (gradiente opuesto a LIGHT)
        lam = -(gx * LIGHT[0] + gy * LIGHT[1]) * 2.4
        lam = np.clip(lam, -1, 1)
        # luz global suave arriba-izquierda dentro de la parte
        ys, xs = np.nonzero(mask)
        cx, cy = xs.mean(), ys.mean(); ext = max(xs.max() - xs.min(), ys.max() - ys.min(), 4)
        gl = ((self.xx - cx) * LIGHT[0] + (self.yy - cy) * LIGHT[1]) / ext
        s = 0.50 + 0.55 * lam + 0.55 * gl + bias
        if dither:
            bay = np.array([[0, 2], [3, 1]], float) / 4.0 - 0.375
            s = s + 0.07 * bay[self.yy % 2, self.xx % 2]
        n = len(mat)
        idx = np.clip(np.floor(s * (n - 0.01) + 0.0).astype(int), 1, n - 1)  # tono 0 queda para contornos
        pal = np.array(mat, np.uint8)
        col = pal[idx]
        if self.flash:
            col = np.clip(col.astype(float) * (1 - self.flash) + 255 * self.flash * 0.85, 0, 255).astype(np.uint8)
        self.rgb[mask] = col[mask]
        self.a |= mask
        if edge and d.max() >= 2.5:
            ring = mask & ~(cv2.erode(m8, np.ones((3, 3), np.uint8)).astype(bool))
            # el borde inferior/derecho se oscurece fuerte; el superior/izquierdo, medio (luz de borde)
            e = np.array(mat[0], np.uint8)
            self.rgb[ring] = e
        return mask

    def px(self, x, y, col, w=1, h=1):
        x, y = int(round(x)), int(round(y))
        for j in range(h):
            for i in range(w):
                if 0 <= x + i < self.w and 0 <= y + j < self.h:
                    self.rgb[y + j, x + i] = col; self.a[y + j, x + i] = True

    def glow_dot(self, x, y, col, r=1):
        self.part(self.m_ellipse(x, y, r, r), [col] * 4, edge=False, dither=False)

    def finish(self):
        """Contorno exterior de 1 px + disolución de muerte. Devuelve RGBA uint8."""
        a = self.a.copy()
        if self.fade < 1.0:
            bay = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], float) / 16.0
            keep = bay[self.yy % 4, self.xx % 4] < self.fade
            a &= keep
        k = np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]], np.uint8)
        dil = cv2.dilate(a.astype(np.uint8), k).astype(bool)
        ol = dil & ~a
        out = np.zeros((self.h, self.w, 4), np.uint8)
        out[a, :3] = self.rgb[a]; out[a, 3] = 255
        out[ol, :3] = self.outline; out[ol, 3] = 255
        return out


# ------------------------------------------------------------------ atlas
def build_atlas(spec, mod):
    W, H = spec['w'], spec['h']
    frames, sets, order = [], {}, spec['frames']  # frames: [(set, n, fn)]
    for name, n in order:
        idxs = []
        for i in range(n):
            P = {'set': name, 'i': i, 'n': n, 'q': (i / max(1, n - 1)) if n > 1 else 0.0, 'u': i / max(1, n)}
            c = Canvas(W, H, spec.get('outline', '#140a10'))
            mod.draw(c, P)
            frames.append(c.finish()); idxs.append(len(frames) - 1)
        sets[name] = idxs
    cols = 8
    rows = (len(frames) + cols - 1) // cols
    atlas = np.zeros((rows * H, cols * W, 4), np.uint8)
    for i, f in enumerate(frames):
        r, c = divmod(i, cols); atlas[r * H:(r + 1) * H, c * W:(c + 1) * W] = f
    # alias de sets (nombres que usa la IA del juego -> cuadros pintados)
    for alias, src in spec.get('alias', {}).items():
        sets[alias] = [sets[s][j] for s, j in src] if isinstance(src[0], (list, tuple)) else list(src_idx(sets, src))
    img = Image.fromarray(atlas)
    img = limit_palette(img, 48)
    meta = {'w': W, 'h': H, 'cols': cols, 'refH': spec['refH'], 'anchor': spec['anchor'], 'sets': sets}
    return img, meta


def src_idx(sets, src):
    for s in src:
        if isinstance(s, str): yield from sets[s]
        else: yield s


def limit_palette(img, n):
    a = np.array(img)
    op = a[..., 3] > 0
    cols = np.unique(a[op][:, :3], axis=0)
    if len(cols) <= n: return img
    rgb = Image.fromarray(a[..., :3]).quantize(colors=n, method=Image.MEDIANCUT, dither=Image.NONE).convert('RGB')
    b = np.array(rgb); a[..., :3][op] = b[op]
    return Image.fromarray(a)


def preview(img, meta, path, scale=3):
    W, H = meta['w'], meta['h']
    bg = Image.new('RGBA', img.size, (28, 20, 30, 255)); bg.alpha_composite(img)
    bg = bg.resize((img.width * scale, img.height * scale), Image.NEAREST)
    bg.convert('RGB').save(path)


def stats(img):
    a = np.array(img); op = a[..., 3] > 0
    return {'colors': int(len(np.unique(a[op][:, :3], axis=0))), 'partial_alpha': int(((a[..., 3] > 0) & (a[..., 3] < 255)).sum())}


def load(id_):
    sys.path.insert(0, str(HERE / 'enemies'))
    return importlib.import_module(id_)


def ids():
    return sorted(p.stem for p in (HERE / 'enemies').glob('*.py') if not p.stem.startswith('_'))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('cmd', choices=['build', 'install'])
    ap.add_argument('id')
    ap.add_argument('--out', default=str(HERE / 'out' / 'enemies'))
    a = ap.parse_args()
    for id_ in (ids() if a.id == 'all' else [a.id]):
        mod = load(id_); spec = mod.SPEC
        img, meta = build_atlas(spec, mod)
        if a.cmd == 'build':
            d = Path(a.out) / id_; d.mkdir(parents=True, exist_ok=True)
            img.save(d / 'atlas.png', optimize=True)
            (d / 'meta.json').write_text(json.dumps(meta, separators=(',', ':')))
            preview(img, meta, d / 'preview.png')
            print(id_, img.size, stats(img), 'frames', sum(len(v) for k, v in meta['sets'].items() if k in [n for n, _ in spec['frames']]))
        else:
            d = ROOT / 'assets' / 'sprites' / 'enemies' / spec['arena'] / id_ / 'v2'; d.mkdir(parents=True, exist_ok=True)
            img.save(d / 'atlas.png', optimize=True)
            (d / 'meta.json').write_text(json.dumps(meta, separators=(',', ':')))
            print('instalado', d)


if __name__ == '__main__':
    main()
