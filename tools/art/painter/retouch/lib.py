"""Retoque determinista de hojas de campeón (post-proceso del Pintor).

Funciones puras sobre arreglos RGBA uint8. Se usan desde tools/art/painter/retouch/<id>.py, que painter.py
aplica al final del ensamblado cuando la ficha trae "retouch": "<id>" (así `test_forge.py --regress` sigue
reproduciendo la hoja instalada). Nada de esto agrega colores nuevos salvo el contorno oscuro y la cuantización
final a <= 48 colores.
"""
import numpy as np
import cv2
from scipy import ndimage


def cell(a, i, cs=112, cols=4):
    y, x = (i // cols) * cs, (i % cols) * cs
    return a[y:y + cs, x:x + cs].copy()


def put(a, i, c, cs=112, cols=4):
    y, x = (i // cols) * cs, (i % cols) * cs
    a[y:y + cs, x:x + cs] = c


def grow(a, rows, cs=112, cols=4):
    """Agrega filas vacías de celdas al final."""
    return np.concatenate([a, np.zeros((rows * cs, a.shape[1], 4), np.uint8)], 0)


def binarize(c, thr=128):
    c = c.copy()
    on = c[..., 3] >= thr
    c[~on] = 0
    c[on, 3] = 255
    return c


def bbox(c):
    ys, xs = np.where(c[..., 3] > 0)
    if not len(ys):
        return None
    return ys.min(), ys.max(), xs.min(), xs.max()


def despeckle_alpha(c, minpx=6):
    """Saca islas de alfa menores a minpx (restos de celdas vecinas, motas)."""
    on = c[..., 3] > 0
    lab, n = ndimage.label(on, structure=np.ones((3, 3)))
    if n <= 1:
        return c
    sizes = ndimage.sum(on, lab, range(1, n + 1))
    c = c.copy()
    for k, s in enumerate(sizes, 1):
        if s < minpx:
            c[lab == k] = 0
    return c


def breathe(c, mode, split=0.62):
    """Cuadro de respiración: 'down' = el torso (arriba de la cadera) baja 1 px; 'up' = sube 1 px y se repite la fila de cadera."""
    b = bbox(c)
    if b is None:
        return c
    top, bot = b[0], b[1]
    sp = int(top + (bot - top) * split)
    n = c.copy()
    if mode == 'down':
        n[top + 1:sp + 1] = c[top:sp]
        n[top] = 0
    else:
        if top < 1:
            return c
        n[top - 1:sp - 1] = c[top:sp]
        n[sp - 1] = c[sp - 1]
    return n


def outline_color(c):
    on = c[..., 3] > 0
    lum = c[..., :3].astype(float) @ [.299, .587, .114]
    return np.array([int(v) for v in np.median(c[on][lum[on] < np.percentile(lum[on], 12)][:, :3], axis=0)] if on.any() else [20, 20, 24], np.uint8)


def ensure_outline(c, col=None):
    """Contorno oscuro de 1 px donde el borde es claro (tras rotar o escalar)."""
    c = c.copy()
    on = c[..., 3] > 0
    col = outline_color(c) if col is None else col
    lum = c[..., :3].astype(float) @ [.299, .587, .114]
    dark = on & (lum < 70)
    pad = np.pad(on, 1)
    edge_nb = ndimage.binary_dilation(on, structure=ndimage.generate_binary_structure(2, 1)) & ~on
    # solo se agrega afuera si el píxel opaco vecino no es ya oscuro
    near_light = ndimage.binary_dilation(on & ~dark, structure=ndimage.generate_binary_structure(2, 1))
    add = edge_nb & near_light
    c[add, :3] = col
    c[add, 3] = 255
    return c


def transform(c, angle=0.0, scale=1.0, pivot=None, shift=(0, 0)):
    """Rotación/escala por vecino más cercano (sin semi-alfa) alrededor de pivot=(x,y); luego binariza."""
    b = bbox(c)
    if pivot is None:
        pivot = ((b[2] + b[3]) / 2.0, float(b[1]))
    m = cv2.getRotationMatrix2D((float(pivot[0]), float(pivot[1])), float(angle), float(scale))
    m[0, 2] += shift[0]
    m[1, 2] += shift[1]
    out = cv2.warpAffine(c, m, (c.shape[1], c.shape[0]), flags=cv2.INTER_NEAREST, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
    return binarize(out)


def ground(c, y_bottom, cx=None):
    """Mueve el cuadro para que su píxel más bajo caiga en y_bottom y (opcional) su caja quede centrada en cx."""
    b = bbox(c)
    dy = int(y_bottom - b[1])
    dx = 0 if cx is None else int(round(cx - (b[2] + b[3]) / 2.0))
    n = np.zeros_like(c)
    H, W = c.shape[:2]
    ys, xs = np.where(c[..., 3] > 0)
    Y, X = ys + dy, xs + dx
    k = (Y >= 0) & (Y < H) & (X >= 0) & (X < W)
    n[Y[k], X[k]] = c[ys[k], xs[k]]
    return n


def fall_sequence(src, n=4, cs=112, side=1):
    """Caída propia: el cuadro de pie 'src' (de perfil, mirando a la derecha) se vence hacia atrás hasta quedar tendido.
    Devuelve n cuadros (golpe, caída, casi tendido, tendido). Todo sale del mismo dibujo del campeón."""
    b = bbox(src)
    gy = b[1]
    cx = (b[2] + b[3]) / 2.0
    pad = cs
    big = np.zeros((cs * 3, cs * 3, 4), np.uint8)
    big[pad:pad + cs, pad:pad + cs] = src
    out = []
    angles = [14, 42, 76, 90][-n:]
    squash = [1.0, 0.94, 0.96, 1.0][-n:]
    for k, ang in enumerate(angles):
        t = (k + 1) / n
        if ang == 90:
            c = np.rot90(big, 1 if side > 0 else -1).copy()
        else:
            c = transform(big, ang * side, squash[k], pivot=(cx + pad, gy + pad))
        bb = bbox(c)
        wcx = cx + (cs / 2.0 - cx) * t + pad
        c = ground(c, gy + pad, cx=wcx)
        c = c[pad:pad + cs, pad:pad + cs]
        out.append(ensure_outline(binarize(c)))
    return out


def despeckle_color(c, thr=70):
    """Pixel suelto cuyo color difiere mucho de sus vecinos: toma el color de la mayoría de sus vecinos (ruido de pelo)."""
    on = c[..., 3] > 0
    out = c.copy()
    H, W = on.shape
    rgb = c[..., :3].astype(np.int32)
    for y in range(1, H - 1):
        for x in range(1, W - 1):
            if not on[y, x]:
                continue
            ys, xs = slice(y - 1, y + 2), slice(x - 1, x + 2)
            m = on[ys, xs].copy()
            m[1, 1] = False
            if m.sum() < 5:
                continue
            nb = rgb[ys, xs][m]
            med = np.median(nb, axis=0)
            if np.abs(rgb[y, x] - med).sum() > thr and np.abs(nb - med).sum(axis=1).mean() < thr * .6:
                d = np.abs(nb - med).sum(axis=1)
                out[y, x, :3] = nb[d.argmin()]
    return out


def quantize(a, k=47, seed=1):
    """Cuantiza todo el atlas a <= k+1 colores (k de kmeans en RGB sobre píxeles opacos + el contorno oscuro). Alfa binario."""
    a = binarize(a)
    on = a[..., 3] > 0
    px = a[on][:, :3].astype(np.float32)
    uniq = np.unique(px, axis=0)
    if len(uniq) <= k + 1:
        return a
    cv2.setRNGSeed(seed)
    crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 40, 0.5)
    _, lab, cen = cv2.kmeans(px, k, None, crit, 3, cv2.KMEANS_PP_CENTERS)
    cen = np.clip(np.round(cen), 0, 255).astype(np.uint8)
    out = a.copy()
    out[on, :3] = cen[lab.ravel()]
    return out


def ncolors(a):
    on = a[..., 3] > 0
    return len(np.unique(a[on][:, :3], axis=0))
