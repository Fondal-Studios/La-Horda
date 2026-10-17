#!/usr/bin/env python3
"""Coloso de Arena — forma de transformación de Ilkan (frente / perfil derecho / espalda).

DISEÑO ORIGINAL (docs/ILKAN_REWORK.md). Un gigante de losas de arenisca apiladas, hombros de roca con
púas, puños de bloque, cabeza pequeña con tres cuernos curvos y ojos-ranura que brillan en verde azulado,
y un núcleo de luz en el pecho entre placas agrietadas; arena que cae de las juntas. Silueta ancha y
cuadrada, sin musculatura ni piel. Paleta: arenisca, ámbar, verde azulado luminoso.
"""
import math
import numpy as np
from rig import Sprite, Mask, hexc, shift
from human import ik

W, H = 148, 136
CX, GY = 74, 128

ROCK = dict(
    rock=(hexc('a37645'), hexc('6e4a2a'), hexc('cfa56a')),
    dark=(hexc('4f321d'), hexc('2c1c10'), hexc('6e4a2a')),
    plate=(hexc('c9a064'), hexc('94693a'), hexc('e8cc92')),
    glow=(hexc('5ff0dc'), hexc('17a496'), hexc('e8fffa')),
    gold=(hexc('f2c14e'), hexc('c4902a'), hexc('ffe28a')),
    sand=(hexc('e0c070'), hexc('c2a05a'), hexc('fff0c0')),
    line=hexc('2a1810'),
)
CRYSTAL = dict(ROCK)
CRYSTAL.update(
    rock=(hexc('7f9cc8'), hexc('4a6498'), hexc('c6dcf8')),
    dark=(hexc('2c3a68'), hexc('1a2248'), hexc('4a6498')),
    plate=(hexc('a8c0e6'), hexc('6a86bc'), hexc('e8f2ff')),
    glow=(hexc('b48cff'), hexc('6a4cc8'), hexc('f2e8ff')),
    gold=(hexc('d6e2f2'), hexc('9aaccc'), hexc('ffffff')),
    sand=(hexc('bcd0f0'), hexc('8ea6d0'), hexc('f4f8ff')),
    line=hexc('1c2448'),
)


def P2(**kw):
    d = dict(bob=0, squat=0, lean=0, fl=(0, 0), fr=(0, 0), hl=(0, 0), hr=(0, 0), headback=0, glow=1.0, seed=1, tilt=0)
    d.update(kw)
    return d


def strata(sp, m, st, y0, y1, step=6, dx=0):
    """Vetas horizontales de la roca (líneas oscuras recortadas a la pieza)."""
    mm = m if isinstance(m, np.ndarray) else m.get()
    rs = np.random.RandomState(7)
    for y in range(int(y0), int(y1), step):
        line = sp.mask().rect(0, y, W, y + 1).get() & mm
        # las vetas no cruzan todo el ancho: se interrumpen
        xs = np.nonzero(line.any(0))[0]
        if len(xs) > 8:
            a = xs[0] + rs.randint(0, 6)
            b = xs[-1] - rs.randint(0, 6)
            keep = np.zeros_like(line)
            keep[:, a:b] = True
            line &= keep
        sp.rgba[line, :3] = st['dark'][1]
        sp.rgba[line, 3] = 255


def sand_fall(sp, x, y, st, n, seed, spread=8, length=14):
    rs = np.random.RandomState(seed)
    for _ in range(n):
        px = x + rs.randint(-spread, spread + 1)
        py = y + rs.randint(0, length)
        sp.px(px, py, st['sand'][0] if rs.rand() > 0.4 else st['sand'][1])


def glow_core(sp, x, y, r, st, g=1.0, cracks=True):
    m = sp.mask().ellipse(x, y, r, r * 1.05)
    sp.fill(m, st['glow'][0], st['glow'][1], st['glow'][2], line=st['dark'][1], band=0.6)
    sp.fill(sp.mask().ellipse(x - r * 0.25, y - r * 0.3, r * 0.4, r * 0.4), st['glow'][2], None, None, rim=False)
    if cracks:
        for ang in (200, 250, 290, 340, 20, 70, 110, 160):
            a = math.radians(ang)
            ln = r * (1.9 + 0.5 * math.sin(ang))
            sp.fill(sp.mask().cap((x + math.cos(a) * r * 0.9, y + math.sin(a) * r * 0.9), (x + math.cos(a) * ln, y + math.sin(a) * ln), 1.4, 0.8), st['glow'][0] if g > 0.5 else st['glow'][1], None, None, rim=False)


