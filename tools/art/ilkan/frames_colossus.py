#!/usr/bin/env python3
"""Poses del Coloso de Arena: cada índice del atlas (misma grilla que usa el motor) -> imagen 148x136."""
import math
import numpy as np
from PIL import Image
from rig import Sprite
import colossus as C
from colossus import ROCK, CRYSTAL

CX0, GYC = C.CX, C.GY


def _cfinish(sp):
    sp.outline()
    return sp.image()


def _dust(sp, st, cx, y, rx, n, seed, up=14):
    rs = np.random.RandomState(seed)
    for _ in range(n):
        a = rs.rand() * math.pi * 2
        px = cx + math.cos(a) * rx * (0.6 + 0.5 * rs.rand())
        py = y + math.sin(a) * rx * 0.28 - rs.rand() * up
        col = st['sand'][0] if rs.rand() > 0.4 else (st['sand'][1] if rs.rand() > 0.5 else st['glow'][0])
        sp.px(px, py, col)
        if rs.rand() > 0.6:
            sp.px(px + 1, py, col)


def _cracks(sp, st, x, y, r, seed):
    rs = np.random.RandomState(seed)
    for _ in range(7):
        a = math.radians(rs.randint(0, 360))
        px, py = x, y
        for _s in range(rs.randint(4, 8)):
            nx_ = px + math.cos(a) * 4.5 + rs.randint(-1, 2)
            ny_ = py + math.sin(a) * 1.7 + rs.randint(-1, 2)
            sp.fill(sp.mask().cap((px, py), (nx_, ny_), 1.4, 1.2), st['glow'][0], None, None, rim=False)
            px, py = nx_, ny_
            if math.hypot(px - x, (py - y) * 3) > r:
                break


def _reveal(img, frac, seed):
    """Muestra solo la parte de abajo de la figura (se forma desde la arena): borde de granos sueltos."""
    a = np.array(img)
    h = a.shape[0]
    top = int(GYC - (GYC - 6) * frac)
    rs = np.random.RandomState(seed)
    yy = np.arange(h)[:, None] * np.ones((1, a.shape[1]))
    noise = rs.randint(-5, 6, size=a.shape[1])[None, :]
    a[~(yy > (top + noise))] = 0
    return Image.fromarray(a, 'RGBA')


def _tf_frame(k, st):
    full = C.render('down', C.P2(bob=0, glow=1.0, seed=70 + k), st)
    full.outline()
    base = full.image()
    sp = Sprite(C.W, C.H)
    rs = np.random.RandomState(80 + k)

    def vortex(height, width, n):
        for _ in range(n):
            t = rs.rand()
            y = GYC - 2 - t * height
            x = CX0 + math.sin(t * 9 + k) * width * (0.35 + 0.65 * (1 - t) ** 0.7) + rs.randint(-3, 4)
            col = st['sand'][0] if rs.rand() > 0.35 else (st['sand'][1] if rs.rand() > 0.5 else st['glow'][0])
            sp.px(x, y, col); sp.px(x + 1, y, col)

    if k == 0:
        sp.fill(sp.mask().ellipse(CX0, GYC - 4, 30, 6), st['sand'][1], st['sand'][0], None)
        vortex(70, 26, 160)
        sp.fill(sp.mask().rect(CX0 - 1.5, GYC - 98, CX0 + 1.5, GYC - 6), st['glow'][2], None, None, rim=False)
        sp.outline()
        return sp.image()
    if k == 1:
        sp.fill(sp.mask().ellipse(CX0, GYC - 8, 42, 12), st['sand'][1], st['sand'][0], None)
        vortex(105, 32, 220)
        sp.fill(sp.mask().rect(CX0 - 3, GYC - 118, CX0 + 3, GYC - 8), st['glow'][2], None, None, rim=False)
        sp.outline()
        return sp.image()
    fr = [0.42, 0.66, 0.86, 1.0][k - 2]
    sp.rgba = np.array(_reveal(base, fr, 90 + k))
    if k < 5:
        vortex(105 * fr, 34, 120 - 20 * k)
    _dust(sp, st, CX0, GYC - 2, 56, 60 - 6 * k, 100 + k, up=16)
    if k == 5:
        _dust(sp, st, CX0, GYC - 2, 72, 60, 120, up=20)
    return sp.image()


