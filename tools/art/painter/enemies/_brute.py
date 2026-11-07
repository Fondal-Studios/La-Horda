"""Esqueleto de bruto corpulento (Fortaleza): piernas gruesas, torso ancho, hombros, dos brazos con codo.
Cada criatura aporta una config con ganchos: back(c,X) detrás del torso, head(c,X), weapon(c,X,hand) delante."""
import math
from _biped import limb


def pose(P, hunch):
    s, i, n, q, u = P['set'], P['i'], P['n'], P['q'], P['u']
    ph = u * 2 * math.pi
    D = dict(bob=0.0, lean=hunch, legs=0.0, reach=0.0, arm=0.0, sink=0.0, flash=0.0, fade=1.0, ph=ph, lift=0.0, both=0.0, steam=0.0)
    a = math.sin(min(1.0, q * 1.1) * math.pi)
    if s == 'idle': D.update(bob=math.sin(ph) * 1.0, arm=math.sin(ph) * 0.2)
    elif s == 'walk': D.update(bob=-abs(math.sin(ph)) * 1.8, lean=hunch + 0.10, legs=math.sin(ph), arm=math.sin(ph + 1.0) * 0.6)
    elif s == 'atk': D.update(reach=a, lean=hunch + 0.25 * a, legs=0.4 * a, arm=-0.6 + 1.7 * a)
    elif s in ('chain', 'rip'): D.update(reach=a, lean=hunch + 0.15 * a, legs=0.3 * a, arm=1.0, both=a)
    elif s == 'steam': D.update(lean=hunch - 0.1, arm=-0.4, steam=a, reach=a * 0.4, both=a)
    elif s == 'charge': D.update(lean=hunch + 0.55, legs=math.sin(ph * 2), bob=-abs(math.sin(ph * 2)) * 2, reach=0.6, arm=0.4)
    elif s == 'hit': D.update(lean=hunch - 0.3, bob=1.0, flash=0.55, arm=0.8)
    elif s == 'death': D.update(sink=q, lean=hunch - 0.7 * q, fade=1.0 - 0.9 * max(0.0, q - 0.4) / 0.6, arm=0.9)
    return D


class X:  # contexto que reciben los ganchos
    pass


def draw(c, P, C):
    D = pose(P, C.get('hunch', 0.1))
    c.flash = D['flash']; c.fade = D['fade']
    u = C['u']; W, H = c.w, c.h
    x = X(); x.D = D; x.P = P; x.u = u; x.C = C
    cx = W * C.get('cx', 0.45) + D['lean'] * 8 * u
    gy = H - 4 + D['sink'] * 14 * u
    hipY = gy - 27 * u + D['bob'] + D['sink'] * 5 * u
    sh = (cx + D['lean'] * 20 * u, hipY - 24 * u + D['sink'] * 4 * u)
    hd = (sh[0] + C.get('hx', 5) * u + D['lean'] * 5 * u, sh[1] - C.get('hy', 11) * u)
    x.cx, x.gy, x.hip, x.sh, x.hd = cx, gy, hipY, sh, hd
    c.sink_dx = 0
    # piernas
    for k, side in ((0, -1), (1, 1)):
        sw = D['legs'] * side
        fx = cx + sw * 13 * u + side * 3 * u; lift = max(0, -sw) * 5 * u if P['set'] in ('walk', 'charge') else 0
        limb(c, (cx + side * 4 * u, hipY), (fx, gy - 4 * u - lift), 7.0 * u, 5.2 * u, C['pant'] if k == 0 else C['pant2'], bend=(3 * side + 1) * u)
        c.part(c.m_poly([(fx - 6 * u, gy - 5 * u - lift), (fx + 8 * u, gy - 5 * u - lift), (fx + 9 * u, gy - lift), (fx - 6 * u, gy - lift)]), C['boot'])
    if 'back' in C: C['back'](c, x)
    # brazo trasero
    a = D['arm']
    hand0 = (sh[0] - 3 * u - a * 6 * u, sh[1] + 20 * u + a * 3 * u)
    limb(c, (sh[0] - 5 * u, sh[1] + 3 * u), hand0, 5.0 * u, 4.2 * u, C['arm2'], bend=-3 * u, hand=(C['skin'], 4.2 * u), bias=-0.15)
    # torso
    tw = C.get('tw', 1.0)
    c.part(c.m_poly([(cx - 11 * u * tw, hipY + 6 * u), (cx + 11 * u * tw, hipY + 6 * u), (sh[0] + 14 * u * tw + 2, sh[1] + 2 * u), (sh[0] + 2 * u, sh[1] - 6 * u), (sh[0] - 15 * u * tw, sh[1] + 2 * u)]), C['torso'])
    c.part(c.m_ellipse(cx + 1, (hipY + sh[1]) / 2 + 3 * u, 11 * u * tw, 12 * u), C['torso'], bias=0.08, edge=False)
    c.part(c.m_poly([(cx - 11 * u * tw, hipY + 1 * u), (cx + 11 * u * tw, hipY + 1 * u), (cx + 10 * u * tw, hipY + 9 * u), (cx - 10 * u * tw, hipY + 9 * u)]), C['pant'], bias=-0.1)
    if 'torso_fx' in C: C['torso_fx'](c, x)
    # cabeza
    if 'head' in C: C['head'](c, x)
    # brazo delantero + arma
    r = D['reach']
    hand = (sh[0] + 11 * u + r * 18 * u, sh[1] + 14 * u - r * 10 * u + (1 - r) * 3 * u * math.sin(a))
    limb(c, (sh[0] + 5 * u, sh[1] + 3 * u), hand, 5.4 * u, 4.6 * u, C['arm'], bend=(2 - 3 * r) * u, hand=(C['skin'], 4.6 * u), bias=0.05)
    c.part(c.m_ellipse(sh[0] + 6 * u, sh[1] + 4 * u, 6 * u, 5 * u), C.get('pad', C['torso']), bias=0.1)
    x.hand = hand
    if 'weapon' in C: C['weapon'](c, x, hand)
