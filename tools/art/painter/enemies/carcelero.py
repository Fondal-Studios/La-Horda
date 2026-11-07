"""Carcelero Deforme (Fortaleza): verdugo calvo y cargado de hierro con delantal rojo; mangual de cadena con bola de púas."""
import math
from enemy_paint import ramp
import _brute

SPEC = dict(
    arena='fortaleza', w=132, h=80, refH=70, anchor=0.95, outline='#150a0c',
    frames=[('idle', 4), ('walk', 6), ('atk', 5), ('chain', 4), ('hit', 1), ('death', 4)],
    alias={'walk_down': ['walk'], 'walk_up': ['walk']},
)
SKIN = ramp('#c9917c'); LEATH = ramp('#4a3430'); IRON = ramp('#7d8794'); RED = ramp('#9a2a30'); BOOT = ramp('#2a1c1e'); EYE = [(90, 10, 10), (220, 40, 30), (255, 150, 60), (255, 240, 200)]


def head(c, X):
    hx, hy = X.hd; u = X.u
    c.part(c.m_ellipse(hx, hy, 8 * u, 8.5 * u), SKIN, bias=0.05)
    c.part(c.m_poly([(hx - 8, hy - 1), (hx + 8, hy - 1), (hx + 7, hy - 9), (hx - 7, hy - 9)]), IRON)
    c.part(c.m_ellipse(hx + 4, hy + 3, 5, 4), SKIN, bias=-0.1, edge=False)
    c.part(c.m_poly([(hx - 8, hy + 5), (hx + 8, hy + 5), (hx + 6, hy + 10), (hx - 6, hy + 10)]), IRON)
    for j in range(3): c.px(hx - 5 + j * 5, hy + 7, IRON[3])
    c.part(c.m_ellipse(hx + 4, hy + 0.5, 1.4, 1.2 if X.P['set'] != 'hit' else 0.5), EYE, edge=False, dither=False)
    c.part(c.m_ellipse(hx - 1, hy + 0.5, 1.2, 1.1), EYE, edge=False, dither=False)


def torso_fx(c, X):
    sh, hip, u, cx = X.sh, X.hip, X.u, X.cx
    c.part(c.m_poly([(cx - 8, hip - 4), (cx + 9, hip - 4), (cx + 10, hip + 17), (cx - 9, hip + 17)]), RED)
    c.part(c.m_line([(sh[0] - 8, sh[1] - 4), (cx + 6, hip + 2)], 1.2), IRON, edge=False)
    c.part(c.m_line([(sh[0] + 8, sh[1] - 4), (cx - 6, hip + 2)], 1.2), LEATH, edge=False)
    c.px(cx + 1, hip + 2, IRON[3], 3, 3)


def weapon(c, X, hand):
    D = X.D; r = D['reach']; hx, hy = hand; u = X.u
    c.part(c.m_line([(hx - 3, hy + 4), (hx + 3, hy - 5)], 1.4), LEATH, edge=False, dither=False)
    if X.P['set'] == 'chain':
        bx = hx + 12 + 38 * r; by = hy - 4 + 6 * math.sin(r * math.pi)
    else:
        bx = hx + 10 + r * 16 + D['arm'] * 3; by = hy + 8 - r * 14 + (1 - r) * 6
    n = 8 if X.P['set'] == 'chain' else 4
    for j in range(n):
        t = j / n
        c.part(c.m_ellipse(hx + 3 + (bx - hx - 3) * t, hy - 5 + (by - hy + 5) * t - math.sin(t * math.pi) * 4, 2.1, 1.7), IRON, edge=False)
    c.part(c.m_ellipse(bx, by, 7, 7), IRON, bias=-0.05)
    for a_ in range(8):
        t = a_ * math.pi / 4
        c.part(c.m_poly([(bx + math.cos(t - .3) * 6, by + math.sin(t - .3) * 6), (bx + math.cos(t) * 11, by + math.sin(t) * 11), (bx + math.cos(t + .3) * 6, by + math.sin(t + .3) * 6)]), IRON, bias=0.1)


CFG = dict(u=1.0, tw=1.3, hunch=0.12, cx=0.30, pant=LEATH, pant2=ramp('#35241f'), boot=BOOT, skin=SKIN, arm=SKIN, arm2=SKIN, torso=SKIN,
           pad=IRON, head=head, torso_fx=torso_fx, weapon=weapon)


def draw(c, P):
    _brute.draw(c, P, CFG)
