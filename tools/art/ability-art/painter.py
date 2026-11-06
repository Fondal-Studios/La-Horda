#!/usr/bin/env python3
"""LA HORDA — EL PINTOR DE HABILIDADES (tools/art/ability-art)

Pinta los efectos de suelo de las habilidades de los guardianes (anillos, sectores, zonas vivas y rayos) como PIXEL ART
con la gramática unificada de canon.py: rampa de 5 tonos, contorno de 1 px, alfa 0/255, tramado Bayer, luz arriba-izquierda
y tres fases (anticipación → impacto → disipación). No usa azar ni filtros: la misma ficha da los mismos píxeles.

La ficha (specs/<guardian>.json) dice QUÉ pintar; las PERILLAS (`params`) dicen CÓMO. El Evaluador devuelve instrucciones
(`ops`) que modifican esas perillas dentro de rangos seguros (apply_ops); así el lazo Pintor → Evaluador → Pintor converge
sin que nadie toque píxeles a mano. Un artista humano puede seguir las mismas instrucciones en prosa (`render_instructions`).

Uso:
  python3 tools/art/ability-art/painter.py paint specs/vesper.json [--out DIR]   # pinta las habilidades de la ficha
"""
import argparse
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import canon  # noqa: E402

# ---------------------------------------------------------------- perillas y rangos seguros
KNOBS = {
    # name: (default, min, max, step)
    'rim': (2, 1, 4, 1),            # grosor del borde en el radio real
    'fill': (0.14, 0.0, canon.FILL_CAP, 0.03),   # relleno trameado (techo del motor: 24 %)
    'ticks': (8, 4, 16, 2),         # marcas radiales / puntos / rayos de decoración
    'tick_len': (0.16, 0.08, 0.34, 0.04),
    'glyph_scale': (1, 1, 3, 1),
    'sparks': (4, 2, 12, 2),
    'flash': (0.30, 0.0, 0.5, 0.1),
    'spin': (1, 0, 3, 1),           # vueltas del glifo durante la animación (pasos de 90°)
    'inner_ring': (0, 0, 1, 1),     # segundo anillo fino a 62 % del radio
    'highlight_arc': (1, 0, 1, 1),  # brillo en el arco superior-izquierdo del borde
    'impact_at': (0.30, 0.22, 0.42, 0.04),  # cuándo llega el pico (fracción de la tira)
    'fade_to': (0.0, 0.0, 0.3, 0.1),         # cuánto queda del efecto en el último cuadro (0 = limpio)
    'core': (2, 2, 3, 1),           # tono del relleno (2 = sombra, como el motor)
    'thick': (1, 1, 3, 1),          # grosor de las estelas de un sector (px)
    'deco': (0, 0, 2, 1),           # 0 marcas radiales · 1 puntos · 2 rayos largos
    'core_density': (0.5, 0.2, 0.9, 0.1),   # densidad del núcleo de un rayo
}
DECO_NAMES = ['ticks', 'dots', 'spokes']

GLYPHS = {  # 1 contorno (lo pone el Pintor) · 2 sombra · 3 base · 4 luz · 5 brillo · '.' vacío. Luz arriba-izquierda.
    'star': ['...5...', '...4...', '..343..', '5443445', '..323..', '...2...', '...2...'],
    'diamond': ['...5...', '..454..', '.43334.', '4333332', '.43332.', '..232..', '...2...'],
    'cross': ['..545..', '..434..', '5434345', '4333332', '3232322', '..232..', '..222..'],
    'ring': ['..5445.', '.43..32', '43....2', '4......', '3.....2', '.3...22', '..222..'],
    'bolt': ['....54.', '...543.', '..543..', '.54333.', '...543.', '..43...', '.32....'],
    'drop': ['..5..', '.44..', '.433.', '43332', '43332', '.322.', '..2..'],
    'eye': ['..45554..', '.4333332.', '43..5..32', '.2333322.', '..22222..'],
    'rune': ['5.....4', '.4...3.', '..4.3..', '5434342', '..3.2..', '.3...2.', '3.....2'],
    'stitch': ['4.....3', '.4...3.', '..4.3..', '...5...', '..4.3..', '.3...2.', '2.....2'],
    'scissors': ['.4.....4.', '..4...3..', '...4.3...', '....5....', '...3.2...', '..3...2..', '.43...23.', '4.3...2.3', '.33...22.'],
    'needle': ['.......54', '......54.', '.....54..', '....43...', '...43....', '..43.....', '.33......', '32.......', '2........'],
    'flame': ['...4...', '..44...', '..434..', '.43334.', '4333332', '4333332', '.32222.', '..222..'],
}


