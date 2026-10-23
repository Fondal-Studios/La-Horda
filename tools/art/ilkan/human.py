#!/usr/bin/env python3
"""Ilkan, el Caminante de Dunas — figura humana (frente / perfil derecho / espalda).

DISEÑO ORIGINAL (docs/ILKAN_REWORK.md). Silueta propia: capucha-turbante verde azulado con cresta curva que
se vuelca hacia atrás y una cola de pañuelo larga con franja dorada, rostro cubierto con tela ocre y rayas de
pintura blanca bajo los ojos, hombrera de placas de arenisca en un solo hombro, brazo derecho vendado, túnica
ocre con faja diagonal, pantalón holgado y botas envueltas, dos hoces de filo claro y una lanza-pendón
enrollada a la espalda. Paleta: ocre, verde azulado, arenisca, dorado (no comparte colores ni piezas con
ningún personaje existente). Proporción chibi del roster (cabeza ~40 % de la altura).
"""
import math
import numpy as np
from rig import Sprite, Mask, hexc, shift

W, H = 128, 111
CX, GY = 64, 99

# ---------------------------------------------------------------- paletas
BASE = dict(
    skin=(hexc('b0703f'), hexc('84492a'), hexc('cf8f58')),
    ochre=(hexc('cf9548'), hexc('a56f2f'), hexc('ebbb69')),
    teal=(hexc('1f9c92'), hexc('146b6a'), hexc('46d6c4')),
    pants=(hexc('236a74'), hexc('164650'), hexc('348c96')),
    plate=(hexc('b99768'), hexc('8c6c45'), hexc('dcc08e')),
    wrap=(hexc('e9dcb8'), hexc('bfae86'), hexc('fff4d6')),
    leather=(hexc('6d4a2a'), hexc('4a301a'), hexc('92683a')),
    steel=(hexc('d8e4e6'), hexc('9fb4b8'), hexc('ffffff')),
    gold=(hexc('f2c14e'), hexc('c4902a'), hexc('ffe28a')),
    eye=hexc('8ffff0'),
    line=hexc('3a2218'),
    cloak=None, lantern=None,
)
# Skin de set "Caravana de Medianoche": capa índigo con vivo plateado y faroles de cristal.
NIGHT = dict(BASE)
NIGHT.update(
    ochre=(hexc('2c3a78'), hexc('1c2554'), hexc('566ac0')),
    teal=(hexc('463a96'), hexc('2c2468'), hexc('7e6ee0')),
    pants=(hexc('1c2348'), hexc('11162e'), hexc('2e3a6e')),
    plate=(hexc('9aa8c8'), hexc('6a7898'), hexc('d6e0f4')),
    gold=(hexc('d6e2f2'), hexc('9aaccc'), hexc('ffffff')),
    wrap=(hexc('c9d2ea'), hexc('96a2c6'), hexc('f4f8ff')),
    eye=hexc('9ffbff'),
    cloak=(hexc('1d2660'), hexc('121846'), hexc('3a4aa0')),
    lantern=(hexc('7fe9ff'), hexc('3aa8d8'), hexc('e8ffff')),
)


def P(**kw):
    d = dict(bob=0, lean=0, crouch=0, tilt=0, fl=(0, 0), fr=(0, 0), hl=(0, 0), hr=(0, 0), wl=-125, wr=-55,
             eyes='o', scarf=1.0, phase=0.0, hide=False, curve=1, sway=0)
    d.update(kw)
    return d


def ik(S, Hd, l1=9.0, l2=9.0, side=1):
    sx, sy = S
    hx, hy = Hd
    dx, dy = hx - sx, hy - sy
    c = math.hypot(dx, dy) or 0.001
    c = min(c, l1 + l2 - 0.01)
    ux, uy = dx / math.hypot(dx, dy or 0.001) if (dx or dy) else 0, dy / math.hypot(dx or 0.001, dy) if (dx or dy) else 1
    n = math.hypot(dx, dy) or 1.0
    ux, uy = dx / n, dy / n
    a = (c * c + l1 * l1 - l2 * l2) / (2 * c)
    h = math.sqrt(max(l1 * l1 - a * a, 0))
    ex, ey = sx + ux * a + (-uy) * h * side, sy + uy * a + ux * h * side
    # el codo apunta hacia abajo/afuera: se elige el signo con mayor y
    ex2, ey2 = sx + ux * a - (-uy) * h * side, sy + uy * a - ux * h * side
    if ey2 > ey:
        ex, ey = ex2, ey2
    # el brazo no se estira más de lo que alcanza
    hx2, hy2 = sx + ux * c, sy + uy * c
    return (ex, ey), (hx2, hy2)