def horns(sp, hx, hy, st, mode='down', back=0):
    # tres cuernos curvos: el central alto y dos laterales hacia afuera
    def horn(base, tip, ctrl, w):
        pts_o, pts_i = [], []
        for i in range(11):
            t = i / 10
            x = (1 - t) ** 2 * base[0] + 2 * (1 - t) * t * ctrl[0] + t * t * tip[0]
            y = (1 - t) ** 2 * base[1] + 2 * (1 - t) * t * ctrl[1] + t * t * tip[1]
            ww = w * (1 - t) + 0.4
            pts_o.append((x - ww / 2, y)); pts_i.append((x + ww / 2, y))
        m = sp.mask().poly(pts_o + pts_i[::-1])
        sp.fill(m, st['plate'][0], st['plate'][1], st['plate'][2], line=st['line'], band=0.7)
    if mode == 'down' or mode == 'up':
        horn((hx - 7, hy - 6), (hx - 17, hy - 24 - back), (hx - 14, hy - 12), 6)
        horn((hx + 7, hy - 6), (hx + 17, hy - 24 - back), (hx + 14, hy - 12), 6)
        horn((hx, hy - 8), (hx, hy - 30 - back), (hx + 1, hy - 18), 7)
    else:
        horn((hx - 3, hy - 7), (hx - 21, hy - 20 - back), (hx - 13, hy - 14), 6)
        horn((hx + 1, hy - 8), (hx + 10, hy - 28 - back), (hx + 8, hy - 16), 6)
        horn((hx - 6, hy - 6), (hx - 25, hy - 8 - back), (hx - 16, hy - 8), 5)


def fist(sp, x, y, st, big=1.0, ang=0):
    m = sp.mask().rect(x - 9 * big, y - 8 * big, x + 9 * big, y + 8 * big)
    sp.fill(m, st['rock'][0], st['rock'][1], st['rock'][2], line=st['line'], band=0.6)
    for k in (-4, 0, 4):
        sp.fill(sp.mask().rect(x + k * big - 0.5, y - 8 * big, x + k * big + 0.5, y - 3 * big), st['dark'][1], None, None, rim=False)
    sp.fill(sp.mask().rect(x - 9 * big, y - 9 * big, x + 9 * big, y - 6 * big), st['gold'][0], st['gold'][1], st['gold'][2], band=0.6)


def arm(sp, S, Hd, st, side, l1=25, l2=25):
    E, Hh = ik(S, Hd, l1, l2, side)
    sp.fill(sp.mask().cap(S, E, 17, 15), st['rock'][0], st['rock'][1], st['rock'][2], line=st['line'], band=0.6)
    sp.fill(sp.mask().cap(E, Hh, 15, 14), st['rock'][0], st['rock'][1], st['rock'][2], line=st['line'], band=0.6)
    mid = ((E[0] + Hh[0]) / 2, (E[1] + Hh[1]) / 2)
    sp.fill(sp.mask().ellipse(mid[0], mid[1], 8, 3.2), st['gold'][0], st['gold'][1], st['gold'][2])
    fist(sp, Hh[0], Hh[1], st)
    return E, Hh


def pauldron_c(sp, x, y, st, flip=1, spikes=True):
    m = sp.mask().ellipse(x, y, 17, 13)
    sp.fill(m, st['plate'][0], st['plate'][1], st['plate'][2], line=st['line'], band=0.55)
    sp.fill(sp.mask().ellipse(x - 2 * flip, y - 3, 12, 8), st['rock'][0], st['rock'][1], st['rock'][2], line=st['line'], band=0.55)
    if spikes:
        for dx, dh in ((-8, 9), (0, 13), (8, 9)):
            sp.fill(sp.mask().poly([(x + dx - 3, y - 7), (x + dx + 3, y - 7), (x + dx + flip * 1.5, y - 7 - dh)]), st['plate'][0], st['plate'][1], st['plate'][2], line=st['line'])


