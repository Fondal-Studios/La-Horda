#!/usr/bin/env python3
"""LA HORDA — EL EVALUADOR DE ARTE DE HABILIDADES

Puntúa 0–100 un conjunto de fotogramas RGBA (de un efecto de habilidad) contra el canon unificado y, si existe, contra el
arte ACTUAL del juego (línea base capturada del motor real): la nota que importa es la MEJORA. Devuelve:
  · puntaje por criterio y total, fallos duros, veredicto PASS / FAIL;
  · `ops`: instrucciones estructuradas para el Pintor (perillas de painter.KNOBS) y su explicación en prosa.
Criterios (peso): técnica 20 (alfa 5 · paleta 8 · higiene 7) · borde en el radio real 15 · legibilidad 25 (cobertura 12 ·
contraste sobre las 13 arenas 8 · suelo despejado 5) · movimiento 15 · riqueza visual 15 · identidad y distinción 10.
Una pasada nunca es PASS con un fallo duro, con un criterio bajo el 50 % de su peso o sin superar la línea base por
canon.MIN_IMPROVEMENT puntos. La revisión de arte humana (docs/ART_BIBLE.md §8) sigue siendo obligatoria.
"""
import math
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import canon  # noqa: E402

WEIGHTS = {'alpha': 5, 'palette': 8, 'hygiene': 7, 'edge': 15, 'coverage': 12, 'contrast': 8, 'clear_floor': 5,
           'motion': 15, 'richness': 15, 'identity': 10}
LABEL = {'alpha': 'alfa 0/255', 'palette': 'paleta del guardián', 'hygiene': 'higiene de píxel', 'edge': 'borde en el radio real',
         'coverage': 'cobertura legible', 'contrast': 'contraste sobre arenas', 'clear_floor': 'suelo despejado',
         'motion': 'movimiento en 3 fases', 'richness': 'riqueza visual', 'identity': 'identidad y distinción'}


def tri(v, lo, ok_lo, ok_hi, hi):
    """Pertenencia trapezoidal 0..1: 0 fuera de [lo,hi], 1 dentro de [ok_lo,ok_hi]."""
    if v <= lo or v >= hi:
        return 0.0
    if v < ok_lo:
        return (v - lo) / max(1e-9, ok_lo - lo)
    if v > ok_hi:
        return (hi - v) / max(1e-9, hi - ok_hi)
    return 1.0


def _opaque(f):
    return f[..., 3] > 0


def _nearest_tone(f, ramp):
    """índice 0..4 del tono de rampa más cercano y distancia, para cada píxel opaco."""
    rgb = f[..., :3].astype(np.int32)
    R = np.array(ramp, np.int32)
    d = np.stack([np.sqrt(((rgb - R[t]) ** 2).sum(-1)) for t in range(len(R))], -1)
    return d.argmin(-1), d.min(-1)


def _neigh8(m):
    o = np.zeros_like(m)
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            if dx or dy:
                s = np.roll(np.roll(m, dy, 0), dx, 1)
                if dy == 1: s[0, :] = False
                if dy == -1: s[-1, :] = False
                if dx == 1: s[:, 0] = False
                if dx == -1: s[:, -1] = False
                o |= s
    return o


