"""Prisionero Ensamblado (Fortaleza): cuerpo cosido de piezas ajenas, encorvado, con grilletes, cadenas y zarpas largas; se desmiembra."""
import math
from enemy_paint import ramp
import _brute

SPEC = dict(
    arena='fortaleza', w=120, h=80, refH=64, anchor=0.95, outline='#150a0c',
    frames=[('idle', 4), ('walk', 6), ('atk', 5), ('rip', 4), ('hit', 1), ('death', 4)],
    alias={'walk_down': ['walk'], 'walk_up': ['walk']},
)
SKIN = ramp('#b58a80'); SKIN2 = ramp('#8e9a86'); RAG = ramp('#5a3a3a'); IRON = ramp('#7d8794'); BOOT = ramp('#2a1c1e'); BONE = ramp('#e0d2b4')
EYE = [(90, 10, 10), (220, 40, 30), (255, 150, 60), (255, 240, 200)]; RED = ramp('#a02830')


def head(c, X):
    hx, hy = X.hd; u = X.u
    c.part(c.m_ellipse(hx, hy, 7.5 * u, 7.5 * u), SKIN, bias=0.05)
    c.part(c.m_poly([(hx, hy - 7), (hx + 8, hy - 3), (hx + 7, hy + 6), (hx, hy + 5)]), SKIN2)
    c.part(c.m_line([(hx, hy - 7), (hx, hy + 6)], 0.6), RAG, edge=False, dither=False)
    for j in range(4): c.px(hx - 1, hy - 6 + j * 3, BONE[3], 3, 1)
    for k in range(3): c.part(c.m_poly([(hx - 5 + k * 5, hy - 6), (hx - 3 + k * 5, hy - 6), (hx - 4 + k * 5, hy - 13)]), IRON)
    c.part(c.m_ellipse(hx + 4, hy - 0.5, 1.5, 1.3 if X.P['set'] != 'hit' else 0.5), EYE, edge=False, dither=False)
    c.part(c.m_ellipse(hx - 2.5, hy - 1.5, 1.1, 1.0), EYE, edge=False, dither=False)
    c.part(c.m_poly([(hx + 1, hy + 3), (hx + 7, hy + 3), (hx + 6, hy + 6), (hx + 2, hy + 6)]), ramp('#3a1218'), edge=False)
    for j in range(3): c.px(hx + 2 + j * 2, hy + 3, BONE[3])


def torso_fx(c, X):
    sh, hip, u, cx = X.sh, X.hip, X.u, X.cx
    c.part(c.m_poly([(cx - 10, hip - 2), (cx + 2, hip - 8), (cx + 3, hip + 8), (cx - 9, hip + 10)]), SKIN2)
    c.part(c.m_poly([(cx + 2, hip - 14), (cx + 12, hip - 10), (cx + 11, hip + 4), (cx + 3, hip + 2)]), RAG)
    c.part(c.m_line([(cx - 9, hip - 14), (cx + 9, hip + 2)], 1.0), RED, edge=False, dither=False)
    for j in range(4): c.px(cx - 6 + j * 4, hip - 11 + j * 3, BONE[3], 1, 3)
    for j in range(5): c.part(c.m_ellipse(cx - 4 + j * 3.2, hip + 12 + math.sin(X.D['ph'] + j) * 1.2 + j * 1.6, 1.9, 1.5), IRON, edge=False)


def weapon(c, X, hand):
    D = X.D; r = D['reach']; hx, hy = hand; u = X.u
    for k in range(3):
        a = -0.2 + k * 0.28 + r * 0.3
        c.part(c.m_poly([(hx, hy - 1), (hx + math.cos(a) * 14, hy + math.sin(a) * 14 - 1), (hx, hy + 2)]), BONE, bias=0.1)
    if X.P['set'] == 'rip':
        bx = hx - 4 - 8 * r; by = hy + 5 - 6 * r
        c.part(c.m_capsule((X.sh[0] - 4, X.sh[1] + 3), (bx, by), 4.2, 3.4), SKIN2)
        c.part(c.m_ellipse(bx, by, 4, 4), SKIN)
        for k in range(3): c.part(c.m_poly([(bx, by), (bx + 3 + k * 3, by - 8 + k * 6), (bx + 1, by + 2)]), BONE, bias=0.1)
        for j in range(5): c.part(c.m_ellipse(hx + 6 + j * 5 * r, hy - 6 - j * 1.5 * r + math.sin(j) * 1.5, 1.8, 1.5), IRON, edge=False)


CFG = dict(u=0.95, tw=1.15, hunch=0.4, cx=0.38, pant=RAG, pant2=ramp('#4a2e30'), boot=BOOT, skin=SKIN, arm=SKIN2, arm2=SKIN, torso=SKIN,
           pad=IRON, head=head, torso_fx=torso_fx, weapon=weapon, hx=6, hy=9)


def draw(c, P):
    _brute.draw(c, P, CFG)
