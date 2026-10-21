"""Tiburón Joven y Tiburón Blanco (Arena Acuática) — fichas P0-05 / P0-06 de docs/ART_COMMISSION_BRIEF.md.
PLACEHOLDERS MEJORADOS (generados por código, a reemplazar por arte humano; ver docs/art-brief/ASSETS_FALTANTES_MUNDO.md).

Los PNG sueltos de assets/sprites/enemies/acuatica/tiburon_*/ (idle/idle2/atk, 1-2 poses de 33-73 px, suavizados, con el
Blanco SIN cola) sirvieron de referencia de silueta y color: de perfil, hocico romo, vientre claro, aleta dorsal
triangular, boca abierta con dientes. Acá se redibujan a la densidad del juego (~1 u/px) con el motor pixrig:
el cuerpo es UNA sola pieza (cinta de círculos sobre una columna que ondula), con panza, aletas, cola, ojo, branquias,
mandíbula inferior articulada y dientes; cada estado es una pose distinta, no un clon:
  idle    nado quieto, ondulación lenta y aletas que flotan
  walk    nado: onda que viaja de la cabeza a la cola, cola que barre
  atk     se encoge, se lanza, abre la mandíbula, MUERDE (cierra de golpe + destello) y vuelve
  hit     cuerpo arqueado hacia atrás, cabeza arriba, ojo entrecerrado, boca abierta
  death   se da vuelta panza arriba, ojo en X, aletas flojas y se hunde
y, además de la vista de perfil, vistas de frente (walk_down / atk_down / hit_down) y de espalda (walk_up).
Identidad: Joven = chico, gris azulado, delgado, ojo grande, aleta dorsal alta y filosa.
           Blanco = grande y robusto, pálido (gris hueso), ojo negro, dos filas de dientes, cicatrices y aleta mellada.
Uso (desde la raíz):  python3 tools/art/pixrig/build.py tiburones [--preview /tmp/x.png]"""
import math
from pixrig import *
import numpy as np

I3 = np.eye(3)


def mats(back, belly):
    return {
        'back': Mat(ramp_from(*back), base=2, shade=1.0),
        'back_far': Mat(ramp_from(*[_dim(c) for c in back]), base=2, shade=0.6),
        'belly': Mat(ramp_from(*belly), base=3, shade=0.8),
        'fin': Mat(ramp_from(*back), base=2, shade=1.2),
        'fin_far': Mat(ramp_from(*[_dim(c) for c in back]), base=2, shade=0.5),
        'gill': Mat(ramp_from(back[0], back[0], back[0], back[0], back[0]), emissive=True, base=2),
        'mouth': Mat(ramp_from('#2a0610', '#5a0c1c', '#8a1a2a', '#b83a3a', '#d86a58'), emissive=True, base=2),
        'tooth': Mat(ramp_from('#a8a49a', '#d8d4c8', '#f4f0e4', '#fffaf0', '#ffffff'), emissive=True, base=3),
        'eye': Mat(ramp_from('#02060a', '#04080e', '#060c14', '#0a1218', '#101c26'), emissive=True, base=2),
        'eye_ring': Mat(ramp_from('#4a6a78', '#7aa0ae', '#b8d8e0', '#e0f4f8', '#ffffff'), emissive=True, base=3),
        'spark': Mat(ramp_from('#9adff0', '#c8f4ff', '#eafcff', '#ffffff', '#ffffff'), emissive=True, base=3),
        'scar': Mat(ramp_from('#8a7a78', '#b8a8a4', '#d8cac4', '#ece2dc', '#fff6f0'), emissive=True, base=2),
        'gash': Mat(ramp_from('#2a1018', '#4a1a24', '#6a2430', '#8a3040', '#a84458'), emissive=True, base=2),
        'bubble': Mat(ramp_from('#7ab8c8', '#a8dce8', '#d0f0f8', '#eefcff', '#ffffff'), emissive=True, base=2),
    }


def _dim(h):
    r, g, b = hx(h)
    return '#%02x%02x%02x' % (int(r * .62), int(g * .66), int(b * .74))


# ---------------------------------------------------------------- especies
JOVEN = dict(
    key='tiburon_joven', radius=22, W=136, H=100, L=78.0, Rm=12.5, cx=78, cy=48,
    back=['#0b1824', '#1c3650', '#35607c', '#6593ab', '#a4c6d4'],
    belly=['#34506a', '#7a9db0', '#b6cdd8', '#dcebf0', '#f4f9fb'],
    dorsal=0.62, pect=0.5, tail=(17, 12), eye=2.1, eye_ring=True, teeth=1, scars=False, notch=False, snout=0.9,
    outline=(8, 16, 24), mouth_len=14.0, jaw_max=44, lunge=11)
