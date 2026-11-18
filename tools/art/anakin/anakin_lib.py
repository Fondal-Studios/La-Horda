"""Anakin: libreria de cuadros de sprite (La Horda). Ver README.md de esta carpeta.
Anakin sprite-frame library (local SD1.5 LCM + IP-Adapter, then back to the source's native pixel grid).
gen_frames(src, kind, subject, out_dir, seed) -> list of RGBA native frames (np arrays, same cell size as src).
 src: RGBA PIL image of ONE native cell (block 1), character facing right, transparent background.
 kind: 'death' (5 frames) or 'attack' (4 frames) or a custom list of poses.
"""
import os, subprocess, collections
from collections import deque
from PIL import Image, ImageFilter
import numpy as np

# Motor local de Anakin (stable-diffusion.cpp + DreamShaper 8 LCM + IP-Adapter Plus). Carpeta con motor/ y modelos/.
E = os.environ.get('ANAKIN_IMG') or os.path.join(os.path.expanduser('~'), 'neon-panel', 'pc', 'tools', 'imagenes')
BG = (128, 128, 128); CAN = 512
NEG = ('lowres, blurry, smooth gradient, 3d render, photo, realistic, text, watermark, signature, multiple characters, '
       'cropped, extra limbs, deformed, ball, sphere, extra objects, background scenery, floor tiles')
DEATH = [
    ('d1', 7, 1.00, 1.00, 0, 0.42, 'recoiling in pain, struck, leaning back'),
    ('d2', 14, 1.04, 0.92, 0, 0.42, 'staggering, badly wounded, losing balance'),
    ('d3', 0, 1.12, 0.74, 0, 0.45, 'sinking down, legs giving way, head lowered'),
    ('d4', -22, 1.16, 0.60, 0, 0.50, 'collapsing to the ground, falling over'),
    ('d5', 0, 1.30, 0.42, 0, 0.50, 'dead, slumped motionless on the ground, defeated, eyes closed'),
]
ATTACK = [
    ('a1', 10, 0.97, 1.02, -3, 0.42, 'winding up an attack, rearing back, menacing'),
    ('a2', -10, 1.06, 0.98, 4, 0.45, 'lunging forward to attack, aggressive'),
    ('a3', -14, 1.12, 0.95, 7, 0.45, 'striking hard, attacking at full extension'),
    ('a4', -4, 1.03, 1.00, 2, 0.42, 'recovering after the attack'),
]

def palette_of(img, k=96):
    a = np.array(img); px = a[a[..., 3] > 0][:, :3]
    u = np.unique(px, axis=0)
    if len(u) <= 256: return u.astype(np.int32)
    q = Image.fromarray(px.reshape(1, -1, 3).astype(np.uint8)).quantize(k, method=Image.Quantize.MEDIANCUT)
    p = np.array(q.getpalette()[:k * 3]).reshape(-1, 3); return np.unique(p, axis=0).astype(np.int32)

