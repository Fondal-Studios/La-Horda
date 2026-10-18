#!/usr/bin/env python3
"""LA HORDA - generador de ejemplos de referencia para el pintor (solo lectura sobre assets/, escribe en docs/art-brief/ejemplos/).

Dado un campeon (o un asset del manifiesto) recorta los cuadros de los atlas YA EXISTENTES que sirven de referencia y los
vuelca en hojas de contacto con rejilla, numero de cuadro, rotulo de fila y linea de pies. Nada se inventa: cada hoja sale
de un atlas del repo (ruta indicada en el pie de la hoja).

  python3 tools/art/gen-referencias.py --campeon segador          # su atlas actual + las referencias de cada faltante
  python3 tools/art/gen-referencias.py --asset segador.cuerpo.ataque_abajo
  python3 tools/art/gen-referencias.py --top 10                   # los 10 campeones con mas faltantes
  python3 tools/art/gen-referencias.py --todos                    # todos los campeones con faltantes
  python3 tools/art/gen-referencias.py --campeon segador --copiar-crudo   # ademas copia el atlas de referencia (sin tocar)
  python3 tools/art/gen-referencias.py --pack veyra --filas 4,5,9           # hoja suelta de un pack (filas del atlas canonico)

Entradas : docs/art-brief/manifiestos/campeones_faltantes.json (assets, referencias) y atlas_catalogo.json (celdas, sets).
Salida   : docs/art-brief/ejemplos/<campeon>/00_actual_<pack>.webp  y  <asset>__ref.webp  (WebP sin perdida, escala x2).
Requiere : Python 3 + Pillow (con WebP).  Peso: cada hoja suele pesar 20-250 KB; el total se informa al terminar.
"""
import argparse, json, os, shutil, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
MANI = ROOT / 'docs/art-brief/manifiestos'
OUT_DEF = ROOT / 'docs/art-brief/ejemplos'
BG, CELL_BG, GRID, FEET, TXT, DIM, MIRROR = (24, 26, 34), (36, 40, 54), (70, 76, 100), (80, 210, 255), (235, 235, 245), (150, 156, 176), (255, 190, 90)

# Filas del atlas canonico 448x1008 (4 columnas x 9 filas de 112 px). Fuente: docs/art-brief/00_ESPECIFICACION_TECNICA.md 2.1.2
FILAS_CANON = {1: 'caminar ABAJO (frente)', 2: 'caminar PERFIL derecha', 3: 'caminar ARRIBA (espalda)', 4: 'ataque basico ABAJO',
               5: 'ataque basico PERFIL', 6: 'ataque basico ARRIBA', 7: 'LANZAR habilidad (frente)', 8: 'DEFINITIVA (frente)', 9: 'MUERTE'}


def fuente(n=12):
    try:
        return ImageFont.load_default(size=n)
    except TypeError:  # Pillow < 10.1
        return ImageFont.load_default()


def cargar_json(nombre):
    return json.loads((MANI / nombre).read_text(encoding='utf8'))


def es_canon(p):
    return p and p.get('fw') == 112 and p.get('fh') == 112 and p.get('cols') == 4 and p.get('nw') == 448


def tomas_canon(filas):
    return [{'etiqueta': f'fila {f} · {FILAS_CANON[f]} · cuadros {(f - 1) * 4}-{(f - 1) * 4 + 3}', 'cuadros': list(range((f - 1) * 4, (f - 1) * 4 + 4))} for f in filas]


def tomas_sets(pack, nombres=None):
    """Una toma por set de animacion del pack (los nombres tal como los usa el motor)."""
    sets = pack['sets_crudos']
    out = []
    for n, arr in sets.items():
        if nombres and n not in nombres:
            continue
        out.append({'etiqueta': f'{n} · cuadros ' + ','.join(('~%d' % ~v if v < 0 else str(v)) for v in arr), 'cuadros': list(arr)})
    return out


def tomas_actual(pack):
    if es_canon(pack) and pack.get('nh') == 1008:
        return tomas_canon(range(1, 10))
    return tomas_sets(pack)


def wrap(txt, ancho, f, d):
    palabras, lin, out = txt.split(' '), '', []
    for w in palabras:
        t = (lin + ' ' + w).strip()
        if d.textlength(t, font=f) <= ancho or not lin:
            lin = t
        else:
            out.append(lin)
            lin = w
    out.append(lin)
    return out


