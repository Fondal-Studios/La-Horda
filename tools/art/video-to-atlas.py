#!/usr/bin/env python3
"""Clip de Runway (mp4, image_to_video) -> cuadros de atlas de campeon (448x1008 = 4 col x 9 filas de 112 px).

Dos subcomandos (formato: docs/art-brief/00_ESPECIFICACION_TECNICA.md 2.1 y docs/art-brief/runway-pack/POSES_CAMPEON.md):

  frames  clip.mp4 --out DIR [--mode loop|oneshot] [--height 66] [--scale S] [--pick t0,t1,t2,t3] [--ground auto|off]
      1. ffmpeg extrae todos los cuadros.  2. Quita el fondo oscuro (color de borde) y la franja de suelo (auto).
      3. Elige 4 cuadros: loop = ciclo de caminata (maxima diferencia minima entre vecinos CICLICOS, y el 4->1 empalma
         igual que los demas); oneshot = ataque/lanzar/muerte (el primero y el ultimo fijos, los 2 del medio con maxima
         diferencia).  --pick fuerza los instantes (segundos).  4. ESCALA COMUN: una sola escala para los 4 cuadros
         (y reutilizable en otros clips con --scale: sale en meta.json); nunca cuadro por cuadro.  5. Pies en la fila 105
         del cuerpo (el contorno de 1 px cae en la 106), centrado por el centroide de masa, alfa 0/255.
      Salida: DIR/cell0..3.png (112x112 RGBA, sin contorno), DIR/meta.json, DIR/strip.png (tira para revisar).
  atlas   spec.json --out DIR [--colors K]
      spec: {"rows": [9 carpetas de `frames`, o null para una fila vacia]}. Une las 36 celdas, opcionalmente reduce la
      paleta con k-means (K=0: sin reducir; el style gate del repo mide cientos de colores por cuadro, asi que NO se
      reduce por defecto), agrega el contorno oscuro de 1 px y escribe atlas.png + preview.png.
Reutiliza las ideas de tools/art/runway/build_sheet.py (escala comun, pies alineados, k-means, contorno) y de
tools/factory/import-authored-sheet.py (celda 112, pies en 106). No instala nada ni aprueba nada."""
import argparse, glob, itertools, json, os, subprocess, sys, tempfile
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

CELL, FOOT = 112, 106
OUTLINE = (16, 14, 26)


def extract(clip, tmp):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', clip, os.path.join(tmp, 'f%04d.png')], check=True)
    fps = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', clip],
                         capture_output=True, text=True, check=True).stdout.strip()
    n, d = fps.split('/')
    return sorted(glob.glob(os.path.join(tmp, 'f*.png'))), float(n) / float(d)


def longest_run(row):
    best = cur = 0
    for v in row:
        cur = cur + 1 if v else 0
        best = max(best, cur)
    return best


def key_frame(path, thr, ground):
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.int32)
    H, W = a.shape[:2]
    border = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    bg = np.median(border, 0)
    m = np.abs(a - bg).sum(2) > thr
    m = ndi.binary_opening(m, structure=np.ones((3, 3)))
    if ground == 'auto':       # suelo: se corta bajo la ultima fila de contorno MUY oscuro de los pies (la tierra es mas clara)
        dark = (a.sum(2) < 90) & m
        rows = [y for y in range(int(H * .7), H) if dark[y].sum() >= 12]
        if rows:
            yf = rows[-1]
            m[yf + 2:] = False
            # motas de tierra a los costados de las botas: bajo la mitad de las piernas solo queda lo que esta entre los contornos oscuros de las botas
            band = dark[yf - 10:yf + 1]
            xs = np.where(band.any(0))[0]
            if len(xs):
                m[yf - 28:yf + 2, :max(0, xs.min() - 8)] = False
                m[yf - 28:yf + 2, xs.max() + 8:] = False
    lab, n = ndi.label(m, structure=np.ones((3, 3)))
    if n == 0:
        return None, a
    sizes = ndi.sum(m, lab, range(1, n + 1))
    keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= sizes.max() * .08])   # el cuerpo + arma/escudo si se tocan
    keep = ndi.binary_closing(keep, structure=np.ones((5, 5)))
    keep = ndi.binary_fill_holes(keep)
    return keep, a


def signature(mask, rgb, size=48):
    """Vector para comparar cuadros: recorte al cuerpo, alineado por el centroide y pies, reducido."""
    ys, xs = np.where(mask)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    cx = xs.mean()
    img = np.zeros((size, size, 3), np.float32)
    sub = (rgb * mask[..., None])[y0:y1, x0:x1].astype(np.uint8)
    h, w = sub.shape[:2]
    k = (size - 6) / max(h, 1)
    t = Image.fromarray(sub).resize((max(1, round(w * k)), size - 6), Image.BOX)
    t = np.asarray(t).astype(np.float32)
    ox = int(round(size / 2 - (cx - x0) * k))
    for yy in range(t.shape[0]):
        for xx in range(t.shape[1]):
            X = ox + xx
            if 0 <= X < size:
                img[yy + 3, X] = t[yy, xx]
    return img.ravel()