def sickle(sp, hand, ang, st, curve=1, size=1.0):
    """Hoz: mango corto + hoja curva clara con filo dorado. ang = dirección del mango en grados (y hacia abajo)."""
    a = math.radians(ang)
    dx, dy = math.cos(a), math.sin(a)
    hx, hy = hand
    tip = (hx + dx * 6 * size, hy + dy * 6 * size)
    m = sp.mask().cap((hx - dx * 2, hy - dy * 2), tip, 2.4)
    sp.fill(m, st['leather'][0], st['leather'][1], st['leather'][2])
    # pomo dorado
    sp.px(hx - dx * 3, hy - dy * 3, st['gold'][0])
    # hoja: arco de centro desplazado hacia el lado de la curvatura
    R = 7.0 * size
    nx, ny = -dy * curve, dx * curve
    cxx, cyy = tip[0] + nx * R, tip[1] + ny * R
    a0 = math.degrees(math.atan2(tip[1] - cyy, tip[0] - cxx))
    a1 = a0 + (120 * curve)
    blade = sp.mask().arc(cxx, cyy, R, min(a0, a1), max(a0, a1), 4.8 * size) if curve > 0 else sp.mask().arc(cxx, cyy, R, min(a0, a1), max(a0, a1), 4.8 * size)
    sp.fill(blade, st['steel'][0], st['steel'][1], st['steel'][2])
    # filo dorado (borde exterior de la hoja)
    bm = blade.get() if isinstance(blade, Mask) else blade
    edge = bm & ~shift(bm, int(round(nx)), int(round(ny)))
    sp.rgba[edge & (np.random.RandomState(1).rand(*edge.shape) > -1), :3] = st['gold'][0]


def spear(sp, hand, ang, st, length=30, back=8):
    """Lanza-pendón en la mano: asta de cuero, punta de acero y un pendón corto verde azulado."""
    a = math.radians(ang)
    dx, dy = math.cos(a), math.sin(a)
    hx, hy = hand
    a0 = (hx - dx * back, hy - dy * back)
    a1 = (hx + dx * length, hy + dy * length)
    sp.fill(sp.mask().cap(a0, a1, 2.6), st['leather'][0], st['leather'][1], st['leather'][2], line=st['line'])
    tip = (a1[0] + dx * 8, a1[1] + dy * 8)
    nx, ny = -dy, dx
    sp.fill(sp.mask().poly([(a1[0] + nx * 3, a1[1] + ny * 3), (a1[0] - nx * 3, a1[1] - ny * 3), tip]), st['steel'][0], st['steel'][1], st['steel'][2], line=st['line'])
    pen = [(a1[0] - dx * 4, a1[1] - dy * 4), (a1[0] - dx * 14 + nx * 6, a1[1] - dy * 14 + ny * 6 + 2), (a1[0] - dx * 9, a1[1] - dy * 9 + 1), (a1[0] - dx * 14 - nx * 1, a1[1] - dy * 14 - ny * 1 + 4)]
    sp.fill(sp.mask().poly(pen), st['teal'][0], st['teal'][1], st['teal'][2], line=st['line'])


def pauldron(sp, x, y, st, flip=1, s=1.0):
    """Hombrera de tres placas de arenisca escalonadas."""
    for i, (dx, dy, rx, ry) in enumerate([(0, 3.5, 8.0, 4.4), (0.5 * flip, 0.5, 7.4, 4.3), (1.2 * flip, -2.8, 6.0, 3.6)]):
        m = sp.mask().ellipse(x + dx * s, y + dy * s, rx * s, ry * s)
        sp.fill(m, st['plate'][0], st['plate'][1], st['plate'][2], line=st['line'], band=0.55)
    sp.px(x + 2 * flip, y - 2, st['gold'][0]); sp.px(x - 1 * flip, y + 1, st['gold'][0])