BLANCO = dict(
    key='tiburon_blanco', radius=34, W=216, H=156, L=124.0, Rm=20.5, cx=122, cy=74,
    back=['#12161e', '#38404c', '#68717f', '#98a2ae', '#c4ccd4'],
    belly=['#6f7a88', '#aab3be', '#d6dce2', '#eef0f1', '#ffffff'],
    dorsal=0.78, pect=0.62, tail=(28, 20), eye=2.2, eye_ring=False, teeth=2, scars=True, notch=True, snout=1.0,
    outline=(10, 12, 18), mouth_len=22.0, jaw_max=40, lunge=17)

PROFILE = [(0.0, 0.34), (0.03, 0.60), (0.10, 0.88), (0.20, 0.99), (0.30, 1.0), (0.42, 0.94), (0.58, 0.70),
           (0.74, 0.42), (0.86, 0.28), (1.0, 0.24)]


class Shark:
    def __init__(self, S):
        self.S = S
        self.R = Rig(S['W'], S['H'], mats(S['back'], S['belly']), outline=S['outline'])
        self.R.bone('root', None, (0, 0))
        self.mats_far = None

    # --- columna: u=0 nariz ... u=1 cola. Se integra el rumbo desde el hombro (u=.30)
    def spine(self, P):
        S = self.S; N = 26; L = S['L'] * P.get('len', 1.0)
        us = np.linspace(0, 1, N); us_s = 0.30
        ph = P.get('ph', 0.0); A = P.get('amp', 0.0); f = P.get('freq', 0.95)
        phi = []
        for u in us:
            g = 0.30 + 2.1 * (u ** 1.6)
            w = A * g * math.cos(2 * math.pi * (f * u - ph))
            c = P.get('curve', 0.0) * (u - us_s)                      # arco constante (C)
            sk = P.get('s_curve', 0.0) * math.sin(math.pi * (u - 0.05) * 1.6)  # S del retroceso
            hd = P.get('head', 0.0) * max(0.0, (0.26 - u) / 0.26) ** 1.2   # cabeza
            tl = P.get('tailkick', 0.0) * max(0.0, (u - 0.80) / 0.20)
            phi.append(P.get('tilt', 0.0) + w + c + sk + hd + tl)
        phi = np.array(phi)
        ds = L / (N - 1)
        pts = np.zeros((N, 2)); ks = int(round(us_s * (N - 1)))
        pts[ks] = (S['cx'] + P.get('dx', 0.0), S['cy'] + P.get('dy', 0.0))
        for k in range(ks - 1, -1, -1):
            a = phi[k]; pts[k] = pts[k + 1] + ds * np.array([math.cos(a), math.sin(a)])
        for k in range(ks + 1, N):
            a = phi[k]; pts[k] = pts[k - 1] - ds * np.array([math.cos(a), math.sin(a)])
        rad = np.interp(us, [p[0] for p in PROFILE], [p[1] for p in PROFILE]) * S['Rm'] * P.get('girth', 1.0)
        self.us, self.pts, self.phi, self.rad = us, pts, phi, rad

    def at(self, u):
        us = self.us
        i = min(len(us) - 2, max(0, int(u * (len(us) - 1))))
        t = (u - us[i]) / (us[i + 1] - us[i])
        p = self.pts[i] * (1 - t) + self.pts[i + 1] * t
        a = self.phi[i] * (1 - t) + self.phi[i + 1] * t
        r = self.rad[i] * (1 - t) + self.rad[i + 1] * t
        return p, a, r

    def P(self, u, up=0.0, fwd=0.0, extra_a=0.0, scale_r=False):
        """Punto del cuerpo: columna en u, +up hacia el lomo, +fwd hacia la nariz (px). scale_r: up en fracción del radio."""
        p, a, r = self.at(u); a += extra_a
        if scale_r: up = up * r
        f = np.array([math.cos(a), math.sin(a)]); n = np.array([f[1], -f[0]])  # n = hacia el lomo
        q = p + n * up + f * fwd
        return (float(q[0]), float(q[1]))

    def curve(self, u0, ups, fwds, u1=None):
        return [self.P(u0, a, b) for a, b in zip(ups, fwds)]

    # --- piezas
    def body_chain(self):
        return Chain([tuple(p) for p in self.pts], list(self.rad))

    def belly_chain(self):
        # franja inferior: columna corrida hacia la panza, sin cabeza (la mandíbula va aparte)
        pts, rr = [], []
        for u, p, r in zip(self.us, self.pts, self.rad):
            pu, a, _ = self.at(min(u, 0.999))
            f = np.array([math.cos(a), math.sin(a)]); n = np.array([f[1], -f[0]])
            q = p - n * r * 0.95
            pts.append((float(q[0]), float(q[1]))); rr.append(r * 0.62)
        keep = [i for i, u in enumerate(self.us) if u >= 0.07]
        return Chain([pts[i] for i in keep], [rr[i] for i in keep])

    def fin(self, base_u0, base_u1, tip_u, tip_up, tip_fwd, up0, up1, curv=0.35, n=7, side=1):
        """Aleta: base sobre el borde (up0/up1 en fracción del radio, negativo = panza), punta a (tip_up, tip_fwd)."""
        a = self.P(base_u0, up0, 0, scale_r=True); b = self.P(base_u1, up1, 0, scale_r=True)
        tip = self.P(tip_u, tip_up, tip_fwd)
        pts = [a]
        # borde de ataque convexo, de salida cóncavo (Bézier cuadrática)
        c1 = self.P((base_u0 + tip_u) / 2, tip_up * 0.55 + (up0 * self.at(base_u0)[2]) * 0.45, tip_fwd * 0.2 + 3 * curv)
        for k in range(1, n):
            t = k / n
            pts.append(tuple((1 - t) ** 2 * np.array(a) + 2 * t * (1 - t) * np.array(c1) + t * t * np.array(tip)))
        pts.append(tip)
        c2 = self.P((base_u1 + tip_u) / 2, tip_up * 0.45 + (up1 * self.at(base_u1)[2]) * 0.55, tip_fwd * 0.6 - 2.5 * curv)
        for k in range(1, n):
            t = k / n
            pts.append(tuple((1 - t) ** 2 * np.array(tip) + 2 * t * (1 - t) * np.array(c2) + t * t * np.array(b)))
        pts.append(b)
        return Poly(pts)

    def caudal(self, kick=0.0, tear=False):
        S = self.S; up_l, lo_l = S['tail']
        p, a, r = self.at(1.0)
        a = a + kick
        f = np.array([math.cos(a), math.sin(a)]); n = np.array([f[1], -f[0]])
        def Q(b, u): return tuple((p - f * b + n * u).tolist())  # b hacia atrás, u hacia el lomo
        k = up_l / 15.0
        upper = [Q(-2 * k, 0.5), Q(1 * k, 2.2 * k), Q(5 * k, 5.5 * k), Q(10 * k, 11 * k), Q(15 * k, up_l * 1.05),
                 Q(15.5 * k, up_l * 0.82), Q(12 * k, 7 * k), Q(9 * k, 2.5 * k)]
        kl = lo_l / 11.0
        lower = [Q(9 * kl, -2.5 * kl), Q(12 * kl, -5.5 * kl), Q(11 * kl, -lo_l), Q(7 * kl, -lo_l * .72), Q(3.5 * kl, -4 * kl),
                 Q(-1 * kl, -2.4 * kl)]
        if tear:  # lóbulo superior mordido: falta una punta
            upper = [Q(-2 * k, 0.5), Q(1 * k, 2.2 * k), Q(5 * k, 5.5 * k), Q(9 * k, 9.5 * k), Q(12 * k, 12 * k),
                     Q(10.5 * k, 8 * k), Q(13 * k, 5.5 * k), Q(9 * k, 2.5 * k)]
        return Poly(upper + lower[::-1][::-1]) if False else Poly(upper + [Q(8 * k, 0)] + lower)

    # --- mandíbula articulada
    def jaw_pieces(self, body, belly_shape, open_deg):
        S = self.S
        hinge_u, hinge_up = 0.118, -0.20
        H = np.array(self.P(hinge_u, hinge_up, 0, scale_r=True))
        a = self.at(0.08)[1]
        f = np.array([math.cos(a), math.sin(a)]); n = np.array([f[1], -f[0]])
        # región de la mandíbula cerrada (debajo de la línea de la boca, desde la bisagra hacia adelante)
        def Qj(b, u): return tuple((H + f * b - n * u).tolist())  # b adelante, u hacia ABAJO
        rect = Poly([Qj(-2.5, -0.2), Qj(60, -0.2), Qj(60, 30), Qj(-2.5, 30)])
        jaw_region = Inter(body, rect)
        T = np.eye(3)
        ang = math.radians(open_deg)
        c, s = math.cos(ang), math.sin(ang)
        # rotación horaria en pantalla (punta hacia abajo) alrededor de la bisagra, respecto del rumbo de la cabeza
        rot = np.array([[c, -s * -1 if False else -s, 0], [s, c, 0], [0, 0, 1.0]])
        # sentido: queremos que la punta (hacia +f) baje (+n inverso). En pantalla con f≈(1,0), bajar = +y = rotación +ang.
        sgn = 1 if f[0] >= 0 else -1
        ang2 = ang * sgn
        c, s = math.cos(ang2), math.sin(ang2)
        R2 = np.array([[c, -s, 0], [s, c, 0], [0, 0, 1.0]])
        Tr = np.array([[1, 0, H[0]], [0, 1, H[1]], [0, 0, 1.0]]) @ R2 @ np.array([[1, 0, -H[0]], [0, 1, -H[1]], [0, 0, 1.0]])
        return jaw_region, rect, H, f, n, Tr, Qj

    def build(self, P):
        """Devuelve las piezas del cuadro (en orden) para una pose P."""
        S = self.S
        self.spine(P)
        parts = []
        z0 = 10
        open_deg = P.get('jaw', 0.0)
        body = self.body_chain()
        belly = Inter(body, self.belly_chain())
        jaw_region, rect, H, f, n, Tr, Qj = self.jaw_pieces(body, belly, open_deg)
        # cabeza (con el hueco de la mandíbula si está abierta) y panza
        body_shape = Diff(body, jaw_region) if open_deg > 0.5 else Diff(body, jaw_region)
        belly_shape = Diff(belly, jaw_region)
        roll = P.get('roll', 0.0)
        # aletas lejanas (detrás del cuerpo)
        pf = P.get('pflap', 0.0)
        pec_u = 0.27
        far = self.fin(pec_u + 0.01, pec_u + 0.075, pec_u + 0.13, -S['Rm'] * (1.55 + 0.25 * pf), -1.5, -0.72, -0.62, curv=0.2)
        parts.append(Part('pecFar', I3, far, 'fin_far', z0 - 2, cast=False))
        # aleta caudal y pedúnculo
        parts.append(Part('caudal', I3, self.caudal(P.get('tailflick', 0.0), S['scars']), 'fin', z0 - 1))
        # cuerpo
        parts.append(Part('body', I3, body_shape, 'back', z0))
        parts.append(Part('belly', I3, belly_shape, 'belly', z0 + 0.2, line=False, cast=False))
        # aletas pequeñas
        Rm = S['Rm']
        parts.append(Part('pelvic', I3, self.fin(0.57, 0.63, 0.64, -Rm * (0.78 + 0.1 * pf), -4.5, -0.66, -0.50, curv=0.1, n=4), 'fin', z0 - 0.5))
        parts.append(Part('anal', I3, self.fin(0.69, 0.76, 0.76, -Rm * 0.45, -4, -0.46, -0.36, curv=0.1, n=4), 'fin', z0 - 0.5))
        parts.append(Part('dorsal2', I3, self.fin(0.63, 0.70, 0.71, Rm * 0.72, -4, 0.52, 0.45, curv=0.1, n=4), 'fin', z0 - 0.5))
        dfin = self.fin(0.31, 0.47, 0.43, Rm * (1.0 + 1.45 * S['dorsal']), -3.5, 0.9, 0.82, curv=0.45, n=8)
        if S['notch']:
            nx = self.P(0.425, Rm * 1.55, -3.0)
            dfin = Diff(dfin, Poly([self.P(0.40, Rm * 1.66, 3), self.P(0.43, Rm * 1.5, -2), self.P(0.455, Rm * 1.72, -6)]))
        parts.append(Part('dorsal', I3, dfin, 'fin', z0 + 3))
        parts.append(Part('pecNear', I3, self.fin(pec_u, pec_u + 0.085, pec_u + 0.15, -Rm * (1.8 + 0.3 * pf), -1.0, -0.7, -0.6, curv=0.25), 'fin', z0 + 3))
        # branquias
        for k in range(3):
            u = 0.205 + 0.025 * k
            a0 = self.P(u, Rm * 0.50, 1.0 * k); b0 = self.P(u + 0.012, -Rm * 0.38, 1.6 * k)
            parts.append(Part('gill%d' % k, I3, Capsule(a0[0], a0[1], b0[0], b0[1], 0.55), 'gill', z0 + 1, cast=False, line=False, fx=True))
        # mandíbula inferior (rotada)
        if open_deg > 0.5:
            tip_world = np.array(Tr @ np.array([*Qj(S['mouth_len'], 0.0), 1.0]))[:2]
            mouth = Poly([tuple(H + f * 0.0 - n * 0.0), tuple(H + f * (S['mouth_len'] + 2) + n * 0.4), tuple(tip_world), tuple(H - n * 3.0)])
            parts.append(Part('mouthIn', I3, mouth, 'mouth', z0 + 0.8, cast=False, line=False))
        parts.append(Part('jaw', Tr, jaw_region, 'belly', z0 + 1.5, cast=False, line=True))
        # dientes (superiores sobre la línea de la boca; inferiores en la mandíbula)
        rows = S['teeth']
        n_t = int(S['mouth_len'] / 3.4)
        for r_ in range(rows):
            for k in range(n_t):
                x = 3.0 + k * (S['mouth_len'] - 4.0) / max(1, n_t - 1)
                tl = (2.7 if r_ == 0 else 1.9) * (S['Rm'] / 12.0 + 0.5)
                b0 = np.array(Qj(x, 0.1 + 0.8 * r_)); b1 = np.array(Qj(x + 1.9, 0.1 + 0.8 * r_)); tp = np.array(Qj(x + 0.9 - 0.4 * r_, 0.1 + tl + 0.8 * r_))
                if open_deg > 0.5 or k % 2 == 0:
                    parts.append(Part('tu%d_%d' % (r_, k), I3, Poly([tuple(b0), tuple(b1), tuple(tp)]), 'tooth', z0 + 2, cast=False, line=False, fx=True))
        if open_deg > 3.0:
            for k in range(n_t):
                x = 4.0 + k * (S['mouth_len'] - 5.0) / max(1, n_t - 1)
                tl = 2.2 * (S['Rm'] / 12.0 + 0.5)
                b0 = Qj(x, 0.0); b1 = Qj(x + 1.9, 0.0); tp = Qj(x + 0.9, -tl)
                parts.append(Part('tl%d' % k, Tr, Poly([b0, b1, tp]), 'tooth', z0 + 2, cast=False, line=False, fx=True))
        # ojo
        ex = self.P(0.075, S['Rm'] * 0.36, 0, scale_r=False)
        er = S['eye'] * P.get('eyescale', 1.0)
        mode = P.get('eye', 'open')
        if mode == 'open':
            if S['eye_ring']:
                parts.append(Part('eyeRing', I3, Ellipse(ex[0], ex[1], er + 1.1, er + 0.8), 'eye_ring', z0 + 3, cast=False, line=False, fx=True))
            parts.append(Part('eye', I3, Ellipse(ex[0], ex[1], er, er), 'eye', z0 + 3.2, cast=False, line=False, fx=True))
            hl = self.P(0.065, S['Rm'] * 0.36 + 0.7, 0.9)
            parts.append(Part('eyeHl', I3, Ellipse(hl[0], hl[1], 0.6, 0.6), 'spark', z0 + 3.4, cast=False, line=False, fx=True))
        elif mode == 'squint':
            a1 = self.P(0.095, S['Rm'] * 0.36 + 0.6, 0); b1 = self.P(0.055, S['Rm'] * 0.36 - 0.6, 0)
            parts.append(Part('eyeS', I3, Capsule(a1[0], a1[1], b1[0], b1[1], 0.8), 'eye', z0 + 3.2, cast=False, line=False, fx=True))
        elif mode == 'x':
            for sgn in (1, -1):
                a1 = self.P(0.075, S['Rm'] * 0.36 + sgn * 1.7, sgn * 1.7); b1 = self.P(0.075, S['Rm'] * 0.36 - sgn * 1.7, -sgn * 1.7)
                parts.append(Part('eyeX%d' % sgn, I3, Capsule(a1[0], a1[1], b1[0], b1[1], 0.6), 'eye', z0 + 3.2, cast=False, line=False, fx=True))
        # cicatrices y marcas (Blanco)
        if S['scars']:
            sc = [((0.33, 0.55, 0.0), (0.44, -0.10, -2.0)), ((0.36, 0.30, 0.0), (0.47, -0.45, -3.0)), ((0.52, 0.45, 0.0), (0.58, 0.05, -2.0))]
            for i, (a_, b_) in enumerate(sc):
                pa = self.P(a_[0], a_[1] * S['Rm'], a_[2]); pb = self.P(b_[0], b_[1] * S['Rm'], b_[2])
                parts.append(Part('scar%d' % i, I3, Capsule(pa[0], pa[1], pb[0], pb[1], 0.75, 0.6), 'scar', z0 + 1.2, cast=False, line=False, fx=True))
                pm = ((pa[0] + pb[0]) / 2 + 0.4, (pa[1] + pb[1]) / 2 + 0.6)
                parts.append(Part('gash%d' % i, I3, Capsule(pm[0] - 1.8, pm[1] - 0.8, pm[0] + 1.8, pm[1] + 0.8, 0.45), 'gash', z0 + 1.3, cast=False, line=False, fx=True))
            # tajo sobre el ojo
            ea = self.P(0.10, S['Rm'] * 0.85, 0.5); eb = self.P(0.055, S['Rm'] * 0.05, 0.5)
            parts.append(Part('browScar', I3, Capsule(ea[0], ea[1], eb[0], eb[1], 0.6), 'scar', z0 + 1.2, cast=False, line=False, fx=True))
        # efectos del cuadro
        for fx_ in P.get('fx', []):
            parts.extend(fx_(self))
        return parts

    def frame(self, P):
        return self.R.render({}, self.build(P))


