"""Plañidera (Ciudad Maldita): doliente velada que flota; llora, lanza su lamento y grita."""
import math
from enemy_paint import ramp

SPEC = dict(
    arena='ciudad', w=72, h=88, refH=70, anchor=0.9672, outline='#120912',
    frames=[('idle', 4), ('walk', 4), ('atk', 4), ('hit', 1), ('death', 4), ('cast', 3), ('wail', 6), ('scream', 5), ('throw', 5)],
    alias={'float': ['walk'], 'walk_down': ['walk'], 'walk_up': ['walk'], 'hit_down': ['hit'], 'hit_up': ['hit'], 'atk_down': ['atk'], 'atk_up': ['atk']},
)
DRESS = ramp('#5a1e36'); VEIL = ramp('#2e1a3a'); SKIN = ramp('#cdbfcf'); HAIR = ramp('#1c1224'); TEAR = [(40, 90, 150), (90, 170, 235), (150, 215, 255), (230, 248, 255)]
MOUTH = (30, 8, 20)


def draw(c, P):
    s, i, n, q, u = P['set'], P['i'], P['n'], P['q'], P['u']
    ph = u * 2 * math.pi
    bob = math.sin(ph) * 2.2 if s in ('idle', 'walk', 'cast', 'wail') else 0.0
    sway = math.sin(ph) * 1.5
    arms = 'face'; mouth = 0.0; thrust = 0.0; lean = 0.0; sink = 0.0
    if s == 'atk': a = math.sin(q * math.pi); arms = 'reach'; thrust = a; lean = 0.15 * a; mouth = 0.4 * a
    elif s == 'hit': lean = -0.25; c.flash = 0.55; arms = 'face'
    elif s == 'death': sink = q; c.fade = 1.0 - 0.9 * max(0, q - 0.3) / 0.7; arms = 'face'; lean = -0.2 * q
    elif s == 'cast': arms = 'up'; thrust = q
    elif s == 'wail': arms = 'face'; mouth = 0.6 + 0.4 * math.sin(ph * 2) ; 
    elif s == 'scream': arms = 'up'; mouth = 1.0; lean = -0.1
    elif s == 'throw': arms = 'reach'; thrust = math.sin(min(1, q * 1.2) * math.pi); lean = 0.2 * thrust
    cx = 34 + lean * 8; top = 30 + bob + sink * 22 + (4 if s == 'scream' else 0)
    hem = 78 + bob * 0.5 + sink * 6
    # estelas inferiores (flota: sin pies)
    for k, dx in enumerate((-9, -2, 6, 12)):
        wob = math.sin(ph + k * 1.7) * 3
        c.part(c.m_poly([(cx + dx - 3, hem - 8), (cx + dx + 3, hem - 8), (cx + dx + 1 + wob * 0.5, hem + 8 - k % 2 * 3)]), DRESS, bias=-0.15 - 0.05 * k)
    # cabello largo detrás
    c.part(c.m_poly([(cx - 5, top - 6), (cx + 6, top - 6), (cx + 7, top + 26), (cx - 11 + sway, top + 38), (cx - 15 + sway, top + 24), (cx - 9, top + 4)]), HAIR)
    # vestido
    c.part(c.m_poly([(cx - 5, top + 8), (cx + 6, top + 8), (cx + 14 + sway, hem - 4), (cx + 8, hem + 1), (cx + 1, hem - 3), (cx - 6, hem + 1), (cx - 14 + sway, hem - 4)]), DRESS)
    c.part(c.m_poly([(cx - 5, top + 8), (cx + 6, top + 8), (cx + 7, top + 22), (cx - 6, top + 22)]), DRESS, bias=0.12)
    c.part(c.m_poly([(cx - 8, top + 7), (cx + 9, top + 7), (cx + 8, top + 12), (cx - 7, top + 12)]), VEIL)  # chal
    # cabeza + velo
    hx, hy = cx + 1 + lean * 4, top - 1
    c.part(c.m_ellipse(hx, hy, 6, 7), SKIN)
    c.part(c.m_poly([(hx - 7, hy + 5), (hx - 6, hy - 6), (hx, hy - 10), (hx + 7, hy - 6), (hx + 8, hy + 7), (hx + 4, hy - 2), (hx - 3, hy - 2)]), VEIL)
    c.part(c.m_poly([(hx - 7, hy + 5), (hx - 12 + sway, hy + 14), (hx - 4, hy + 11)]), VEIL, bias=-0.1)
    # ojos y lágrimas luminosas
    c.px(hx + 1.5, hy + 0.5, (20, 10, 24), 2, 1); c.px(hx + 4.5, hy + 0.5, (20, 10, 24), 2, 1)
    for k in range(3):
        c.px(hx + 2 + (k % 2), hy + 2 + k * 2.2, TEAR[2 + (k == 0)], 1, 2)
    if mouth > 0.05:
        c.part(c.m_ellipse(hx + 3.5, hy + 4.3, 1.6, 1.0 + mouth * 2.2), [MOUTH] * 4, edge=False, dither=False)
    # brazos
    sx, sy = cx + 1, top + 11
    if arms == 'face':
        for sd in (0, 1):
            hnd = (hx + 2 + sd * 3 - 2, hy + 4 + sd * 2)
            c.part(c.m_capsule((sx - 3 + sd * 5, sy), (hnd[0], hnd[1] + 4), 2.6, 2.2), DRESS, bias=0.1)
            c.part(c.m_ellipse(hnd[0], hnd[1] + 2, 2.4, 2.8), SKIN)
    elif arms == 'up':
        for sd in (-1, 1):
            hnd = (sx + sd * (12 + thrust * 3), sy - 14 - thrust * 5 - (4 if s == 'scream' else 0))
            c.part(c.m_capsule((sx + sd * 3, sy), hnd, 2.7, 2.0), DRESS, bias=0.1)
            c.part(c.m_ellipse(hnd[0], hnd[1], 2.6, 2.6), SKIN)
            for dx in (-2, 0, 2): c.px(hnd[0] + dx, hnd[1] - 4, SKIN[2])
    else:
        hnd = (sx + 10 + thrust * 14, sy - 2 - thrust * 3)
        c.part(c.m_capsule((sx + 3, sy), hnd, 3.0, 2.2), DRESS, bias=0.1)
        c.part(c.m_ellipse(hnd[0], hnd[1], 2.8, 2.8), SKIN)
        for j in range(3): c.px(hnd[0] + 3, hnd[1] - 2 + j * 2, SKIN[2])
        hb = (sx - 6, sy + 6)
        c.part(c.m_capsule((sx - 3, sy), hb, 2.6, 2.2), DRESS, bias=-0.1)
        if thrust > 0.4:
            c.part(c.m_ellipse(hnd[0] + 7, hnd[1], 4 + thrust * 2, 3.2 + thrust), TEAR, edge=True, bias=0.25)
    if s == 'scream':
        for k in range(2):
            c.part(c.m_poly([(hx + 6 + k * 5, hy + 1 - 4 - k * 2), (hx + 11 + k * 5, hy + 4), (hx + 6 + k * 5, hy + 9 + k * 2), (hx + 8 + k * 5, hy + 4)]), TEAR, edge=False, dither=False, bias=0.2)
