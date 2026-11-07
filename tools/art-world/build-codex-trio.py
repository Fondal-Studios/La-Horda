#!/usr/bin/env python3
"""Cuerpo del Códice -> atlas de partida para SOPORTE (Elyra), SEGADOR y PROFETA (Ismara).

Fuente: las tres vistas pixeladas (FRENTE / LADO / ESPALDA) de la hoja del Códice (assets/ui/codex/champions/<id>.png).
Pasos (deterministas, sin IA): recorte por color de fondo plano -> reducción BOX a escala nativa -> paleta compartida de
<=44 colores + 1 contorno oscuro de 1 px exterior -> animación por transformaciones de píxel entero (vaivén, respiración,
inclinación, pie levantado, rotación NEAREST, aplastamiento) sobre la pose del Códice. Alfa binario, sin semitransparencia.
No se pinta ningún rasgo nuevo: todo píxel sale de la hoja del Códice (o es el contorno / el destello de la paleta).

Salida por guardián: art-source/codex-guardians/<id>/atlas.png (+ contact.png, report.json). `--install` copia el atlas a
assets/sprites/champions/<id>/codex-v1/atlas.png.
Grilla: 112x112, 4 columnas, 52 cuadros:
  0-3 caminar frente | 4-7 caminar lado | 8-11 caminar espalda | 12-15 ataque frente | 16-19 ataque lado | 20-23 ataque espalda
  24-27 lanzar | 28-31 definitiva | 32-35 muerte (lado) | 36-39 reposo frente | 40-43 reposo lado | 44-47 reposo espalda | 48-51 golpe
  (la muerte de frente/espalda reutiliza 32-35 en el meta)."""
import sys, json
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
CELL, COLS, FOOT, CX = 112, 4, 106, 56
OUTLINE = (22, 14, 26)
# escala nativa (altura total del FRENTE tras reducir) y recorte de las tres vistas en la hoja del Códice
CFG = {
    'soporte': dict(scale=0.235),
    'segador': dict(scale=0.245),
    'profeta': dict(scale=0.250),
}
BANDS = [(785, 1110), (1110, 1425), (1425, 1760)]  # frente, lado, espalda
Y0, Y1 = 250, 635


def views(name):
    a = np.array(Image.open(ROOT / f'assets/ui/codex/champions/{name}.png').convert('RGB')).astype(int)
    bg = np.median(a[240:260, 1750:1770].reshape(-1, 3), axis=0)
    out = []
    for x0, x1 in BANDS:
        sub = a[Y0:Y1, x0:x1]
        m = np.abs(sub - bg).sum(2) > 14
        m = ndimage.binary_opening(m, np.ones((2, 2)))
        h = ndimage.binary_fill_holes(m) & ~m
        hl, hk = ndimage.label(h)
        for i in range(1, hk + 1):
            if (hl == i).sum() <= 220:
                m |= (hl == i)
        # polvo del suelo: tiras horizontales finas en la banda inferior
        op = ndimage.binary_opening(m, np.ones((12, 1)))
        band = np.zeros_like(m); band[-40:] = True
        m = np.where(band, op, m)
        lab, k = ndimage.label(m, np.ones((3, 3)))
        sz = ndimage.sum(m, lab, range(1, k + 1))
        keep = [i + 1 for i, s in enumerate(sz) if s >= 0.02 * max(sz)]
        m = np.isin(lab, keep)
        out.append(Image.fromarray(np.dstack([sub, np.where(m, 255, 0)]).astype(np.uint8), 'RGBA'))
    return out


def to_native(im, s):
    im = im.crop(im.getbbox())
    r = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.BOX)
    a = np.asarray(r).copy(); a[:, :, 3] = np.where(a[:, :, 3] > 127, 255, 0)
    return a


def build_palette(natives, n=44):
    """k-means ponderado en Lab (peso = raiz de la cuenta, para que los acentos raros -orbes, ojos, gemas- conserven su color)."""
    import cv2
    px = np.concatenate([a[a[:, :, 3] > 0][:, :3] for a in natives]).astype(np.uint8)
    cols, cnt = np.unique(px.reshape(-1, 3), axis=0, return_counts=True)
    lab = cv2.cvtColor(cols.reshape(-1, 1, 3), cv2.COLOR_RGB2LAB).reshape(-1, 3).astype(np.float64)
    w = np.sqrt(cnt.astype(np.float64))
    # arranque determinista: punto mas pesado y luego el mas lejano (ponderado)
    cen = [lab[w.argmax()]]
    for _ in range(n - 1):
        d = np.min([((lab - c) ** 2).sum(1) for c in cen], axis=0) * w
        cen.append(lab[d.argmax()])
    cen = np.array(cen)
    for _ in range(30):
        asg = ((lab[:, None, :] - cen[None]) ** 2).sum(2).argmin(1)
        for i in range(n):
            m = asg == i
            if m.any(): cen[i] = (lab[m] * w[m, None]).sum(0) / w[m].sum()
    asg = ((lab[:, None, :] - cen[None]) ** 2).sum(2).argmin(1)
    pal = []
    for i in range(n):
        m = np.where(asg == i)[0]
        if len(m): pal.append(tuple(int(v) for v in cols[m[w[m].argmax()]]))  # color real mas pesado del grupo
    return np.array(sorted(set(pal)), np.int32)