# ---------------------------------------------------------------- efectos
def fx_flash(size=1.0, k=1.0):
    def f(sh):
        S = sh.S
        tip = np.array(sh.P(0.0, -S['Rm'] * 0.2, 2.0 + S['mouth_len'] * 0.15))
        out = []
        for i, (ang, ln) in enumerate([(-80, 9), (-35, 13), (0, 15), (35, 13), (80, 9), (140, 6), (-140, 6)]):
            a = math.radians(ang) + sh.at(0.0)[1]
            L_ = ln * size * (0.6 + 0.4 * k) * (S['Rm'] / 12.0 + 0.5) * 0.8
            p0 = tip + 2.0 * np.array([math.cos(a), math.sin(a)])
            p1 = tip + (2.0 + L_) * np.array([math.cos(a), math.sin(a)])
            out.append(Part('fl%d' % i, I3, Capsule(p0[0], p0[1], p1[0], p1[1], 1.1, 0.35), 'spark', 40, cast=False, line=False, fx=True))
        out.append(Part('flc', I3, Ellipse(tip[0], tip[1], 3.2 * size, 3.2 * size), 'spark', 41, cast=False, line=False, fx=True))
        return out
    return f


def fx_bubbles(seed=0, n=4, rise=0.0, spread=1.0):
    def f(sh):
        S = sh.S; out = []
        for i in range(n):
            ph = (rise + i / n) % 1.0
            base = np.array(sh.P(0.06 + 0.04 * i, S['Rm'] * 0.7, 0))
            x = base[0] + (i - n / 2) * 3.5 * spread + 1.5 * math.sin(6.28 * (ph + i * .3))
            y = base[1] - 4 - ph * S['Rm'] * 2.4
            r = 0.9 + 0.5 * ((i + seed) % 3) * 0.5
            out.append(Part('bb%d' % i, I3, Ellipse(x, y, r, r), 'bubble', 45, cast=False, line=False, fx=True))
        return out
    return f