def front(st, p):
    sp = Sprite(W, H)
    cx = CX + p['lean']
    hip = GY - 44 + p['squat']
    sh = hip - 26 + p['bob']
    hy = sh - 13 + p['bob'] * 0.4 + p['headback'] * 0.5
    # piernas
    fx = [cx - 15 + p['fl'][0], cx + 15 + p['fr'][0]]
    fy = [GY - 4 + p['fl'][1], GY - 4 + p['fr'][1]]
    for i, hxp in enumerate((cx - 12, cx + 12)):
        leg = sp.mask().cap((hxp, hip), (fx[i], fy[i] - 8), 22, 20)
        sp.fill(leg, st['rock'][0], st['rock'][1], st['rock'][2], line=st['line'], band=0.62)
        strata(sp, leg, st, hip, fy[i], 8)
        foot = sp.mask().rect(fx[i] - 15, fy[i] - 8, fx[i] + 15, fy[i] + 4)
        sp.fill(foot, st['dark'][0], st['dark'][1], st['dark'][2], line=st['line'], band=0.55)
        for t in (-9, 0, 9):
            sp.fill(sp.mask().ellipse(fx[i] + t, fy[i] + 1, 5, 4.5), st['plate'][0], st['plate'][1], st['plate'][2], line=st['line'])
        kn = sp.mask().ellipse(hxp + (fx[i] - hxp) * 0.45, hip + (fy[i] - 8 - hip) * 0.45, 9, 7)
        sp.fill(kn, st['plate'][0], st['plate'][1], st['plate'][2], line=st['line'])
    # pelvis con faldón de tiras
    pel = sp.mask().poly([(cx - 24, hip - 8), (cx + 24, hip - 8), (cx + 20, hip + 10), (cx - 20, hip + 10)])
    sp.fill(pel, st['dark'][0], st['dark'][1], st['dark'][2], line=st['line'], band=0.7)
    for k in range(-3, 4):
        sp.fill(sp.mask().rect(cx + k * 6 - 2, hip + 1, cx + k * 6 + 2, hip + 11 + (k % 2) * 3), st['gold'][0] if k % 2 else st['plate'][0], st['gold'][1] if k % 2 else st['plate'][1], None, rim=False)
    # torso
    tor = sp.mask().poly([(cx - 30, sh - 2), (cx + 30, sh - 2), (cx + 24, hip - 6), (cx - 24, hip - 6)])
    sp.fill(tor, st['rock'][0], st['rock'][1], st['rock'][2], line=st['line'], band=0.6)
    strata(sp, tor, st, sh + 4, hip - 6, 7)
    for sx in (-1, 1):
        pec = sp.mask().poly([(cx + sx * 3, sh + 1), (cx + sx * 28, sh + 1), (cx + sx * 24, sh + 18), (cx + sx * 4, sh + 20)])
        sp.fill(pec, st['plate'][0], st['plate'][1], st['plate'][2], line=st['line'], band=0.6)
    glow_core(sp, cx, sh + 14, 6.5 * p['glow'] + 1.5, st, p['glow'])
    # brazos + hombros
    Ls, Rs = (cx - 33, sh + 6), (cx + 33, sh + 6)
    Lt = (cx - 47 + p['hl'][0], hip + 14 + p['hl'][1])
    Rt = (cx + 47 + p['hr'][0], hip + 14 + p['hr'][1])
    arm(sp, Ls, Lt, st, -1)
    arm(sp, Rs, Rt, st, 1)
    pauldron_c(sp, Ls[0] - 3, Ls[1] - 4, st, -1)
    pauldron_c(sp, Rs[0] + 3, Rs[1] - 4, st, 1)
    # cabeza
    hx = cx + p['tilt']
    horns(sp, hx, hy, st, 'down', back=p['headback'])
    sp.fill(sp.mask().rect(hx - 8, hy + 6, hx + 8, sh + 4), st['dark'][0], st['dark'][1], st['dark'][2], line=st['line'], band=0.6)
    head = sp.mask().ellipse(hx, hy, 14, 12.5)
    sp.fill(head, st['dark'][0], st['dark'][1], st['dark'][2], line=st['line'], band=0.7)
    visor = sp.mask().rect(hx - 11, hy - 3, hx + 11, hy + 3)
    sp.fill(visor.get() & head.get(), st['line'], None, None, rim=False)
    for ex in (hx - 6, hx + 6):
        sp.fill(sp.mask().rect(ex - 2.6, hy - 1.4, ex + 2.4, hy + 1.2), st['glow'][0] if p['glow'] > 0.2 else st['glow'][1], None, None, rim=False)
        sp.px(ex - 1, hy - 1, st['glow'][2])
    sp.fill(sp.mask().rect(hx - 5, hy + 5, hx + 5, hy + 8), st['plate'][0], st['plate'][1], st['plate'][2], rim=False)
    sand_fall(sp, cx - 33, sh + 12, st, 8, p['seed'], 6, 24)
    sand_fall(sp, cx + 33, sh + 12, st, 8, p['seed'] + 3, 6, 24)
    return sp