def clamp_knob(name, v):
    d, lo, hi, step = KNOBS[name]
    v = max(lo, min(hi, v))
    return round(v / step) * step if isinstance(step, float) else int(round(v))


def resolve_params(ability):
    p = {k: v[0] for k, v in KNOBS.items()}
    for k, v in (ability.get('params') or {}).items():
        if k in KNOBS:
            p[k] = clamp_knob(k, v)
    return p


def apply_ops(ability, ops):
    """Aplica las instrucciones del Evaluador a las perillas. Devuelve la lista de cambios reales."""
    p = resolve_params(ability)
    changes = []
    for op in ops:
        k = op.get('knob')
        if k == 'glyph':
            new = op.get('set')
            if new in GLYPHS and ability.get('glyph') != new:
                changes.append(f"glyph: {ability.get('glyph')} → {new}")
                ability['glyph'] = new
            continue
        if k not in KNOBS:
            continue
        old = p[k]
        new = clamp_knob(k, op['set'] if 'set' in op else old + op.get('add', 0))
        if new != old:
            p[k] = new
            changes.append(f"{k}: {old} → {new}")
    ability['params'] = p
    return changes


# ---------------------------------------------------------------- primitivas (todo entero, sin suavizado)
class Canvas:
    def __init__(self, W, H=None):
        self.W, self.H = W, H or W
        self.a = np.zeros((self.H, self.W), np.int8)
        yy, xx = np.mgrid[0:self.H, 0:self.W]
        self.xx, self.yy = xx, yy

    def polar(self):
        c = self.W / 2.0
        dx, dy = self.xx + 0.5 - c, self.yy + 0.5 - c
        return dx, dy, np.hypot(dx, dy), np.arctan2(dy, dx)


def dither_keep(shape, level):
    """Máscara de píxeles que sobreviven a un nivel de translucidez 0..1 (Bayer 4x4, como pixfx.js)."""
    h, w = shape
    yy, xx = np.mgrid[0:h, 0:w]
    return canon.BAYER[yy & 3, xx & 3] < max(0.0, min(1.0, level)) * 16


def dilate4(m):
    o = m.copy()
    o[1:, :] |= m[:-1, :]
    o[:-1, :] |= m[1:, :]
    o[:, 1:] |= m[:, :-1]
    o[:, :-1] |= m[:, 1:]
    return o


def put_solid(cv, mask, tone, outline=True):
    """Pone una capa sólida con contorno de 1 px (tono 1) por fuera; no toca lo que ya es sólido de otra capa."""
    if outline:
        ol = dilate4(mask) & ~mask
        cv.a[ol] = 1
    cv.a[mask] = tone


def blit(cv, rows, cx, cy, scale=1, rot=0, level=1.0):
    """Dibuja un glifo de filas con dígitos (tonos) centrado en (cx,cy); rot en cuartos de vuelta; level = tramado."""
    g = np.array([[int(ch) if ch != '.' else 0 for ch in r] for r in rows], np.int8)
    g = np.rot90(g, -rot)
    if rot % 4:  # al girar, la luz seguiría al glifo: se repone arriba-izquierda cambiando 4/5 ↔ 2/3 según el cuadrante
        pass
    if scale > 1:
        g = np.kron(g, np.ones((scale, scale), np.int8))
    h, w = g.shape
    x0, y0 = int(round(cx - w / 2)), int(round(cy - h / 2))
    mask = np.zeros(cv.a.shape, bool)
    tone = np.zeros(cv.a.shape, np.int8)
    for j in range(h):
        for i in range(w):
            if g[j, i] and 0 <= y0 + j < cv.H and 0 <= x0 + i < cv.W:
                mask[y0 + j, x0 + i] = True
                tone[y0 + j, x0 + i] = g[j, i]
    if level < 1:
        mask &= dither_keep(cv.a.shape, level)
    if mask.any():
        ol = dilate4(mask) & ~mask
        cv.a[ol & (cv.a <= 2)] = 1
        cv.a[mask] = tone[mask]
    return mask


