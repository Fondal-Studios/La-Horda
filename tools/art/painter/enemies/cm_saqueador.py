"""Saqueador Maldito (Ciudad Maldita): ladrón encorvado con bufanda, saco al hombro y cuchillo; ojos violeta de maldición."""
import math
from enemy_paint import ramp
from _biped import pose, limb

SPEC = dict(
    arena='ciudad', w=80, h=80, refH=62, anchor=0.9625, outline='#120c10',
    frames=[('idle', 4), ('walk', 6), ('atk', 5), ('hit', 1), ('death', 4)],
    alias={'atk2': ['atk'], 'slash': ['atk'], 'rush': ['walk'], 'hurt': ['hit'], 'walk_down': ['walk'], 'walk_up': ['walk'],
           'hit_down': ['hit'], 'hit_up': ['hit'], 'atk_down': ['atk'], 'atk_up': ['atk']},
)
COAT = ramp('#6a5742'); PANT = ramp('#4a4258'); SCARF = ramp('#7a3a8a'); SKIN = ramp('#a3ad8e'); SACK = ramp('#8c6a40'); IRON = ramp('#8e98a6'); BOOT = ramp('#2c2428')
EYE = [(120, 40, 200), (190, 110, 255), (225, 170, 255), (250, 230, 255)]
GY = 76


def draw(c, P):
    D = pose(P, hunch=0.28)
    c.flash = D['flash']; c.fade = D['fade']
    cx = 36 + D['lean'] * 6; gy = GY + D['sink'] * 16; hipY = gy - 25 + D['bob'] + D['sink'] * 4
    sh = (cx + D['lean'] * 18, hipY - 20 + D['sink'] * 6)   # hombros
    hd = (sh[0] + 7 + D['lean'] * 6, sh[1] - 7)
    # pierna trasera
    for k, side in ((0, -1), (1, 1)):
        sw = D['legs'] * side
        fx = cx + sw * 13 + side * 2; lift = max(0, -sw) * 4 if P['set'] == 'walk' else 0
        limb(c, (cx + side * 2, hipY), (fx, gy - 3 - lift), 5.0, 3.8, PANT if k == 0 else COAT, bend=3 * side + 1)
        c.part(c.m_poly([(fx - 4, gy - 4 - lift), (fx + 7, gy - 4 - lift), (fx + 7, gy - lift), (fx - 4, gy - lift)]), BOOT)
    # saco al hombro (atrás)
    sx, sy = sh[0] - 9, sh[1] + 4 + D['bob'] * 0.3
    c.part(c.m_ellipse(sx, sy, 9.5, 11), SACK)
    c.part(c.m_poly([(sx - 3, sy - 10), (sx + 3, sy - 10), (sx + 1, sy - 14), (sx - 1, sy - 14)]), SACK, bias=-0.1)
    c.part(c.m_line([(sx - 5, sy - 7), (sx + 5, sy - 7)], 0.9), COAT, edge=False, bias=-0.2)
    # torso encorvado
    c.part(c.m_capsule((cx - 1, hipY), sh, 7.5, 7.0), COAT)
    c.part(c.m_capsule((cx - 1, hipY - 1), (cx, hipY + 4), 6.2, 6.0), PANT, bias=-0.1)
    # brazo trasero
    sw = D['arm']
    hand0 = (sh[0] - 2 - sw * 5, sh[1] + 14 + sw * 2)
    limb(c, (sh[0] - 3, sh[1] + 2), hand0, 3.2, 2.6, COAT, bend=-2, hand=(SKIN, 2.5), bias=-0.15)
    # cabeza con capucha + bufanda
    c.part(c.m_ellipse(hd[0], hd[1], 7.2, 7.8), COAT, bias=0.05)
    c.part(c.m_poly([(hd[0] - 6, hd[1] - 4), (hd[0] - 3, hd[1] - 12), (hd[0] + 3, hd[1] - 10), (hd[0] + 7, hd[1] - 3)]), COAT, bias=0.1)
    c.part(c.m_ellipse(hd[0] + 3.5, hd[1] + 0.5, 4.4, 4.2), SKIN, bias=-0.05)
    c.part(c.m_poly([(hd[0] - 4, hd[1] + 4), (hd[0] + 6, hd[1] + 4.5), (hd[0] + 6, hd[1] + 7.5), (hd[0] + 1, hd[1] + 9), (hd[0] - 5, hd[1] + 8)]), SCARF)
    # cola de bufanda ondulante
    w = math.sin(D['ph'] * 2) * 2
    c.part(c.m_poly([(hd[0] - 5, hd[1] + 6), (hd[0] - 14, hd[1] + 9 + w), (hd[0] - 16, hd[1] + 13 + w), (hd[0] - 7, hd[1] + 11)]), SCARF, bias=0.0)
    ey = hd[1] - 0.5
    for ex in (hd[0] + 3, hd[0] + 7):
        c.part(c.m_ellipse(ex, ey, 1.2, 1.4 if P['set'] != 'hit' else 0.6), EYE, edge=False, dither=False)
    c.px(hd[0] + 5, hd[1] + 3, (60, 30, 40), 2, 1)
    # brazo delantero con cuchillo
    a = D['arm']; r = D['reach']
    hand = (sh[0] + 9 + r * 14, sh[1] + 10 - r * 6 + (1 - r) * 3 * math.sin(a))
    limb(c, (sh[0] + 3, sh[1] + 3), hand, 3.4, 2.8, COAT, bend=2 - 3 * r, hand=(SKIN, 2.7), bias=0.05)
    bl = 8 + 6 * r
    c.part(c.m_poly([(hand[0] + 1, hand[1] - 1.2), (hand[0] + bl, hand[1] - 2.5 - r * 2), (hand[0] + bl + 3, hand[1] - 1.8 - r * 2), (hand[0] + 1, hand[1] + 1.6)]), IRON, bias=0.15)
    c.part(c.m_poly([(hand[0] - 1, hand[1] - 3), (hand[0] + 1.5, hand[1] - 3), (hand[0] + 1.5, hand[1] + 3), (hand[0] - 1, hand[1] + 3)]), BOOT, edge=False)
    if r > 0.55: c.px(hand[0] + bl + 2, hand[1] - 2.5 - r * 2, (255, 255, 255), 2, 1)