def hood_gem(sp, x, y, st):
    sp.fill(sp.mask().ellipse(x, y, 2.2, 2.2), st['eye'], st['teal'][0], (255, 255, 255), band=0.5)



def ears(sp, hx, hy, st, mode):
    """Capucha de orejas largas de zorro del desierto: dos orejas con forro dorado (silueta propia)."""
    teal = (st['teal'][0], st['teal'][1], st['teal'][2])
    def ear(base_l, base_r, tip, inner_tip, dark=False):
        m = sp.mask().poly([base_l, base_r, tip])
        c = (tuple(int(v * 0.8) for v in teal[0]), tuple(int(v * 0.8) for v in teal[1]), teal[2]) if dark else teal
        sp.fill(m, c[0], c[1], c[2], line=st['line'], band=0.8)
        mid = ((base_l[0] + base_r[0]) / 2, (base_l[1] + base_r[1]) / 2)
        it = (mid[0] + (inner_tip[0] - mid[0]) * 0.8, mid[1] + (inner_tip[1] - mid[1]) * 0.8)
        sp.fill(sp.mask().poly([(base_l[0] * 0.7 + base_r[0] * 0.3, base_l[1] + 0.5), (base_l[0] * 0.3 + base_r[0] * 0.7, base_r[1] + 0.5), it]), st['gold'][0] if not dark else st['gold'][1], None, None, rim=False)
    if mode == 'down':
        ear((hx - 12, hy - 5), (hx - 3.5, hy - 10), (hx - 12.5, hy - 28), (hx - 9, hy - 22))
        ear((hx + 3.5, hy - 10), (hx + 12, hy - 5), (hx + 14, hy - 26), (hx + 9, hy - 21))
    elif mode == 'side':
        ear((hx - 9, hy - 8), (hx - 1, hy - 11), (hx - 5, hy - 29), (hx - 4, hy - 22), dark=True)
        ear((hx - 13, hy - 7), (hx - 4, hy - 11), (hx - 15, hy - 27), (hx - 10, hy - 21))
    else:
        ear((hx - 12, hy - 5), (hx - 3.5, hy - 10), (hx - 13, hy - 27), (hx - 9, hy - 22))
        ear((hx + 3.5, hy - 10), (hx + 12, hy - 5), (hx + 12, hy - 29), (hx + 9, hy - 22))

