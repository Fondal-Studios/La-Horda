#!/usr/bin/env python3
"""Biblioteca de poses de Ilkan: cada índice del atlas (misma grilla que usa el motor) -> imagen 128x111.

El índice de cada animación es el mismo que usaba el atlas anterior (js/assets/champion-sprites.js), así
que la lógica, los tiempos y las animaciones del juego no cambian: solo cambia el dibujo.
"""
import math
from PIL import Image
import numpy as np
from rig import rotate_about, clean_alpha, Sprite
from human import render, P, BASE, NIGHT, W, H, CX, GY

# defaults de mano (desplazamientos): frente L(-16,3) R(16,3) · perfil cercana(9,-2) lejana(-6,1) · espalda L(-15,4) R(15,4)
HIP_FRONT = GY - 18


def hand(view, which, tx, ty):
    """Offset de mano a partir de un punto objetivo relativo a (cx, hip)."""
    d = {('down', 'l'): (-16, 3), ('down', 'r'): (16, 3), ('side', 'l'): (9, -2), ('side', 'r'): (-6, 1),
         ('up', 'l'): (-15, 4), ('up', 'r'): (15, 4)}[(view, which)]
    return (tx - d[0], ty - d[1])


def finish(sp, rot=0, pivot=None, dy=0, dx=0, flip=False):
    img = sp.image()
    if rot:
        img = rotate_about(img, rot, pivot or (CX, GY - 18))
    if dx or dy:
        out = Image.new('RGBA', img.size, (0, 0, 0, 0))
        out.alpha_composite(img, (dx, dy))
        img = out
    if flip:
        img = img.transpose(Image.FLIP_LEFT_RIGHT)
    img = clean_alpha(img)
    s2 = Sprite(W, H)
    s2.rgba = np.array(img)
    s2.outline()
    return s2.image()


def walk_pose(view, i, run=False):
    """i = 0 neutro; 1..4 ciclo (contacto, paso, contacto, paso)."""
    if i == 0 and not run:
        return P(sway=0.0)
    k = (i - 1) if not run else i
    n = 4
    a = 2 * math.pi * k / n
    st = 7.5 if run else 5.0
    near_dx, far_dx = st * math.sin(a), -st * math.sin(a)
    near_lift = -(3.2 if run else 3.4) * max(0, math.cos(a))
    far_lift = -(3.2 if run else 3.4) * max(0, -math.cos(a))
    bob = -1.0 * abs(math.cos(a)) if not run else -2.0 * abs(math.cos(a))
    arm = (4.5 if not run else 7) * math.sin(a)
    if view == 'side':
        return P(bob=bob, lean=(4 if run else 0), fl=(near_dx, near_lift), fr=(far_dx, far_lift),
                 hl=hand('side', 'l', 9 - arm * 1.0, -2 + (-4 if run else 0)), hr=hand('side', 'r', -6 + arm, 1 + (-3 if run else 0)),
                 wl=(-40 - 12 * math.sin(a)), wr=(-75 + 14 * math.sin(a)), phase=a * 1.3, scarf=(1.5 if run else 1.0))
    sg = 1 if view == 'down' else 1
    return P(bob=bob, fl=(near_dx * 0.3, near_lift * 1.3 + (1.5 if near_lift == 0 else 0) * 0), fr=(far_dx * 0.3, far_lift * 1.3),
             hl=(0, -arm * 0.6), hr=(0, arm * 0.6), wl=-125, wr=-55, sway=math.sin(a) * 0.6)


def idle_pose(view, i):
    b = [0, -1, 0][i % 3] if view == 'down' else 0
    return P(bob=b, scarf=1.0 + 0.2 * (i % 3), sway=(i % 3 - 1) * 0.5, phase=i * 1.1)