def colossus_frame(idx, st=ROCK):
    if idx in (20, 21):
        k = idx - 20
        return _cfinish(C.render('down', C.P2(bob=-k, hl=(0, -k), hr=(0, -k), seed=3 + k, glow=1.0 - 0.15 * k), st))
    if 22 <= idx <= 24:
        k = idx - 22
        poses = [C.P2(), C.P2(bob=-2, fl=(6, -2), fr=(-6, 0), hl=(8, -2), hr=(-8, 0), seed=5), C.P2(bob=-2, fl=(-6, 0), fr=(6, -2), hl=(-8, 0), hr=(8, -2), seed=6)]
        return _cfinish(C.render('side', poses[k], st))
    if 25 <= idx <= 27:
        k = idx - 25
        poses = [C.P2(), C.P2(bob=-2, fl=(0, -3), fr=(0, 0), hl=(0, -3), hr=(0, 0), seed=7), C.P2(bob=-2, fl=(0, 0), fr=(0, -3), hl=(0, 0), hr=(0, -3), seed=8)]
        return _cfinish(C.render('up', poses[k], st))
    if 28 <= idx <= 30:
        k = idx - 28
        poses = [C.P2(lean=-4, bob=1, hl=(-18, -22), hr=(-14, -12), fl=(-3, 0), fr=(5, 0)),
                 C.P2(lean=5, bob=2, hl=(34, -26), hr=(-4, 0), fl=(5, 0), fr=(-6, 0)),
                 C.P2(lean=8, bob=3, squat=2, hl=(38, -12), hr=(-2, 2), fl=(7, 0), fr=(-8, 0))]
        return _cfinish(C.render('side', poses[k], st))
    if 6 <= idx <= 9:
        k = idx - 6
        poses = [C.P2(bob=-3, hl=(10, -78), hr=(-10, -78), headback=3, glow=1.2, seed=11),
                 C.P2(bob=2, squat=3, hl=(6, -20), hr=(-6, -20), headback=-2, glow=1.4, seed=12),
                 C.P2(bob=5, squat=7, hl=(2, 34), hr=(-2, 34), headback=-3, glow=1.6, seed=13),
                 C.P2(bob=2, squat=2, hl=(0, 8), hr=(0, 8), glow=1.1, seed=14)]
        sp = C.render('down', poses[k], st)
        if k >= 2:
            _dust(sp, st, CX0, GYC - 2, 60 + 8 * (k - 2), 70, 20 + k, up=18)
            if k == 2:
                _cracks(sp, st, CX0, GYC - 3, 50, 3)
        return _cfinish(sp)
    if 10 <= idx <= 13:
        k = idx - 10
        poses = [C.P2(bob=-2, lean=-2, fl=(-4, -18), hl=(-6, -10), hr=(8, -4), seed=21),
                 C.P2(bob=3, squat=4, fl=(-2, 2), hl=(-10, -2), hr=(10, -2), seed=22, glow=1.4),
                 C.P2(bob=4, squat=5, hl=(-12, 4), hr=(12, 4), seed=23, glow=1.6),
                 C.P2(bob=3, squat=4, hl=(-10, 2), hr=(10, 2), seed=24, glow=1.3)]
        sp = C.render('down', poses[k], st)
        if k >= 1:
            _dust(sp, st, CX0, GYC - 2, 52 + 10 * (k - 1), 40 + 12 * k, 30 + k, up=12)
            _cracks(sp, st, CX0 - 15, GYC - 3, 38 + 8 * k, 40 + k)
        return _cfinish(sp)
    if 0 <= idx <= 4:
        k = idx
        poses = [C.P2(lean=3, bob=-1, fl=(10, -10), fr=(-10, 0), hl=(10, -6), hr=(-12, 2), seed=31),
                 C.P2(lean=4, bob=3, squat=3, fl=(12, 1), fr=(-9, 0), hl=(14, -4), hr=(-14, 0), seed=32, glow=1.3),
                 C.P2(lean=3, bob=-1, fl=(-6, 0), fr=(10, -10), hl=(-10, 2), hr=(12, -6), seed=33),
                 C.P2(lean=4, bob=3, squat=3, fl=(-9, 0), fr=(12, 1), hl=(-14, 0), hr=(14, -4), seed=34, glow=1.3),
                 C.P2(lean=3, bob=-1, fl=(10, -10), fr=(-10, 0), hl=(10, -6), hr=(-12, 2), seed=35)]
        sp = C.render('side', poses[k], st)
        if k in (1, 3):
            _dust(sp, st, CX0 + 14, GYC - 2, 34, 36, 50 + k, up=10)
        return _cfinish(sp)
    if idx == 5:
        sp = C.render('down', C.P2(bob=-3, hl=(-26, -52), hr=(26, -52), headback=6, glow=1.8, seed=41, squat=-1), st)
        _dust(sp, st, CX0, GYC - 2, 48, 36, 60, up=14)
        return _cfinish(sp)
    if 14 <= idx <= 19:
        return _tf_frame(idx - 14, st)
    raise KeyError(idx)
