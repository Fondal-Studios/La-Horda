#!/usr/bin/env python3
"""Conector de generación de arte de la Art Factory 2.0 (OPCIONAL, apagado por defecto).

Genera HOJAS CANDIDATAS con una API de imágenes y las deja en art-source/generated/ como «no aprobadas».
Nunca instala nada en assets/: el candidato debe pasar `art_factory.py evaluate/reconstruct`, el importador
(`import-authored-sheet.py`), la revisión visual y la prueba en juego, y aprobación humana/S0C.

Seguridad y costo:
  · sin la variable de entorno de la clave NO hace nada (sale con «bloqueado: falta clave»);
  · por defecto es DRY-RUN: imprime qué pediría y cuánto costaría como máximo; para gastar hay que pasar --yes;
  · --budget-usd limita el gasto de la corrida (estimación por imagen en PRICE_USD); el libro de gasto queda en
    art-source/generated/spend-ledger.json (cada pedido, con prompt y hash del resultado);
  · la clave solo se lee de la variable de entorno; jamás se escribe a disco ni a logs.

Uso:
  export OPENAI_API_KEY=...                      # (o ART_GEN_API_KEY) — ver docs/art-factory/CONECTAR_GENERADOR.md
  python3 tools/factory/art_generator.py plan  --champion cazadora --skins 3           # solo muestra el plan
  python3 tools/factory/art_generator.py run   --champion cazadora --skins 3 --budget-usd 5 --yes
"""
import argparse, base64, hashlib, json, os, sys, time, urllib.request, urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'art-source' / 'generated'
PROVIDERS = {
    'openai': {'env': ['ART_GEN_API_KEY', 'OPENAI_API_KEY'], 'url': 'https://api.openai.com/v1/images/generations', 'model': 'gpt-image-1', 'size': '1024x1024'},
}
PRICE_USD = {'openai': 0.19}   # estimación conservadora por imagen 1024² calidad alta; confirmar en la facturación real del proveedor
STYLE = ('Pixel art de fantasía oscura moderna, estilo del juego La Horda: personaje chibi (cabeza ~40-45 % de la altura), contorno oscuro de 1 px, '
         'sombreado de 2-3 tonos por color sin degradados, paleta acotada, fondo transparente, sin texto ni marcos, hoja de poses en grilla pareja, '
         'pies alineados, vistas frente / perfil derecho / espalda. Debe parecer del mismo equipo que el Caballero (Tanque).')


def _rel(f):
    try: return str(f.relative_to(ROOT))
    except ValueError: return str(f)


def key_for(provider):
    for e in PROVIDERS[provider]['env']:
        if os.environ.get(e): return os.environ[e]
    return None


def plan(champion, skins, provider='openai'):
    items = [{'champion': champion, 'skin_index': i + 1, 'prompt': f'{STYLE} Campeón: {champion}. Skin premium {i + 1} de {skins}: diseño propio, no un recoloreo; conservar silueta y arma reconocibles.'} for i in range(skins)]
    return {'provider': provider, 'items': items, 'max_cost_usd': round(len(items) * PRICE_USD[provider], 2)}


def call_openai(prompt, key, opener=urllib.request.urlopen):
    cfg = PROVIDERS['openai']
    body = json.dumps({'model': cfg['model'], 'prompt': prompt, 'size': cfg['size'], 'background': 'transparent', 'output_format': 'png', 'n': 1}).encode()
    req = urllib.request.Request(cfg['url'], body, {'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'})
    with opener(req, timeout=180) as r: data = json.loads(r.read())
    return base64.b64decode(data['data'][0]['b64_json'])


def run(champion, skins, provider, budget, yes, opener=urllib.request.urlopen, env=None):
    p = plan(champion, skins, provider)
    key = key_for(provider)
    if not key:
        return {'estado': 'bloqueado: falta clave', 'hint': 'ver docs/art-factory/CONECTAR_GENERADOR.md', 'plan': p}
    if not yes:
        return {'estado': 'dry-run (no se gastó nada; usar --yes)', 'plan': p}
    if p['max_cost_usd'] > budget:
        return {'estado': f"rechazado: el plan puede costar hasta US$ {p['max_cost_usd']} y el presupuesto es US$ {budget}", 'plan': p}
    OUT.mkdir(parents=True, exist_ok=True)
    led_p = OUT / 'spend-ledger.json'; led = json.loads(led_p.read_text()) if led_p.exists() else []
    done = []
    for it in p['items']:
        try: png = call_openai(it['prompt'], key, opener)
        except (urllib.error.URLError, KeyError, ValueError) as e:
            led.append({'t': time.strftime('%F %T'), 'champion': champion, 'skin': it['skin_index'], 'error': type(e).__name__}); break
        f = OUT / champion / f"skin{it['skin_index']}_{hashlib.sha256(png).hexdigest()[:10]}.png"; f.parent.mkdir(parents=True, exist_ok=True); f.write_bytes(png)
        led.append({'t': time.strftime('%F %T'), 'champion': champion, 'skin': it['skin_index'], 'file': _rel(f), 'est_usd': PRICE_USD[provider], 'prompt': it['prompt'], 'estado': 'CANDIDATO_NO_APROBADO'})
        done.append(_rel(f))
    led_p.write_text(json.dumps(led, ensure_ascii=False, indent=1))
    return {'estado': 'generado (candidatos NO aprobados)', 'archivos': done, 'siguiente': 'python3 tools/factory/art_factory.py evaluate <archivo>'}


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('cmd', choices=['plan', 'run']); ap.add_argument('--champion', required=True); ap.add_argument('--skins', type=int, default=3)
    ap.add_argument('--provider', default='openai'); ap.add_argument('--budget-usd', type=float, default=0.0); ap.add_argument('--yes', action='store_true'); a = ap.parse_args()
    r = plan(a.champion, a.skins, a.provider) if a.cmd == 'plan' else run(a.champion, a.skins, a.provider, a.budget_usd, a.yes)
    print(json.dumps(r, ensure_ascii=False, indent=1))