def snap(a, pal):
    a = a.copy(); op = a[:, :, 3] > 0
    rgb = a[op][:, :3].astype(np.int32)
    d = ((rgb[:, None, :] - pal[None, :, :]) ** 2).sum(2)
    a[op, :3] = pal[d.argmin(1)]
    a[~op] = 0
    return a


def place(a):
    """Pone la vista en la celda: pies apoyados en FOOT, centro de pies en CX."""
    h, w = a.shape[:2]
    op = a[:, :, 3] > 0
    ys, xs = np.where(op[-8:])
    fx = int(np.median(xs)) if len(xs) else w // 2
    c = np.zeros((CELL, CELL, 4), np.uint8)
    x0, y0 = CX - fx, FOOT - h
    assert x0 >= 2 and x0 + w <= CELL - 2 and y0 >= 2, (x0, y0, w, h)
    c[y0:y0 + h, x0:x0 + w] = a
    return c


def bbox(c):
    ys, xs = np.where(c[:, :, 3] > 0)
    return xs.min(), ys.min(), xs.max(), ys.max()


def shift(c, dx=0, dy=0):
    o = np.zeros_like(c)
    ys = slice(max(0, dy), CELL + min(0, dy)); yd = slice(max(0, -dy), CELL + min(0, -dy))
    xs = slice(max(0, dx), CELL + min(0, dx)); xd = slice(max(0, -dx), CELL + min(0, -dx))
    o[ys, xs] = c[yd, xd]
    return o


def lean(c, k, frac=0.42):
    """Inclina el torso: las filas sobre la cintura se corren hasta k px a la derecha en la cabeza."""
    x0, y0, x1, y1 = bbox(c)
    waist = int(y1 - (y1 - y0) * frac)
    o = c.copy()
    for y in range(y0, waist):
        d = int(round(k * (waist - y) / max(1, waist - y0)))
        o[y] = np.roll(c[y], d, axis=0) if d else c[y]
        if d > 0: o[y, :d] = 0
        if d < 0: o[y, d:] = 0
    return o


def breathe(c, up=1, frac=0.42):
    x0, y0, x1, y1 = bbox(c)
    waist = int(y1 - (y1 - y0) * frac)
    o = c.copy()
    o[:waist - up] = c[up:waist]
    o[waist - up:waist] = c[waist - 1:waist]
    return o


def stretch(c, sy):
    """Estira/aplasta verticalmente alrededor de la línea de pies (vecino más cercano)."""
    o = np.zeros_like(c)
    for yd in range(CELL):
        ys = int(round(FOOT - (FOOT - yd) / sy))
        if 0 <= ys < CELL: o[yd] = c[ys]
    return o


def lift_foot(c, side, lift=2, band=12, fwd=0):
    """Levanta el pie de un lado (L/R respecto del centro de pies)."""
    o = c.copy()
    cols = slice(0, CX) if side == 'L' else slice(CX, CELL)
    seg = c[FOOT - band:FOOT, cols].copy()
    o[FOOT - band:FOOT, cols] = 0
    tgt = o[FOOT - band - lift:FOOT - lift, cols]
    m = seg[:, :, 3] > 0
    tgt[m] = seg[m]
    if fwd:
        o[FOOT - band - lift:FOOT, cols] = np.roll(o[FOOT - band - lift:FOOT, cols], fwd, axis=1)
    return o


def rot(c, deg):
    im = Image.fromarray(c, 'RGBA').rotate(deg, resample=Image.NEAREST, center=(CX, FOOT))
    a = np.asarray(im).copy(); a[:, :, 3] = np.where(a[:, :, 3] > 127, 255, 0); a[a[:, :, 3] == 0] = 0
    return a


