"""Sectario Fanático (Ciudad Maldita): encapuchado con un fardo de pólvora al pecho. Camina, apuñala, prepara y estalla."""
import math
from enemy_paint import ramp

SPEC = dict(
    arena='ciudad', w=72, h=84, refH=66, anchor=0.9286, outline='#150a12',
    frames=[('idle', 4), ('walk', 6), ('atk', 5), ('hit', 1), ('death', 4), ('prep', 6), ('boom', 3)],
    alias={'atk2': ['atk'], 'walk_down': ['walk'], 'walk_up': ['walk'], 'hit_down': ['hit'], 'hit_up': ['hit'],
           'atk_down': ['atk'], 'atk_up': ['atk']},
)
ROBE = ramp('#8a2438'); CLOTH = ramp('#4a2a3a'); SKIN = ramp('#c8a688'); WOOD = ramp('#7a5632'); IRON = ramp('#7d8794')
EMBER = (255, 190, 70); HOT = (255, 120, 40); FACE = (18, 8, 16)

GROUND = 78


def draw(c, P):
    s, i, n, q, u = P['set'], P['i'], P['n'], P['q'], P['u']
    ph = u * 2 * math.pi
    bob = 0.0; lean = 0.0; legs = 0.0; armR = 0.0; stab = 0.0; shake = 0.0; glow = 0.0; sink = 0.0; boom = -1
    if s == 'idle': bob = math.sin(ph) * 1.0; armR = math.sin(ph) * 0.1
    elif s == 'walk': bob = -abs(math.sin(ph)) * 2.0; legs = math.sin(ph); lean = 0.12; armR = -0.15 + math.sin(ph) * 0.2
    elif s == 'atk': stab = math.sin(min(1, q * 1.15) * math.pi) if q < 1 else 0; lean = 0.25 * stab; legs = 0.6 * stab; armR = -0.5 + 1.3 * stab
    elif s == 'hit': lean = -0.28; bob = 1; c.flash = 0.55; armR = 0.6
    elif s == 'death': sink = q; lean = -0.3 * q; c.fade = 1.0 - 0.9 * max(0, q - 0.4) / 0.6
    elif s == 'prep': shake = 1.0 if i % 2 else -1.0; glow = 0.3 + 0.7 * q; armR = 0.9; lean = 0.05; bob = 0
    elif s == 'boom': boom = i
    if boom >= 0: return draw_boom(c, boom)
    cx = 34 + shake * (0.6 + q * 1.2 if s == 'prep' else 0)
    gy = GROUND + sink * 18
    hipY = gy - 26 + bob + sink * -2
    # --- sombra no (el juego la dibuja)
    # --- piernas (capas: pierna trasera, delantera)
    for k, side in ((0, -1), (1, 1)):
        sw = legs * side
        foot_x = cx + sw * 11 + (3 if s == 'atk' and k else 0)
        lift = max(0.0, -sw) * 5 if s == 'walk' else 0
        c.part(c.m_capsule((cx + side * 2, hipY), (foot_x, gy - 2 - lift), 3.6, 3.0), CLOTH if k == 0 else ROBE)
        c.part(c.m_ellipse(foot_x + 2, gy - 1 - lift, 4.5, 2.4), IRON, bias=-0.15)
    # --- túnica (campana con dobladillo ondulante)
    sway = (math.sin(ph) * 3.0 if s == 'walk' else math.sin(ph) * 1.0) if s in ('walk', 'idle') else 0
    top = hipY - 28 + sink * 6
    tx = cx + lean * 20
    robe = [(tx - 7, top + 8), (tx + 8, top + 8), (cx + 13 + sway, hipY + 16 - sink * 4), (cx + 3, hipY + 19 - sink * 4), (cx - 5, hipY + 17 - sink * 4), (cx - 13 + sway, hipY + 15 - sink * 4)]
    c.part(c.m_poly(robe), ROBE)
    c.part(c.m_poly([(cx - 13 + sway, hipY + 10), (cx + 13 + sway, hipY + 10), (cx + 13 + sway, hipY + 16), (cx - 13 + sway, hipY + 15)]), CLOTH, bias=-0.1)
    # --- fardo de pólvora al pecho (barril + cuerda + mecha)
    bx, by = tx + 9 + lean * 4, top + 22
    c.part(c.m_ellipse(bx, by, 7.5, 6.5), WOOD)
    for yy in (-3, 2):
        c.part(c.m_poly([(bx - 7, by + yy), (bx + 7, by + yy), (bx + 7, by + yy + 1.6), (bx - 7, by + yy + 1.6)]), IRON, edge=False, bias=-0.2)
    c.part(c.m_poly([(bx - 6, by - 6), (bx - 3, by - 9), (bx + 3, by - 9), (bx + 6, by - 6)]), ROBE, bias=-0.1)
    fx, fy = bx + 4, by - 11
    c.part(c.m_line([(bx + 2, by - 7), (bx + 3.5, by - 10), (fx, fy)], 0.6), [(60, 40, 30)] * 4, edge=False, dither=False)
    spark = EMBER if (i + (1 if glow else 0)) % 2 == 0 else HOT
    c.part(c.m_ellipse(fx, fy - 1, 1.6 + glow * 2.2, 1.6 + glow * 2.2), [HOT, HOT, spark, (255, 245, 190)], edge=False, dither=False)
    if glow > 0:
        c.part(c.m_ellipse(bx, by, 8.6, 7.6), [(120, 30, 20), (230, 80, 30), (255, 140, 50), (255, 220, 120)], edge=False, bias=0.2 + glow * 0.5, dither=True) if glow > 0.7 else None
    # --- capucha
    hx, hy = tx + 3 + lean * 6, top + 3
    hood = [(hx - 8, hy + 9), (hx - 6, hy - 3), (hx + 1, hy - 12), (hx + 9, hy - 4), (hx + 10, hy + 9), (hx + 5, hy + 12), (hx - 4, hy + 12)]
    c.part(c.m_poly(hood), ROBE, bias=0.05)
    c.part(c.m_ellipse(hx + 4.5, hy + 3, 5.2, 5.6), [FACE] * 4, edge=False, dither=False)
    ey = hy + 2
    for ex in (hx + 4, hx + 8):
        c.part(c.m_ellipse(ex, ey, 1.2, 1.5 if s != 'hit' else 0.7), [HOT, EMBER, EMBER, (255, 240, 180)], edge=False, dither=False)
    # --- brazo delantero + daga
    sx, sy = tx + 2, top + 14
    ang = -0.2 + armR * 1.2
    ex_, ey_ = sx + 10 * math.cos(ang) + 2, sy + 10 * math.sin(ang) + 6 - (4 if s in ('prep',) else 0)
    if s == 'prep': ex_, ey_ = bx - 1, by - 5
    c.part(c.m_capsule((sx, sy), (ex_, ey_), 3.2, 2.6), ROBE, bias=0.1)
    c.part(c.m_ellipse(ex_, ey_, 2.7, 2.7), SKIN)
    if s == 'atk':
        bl = 6 + 9 * stab
        c.part(c.m_poly([(ex_, ey_ - 1), (ex_ + bl, ey_ - 3 + stab * 2), (ex_ + bl + 3, ey_ - 2 + stab * 2), (ex_ + 1, ey_ + 2)]), IRON, bias=0.1)
        if stab > 0.5: c.px(ex_ + bl + 2, ey_ - 2 + stab * 2, (255, 255, 255))


def draw_boom(c, k):
    cx, cy = 36, 54
    R = [12, 22, 27][k]
    cols = [[(150, 40, 20), (240, 90, 30), (255, 170, 60), (255, 240, 190)],
            [(110, 30, 24), (210, 70, 28), (255, 150, 50), (255, 225, 140)],
            [(60, 28, 34), (120, 50, 40), (190, 90, 50), (240, 160, 80)]][k]
    c.part(c.m_ellipse(cx, cy, R, R * 0.85), cols, bias=0.1 + (0.2 if k == 0 else 0))
    if k == 0:
        c.part(c.m_ellipse(cx, cy, 8, 7), [(255, 240, 190)] * 4, edge=False, dither=False)
    for j in range(7):
        a = j * 0.9 + k * 0.4; r = R * (1.0 + 0.1 * k)
        c.part(c.m_ellipse(cx + math.cos(a) * r, cy + math.sin(a) * r * 0.8, 3.2 - k * 0.6, 3.2 - k * 0.6), cols, edge=False)