# ---------------------------------------------------------------- vista de frente
def front(st, p):
    sp = Sprite(W, H)
    cx = CX + p['lean']
    L = 17 - p['crouch']
    hip = GY - L - 1
    sh = hip - 20 + p['bob']
    hy = sh - 15 + p['bob'] * 0.5
    sw = p['sway']
    # --- capa trasera: lanza-pendón enrollada y cola del pañuelo
    pole = sp.mask().cap((cx - 14, hip + 7), (cx + 14, sh - 16), 2.6)
    sp.fill(pole, st['leather'][0], st['leather'][1], st['leather'][2], line=st['line'])
    cloth = sp.mask().cap((cx + 8, sh - 8), (cx + 14, sh - 16), 5.6)
    sp.fill(cloth, st['teal'][0], st['teal'][1], st['teal'][2], line=st['line'])
    sp.fill(sp.mask().poly([(cx + 13, sh - 18), (cx + 17, sh - 24), (cx + 11, sh - 21)]), st['steel'][0], st['steel'][1], st['steel'][2])
    tail = sp.mask().cap((cx + 5, sh + 2), (cx + 9 + sw * 3, hip + 12 + p['scarf'] * 2), 5.5, 4)
    sp.fill(tail, st['teal'][0], st['teal'][1], st['teal'][2], line=st['line'])
    sp.fill(sp.mask().cap((cx + 5, sh + 4), (cx + 9 + sw * 3, hip + 11 + p['scarf'] * 2), 1.6), st['gold'][0])
    if st['cloak']:
        cl = sp.mask().poly([(cx - 12, sh - 1), (cx + 12, sh - 1), (cx + 17, hip + 12), (cx - 17, hip + 12)])
        sp.fill(cl, st['cloak'][0], st['cloak'][1], st['cloak'][2], line=st['line'])
    # --- piernas
    fx = [cx - 5.5 + p['fl'][0], cx + 5.5 + p['fr'][0]]
    fy = [GY - 3 + p['fl'][1], GY - 3 + p['fr'][1]]
    for i, hxp in enumerate((cx - 4.5, cx + 4.5)):
        leg = sp.mask().cap((hxp, hip), (fx[i], fy[i] - 2), 7.5, 6.5)
        sp.fill(leg, st['pants'][0], st['pants'][1], st['pants'][2], line=st['line'])
        boot = sp.mask().ellipse(fx[i], fy[i], 5.2, 3.4)
        sp.fill(boot, st['leather'][0], st['leather'][1], st['leather'][2], line=st['line'])
        sp.fill(sp.mask().rect(fx[i] - 4, fy[i] - 3, fx[i] + 4, fy[i] - 1.5), st['wrap'][0], st['wrap'][1], None)
    # --- túnica
    tun = sp.mask().poly([(cx - 10.5, sh), (cx + 10.5, sh), (cx + 9, hip - 3), (cx + 12.5, hip + 7), (cx - 12.5, hip + 7), (cx - 9, hip - 3)])
    tm = tun.get()
    sp.fill(tm, st['ochre'][0], st['ochre'][1], st['ochre'][2], line=st['line'])
    sash = sp.mask().poly([(cx - 10.5, sh), (cx - 4, sh), (cx + 12.5, hip + 5), (cx + 6, hip + 7)]).get() & tm
    sp.fill(sash, st['teal'][0], st['teal'][1], st['teal'][2], band=0.7)
    belt = sp.mask().rect(cx - 11, hip - 5, cx + 11, hip - 2.5).get() & tm
    sp.fill(belt, st['leather'][0], st['leather'][1], st['leather'][2], band=0.9)
    sp.fill(sp.mask().rect(cx - 2.2, hip - 5.4, cx + 2.2, hip - 2.1), st['gold'][0], st['gold'][1], st['gold'][2], band=0.6)
    # --- brazos
    Ls, Rs = (cx - 11.5, sh + 3), (cx + 11.5, sh + 3)
    Lh = (cx - 16 + p['hl'][0], hip + 3 + p['hl'][1])
    Rh = (cx + 16 + p['hr'][0], hip + 3 + p['hr'][1])
    for S, Hd, side, bare in ((Rs, Rh, 1, True), (Ls, Lh, -1, False)):
        E, Hh = ik(S, Hd, 9.5, 9.5, side)
        a1 = sp.mask().cap(S, E, 6.4, 5.8)
        a2 = sp.mask().cap(E, Hh, 5.6, 4.8)
        sleeve = st['skin'] if bare else st['ochre']
        sp.fill(a1, sleeve[0], sleeve[1], sleeve[2], line=st['line'])
        sp.fill(a2, st['skin'][0], st['skin'][1], st['skin'][2], line=st['line'])
        if bare:   # vendas del antebrazo derecho
            for t in (0.3, 0.5, 0.7):
                px_, py_ = E[0] + (Hh[0] - E[0]) * t, E[1] + (Hh[1] - E[1]) * t
                sp.fill(sp.mask().ellipse(px_, py_, 3.0, 1.4), st['wrap'][0], st['wrap'][1], None)
        sp.fill(sp.mask().ellipse(Hh[0], Hh[1], 3.0, 3.0), st['skin'][0], st['skin'][1], st['skin'][2], line=st['line'])
        if p.get('spear') is not None and side > 0:
            spear(sp, Hh, p['spear'], st)
        elif not p['hide']:
            sickle(sp, Hh, p['wl'] if side < 0 else p['wr'], st, curve=-side)
    pauldron(sp, Ls[0] - 1, Ls[1] - 3, st, flip=-1)
    # --- cabeza
    hx = cx + p['tilt']
    ears(sp, hx, hy, st, 'down')
    hood = sp.mask().ellipse(hx, hy - 1, 14, 13.5)
    sp.fill(hood, st['teal'][0], st['teal'][1], st['teal'][2], line=st['line'], band=0.7)
    face = sp.mask().ellipse(hx, hy + 1.5, 10, 9)
    sp.fill(face, st['skin'][0], st['skin'][1], st['skin'][2], band=0.75)
    fm = face.get()
    yy = np.arange(H)[:, None] * np.ones((1, W))
    wrap = fm & (yy > hy + 3.4)
    sp.fill(wrap, st['ochre'][0], st['ochre'][1], st['ochre'][2], line=None, band=0.7, rim=False)
    sp.fill(sp.mask().poly([(hx - 10, hy + 2.5), (hx + 10, hy + 2.5), (hx + 9, hy + 4.5), (hx - 9, hy + 4.5)]).get() & fm, st['teal'][1], None, None, rim=False)
    # ojos + pintura blanca
    for ex_ in (hx - 4.2, hx + 4.2):
        if p['eyes'] == 'c':
            sp.fill(sp.mask().rect(ex_ - 1.8, hy - 0.5, ex_ + 1.8, hy + 0.6), st['line'], None, None, rim=False)
        else:
            sp.fill(sp.mask().rect(ex_ - 1.8, hy - 1.6, ex_ + 1.8, hy + (1.6 if p['eyes'] == 'w' else 1.0)), st['line'], None, None, rim=False)
            sp.px(ex_ - 0.5, hy - 0.3, st['eye']); sp.px(ex_ + 0.5, hy - 0.3, st['eye'])
        sp.fill(sp.mask().rect(ex_ + (-4.2 if ex_ < hx else 3.2), hy - 0.8, ex_ + (-3.2 if ex_ < hx else 4.2), hy + 2.4), st['wrap'][0], None, None, rim=False)
    sp.fill(sp.mask().rect(hx - 5.5, hy - 3.6, hx - 2.5, hy - 2.6), st['line'], None, None, rim=False)
    sp.fill(sp.mask().rect(hx + 2.5, hy - 3.6, hx + 5.5, hy - 2.6), st['line'], None, None, rim=False)
    # banda dorada y gema
    band = sp.mask().rect(hx - 10, hy - 8.2, hx + 10, hy - 5.8).get() & hood.get()
    sp.fill(band, st['gold'][0], st['gold'][1], st['gold'][2], band=0.6)
    hood_gem(sp, hx, hy - 7, st)
    if st['lantern']:
        lantern(sp, cx - 17, hip + 1, st)
    return sp


