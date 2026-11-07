"""Esqueleto común para humanoides encorvados (saqueador, raptor): piernas, torso, cabeza y dos brazos con codo."""
import math


def pose(P, hunch=0.0):
    s, i, n, q, u = P['set'], P['i'], P['n'], P['q'], P['u']
    ph = u * 2 * math.pi
    D = dict(bob=0.0, lean=hunch, legs=0.0, reach=0.0, arm=0.0, sink=0.0, flash=0.0, fade=1.0, ph=ph, lift=0.0)
    if s == 'idle': D.update(bob=math.sin(ph) * 1.0, arm=math.sin(ph) * 0.15)
    elif s == 'walk': D.update(bob=-abs(math.sin(ph)) * 2.0, legs=math.sin(ph), lean=hunch + 0.12, arm=math.sin(ph + 1.0) * 0.5)
    elif s == 'atk':
        a = math.sin(min(1.0, q * 1.1) * math.pi)
        D.update(reach=a, lean=hunch + 0.3 * a, legs=0.5 * a, arm=-0.6 + 1.7 * a)
    elif s == 'hit': D.update(lean=hunch - 0.35, bob=1.0, flash=0.55, arm=0.8)
    elif s == 'death': D.update(sink=q, lean=hunch - 0.5 * q, fade=1.0 - 0.9 * max(0.0, q - 0.4) / 0.6, arm=0.9)
    return D


def limb(c, a, b, r0, r1, mat, bend=0.0, hand=None, bias=0.0):
    """Brazo/pierna de dos huesos de a a b con codo desplazado `bend` px."""
    mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
    dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1
    mid = (mx - dy / L * bend, my + dx / L * bend)
    c.part(c.m_capsule(a, mid, r0, (r0 + r1) / 2), mat, bias=bias)
    c.part(c.m_capsule(mid, b, (r0 + r1) / 2, r1), mat, bias=bias)
    if hand:
        c.part(c.m_ellipse(b[0], b[1], hand[1], hand[1]), hand[0])
    return mid