def fx_blood_hit(k=1.0):
    def f(sh):
        S = sh.S; out = []
        c = np.array(sh.P(0.34, S['Rm'] * 0.2, 0))
        for i, (dx, dy) in enumerate([(-6, -7), (7, -9), (0, -13), (-11, -2), (11, -3)]):
            out.append(Part('dr%d' % i, I3, Ellipse(c[0] + dx * k, c[1] + dy * k, 1.1, 1.1), 'spark', 44, cast=False, line=False, fx=True))
        return out
    return f


# ---------------------------------------------------------------- animaciones (perfil)
def A_idle(sh, n=4):
    out = []
    for i in range(n):
        t = i / n
        P = dict(amp=0.07, freq=0.8, ph=t, dy=round(1.2 * math.sin(2 * math.pi * t), 2), pflap=math.sin(2 * math.pi * t + 1.0) * 0.5,
                 jaw=2.0 + 1.5 * (1 + math.sin(2 * math.pi * t)), tailflick=0.07 * math.sin(2 * math.pi * t - 1),
                 fx=[fx_bubbles(0, 2, t)] if i % 2 == 0 else [])
        out.append(sh.frame(P))
    return out


def A_walk(sh, n=8):
    out = []
    for i in range(n):
        t = i / n
        P = dict(amp=0.20, freq=0.95, ph=t, head=0.10 * math.sin(2 * math.pi * (t + 0.15)), dy=round(0.9 * math.sin(4 * math.pi * t), 2),
                 pflap=math.sin(2 * math.pi * t) * 0.8, jaw=1.5 + 3 * max(0, math.sin(2 * math.pi * t * 1.0 + 1.5)),
                 tailflick=0.30 * math.sin(2 * math.pi * (t - 0.3)))
        out.append(sh.frame(P))
    return out


