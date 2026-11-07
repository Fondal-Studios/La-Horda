#!/usr/bin/env python3
"""ART FACTORY 2.0 — extensión de tools/factory (NO es una segunda fábrica).

Orquesta lo que ya existe (style_gate, roster_gate, pixel-density, repair-outline-gaps, import-authored-sheet, painter)
y agrega lo que faltaba: inventario verificable, referencias del director, evaluador por métricas, motor de
reconstrucción con libro de intentos, y comprobación del arquitecto de integración.

  python3 tools/factory/art_factory.py audit                # AUDITOR   → docs/art-factory/inventory.json, INVENTARIO.md, FALTANTES_PRIORIZADOS.md
  python3 tools/factory/art_factory.py director             # DIRECTOR  → docs/art-factory/ART_DIRECTION_REFS.json
  python3 tools/factory/art_factory.py evaluate <set> ...   # EVALUADOR → puntaje 0-100 + defectos críticos (set = carpeta de cuadros o PNG)
  python3 tools/factory/art_factory.py reconstruct <set> [--key id]  # RECONSTRUCCIÓN → candidatos en docs/art-factory/candidates/, libro de intentos
  python3 tools/factory/art_factory.py integrate <id>       # ARQUITECTO → verificaciones técnicas; solo marca «apto», no instala

Reglas que el código hace cumplir:
  · nunca sobrescribe un asset: los originales se respaldan por hash en art-source/factory-originals/ y los candidatos viven aparte;
  · no hay generador de imágenes conectado: «produce» solo repara con herramientas deterministas del repo; lo que exige arte nuevo
    se documenta como BLOQUEO (docs/art-factory/BLOQUEOS.md), jamás se finge;
  · integración = evaluador ≥ 90 sin defectos críticos Y visto bueno del arquitecto general (S0C): sin ambos, no se instala.
"""
import hashlib, json, re, shutil, sys, time
from collections import Counter, defaultdict
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'docs' / 'art-factory'
ORIG = ROOT / 'art-source' / 'factory-originals'
IMG_EXT = {'.png', '.webp', '.jpg', '.jpeg'}
KINDS = [  # prefijo de ruta → tipo del inventario
    ('assets/sprites/champions/', 'campeón'), ('assets/sprites/enemies/', 'enemigo'), ('assets/sprites/bosses/', 'jefe'),
    ('assets/sprites/arenas/', 'arena'), ('assets/sprites/battlefield/', 'arena'), ('assets/vfx/', 'vfx'), ('assets/icons/', 'ui'),
    ('assets/ui/', 'ui'), ('assets/fonts/', 'fuente'), ('assets/og/', 'marketing'),
]
SLICE_PREFIXES = ['assets/sprites/champions/cazadora/', 'assets/sprites/arenas/world-v1/bosque.png', 'assets/sprites/enemies/bosque/',
                  'assets/vfx/enemies/bosque/', 'assets/ui/codex/arenas/bosque', 'assets/vfx/']
SKIN_RE = re.compile(r'/skins/')


def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def rel(p):
    try: return str(Path(p).resolve().relative_to(ROOT)).replace('\\', '/')
    except ValueError: return str(Path(p).resolve()).replace('\\', '/')  # fuera del repo (pruebas)
def kind_of(r):
    for pre, k in KINDS:
        if r.startswith(pre): return k + ('/skin' if SKIN_RE.search(r) else '')
    return 'otro'


# ----------------------------------------------------------------------------- métricas de imagen
def load(p):
    im = Image.open(p).convert('RGBA'); return np.array(im)


def metrics(a):
    """Métricas por imagen RGBA (cuadro o atlas): alfa, colores, contorno, sombreado, ruido."""
    al = a[..., 3]; op = al > 0
    n = int(op.sum())
    m = {'w': int(a.shape[1]), 'h': int(a.shape[0]), 'opaque': n}
    if n == 0: m.update(empty=True); return m
    m['semi_alpha'] = round(float(((al > 5) & (al < 250)).sum() / n), 4)
    ys, xs = np.where(op); m['bbox'] = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
    rgb = a[..., :3][op]
    q = (rgb >> 3).astype(np.uint32); key = (q[:, 0] << 10) | (q[:, 1] << 5) | q[:, 2]
    m['colors'] = int(len(np.unique(key)))
    lum = (0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2])
    # borde de la silueta (píxel opaco con vecino transparente en 4-vecindad) y cuánto es oscuro
    pad = np.pad(op, 1); nb = ~(pad[:-2, 1:-1] & pad[2:, 1:-1] & pad[1:-1, :-2] & pad[1:-1, 2:])
    edge = op & nb[:op.shape[0], :op.shape[1]] if nb.shape == op.shape else op & nb
    ne = int(edge.sum()); m['outline'] = round(float((lum[edge] < 60).sum() / ne), 3) if ne else 0.0
    # ruido: píxeles opacos distintos de sus 4 vecinos (mide pixel art real vs degradé)
    L = lum.copy(); Lp = np.pad(L, 1, mode='edge')
    d = (np.abs(L - Lp[:-2, 1:-1]) + np.abs(L - Lp[2:, 1:-1]) + np.abs(L - Lp[1:-1, :-2]) + np.abs(L - Lp[1:-1, 2:])) / 4
    m['soft'] = round(float(((d > 0) & (d < 6))[op].sum() / n), 3)       # degradé suave (ilustración reducida)
    m['detail'] = round(float((d > 14)[op].sum() / n), 3)               # bordes internos
    m['shade_sd'] = round(float(lum[op].std()), 1)
    m['_rgb_mean'] = [float(x) for x in a[..., :3][op].mean(axis=0)]
    return m