def pose(img, rot, sx, sy):
    img = img.resize((max(1, round(img.width * sx)), max(1, round(img.height * sy))), Image.NEAREST)
    w, h = img.size; P = max(w, h) * 2
    pad = Image.new('RGBA', (P, P), (0, 0, 0, 0)); pad.paste(img, (P // 2 - w // 2, P // 2 - h))
    if rot: pad = pad.rotate(rot, resample=Image.NEAREST, center=(P // 2, P // 2))
    return pad.crop(pad.getbbox())

def limit_mask(pre_path, grow=0.12):
    a = np.array(Image.open(pre_path).convert('RGB')).astype(int)
    m = (np.abs(a - 128).max(2) > 3)
    ys, xs = np.where(m); r = int(max(9, grow * max(ys.max() - ys.min(), xs.max() - xs.min())))
    r = r + (1 - r % 2)
    return np.array(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(min(r, 61)))) > 0

def _box(a, r):
    p = np.pad(a, r + 1, mode='edge'); c = p.cumsum(0).cumsum(1); k = 2 * r + 1
    return (c[k:, k:] - c[:-k, k:] - c[k:, :-k] + c[:-k, :-k])[:a.shape[0], :a.shape[1]] / (k * k)

def bg_mask(img, tol=9):
    h, w, _ = img.shape; f = img.astype(np.int32); sat = f.max(2) - f.min(2)
    border = np.concatenate([f[0], f[-1], f[:, 0], f[:, -1]]); B = np.median(border, 0)
    nearB = np.abs(f - B).max(2) < 34          # fondo del color que haya pintado Anakin (no siempre gris)
    grayish = (sat < 22) & (f.mean(2) > 70)
    okbg = nearB | grayish
    bg = np.zeros((h, w), bool); q = deque()
    for x in range(w):
        for y in (0, h - 1): bg[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1): bg[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft(); c = f[y, x]
        for ny, nx in ((y+1, x), (y-1, x), (y, x+1), (y, x-1)):
            if 0 <= ny < h and 0 <= nx < w and not bg[ny, nx]:
                n = f[ny, nx]
                if np.abs(n - c).max() <= tol and okbg[ny, nx]:
                    bg[ny, nx] = True; q.append((ny, nx))
    return bg

def _despur(out):
    al = out[..., 3] > 0; p = np.pad(al, 1)   # apertura 2x2: fuera hebras de 1 px de ancho
    sq = p[:-1, :-1] & p[1:, :-1] & p[:-1, 1:] & p[1:, 1:]
    keep = sq[:-1, :-1] | sq[1:, :-1] | sq[:-1, 1:] | sq[1:, 1:]
    out[al & ~keep[:al.shape[0], :al.shape[1]], 3] = 0
    for _ in range(2):   # sin puntas de 1 px ni agujeros sueltos (alfa 0/255)
        al = out[..., 3] > 0; p = np.pad(al, 1)
        nb = p[:-2, 1:-1].astype(int) + p[2:, 1:-1] + p[1:-1, :-2] + p[1:-1, 2:]
        out[al & (nb <= 1), 3] = 0
        hole = (~al) & (nb >= 3)
        if hole.any():
            pr = np.pad(out, ((1, 1), (1, 1), (0, 0)))
            for dy, dx in ((0, 1), (2, 1), (1, 0), (1, 2)):
                src = pr[dy:dy + out.shape[0], dx:dx + out.shape[1]]
                m = hole & (src[..., 3] > 0) & (out[..., 3] == 0)
                out[m] = src[m]
    return out

def to_native(path, S, pal, outline, pre=None):
    img = np.array(Image.open(path).convert('RGB')); fg = ~bg_mask(img)
    if pre is not None:
        fg &= limit_mask(pre)
        a = np.array(Image.open(pre).convert('RGB')).astype(int); own = np.abs(a - 128).max(2) > 3
        g = img.astype(np.float64).mean(2); std = np.sqrt(np.maximum(0, _box(g * g, 3) - _box(g, 3) ** 2))
        fg &= ~((~own) & (std < 7))   # fuera de la silueta original, lo liso es fondo/piso pintado
    _m = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(5))
    fg &= np.array(_m) > 0   # apertura 5x5 en alta: fuera lineas de movimiento y hebras finas
    h, w = fg.shape; h3, w3 = h // S, w // S
    flat = img.reshape(-1, 3).astype(np.int32)
    idx = np.concatenate([((flat[i:i+32768, None, :] - pal[None]) ** 2).sum(2).argmin(1) for i in range(0, len(flat), 32768)]).reshape(h, w)
    out = np.zeros((h3, w3, 4), np.uint8); need = (S * S) // 2 + 1
    for y in range(h3):
        for x in range(w3):
            m = fg[y*S:(y+1)*S, x*S:(x+1)*S]
            if m.sum() >= need:
                b = idx[y*S:(y+1)*S, x*S:(x+1)*S][m]
                out[y, x, :3] = pal[collections.Counter(b.tolist()).most_common(1)[0][0]]; out[y, x, 3] = 255
    al = out[..., 3] > 0; seen = np.zeros_like(al); comps = []
    for y in range(h3):
        for x in range(w3):
            if al[y, x] and not seen[y, x]:
                comp = []; q = deque([(y, x)]); seen[y, x] = True
                while q:
                    cy, cx = q.popleft(); comp.append((cy, cx))
                    for ny, nx in ((cy+1, cx), (cy-1, cx), (cy, cx+1), (cy, cx-1)):
                        if 0 <= ny < h3 and 0 <= nx < w3 and al[ny, nx] and not seen[ny, nx]: seen[ny, nx] = True; q.append((ny, nx))
                comps.append(comp)
    if not comps: return out
    big = max(len(c) for c in comps)
    for comp in comps:
        if len(comp) < max(8, big * 0.03):
            for cy, cx in comp: out[cy, cx, 3] = 0
    out = _despur(out)
    if outline is not None:
        al = out[..., 3] > 0
        edge = al & ~(np.roll(al, 1, 0) & np.roll(al, -1, 0) & np.roll(al, 1, 1) & np.roll(al, -1, 1))
        out[edge, :3] = outline
    return out

def has_outline(cell):
    a = np.array(cell); al = a[..., 3] > 0
    edge = al & ~(np.roll(al, 1, 0) & np.roll(al, -1, 0) & np.roll(al, 1, 1) & np.roll(al, -1, 1))
    e = a[edge][:, :3].astype(int)
    if not len(e): return None
    dark = (e.sum(1) < 120).mean()
    if dark < 0.6: return None
    c = collections.Counter(map(tuple, e[e.sum(1) < 120])).most_common(1)[0][0]; return np.array(c)

def gen_frames(src, kind, subject, out_dir, seed=7, ipw=0.6, sscale=1.0, only=None, rank='game enemy'):
    os.makedirs(out_dir, exist_ok=True)
    cell = src.convert('RGBA'); CWn, CHn = cell.size
    spr = cell.crop(cell.getbbox()); a0 = np.array(cell)[..., 3] > 0
    ys, xs = np.where(a0); base = ys.max(); cx = (xs.min() + xs.max()) // 2
    pal = palette_of(cell); outl = has_outline(cell)
    S = max(1, int(470 // max(spr.width * 1.35, spr.height)))
    ref = Image.new('RGB', (spr.width * S, spr.height * S), BG); b = spr.resize(ref.size, Image.NEAREST); ref.paste(b, (0, 0), b); ref.save(f'{out_dir}/ref.png')
    poses = DEATH if kind == 'death' else ATTACK if kind == 'attack' else kind
    frames = {}
    for name, rot, sx, sy, dx, st, words in poses:
        if only and name not in only: continue
        p = pose(spr, rot, sx, sy); bb = p.resize((p.width * S, p.height * S), Image.NEAREST)
        can = Image.new('RGB', (CAN, CAN), BG); x = CAN // 2 - bb.width // 2 + dx * S; y = CAN - 30 - bb.height
        can.paste(bb, (x, y), bb); can.save(f'{out_dir}/{name}_pre.png')
        prompt = (f'pixel art sprite, dark fantasy {rank}, {subject}, {words}, limited palette, flat shading, '
                  f'plain gray background, full body, side view')
        out = f'{out_dir}/{name}_s{seed}.png'
        if not os.path.exists(out):
            cmd = [f'{E}/motor/sd-cli.exe', '--vae-tiling', '-m', f'{E}/modelos/DreamShaper8_LCM.safetensors', '-i', f'{out_dir}/{name}_pre.png',
                   '--strength', f'{min(0.7, st * sscale):.2f}', '-p', prompt, '-n', NEG, '--sampling-method', 'lcm', '--steps', '8',
                   '--cfg-scale', '1.5', '-W', '512', '-H', '512', '-s', str(seed), '--clip_vision', f'{E}/modelos/clip_vision_h.safetensors',
                   '--ip-adapter', f'{E}/modelos/ip-adapter-plus_sd15.safetensors', '--ip-adapter-image', f'{out_dir}/ref.png',
                   '--ip-adapter-strength', str(ipw), '-o', out]
            subprocess.run(cmd, cwd=f'{E}/motor', stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=600)
        if not os.path.exists(out): print('FAIL', name, flush=True); continue
        o = to_native(out, S, pal, outl, f'{out_dir}/{name}_pre.png')
        yy, xx = np.where(o[..., 3] > 0); o = o[yy.min():yy.max()+1, xx.min():xx.max()+1]
        oh, ow = o.shape[:2]
        if ow > CWn or oh > CHn:
            k = min(CWn / ow, CHn / oh); o = np.array(Image.fromarray(o).resize((max(1, int(ow*k)), max(1, int(oh*k))), Image.NEAREST)); oh, ow = o.shape[:2]
        c = np.zeros((CHn, CWn, 4), np.uint8); y0 = max(0, base - oh + 1); x0 = min(max(0, cx - ow // 2 + dx), CWn - ow)
        c[y0:y0+oh, x0:x0+ow] = o[:CHn - y0]
        Image.fromarray(c).save(f'{out_dir}/{name}_s{seed}_nat.png'); frames[name] = c
        print('ok', out_dir.split('/')[-1], name, flush=True)
    return frames