def evaluate(frames, ab, ramp, others=None, baseline_total=None, baseline_criteria=None, baseline_metrics=None, overlay_frames=None):
    """frames: lista de arrays RGBA (H,W,4). ab: ficha de la habilidad. ramp: 5 colores RGB. others: firmas de las demás."""
    kind = ab['kind']
    if not any((f[..., 3] > 0).any() for f in frames):   # arte vacío: rechazo directo, sin medir nada
        z = {k: 0.0 for k in WEIGHTS}
        return dict(score=0.0, points=z, metrics={}, hard_fails=['el arte está vacío (ningún píxel opaco)'], ops=[dict(
            knob='fill', why='el arte está vacío: pintar el borde y las marcas del efecto', add=0.06)], signature=[0.0] * 16, criteria=z,
            baseline_total=baseline_total, baseline_criteria=baseline_criteria)
    tile = kind == 'beam'
    n = len(frames)
    H, W = frames[0].shape[:2]
    small = (not tile) and W <= 32   # sello de ≤ 32 px: el borde con contorno ya ocupa casi todo el radio
    m = {}   # métricas crudas
    why = {}
    A = np.stack([_opaque(f) for f in frames])
    area_px = A.sum((1, 2))
    peak = int(area_px.argmax())
    if overlay_frames is not None and baseline_metrics and 'peak_idx' in baseline_metrics:
        peak = int(baseline_metrics['peak_idx'])   # modo híbrido: se compara en el MISMO cuadro de impacto que el arte actual (el borde no debe mover el pico)

    tech = overlay_frames if overlay_frames is not None else frames   # modo híbrido: la técnica se mide sobre MI capa, no sobre el arte del motor
    # ---- técnica: alfa
    al = np.concatenate([f[..., 3].ravel() for f in tech])
    m['peak_idx'] = peak
    m['alpha_binary'] = float(np.isin(al, (0, 255)).mean())
    # ---- técnica: paleta
    allpx = np.concatenate([f[_opaque(f)] for f in tech if _opaque(f).any()])
    ncol = len({tuple(c[:3]) for c in allpx})
    near = np.concatenate([_nearest_tone(f, ramp)[1][_opaque(f)] for f in tech if _opaque(f).any()])
    m['palette_adherence'] = float((near <= 24).mean())
    m['colors'] = ncol
    # ---- higiene: píxeles sueltos (ignora el tono de relleno trameado) y degradados
    iso = []
    for f in (tech if ab['kind'] == 'idle' else tech[:peak + 2]):
        op = _opaque(f)
        if not op.any():
            continue
        tone, _ = _nearest_tone(f, ramp)
        solid = op & (tone != 1)  # tono 1 = sombra/relleno trameado
        lonely = solid & ~_neigh8(op)
        iso.append(lonely.sum() / max(1, solid.sum()))
    m['isolated'] = float(np.mean(iso)) if iso else 1.0

    # ---- borde en el radio real (anillo/sector/idle) o filos del rayo
    pf = frames[peak]
    po = _opaque(pf)
    if tile:
        outl_ok, cols = 0, 0
        tone, dist = _nearest_tone(pf, ramp)
        for x in range(W):
            ys = np.where(po[:, x])[0]
            if ys.size:
                cols += 1
                outl_ok += int(tone[ys[0], x] == 0 and dist[ys[0], x] <= 24) + int(tone[ys[-1], x] == 0 and dist[ys[-1], x] <= 24)
        m['edge_outline'] = outl_ok / max(1, 2 * cols)
        m['edge_reach'] = 1.0
    else:
        c = W / 2.0
        R = W / 2 - 1.5
        ys, xs = np.mgrid[0:H, 0:W]
        dist_c = np.hypot(xs + .5 - c, ys + .5 - c)
        ang = np.arctan2(ys + .5 - c, xs + .5 - c)
        half = ab.get('half', 0.85) if kind == 'sector' else math.pi
        tone, td = _nearest_tone(pf, ramp)
        rays = np.linspace(-half * 0.92, half * 0.92, 48)
        okr, reach = 0, []
        for a in rays:
            sel = po & (np.abs(((ang - a + math.pi) % math.tau) - math.pi) < (math.pi / 90))
            if not sel.any():
                reach.append(0.0)
                continue
            far = np.where(sel, dist_c, -1)
            iy, ix = np.unravel_index(far.argmax(), far.shape)
            reach.append(far[iy, ix] / (R + 1))
            okr += int(tone[iy, ix] == 0 and td[iy, ix] <= 24)
        reach = np.array(reach)
        m['edge_outline'] = okr / len(rays)
        m['edge_reach'] = float(np.clip(reach, 0, 1.05).mean())
        m['edge_over'] = float((reach > 1.04).mean())
    # ---- cobertura (cuadro pico) y suelo despejado
    if tile:
        m['coverage'] = float(po.mean())
        m['interior'] = 0.0
    else:
        disc = (dist_c <= R + 1) & (np.abs(ang) <= half)
        m['coverage'] = float((po & disc).sum() / max(1, disc.sum()))
        inner = (dist_c < 0.8 * R) & (dist_c > 0.28 * R) & (np.abs(ang) <= (half * 0.72 if kind == 'sector' else half))
        m['interior'] = float((po & inner).sum() / max(1, inner.sum()))
    if tile:
        ext = np.array([(np.ptp(np.where(pf[:, x, 3] > 0)[0]) + 1) if (pf[:, x, 3] > 0).any() else 0 for x in range(W)], float)
        ctr = np.array([np.where(pf[:, x, 3] > 0)[0].mean() if (pf[:, x, 3] > 0).any() else H / 2 for x in range(W)], float)
        m['jag'] = float((ctr.std() + 0.5 * ext.std()) / max(1.0, H))   # irregularidad: un relámpago ≫ una barra
        m['interior_detail'] = 0.3
    else:
        t_pf, _ = _nearest_tone(pf, ramp)
        m['interior_detail'] = float((po & inner & (t_pf != 1)).sum() / max(1, inner.sum()))
    # ---- contraste del borde contra las 13 arenas
    pal_lum = [canon.lum(tuple(int(v) for v in ramp[i])) for i in range(5)]
    dark = ramp[0]
    ok_ar = 0
    for floors in canon.ARENA_FLOORS.values():
        best = 0
        for fh in floors:
            fl = canon.hex_rgb(fh)
            cs = max(canon.contrast(dark, fl), max(canon.contrast(tuple(ramp[i]), fl) for i in (2, 3, 4)))
            best = max(best, min(canon.contrast(dark, fl), max(canon.contrast(tuple(ramp[i]), fl) for i in (2, 3, 4))))
        ok_ar += int(best >= 1.9)   # contorno oscuro Y filo claro distinguibles: se lee sobre suelo claro y oscuro
    tone_all, _ = _nearest_tone(pf, ramp)
    used = set(np.unique(tone_all[po]).tolist()) if po.any() else set()
    both = (0 in used) and bool(used & {3, 4})
    m['arena_ok'] = ok_ar / len(canon.ARENA_FLOORS)
    m['has_outline_and_light'] = both
    m['lum_gap'] = canon.contrast(tuple(int(v) for v in ramp[0]), tuple(int(v) for v in ramp[4]))
    # ---- movimiento
    cov = area_px / max(1, area_px.max())
    pk = peak / max(1, n - 1)
    diffs = [float((A[i] != A[i + 1]).mean()) for i in range(n - 1)]
    loop = kind == 'idle'
    if loop:
        m['peak_pos'] = 0.5
        m['tail'] = 0.0
        m['loop_gap'] = float((A[0] != A[-1]).mean())
    else:
        m['peak_pos'] = pk
        m['tail'] = float(cov[-1])
    m['motion_mean'] = float(np.mean(diffs)) if diffs else 0.0
    m['unique_frames'] = len({f.tobytes() for f in frames}) / n
    # ---- riqueza: tonos usados, brillo, centro (glifo), marcas
    tones_used = len(used)
    hi_share = float((tone_all[po] == 4).mean()) if po.any() else 0.0
    core = (dist_c < 0.3 * R) if not tile else np.ones((H, W), bool)
    m['tones'] = tones_used
    m['highlight_share'] = hi_share
    m['core_fill'] = float((po & core).sum() / max(1, core.sum())) if not tile else float(po.mean())
    # distintos tipos de rasgo a lo largo de la animación (glifo central, chispas, marcas, flash)
    gl = np.mean([(_opaque(f) & core).sum() / max(1, core.sum()) for f in frames]) if not tile else 0.5
    m['detail_mass'] = float(gl)
    # ---- identidad: sello propio (firma radial/angular) y distancia a las otras habilidades del mismo guardián
    sig = _signature(pf)
    m['signature'] = sig
    dmin = 1.0
    if others:
        for oid, osig in others.items():
            dmin = min(dmin, float(np.abs(sig - osig).sum() / 2))
    m['min_sig_dist'] = dmin

    # ================= puntajes por criterio (0..1) =================
    s = {}
    s['alpha'] = 1.0 if m['alpha_binary'] >= 0.9999 else 0.0
    pal = tri(m['palette_adherence'], 0.6, 0.96, 1.01, 2)
    s['palette'] = pal * (1.0 if m['colors'] <= 8 else max(0.0, 1 - (m['colors'] - 8) / 8))
    s['hygiene'] = tri(m['isolated'], -1, -0.5, 0.03, 0.14)
    s['edge'] = 0.6 * (1.0 if m['edge_outline'] >= 0.85 else m['edge_outline'] / 0.85) + 0.4 * tri(m['edge_reach'], 0.6, 0.93, 1.03, 1.2) \
        - (0.2 if m.get('edge_over', 0) > 0.1 else 0)
    s['edge'] = float(np.clip(s['edge'], 0, 1))
    if tile:
        s['coverage'] = tri(m['coverage'], 0.2, 0.5, 1.0, 1.01)
    else:
        s['coverage'] = tri(m['coverage'], 0.04, 0.14, 0.5, 0.75) if small else tri(m['coverage'], 0.04, 0.14, 0.5, 0.7)
    s['contrast'] = float(np.clip(0.5 * m['arena_ok'] + 0.3 * (1.0 if both else 0.0) + 0.2 * min(1.0, m['lum_gap'] / 6.0), 0, 1))
    s['clear_floor'] = 1.0 if tile else (tri(m['interior'], 0.0, 0.05, 0.6, 0.8) if small else tri(m['interior'], 0.03, 0.12, 0.45, 0.62))
    if loop:
        s['motion'] = 0.5 * tri(m['motion_mean'], 0.0, 0.015, 0.2, 0.45) + 0.3 * (1.0 if m['loop_gap'] < 0.2 else 0.3) + 0.2 * min(1.0, m['unique_frames'] / 0.9)
    else:
        s['motion'] = (0.3 * tri(m['peak_pos'], 0.05, 0.2, 0.55, 0.85) + 0.3 * (1.0 if m['tail'] <= 0.3 else max(0.0, 1 - (m['tail'] - 0.3) / 0.5))
                       + 0.25 * tri(m['motion_mean'], 0.0, 0.04, 0.3, 0.6) + 0.15 * min(1.0, m['unique_frames'] / 0.9))
    if tile:
        s['richness'] = 0.5 * min(1.0, tones_used / 4) + 0.3 * tri(hi_share, 0.0, 0.03, 0.35, 0.7) + 0.2 * min(1.0, m['unique_frames'])
    else:
        s['richness'] = (0.2 * min(1.0, tones_used / 4) + 0.15 * tri(hi_share, 0.0, 0.03, 0.3, 0.6)
                         + 0.4 * (tri(m['interior_detail'], 0.0, 0.08, 0.6, 0.85) if small else tri(m['interior_detail'], 0.0, 0.10, 0.40, 0.62)) + 0.15 * tri(m['detail_mass'], 0.0, 0.1, 0.5, 0.85) + 0.1 * min(1.0, m['colors'] / 4))
    s['identity'] = 0.5 * (1.0 if m['palette_adherence'] >= 0.9 else 0.4) + 0.5 * (tri(dmin, 0.02, 0.18, 2, 3) if others else 1.0)
    if overlay_frames is not None and baseline_criteria and baseline_metrics:
        worse = m.get('interior', 0) > baseline_metrics.get('interior', 0) + 0.08   # el borde no puede cargar el centro
        for k in ('coverage', 'clear_floor', 'richness'):
            s[k] = max(s[k], baseline_criteria.get(k, 0.0)) if not worse else s[k]
    pts = {k: round(WEIGHTS[k] * float(np.clip(v, 0, 1)), 2) for k, v in s.items()}
    total = round(sum(pts.values()), 1)

    # ================= fallos duros =================
    hard = []
    if m['alpha_binary'] < 0.9999:
        hard.append('alfa semitransparente: el canon exige 0 o 255')
    ov_rel = overlay_frames is not None and baseline_metrics
    if not tile and m['interior'] > ((baseline_metrics['interior'] + 0.08) if ov_rel and baseline_metrics['interior'] > 0.55 else (0.7 if small else 0.6)):
        hard.append(f"el interior tapa al enemigo ({m['interior']:.0%} de píxeles opacos en la zona central; techo 60 %)")
    if not tile and m['coverage'] > ((baseline_metrics['coverage'] + 0.08) if ov_rel and baseline_metrics['coverage'] > 0.65 else (0.75 if small else 0.7)):
        hard.append(f"cobertura excesiva ({m['coverage']:.0%}): oculta el suelo")
    if m['palette_adherence'] < 0.6:
        hard.append('la mayoría de los colores no pertenecen a la rampa del guardián')
    if not tile and m['edge_reach'] < 0.6:
        hard.append('el borde no llega al radio real: la zona real no se lee')
    if m['unique_frames'] < 0.5:
        hard.append('animación casi estática (más de la mitad de cuadros repetidos)')

    # ================= instrucciones al Pintor =================
    ops = []

    def op(knob, why_, **kw):
        ops.append(dict(knob=knob, why=why_, **kw))

    def hard_op(knob, why_, **kw):
        ops.append(dict(knob=knob, why=why_, hard=True, **kw))

    if s['edge'] < 0.85 and not tile:
        if m['edge_outline'] < 0.85:
            op('rim', f"el filo exterior no está contorneado en {1 - m['edge_outline']:.0%} del perímetro: engrosar el borde para que el contorno oscuro de 1 px cierre", add=1)
    if s['coverage'] < 0.85:
        if m['coverage'] < (0.14 if not tile else 0.5):
            op('fill', f"cobertura baja ({m['coverage']:.0%}): subir el relleno trameado (techo 24 %)", add=0.06)
            op('ticks', 'más marcas para que el área se lea de lejos', add=4)
            op('rim', 'borde más grueso para ganar presencia', add=1)
        else:
            hard_op('fill', f"cobertura alta ({m['coverage']:.0%}): bajar el relleno para no tapar al enemigo", add=-0.06)
            hard_op('ticks', 'menos marcas', add=-4)
            hard_op('tick_len', 'marcas más cortas', add=-0.04)
            hard_op('inner_ring', 'quitar el anillo interior', set=0)
            hard_op('rim', 'borde más fino: la cobertura es excesiva', add=-1)
            hard_op('sparks', 'menos chispas', add=-2)
            if m['coverage'] > 0.6:
                hard_op('glyph_on', 'quitar el glifo: la cobertura es excesiva', set=0)
            if kind == 'sector':
                hard_op('thick', 'estelas más finas', add=-1)
    if s['clear_floor'] < 0.85 and not tile and m['interior'] < 0.12:
        op('fill', f"el cuerpo de la zona casi no se ve ({m['interior']:.0%} del interior): subir el relleno trameado", add=0.06)
        op('ticks', 'más marcas internas para dar cuerpo', add=4)
    elif s['clear_floor'] < 0.85 and not tile:
        hard_op('fill', f"el centro está cargado ({m['interior']:.0%}): despejar el relleno", add=-0.09)
        hard_op('inner_ring', 'quitar el anillo interior', set=0)
        hard_op('glyph_scale', 'glifo más chico', set=1)
        hard_op('sparks', 'menos chispas: tapan el centro', add=-2)
        hard_op('ticks', 'menos marcas: tapan el centro', add=-2)
        if m['interior'] > 0.5:
            hard_op('glyph_on', 'quitar el glifo: no cabe en una zona tan chica', set=0)
        if kind == 'sector':
            hard_op('thick', 'estelas más finas: tapan el centro', add=-1)
            hard_op('ticks', 'menos estelas', add=-2)
    if s['contrast'] < 0.85:
        op('highlight_arc', 'agregar luz en el arco superior-izquierdo para separar el borde del suelo', set=1)
        op('rim', 'borde algo más grueso para que filo claro y contorno oscuro se distingan', add=1)
    if s['motion'] < 0.8 and not loop:
        if m['peak_pos'] < 0.2 or m['peak_pos'] > 0.55:
            op('impact_at', f"el pico cae en {m['peak_pos']:.0%} de la tira: llevarlo a ~30 %", set=0.30)
        if m['tail'] > 0.3:
            op('fade_to', f"el último cuadro conserva {m['tail']:.0%} del efecto: disipar del todo", set=0.0)
        if m['motion_mean'] < 0.04:
            op('spin', 'poco movimiento: el glifo debe girar en pasos de 90°', add=1)
            op('sparks', 'más chispas orbitando', add=2)
        elif m['motion_mean'] > 0.3:
            op('spin', 'demasiado parpadeo entre cuadros', add=-1)
            op('sparks', 'menos chispas', add=-2)
    if s['motion'] < 0.8 and loop:
        op('spin', 'la zona viva necesita pulso lento: girar el glifo', add=1)
        op('sparks', 'chispas orbitando para que se vea viva', add=2)
    if s['richness'] < 0.85:
        if m['interior_detail'] < 0.10 and not tile:
            op('ticks', f"poco detalle interior ({m['interior_detail']:.0%}): más marcas propias (estelas, hilos, runas)", add=4)
            if kind == 'sector':
                op('thick', 'estelas más gruesas para que se lean de lejos', add=1)
            op('tick_len', 'marcas más largas', add=0.04)
        if m['detail_mass'] < 0.1 and not tile:
            op('glyph_scale', 'el centro está vacío: glifo propio más grande', add=1)
        if tones_used < 4:
            op('highlight_arc', 'usar los 5 tonos de la rampa (falta luz o brillo)', set=1)
            op('flash', 'agregar destello de impacto', add=0.2)
        if hi_share < 0.03:
            op('sparks', 'agregar destellos brillantes (tono 5)', add=2)
        if hi_share > 0.3:
            op('sparks', 'demasiado tono de luz: menos chispas', add=-2)
    if s['hygiene'] < 0.85:
        op('ticks', f"píxeles sueltos ({m['isolated']:.0%}): menos marcas aisladas", add=-2)
        op('sparks', 'menos chispas de 1 px', add=-2)
    if others and dmin < 0.18:
        op('deco', f"se parece demasiado a otra habilidad del guardián (distancia {dmin:.2f}): cambiar el tipo de marca", add=1)
        op('inner_ring', 'segundo anillo para distinguirla', set=1)
    if s['palette'] < 0.85 or s['alpha'] < 1:
        op('flash', 'los efectos de brillo deben salir de la rampa y con alfa 0/255 (revisar capa de destello)', set=0.2)

    return dict(kind=kind, score=total, points=pts, metrics={k: v for k, v in m.items() if k != 'signature'}, hard_fails=hard,
                ops=ops, signature=sig.tolist(), criteria={k: round(float(np.clip(v, 0, 1)), 3) for k, v in s.items()},
                baseline_total=baseline_total, baseline_criteria=baseline_criteria, baseline_metrics=baseline_metrics)