def A_atk(sh, n=8):
    L = sh.S['lunge']; JM = sh.S['jaw_max']
    spec = [  # (dx, curve, s_curve, len, jaw, head, fx)
        (-4, 0.55, 0.0, 0.93, 4, -0.22, None),             # se encoge
        (-8, 0.95, 0.18, 0.88, 8, -0.38, None),            # carga: cuerpo en C, cabeza hacia atrás
        (L * 0.3, 0.30, 0.10, 0.95, JM * 0.62, -0.10, None),   # arranca
        (L * 0.85, -0.05, 0.0, 1.04, JM, 0.12, None),        # lanzada, boca abierta
        (L, -0.12, 0.0, 1.06, JM * 0.30, 0.22, 'flash1'),      # MUERDE
        (L * 0.92, -0.08, 0.0, 1.05, 3, 0.18, 'flash2'),       # cerrada con presa
        (L * 0.45, 0.05, 0.0, 1.0, 14, 0.02, None),
        (0, 0.12, 0.0, 0.98, 7, -0.04, None),
    ]
    out = []
    for i, (dx, cu, sc, ln, jw, hd, fxk) in enumerate(spec[:n]):
        t = i / n
        P = dict(amp=0.06, ph=t, dx=dx, curve=cu, s_curve=sc, len=ln, jaw=jw, head=hd, pflap=-0.9 if i < 3 else 0.6,
                 tailflick=0.35 * math.sin(2 * math.pi * t * 1.4), eyescale=1.18 if 2 <= i <= 4 else 1.0,
                 fx=[fx_flash(1.0 if fxk == 'flash1' else 0.7, 1.0 if fxk == 'flash1' else 0.5)] if fxk else [])
        out.append(sh.frame(P))
    return out