def pick_loop(sig, step):
    idx = list(range(0, len(sig), step))
    D = np.array([[np.abs(sig[i] - sig[j]).mean() for j in idx] for i in idx])
    best, bi = -1, None
    for c in itertools.combinations(range(len(idx)), 4):
        d = [D[c[0], c[1]], D[c[1], c[2]], D[c[2], c[3]], D[c[3], c[0]]]
        # separacion minima entre vecinos ciclicos, y un cierre del bucle (4->1) no mas distinto que el resto
        score = min(d) - .5 * (max(d) - min(d))
        if score > best:
            best, bi = score, c
    return [idx[i] for i in bi], float(best)


def pick_oneshot(sig, step):
    idx = list(range(0, len(sig), step))
    if idx[-1] != len(sig) - 1:
        idx.append(len(sig) - 1)
    D = np.array([[np.abs(sig[i] - sig[j]).mean() for j in idx] for i in idx])
    last = len(idx) - 1
    best, bi = -1, None
    for a in range(1, last):
        for b in range(a + 1, last):
            d = [D[0, a], D[a, b], D[b, last]]
            score = min(d)
            if score > best:
                best, bi = score, (0, a, b, last)
    return [idx[i] for i in bi], float(best)


def to_cell(rgb, mask, scale, cx_src=None):
    ys, xs = np.where(mask)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    cx = xs.mean() if cx_src is None else cx_src
    sub_m = mask[y0:y1, x0:x1].astype(np.float32)
    sub_c = rgb[y0:y1, x0:x1].astype(np.float32) * sub_m[..., None]
    nw, nh = max(1, round((x1 - x0) * scale)), max(1, round((y1 - y0) * scale))
    m = np.asarray(Image.fromarray(sub_m).resize((nw, nh), Image.BOX))
    c = np.stack([np.asarray(Image.fromarray(sub_c[..., k]).resize((nw, nh), Image.BOX)) for k in range(3)], -1)
    a = m >= .5
    col = np.where(m[..., None] > 0, c / np.maximum(m[..., None], 1e-3), 0)   # premultiplicado: sin halo de fondo
    out = np.zeros((nh, nw, 4), np.uint8)
    out[..., :3] = np.clip(col, 0, 255).astype(np.uint8)
    out[..., 3] = a * 255
    out[~a] = 0
    # una sola silueta conectada
    lab, n = ndi.label(out[..., 3] > 0, structure=np.ones((3, 3)))
    if n > 1:
        sizes = ndi.sum(out[..., 3] > 0, lab, range(1, n + 1))
        out[lab != (np.argmax(sizes) + 1)] = 0
    ys2, xs2 = np.where(out[..., 3] > 0)
    out = out[:ys2.max() + 1]
    ox = int(round(CELL / 2 - (cx - x0) * scale))
    oy = (FOOT - 1) - (out.shape[0] - 1)          # ultima fila del cuerpo = 105; el contorno cae en la 106
    cell = np.zeros((CELL, CELL, 4), np.uint8)
    sx0, dx0 = max(0, -ox), max(0, ox)
    w = min(out.shape[1] - sx0, CELL - dx0)
    sy0, dy0 = max(0, -oy), max(0, oy)
    h = min(out.shape[0] - sy0, CELL - dy0)
    clipped = ox < 2 or oy < 2 or ox + out.shape[1] > CELL - 2
    cell[dy0:dy0 + h, dx0:dx0 + w] = out[sy0:sy0 + h, sx0:sx0 + w]
    return cell, clipped, (y1 - y0), (x1 - x0)


