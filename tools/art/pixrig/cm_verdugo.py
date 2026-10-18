"""El Verdugo (cm_verdugo) — Ciudad Maldita, élite de asedio. Rehecho a resolución NATIVA con pixrig.
Antes: ≈37 px de alto ampliados ×5 (2,8 u/px, ART_BIBLE §14: píxel demasiado grueso) con cuadros sucios. Ahora ≈96 px de
alto dibujados píxel a píxel (≈1,0 u/px con el mismo radio y la misma escala de juego: el personaje ocupa lo mismo).
Diseño conservado: bruto encorvado de capucha carmesí, hombreras de hueso, torso de cuero y correas, delantal ensangrentado y
un hachón de ejecución enorme (golpe vertical, barrido, y porrazo contra puertas). Celda 128×128.
Paleta: #100a0a #3a2420 #8a1a26 #d84a52 #b8a888 #6a7280."""
import math
import numpy as np
from pixrig import *
from pixrig import _hash
from biped import make_biped, walk, breathe, merge, s

W, H, G = 128, 128, 124
TARGET = {'png': 'assets/sprites/arenas/ciudad/cm_verdugo/atlas.png', 'meta_file': 'js/assets/ciudad-meta.js', 'const': 'CIUDAD_ATLAS'}
M = {
    'hood': Mat(ramp_from('#2a060c', '#5a0e18', '#8a1a26', '#b02a34', '#d84a52'), tex=tex_stripes(4, 1, 'y', -1, 1)),
    'hood_far': Mat(ramp_from('#1a0408', '#3a0a10', '#5a1018', '#7a1a22', '#962832')),
    'skin': Mat(ramp_from('#1e1416', '#3e2a2c', '#62443f', '#8a6454', '#b08a72'), tex=tex_noise(2, 1, .9, 81)),
    'skin_far': Mat(ramp_from('#140c0e', '#2a1c1e', '#44302e', '#5e443c', '#76584a'), tex=tex_noise(2, 1, .9, 82)),
    'pants': Mat(ramp_from('#120c10', '#241a1e', '#382830', '#4c3a42', '#645058'), tex=tex_stripes(5, 1, 'y', -1, 2)),
    'pants_far': Mat(ramp_from('#0a060a', '#160e12', '#241820', '#34262c', '#463438'), tex=tex_stripes(5, 1, 'y', -1, 2)),
    'leather': Mat(ramp_from('#100a0a', '#241616', '#3a2420', '#52342c', '#6e4a3c'), tex=tex_noise(3, -1, .88, 83)),
    'bone': Mat(ramp_from('#4a4034', '#8a7c68', '#b8a888', '#d4c6a6', '#f0e6cc')),
    'iron': Mat(ramp_from('#14161a', '#2a2e36', '#464c58', '#6a7280', '#98a0ae')),
    'blood': Mat(ramp_from('#2a0608', '#5a0c10', '#8a1218', '#b02028', '#d84048'), shade=0.3),
    'wood': Mat(ramp_from('#1e1008', '#4a2c14', '#7a5028', '#a07040', '#c49460'), tex=tex_stripes(3, 1, 'y', -1)),
    'socket': Mat(ramp_from('#06040a', '#0e0a12', '#160e18', '#20141e', '#2a1a26'), shade=0),
    'eye': Mat(ramp_from('#5a0a08', '#a01a10', '#ff4a2a', '#ff9a5a', '#ffd8a0'), emissive=True, base=3),
    'arc': Mat(ramp_from('#4a0810', '#8a1018', '#d02834', '#ff6a6a', '#ffd0d0'), emissive=True, base=2),
    'dust': Mat(ramp_from('#3a3036', '#5a4c54', '#7a6a72', '#9a8a90', '#bcaeb2'), emissive=True, base=2),
}
R = Rig(W, H, M)
make_biped(R, W // 2 - 8, G, dict(thigh=15, shin=14, foot=0, torso=34, neck=4, upper=19, fore=17, hip_w=3, sh_w=4, neck_x=4))
R.bone('jaw', 'head', (3, 3))
R.bone('axe', 'handN', (1, 3))

for side, mat, pm, z0 in (('F', 'skin_far', 'pants_far', 0), ('N', 'skin', 'pants', 40)):
    R.part('thigh' + side, 'hip' + side, Capsule(0, 0, 0, 15, 7.4, 6.2), pm, z0 + 1)
    R.part('shin' + side, 'knee' + side, Capsule(0, 0, 0, 14, 6.2, 5.2), pm, z0 + 2, line=False)
    R.part('wrap' + side, 'knee' + side, Capsule(0, 6, 0, 12, 6.4, 5.6) - Capsule(0, 8, 0, 10, 9, 9), 'leather', z0 + 2.2, line=False)
    R.part('boot' + side, 'foot' + side, Poly([(-6, -3), (5, -3), (12, 1), (12, 4), (-6, 4)]), 'leather', z0 + 3)
    R.part('boottip' + side, 'foot' + side, Poly([(8, 0), (12, 1), (12, 4), (8, 4)]), 'iron', z0 + 3.1, line=False)
    sh_z = z0 + 11 if side == 'N' else z0 + 5
    R.part('upper' + side, 'sh' + side, Capsule(0, 0, 0, 19, 6.6, 5.6), mat, sh_z)
    R.part('fore' + side, 'elb' + side, Capsule(0, 0, 0, 17, 6.0, 6.8), mat, sh_z + 1, line=False)
    R.part('brace' + side, 'elb' + side, Capsule(0, 2, 0, 12, 6.4, 7.2) - Capsule(0, 5, 0, 9, 10, 10), 'leather', sh_z + 1.2, line=False)
    R.part('fist' + side, 'hand' + side, Ellipse(0, 3, 6, 5.6), mat, sh_z + 2)

# torso: pecho enorme, vientre, correas cruzadas, delantal de cuero ensangrentado
R.part('pelvisP', 'pelvis', Ellipse(0, -2, 12, 8), 'pants', 18)
R.part('torso', 'chest', Ellipse(3, -6, 16, 22, -8), 'skin', 20)
R.part('belly', 'chest', Ellipse(7, 7, 13, 11), 'skin', 21)
R.part('strapA', 'chest', Chain([(-9, -20), (2, -4), (14, 12)], [1.8, 1.8, 1.8]), 'leather', 22, line=False)
R.part('strapB', 'chest', Chain([(14, -18), (4, -4), (-6, 10)], [1.6, 1.6, 1.6]), 'leather', 22.1, line=False)
R.part('buckle', 'chest', Ellipse(3, -4, 2.2, 2.2), 'iron', 22.4, line=False)
R.part('belt', 'pelvis', Poly([(-12, -8), (13, -8), (14, -3), (-12, -3)]), 'leather', 23)
R.part('beltb', 'pelvis', Ellipse(8, -5.5, 2.4, 2), 'iron', 23.2, line=False)
R.part('apron', 'pelvis', Poly([(2, -6), (16, -6), (17, 12), (12, 22), (3, 20), (1, 8)]), 'leather', 24)
R.part('stain1', 'pelvis', Ellipse(10, 6, 3.6, 5), 'blood', 24.2, line=False)
R.part('stain2', 'pelvis', Ellipse(6, 14, 2.4, 3.2), 'blood', 24.2, line=False)
R.part('bladeshine', 'pelvis', Poly([(14, -4), (16, -4), (16.6, 8), (15, 9)]), 'blood', 24.3, line=False)
# hombreras de hueso con púas (la cercana más grande)
R.part('padN', 'shN', Ellipse(1, 1, 9.4, 8), 'bone', 60)
R.part('padspikeN1', 'shN', Poly([(-4, -4), (-2, -13), (2, -4)]), 'bone', 60.1)
R.part('padspikeN2', 'shN', Poly([(2, -6), (6, -13), (8, -3)]), 'bone', 60.1)
R.part('padbandN', 'shN', Capsule(-7, 3, 8, 3, 1.1, 1.1), 'iron', 60.2, line=False)
R.part('padF', 'shF', Ellipse(0, 1, 7, 6), 'bone', 8)
R.part('padspikeF', 'shF', Poly([(-3, -3), (-1, -10), (2, -3)]), 'bone', 8.1)
# cabeza: capucha carmesí de punta caída, antifaz oscuro con ojos encendidos, mandíbula marcada
R.part('hoodback', 'head', Poly([(-8, -4), (-18, -2), (-22, 10), (-12, 6), (-7, 2)]), 'hood_far', 59)
R.part('hoodP', 'head', Poly([(-9, 4), (-8, -12), (-2, -19), (5, -16), (9, -9), (9, 3)]), 'hood', 60)
R.part('hoodtip', 'head', Poly([(-4, -17), (-9, -26), (-14, -18), (-9, -13)]), 'hood', 60.1)
R.part('mask', 'head', Poly([(0, -9), (8, -8), (9, -1), (7, 5), (0, 5)]), 'socket', 60.3, line=False)
R.part('eyeA', 'head', Ellipse(6.4, -5, 1.5, 1.2), 'eye', 60.5, line=False)
R.part('eyeB', 'head', Ellipse(1.6, -5, 1.2, 1.1), 'eye', 60.5, line=False)
R.part('jawP', 'jaw', Poly([(-1, 0), (8, 0), (8.6, 4), (4, 7), (-1, 5)]), 'skin', 60.4)
R.part('teeth', 'jaw', Chain([(3, 0.5), (8, 0.5)], [0.7, 0.7]), 'bone', 60.5, line=False)
R.part('neckP', 'neck', Capsule(0, 2, 1, 7, 6, 6), 'skin', 19)

# el hachón: mango largo con contrapeso y una hoja de carnicero enorme con filo carmesí
R.part('shaft', 'axe', Capsule(0, 14, 0, -34, 2.3, 2.0), 'wood', 70)
R.part('grip', 'axe', Capsule(0, 6, 0, 12, 2.7, 2.7), 'leather', 70.1, line=False)
R.part('pommel', 'axe', Poly([(-3, 15), (3, 15), (2, 21), (-2, 21)]), 'iron', 70.2)
R.part('blade', 'axe', Poly([(2, -24), (20, -26), (27, -18), (28, -4), (22, 6), (2, 2)]), 'iron', 70.3)
R.part('edge', 'axe', Poly([(26, -18), (28, -4), (22, 6), (20, 3), (25, -4), (24, -17)]), 'blood', 70.4, line=False)
R.part('hole', 'axe', Ellipse(10, -12, 2.6, 2.6), 'socket', 70.5, line=False)
R.part('beard', 'axe', Poly([(2, 2), (22, 6), (14, 12), (2, 8)]), 'iron', 70.35)
R.part('collar', 'axe', Poly([(-3, -26), (5, -26), (5, -22), (-3, -22)]), 'iron', 70.6)
R.part('spike', 'axe', Poly([(-3, -26), (0, -36), (3, -26)]), 'iron', 70.2)

HUNCH = {'chest': 14, 'head': -5, 'pelvis': (2, 0, 2), 'hipN': -4, 'kneeN': 6, 'hipF': -2, 'kneeF': 4}


def arc(cx, cy, r0, r1, a0, a1, z=95):
    """Estela carmesí (emisiva) entre dos ángulos (grados, 0 = derecha, positivo = horario en pantalla)."""
    pts_o = [(cx + r1 * math.cos(math.radians(a0 + (a1 - a0) * u / 8)), cy + r1 * math.sin(math.radians(a0 + (a1 - a0) * u / 8))) for u in range(9)]
    pts_i = [(cx + r0 * math.cos(math.radians(a1 + (a0 - a1) * u / 8)), cy + r0 * math.sin(math.radians(a1 + (a0 - a1) * u / 8))) for u in range(9)]
    T = np.eye(3)
    return Part('arc', T, Poly(pts_o + pts_i), 'arc', z, fx=True, line=False)


def dust(t, x0, y0, n=6, spread=50, k=1.0, z=90):
    out = []
    for i in range(n):
        u = (i + .5) / n - .5
        r = (5 - 2.5 * abs(u)) * k * (0.8 + 0.4 * _hash(i, 3, 23))
        T = np.array([[1, 0, x0 + u * spread], [0, 1, y0 - r * .6 - 3 * _hash(i, 5, 23) * k], [0, 0, 1.0]])
        out.append(Part(f'du{i}', T, Ellipse(0, 0, r, r * .7), 'dust', z + i * .01, fx=True))
    return out


REST = {'shN': -10, 'elbN': -8, 'axe': 158, 'shF': 8, 'elbF': -12}


def F(P, ex=(), diss=None):
    return R.render(merge(HUNCH, P), list(ex), dissolve=diss)


def build():
    fr, S = [], {}
    def add(name, lst): S[name] = list(range(len(fr), len(fr) + len(lst))); fr.extend(lst)
    add('idle', [F(merge(breathe(i / 4, 1.3), REST, {'jaw': 2 * max(0, s(i / 4))})) for i in range(4)])
    wk = []
    for i in range(6):
        t = i / 6; P = walk(t, 0.75, 2.2, 0.6, 2)
        P.update({'shN': -10 + 5 * s(t), 'elbN': -8, 'axe': 158 - 6 * s(t)})
        wk.append(F(P))
    add('walk', wk)
    # golpe vertical: levanta el hachón sobre la cabeza y lo clava hacia adelante
    def chop_frames(k_hit):
        out = []
        for i in range(5):
            if i == 0: P = {'shN': -110, 'elbN': -40, 'axe': -40, 'chest': 4, 'shF': -100, 'elbF': -40}
            elif i == 1: P = {'shN': -168, 'elbN': -18, 'axe': -75, 'chest': -6, 'pelvis': (0, 0, -1), 'shF': -150, 'elbF': -20, 'head': 4}
            elif i == 2: P = {'shN': -92, 'elbN': -20, 'axe': 78, 'chest': 26, 'pelvis': (3, 0, 4), 'shF': -88, 'elbF': -20, 'head': 8, 'jaw': 10}
            elif i == 3: P = {'shN': -64, 'elbN': -10, 'axe': 150, 'chest': 32, 'pelvis': (4, 0, 6), 'shF': -60, 'elbF': -10, 'head': 10, 'jaw': 8, 'hipN': -14, 'kneeN': 22}
            else: P = {'shN': -50, 'elbN': -14, 'axe': 150, 'chest': 24, 'pelvis': (3, 0, 4), 'shF': -46, 'elbF': -14, 'head': 6}
            ex = []
            if i >= 3: ex += dust(i / 5, W - 28, G - 2, 6, 46, 1.0 + 0.2 * (i == 3))
            out.append(F(P, ex))
        return out
    chop = chop_frames(1)
    add('chop', chop)
    add('atk', [chop[1], chop[2], chop[3], chop[4]])
    add('atk2', [chop[3], chop[4], chop[2]])
    # barrido: el hachón cruza en horizontal de atrás hacia adelante
    sw = []
    for i in range(8):
        k = i / 7
        if k < 0.35: u = k / 0.35; P = {'shN': 40 * u, 'elbN': -20, 'axe': -90 - 40 * u, 'chest': -12 * u, 'shF': 30 * u, 'elbF': -20, 'head': -4 * u, 'pelvis': (-3 * u, 0, 2)}
        elif k < 0.75: u = (k - 0.35) / 0.4; P = {'shN': 40 - 130 * u, 'elbN': -20, 'axe': -130 + 220 * u, 'chest': -12 + 40 * u, 'shF': 30 - 120 * u, 'elbF': -20, 'head': 6 * u, 'pelvis': (-3 + 7 * u, 0, 2 + 2 * u), 'hipN': -14 * u, 'kneeN': 16 * u, 'jaw': 10 * u}
        else: u = (k - 0.75) / 0.25; P = {'shN': -90 + 30 * u, 'elbN': -20, 'axe': 90 - 30 * u, 'chest': 28 - 12 * u, 'shF': -90 + 30 * u, 'elbF': -20, 'pelvis': (4 - 2 * u, 0, 4)}
        ex = [arc(60, 70, 36, 48, -80 + 150 * (k - 0.35) / 0.4 - 40, -80 + 150 * (k - 0.35) / 0.4 + 20)] if 0.35 <= k <= 0.8 else []
        sw.append(F(P, ex))
    add('sweep', sw)
    # porrazo contra la puerta: dos tiempos, más lento y pesado, con escombros
    sm = []
    for i in range(8):
        if i < 3: k = (i + 1) / 3; P = {'shN': -60 - 112 * k, 'elbN': -20 - 10 * k, 'axe': -10 - 70 * k, 'chest': -4 - 8 * k, 'shF': -60 - 100 * k, 'elbF': -20, 'head': 4 * k, 'pelvis': (-1 * k, 0, -2 * k)}
        elif i < 5: k = (i - 2) / 2; P = {'shN': -172 + 100 * k, 'elbN': -10, 'axe': -80 + 240 * k, 'chest': -12 + 44 * k, 'pelvis': (-1 + 5 * k, 0, -2 + 9 * k), 'shF': -160 + 96 * k, 'elbF': -10, 'head': 4 + 8 * k, 'jaw': 12 * k, 'hipN': -18 * k, 'kneeN': 28 * k}
        else: k = (i - 4) / 3; P = {'shN': -72 + 14 * k, 'elbN': -10, 'axe': 160, 'chest': 32 - 10 * k, 'pelvis': (4, 0, 7 - 2 * k), 'shF': -64 + 12 * k, 'elbF': -10, 'head': 12, 'hipN': -18, 'kneeN': 28}
        ex = dust(i / 8, W - 26, G - 2, 8, 56, 1.1 + 0.3 * (i in (4, 5))) if i >= 4 else []
        sm.append(F(P, ex))
    add('smash', sm)
    add('hit', [F(merge(REST, {'chest': -2, 'head': -20, 'pelvis': (-4, 0, 0), 'shN': -6, 'axe': 40, 'jaw': 6})),
                F(merge(REST, {'chest': 8, 'head': -10, 'pelvis': (-2, 0, 1), 'axe': 34, 'jaw': 3}))])
    add('hurt', [S_ for S_ in [F(merge(REST, {'chest': -2, 'head': -20, 'pelvis': (-4, 0, 0), 'shN': -6, 'axe': 40, 'jaw': 6})),
                               F(merge(REST, {'chest': 8, 'head': -10, 'pelvis': (-2, 0, 1), 'axe': 34, 'jaw': 3}))]])
    dth = []
    for i in range(6):
        k = ease(min(1, i / 4))
        P = {'pelvis': (2, 0, 2 + 26 * k), 'hipN': -4 - 80 * k, 'kneeN': 6 + 120 * k, 'hipF': -2 - 70 * k, 'kneeF': 4 + 110 * k, 'chest': 14 + 40 * k,
             'head': -5 + 22 * k, 'shN': -24 + 30 * k, 'elbN': -22 + 10 * k, 'axe': 158 + 20 * k, 'shF': 8 + 20 * k, 'jaw': 8 * k}
        dth.append(F(P, dust(i / 6, W // 2 - 6, G - 2, 7, 60, 0.7 + 0.5 * k) if i >= 3 else [], diss=((i - 3) / 3 * 0.65, 91) if i >= 4 else None))
    add('death', dth)
    S['walk_down'] = S['walk']; S['walk_up'] = S['walk']
    return fr, S, {'anchor': round(G / H, 4)}
