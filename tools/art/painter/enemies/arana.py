"""Araña Mecánica (Fortaleza): ocho patas de bronce, abdomen-caldera con ojos rojos; dispara pernos y lanza redes de cadena."""
import math
from enemy_paint import ramp

SPEC = dict(
    arena='fortaleza', w=88, h=62, refH=50, anchor=0.94, outline='#150a0c',
    frames=[('idle', 4), ('walk', 6), ('atk', 4), ('net', 3), ('hit', 1), ('death', 4)],
    alias={'walk_down': ['walk'], 'walk_up': ['walk']},
)
BRONZE = ramp('#b9803a'); DARK = ramp('#5a3a2a'); IRON = ramp('#7d8794'); RED = [(70, 8, 10), (170, 25, 20), (255, 90, 40), (255, 220, 150)]
GY = 58


def draw(c, P):
    s, i, n, q, u = P['set'], P['i'], P['n'], P['q'], P['u']
    ph = u * 2 * math.pi
    bob = 0.0; rear = 0.0; sink = 0.0; gait = 0.0; fire = 0.0
    if s == 'idle': bob = math.sin(ph) * 1.0
    elif s == 'walk': gait = ph; bob = -abs(math.sin(ph * 2)) * 1.2
    elif s == 'atk': a = math.sin(min(1, q * 1.1) * math.pi); rear = a; fire = a
    elif s == 'net': rear = 0.6 + 0.4 * math.sin(q * math.pi); fire = 1.0
    elif s == 'hit': c.flash = 0.55; bob = 2
    elif s == 'death': sink = q; c.fade = 1.0 - 0.9 * max(0, q - 0.4) / 0.6
    cx = 42; hipy = GY - 20 + bob + sink * 14
    for far in (1, 0):
        for k in range(4):
            sx = cx - 12 + k * 8 + (3 if far else 0)
            tgt = cx + (-30, -19, 16, 28)[k] + (2 if far else 0)
            sw = 0.0; lift = 0.0
            if s == 'walk':
                t = gait + k * math.pi * 0.5 + far * math.pi
                sw = math.sin(t) * 5; lift = max(0, math.cos(t)) * 6
            if s == 'death': tgt = sx + (tgt - sx) * (1 - q * 0.6)
            fx_ = tgt + sw; fy = GY - 1 - lift - sink * 2
            hx, hy = sx, hipy + 3
            d_ = -1 if k < 2 else 1; kx = hx + (fx_ - hx) * 0.45 + d_ * 2; ky = hy - 13 - (1 if far else 0) + lift * 0.3
            m = DARK if far else BRONZE
            c.part(c.m_capsule((hx, hy), (kx, ky), 2.8, 2.4), m, bias=-0.05)
            c.part(c.m_capsule((kx, ky), (fx_, fy), 2.4, 1.3), m, bias=-0.05)
            c.part(c.m_ellipse(kx, ky, 2.8, 2.8), IRON, edge=False)
    ax, ay = cx - 12, hipy - 6 - rear * 5
    c.part(c.m_ellipse(ax, ay, 15, 12 - rear * 1.5, -0.1 * rear), BRONZE)
    c.part(c.m_ellipse(ax - 2, ay + 4, 13, 6), DARK, bias=-0.12, edge=False)
    for j in range(4):
        c.px(ax - 10 + j * 6, ay - 5 + abs(j - 1.5) * 1.5, IRON[3])
    c.part(c.m_poly([(ax - 14, ay - 8), (ax - 20, ay - 12), (ax - 13, ay - 4)]), IRON)
    c.part(c.m_ellipse(ax - 7, ay - 1, 3.5, 3.5), RED, edge=False, dither=False)
    hx, hy = cx + 8, hipy - 2 + rear * 1
    c.part(c.m_ellipse(hx, hy, 12, 9), BRONZE, bias=0.05)
    c.part(c.m_ellipse(hx + 2, hy + 4, 9, 4), DARK, bias=-0.1, edge=False)
    for (ex, ey, r) in ((hx + 6, hy - 2, 2.4), (hx + 1, hy - 4, 1.8), (hx + 9, hy + 1, 1.6)):
        c.part(c.m_ellipse(ex, ey, r, r if s != 'hit' else 0.8), RED, edge=False, dither=False)
    c.part(c.m_poly([(hx + 9, hy + 3), (hx + 15, hy + 7), (hx + 12, hy + 8), (hx + 8, hy + 6)]), IRON)
    if fire and s == 'atk':
        c.part(c.m_ellipse(hx + 15 + 3 * fire, hy + 6, 3.5, 3.0), RED, edge=False, dither=False)
        c.part(c.m_line([(hx + 17, hy + 6), (hx + 26 + fire * 6, hy + 6)], 1.2), [(255, 150, 60)] * 4, edge=False, dither=False)
    if s == 'net':
        for j in range(3):
            c.part(c.m_ellipse(hx + 16 + j * 5 * q + j * 3, hy + 6 - j, 2.0, 2.0), IRON, edge=False)
