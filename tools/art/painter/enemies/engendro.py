"""Engendro Encadenado (Fortaleza): masa de carne que repta con grilletes y cadenas colgando; muerde y se arrastra."""
import math
from enemy_paint import ramp

SPEC = dict(
    arena='fortaleza', w=120, h=80, refH=64, anchor=0.9429, outline='#150a0c',
    frames=[('idle', 4), ('walk', 6), ('atk', 5), ('hit', 1), ('death', 4)],
    alias={'walk_down': ['walk'], 'walk_up': ['walk']},
)
FLESH = ramp('#b3584a'); DARK = ramp('#6a2a34'); IRON = ramp('#8b93a0'); BONE = ramp('#e0d2b4'); RUST = ramp('#8a5a30'); EYE = [(90, 10, 10), (220, 40, 30), (255, 150, 60), (255, 240, 200)]
GY = 74


def draw(c, P):
    s, i, n, q, u = P['set'], P['i'], P['n'], P['q'], P['u']
    ph = u * 2 * math.pi
    sq = 0.0; bite = 0.0; lunge = 0.0; sink = 0.0; drag = 0.0
    if s == 'idle': sq = math.sin(ph) * 0.06
    elif s == 'walk': sq = math.sin(ph * 2) * 0.05; drag = math.sin(ph)
    elif s == 'atk': a = math.sin(min(1, q * 1.1) * math.pi); bite = a; lunge = a * 14; sq = -0.1 * a
    elif s == 'hit': c.flash = 0.55; sq = 0.12; lunge = -4
    elif s == 'death': sink = q; c.fade = 1.0 - 0.9 * max(0, q - 0.35) / 0.65
    cx = 56 + lunge * 0.5; gy = GY
    by = gy - 22 + sink * 14 + sq * 20
    # patas traseras (cuatro extremidades: crawl)
    for side, k in ((-1, 0), (1, 1), (-1, 2), (1, 3)):
        sw = (drag if k % 2 == 0 else -drag) if s == 'walk' else 0
        px = cx + (-22 if k < 2 else 16) + side * 3 + sw * 8 + (lunge * 0.6 if k >= 2 else 0)
        lift = max(0, -sw) * 5 if s == 'walk' else 0
        top = (px - (3 if k < 2 else -2), by + 2)
        mat = DARK if k % 2 == 0 else FLESH
        c.part(c.m_capsule(top, (px + 2, gy - 3 - lift), 5.0, 3.6), mat, bias=-0.1 if k % 2 == 0 else 0.0)
        c.part(c.m_ellipse(px + 4, gy - 2 - lift, 6, 3), DARK if k % 2 == 0 else FLESH)
        for dx in (1, 4, 7): c.px(px + dx, gy - 3 - lift, BONE[2], 1, 2)
        # grillete + cadena
        c.part(c.m_ellipse(px + 2, gy - 12 - lift * 0.5, 4.6, 2.6), IRON)
        for j in range(3):
            c.part(c.m_ellipse(px + 4 + j * 2.5, gy - 8 + j * 2.6 + math.sin(ph + j + k) * 0.8 - lift * 0.3, 1.8, 1.4), IRON, edge=False)
    # masa del cuerpo
    c.part(c.m_ellipse(cx - 2, by, 26, 17 + sq * 14), FLESH)
    c.part(c.m_ellipse(cx - 12, by - 5, 16, 11 + sq * 8), FLESH, bias=0.12, edge=False)
    c.part(c.m_ellipse(cx + 6, by + 6, 20, 9), DARK, bias=-0.1, edge=False)
    # costillas/huesos expuestos y espinas del lomo
    for j in range(5):
        x = cx - 20 + j * 8
        c.part(c.m_poly([(x - 2, by - 14 - sq * 8 + abs(j - 2) * 2.5), (x + 2, by - 14 - sq * 8 + abs(j - 2) * 2.5), (x + 0.5, by - 24 - sq * 8 + abs(j - 2) * 3.5)]), BONE)
    c.part(c.m_line([(cx - 14, by - 2), (cx + 2, by + 3), (cx - 10, by + 8)], 0.9), RUST, edge=False, dither=False)
    # cadena colgando del lomo
    for j in range(7):
        c.part(c.m_ellipse(cx - 24 - j * 2.4 + drag * -2, by - 6 + j * 3.2 + math.sin(ph + j * .6) * 1.2, 2.0, 1.6), IRON, edge=False)
    # cabeza con mandíbula
    hx = cx + 25 + lunge; hy = by - 3 + sink * 6
    c.part(c.m_ellipse(hx, hy, 12, 10), FLESH, bias=0.05)
    c.part(c.m_poly([(hx + 4, hy - 1), (hx + 17 + bite * 2, hy + 1), (hx + 16 + bite * 2, hy + 4), (hx + 3, hy + 3)]), FLESH, bias=0.08)
    jaw = bite * 8
    c.part(c.m_poly([(hx + 2, hy + 4), (hx + 16 + bite * 2, hy + 4 + jaw * 0.4), (hx + 14, hy + 9 + jaw), (hx - 2, hy + 8 + jaw * 0.6)]), DARK, bias=-0.05)
    for j in range(4):
        tx = hx + 5 + j * 3.2
        c.part(c.m_poly([(tx, hy + 3.5), (tx + 1.6, hy + 3.5), (tx + 0.8, hy + 7 + bite * 3)]), BONE, edge=False)
    c.part(c.m_ellipse(hx + 6, hy - 4, 2.6, 2.6 if s != 'hit' else 1.0), EYE, edge=False, dither=False)
    c.part(c.m_ellipse(hx - 3, hy - 6, 1.8, 1.8), EYE, edge=False, dither=False)
    # collar de hierro con cadena al suelo
    c.part(c.m_ellipse(hx - 8, hy + 3, 4.5, 8), IRON)
    for j in range(5):
        c.part(c.m_ellipse(hx - 12 - j * 2.2, hy + 10 + j * 3.4, 1.8, 1.5), IRON, edge=False)