def A_hit(sh, n=2):
    out = []
    for i in range(n):
        k = [1.0, 0.55][i]
        P = dict(curve=-0.62 * k, s_curve=0.0, tilt=-0.10 * k, head=-0.40 * k, jaw=26 * k + 4, eye='squint', dx=-5 * k, dy=-3 * k, len=0.94,
                 amp=0.05, pflap=1.3 * k, tailflick=-0.5 * k, fx=[fx_blood_hit(1.0 if i == 0 else 0.6)])
        out.append(sh.frame(P))
    return out


def A_death(sh, n=8):
    """Se sacude, se da vuelta panza arriba (de canto en el medio), el ojo queda en X, las aletas flojas y se hunde."""
    SY = [1.0, 1.0, 0.66, 0.34, -0.40, -0.80, -1.0, -1.0]   # giro sobre el eje largo (1 = normal, -1 = panza arriba)
    out = []
    for i in range(n):
        t = i / (n - 1)
        k = ease(min(1.0, i / 4.0))
        sink = ease(t)
        P = dict(amp=0.10 * (1 - k), freq=0.8, ph=t * 0.8, curve=0.20 * k, tilt=-0.24 * k, head=-0.2 * k, jaw=14 * k + 2,
                 eye='x' if i >= 2 else 'squint', dy=-6 * (1 - abs(2 * t - 0.3)) + 26 * sink, dx=-6 * sink, pflap=-1.4 * k, tailflick=0.32 * k,
                 fx=[fx_bubbles(i, 3, t * 1.5, 1.4)] if i >= 2 else [])
        fr = sh.frame(P)
        out.append(roll_over(fr, sh, SY[i % len(SY)], P) if SY[i % len(SY)] != 1.0 else fr)
    return out