def spark(cv, x, y, tone_hi=5, tone_lo=4):
    """Destello de 3 px en cruz (centro brillante)."""
    m = np.zeros(cv.a.shape, bool)
    x, y = int(round(x)), int(round(y))
    for dx, dy in ((0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)):
        if 0 <= x + dx < cv.W and 0 <= y + dy < cv.H:
            m[y + dy, x + dx] = True
    ol = dilate4(m) & ~m
    cv.a[ol & (cv.a <= 2)] = 1
    cv.a[m] = tone_lo
    if 0 <= x < cv.W and 0 <= y < cv.H:
        cv.a[y, x] = tone_hi


def ease(q):
    return 1 - (1 - q) * (1 - q)


def phase(q, impact_at):
    ant_end = 0.22
    hit_end = max(impact_at + 0.12, 0.42)
    ant = min(1.0, q / ant_end)
    post = 0.0 if q < hit_end else (q - hit_end) / (1 - hit_end)
    return ant, post, hit_end


def lit_band(cv, dx, dy, d, band, th, p):
    """Borde con luz arriba-izquierda: base en todo el aro, luz en el hemisferio UL, brillo en su borde interior, sombra abajo-derecha."""
    ul = (dx + dy) / (np.maximum(d, 1e-6) * math.sqrt(2))
    cv_tone = np.full(cv.a.shape, 3, np.int8)
    if p['highlight_arc']:
        cv_tone[ul < -0.2] = 4
        inner = band & (d <= d[band].min() + 1.01) if band.any() else band
        cv_tone[inner & (ul < -0.55)] = 5
    if th >= 3:
        cv_tone[band & (ul > 0.35)] = 2
    return cv_tone


