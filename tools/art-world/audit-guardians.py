#!/usr/bin/env python3
"""Auditoría de arte de guardianes: sprite del juego vs sprite «FRENTE» del Códice.
Lee el MAPEO REAL de atlas y de cuadros desde js/**/*.js (champPackLoadAtlas("<id>", "<ruta>", {meta})), no adivina rutas.
Salida: láminas de cotejo + JSON con distancia de paleta (deriva de color/identidad; NO mide detalle ni animación).
  python3 tools/art-world/audit-guardians.py <carpeta_salida>
"""
import glob, json, os, re, sys
import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')) + '/'
OUT = (sys.argv[1] if len(sys.argv) > 1 else '/tmp/audit-guardians').rstrip('/') + '/'
os.makedirs(OUT, exist_ok=True)

def load_packs():
    packs = {}
    dec = json.JSONDecoder()
    for f in glob.glob(ROOT + 'js/**/*.js', recursive=True):
        s = open(f, encoding='utf-8', errors='ignore').read()
        for m in re.finditer(r'champPackLoadAtlas\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*', s):
            try:
                meta, _ = dec.raw_decode(s[m.end():])
            except Exception:
                continue
            packs.setdefault(m.group(1), (m.group(2), meta))
    return packs

PACKS = load_packs()
IDS = sorted(os.path.basename(f)[:-4] for f in glob.glob(ROOT + 'assets/ui/codex/champions/*.png'))

def first_idle_frame(cid):
    """Cuadro idle_down[0] del atlas que REALMENTE usa el juego."""
    if cid not in PACKS:
        return None, None, None
    path, meta = PACKS[cid]
    im = Image.open(ROOT + path).convert('RGBA')
    w, h, cols = meta.get('w'), meta.get('h'), meta.get('cols')
    sets = meta.get('sets') or {}
    idx = (sets.get('idle_down') or sets.get('idle') or [0])[0]
    if not (w and h and cols):
        return im.crop((0, 0, 128, 128)), path, meta
    x, y = (idx % cols) * w, (idx // cols) * h
    return im.crop((x, y, x + w, y + h)), path, meta

def trim(im):
    bb = im.getbbox()
    return im.crop(bb) if bb else im

def pal(arr, k=12):
    im = Image.fromarray(arr.reshape(1, -1, 3).astype(np.uint8)).quantize(k, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    p = np.array(im.getpalette()[:k * 3]).reshape(-1, 3)
    idx = np.asarray(im).ravel()
    w = np.bincount(idx, minlength=k)[:len(p)] / len(idx)
    return p.astype(float), w

def chamfer(a, wa, b, wb):
    d = np.sqrt(((a[:, None, :] - b[None, :, :]) ** 2).sum(-1))
    return float((wa * d.min(1)).sum() + (wb * d.min(0)).sum()) / 2

def bg(im, h):
    b = Image.new('RGBA', im.size, (40, 36, 48, 255)); b.alpha_composite(im); b = b.convert('RGB')
    s = h / b.height
    return b.resize((max(1, int(b.width * s)), h), Image.NEAREST)

rows, metric = [], []
for c in IDS:
    cod = Image.open(ROOT + f'assets/ui/codex/champions/{c}.png').convert('RGBA')
    front = cod.crop((880, 270, 1150, 640))
    fr, path, meta = first_idle_frame(c)
    a = np.asarray(front.convert('RGB')).reshape(-1, 3).astype(int)
    m = (np.abs(a - np.array([36, 32, 30])).sum(1) > 70) & (a.sum(1) > 150)
    ca = a[m]
    if fr is None or len(ca) < 200:
        metric.append(dict(champ=c, atlas=None, paletteDist=None)); rows.append((c, front, Image.new('RGBA', (64, 64), (90, 0, 0, 255)), 'SIN ATLAS')); continue
    t = trim(fr); ra = np.asarray(t)
    rb = ra[:, :, :3][ra[:, :, 3] > 40].astype(int); rb = rb[rb.sum(1) > 150]
    pc, wc = pal(ca); pr, wr = pal(rb)
    metric.append(dict(champ=c, atlas=path.replace('assets/sprites/champions/', ''), paletteDist=round(chamfer(pc, wc, pr, wr), 1),
                       spriteH=t.size[1], opaquePx=int((ra[:, :, 3] > 40).sum()), frame=[meta.get('w'), meta.get('h')]))
    rows.append((c, front, t, path.replace('assets/sprites/champions/', '')))

H, per, cols = 170, 12, 4
for k in range(0, len(rows), per):
    chunk = rows[k:k + per]; cw = 2 * 200 + 20; rw = (len(chunk) + cols - 1) // cols
    W = Image.new('RGB', (cols * cw, rw * (H + 22)), (18, 18, 22)); d = ImageDraw.Draw(W)
    for i, (c, f, r, rel) in enumerate(chunk):
        x, y = (i % cols) * cw, (i // cols) * (H + 22)
        W.paste(bg(f, H).crop((0, 0, 200, H)), (x, y + 14)); W.paste(bg(r, H).crop((0, 0, 200, H)), (x + 205, y + 14))
        d.text((x + 2, y + 1), f'{c} [{rel}]', fill=(230, 200, 120))
    W.save(OUT + f'champs_{k // per + 1}.png')
json.dump(sorted(metric, key=lambda x: -(x['paletteDist'] if x['paletteDist'] is not None else -1)), open(OUT + 'champ_metric.json', 'w'), indent=1)
print(len(rows), 'guardianes;', len(PACKS), 'packs leídos del juego;', 'salida', OUT)