def _signature(f):
    """Firma 16 bins (8 radiales + 8 angulares) de la densidad opaca del cuadro pico, normalizada."""
    H, W = f.shape[:2]
    op = _opaque(f)
    ys, xs = np.mgrid[0:H, 0:W]
    c = W / 2.0
    d = np.hypot(xs + .5 - c, ys + .5 - c) / (W / 2)
    a = (np.arctan2(ys + .5 - c, xs + .5 - c) + math.pi) / math.tau
    rb = np.histogram(d[op], bins=8, range=(0, 1))[0].astype(float)
    ab = np.histogram(a[op], bins=8, range=(0, 1))[0].astype(float)
    v = np.concatenate([rb / max(1, rb.sum()), ab / max(1, ab.sum())])
    return v / max(1e-9, v.sum())


def verdict(rep, has_baseline):
    reasons = list(rep['hard_fails'])
    for k, w in WEIGHTS.items():
        if rep['points'][k] < canon.MIN_CRITERION * w:
            reasons.append(f"criterio bajo: {LABEL[k]} {rep['points'][k]}/{w}")
    if rep['score'] < canon.PASS_SCORE:
        reasons.append(f"puntaje {rep['score']} < {canon.PASS_SCORE}")
    if has_baseline and rep['baseline_total'] is not None:
        gain = rep['score'] - rep['baseline_total']
        rep['improvement'] = round(gain, 1)
        need = canon.required_gain(rep['baseline_total'])
        if gain < need:
            reasons.append(f"mejora {gain:+.1f} < +{need:.1f} sobre el arte actual ({rep['baseline_total']})")
            rep['ops'].append(dict(knob='rim', why='no supera al arte actual: ganar presencia en el borde', add=1))
            rep['ops'].append(dict(knob='sparks', why='no supera al arte actual: más destellos de luz', add=2))
    bc = rep.get('baseline_criteria')
    if has_baseline and bc:
        # no-regresión: lo que el arte actual hace bien (riqueza visual, presencia) no se puede perder aunque el total suba
        for k in ('richness', 'coverage'):
            if rep['criteria'][k] + 0.02 < bc[k] and rep['criteria'][k] < 0.95:
                reasons.append(f"regresión de {LABEL[k]} frente al arte actual ({rep['criteria'][k]:.2f} < {bc[k]:.2f})")
                if k == 'coverage':
                    cv = rep['metrics'].get('coverage', 0.0)
                    lo = 0.5 if rep.get('kind') == 'beam' else 0.14
                    if cv < lo + 0.05:
                        rep['ops'] += [dict(knob='fill', why='el arte actual cubre mejor la zona: subir el relleno trameado', add=0.03),
                                       dict(knob='rim', why='el arte actual cubre mejor la zona: borde más grueso', add=1)]
                    else:
                        rep['ops'] += [dict(knob='fill', why='el arte actual cubre mejor la zona: ajustar el relleno', add=-0.03),
                                       dict(knob='sparks', why='el arte actual cubre mejor la zona: menos chispas', add=-2)]
                if k in ('richness', 'coverage'):
                    rep['ops'] += [dict(knob='motif_on', why='activar el motivo temático del guardián (el arte actual lo tiene)', set=1),
                                   dict(knob='motif_n', why='el arte actual tiene más trama temática: motivo más denso', add=1)]
                if k == 'richness':
                    rep['ops'] += [dict(knob='ticks', why='el arte actual tiene más trama interior: sumar marcas propias', add=4),
                                   dict(knob='glyph_scale', why='el arte actual tiene más presencia central: glifo más grande', add=1),
                                   dict(knob='deco', why='probar otra familia de marcas', cycle=True)]
    bm = rep.get('baseline_metrics')
    if has_baseline and bm:
        mm = rep['metrics']
        if rep['kind'] != 'beam':
            floor = 0.8 * min(bm.get('coverage', 0.0), 0.5)
            if mm['coverage'] < floor:
                reasons.append(f"presencia menor que el arte actual: cobertura {mm['coverage']:.0%} < {floor:.0%} (arte actual {bm['coverage']:.0%})")
                rep['ops'] += [dict(knob='fill', why='el arte actual tiene más cuerpo: subir el relleno trameado (techo del motor 24 %)', add=0.06),
                               dict(knob='ticks', why='el arte actual tiene más trama: sumar marcas', add=2),
                               dict(knob='rim', why='el arte actual tiene más presencia: borde más grueso', add=1)]
        elif 'jag' in mm and bm.get('jag', 0) > 0.06 and mm['jag'] < 0.7 * bm['jag']:
            reasons.append(f"silueta más plana que el arte actual: irregularidad {mm['jag']:.2f} < 70 % de {bm['jag']:.2f}")
            rep['ops'] += [dict(knob='wave', why='el arte actual zigzaguea (relámpago, hilo, tinta): dar forma irregular al rayo', add=1),
                           dict(knob='wave_amp', why='mayor amplitud de la ondulación', add=1)]
    rep['reasons'] = reasons
    rep['status'] = 'PASS' if not reasons else 'FAIL'
    # el arte actual ya es casi tope y el nuevo lo iguala: lo único que falta es el margen de mejora → no se reemplaza
    rep['keep_current'] = bool(reasons) and len(reasons) == 1 and reasons[0].startswith('mejora') and has_baseline and rep['baseline_total'] >= 94 and rep.get('improvement', -99) >= -0.5
    return rep