# ---------------------------------------------------------------- formas
def paint_ring(S, q, p, glyph, idle=False):
    cv = Canvas(S)
    dx, dy, d, ang = cv.polar()
    R = S / 2 - 1.5
    ant, post, hit_end = phase(q, p['impact_at'])
    if idle:
        pulse = 0.5 + 0.5 * math.sin(q * math.tau)
        rad, th = R, max(1, p['rim'] - 1)
        fill = min(canon.FILL_CAP, p['fill'] * 0.6 + 0.04 * pulse)
        rim_lv, det_lv = 1.0, 1.0
    else:
        rad = R * (0.5 + 0.5 * ease(ant)) if q < 0.22 else R
        in_hit = 0.22 <= q < hit_end
        th = 1 if q < 0.22 else (p['rim'] if in_hit else max(1, round(p['rim'] - 1 - post * 1.2)))
        fill = 0.1 * ant if q < 0.22 else (p['fill'] if in_hit else p['fill'] * (1 - post))
        keep = p['fade_to']
        rim_lv = 1.0 if post < 0.55 else max(keep, 1 - (post - 0.55) / 0.45)
        det_lv = (ant * 0.55 if q < 0.22 else max(keep, 1 - post * 1.15))
    # relleno trameado (tono 'core')
    inside = d < rad - th - 0.5
    f = inside & dither_keep(cv.a.shape, fill)
    cv.a[f] = p['core']
    # núcleo/flash de impacto
    if not idle and 0.22 <= q < hit_end and p['flash'] > 0:
        k = 1 - (q - 0.22) / max(1e-6, hit_end - 0.22)
        fm = (d < rad * 0.55) & dither_keep(cv.a.shape, p['flash'] * k)
        cv.a[fm] = 5
    # marcas de decoración
    if det_lv > 0.05 and p['ticks'] > 0:
        n, L = int(p['ticks']), max(2, int(round(R * p['tick_len'])))
        solid = np.zeros(cv.a.shape, bool)
        for i in range(n):
            a = i * math.tau / n + (0 if idle else 0) + (q * math.tau / n if idle else 0)
            ca, sa = math.cos(a), math.sin(a)
            if p['deco'] == 1:   # puntos sobre un anillo interior
                r0 = rad * 0.82
                x, y = cv.W / 2 + ca * r0, cv.H / 2 + sa * r0
                for ox, oy in ((0, 0), (1, 0), (0, 1), (1, 1)):
                    xi, yi = int(x) + ox, int(y) + oy
                    if 0 <= xi < cv.W and 0 <= yi < cv.H:
                        solid[yi, xi] = True
            else:                 # marcas radiales hacia adentro (deco 0) o rayos largos (deco 2)
                ln = L * (2.2 if p['deco'] == 2 else 1.0)
                for s in range(int(ln)):
                    r0 = rad - th - 1 - s
                    if r0 < 2:
                        break
                    xi, yi = int(cv.W / 2 + ca * r0), int(cv.H / 2 + sa * r0)
                    if 0 <= xi < cv.W and 0 <= yi < cv.H:
                        solid[yi, xi] = True
        solid &= dither_keep(cv.a.shape, det_lv) if det_lv < 1 else solid
        put_solid(cv, solid, 4)
    if p['inner_ring'] and det_lv > 0.3:
        band = (np.abs(d - rad * 0.62) < 0.55)
        band &= dither_keep(cv.a.shape, det_lv) if det_lv < 1 else band
        put_solid(cv, band, 3)
    # glifo central (gira de a 90°) y chispas orbitando
    if glyph and det_lv > 0.05 and q >= 0.12:
        rows = GLYPHS[glyph]
        gw = max(len(rows[0]), len(rows))
        sc = max(1, min(p['glyph_scale'], int((rad * 0.5) // max(1, gw))))
        rot = int(math.floor(q * p['spin'] * 4)) % 4 if p['spin'] else 0
        lvl = 1.0 if (idle or q < hit_end) else max(p['fade_to'], 1 - post * 1.1)
        blit(cv, rows, cv.W / 2, cv.H / 2, sc, rot, lvl)
    if p['sparks'] > 0 and (idle or q >= 0.22) and rim_lv > 0.3:
        n = int(p['sparks'])
        lv = 1.0 if (idle or q < hit_end) else max(p['fade_to'], 1 - post * 1.2)
        for i in range(n):
            if lv < 1 and not dither_keep((1, 1), 1)[0, 0]:
                break
            if lv < 1 and (i / n) > lv:
                continue
            a = i * math.tau / n + q * math.tau * 0.5
            r0 = rad * 0.74
            spark(cv, cv.W / 2 + math.cos(a) * r0, cv.H / 2 + math.sin(a) * r0)
    # borde en el radio real (siempre arriba)
    if rim_lv > 0.05:
        band = (d <= rad) & (d > rad - th)
        if rim_lv < 1:
            band &= dither_keep(cv.a.shape, rim_lv)
        if p['highlight_arc'] or True:
            tone = lit_band(cv, dx, dy, d, band, th, p)
        ol = dilate4(band) & ~band
        cv.a[ol] = 1
        cv.a[band] = tone[band]
    return cv.a


def paint_sector(S, q, p, glyph, half=0.85):
    cv = Canvas(S)
    dx, dy, d, ang = cv.polar()
    R = S / 2 - 1.5
    ant, post, hit_end = phase(q, p['impact_at'])
    front = R * ease(min(1.0, q / 0.4))
    in_hit = q < hit_end
    fill = p['fill'] if in_hit else p['fill'] * (1 - post)
    wedge = (d <= max(2.0, front)) & (np.abs(ang) <= half)
    cv.a[wedge & dither_keep(cv.a.shape, fill)] = p['core']
    det = 1.0 if q < 0.12 else max(p['fade_to'], 1 - post * 1.2) if not in_hit else min(1.0, q / 0.12)
    if p['ticks'] > 0 and det > 0.05:   # estelas desde el vértice (hilos, agujas, rayos)
        n = max(2, int(p['ticks']) // 2)
        solid = np.zeros(cv.a.shape, bool)
        thick = p['thick']
        for k in range(n):
            a = (k - (n - 1) / 2) * (2 * half * 0.78 / max(1, n - 1))
            ln = front * (0.95 if p['deco'] != 1 else 0.8)
            for s in range(5, int(ln)):
                if p['deco'] == 1 and s % 6 > 3:      # estela discontinua (agujas)
                    continue
                wob = math.sin(s * 0.28 + k) * 2.2 * (s / max(1, ln)) if p['deco'] == 2 else 0   # hilo ondulado
                xi = int(cv.W / 2 + math.cos(a) * s - math.sin(a) * wob)
                yi = int(cv.H / 2 + math.sin(a) * s + math.cos(a) * wob)
                for t in range(thick):
                    if 0 <= xi < cv.W and 0 <= yi + t < cv.H:
                        solid[yi + t, xi] = True
        solid &= dither_keep(cv.a.shape, det) if det < 1 else solid
        put_solid(cv, solid, 4)
    th = max(1, p['rim'] - (0 if in_hit else 1))
    f = max(3.0, front)
    arc = (np.abs(d - f) <= th / 2.0 + 0.2) & (np.abs(ang) <= half)
    sides = np.zeros(cv.a.shape, bool)
    for sgn in (-1, 1):
        ux, uy = math.cos(sgn * half), math.sin(sgn * half)
        proj = dx * ux + dy * uy
        perp = np.abs(-dx * uy + dy * ux)
        sides |= (proj > 0) & (proj <= f) & (perp <= th / 2.0 + 0.2)
    band = arc | sides
    rim_lv = 1.0 if post < 0.5 else max(p['fade_to'], 1 - (post - 0.5) / 0.5)
    if rim_lv < 1:
        band &= dither_keep(cv.a.shape, rim_lv)
    tone = lit_band(cv, dx, dy, d, band, th, p)
    cv.a[dilate4(band) & ~band] = 1
    cv.a[band] = tone[band]
    if glyph and in_hit and q > 0.2:
        blit(cv, GLYPHS[glyph], cv.W / 2 + front * 0.55, cv.H / 2, max(1, p['glyph_scale']), 0, 1.0)
    if p['sparks'] > 0 and q >= 0.22:
        n = int(p['sparks'])
        lv = 1.0 if in_hit else max(p['fade_to'], 1 - post * 1.2)
        for i in range(n):
            if i / n > lv:
                continue
            a = -half * 0.75 + (i + 0.5) * (1.5 * half / n)
            r0 = f * (0.55 + 0.35 * ((i * 7) % 5) / 4)
            spark(cv, cv.W / 2 + math.cos(a) * r0, cv.H / 2 + math.sin(a) * r0)
    return cv.a


def paint_beam(W, H, q, f, p):
    """Baldosa horizontal repetible (W×H): contorno, casco, cuerpo, núcleo brillante y puntadas que se desplazan."""
    cv = Canvas(W, H)
    m = H / 2.0
    ant, post, hit_end = phase(q, p['impact_at'])
    grow = 0.3 + 3 * q if q < 0.2 else 0.85 - 0.5 * post
    half = max(1, int(round(m * grow)))
    top, bot = int(round(m - half)), int(round(m + half))
    ys = np.arange(H)[:, None]
    body = (ys >= top) & (ys < bot) & np.ones((H, W), bool)
    cv.a[body] = 2
    inner = (ys >= top + 1) & (ys < bot - 1) & np.ones((H, W), bool)
    cv.a[inner] = p['core']
    core_h = max(1, int(round(half * p['core_density'])))
    cr = (ys >= int(m - core_h / 2)) & (ys < int(m - core_h / 2) + core_h) & np.ones((H, W), bool)
    cv.a[cr] = 5
    off = (f * 2) % W
    xs = (np.arange(W)[None, :] - off) % W
    if p['deco'] == 1:       # puntos
        pat = ((xs % 4) < 2) & ((ys.astype(int) == int(m)) | (ys.astype(int) == int(m) - 1))
    elif p['deco'] == 2:     # chevrones
        pat = (xs % 6 == (np.abs(ys - m).astype(int) % 6)) & inner
    else:                    # puntadas
        pat = ((xs % 7) < 4) & (ys.astype(int) == int(m) - 1)
    cv.a[pat & body] = 4
    ul = np.zeros((H, W), bool)
    ul[top, :] = True
    cv.a[ul] = 4 if p['highlight_arc'] else 3     # filo superior iluminado
    cv.a[bot - 1, :] = 2                          # filo inferior en sombra
    cv.a[top - 1 if top > 0 else 0, :] = np.where(top > 0, 1, cv.a[0, :])
    if bot < H:
        cv.a[bot, :] = 1
    if q > hit_end and p['fade_to'] < 1:
        keep = dither_keep((H, W), max(p['fade_to'], 1 - post * 1.1))
        cv.a[(cv.a > 0) & ~keep & (cv.a != 1)] = 0
    return cv.a


# ---------------------------------------------------------------- orquestación
def frames_for(guardian, ab):
    p = resolve_params(ab)
    kind = ab['kind']
    N = int(ab.get('frames', 10))
    glyph = ab.get('glyph')
    if kind == 'beam':
        W, H = ab.get('tile', [14, 14])
        return [paint_beam(W, H, f / (N - 1), f, p) for f in range(N)]
    S = int(ab.get('size') or canon.kvb_s(ab['radius']))
    if kind == 'ring':
        return [paint_ring(S, f / (N - 1), p, glyph) for f in range(N)]
    if kind == 'idle':
        return [paint_ring(S, f / N, p, glyph, idle=True) for f in range(N)]
    if kind == 'sector':
        return [paint_sector(S, f / (N - 1), p, glyph, ab.get('half', 0.85)) for f in range(N)]
    raise ValueError(f'tipo desconocido: {kind}')


def sheet(frames, ramp, scale=1, bg=None):
    h, w = frames[0].shape
    out = Image.new('RGBA', (w * len(frames), h), (0, 0, 0, 0))
    for i, fr in enumerate(frames):
        out.paste(Image.fromarray(canon.index_to_rgba(fr, ramp), 'RGBA'), (i * w, 0))
    if scale > 1:
        out = out.resize((out.width * scale, out.height * scale), Image.NEAREST)
    return out


def paint_guardian(spec, outdir):
    """Pinta todas las habilidades de una ficha y escribe una hoja PNG (RGBA) + índices (.npy) por habilidad."""
    outdir = Path(outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    ramp = canon.ramp_rgb(spec)
    result = {}
    for ab in spec['abilities']:
        frames = frames_for(spec['guardian'], ab)
        sheet(frames, ramp).save(outdir / f"{ab['id']}.png")
        np.save(outdir / f"{ab['id']}.npy", np.stack(frames))
        result[ab['id']] = frames
    return result


def render_instructions(ability_id, ops, changes):
    """Instrucciones en prosa para un pintor humano (o un agente) a partir de las operaciones del Evaluador."""
    lines = [f'### {ability_id}']
    for op in ops:
        lines.append(f"- {op['why']}  → perilla `{op['knob']}`: " + (f"fijar {op['set']}" if 'set' in op else f"{op['add']:+}"))
    if changes:
        lines.append('  aplicado: ' + '; '.join(changes))
    return '\n'.join(lines)


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest='cmd', required=True)
    pp = sub.add_parser('paint')
    pp.add_argument('spec')
    pp.add_argument('--out', default=None)
    a = ap.parse_args()
    if a.cmd == 'paint':
        spec = canon.load_json(a.spec)
        out = Path(a.out) if a.out else canon.OUT_DOCS / spec['guardian'] / 'painted'
        paint_guardian(spec, out)
        print('pintado en', out)


if __name__ == '__main__':
    main()