def lantern(sp, x, y, st):
    sp.fill(sp.mask().cap((x, y - 5), (x, y - 1), 1.2), st['line'])
    body = sp.mask().ellipse(x, y + 2, 3.2, 4.2)
    sp.fill(body, st['lantern'][0], st['lantern'][1], st['lantern'][2], line=st['line'], band=0.7)
    sp.px(x, y + 1, (255, 255, 255)); sp.px(x, y + 2, st['lantern'][2])


# ---------------------------------------------------------------- perfil derecho
def side(st, p):
    sp = Sprite(W, H)
    cx = CX + p['lean']
    L = 17 - p['crouch']
    hip = GY - L - 1
    sh = hip - 20 + p['bob']
    hy = sh - 15 + p['bob'] * 0.5
    t = p['phase']
    amp = 2.5 * p['scarf']
    # --- cola del pañuelo (larga, ondulante, hacia atrás)
    pts_u, pts_l = [], []
    n0 = (cx - 7, hy + 3)
    for i in range(11):
        x = n0[0] - i * 3.1 * (0.9 + 0.1 * p['scarf'])
        y = n0[1] + math.sin(i * 0.8 + t) * amp * (i / 10.0) + i * 0.9 - 1.5 * p['scarf'] * (i / 10.0)
        w = 6.4 - i * 0.35
        pts_u.append((x, y - w / 2)); pts_l.append((x, y + w / 2))
    sp.fill(sp.mask().poly(pts_u + pts_l[::-1]), st['teal'][0], st['teal'][1], st['teal'][2], line=st['line'], band=0.7)
    gold = [((a[0] + b[0]) / 2, (a[1] + b[1]) / 2) for a, b in zip(pts_u, pts_l)]
    for (x, y) in gold[1:9]:
        sp.px(x, y, st['gold'][0])
    # --- lanza-pendón a la espalda
    pole = sp.mask().cap((cx - 9, hip + 8), (cx + 3, sh - 18), 2.4)
    sp.fill(pole, st['leather'][0], st['leather'][1], st['leather'][2], line=st['line'])
    sp.fill(sp.mask().cap((cx - 1, sh - 7), (cx + 2, sh - 15), 5.0), st['teal'][0], st['teal'][1], st['teal'][2], line=st['line'])
    sp.fill(sp.mask().poly([(cx + 2, sh - 19), (cx + 5, sh - 26), (cx + 0, sh - 22)]), st['steel'][0], st['steel'][1], st['steel'][2])
    if st['cloak']:
        cl = sp.mask().poly([(cx - 5, sh - 1), (cx + 4, sh - 1), (cx + 2, hip + 12 + p['scarf']), (cx - 14 - p['scarf'] * 2, hip + 12)])
        sp.fill(cl, st['cloak'][0], st['cloak'][1], st['cloak'][2], line=st['line'])
    # --- pierna lejana, brazo lejano
    far_f = (cx - 2 + p['fr'][0], GY - 3 + p['fr'][1])
    near_f = (cx + 1 + p['fl'][0], GY - 3 + p['fl'][1])
    leg = sp.mask().cap((cx - 1, hip), (far_f[0], far_f[1] - 2), 6.8, 6)
    dark = lambda c: tuple(int(v * 0.78) for v in c)
    sp.fill(leg, dark(st['pants'][0]), dark(st['pants'][1]), None, line=st['line'])
    sp.fill(sp.mask().ellipse(far_f[0] + 2, far_f[1], 5.8, 3.2), dark(st['leather'][0]), dark(st['leather'][1]), None, line=st['line'])
    Fs = (cx - 1, sh + 3)
    Fh = (cx - 6 + p['hr'][0], hip + 1 + p['hr'][1])
    E, Hh = ik(Fs, Fh, 9, 9, 1)
    sp.fill(sp.mask().cap(Fs, E, 5.6, 5), dark(st['skin'][0]), dark(st['skin'][1]), None, line=st['line'])
    sp.fill(sp.mask().cap(E, Hh, 5, 4.4), dark(st['skin'][0]), dark(st['skin'][1]), None, line=st['line'])
    if not p['hide']:
        sickle(sp, Hh, p['wr'], st, curve=1)
    # --- torso
    tun = sp.mask().poly([(cx - 6.5, sh), (cx + 6.5, sh), (cx + 6, hip - 3), (cx + 9.5, hip + 7), (cx - 9.5, hip + 7), (cx - 6, hip - 3)])
    tm = tun.get()
    sp.fill(tm, st['ochre'][0], st['ochre'][1], st['ochre'][2], line=st['line'])
    sash = sp.mask().poly([(cx - 6.5, sh), (cx - 1, sh), (cx + 9.5, hip + 6), (cx + 4, hip + 7)]).get() & tm
    sp.fill(sash, st['teal'][0], st['teal'][1], st['teal'][2], band=0.7)
    belt = sp.mask().rect(cx - 8, hip - 5, cx + 8, hip - 2.5).get() & tm
    sp.fill(belt, st['leather'][0], st['leather'][1], st['leather'][2], band=0.9)
    sp.fill(sp.mask().rect(cx + 2.5, hip - 5.4, cx + 6, hip - 2.1), st['gold'][0], st['gold'][1], st['gold'][2], band=0.6)
    # --- pierna cercana
    leg = sp.mask().cap((cx + 1, hip), (near_f[0], near_f[1] - 2), 7.4, 6.4)
    sp.fill(leg, st['pants'][0], st['pants'][1], st['pants'][2], line=st['line'])
    sp.fill(sp.mask().ellipse(near_f[0] + 2, near_f[1], 6, 3.3), st['leather'][0], st['leather'][1], st['leather'][2], line=st['line'])
    sp.fill(sp.mask().rect(near_f[0] - 2, near_f[1] - 3, near_f[0] + 4, near_f[1] - 1.4), st['wrap'][0], st['wrap'][1], None)
    # --- brazo cercano (vendado)
    Ns = (cx + 1, sh + 3)
    Nh = (cx + 9 + p['hl'][0], hip - 2 + p['hl'][1])
    E, Hh = ik(Ns, Nh, 9.5, 9.5, 1)
    sp.fill(sp.mask().cap(Ns, E, 6.2, 5.6), st['skin'][0], st['skin'][1], st['skin'][2], line=st['line'])
    sp.fill(sp.mask().cap(E, Hh, 5.4, 4.8), st['skin'][0], st['skin'][1], st['skin'][2], line=st['line'])
    for tt in (0.3, 0.5, 0.7):
        sp.fill(sp.mask().ellipse(E[0] + (Hh[0] - E[0]) * tt, E[1] + (Hh[1] - E[1]) * tt, 3.2, 1.7), st['wrap'][0], st['wrap'][1], None)
    sp.fill(sp.mask().ellipse(Hh[0], Hh[1], 2.9, 2.9), st['skin'][0], st['skin'][1], st['skin'][2], line=st['line'])
    if p.get('spear') is not None:
        spear(sp, Hh, p['spear'], st)
    elif not p['hide']:
        sickle(sp, Hh, p['wl'], st, curve=-1)
    pauldron(sp, Ns[0] + 0.5, Ns[1] - 3, st, flip=1, s=0.92)
    if st['lantern']:
        lantern(sp, cx - 9, hip + 2, st)
    # --- cabeza (perfil derecho): capucha, cresta hacia atrás, cara cubierta
    hx = cx + 1 + p['tilt']
    ears(sp, hx, hy, st, 'side')
    hood = sp.mask().ellipse(hx - 2, hy - 1, 13.2, 13.4)
    sp.fill(hood, st['teal'][0], st['teal'][1], st['teal'][2], line=st['line'], band=0.7)
    face = sp.mask().ellipse(hx + 5, hy + 1.5, 7.6, 8.8)
    sp.fill(face, st['skin'][0], st['skin'][1], st['skin'][2], band=0.75)
    fm = face.get()
    yy = np.arange(H)[:, None] * np.ones((1, W))
    wrap = fm & (yy > hy + 3.4)
    sp.fill(wrap, st['ochre'][0], st['ochre'][1], st['ochre'][2], band=0.7, rim=False)
    sp.fill(sp.mask().ellipse(hx + 12.2, hy + 2.6, 1.7, 1.6), st['skin'][0], st['skin'][1], st['skin'][2], rim=False)  # nariz
    ex_ = hx + 7.2
    if p['eyes'] == 'c':
        sp.fill(sp.mask().rect(ex_ - 1.8, hy - 0.5, ex_ + 1.8, hy + 0.6), st['line'], None, None, rim=False)
    else:
        sp.fill(sp.mask().rect(ex_ - 1.6, hy - 1.6, ex_ + 1.8, hy + (1.6 if p['eyes'] == 'w' else 1.0)), st['line'], None, None, rim=False)
        sp.px(ex_ + 0.4, hy - 0.3, st['eye']); sp.px(ex_ + 1.2, hy - 0.3, st['eye'])
    sp.fill(sp.mask().rect(ex_ - 0.4, hy + 1.6, ex_ + 0.8, hy + 3.4), st['wrap'][0], None, None, rim=False)
    sp.fill(sp.mask().rect(ex_ - 2.5, hy - 3.6, ex_ + 2.2, hy - 2.6), st['line'], None, None, rim=False)
    band = sp.mask().rect(hx - 14, hy - 8.2, hx + 10, hy - 5.8).get() & hood.get()
    sp.fill(band, st['gold'][0], st['gold'][1], st['gold'][2], band=0.6)
    hood_gem(sp, hx + 4, hy - 7, st)
    return sp