def side(st, p):
    sp = Sprite(W, H)
    cx = CX + p['lean']
    hip = GY - 44 + p['squat']
    sh = hip - 26 + p['bob']
    hy = sh - 13 + p['bob'] * 0.4 + p['headback'] * 0.5
    dark = lambda c: tuple(int(v * 0.78) for v in c)
    # brazo lejano
    Fs = (cx - 4, sh + 6)
    Ft = (cx - 10 + p['hr'][0], hip + 12 + p['hr'][1])
    E, Hh = ik(Fs, Ft, 25, 25, 1)
    sp.fill(sp.mask().cap(Fs, E, 16, 14), dark(st['rock'][0]), dark(st['rock'][1]), None, line=st['line'])
    sp.fill(sp.mask().cap(E, Hh, 14, 13), dark(st['rock'][0]), dark(st['rock'][1]), None, line=st['line'])
    sp.fill(sp.mask().rect(Hh[0] - 8, Hh[1] - 7, Hh[0] + 8, Hh[1] + 7), dark(st['rock'][0]), dark(st['rock'][1]), None, line=st['line'])
    # pierna lejana
    ffx, ffy = cx - 3 + p['fr'][0], GY - 4 + p['fr'][1]
    sp.fill(sp.mask().cap((cx - 2, hip), (ffx, ffy - 8), 21, 19), dark(st['rock'][0]), dark(st['rock'][1]), None, line=st['line'])
    sp.fill(sp.mask().rect(ffx - 12, ffy - 8, ffx + 17, ffy + 4), dark(st['dark'][0]), dark(st['dark'][1]), None, line=st['line'])
    # torso (perfil)
    tor = sp.mask().poly([(cx - 20, sh - 2), (cx + 18, sh - 2), (cx + 15, hip - 6), (cx - 17, hip - 6)])
    sp.fill(tor, st['rock'][0], st['rock'][1], st['rock'][2], line=st['line'], band=0.6)
    strata(sp, tor, st, sh + 4, hip - 6, 7)
    sp.fill(sp.mask().poly([(cx + 2, sh + 1), (cx + 17, sh + 1), (cx + 14, sh + 19), (cx + 3, sh + 21)]), st['plate'][0], st['plate'][1], st['plate'][2], line=st['line'], band=0.6)
    glow_core(sp, cx + 12, sh + 14, 5.0 * p['glow'] + 1.2, st, p['glow'], cracks=False)
    pel = sp.mask().poly([(cx - 17, hip - 8), (cx + 17, hip - 8), (cx + 14, hip + 10), (cx - 14, hip + 10)])
    sp.fill(pel, st['dark'][0], st['dark'][1], st['dark'][2], line=st['line'], band=0.7)
    for k in range(-2, 3):
        sp.fill(sp.mask().rect(cx + k * 6 - 2, hip + 1, cx + k * 6 + 2, hip + 11 + (k % 2) * 3), st['gold'][0] if k % 2 else st['plate'][0], st['gold'][1] if k % 2 else st['plate'][1], None, rim=False)
    # pierna cercana
    nfx, nfy = cx + 2 + p['fl'][0], GY - 4 + p['fl'][1]
    leg = sp.mask().cap((cx + 1, hip), (nfx, nfy - 8), 23, 20)
    sp.fill(leg, st['rock'][0], st['rock'][1], st['rock'][2], line=st['line'], band=0.62)
    strata(sp, leg, st, hip, nfy, 8)
    sp.fill(sp.mask().rect(nfx - 13, nfy - 8, nfx + 19, nfy + 4), st['dark'][0], st['dark'][1], st['dark'][2], line=st['line'], band=0.55)
    for t in (4, 12):
        sp.fill(sp.mask().ellipse(nfx + t, nfy + 1, 5, 4.5), st['plate'][0], st['plate'][1], st['plate'][2], line=st['line'])
    sp.fill(sp.mask().ellipse(cx + (nfx - cx) * 0.45 + 2, hip + (nfy - 8 - hip) * 0.45, 9, 7), st['plate'][0], st['plate'][1], st['plate'][2], line=st['line'])
    # brazo cercano
    Ns = (cx + 2, sh + 6)
    Nt = (cx + 8 + p['hl'][0], hip + 14 + p['hl'][1])
    arm(sp, Ns, Nt, st, 1)
    pauldron_c(sp, Ns[0], Ns[1] - 5, st, 1)
    # cabeza en perfil
    hx = cx + 3 + p['tilt']
    horns(sp, hx, hy, st, 'side', back=p['headback'])
    sp.fill(sp.mask().rect(hx - 7, hy + 6, hx + 7, sh + 4), st['dark'][0], st['dark'][1], st['dark'][2], line=st['line'], band=0.6)
    head = sp.mask().ellipse(hx, hy, 14, 12.5)
    sp.fill(head, st['dark'][0], st['dark'][1], st['dark'][2], line=st['line'], band=0.7)
    sp.fill(sp.mask().poly([(hx + 1, hy - 3), (hx + 12, hy - 3), (hx + 12, hy + 3), (hx + 1, hy + 3)]).get() & head.get(), st['line'], None, None, rim=False)
    sp.fill(sp.mask().rect(hx + 4, hy - 1.4, hx + 10, hy + 1.2), st['glow'][0] if p['glow'] > 0.2 else st['glow'][1], None, None, rim=False)
    sp.px(hx + 5, hy - 1, st['glow'][2])
    sp.fill(sp.mask().rect(hx + 2, hy + 5, hx + 11, hy + 8), st['plate'][0], st['plate'][1], st['plate'][2], rim=False)
    sand_fall(sp, cx - 6, sh + 10, st, 8, p['seed'], 6, 24)
    return sp