def frame_for(idx, st=BASE):
    """Devuelve la imagen del cuadro `idx` de la hoja humana."""
    # --- ciclos de caminata (mismos índices que el atlas anterior)
    if 52 <= idx <= 56:
        return finish(render('side', walk_pose('side', idx - 52), st))
    if 47 <= idx <= 51:
        return finish(render('side', walk_pose('side', idx - 47), st), flip=True)
    if 42 <= idx <= 46:
        return finish(render('down', walk_pose('down', idx - 42), st))
    if 57 <= idx <= 61:
        return finish(render('up', walk_pose('up', idx - 57), st))
    if 38 <= idx <= 41:
        return finish(render('side', walk_pose('side', idx - 38, run=True), st))
    if 31 <= idx <= 33:
        return finish(render('down', idle_pose('down', idx - 31), st))
    # --- ataque con hoces (perfil): armado, tajo alto, tajo bajo, recuperación
    if 6 <= idx <= 9:
        k = idx - 6
        poses = [
            P(lean=-2, fl=(-4, 0), fr=(4, 0), hl=hand('side', 'l', 0, -14), hr=hand('side', 'r', -12, -10), wl=-150, wr=-120, eyes='o', phase=0.5),
            P(lean=4, fl=(5, 0), fr=(-6, 0), hl=hand('side', 'l', 17, -26), hr=hand('side', 'r', 9, -22), wl=-30, wr=-55, eyes='w', scarf=1.6, phase=1.3),
            P(lean=6, bob=2, crouch=2, fl=(7, 0), fr=(-7, 0), hl=hand('side', 'l', 19, 6), hr=hand('side', 'r', 12, 2), wl=30, wr=10, scarf=1.6, phase=2.1),
            P(lean=2, fl=(2, 0), fr=(-2, 0), hl=hand('side', 'l', 10, -4), hr=hand('side', 'r', -2, 0), wl=-20, wr=-60, scarf=1.2, phase=2.8),
        ]
        return finish(render('side', poses[k], st))
    # --- Lanzar / apuntar (3): perfil con la mano extendida
    if 3 <= idx <= 5:
        k = idx - 3
        poses = [
            P(lean=-1, hl=hand('side', 'l', 3, -22), wl=-70, spear=-60, phase=0.4),
            P(lean=3, hl=hand('side', 'l', 17, -20), wl=-10, spear=-15, scarf=1.4, phase=1.4),
            P(lean=4, hl=hand('side', 'l', 21, -17), wl=-5, spear=-8, scarf=1.8, phase=2.0),
        ]
        return finish(render('side', poses[k], st))
    # --- ¡Caravana! (grito, de frente): brazos en alto, ojos grandes
    if 0 <= idx <= 2:
        k = idx
        poses = [
            P(bob=-1, hl=hand('down', 'l', -13, -22), hr=hand('down', 'r', 13, -22), wl=-110, wr=-70, eyes='w', sway=0.4),
            P(bob=-2, hl=hand('down', 'l', -17, -33), hr=hand('down', 'r', 17, -33), wl=-120, wr=-60, eyes='w', scarf=1.6, sway=-0.6),
            P(bob=-3, crouch=-1, hl=hand('down', 'l', -19, -37), hr=hand('down', 'r', 19, -37), wl=-125, wr=-55, eyes='w', scarf=2.0, sway=0.8),
        ]
        return finish(render('down', poses[k], st))
    # --- Invocar al Coloso (4): hoces clavadas en la arena
    if 10 <= idx <= 13:
        k = idx - 10
        poses = [
            P(bob=-1, hl=hand('down', 'l', -11, -26), hr=hand('down', 'r', 11, -26), wl=-80, wr=-100, eyes='w'),
            P(bob=-2, crouch=1, hl=hand('down', 'l', -9, -36), hr=hand('down', 'r', 9, -36), wl=-60, wr=-120, eyes='w', scarf=1.8),
            P(bob=3, crouch=7, hl=hand('down', 'l', -12, 6), hr=hand('down', 'r', 12, 6), wl=70, wr=110, tilt=0, eyes='c', scarf=1.5),
            P(bob=4, crouch=8, hl=hand('down', 'l', -13, 10), hr=hand('down', 'r', 13, 10), wl=75, wr=105, eyes='c', scarf=1.0),
        ]
        sp = render('down', poses[k], st)
        if k >= 2:   # granos de arena que suben alrededor de las hoces clavadas
            rs = np.random.RandomState(40 + k)
            for _ in range(10 + 6 * (k - 2)):
                x = CX + rs.randint(-24, 25)
                y = GY - rs.randint(0, 12 + 8 * (k - 2))
                sp.px(x, y, (224, 192, 112) if rs.rand() > 0.35 else (79, 227, 207))
        return finish(sp)
    # --- Muerte (3): de rodillas, cayendo, tendido
    if 14 <= idx <= 16:
        k = idx - 14
        if k == 0:
            return finish(render('down', P(crouch=8, bob=3, tilt=1, eyes='c', hide=True, hl=hand('down', 'l', -12, 9), hr=hand('down', 'r', 12, 9)), st))
        if k == 1:
            return finish(render('side', P(crouch=2, lean=-3, eyes='c', hide=True, hl=hand('side', 'l', 4, -16), hr=hand('side', 'r', -9, -8), scarf=2.0), st), rot=40, pivot=(CX, GY - 3), dy=1)
        return finish(render('side', P(eyes='c', hide=True, hl=hand('side', 'l', 6, -10), hr=hand('side', 'r', -8, -4), scarf=0.3), st), rot=88, pivot=(CX, GY - 3), dy=-1, dx=32)
    # --- Agotado (3): encorvado, manos en las rodillas, jadeando
    if 17 <= idx <= 19:
        k = idx - 17
        poses = [
            P(crouch=5, bob=3, lean=0, tilt=0, eyes='c', hide=True, hl=hand('down', 'l', -9, 8), hr=hand('down', 'r', 9, 8)),
            P(crouch=6, bob=4, eyes='c', hide=True, hl=hand('down', 'l', -9, 9), hr=hand('down', 'r', 9, 9), scarf=0.6),
            P(crouch=5, bob=3, eyes='c', hide=True, hl=hand('down', 'l', -9, 8), hr=hand('down', 'r', 9, 8), scarf=0.8),
        ]
        return finish(render('down', poses[k], st))
    # --- Golpe recibido (2)
    if 20 <= idx <= 21:
        k = idx - 20
        poses = [
            P(lean=-4, tilt=-2, eyes='c', fl=(-3, 0), fr=(3, 0), hl=hand('side', 'l', 2, -10), hr=hand('side', 'r', -12, -8), wl=-150, wr=-100, scarf=1.8),
            P(lean=-6, tilt=-3, eyes='c', bob=1, fl=(-4, 0), fr=(4, 0), hl=hand('side', 'l', -1, -6), hr=hand('side', 'r', -14, -4), wl=-160, wr=-110, scarf=2.2),
        ]
        return finish(render('side', poses[k], st))
    # --- Lanza-Pendón: preparar / lanzar / volar / tajo / aterrizar
    if 27 <= idx <= 28:
        k = idx - 27
        poses = [
            P(crouch=5, lean=-3, bob=2, hl=hand('side', 'l', -6, -10), wl=-90, spear=-170, fl=(-3, 0), fr=(5, 0), eyes='w'),
            P(crouch=6, lean=-4, bob=2, hl=hand('side', 'l', -10, -14), wl=-90, spear=-175, fl=(-4, 0), fr=(6, 0), eyes='w', scarf=1.5),
        ]
        return finish(render('side', poses[k], st))
    if idx == 26:
        return finish(render('side', P(lean=5, crouch=2, hl=hand('side', 'l', 22, -22), wl=-20, spear=-12, fl=(6, 0), fr=(-6, 0), eyes='w', scarf=1.8), st))
    if 22 <= idx <= 24:
        k = idx - 22
        sp = render('side', P(crouch=-1, lean=2, hl=hand('side', 'l', 22, -20 - k), wl=-70, spear=-70, hr=hand('side', 'r', 8, -8), fl=(-8 + k * 1.5, 0), fr=(-10 + k, -3 - k), eyes='w', scarf=2.2, phase=k * 0.8), st)
        return finish(sp, rot=-64, pivot=(CX, GY - 22), dy=-4, dx=2)
    if 29 <= idx <= 30:
        k = idx - 29
        sp = render('side', P(lean=3, hl=hand('side', 'l', 20, -10 + 14 * k), wl=-60 + 70 * k, hr=hand('side', 'r', 10, -22 + 20 * k), wr=-100 + 60 * k, fl=(-8, 0), fr=(-11, -3), eyes='w', scarf=2.0, phase=2 + k), st)
        return finish(sp, rot=-48, pivot=(CX, GY - 22), dy=-2, dx=1)
    if idx == 25:
        return finish(render('side', P(crouch=8, bob=4, lean=5, hl=hand('side', 'l', 17, 12), wl=40, hr=hand('side', 'r', 4, 2), wr=-40, fl=(7, 0), fr=(-6, 0), scarf=1.8, phase=1.0), st))
    # --- Piel de Duna (4): guardia con hoces cruzadas, de frente
    if 34 <= idx <= 37:
        k = idx - 34
        poses = [
            P(crouch=2, bob=1, hl=hand('down', 'l', 4, -18), hr=hand('down', 'r', -4, -18), wl=-30, wr=-150, eyes='w', sway=0.2),
            P(crouch=3, bob=2, hl=hand('down', 'l', 6, -20), hr=hand('down', 'r', -6, -20), wl=-20, wr=-160, eyes='w', scarf=1.6, sway=-0.5),
            P(crouch=3, bob=2, hl=hand('down', 'l', 7, -22), hr=hand('down', 'r', -7, -22), wl=-10, wr=-170, eyes='w', scarf=1.2, sway=0.5),
            P(crouch=2, bob=1, hl=hand('down', 'l', 5, -19), hr=hand('down', 'r', -5, -19), wl=-25, wr=-155, eyes='w', scarf=1.8, sway=-0.3),
        ]
        return finish(render('down', poses[k], st))
    raise KeyError(idx)


HUMAN_INDICES = list(range(0, 62))