def ground(c, dx=0):
    """Apoya la silueta (caída) en el suelo y la centra."""
    x0, y0, x1, y1 = bbox(c)
    return shift(c, CX - (x0 + x1) // 2 + dx, FOOT - y1)


def flash(c, pal, amt):
    o = c.copy(); op = o[:, :, 3] > 0
    rgb = np.clip(o[op][:, :3].astype(int) + amt, 0, 255)
    d = ((rgb[:, None, :] - pal[None, :, :]) ** 2).sum(2)
    o[op, :3] = pal[d.argmin(1)]
    return o


def outline(c):
    op = c[:, :, 3] > 0
    P = np.pad(op, 1)
    ring = (P[:-2, 1:-1] | P[2:, 1:-1] | P[1:-1, :-2] | P[1:-1, 2:]) & ~op
    o = c.copy(); o[ring] = (*OUTLINE, 255)
    return o


def frames(F, S, B, pal):
    """F/S/B = celdas base de frente/lado/espalda (sin contorno). Devuelve {índice: celda}."""
    out = {}

    def walk(base, side):
        if side:
            return [lift_foot(lean(base, 1), 'R', 2, fwd=1), shift(base, 0, -1),
                    lift_foot(lean(base, 1), 'L', 2, fwd=-1), shift(lean(base, -1), 0, -1)]
        return [lift_foot(base, 'L', 2), shift(base, 0, -1), lift_foot(base, 'R', 2), shift(base, 0, -1)]
    for o0, base, side in [(0, F, False), (4, S, True), (8, B, False)]:
        for i, c in enumerate(walk(base, side)): out[o0 + i] = c

    def attack(base, view):
        if view == 'side':
            return [shift(rot(lean(base, -2), 7), -2, -1), shift(rot(lean(base, 4), -10), 4, 0),
                    shift(rot(lean(base, 3), -6), 3, 1), shift(rot(base, -2), 1, 0)]
        if view == 'front':
            return [shift(stretch(base, 1.05), 0, -2), shift(stretch(lean(base, 2), 0.92), 1, 2),
                    shift(stretch(lean(base, -2), 0.95), -1, 1), base]
        return [shift(stretch(base, 0.96), 0, 1), shift(stretch(lean(base, -2), 1.06), 1, -3),
                shift(stretch(lean(base, 2), 1.03), -1, -2), base]
    for o0, base, view in [(12, F, 'front'), (16, S, 'side'), (20, B, 'back')]:
        for i, c in enumerate(attack(base, view)): out[o0 + i] = c
    cast = [stretch(S, 0.94), shift(stretch(S, 1.05), 0, -2), shift(stretch(S, 1.07), 0, -4), shift(stretch(S, 1.03), 0, -1)]
    for i, c in enumerate(cast): out[24 + i] = c
    ult = [stretch(F, 0.93), shift(stretch(F, 1.06), 0, -3), flash(shift(stretch(F, 1.08), 0, -5), pal, 22), shift(stretch(F, 1.03), 0, -2)]
    for i, c in enumerate(ult): out[28 + i] = c
    out[32] = flash(shift(rot(lean(S, -2), 10), -3, 0), pal, 30)
    out[33] = ground(rot(stretch(S, 0.9), 42), -2)
    out[34] = ground(rot(stretch(S, 0.85), 78), -1)
    out[35] = ground(rot(S, 90))
    for base, o0 in [(F, 36), (S, 40), (B, 44)]:
        out[o0] = base
        out[o0 + 1] = breathe(base, 1)
        out[o0 + 2] = lean(base, 1)
        out[o0 + 3] = breathe(lean(base, -1), 1)
    for i, (dx, amt, deg) in enumerate([(-2, 38, 6), (-3, 24, 8), (-2, 10, 4), (0, 0, 0)]):
        out[48 + i] = shift(rot(flash(F, pal, amt) if amt else F, deg), dx, 0)
    return out


def mass_height(c):
    rows = (c[:, :, 3] > 0).sum(1); thr = rows.max() * .22
    ys = np.where(rows >= thr)[0]
    return int(ys.max() - ys.min() + 1)


def build(name):
    s = CFG[name]['scale']
    V = [to_native(v, s) for v in views(name)]
    pal = build_palette(V)
    V = [snap(v, pal) for v in V]
    cells = [place(v) for v in V]
    fr = frames(*cells, pal)
    full = np.zeros((CELL * 13, CELL * COLS, 4), np.uint8)
    for k, c in fr.items():
        full[(k // COLS) * CELL:(k // COLS + 1) * CELL, (k % COLS) * CELL:(k % COLS + 1) * CELL] = outline(c)
    ncol = len({tuple(p) for p in full[full[:, :, 3] > 0][:, :3]})
    b = bbox(cells[0])
    rep = dict(name=name, scale=s, frames=len(fr), colors=ncol, idleBodyHeight=mass_height(outline(cells[0])),
               totalHeight=int(b[3] - b[1] + 3), size=[full.shape[1], full.shape[0]])
    return full, rep


def contact(full, path):
    bgc = np.zeros_like(full); bgc[:] = (90, 96, 90, 255)
    im = Image.fromarray(bgc, 'RGBA'); im.alpha_composite(Image.fromarray(full, 'RGBA'))
    im.save(path)


def main():
    names = [a for a in sys.argv[1:] if not a.startswith('--')] or list(CFG)
    for n in names:
        full, rep = build(n)
        out = ROOT / f'art-source/codex-guardians/{n}'; out.mkdir(parents=True, exist_ok=True)
        Image.fromarray(full, 'RGBA').save(out / 'atlas.png', optimize=True)
        contact(full, out / 'contact.png')
        (out / 'report.json').write_text(json.dumps(rep, indent=1))
        print(rep)
        if '--install' in sys.argv:
            t = ROOT / f'assets/sprites/champions/{n}/codex-v1'; t.mkdir(parents=True, exist_ok=True)
            Image.fromarray(full, 'RGBA').save(t / 'atlas.png', optimize=True)
            print('installed', t / 'atlas.png')


if __name__ == '__main__':
    main()
