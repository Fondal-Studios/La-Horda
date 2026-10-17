#!/usr/bin/env python3
"""Efectos de habilidad de la skin "Caravana de Medianoche" de Ilkan (assets/vfx/skins/legion/): cristal y luz
(se registran en js/assets/skin-fx-meta.js). Procedurales, sin recursos de terceros."""
import math
import numpy as np
from rig import Sprite, hexc

CRY = (hexc('7fe9ff'), hexc('3aa8d8'), hexc('e8ffff'))
VIO = (hexc('b48cff'), hexc('6a4cc8'), hexc('f2e8ff'))


def streak(w=41, h=18):
    sp = Sprite(w, h)
    sp.fill(sp.mask().poly([(1, h / 2), (w - 8, 3), (w - 1, h / 2), (w - 8, h - 3)]), CRY[0], CRY[1], CRY[2], rim=False)
    sp.fill(sp.mask().poly([(6, h / 2), (w - 12, h / 2 - 1.5), (w - 6, h / 2), (w - 12, h / 2 + 1.5)]), CRY[2], None, None, rim=False)
    return sp.image()


def ring(w, h, thick=3, seed=1):
    sp = Sprite(w, h)
    rs = np.random.RandomState(seed)
    outer = sp.mask().ellipse(w / 2, h / 2, w / 2 - 1, h / 2 - 1).get()
    inner = sp.mask().ellipse(w / 2, h / 2, w / 2 - 1 - thick * 1.6, h / 2 - 1 - thick).get()
    sp.fill(outer & ~inner, CRY[0], CRY[1], CRY[2], rim=False)
    for _ in range(int(w * 0.5)):
        a = rs.uniform(0, 6.283)
        sp.px(w / 2 + math.cos(a) * (w / 2 - 3), h / 2 + math.sin(a) * (h / 2 - 2), VIO[2] if rs.rand() > 0.5 else CRY[2])
    return sp.image()


def spikes(w=76, h=79):
    sp = Sprite(w, h)
    for dx, hh, ww in ((-22, 38, 9), (-8, 62, 11), (8, 52, 10), (22, 34, 8), (0, 74, 12)):
        cx = w / 2 + dx
        sp.fill(sp.mask().poly([(cx - ww / 2, h - 2), (cx + ww / 2, h - 2), (cx + 1, h - 2 - hh)]), VIO[0], VIO[1], VIO[2], line=hexc('2c2468'))
    return sp.image()


def quake(w=114, h=83):
    sp = Sprite(w, h)
    rs = np.random.RandomState(5)
    for _ in range(26):
        a = rs.uniform(math.pi * 1.05, math.pi * 1.95)
        r = rs.uniform(10, 48)
        cx, cy = w / 2 + math.cos(a) * r, h - 6 + math.sin(a) * r * 1.1
        sz = rs.uniform(3, 8)
        sp.fill(sp.mask().poly([(cx - sz / 2, cy + sz), (cx + sz / 2, cy + sz), (cx, cy - sz)]), CRY[0], CRY[1], CRY[2], rim=False)
    sp.fill(sp.mask().ellipse(w / 2, h - 5, 30, 5), VIO[1], VIO[0], None, rim=False)
    return sp.image()
