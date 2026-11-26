# Lote v2 de props de arenas. Leccion del v1 (25/11): con boceto y referencia del pack de HIELO, Anakin copio la
# paleta azul (lava celeste) y en las piezas rotas invento arboles. Ahora: boceto en gris tenido con la paleta de la
# arena, referencia = arte pintado PROPIO de la arena y lista de evitar con hielo/azul/sombra.
import json
from pathlib import Path
import numpy as np
from PIL import Image
R = Path(__file__).resolve().parents[3]
O = R / 'art-source/arenas/anakin-20261125'; I = O / 'init'
BG = (150, 150, 150)
TINTE = {'inf': ((40, 22, 22), (205, 95, 45)), 'lab': ((70, 52, 32), (232, 196, 128)), 'acu': ((18, 44, 50), (120, 200, 190))}
REF = {'inf': 'assets/vfx/infernal/centro_pentagrama.png', 'lab': 'assets/vfx/laberinto/centro_medallon.png', 'acu': 'assets/vfx/acuatica/centro_templo.png'}
def tenir(src, a, out):
    im = np.asarray(Image.open(src).convert('RGB')).astype(float)
    fondo = (np.abs(im - BG).sum(-1) < 12)
    g = im.mean(-1, keepdims=True) / 255.0
    lo, hi = np.array(TINTE[a][0]), np.array(TINTE[a][1])
    t = lo + (hi - lo) * g
    t[fondo] = BG
    Image.fromarray(t.astype('uint8')).save(out); return str(out)
def ref(a):
    out = I / ('ref_%s.png' % a)
    r = Image.open(R / REF[a]).convert('RGBA'); k = min(480 / r.width, 480 / r.height)
    r = r.resize((round(r.width * k), round(r.height * k)), Image.NEAREST)
    b = Image.new('RGBA', (512, 512), BG + (255,)); b.alpha_composite(r, ((512 - r.width) // 2, (512 - r.height) // 2)); b.convert('RGB').save(out)
    return str(out)
v1 = json.load(open(O / 'lote_arenas.json', encoding='utf-8'))
NEG = ('ice, snow, frost, blue, cyan, drop shadow, cast shadow, ground plane, floor tile, background scenery, tree, waterfall, '
       'blurry, smooth gradient, photo, 3d render, text, watermark, multiple objects')
NEG_ACU = NEG.replace('blue, cyan, ', '').replace('tree, waterfall, ', '')
items = []
refs = {a: ref(a) for a in REF}
for it in v1['items']:
    a = it['id'][:3]
    base = Path(it['init']).name
    it2 = dict(it)
    it2['init'] = tenir(I / base, a, I / ('%s_%s' % (a, base)))
    it2['ref'] = refs[a]; it2['fuerza_ref'] = 0.35
    it2['fuerza'] = min(0.78, round(it['fuerza'] + 0.06, 2))
    it2['neg'] = NEG_ACU if a == 'acu' else NEG
    it2['prompt'] = it['prompt'].replace('plain flat grey background, ', 'isolated on plain flat grey background, no shadow, ')
    it2['semilla'] = 11
    items.append(it2)
json.dump({'salida': str(O / 'crudos'), 'pedido': v1['pedido'] + ' (v2: paleta propia por arena)', 'items': items}, open(O / 'lote_arenas_v2.json', 'w'), indent=1)
print(len(items))
