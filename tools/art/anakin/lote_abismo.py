# Arma el lote de cuadros clave de los monstruos del Abismo para redibujar con Anakin (boceto = cuadro actual,
# referencia de calidad = guardian tanque del Codice).
import json
from pathlib import Path
from PIL import Image
R = Path(__file__).resolve().parents[3]
O = R / 'art-source/abismo/anakin-20261125'; (O / 'init').mkdir(parents=True, exist_ok=True)
lin = [l for l in (R / 'js/assets/abismo-meta.js').read_text(encoding='utf-8').splitlines() if l.startswith('const ABISMO_ATLAS')][0]
m = json.loads(lin[lin.index('{'):].rstrip().rstrip(';'))
BG = (150, 150, 150, 255)
def frame(t, i):
    a = m[t]['meta']; im = Image.open(R / m[t]['src']).convert('RGBA')
    c = a['cols']; x, y = (i % c) * a['w'], (i // c) * a['h']; f = im.crop((x, y, x + a['w'], y + a['h'])); return f.crop(f.getbbox())
def init(t, i, out):
    f = frame(t, i); k = min(512 * 0.8 / f.width, 512 * 0.8 / f.height); f = f.resize((round(f.width * k), round(f.height * k)), Image.NEAREST)
    b = Image.new('RGBA', (512, 512), BG); b.alpha_composite(f, ((512 - f.width) // 2, 512 - f.height - 40)); b.convert('RGB').save(out)
g = Image.open(R / 'assets/sprites/champions/tanque/codex-v1/preview.png').convert('RGBA'); g = g.crop(g.getbbox()); k = 420 / g.height
g = g.resize((round(g.width * k), 420), Image.NEAREST); b = Image.new('RGBA', (512, 512), BG); b.alpha_composite(g, ((512 - g.width) // 2, 50))
ref = O / 'init/ref_guardian_tanque.png'; b.convert('RGB').save(ref)
D = {'ab_errante': 'hunched hooded void cultist wanderer, tattered dark violet robes, pale bone mask, glowing magenta eyes, clawed hands',
     'ab_acechador': 'lean crawling void stalker beast on all fours, long claws, spiky spine, bruised violet hide, glowing magenta eyes',
     'ab_heraldo': 'floating void herald priest, tall horned bone mask, flowing violet and black robes, glowing magenta orb between hands',
     'ab_devorador': 'hulking bloated void devourer brute, huge toothy maw on its belly, stony grey-violet flesh, glowing magenta cracks',
     'ab_tejedor': 'spider-like void weaver with many thin legs, bone carapace, violet thread webs, glowing magenta eyes'}
B = ('pixel art, 16-bit dark fantasy lovecraftian game enemy sprite, full body, side view facing right, chibi proportions with big readable head, '
     'clear silhouette, dark 1px outline, 2-3 flat tones per color, bruised violet, bone grey, deep teal shadows, sickly magenta glow, crisp pixel clusters, plain flat grey background, ')
items = []
for t, d in D.items():
    p = O / ('init/%s_f1.png' % t); init(t, 1, p)
    for s in (7, 21):
        items.append({'id': t + '_idle', 'prompt': B + d, 'init': str(p), 'fuerza': 0.62, 'ref': str(ref), 'fuerza_ref': 0.3, 'semilla': s})
json.dump({'salida': str(O / 'crudos'), 'pedido': 'La Horda: monstruos del Abismo con la calidad de los guardianes (pedido del doctor 25/11)', 'items': items},
          open(O / 'lote_abismo.json', 'w'), indent=1)
print(len(items))
