"""Raptor (Ciudad Maldita): carroñero de brazos largos con máscara de hueso en pico; agarra civiles y se los lleva."""
import math
from enemy_paint import ramp
from _biped import pose, limb

SPEC = dict(
    arena='ciudad', w=96, h=76, refH=62, anchor=0.9512, outline='#14090e',
    frames=[('idle', 4), ('walk', 6), ('atk', 5), ('hit', 1), ('death', 4), ('grab', 4), ('carry', 4), ('atkciv', 3), ('drop', 5)],
    alias={'walk_down': ['walk'], 'walk_up': ['walk'], 'hit_down': ['hit'], 'hit_up': ['hit'], 'atk_down': ['atk'], 'atk_up': ['atk']},
)
CLOAK = ramp('#6b2a3a'); SKIN = ramp('#a8928a'); BONE = ramp('#d9cdb4'); LEG = ramp('#443846'); CLAW = ramp('#c9c2b8'); VICT = ramp('#4a6a8a'); VSKIN = ramp('#d8b090')
EYE = [(150, 20, 30), (230, 50, 50), (255, 130, 90), (255, 230, 200)]
GY = 72


def draw(c, P):
    s = P['set']
    Q = dict(P)
    if s in ('grab', 'carry', 'atkciv', 'drop'): Q['set'] = 'walk' if s == 'carry' else 'atk'
    D = pose(Q, hunch=0.5)
    c.flash = D['flash']; c.fade = D['fade']
    q = P['q']; ph = D['ph']
    reach = D['reach']; hold = 0.0; drop = 0.0
    if s == 'grab': reach = math.sin(q * math.pi * 0.5 + 0.2); D['lean'] += 0.2 * reach; D['legs'] = 0.3
    if s == 'carry': hold = 1.0; D['legs'] = math.sin(ph); D['bob'] = -abs(math.sin(ph)) * 1.6
    if s == 'atkciv': hold = 1.0; reach = 0; D['lean'] += 0.15 * math.sin(q * math.pi); D['bite'] = q
    if s == 'drop': drop = q; hold = 1.0 - q; D['lean'] -= 0.1 * q
    cx = 38 + D['lean'] * 6; gy = GY + D['sink'] * 14; hipY = gy - 22 + D['bob'] + D['sink'] * 3
    sh = (cx + D['lean'] * 22, hipY - 15 + D['sink'] * 5)
    hd = (sh[0] + 9, sh[1] - 2 + D['sink'] * 4)
    for k, side in ((0, -1), (1, 1)):
        sw = D['legs'] * side
        fx = cx + sw * 12 + side * 2; lift = max(0, -sw) * 4 if s in ('walk', 'carry') else 0
        limb(c, (cx + side * 2, hipY), (fx, gy - 3 - lift), 4.6, 3.4, LEG if k == 0 else CLOAK, bend=-3 * side - 2)
        c.part(c.m_poly([(fx - 3, gy - 4 - lift), (fx + 8, gy - 4 - lift), (fx + 9, gy - lift), (fx - 3, gy - lift)]), CLAW)
    # capa andrajosa
    w = math.sin(ph * 2) * 2
    c.part(c.m_poly([(sh[0] - 8, sh[1] - 4), (sh[0] + 2, sh[1] - 6), (cx + 6, hipY + 12), (cx - 3 + w, hipY + 16), (cx - 8, hipY + 13), (cx - 14 + w, hipY + 18), (sh[0] - 16, sh[1] + 12)]), CLOAK)
    c.part(c.m_capsule((cx - 1, hipY), sh, 7.0, 6.8), SKIN, bias=-0.05)
    c.part(c.m_poly([(sh[0] - 7, sh[1] - 5), (sh[0] + 3, sh[1] - 6), (cx + 6, hipY + 4), (cx - 4, hipY + 6)]), CLOAK, bias=0.0)
    # brazo trasero largo
    hb = (sh[0] + 6 + reach * 8, sh[1] + 20 - reach * 4 - hold * 10) if hold else (sh[0] + 2 - D['arm'] * 6, sh[1] + 22 + D['arm'] * 2)
    limb(c, (sh[0] - 2, sh[1] + 1), hb, 3.0, 2.2, SKIN, bend=-3, hand=(CLAW, 2.4), bias=-0.2)
    # víctima (bulto) al agarre
    if hold > 0.01 or drop > 0:
        vx = sh[0] + 12 + (drop * 10); vy = sh[1] + 2 + drop * (gy - sh[1] - 12) - (0 if drop else 0)
        c.part(c.m_ellipse(vx, vy + 4, 4.6, 8.0, rot=1.2 if not drop else 1.5), VICT)
        c.part(c.m_ellipse(vx + 7.5, vy + 2.5, 3.6, 3.6), VSKIN)
        c.part(c.m_capsule((vx - 8, vy + 7), (vx - 12, vy + 11), 2.0, 1.6), VICT, edge=False)
    # cabeza: máscara de hueso en pico
    c.part(c.m_ellipse(hd[0], hd[1], 6.6, 7.0), SKIN)
    c.part(c.m_poly([(hd[0] - 2, hd[1] - 6), (hd[0] + 5, hd[1] - 5), (hd[0] + 15 + (2 if D.get('bite') else 0), hd[1] + 3), (hd[0] + 5, hd[1] + 5), (hd[0] - 3, hd[1] + 5)]), BONE)
    if D.get('bite'):
        c.part(c.m_poly([(hd[0] + 3, hd[1] + 3), (hd[0] + 14, hd[1] + 5 + 3 * math.sin(q * math.pi)), (hd[0] + 4, hd[1] + 8)]), BONE, bias=-0.1)
    for ex in (hd[0] + 3,):
        c.part(c.m_ellipse(ex, hd[1] - 1.5, 1.7, 1.7 if s != 'hit' else 0.7), EYE, edge=False, dither=False)
    c.part(c.m_poly([(hd[0] - 6, hd[1] - 3), (hd[0] - 12, hd[1] - 9), (hd[0] - 10, hd[1] - 1)]), CLOAK, edge=False)
    # brazo delantero con garra
    hf = (sh[0] + 12 + reach * 18, sh[1] + 12 - reach * 8) if not hold else (sh[0] + 13, sh[1] + 6 - (1 if s == 'carry' else 0))
    if s == 'atk': hf = (sh[0] + 10 + reach * 20, sh[1] + 8 + 4 * math.sin(reach * 3))
    limb(c, (sh[0] + 2, sh[1]), hf, 3.4, 2.4, SKIN, bend=-1 - 3 * (1 - reach), hand=(CLAW, 2.8), bias=0.05)
    for j, dy in enumerate((-2.5, 0, 2.5)):
        c.part(c.m_line([(hf[0] + 1, hf[1] + dy), (hf[0] + 5 + reach * 2, hf[1] + dy * 1.4 + 1)], 0.7), CLAW, edge=False, dither=False, bias=0.2)