def roll_over(img, sh, sy, P):
    """Gira el cuadro sobre el eje largo del cuerpo: reescala en vertical respecto de la columna central (sy 1 -> -1).
    Cerca de 0 el cuerpo queda de canto (mínimo 0,22 para que se lea como cuerpo y no como una línea)."""
    S = sh.S; W, H = img.size
    mag = max(abs(sy), 0.34); sgn = 1 if sy >= 0 else -1
    cy = P.get('dy', 0) + S['cy']
    a = np.array(img); out = np.zeros_like(a)
    for y in range(H):
        ys = int(math.floor(cy + (y + 0.5 - cy) / (mag * sgn)))
        if 0 <= ys < H: out[y] = a[ys]
    return Image.fromarray(out, 'RGBA')


def A_dir(sh, base, tilt, n):
    """Vistas 'de frente' y 'de espalda' del motor: el tiburón nada en picada (hacia la cámara) o remontando
    (alejándose) en perfil inclinado; los cuadros de cada una son sus propias poses, no el perfil horizontal."""
    out = []
    for i in range(n):
        t = i / n
        if base == 'walk':
            P = dict(amp=0.18, freq=0.95, ph=t, tilt=tilt, head=0.08 * math.sin(2 * math.pi * (t + .15)), pflap=math.sin(2 * math.pi * t) * 0.8,
                     jaw=2.0 + 2 * max(0, math.sin(2 * math.pi * t + 1.5)), tailflick=0.28 * math.sin(2 * math.pi * (t - .3)),
                     dy=round(0.9 * math.sin(4 * math.pi * t), 2))
        elif base == 'atk':
            o = [4, 10, 28, sh.S['jaw_max'], 8, 4][i % 6]
            P = dict(amp=0.05, ph=t, tilt=tilt, curve=[0.5, 0.8, 0.2, -0.1, -0.1, 0.0][i % 6], len=[0.93, 0.9, 1.0, 1.06, 1.06, 1.0][i % 6], jaw=o,
                     dx=[-3, -6, 4, 9, 10, 4][i % 6] * (1 if tilt > 0 else 1), eyescale=1.15 if 2 <= i <= 4 else 1.0,
                     fx=[fx_flash(0.9, 1.0)] if i == 4 else [])
        else:  # hit
            P = dict(curve=-0.55, tilt=tilt - 0.1, head=-0.35, jaw=24, eye='squint', dx=-3, amp=0.05, pflap=1.2, tailflick=-0.4,
                     fx=[fx_blood_hit(1.0)])
        out.append(sh.frame(P))
    return out