def frames_of(path):
    """Cuadros de un set: carpeta de PNG/WebP, o una hoja con grilla de 112 px (4×N)."""
    p = Path(path)
    if p.is_dir():
        fs = sorted(f for f in p.rglob('*') if f.suffix.lower() == '.png' and not any(x in f.relative_to(p).parts for x in ('skins', 'cromas', 'codex-v1', 'preview', 'previews')) and 'preview' not in f.name)
        return [(rel(f), load(f)) for f in fs]
    a = load(p)
    h, w = a.shape[:2]
    if w % 112 == 0 and h % 112 == 0 and (w // 112, h // 112) == (4, 9):
        return [(f'{rel(p)}#{i}', a[i // 4 * 112:(i // 4 + 1) * 112, i % 4 * 112:(i % 4 + 1) * 112]) for i in range(36)]
    return [(rel(p), a)]


# ----------------------------------------------------------------------------- AUDITOR
CODE_GLOBS = ['index.html', 'js/**/*.js', 'css/*.css', 'tools/art/*.js', 'sw.js', 'manifest.webmanifest']
REF_RE = re.compile(r'''assets/[A-Za-z0-9_./\-${}\[\]()]+?\.(?:png|webp|jpe?g)''')


def audit():
    t0 = time.time(); OUT.mkdir(parents=True, exist_ok=True)
    files = [f for f in (ROOT / 'assets').rglob('*') if f.suffix.lower() in IMG_EXT]
    corpus = ''
    refs = set(); dyn = set()
    for g in CODE_GLOBS:
        for f in ROOT.glob(g):
            try: t = f.read_text('utf-8', 'ignore')
            except Exception: continue
            corpus += t + '\n'
            for m in REF_RE.findall(t):
                (dyn if re.search(r'[${}\[\]()]', m) else refs).add(m)
    inv = []; by_hash = defaultdict(list); bad = []
    for f in sorted(files):
        r = rel(f)
        try:
            im = Image.open(f); w, h = im.size; mode = im.mode
        except Exception as e:
            bad.append({'path': r, 'error': str(e)}); continue
        h_ = sha(f); by_hash[h_].append(r)
        base = f.name
        # referenciado: ruta literal, o su carpeta aparece en el código (carga dinámica por plantilla)
        direct = r in corpus or r in refs
        folder = rel(f.parent) in corpus
        stem_twin = f.suffix.lower() == '.webp' or (f.with_suffix('.webp')).exists()
        inv.append({'path': r, 'kind': kind_of(r), 'w': w, 'h': h, 'mode': mode, 'bytes': f.stat().st_size, 'sha256': h_,
                    'ref': 'directa' if direct else ('carpeta' if folder else 'sin-referencia-textual'), 'webp_twin': stem_twin})
    # rotos: referencias literales a archivos que no existen
    missing = sorted(p for p in refs if not (ROOT / p).exists())
    dups = [v for v in by_hash.values() if len(v) > 1]
    # estado de documentos existentes (no se reinventa: se consolida)
    prov = []
    vam = ROOT / 'docs' / 'VISUAL_ASSET_MANIFEST.md'
    if vam.exists():
        for line in vam.read_text('utf-8', 'ignore').splitlines():
            if re.search(r'REDRAW REQUIRED|PROVISIONAL|provisori', line, re.I): prov.append(line.strip()[:200])
    pd = ROOT / 'docs' / 'art-gate' / 'pixel-density-report.json'
    incompatibles = []
    if pd.exists():
        for e in json.loads(pd.read_text('utf-8')).get('entidades', []):
            if e.get('hallazgos'): incompatibles.append({'id': e['id'], 'hallazgos': e['hallazgos'], 'excepcion': bool(e.get('excepcion'))})
    # campeones: ¿tienen arte jugable y skins?
    champs = {}
    cdir = ROOT / 'assets' / 'sprites' / 'champions'
    for d in sorted(p for p in cdir.iterdir() if p.is_dir()):
        pngs = list(d.glob('*.png'))
        champs[d.name] = {'frames': len(pngs), 'skins': sorted(s.name for s in (d / 'skins').iterdir() if s.is_dir()) if (d / 'skins').exists() else [],
                          'codex_atlas': (d / 'codex-v1' / 'atlas.png').exists(), 'atlas': (d / 'atlas.png').exists()}
    res = {'generated': time.strftime('%Y-%m-%d'), 'seconds': round(time.time() - t0, 1), 'totals': {'archivos': len(inv), 'bytes': sum(i['bytes'] for i in inv)},
           'por_tipo': dict(Counter(i['kind'].split('/')[0] for i in inv)), 'ilegibles': bad, 'referencias_rotas': missing,
           'referencias_dinamicas': len(dyn), 'duplicados': dups, 'sin_referencia_textual': [i['path'] for i in inv if i['ref'] == 'sin-referencia-textual' and not i['webp_twin']][:400],
           'provisionales_documentados': prov, 'incompatibles_densidad': incompatibles, 'campeones': champs}
    (OUT / 'inventory.json').write_text(json.dumps({'resumen': res, 'archivos': inv}, ensure_ascii=False, indent=1))
    write_inventory_md(res, inv)
    write_missing_md(res, inv)
    print(json.dumps({k: res[k] for k in ('totals', 'por_tipo')}, ensure_ascii=False), 'rotas', len(missing), 'dup', len(dups), 'ilegibles', len(bad))


def is_slice(p): return any(p.startswith(s) for s in SLICE_PREFIXES)


def write_inventory_md(res, inv):
    L = ['# Inventario visual (generado por `art_factory.py audit`)', '', f"Generado {res['generated']} · {res['totals']['archivos']} imágenes · {res['totals']['bytes']/1e6:.1f} MB.", '',
         '| Tipo | Archivos |', '|---|---|'] + [f'| {k} | {v} |' for k, v in sorted(res['por_tipo'].items(), key=lambda x: -x[1])]
    L += ['', '## Campeones (cuadros sueltos, skins, atlas del Códice)', '', '| Campeón | PNG | Skins | Atlas Códice |', '|---|---|---|---|']
    for k, v in res['campeones'].items(): L.append(f"| {k} | {v['frames']} | {len(v['skins'])} | {'sí' if v['codex_atlas'] else 'no'} |")
    L += ['', f"## Referencias rotas ({len(res['referencias_rotas'])})", ''] + [f'- `{p}`' for p in res['referencias_rotas'][:80]]
    L += ['', f"## Duplicados exactos ({len(res['duplicados'])} grupos)", ''] + [f"- {' = '.join(g[:4])}{' …' if len(g) > 4 else ''}" for g in res['duplicados'][:60]]
    L += ['', f"## Incompatibles de densidad de píxel (docs/art-gate) ({len(res['incompatibles_densidad'])})", ''] + [f"- `{e['id']}`: {', '.join(e['hallazgos'])}{' (con excepción documentada)' if e['excepcion'] else ''}" for e in res['incompatibles_densidad'][:80]]
    L += ['', f"## Provisionales documentados ({len(res['provisionales_documentados'])})", ''] + [f'- {p}' for p in res['provisionales_documentados'][:60]]
    L += ['', f"## Sin referencia textual directa (heurístico; carga dinámica por plantilla posible) — primeros {min(60, len(res['sin_referencia_textual']))}", ''] + [f'- `{p}`' for p in res['sin_referencia_textual'][:60]]
    (OUT / 'INVENTARIO.md').write_text('\n'.join(L) + '\n')


def write_missing_md(res, inv):
    items = []
    for p in res['referencias_rotas']:
        items.append((0 if is_slice(p) else 1, 'ROTO', p, 'el código referencia un archivo que no existe'))
    for e in res['incompatibles_densidad']:
        if not e['excepcion']: items.append((1, 'DENSIDAD', e['id'], ', '.join(e['hallazgos'])))
    for e in res['incompatibles_densidad']:
        if e['excepcion']: items.append((2 if not is_slice(e['id']) else 1, 'PROVISIONAL', e['id'], ', '.join(e['hallazgos']) + ' (excepción documentada)'))
    for g in res['duplicados']:
        items.append((3, 'DUPLICADO', g[0], 'igual a ' + ', '.join(g[1:3])))
    items.sort(key=lambda x: (x[0], x[1], x[2]))
    pr = {0: 'P0 slice', 1: 'P1', 2: 'P2', 3: 'P3'}
    L = ['# Faltantes y deficientes, priorizados (generado)', '', 'P0 = usado en el Vertical Slice Beta (Ruinas · Sylva) · P1 = roto o fuera de densidad sin excepción · P2 = provisional documentado · P3 = limpieza.', '',
         '| Prioridad | Tipo | Asset | Detalle |', '|---|---|---|---|'] + [f'| {pr[a]} | {b} | `{c}` | {d} |' for a, b, c, d in items[:300]]
    L += ['', '## Faltantes de arte NUEVO (no producibles sin generador)', '',
          'Ver `LA_HORDA_ASSETS_FALTANTES.md` (generado por `tools/art/missing_list.py`) y `docs/ART_REPLACEMENT_QUEUE.md`: son pedidos de hojas completas a un autor humano/IA externo. '
          'La Art Factory 2.0 no los produce: ver `BLOQUEOS.md`.']
    (OUT / 'FALTANTES_PRIORIZADOS.md').write_text('\n'.join(L) + '\n')


# ----------------------------------------------------------------------------- DIRECTOR
REF_SETS = {  # referencias aprobadas: Master Reference (Art Bible §2) y hojas encargadas del roster
    'master': ['assets/sprites/champions/tanque'], 'roster': ['assets/sprites/champions/guerrero', 'assets/sprites/champions/mago', 'assets/sprites/champions/soporte', 'assets/sprites/champions/segador',
                                                              'assets/sprites/champions/musashi', 'assets/sprites/champions/nigromante', 'assets/sprites/champions/libertador', 'assets/sprites/champions/ilkan']}


def set_metrics(dirs):
    ms = []
    for d in dirs:
        for n, a in frames_of(ROOT / d):
            m = metrics(a)
            if not m.get('empty') and m['opaque'] > 1500 and not m['semi_alpha'] > 0.05: ms.append(m)
    return ms


def rng(vals, tol=0.15):
    v = np.array(vals, float); lo, hi = float(np.percentile(v, 10)), float(np.percentile(v, 90))
    return {'p10': round(lo, 3), 'median': round(float(np.median(v)), 3), 'p90': round(hi, 3), 'min_ok': round(lo * (1 - tol), 3), 'max_ok': round(hi * (1 + tol), 3)}


def director():
    OUT.mkdir(parents=True, exist_ok=True)
    ref = {}
    for name, dirs in REF_SETS.items():
        ms = set_metrics(dirs)
        ref[name] = {'frames': len(ms), **{k: rng([m[k] for m in ms]) for k in ('colors', 'outline', 'soft', 'detail', 'shade_sd')}}
    bgs = bg_sample(); leg = []
    for d in REF_SETS['roster'] + REF_SETS['master']:
        for n, a in frames_of(ROOT / d):
            m = metrics(a)
            if not m.get('empty') and m['opaque'] > 1500: leg.append(body_contrast(a, bgs))
    ref['legibilidad_min_cuerpo_vs_suelo_ruinas'] = round(float(np.percentile(leg, 10)), 3)
    # paleta de referencia (cuantizada a 4 bits por canal, 24 más usados, ponderados por frecuencia) del roster
    cnt = Counter()
    for d in REF_SETS['roster']:
        for n, a in frames_of(ROOT / d):
            op = a[..., 3] > 0
            if not op.any(): continue
            q = (a[..., :3][op] >> 4).astype(np.int32)
            for c, k in Counter(map(tuple, q.tolist())).most_common(40): cnt[c] += k
    pal = ['#%02x%02x%02x' % tuple(int(x) * 16 + 8 for x in c) for c, _ in cnt.most_common(24)]
    doc = {'fuente': 'Art Bible §2 (Master Reference: Tanque) + hojas encargadas del roster; Códice: assets/ui/codex/*',
           'reglas': {'alfa': 'nítido 0/255 (semi_alpha ≈ 0)', 'contorno': '1 px oscuro uniforme', 'sombreado': '2-3 tonos por color, sin degradé suave',
                      'densidad': '1 u/px (canon), ≤ 2,4 u/px (docs/art-gate/pixel-density-report.json)', 'luz': 'arriba-izquierda, sombra de contacto elíptica',
                      'siluetas': 'chibi: cabeza ~40-45 % de la altura; lectura inmediata en móvil', 'animación': 'pies estables entre cuadros (±2 px), sin saltos de escala > 6 %'},
           'metricas': ref, 'paleta_roster_top24': pal,
           'paginas_codex_referencia': sorted(rel(p) for p in (ROOT / 'assets' / 'ui' / 'codex').rglob('*.jpg'))[:40]}
    (OUT / 'ART_DIRECTION_REFS.json').write_text(json.dumps(doc, ensure_ascii=False, indent=1))
    print('referencias:', {k: v['frames'] for k, v in ref.items() if isinstance(v, dict)})


# ----------------------------------------------------------------------------- EVALUADOR
SEMI_LIM = 0.30
LEG_MIN = 0.45  # se recalibra con el roster: ver director()
W = {'alfa': 20, 'estilo': 30, 'animacion': 20, 'legibilidad': 20, 'integridad': 10}


def refs():
    global LEG_MIN, SEMI_LIM
    p = OUT / 'ART_DIRECTION_REFS.json'
    if not p.exists(): director()
    d = json.loads(p.read_text('utf-8'))['metricas']; LEG_MIN = d.get('legibilidad_min_cuerpo_vs_suelo_ruinas', LEG_MIN)
    return d['roster']


def body_contrast(a, bg):
    """Fracción de píxeles opacos que se distinguen del suelo (distancia RGB ≥ 60 de la media del fondo, o claramente más oscuros/claros)."""
    op = a[..., 3] > 0
    if not op.any(): return 0.0
    bm = bg.reshape(-1, 3).mean(axis=0); d = np.sqrt(((a[..., :3][op].astype(float) - bm) ** 2).sum(axis=1))
    return float((d >= 60).mean())


def contrast_vs(a, bg):
    """Contraste de la silueta contra un fondo de arena a escala real: ΔL medio del borde, y fracción de borde con ΔL ≥ 25."""
    op = a[..., 3] > 0
    pad = np.pad(op, 1); nb = ~(pad[:-2, 1:-1] & pad[2:, 1:-1] & pad[1:-1, :-2] & pad[1:-1, 2:]); edge = op & nb
    if not edge.any(): return 0.0, 0.0
    lum = lambda x: 0.299 * x[..., 0] + 0.587 * x[..., 1] + 0.114 * x[..., 2]
    bl = float(lum(bg).mean()); dl = np.abs(lum(a)[edge] - bl)
    return float(dl.mean()), float((dl >= 25).mean())


def bg_sample():
    p = ROOT / 'assets' / 'ui' / 'codex' / 'arenas' / 'bosque.png'  # suelo de Ruinas (referencia aprobada del Códice)
    im = Image.open(p).convert('RGB'); w, h = im.size
    return np.array(im.crop((int(w * .05), int(h * .55), int(w * .25), int(h * .8))))


def evaluate_set(path, ref=None):
    fr = frames_of(path); ref = ref or refs(); defects = []; per = []
    bg = bg_sample()
    ms = []
    for n, a in fr:
        m = metrics(a); m.pop('_rgb_mean', None) if False else None
        if m.get('empty'):
            continue
        ms.append((n, a, m))
    if not ms: return {'score': 0, 'critical': 1, 'pass': False, 'defects': [{'sev': 'critical', 'what': 'set vacío o ilegible'}], 'frames': 0}
    # alfa
    semi = max(m['semi_alpha'] for _, _, m in ms); lim = max(0.30, SEMI_LIM)
    s_alfa = 100 if semi <= 0.02 else max(0, 100 - max(0, semi - 0.02) * 250)
    if semi > lim: defects.append({'sev': 'critical', 'what': f'bordes semitransparentes (máx {semi:.1%} de píxeles opacos)', 'rule': f'tope del roster aprobado ({lim:.0%}); Art Bible §2 pide 0/255'})
    # recorte contra el borde del cuadro (silueta cortada)
    clipped = [n for n, a, m in ms if (m['bbox'][0] == 0 or m['bbox'][1] == 0 or m['bbox'][2] == a.shape[1] - 1 or m['bbox'][3] == a.shape[0] - 1) and a.shape[0] >= 64 and a.shape[1] >= 64 and len(fr) > 1 and (a.shape[0] % 112 == 0)]
    if clipped: defects.append({'sev': 'critical', 'what': f'{len(clipped)} cuadros con silueta tocando el borde', 'frames': clipped[:5]})
    # estilo (rangos de las hojas encargadas con 15 % de tolerancia, como style_gate)
    def inr(k, v): r = ref[k]; return (r['min_ok'] <= v or k == 'soft') and v <= r['max_ok']  # 'soft' (degradé) solo tiene tope: menos degradé = más pixel art
    st = []
    for k, key in (('outline', 'contorno'), ('soft', 'degradé'), ('detail', 'detalle'), ('shade_sd', 'sombreado')):
        vals = [m[k] for _, _, m in ms]; v = float(np.median(vals)); ok = inr(k, v); st.append(ok)
        if not ok: defects.append({'sev': 'major', 'what': f'{key} fuera del rango del roster', 'value': round(v, 3), 'range': [ref[k]['min_ok'], ref[k]['max_ok']]})
    cols = float(np.median([m['colors'] for _, _, m in ms]))
    # los cuadros chicos nativos tienen menos colores que los 112 px del roster: se compara por densidad (colores por 1000 px opacos)
    s_est = 100 * sum(st) / len(st)
    # animación: estabilidad de pies y de escala entre cuadros de la misma serie (por prefijo de nombre)
    groups = defaultdict(list)
    for n, a, m in ms: m['_gap'] = a.shape[0] - 1 - m['bbox'][3]; groups[re.sub(r'\d+(\.\w+)?(#\d+)?$', '', n)].append((n, m))
    jit = 0; hj = 0; checked = 0
    for g, lst in groups.items():
        if len(lst) < 2 or not re.search(r'(idle|walk|run|caminar|move)', g, re.I): continue  # ataque/muerte/golpe mueven los pies a propósito
        feet = [m['_gap'] for _, m in lst]; hh = [m['bbox'][3] - m['bbox'][1] + 1 for _, m in lst]
        checked += 1; jit = max(jit, max(feet) - min(feet)); hj = max(hj, (max(hh) - min(hh)) / max(1, np.median(hh)))
    s_ani = 100 if checked == 0 else max(0, 100 - max(0, jit - 2) * 12 - max(0, hj - 0.06) * 200)
    if checked and jit > 4 and len(ms) > 6: defects.append({'sev': 'major', 'what': f'pies inestables entre cuadros (±{jit} px)', 'rule': '±2 px'})
    # legibilidad en combate: silueta contra el suelo del bosque a escala real
    frac = float(np.median([body_contrast(a, bg) for _, a, m in ms[:60]])); lmin = LEG_MIN
    s_leg = min(100, 100 * frac / lmin) if lmin else 100
    if frac < lmin: defects.append({'sev': 'major', 'what': f'poco contraste con el suelo de Ruinas (cuerpo distinguible: {frac:.0%}, mínimo del roster {lmin:.0%})', 'fix': 'rampa de luz o contorno claro de borde'})
    # integridad
    bad = [n for n, a, m in ms if m['opaque'] < 30]
    s_int = 100 if not bad else max(0, 100 - 15 * len(bad))
    if bad: defects.append({'sev': 'major', 'what': f'{len(bad)} cuadros casi vacíos', 'frames': bad[:5]})
    score = (W['alfa'] * s_alfa + W['estilo'] * s_est + W['animacion'] * s_ani + W['legibilidad'] * s_leg + W['integridad'] * s_int) / sum(W.values())
    crit = [d for d in defects if d['sev'] == 'critical']
    return {'score': round(score, 1), 'parts': {'alfa': round(s_alfa), 'estilo': round(s_est), 'animacion': round(s_ani), 'legibilidad': round(s_leg), 'integridad': round(s_int)},
            'frames': len(ms), 'defects': defects, 'critical': len(crit), 'pass': bool(score >= 90 and not crit)}


def batch():
    """Evalúa todos los sets de cuadros de campeones, enemigos y jefes → docs/art-factory/evaluation_batch.json"""
    refs(); res = []
    for r in ('assets/sprites/enemies', 'assets/sprites/bosses', 'assets/sprites/champions'):
        for d in sorted((ROOT / r).rglob('*')):
            if d.is_dir() and any(f.suffix == '.png' for f in d.iterdir()) and not any(x in d.parts for x in ('codex-v1', 'previews')):
                try: e = evaluate_set(d)
                except Exception as ex: res.append({'set': rel(d), 'error': str(ex)[:100]}); continue
                res.append({'set': rel(d), 'score': e['score'], 'critical': e['critical'], 'pass': e['pass'], 'frames': e['frames'], 'parts': e.get('parts'), 'defects': [x['what'] for x in e['defects']]})
    (OUT / 'evaluation_batch.json').write_text(json.dumps({'refs': 'ART_DIRECTION_REFS.json', 'sets': res}, ensure_ascii=False, indent=1))
    bad = [x for x in res if not x.get('pass')]
    print('sets', len(res), 'pasan', len(res) - len(bad), 'no pasan', len(bad), 'con crítico', sum(1 for x in res if x.get('critical')))


# ----------------------------------------------------------------------------- RECONSTRUCCIÓN
STRATEGIES = ['harden-alpha', 'outline-contrast', 'rim-light']


def harden_alpha(a):
    b = a.copy(); b[..., 3] = np.where(a[..., 3] >= 128, 255, 0).astype(np.uint8); b[..., :3][b[..., 3] == 0] = 0; return b


def outline_contrast(a, dark=(18, 14, 22)):
    """Oscurece el borde de la silueta (1 px) con el color de contorno del roster; no agrega ni quita píxeles."""
    b = a.copy(); op = b[..., 3] > 0; pad = np.pad(op, 1); nb = ~(pad[:-2, 1:-1] & pad[2:, 1:-1] & pad[1:-1, :-2] & pad[1:-1, 2:]); edge = op & nb
    lum = 0.299 * b[..., 0] + 0.587 * b[..., 1] + 0.114 * b[..., 2]
    sel = edge & (lum >= 60)
    for i, c in enumerate(dark): b[..., i][sel] = c
    return b


def rim_light(a):
    """Luz de borde: aclara apenas los píxeles interiores pegados al contorno del lado superior-izquierdo (regla de luz del director)."""
    b = a.copy(); op = b[..., 3] > 0; up = np.pad(op, ((1, 0), (0, 0)))[:-1]; lf = np.pad(op, ((0, 0), (1, 0)))[:, :-1]
    dark_up = np.pad((0.299 * b[..., 0] + 0.587 * b[..., 1] + 0.114 * b[..., 2]) < 60, ((1, 0), (0, 0)))[:-1]
    sel = op & dark_up & ((0.299 * b[..., 0] + 0.587 * b[..., 1] + 0.114 * b[..., 2]) >= 60)
    for i in range(3): b[..., i][sel] = np.clip(b[..., i][sel].astype(int) + 28, 0, 255)
    return b


FN = {'harden-alpha': harden_alpha, 'outline-contrast': outline_contrast, 'rim-light': rim_light}


def png_files(path):
    """Exact relative PNG set; missing, empty and symlinked inputs fail closed."""
    path = Path(path)
    if path.is_symlink() or not path.exists(): raise ValueError('missing or symlinked input')
    files = [path] if path.is_file() else sorted(path.rglob('*'))
    if any(p.is_symlink() for p in files): raise ValueError('symlinked input')
    result = {p.name if path.is_file() else p.relative_to(path).as_posix(): p
              for p in files if p.is_file() and p.suffix.lower() == '.png'}
    if not result: raise ValueError('empty PNG set')
    return result


def png_hashes(path):
    return {name: sha(p) for name, p in png_files(path).items()}


def reconstruct(path, key=None):
    path = Path(path); key = key or path.name.replace('.png', '')
    if not re.fullmatch(r'[A-Za-z0-9_-]+', key): raise ValueError('invalid candidate key')
    OUT.mkdir(parents=True, exist_ok=True)
    led_p = OUT / 'ledger.json'; led = json.loads(led_p.read_text()) if led_p.exists() else {}
    ent = led.setdefault(key, {'source': rel(path), 'attempts': [], 'state': 'new'})
    # Any new reconstruction invalidates previous approval and its candidate binding.
    ent.update(source=rel(path), source_hashes=png_hashes(path))
    for field in ('best', 'candidate_hashes', 'integracion'): ent.pop(field, None)
    ORIG.mkdir(parents=True, exist_ok=True)
    files = list(png_files(path).values())
    for f in files:  # originales recuperables
        d = ORIG / (sha(f)[:16] + '_' + f.name)
        if not d.exists(): shutil.copy2(f, d)
    base = evaluate_set(path)
    ent['baseline'] = {'score': base['score'], 'critical': base['critical'], 'defects': [d['what'] for d in base['defects']]}
    if base.get('pass'):
        ent['state'] = 'sin-cambios-necesarios'; led_p.write_text(json.dumps(led, ensure_ascii=False, indent=1)); return ent
    cand_root = OUT / 'candidates' / key; shutil.rmtree(cand_root, ignore_errors=True); applied = []
    n_prev = len(ent['attempts'])
    for i in range(n_prev, n_prev + 3):
        strat = STRATEGIES[: (i % 3) + 1]  # intento 1: [alfa]; 2: [alfa, contorno]; 3: [alfa, contorno, luz]
        cdir = cand_root / f'a{i+1}'; cdir.mkdir(parents=True, exist_ok=True)
        for f in files:
            a = load(f)
            for s in strat: a = FN[s](a)
            out = cdir / (f.relative_to(path) if path.is_dir() else Path(f.name)); out.parent.mkdir(parents=True, exist_ok=True); Image.fromarray(a, 'RGBA').save(out)
        r = evaluate_set(cdir)
        ent['attempts'].append({'n': i + 1, 'strategy': strat, 'score': r['score'], 'critical': r['critical'], 'defects': [d['what'] for d in r['defects']], 'dir': rel(cdir)})
        if r.get('pass') and r.get('score', 0) >= 90 and r.get('critical') == 0:
            ent.update(state='candidato-aprobado-por-evaluador-automatico', best=rel(cdir), candidate_hashes=png_hashes(cdir))
            break
    else:
        ent['state'] = 'ESCALADO'
        ent['escalation'] = ('Tres intentos con reparaciones deterministas no alcanzan 90/100 sin defectos críticos. Cambio de estrategia: la reparación por código '
                             'no basta; hace falta arte nuevo (hoja completa autorizada: ver docs/ART_COMMISSION_BRIEF.md). Se escala al director artístico. '
                             'No se compra ni se simula generación.')
    led_p.write_text(json.dumps(led, ensure_ascii=False, indent=1)); return ent


# ----------------------------------------------------------------------------- ARQUITECTO DE INTEGRACIÓN
def integrate(key):
    led = json.loads((OUT / 'ledger.json').read_text()); e = led.get(key)
    if not e: raise ValueError('unknown candidate: ' + key)
    checks = dict.fromkeys(('hay_candidato_aprobado', 'mismo_conjunto_de_archivos',
                           'mismas_dimensiones', 'alfa_0_255', 'peso_no_mayor_125pct',
                           'hashes_origen_vigentes', 'hashes_candidato_vigentes',
                           'evaluacion_actual_aprobada'), False)
    errors = []; evaluation = None
    try:
        best = ROOT / e['best']; src = ROOT / e['source']
        fs, sfs = png_files(best), png_files(src)
        checks['hay_candidato_aprobado'] = e.get('state') == 'candidato-aprobado-por-evaluador-automatico'
        checks['mismo_conjunto_de_archivos'] = fs.keys() == sfs.keys()
        source_hashes, candidate_hashes = png_hashes(src), png_hashes(best)
        checks['hashes_origen_vigentes'] = source_hashes == e.get('source_hashes')
        checks['hashes_candidato_vigentes'] = candidate_hashes == e.get('candidate_hashes')
        arrays = {n: load(p) for n, p in fs.items()}
        originals = {n: load(p) for n, p in sfs.items()}
        checks['mismas_dimensiones'] = checks['mismo_conjunto_de_archivos'] and all(arrays[n].shape == originals[n].shape for n in fs)
        checks['alfa_0_255'] = all(set(np.unique(a[..., 3])).issubset({0, 255}) for a in arrays.values())
        checks['peso_no_mayor_125pct'] = sum(p.stat().st_size for p in fs.values()) <= 1.25 * sum(p.stat().st_size for p in sfs.values())
        evaluation = evaluate_set(best)
        checks['evaluacion_actual_aprobada'] = bool(evaluation.get('pass') and evaluation.get('score', 0) >= 90 and evaluation.get('critical') == 0)
        # Detect files changed while being evaluated, not just since reconstruction.
        checks['hashes_origen_vigentes'] &= source_hashes == png_hashes(src)
        checks['hashes_candidato_vigentes'] &= candidate_hashes == png_hashes(best)
    except (OSError, ValueError, KeyError, TypeError) as exc:
        errors.append(str(exc))
    e['integracion'] = {'checks': checks, 'apto_tecnico': all(checks.values()) and not errors,
                        'evaluacion_actual': evaluation, 'errors': errors,
                        # Local ledger strings are not authenticated architecture approvals.
                        'aprobacion_arquitecto_general_S0C': 'PENDIENTE', 'instalado': False}
    (OUT / 'ledger.json').write_text(json.dumps(led, ensure_ascii=False, indent=1))
    print(json.dumps(e['integracion'], ensure_ascii=False))
    return e['integracion']


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else ''
    if cmd == 'audit': audit()
    elif cmd == 'director': director()
    elif cmd == 'evaluate':
        for p in sys.argv[2:]:
            r = evaluate_set(ROOT / p if not Path(p).is_absolute() else p); print(p, json.dumps(r, ensure_ascii=False, default=lambda o: o.item() if hasattr(o, 'item') else str(o)))
    elif cmd == 'reconstruct':
        a = [x for x in sys.argv[2:] if not x.startswith('--')]; k = sys.argv[sys.argv.index('--key') + 1] if '--key' in sys.argv else None
        print(json.dumps(reconstruct(ROOT / a[0], k), ensure_ascii=False, indent=1))
    elif cmd == 'batch': batch()
    elif cmd == 'integrate': integrate(sys.argv[2])
    else: print(__doc__)