def back(st, p):
    sp = Sprite(W, H)
    cx = CX + p['lean']
    hip = GY - 44 + p['squat']
    sh = hip - 26 + p['bob']
    hy = sh - 13 + p['bob'] * 0.4 + p['headback'] * 0.5
    fx = [cx - 15 + p['fl'][0], cx + 15 + p['fr'][0]]
    fy = [GY - 4 + p['fl'][1], GY - 4 + p['fr'][1]]
    for i, hxp in enumerate((cx - 12, cx + 12)):
        leg = sp.mask().cap((hxp, hip), (fx[i], fy[i] - 8), 22, 20)
        sp.fill(leg, st['rock'][0], st['rock'][1], st['rock'][2], line=st['line'], band=0.62)
        strata(sp, leg, st, hip, fy[i], 8)
        sp.fill(sp.mask().rect(fx[i] - 15, fy[i] - 8, fx[i] + 15, fy[i] + 4), st['dark'][0], st['dark'][1], st['dark'][2], line=st['line'], band=0.55)
    pel = sp.mask().poly([(cx - 24, hip - 8), (cx + 24, hip - 8), (cx + 20, hip + 10), (cx - 20, hip + 10)])
    sp.fill(pel, st['dark'][0], st['dark'][1], st['dark'][2], line=st['line'], band=0.7)
    tor = sp.mask().poly([(cx - 30, sh - 2), (cx + 30, sh - 2), (cx + 24, hip - 6), (cx - 24, hip - 6)])
    sp.fill(tor, st['rock'][0], st['rock'][1], st['rock'][2], line=st['line'], band=0.6)
    strata(sp, tor, st, sh + 4, hip - 6, 7)
    # grieta luminosa a lo largo de la columna
    for t in range(0, 9):
        y = sh + 2 + t * 4
        sp.px(cx + (2 if t % 2 else -2), y, st['glow'][0]); sp.px(cx + (2 if t % 2 else -2), y + 1, st['glow'][1])
    Ls, Rs = (cx - 33, sh + 6), (cx + 33, sh + 6)
    arm(sp, Ls, (cx - 47 + p['hl'][0], hip + 14 + p['hl'][1]), st, -1)
    arm(sp, Rs, (cx + 47 + p['hr'][0], hip + 14 + p['hr'][1]), st, 1)
    pauldron_c(sp, Ls[0] - 3, Ls[1] - 4, st, -1)
    pauldron_c(sp, Rs[0] + 3, Rs[1] - 4, st, 1)
    hx = cx + p['tilt']
    horns(sp, hx, hy, st, 'up', back=p['headback'])
    sp.fill(sp.mask().rect(hx - 8, hy + 6, hx + 8, sh + 4), st['dark'][0], st['dark'][1], st['dark'][2], line=st['line'], band=0.6)
    head = sp.mask().ellipse(hx, hy, 14, 12.5)
    sp.fill(head, st['dark'][0], st['dark'][1], st['dark'][2], line=st['line'], band=0.7)
    sp.fill(sp.mask().rect(hx - 1, hy - 10, hx + 1, hy + 9).get() & head.get(), st['glow'][1], None, None, rim=False)
    sand_fall(sp, cx - 33, sh + 12, st, 8, p['seed'], 6, 24)
    sand_fall(sp, cx + 33, sh + 12, st, 8, p['seed'] + 3, 6, 24)
    return sp


DRAW = {'down': front, 'side': side, 'up': back}


def render(view, pose, st=ROCK):
    return DRAW[view](st, pose)
