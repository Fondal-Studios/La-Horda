#!/usr/bin/env python3
"""Efectos sueltos de Ilkan (imágenes PNG con alfa): punta de lanza, pilar de luz, remolinos de arena,
grietas luminosas, pisadas de coloso y siluetas de colosos. Todo procedural, estética de arena y luz
verde azulada (nada del campeón anterior)."""
import math
import numpy as np
from PIL import Image
from rig import Sprite, hexc, shift

SAND = (hexc('e0c070'), hexc('c2a05a'), hexc('fff0c0'))
GLOW = (hexc('5ff0dc'), hexc('17a496'), hexc('e8fffa'))
GOLD = (hexc('f2c14e'), hexc('c4902a'), hexc('ffe28a'))
ROCK = (hexc('a37645'), hexc('6e4a2a'), hexc('cfa56a'))
DARK = (hexc('4f321d'), hexc('2c1c10'), hexc('6e4a2a'))
STEEL = (hexc('d8e4e6'), hexc('9fb4b8'), hexc('ffffff'))
TEAL = (hexc('1f9c92'), hexc('146b6a'), hexc('46d6c4'))
LEATHER = (hexc('6d4a2a'), hexc('4a301a'), hexc('92683a'))
LINE = hexc('2a1810')


def lance(w=64, h=24):
    sp = Sprite(w, h)
    cy = h / 2
    sp.fill(sp.mask().cap((2, cy), (w - 18, cy), 3.2), LEATHER[0], LEATHER[1], LEATHER[2], line=LINE)
    sp.fill(sp.mask().poly([(w - 22, cy - 5), (w - 22, cy + 5), (w - 2, cy)]), STEEL[0], STEEL[1], STEEL[2], line=LINE)
    sp.fill(sp.mask().poly([(w - 30, cy - 1), (w - 44, cy - 10), (w - 38, cy - 1), (w - 46, cy + 7), (w - 30, cy + 2)]), TEAL[0], TEAL[1], TEAL[2], line=LINE)
    sp.fill(sp.mask().rect(w - 24, cy - 3.2, w - 21, cy + 3.2), GOLD[0], GOLD[1], GOLD[2])
    sp.outline()
    return sp.image()


def pillar(w, h, seed):
    sp = Sprite(w, h)
    rs = np.random.RandomState(seed)
    cx = w / 2
    sp.fill(sp.mask().poly([(cx - 4, 0), (cx + 4, 0), (cx + 9, h - 4), (cx - 9, h - 4)]), GLOW[0], GLOW[1], GLOW[2], rim=False)
    sp.fill(sp.mask().poly([(cx - 2, 0), (cx + 2, 0), (cx + 4, h - 4), (cx - 4, h - 4)]), GLOW[2], None, None, rim=False)
    for _ in range(90):
        t = rs.rand()
        y = h - 4 - t * (h - 6)
        x = cx + math.sin(t * 11 + seed) * (6 + 14 * (1 - t)) + rs.randint(-2, 3)
        sp.px(x, y, SAND[0] if rs.rand() > 0.4 else GLOW[0])
    sp.fill(sp.mask().ellipse(cx, h - 5, w * 0.45, 4), SAND[1], SAND[0], None, rim=False)
    return sp.image()


def puff(w, h, seed):
    sp = Sprite(w, h)
    rs = np.random.RandomState(seed)
    for _ in range(28):
        x = w / 2 + rs.normal(0, w * 0.18)
        y = h * 0.85 - abs(rs.normal(0, h * 0.28)) - rs.rand() * h * 0.2
        r = rs.uniform(2.0, 6.0)
        c = SAND if rs.rand() > 0.3 else (SAND[1], SAND[1], SAND[0])
        sp.fill(sp.mask().ellipse(x, y, r, r * 0.8), c[0], c[1], c[2], rim=True)
    for _ in range(40):
        sp.px(w / 2 + rs.normal(0, w * 0.3), h * 0.8 - rs.rand() * h * 0.8, GLOW[0] if rs.rand() > 0.7 else SAND[0])
    return sp.image()