def stage(S):
    sh = Shark(S)
    frames, sets = [], {}
    def add(name, fr):
        sets[name] = list(range(len(frames), len(frames) + len(fr))); frames.extend(fr)
    add('idle', A_idle(sh)); add('walk', A_walk(sh)); add('atk', A_atk(sh)); add('hit', A_hit(sh)); add('death', A_death(sh))
    add('walk_down', A_dir(sh, 'walk', 0.62, 8)); add('walk_up', A_dir(sh, 'walk', -0.62, 8))
    add('atk_down', A_dir(sh, 'atk', 0.5, 6)); add('atk_up', A_dir(sh, 'atk', -0.5, 6))
    add('hit_down', A_dir(sh, 'hit', 0.55, 1)); add('hit_up', A_dir(sh, 'hit', -0.55, 1))
    return frames, sets


def _measure(frames, sets):
    hs = []
    for i in sets['idle']:
        bb = frames[i].getchannel('A').point(lambda v: 255 if v > 0 else 0).getbbox()
        hs.append(bb[3] - bb[1])
    hs.sort(); return hs[len(hs) // 2]


def _build(S):
    frames, sets = stage(S)
    refH = _measure(frames, sets)
    hMul = round(refH * 1.0 / S['radius'], 2)   # canon de densidad: 1,0 unidad de mundo por píxel (docs/ART_BIBLE.md §14)
    info = dict(anchor=round((S['cy'] + S['Rm'] * 1.15 + 6) / S['H'], 4), hMul=hMul, ref_set='idle')
    return frames, sets, info, {'png': 'assets/sprites/enemies/acuatica/%s/atlas.png' % S['key'], 'key': S['key']}


def build_joven(): return _build(JOVEN)
def build_blanco(): return _build(BLANCO)


BUILDS = [('tiburon_joven', build_joven), ('tiburon_blanco', build_blanco)]
