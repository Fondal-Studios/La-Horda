"""Verdugo de Vapor (Fortaleza): encapuchado con calderas rojas a la espalda y hacha-sierra; descarga vapor a presión."""
import math
from enemy_paint import ramp
import _brute

SPEC = dict(
    arena='fortaleza', w=150, h=112, refH=92, anchor=0.96, outline='#120a0c',
    frames=[('idle', 4), ('walk', 6), ('atk', 5), ('steam', 4), ('hit', 1), ('death', 4)],
    alias={'walk_down': ['walk'], 'walk_up': ['walk']},
)
CLOAK = ramp('#5a4036'); LEATH = ramp('#3a2a2a'); IRON = ramp('#7d8794'); TANK = ramp('#b02a2a'); BOOT = ramp('#221a1c'); SKIN = ramp('#b99478')
STEAM = [(150, 150, 160), (190, 190, 198), (225, 225, 230), (245, 245, 248)]; EYE = [(120, 20, 10), (240, 70, 30), (255, 170, 70), (255, 240, 200)]


def back(c, X):
    sh, hip, u = X.sh, X.hip, X.u
    for j, dx in enumerate((-15, -8)):
        tx, ty = sh[0] + dx * u, sh[1] + 2 * u
        c.part(c.m_capsule((tx, ty - 8 * u), (tx - 1, ty + 12 * u), 4.6 * u, 4.6 * u), TANK)
        c.part(c.m_ellipse(tx, ty - 9 * u, 3.5 * u, 2 * u), IRON, edge=False)
        c.px(tx - 1, ty + 2 * u, IRON[3], 3, 1)
    c.part(c.m_line([(sh[0] - 12 * u, sh[1] - 8 * u), (sh[0] - 6 * u, sh[1] - 13 * u)], 1.0), IRON, edge=False)
    D = X.D; k = D['steam']
    n = 3 if X.P['set'] == 'steam' else 1
    for j in range(n):
        c.part(c.m_ellipse(sh[0] - 14 * u - j * 4 - k * j * 3, sh[1] - 18 * u - j * 5 - k * 4 + math.sin(D['ph'] + j), 3 + j + k * 2, 2.5 + j + k * 2), STEAM, edge=False, dither=False)


def head(c, X):
    hx, hy = X.hd; u = X.u
    c.part(c.m_ellipse(hx, hy, 8.5 * u, 9 * u), CLOAK, bias=0.05)
    c.part(c.m_poly([(hx - 8 * u, hy - 3 * u), (hx - 3 * u, hy - 14 * u), (hx + 4 * u, hy - 12 * u), (hx + 9 * u, hy - 3 * u)]), CLOAK, bias=0.1)
    c.part(c.m_ellipse(hx + 4 * u, hy + 1 * u, 4.6 * u, 5 * u), ramp('#1a1214'), edge=False, bias=-0.3)  # cara en sombra
    c.part(c.m_ellipse(hx + 5 * u, hy + 0 * u, 1.3, 1.1 if X.P['set'] != 'hit' else 0.5), EYE, edge=False, dither=False)
    c.part(c.m_ellipse(hx + 1 * u, hy + 0 * u, 1.1, 1.0), EYE, edge=False, dither=False)


def torso_fx(c, X):
    sh, hip, u, cx = X.sh, X.hip, X.u, X.cx
    c.part(c.m_poly([(cx - 10 * u, hip - 6 * u), (cx + 11 * u, hip - 6 * u), (cx + 14 * u, hip + 20 * u), (cx - 13 * u, hip + 20 * u)]), CLOAK, bias=-0.05)
    c.part(c.m_line([(cx - 11 * u, hip - 1 * u), (cx + 12 * u, hip - 1 * u)], 1.5 * u), LEATH, edge=False)
    c.px(cx, hip - 2 * u, IRON[3], 3, 3)


def weapon(c, X, hand):
    D = X.D; r = D['reach']; hx, hy = hand; u = X.u
    ang = 0.9 - 2.5 * math.sin(min(1, r * 1.6) * math.pi / 2) if r < 0.6 else -1.6 + 3.2 * (1 - r)
    if X.P['set'] == 'steam': ang = 0.3 - 0.6 * math.sin(D['steam'] * math.pi)
    ex, ey = hx + math.cos(ang) * 26 * u, hy + math.sin(ang) * 26 * u
    c.part(c.m_line([(hx - math.cos(ang) * 8, hy - math.sin(ang) * 8), (ex, ey)], 1.5 * u), LEATH)
    nx, ny = -math.sin(ang), math.cos(ang)
    c.part(c.m_poly([(ex - nx * 3, ey - ny * 3), (ex + nx * 13 * u, ey + ny * 13 * u), (ex + nx * 13 * u + math.cos(ang) * 10, ey + ny * 13 * u + math.sin(ang) * 10), (ex + math.cos(ang) * 10, ey + math.sin(ang) * 10)]), IRON, bias=0.1)
    for j in range(4): c.px(ex + nx * (13 * u + 1) + math.cos(ang) * j * 3, ey + ny * (13 * u + 1) + math.sin(ang) * j * 3, TANK[2], 2, 2)


CFG = dict(u=1.3, tw=1.2, hunch=0.12, cx=0.36, pant=LEATH, pant2=ramp('#2e2224'), boot=BOOT, skin=SKIN, arm=CLOAK, arm2=CLOAK, torso=CLOAK,
           pad=IRON, back=back, head=head, torso_fx=torso_fx, weapon=weapon, hx=4, hy=9)


def draw(c, P):
    _brute.draw(c, P, CFG)
