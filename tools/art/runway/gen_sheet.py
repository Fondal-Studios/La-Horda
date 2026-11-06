#!/usr/bin/env python3
"""Genera con Runway (gen4_image) la hoja completa de un enemigo: 3 filas x 6 cuadros sobre croma verde.
Fila 1 caminar/volar, fila 2 ataque, fila 3 quieto + golpe + muerte. Referencias: estilo (hoja ya aprobada) + diseno actual del enemigo.
Uso: python3 tools/art/runway/gen_sheet.py <arena> <tipo> "<descripcion corta en ingles>" <png_diseno> [--mode walk|fly] [--style <png>]
Escribe art-source/runway-enemies/<arena>/<tipo>/sheet_vN.png + receipt_vN.json (GENERATED_NOT_APPROVED). Evitar palabras de combate
violento en el prompt: Runway las rechaza (smash, death, shatter) sin cobrar; se usan equivalentes neutros."""
import base64, json, os, subprocess, sys, time, hashlib
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
H = ['-H', 'X-Runway-Version: 2024-11-06', '-H', 'Content-Type: application/json']
def api(m, r, b=None):
    a = ['curl', '-sS', '-m', '120', '-X', m, 'https://api.dev.runwayml.com/v1' + r, *H] + (['-d', '@-'] if b else [])
    return json.loads(subprocess.run(a, input=json.dumps(b).encode() if b else None, capture_output=True).stdout)
def green_uri(p, tmp):
    im = Image.open(p).convert('RGBA')
    if im.width < 700: im = im.resize((im.width * (700 // im.width + 1),) * 1 + (im.height * (700 // im.width + 1),), Image.NEAREST)  # chico: ampliar para que se vea
    if max(im.size) > 1000: im.thumbnail((1000, 1000), Image.NEAREST)
    h = max(im.height, int(im.width / 2.0))                 # Runway acepta como mucho 2,355 de ancho/alto: se rellena de verde
    bg = Image.new('RGBA', (im.width, h), (0, 255, 0, 255)); bg.alpha_composite(im, (0, (h - im.height) // 2)); bg.convert('RGB').save(tmp)
    return 'data:image/png;base64,' + base64.b64encode(open(tmp, 'rb').read()).decode()
def main():
    arena, tipo, desc, design = sys.argv[1:5]
    mode = sys.argv[sys.argv.index('--mode') + 1] if '--mode' in sys.argv else 'walk'
    style = sys.argv[sys.argv.index('--style') + 1] if '--style' in sys.argv else 'assets/sprites/enemies/hielo/golem_cristal/atlas.png'
    out = os.path.join(ROOT, 'art-source/runway-enemies', arena, tipo); os.makedirs(out, exist_ok=True)
    n = 1
    while os.path.exists(os.path.join(out, f'sheet_v{n}.png')): n += 1
    move = ('flying cycle, 6 frames, wings or body hovering with clearly different positions' if mode == 'fly' else 'walking cycle, 6 frames, legs alternating clearly')
    P = (f"Pixel art animation sprite sheet for a video game, same pixel art style as @style. Character: {desc}, identical design to @design in every cell. "
         "Grid of 3 rows and 6 columns of equal cells on a flat chroma green #00FF00 background, character centered, same size, feet on the same line. "
         f"Row 1: {move}. Row 2: attack animation, 6 frames, wind-up then strike then recovery. "
         "Row 3: idle breathing 2 frames, then being hit and recoiling 1 frame, then collapsing animation 3 frames ending in a small heap. "
         "Absolutely no text, no letters, no numbers, no captions, no labels, no shadow, no grid lines, no effects outside the character.")
    refs = [{"uri": green_uri(os.path.join(ROOT, style), '/tmp/_s.png'), "tag": "style"}, {"uri": green_uri(os.path.join(ROOT, design), '/tmp/_d.png'), "tag": "design"}]
    for attempt in range(3):
        body = {"model": "gen4_image", "ratio": "1280:720", "promptText": P, "referenceImages": refs if attempt < 2 else refs[:1]}
        t = api('POST', '/text_to_image', body)
        if 'id' not in t: print('POST', t); continue
        for _ in range(60):
            r = api('GET', '/tasks/' + t['id'])
            if r['status'] in ('SUCCEEDED', 'FAILED', 'CANCELLED'): break
            time.sleep(4)
        print('intento', attempt + 1, r['status'], r.get('failure'), r.get('cost'))
        if r['status'] == 'SUCCEEDED': break
    else: raise SystemExit('sin resultado')
    png = subprocess.run(['curl', '-sS', r['output'][0]], capture_output=True).stdout
    open(os.path.join(out, f'sheet_v{n}.png'), 'wb').write(png)
    json.dump({"status": "GENERATED_NOT_APPROVED", "kind": "concept", "id": tipo, "model": "gen4_image", "ratio": "1280:720", "taskId": t['id'],
               "credits": (r.get('cost') or {}).get('credits', 5), "style": style, "design": design, "prompt": P,
               "sha256": hashlib.sha256(png).hexdigest(), "note": "Requiere recorte, paleta, gates y revision de arte humana."},
              open(os.path.join(out, f'receipt_v{n}.json'), 'w'), indent=1)
    print('OK', out, f'sheet_v{n}.png')
main()