# ---------------------------------------------------------------- espalda
def back(st, p):
    sp = Sprite(W, H)
    cx = CX + p['lean']
    L = 17 - p['crouch']
    hip = GY - L - 1
    sh = hip - 20 + p['bob']
    hy = sh - 15 + p['bob'] * 0.5
    sw = p['sway']
    if st['cloak']:
        cl = sp.mask().poly([(cx - 12, sh - 1), (cx + 12, sh - 1), (cx + 17, hip + 12), (cx - 17, hip + 12)])
        sp.fill(cl, st['cloak'][0], st['cloak'][1], st['cloak'][2], line=st['line'])
    fx = [cx - 5.5 + p['fl'][0], cx + 5.5 + p['fr'][0]]
    fy = [GY - 3 + p['fl'][1], GY - 3 + p['fr'][1]]
    for i, hxp in enumerate((cx - 4.5, cx + 4.5)):
        leg = sp.mask().cap((hxp, hip), (fx[i], fy[i] - 2), 7.5, 6.5)
        sp.fill(leg, st['pants'][0], st['pants'][1], st['pants'][2], line=st['line'])
        sp.fill(sp.mask().ellipse(fx[i], fy[i], 5.2, 3.4), st['leather'][0], st['leather'][1], st['leather'][2], line=st['line'])
        sp.fill(sp.mask().rect(fx[i] - 4, fy[i] - 3, fx[i] + 4, fy[i] - 1.5), st['wrap'][0], st['wrap'][1], None)
    tun = sp.mask().poly([(cx - 10.5, sh), (cx + 10.5, sh), (cx + 9, hip - 3), (cx + 12.5, hip + 7), (cx - 12.5, hip + 7), (cx - 9, hip - 3)])
    tm = tun.get()
    sp.fill(tm, st['ochre'][0], st['ochre'][1], st['ochre'][2], line=st['line'])
    belt = sp.mask().rect(cx - 11, hip - 5, cx + 11, hip - 2.5).get() & tm
    sp.fill(belt, st['leather'][0], st['leather'][1], st['leather'][2], band=0.9)
    for S, Hd, side_, bare in (((cx - 11.5, sh + 3), (cx - 15 + p['hl'][0], hip + 4 + p['hl'][1]), -1, False),
                              ((cx + 11.5, sh + 3), (cx + 15 + p['hr'][0], hip + 4 + p['hr'][1]), 1, True)):
        E, Hh = ik(S, Hd, 9.5, 9.5, side_)
        sleeve = st['skin'] if bare else st['ochre']
        sp.fill(sp.mask().cap(S, E, 6.4, 5.8), sleeve[0], sleeve[1], sleeve[2], line=st['line'])
        sp.fill(sp.mask().cap(E, Hh, 5.6, 4.8), st['skin'][0], st['skin'][1], st['skin'][2], line=st['line'])
        sp.fill(sp.mask().ellipse(Hh[0], Hh[1], 3.0, 3.0), st['skin'][0], st['skin'][1], st['skin'][2], line=st['line'])
        if not p['hide']:
            sickle(sp, Hh, p['wl'] if side_ < 0 else p['wr'], st, curve=-side_)
    pauldron(sp, cx - 12.5, sh, st, flip=-1)
    # pendón enrollado atravesado a la espalda (se ve completo)
    pole = sp.mask().cap((cx - 15, hip + 5), (cx + 14, sh - 14), 2.6)
    sp.fill(pole, st['leather'][0], st['leather'][1], st['leather'][2], line=st['line'])
    sp.fill(sp.mask().cap((cx + 4, sh - 3), (cx + 13, sh - 13), 5.8), st['teal'][0], st['teal'][1], st['teal'][2], line=st['line'])
    sp.fill(sp.mask().cap((cx - 12, hip + 2), (cx - 5, hip - 4), 4.6), st['teal'][0], st['teal'][1], st['teal'][2], line=st['line'])
    sp.fill(sp.mask().poly([(cx + 13, sh - 16), (cx + 17, sh - 23), (cx + 11, sh - 20)]), st['steel'][0], st['steel'][1], st['steel'][2])
    # cola del pañuelo por el centro de la espalda
    tail = sp.mask().cap((cx, sh - 4), (cx + sw * 3, hip + 13 + p['scarf'] * 2), 6.6, 4.4)
    sp.fill(tail, st['teal'][0], st['teal'][1], st['teal'][2], line=st['line'])
    sp.fill(sp.mask().cap((cx, sh - 2), (cx + sw * 3, hip + 11 + p['scarf'] * 2), 1.6), st['gold'][0])
    hx = cx + p['tilt']
    ears(sp, hx, hy, st, 'up')
    hood = sp.mask().ellipse(hx, hy - 1, 14, 13.5)
    sp.fill(hood, st['teal'][0], st['teal'][1], st['teal'][2], line=st['line'], band=0.7)
    band = sp.mask().rect(hx - 14, hy - 4.2, hx + 14, hy - 1.8).get() & hood.get()
    sp.fill(band, st['gold'][0], st['gold'][1], st['gold'][2], band=0.6)
    if st['lantern']:
        lantern(sp, cx + 17, hip + 1, st)
    return sp


DRAW = {'down': front, 'side': side, 'up': back}


def render(view, pose, st=BASE):
    return DRAW[view](st, pose)