def cmd_frames(a):
    with tempfile.TemporaryDirectory() as tmp:
        files, fps = extract(a.clip, tmp)
        masks, rgbs, ok = [], [], []
        for f in files:
            m, rgb = key_frame(f, a.thr, a.ground)
            masks.append(m); rgbs.append(rgb)
            ok.append(m is not None and m.sum() > 500)
        if not all(ok):
            print('aviso: cuadros sin figura:', [i for i, v in enumerate(ok) if not v], file=sys.stderr)
        sig = [signature(m, r) if o else np.zeros(48 * 48 * 3, np.float32) for m, r, o in zip(masks, rgbs, ok)]
        step = a.step
        if a.pick:
            idx = [min(len(files) - 1, int(round(float(t) * fps))) for t in a.pick.split(',')]
            score = None
        else:
            idx, score = (pick_loop if a.mode == 'loop' else pick_oneshot)(sig, step)
        heights = [int(np.ptp(np.where(masks[i].any(1))[0]) + 1) for i in idx]
        scale = a.scale or a.height / float(np.median(heights))      # ESCALA COMUN: una sola para los 4 cuadros
        cells, flags, dims = [], [], []
        for i in idx:
            c, clipped, h, w = to_cell(rgbs[i], masks[i], scale)
            cells.append(c); flags.append(clipped); dims.append((h, w))
        os.makedirs(a.out, exist_ok=True)
        for k, c in enumerate(cells):
            Image.fromarray(c).save(os.path.join(a.out, f'cell{k}.png'))
        strip = Image.new('RGBA', (CELL * 4, CELL), (58, 66, 88, 255))
        for k, c in enumerate(cells):
            strip.alpha_composite(Image.fromarray(c), (k * CELL, 0))
        strip.resize((CELL * 4 * 2, CELL * 2), Image.NEAREST).save(os.path.join(a.out, 'strip.png'))
        # tira de los cuadros FUENTE elegidos (para revisar el clip)
        src = Image.new('RGB', (240 * 4, 240))
        for k, i in enumerate(idx):
            src.paste(Image.open(files[i]).resize((240, 240)), (k * 240, 0))
        src.save(os.path.join(a.out, 'source_strip.png'))
        meta = {'clip': a.clip, 'mode': a.mode, 'fps': fps, 'frames_total': len(files), 'picked': idx, 'picked_s': [round(i / fps, 2) for i in idx],
                'score': score, 'scale': scale, 'src_heights': heights, 'cell_dims_src': dims, 'clipped': flags,
                'cell_heights': [int((c[..., 3] > 0).any(1).sum()) for c in cells]}
        enc = lambda o: o.item() if hasattr(o, 'item') else str(o)
        json.dump(meta, open(os.path.join(a.out, 'meta.json'), 'w'), indent=1, default=enc)
        print(json.dumps(meta, default=enc))


def outline(cell):
    al = cell[..., 3] > 0
    ring = ndi.binary_dilation(al, structure=np.ones((3, 3), bool)) & ~al
    out = cell.copy()
    out[ring] = (*OUTLINE, 255)
    return out


def cmd_atlas(a):
    spec = json.load(open(a.spec))
    cells = []
    for r in spec['rows']:
        for c in range(4):
            if r is None:
                cells.append(np.zeros((CELL, CELL, 4), np.uint8))
            else:
                cells.append(np.asarray(Image.open(os.path.join(r, f'cell{c}.png')).convert('RGBA')))
    if a.colors:
        from scipy.cluster.vq import kmeans2, vq
        flat = np.concatenate([c[..., :3][c[..., 3] > 0] for c in cells]).astype(np.float64)
        rng = np.random.default_rng(7)
        cent, _ = kmeans2(flat[rng.choice(len(flat), min(60000, len(flat)), replace=False)], a.colors, minit='++', seed=7, iter=20)
        for c in cells:
            al = c[..., 3] > 0
            c[..., :3][al] = np.clip(cent[vq(c[..., :3][al].astype(np.float64), cent)[0]], 0, 255).astype(np.uint8)
    atlas = np.zeros((CELL * 9, CELL * 4, 4), np.uint8)
    for i, c in enumerate(cells):
        atlas[(i // 4) * CELL:(i // 4 + 1) * CELL, (i % 4) * CELL:(i % 4 + 1) * CELL] = outline(c)
    os.makedirs(a.out, exist_ok=True)
    Image.fromarray(atlas).save(os.path.join(a.out, 'atlas.png'))
    bg = Image.new('RGBA', (CELL * 4 * 2, CELL * 9 * 2), (58, 66, 88, 255))
    bg.alpha_composite(Image.fromarray(atlas).resize((CELL * 4 * 2, CELL * 9 * 2), Image.NEAREST))
    bg.save(os.path.join(a.out, 'preview.png'))
    print('atlas', os.path.join(a.out, 'atlas.png'), atlas.shape)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    s = p.add_subparsers(dest='cmd', required=True)
    f = s.add_parser('frames'); f.add_argument('clip'); f.add_argument('--out', required=True)
    f.add_argument('--mode', choices=['loop', 'oneshot'], default='loop'); f.add_argument('--height', type=float, default=66)
    f.add_argument('--scale', type=float, default=0); f.add_argument('--pick'); f.add_argument('--ground', choices=['auto', 'off'], default='auto')
    f.add_argument('--thr', type=int, default=30); f.add_argument('--step', type=int, default=3)
    f.set_defaults(fn=cmd_frames)
    t = s.add_parser('atlas'); t.add_argument('spec'); t.add_argument('--out', required=True); t.add_argument('--colors', type=int, default=0)
    t.set_defaults(fn=cmd_atlas)
    a = p.parse_args(); a.fn(a)


if __name__ == '__main__':
    main()
