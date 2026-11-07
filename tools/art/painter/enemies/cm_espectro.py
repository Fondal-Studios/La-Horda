"""Espectro Ciudadano (Ciudad Maldita): alma errante azul de cola deshilachada; araña, posee y drena."""
import math
from enemy_paint import ramp

SPEC = dict(
    arena='ciudad', w=84, h=76, refH=58, anchor=0.9375, outline='#0c1530',
    frames=[('idle', 4), ('walk', 4), ('atk', 4), ('hit', 1), ('death', 4), ('possess', 6), ('drain', 6)],
    alias={'float': ['walk'], 'walk_down': ['walk'], 'walk_up': ['walk'], 'hit_down': ['hit'], 'hit_up': ['hit'], 'atk_down': ['atk'], 'atk_up': ['atk']},
)
GHOST = ramp('#4f86d6', warm=False); PALE = ramp('#a9d4f5', warm=False); DEEP = ramp('#2a3f8a', warm=False)
EYE = [(8, 14, 40)] * 4; GLOW = [(60, 140, 230), (120, 200, 255), (190, 235, 255), (255, 255, 255)]


def draw(c, P):
    s, i, n, q, u = P['set'], P['i'], P['n'], P['q'], P['u']
    ph = u * 2 * math.pi
    bob = math.sin(ph) * 2.5 if s in ('idle', 'walk', 'drain') else 0.0
    reach = 0.0; lean = 0.0; sink = 0.0; mouth = 0.4; stretch = 0.0; wisp = 0.0
    if s == 'atk': reach = math.sin(q * math.pi); lean = 0.2 * reach; mouth = 0.9 * reach
    elif s == 'hit': lean = -0.3; c.flash = 0.6
    elif s == 'death': sink = q; c.fade = 1.0 - 0.95 * max(0, q - 0.25) / 0.75; mouth = 1.0
    elif s == 'possess': stretch = math.sin(min(1, q * 1.1) * math.pi); lean = 0.35 * stretch; reach = stretch * 0.5
    elif s == 'drain': reach = 0.8; wisp = 1.0; lean = 0.1; mouth = 0.7
    cx = 38 + lean * 10 + stretch * 6; hy = 26 + bob + sink * 22
    # cola deshilachada (flota)
    for k in range(4):
        wob = math.sin(ph + k * 1.3) * (3 + stretch * 2)
        base = cx - 8 + k * 5
        c.part(c.m_poly([(base - 3, hy + 18), (base + 4, hy + 18), (base + 2 + wob - stretch * 6, hy + 46 - k % 2 * 6 + sink * 4), (base - 2 + wob - stretch * 8, hy + 44 + sink * 4)]), DEEP, bias=-0.1)
    # cuerpo / manto
    c.part(c.m_poly([(cx - 9, hy + 6), (cx + 9, hy + 6), (cx + 12, hy + 28), (cx + 4, hy + 34 - sink * 4), (cx - 4, hy + 30), (cx - 12, hy + 33 - sink * 4), (cx - 13, hy + 24 + stretch * 4)]), GHOST)
    c.part(c.m_ellipse(cx - 1, hy + 14, 7, 9), PALE, bias=-0.1, edge=False)  # pecho luminoso
    # cabeza (cráneo) con capucha
    hx = cx + 2 + lean * 3
    c.part(c.m_ellipse(hx, hy, 9, 10), GHOST, bias=0.05)
    c.part(c.m_poly([(hx - 9, hy + 4), (hx - 8, hy - 8), (hx, hy - 13), (hx + 9, hy - 8), (hx + 10, hy + 6), (hx + 5, hy - 2), (hx - 4, hy - 2)]), DEEP, bias=0.1)
    c.part(c.m_ellipse(hx + 3, hy + 1.5, 6, 6.5), PALE, bias=0.05)
    for ex in (hx + 1, hx + 6):
        c.part(c.m_ellipse(ex, hy, 1.9, 2.4 if s != 'hit' else 1.0), EYE, edge=False, dither=False)
        c.px(ex, hy - 0.5, GLOW[2])
    c.part(c.m_ellipse(hx + 4, hy + 6, 2.0, 0.8 + mouth * 2.0), EYE, edge=False, dither=False)
    # brazos con garras
    sx, sy = cx + 2, hy + 12
    for sd, bias in ((-1, -0.2), (1, 0.05)):
        hnd = (sx + 8 + sd * 2 + reach * (18 if sd > 0 else 8), sy + 8 - reach * 6 + sd * 2 + (math.sin(ph + sd) * 2 if s in ('idle', 'walk') else 0))
        if s == 'drain': hnd = (sx + 14 + sd * 3, sy - 4 + sd * 4 + math.sin(ph + sd) * 2)
        c.part(c.m_capsule((sx + sd * 2, sy), hnd, 3.4, 2.2), GHOST, bias=bias)
        c.part(c.m_ellipse(hnd[0], hnd[1], 2.8, 2.8), PALE, bias=bias)
        for dy in (-2, 0, 2): c.part(c.m_line([(hnd[0] + 1, hnd[1] + dy), (hnd[0] + 5, hnd[1] + dy * 1.5)], 0.6), PALE, edge=False, dither=False)
    if wisp:
        for k in range(5):
            a = ph + k * 1.26; r = 10 + 6 * ((k + q * 5) % 5) / 4
            c.part(c.m_ellipse(cx + 30 - r * 1.2, hy + 10 + math.sin(a) * 9, 2.2, 2.2), GLOW, edge=False, dither=False)