def render(pack, tomas, escala=None, titulo='', pie='', max_por_linea=8):
    """Hoja de contacto: una fila por toma, rejilla por cuadro, numero de cuadro, linea de pies (celeste) y centro."""
    img = Image.open(ROOT / pack['src']).convert('RGBA')
    fw, fh, cols = pack['fw'], pack['fh'], pack['cols']
    n_max = min(max_por_linea, max(len(t['cuadros']) for t in tomas))
    s = escala or (2 if fw * n_max * 2 <= 1500 else 1)
    cw, ch = int(fw * s), int(fh * s)
    f12, f11 = fuente(12), fuente(11)
    LW, PAD, TOP = 230, 3, 56
    dummy = ImageDraw.Draw(Image.new('RGB', (4, 4)))
    # alto de cada toma
    lineas = []
    for t in tomas:
        k = (len(t['cuadros']) + max_por_linea - 1) // max_por_linea
        lab = wrap(t['etiqueta'], LW - 14, f12, dummy)
        lineas.append((k, lab))
    ancho = LW + n_max * (cw + PAD) + PAD
    alto = TOP + sum(k * (ch + PAD) + 8 for k, _ in lineas) + 46
    sh = Image.new('RGB', (ancho, alto), BG)
    d = ImageDraw.Draw(sh)
    d.text((10, 8), titulo, fill=TXT, font=fuente(14))
    d.text((10, 30), f'celda {fw}x{fh} px · escala x{s:g} · linea celeste = pies (fila {round(pack["anchor"] * fh)}) · numero = indice de cuadro en el atlas', fill=DIM, font=f11)
    y = TOP
    for t, (k, lab) in zip(tomas, lineas):
        for i, l in enumerate(lab):
            d.text((10, y + 4 + i * 15), l, fill=TXT if i == 0 else DIM, font=f12)
        for j, v in enumerate(t['cuadros']):
            fila_l, col_l = divmod(j, max_por_linea)
            x0, y0 = LW + col_l * (cw + PAD), y + fila_l * (ch + PAD)
            esp = v < 0
            idx = ~v if esp else v
            cx, cy = (idx % cols) * fw, (idx // cols) * fh
            cel = img.crop((cx, cy, cx + fw, cy + fh))
            if esp:
                cel = cel.transpose(Image.FLIP_LEFT_RIGHT)
            if s != 1:
                cel = cel.resize((cw, ch), Image.NEAREST if s > 1 else Image.BOX)
            d.rectangle([x0, y0, x0 + cw - 1, y0 + ch - 1], fill=CELL_BG, outline=GRID)
            yp = y0 + int(round(pack['anchor'] * ch))
            d.line([x0 + 1, yp, x0 + cw - 2, yp], fill=FEET)
            d.line([x0 + cw // 2, y0 + ch - max(4, int(8 * s)), x0 + cw // 2, y0 + ch - 2], fill=FEET)
            sh.paste(cel, (x0, y0), cel)
            d.text((x0 + 3, y0 + 2), (f'{idx} espejo' if esp else str(idx)), fill=MIRROR if esp else TXT, font=f11)
        y += k * (ch + PAD) + 8
    d.text((10, alto - 34), pie, fill=DIM, font=f11)
    d.text((10, alto - 18), 'Solo referencia de lectura: no copiar el diseno del personaje; sirve para ver pose, ritmo, escala y apoyo de pies.', fill=DIM, font=f11)
    return sh


def guardar(im, ruta, fmt):
    ruta.parent.mkdir(parents=True, exist_ok=True)
    if fmt == 'webp':
        im.save(ruta, 'WEBP', lossless=True, quality=100, method=6)
    else:
        im.save(ruta, 'PNG', optimize=True)
    return ruta.stat().st_size


def seleccionar_tomas(pack, ref):
    """ref['tomas'] explicitas, o ref['filas'] (canon), o ref['sets'] (nombres de set)."""
    if ref.get('tomas'):
        return ref['tomas']
    if ref.get('filas'):
        return tomas_canon(ref['filas'])
    if ref.get('sets'):
        return tomas_sets(pack, ref['sets'])
    return tomas_actual(pack)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--campeon'); ap.add_argument('--asset'); ap.add_argument('--top', type=int); ap.add_argument('--todos', action='store_true')
    ap.add_argument('--pack'); ap.add_argument('--filas', help='con --pack: filas canonicas separadas por coma (1-9)')
    ap.add_argument('--out', default=str(OUT_DEF)); ap.add_argument('--formato', choices=['webp', 'png'], default='webp')
    ap.add_argument('--escala', type=int); ap.add_argument('--copiar-crudo', action='store_true', help='copia el atlas de cada referencia a <out>/<campeon>/crudo/')
    ap.add_argument('--sin-actual', action='store_true', help='no generar la hoja del atlas actual del campeon')
    a = ap.parse_args()
    cat = cargar_json('atlas_catalogo.json')
    out = Path(a.out)
    ext = a.formato
    total, n = 0, 0

    if a.pack:
        p = cat['packs'][a.pack]
        tomas = tomas_canon([int(x) for x in a.filas.split(',')]) if a.filas else tomas_actual(p)
        r = out / '_sueltas' / f'{a.pack}.{ext}'
        total += guardar(render(p, tomas, a.escala, f'Pack {a.pack}', f'Fuente: {p["src"]}'), r, ext)
        print(r.relative_to(ROOT) if r.is_relative_to(ROOT) else r)
        return

    mani = cargar_json('campeones_faltantes.json')
    assets = mani['assets']
    por_c = {}
    for x in assets:
        por_c.setdefault(x['campeon'], []).append(x)
    if a.asset:
        sel = [x for x in assets if x['id'] == a.asset]
        if not sel:
            sys.exit('asset no encontrado: ' + a.asset)
        camps = [sel[0]['campeon']]
    elif a.campeon:
        if a.campeon not in por_c:
            sys.exit(f'{a.campeon}: sin faltantes en el manifiesto (campeones con faltantes: {", ".join(sorted(por_c))})')
        camps = [a.campeon]
    elif a.top:
        camps = [c for c, _ in sorted(por_c.items(), key=lambda kv: (-len(kv[1]), kv[0]))[:a.top]]
    elif a.todos:
        camps = sorted(por_c)
    else:
        ap.print_help(); return

    for c in camps:
        carpeta = out / c
        lista = [x for x in por_c[c] if (not a.asset or x['id'] == a.asset)]
        # 1) atlas actual del campeon (lo que YA existe)
        pk = mani['campeones'][c].get('pack_base')
        if not pk and not a.sin_actual and not a.asset:
            src = ROOT / mani['campeones'][c]['atlas_actual']
            if src.exists():
                im = Image.open(src).convert('RGBA')
                k = min(1.0, 900 / im.width)
                fondo = Image.new('RGBA', im.size, CELL_BG + (255,)); fondo.alpha_composite(im)
                hoja = Image.new('RGB', (int(im.width * k) + 20, int(im.height * k) + 70), BG)
                dd = ImageDraw.Draw(hoja)
                dd.text((10, 8), f'{c} · hoja ACTUAL completa (sin grilla de celdas registrada en el catalogo)', fill=TXT, font=fuente(14))
                dd.text((10, 30), f'Fuente: {mani["campeones"][c]["atlas_actual"]} ({im.width}x{im.height}) reducida x{k:.2f}. Estados nativos: ver tabla del documento.', fill=DIM, font=fuente(11))
                hoja.paste(fondo.convert('RGB').resize((int(im.width * k), int(im.height * k)), Image.BOX), (10, 56))
                r = carpeta / f'00_actual_{c}.{ext}'
                total += guardar(hoja, r, ext); n += 1
        if pk and not a.sin_actual and not a.asset:
            p = cat['packs'][pk]
            r = carpeta / f'00_actual_{pk}.{ext}'
            total += guardar(render(p, tomas_actual(p), a.escala, f'{c} · atlas ACTUAL ({pk})', f'Fuente: {p["src"]} ({p["nw"]}x{p["nh"]})'), r, ext); n += 1
        # 2) referencias de cada asset (deduplicadas por contenido)
        hechas = set()
        for x in lista:
            ref = x.get('referencia')
            if not ref or not (ref.get('pack') or ref.get('grilla')):
                continue
            if ref.get('grilla'):
                g = ref['grilla']
                p = {'src': ref['archivo'], 'fw': g['fw'], 'fh': g['fh'], 'cols': g['cols'], 'anchor': g['anchor'], 'nw': None, 'nh': None}
                tomas = g['tomas']
                esc = a.escala or g.get('escala')
            else:
                esc = a.escala
                p = cat['packs'].get(ref['pack']) if ref.get('pack') else None
                if not p or not p.get('src') or p['src'].startswith('data:'):
                    continue
                tomas = seleccionar_tomas(p, ref)
            clave = (ref['pack'], json.dumps(tomas, sort_keys=True))
            nombre = ref.get('hoja') or x['id']
            if clave in hechas:
                continue
            hechas.add(clave)
            r = carpeta / f'{nombre}__ref.{ext}'
            tit = f'{c} · {x["asset"][:70]} -> REFERENCIA: {ref["campeon"]}'
            total += guardar(render(p, tomas, esc, tit, f'Fuente: {p["src"]}  ·  {ref.get("motivo", "")}'), r, ext); n += 1
            if a.copiar_crudo:
                dst = carpeta / 'crudo' / Path(p['src']).name.replace('atlas', f'{ref["pack"]}_atlas')
                dst.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(ROOT / p['src'], dst); total += dst.stat().st_size
        print(f'{c}: ok')
    print(f'{n} hojas · {total / 1024 / 1024:.2f} MB en {out}')


if __name__ == '__main__':
    main()
