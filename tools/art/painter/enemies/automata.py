"""Autómata de Hierro (Fortaleza): coloso blindado con horno en el pecho y maza de púas; embiste soltando vapor."""
import math
from enemy_paint import ramp
import _brute

SPEC = dict(
    arena='fortaleza', w=150, h=104, refH=84, anchor=0.96, outline='#120a0c',
    frames=[('idle', 4), ('walk', 6), ('atk', 5), ('charge', 3), ('hit', 1), ('death', 4)],
    alias={'walk_down': ['walk'], 'walk_up': ['walk']},
)
IRON = ramp('#6d7684'); DARK = ramp('#3e4452'); BRONZE = ramp('#a8723a'); BOOT = ramp('#262a33')
GLOW = [(90, 20, 8), (200, 60, 20), (255, 150, 50), (255, 235, 170)]
STEAM = [(150, 150, 160), (190, 190, 198), (225, 225, 230), (245, 245, 248)]


def head(c, X):
    hx, hy = X.hd; u = X.u
    c.part(c.m_ellipse(hx, hy, 9 * u, 9 * u), IRON, bias=0.05)
    c.part(c.m_poly([(hx - 8 * u, hy - 3 * u), (hx + 10 * u, hy - 3 * u), (hx + 10 * u, hy + 2 * u), (hx - 8 * u, hy + 2 * u)]), DARK, edge=False)
    c.part(c.m_ellipse(hx + 5 * u, hy - 0.5 * u, 3.4 * u, 1.3 * u if X.P['set'] != 'hit' else 0.6), GLOW, edge=False, dither=False)
    c.part(c.m_poly([(hx - 2 * u, hy - 8 * u), (hx + 2 * u, hy - 8 * u), (hx + 1 * u, hy - 15 * u), (hx - 1 * u, hy - 15 * u)]), BRONZE)  # chimenea
    sm = X.D['ph']
    for j in range(2): c.part(c.m_ellipse(hx - 3 * u - j * 3, hy - 18 * u - j * 5 + math.sin(sm + j) * 1.5, 3 - j * 0.6, 2.4), STEAM, edge=False, dither=False)


def torso_fx(c, X):
    sh, hip, u, cx = X.sh, X.hip, X.u, X.cx
    mx, my = (sh[0] + cx) / 2 + 3 * u, (sh[1] + hip) / 2
    c.part(c.m_ellipse(mx, my, 10 * u, 11 * u), DARK, edge=True)
    pulse = 0.85 + 0.15 * math.sin(X.D['ph'])
    c.part(c.m_ellipse(mx, my, 7 * u * pulse, 8 * u * pulse), GLOW, edge=False, dither=False)
    for j in range(3): c.px(mx - 4 * u, my - 4 * u + j * 4 * u, DARK[0], int(8 * u), 1)  # rejilla
    c.part(c.m_ellipse(sh[0] - 8 * u, sh[1] + 1 * u, 7 * u, 6 * u), IRON, bias=0.15)  # hombrera trasera
    for j in range(4): c.px(cx - 12 * u + j * 8 * u, hip + 6 * u, BRONZE[3], 2, 2)  # remaches


def weapon(c, X, hand):
    D = X.D; r = D['reach']; hx, hy = hand; u = X.u
    ang = -1.2 + 2.0 * r + (0.3 if X.P['set'] == 'charge' else 0)
    ex, ey = hx + math.cos(ang) * 22 * u, hy + math.sin(ang) * 22 * u
    if X.P['set'] == 'charge':
        for j in range(4): c.part(c.m_ellipse(X.cx - 22 * u - j * 8, X.gy - 14 * u - j * 2 + math.sin(D['ph'] + j) * 2, 5 + j * 1.5, 4 + j), STEAM, edge=False, dither=False)
    c.part(c.m_line([(hx, hy), (ex, ey)], 2.0 * u), BRONZE, edge=True)
    c.part(c.m_ellipse(ex, ey, 8 * u, 8 * u), IRON)
    for a_ in range(6):
        t = a_ * math.pi / 3 + 0.3
        c.part(c.m_poly([(ex + math.cos(t - .35) * 7, ey + math.sin(t - .35) * 7), (ex + math.cos(t) * 13 * u, ey + math.sin(t) * 13 * u), (ex + math.cos(t + .35) * 7, ey + math.sin(t + .35) * 7)]), IRON, bias=0.1)


CFG = dict(u=1.2, tw=1.55, hunch=0.05, cx=0.38, pant=DARK, pant2=ramp('#2f3440'), boot=BOOT, skin=IRON, arm=IRON, arm2=DARK, torso=IRON,
           pad=IRON, head=head, torso_fx=torso_fx, weapon=weapon, hx=3, hy=8)


def draw(c, P):
    _brute.draw(c, P, CFG)