def cracks(w, h, seed):
    sp = Sprite(w, h)
    rs = np.random.RandomState(seed)
    cx, cy = w / 2, h / 2
    for _ in range(8):
        a = math.radians(rs.randint(0, 360))
        px, py = cx, cy
        for _s in range(rs.randint(5, 9)):
            nx_ = px + math.cos(a) * rs.uniform(4, 8)
            ny_ = py + math.sin(a) * rs.uniform(2, 4)
            a += math.radians(rs.randint(-35, 36))
            sp.fill(sp.mask().cap((px, py), (nx_, ny_), 2.6, 1.6), DARK[1], None, None, rim=False)
            sp.fill(sp.mask().cap((px, py), (nx_, ny_), 1.2, 0.8), GLOW[0], None, None, rim=False)
            px, py = nx_, ny_
    sp.fill(sp.mask().ellipse(cx, cy, 3, 2), GLOW[2], None, None, rim=False)
    return sp.image()


def foot(w, h, seed, glow):
    """Pie colosal visto desde arriba/frente: bloque de arenisca con tres dedos y grietas luminosas."""
    sp = Sprite(w, h)
    cx = w / 2
    body = sp.mask().ellipse(cx, h * 0.5, w * 0.30, h * 0.40)
    sp.fill(body, ROCK[0], ROCK[1], ROCK[2], line=LINE, band=0.6)
    for k, dx in enumerate((-0.19, 0.0, 0.19)):
        sp.fill(sp.mask().ellipse(cx + dx * w, h * 0.12 + abs(dx) * h * 0.4, w * 0.075, h * 0.1), ROCK[2], ROCK[0], ROCK[2], line=LINE)
    rs = np.random.RandomState(seed)
    for y in range(int(h * 0.25), int(h * 0.85), 7):
        m = sp.mask().rect(cx - w * 0.28, y, cx + w * 0.28, y + 1).get() & body.get()
        sp.rgba[m, :3] = DARK[1]
    for _ in range(int(5 + 3 * glow)):
        a = rs.uniform(0, math.pi * 2)
        px, py = cx + math.cos(a) * w * 0.1, h * 0.5 + math.sin(a) * h * 0.1
        for _s in range(5):
            nx_ = px + math.cos(a) * 7
            ny_ = py + math.sin(a) * 3.5
            sp.fill(sp.mask().cap((px, py), (nx_, ny_), 1.6, 1.2), GLOW[0], None, None, rim=False)
            px, py = nx_, ny_
    sp.outline()
    return sp.image()


def silhouettes(w=324, h=122):
    """Nueve siluetas de colosos cornudos en fila (se dibujan en pantalla, detrás del humo de la arena)."""
    sp = Sprite(w, h)
    rs = np.random.RandomState(4)
    for i in range(9):
        cx = 18 + i * 36 + rs.randint(-4, 5)
        hh = rs.randint(70, 118)
        top = h - hh
        col = (hexc('1a1008'), hexc('0e0804'), hexc('2a1a0c'))
        sp.fill(sp.mask().poly([(cx - 15, h), (cx - 17, top + 34), (cx - 8, top + 22), (cx + 8, top + 22), (cx + 17, top + 34), (cx + 15, h)]), col[0], None, None, rim=False)
        sp.fill(sp.mask().ellipse(cx, top + 16, 9, 8.5), col[0], None, None, rim=False)
        sp.fill(sp.mask().poly([(cx - 7, top + 10), (cx - 14, top - 4), (cx - 4, top + 6)]), col[0], None, None, rim=False)
        sp.fill(sp.mask().poly([(cx + 7, top + 10), (cx + 14, top - 4), (cx + 4, top + 6)]), col[0], None, None, rim=False)
        sp.fill(sp.mask().poly([(cx - 2, top + 8), (cx + 2, top + 8), (cx, top - 10)]), col[0], None, None, rim=False)
        sp.px(cx - 3, top + 15, GLOW[0]); sp.px(cx + 3, top + 15, GLOW[0])
    return sp.image()
