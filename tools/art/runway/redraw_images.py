#!/usr/bin/env python3
"""Rehace imágenes sueltas de un jefe a mayor resolución nativa conservando pose y composición (el código que las compone no cambia).
Cada imagen: Runway (gen4_image, la imagen original sobre verde como referencia) -> croma -> recorte -> reducción a alto nativo (factor x, 2 por defecto)
-> paleta propia de K colores -> contorno 1 px. El original queda en art-source/runway-redraw/<carpeta>/orig/.
Uso: python3 tools/art/runway/redraw_images.py <carpeta_assets> "<descripcion en ingles>" <factor> <K> nombre1.png nombre2.png ..."""
import base64, json, os, subprocess, sys, time, shutil
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from build_sheet import key_green
from scipy import ndimage as ndi
from scipy.cluster.vq import kmeans2, vq
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
H = ['-H', 'X-Runway-Version: 2024-11-06', '-H', 'Content-Type: application/json']
def api(m, r, b=None):
    a = ['curl', '-sS', '-m', '120', '-X', m, 'https://api.dev.runwayml.com/v1' + r, *H] + (['-d', '@-'] if b else [])
    return json.loads(subprocess.run(a, input=json.dumps(b).encode() if b else None, capture_output=True).stdout)
def uri(path):
    im = Image.open(path).convert('RGBA'); sc = max(1, 600 // max(im.size)); im = im.resize((im.width * sc, im.height * sc), Image.NEAREST)
    h = max(im.height, int(im.width / 2.0)); w = max(im.width, int(im.height / 2.0))
    bg = Image.new('RGBA', (w, h), (0, 255, 0, 255)); bg.alpha_composite(im, ((w - im.width) // 2, (h - im.height) // 2)); bg.convert('RGB').save('/tmp/_ri.png')
    return 'data:image/png;base64,' + base64.b64encode(open('/tmp/_ri.png', 'rb').read()).decode()
def redraw(folder, desc, factor, K, name):
    src = os.path.join(ROOT, folder, name); keep = os.path.join(ROOT, 'art-source/runway-redraw', folder.replace('assets/', ''), 'orig'); os.makedirs(keep, exist_ok=True)
    if not os.path.exists(os.path.join(keep, name)): shutil.copy(src, os.path.join(keep, name))
    orig = os.path.join(keep, name); old = Image.open(orig).convert('RGBA')
    P = (f"Redraw this exact image as a higher resolution detailed pixel art sprite: {desc}. Keep the same pose, same composition, same colors and the same facing direction as @ref, "
         "but with more detail and finer pixels, rich shading and a crisp 1px dark outline. Single subject centered on a flat chroma green #00FF00 background. No text, no ground, no shadow.")
    for attempt in range(3):
        t = api('POST', '/text_to_image', {"model": "gen4_image", "ratio": "1280:720", "promptText": P, "referenceImages": [{"uri": uri(orig), "tag": "ref"}]})
        if 'id' not in t: print('POST', str(t)[:200]); continue
        for _ in range(60):
            r = api('GET', '/tasks/' + t['id'])
            if r['status'] in ('SUCCEEDED', 'FAILED', 'CANCELLED'): break
            time.sleep(4)
        print(name, 'intento', attempt + 1, r['status'], r.get('failure'))
        if r['status'] == 'SUCCEEDED': break
    else: return False
    raw = subprocess.run(['curl', '-sS', r['output'][0]], capture_output=True).stdout
    open(os.path.join(keep, name + '.gen.png'), 'wb').write(raw)
    rgba = key_green(Image.open(os.path.join(keep, name + '.gen.png')))
    lab, n = ndi.label(rgba[..., 3] > 0); sizes = ndi.sum(rgba[..., 3] > 0, lab, range(1, n + 1)); keepm = np.isin(lab, [i for i, z in enumerate(sizes, 1) if z >= sizes.max() * 0.02])
    rgba[..., 3] = np.where(keepm, 255, 0); ys, xs = np.where(keepm); fig = Image.fromarray(rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1], 'RGBA')
    th = max(8, int(round(old.height * factor))); tw = max(8, int(round(fig.width * th / fig.height)))
    fig = fig.resize((tw, th), Image.BOX); a = np.asarray(fig).copy(); al = a[..., 3] > 127
    flat = a[..., :3][al].astype(np.float64); rng = np.random.default_rng(3)
    cent, _ = kmeans2(flat[rng.choice(len(flat), min(40000, len(flat)), replace=False)], K, minit='++', seed=3, iter=20); idx = vq(flat, cent)[0]
    q = np.zeros_like(a); q[..., :3][al] = np.clip(cent[idx], 0, 255).astype(np.uint8); q[..., 3][al] = 255
    ring = ndi.binary_dilation(al, structure=np.ones((3, 3), bool)) & ~al; pad = np.pad(q, ((1, 1), (1, 1), (0, 0))); ring = np.pad(ring, 1) | (np.pad(al, 1) & False)
    ring = ndi.binary_dilation(np.pad(al, 1), structure=np.ones((3, 3), bool)) & ~np.pad(al, 1); pad[ring] = (14, 18, 30, 255)
    Image.fromarray(pad, 'RGBA').save(src, optimize=True); print('OK', name, old.size, '->', (pad.shape[1], pad.shape[0])); return True
if __name__ == '__main__':
    folder, desc, factor, K = sys.argv[1], sys.argv[2], float(sys.argv[3]), int(sys.argv[4])
    for nm in sys.argv[5:]: redraw(folder, desc, factor, K, nm)
