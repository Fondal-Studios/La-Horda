"""Skins de set (art-source/skins_sets/): recorte + atlas en el formato de CHAMP_PACK.

Las 4 hojas traen la misma grilla "SPRITES BÁSICOS (8 direcciones)": 6 columnas de vista
(frente, frente diag, perfil der, espalda diag, espalda, perfil izq) x filas de estado (idle,
caminata, corrida, ataque básico, casteo, daño, muerte), UN cuadro por celda. La fila de muerte
es una secuencia (de pie -> caído -> se deshace), no direcciones.
La skin "legion" (Ilkan, Caravana de Medianoche) YA NO sale de una hoja: es arte procedural de
tools/art/ilkan/build.py. Esta herramienta conserva sus líneas de js/assets/set-skins-meta.js al regenerar.

Cada celda se recorta con la máscara u2net del motor de tools/art/hielo_jefes/extract.py; la
muerte y los golpes suman lo que brilla (partículas/filo).
Escribe assets/sprites/champions/<campeón>/skins/<set>/atlas.png 
un retrato de preview y js/assets/set-skins-meta.js (champPackLoadAtlas + SET_SKINS).
Las hojas traen columnas de vista mezcladas (izquierda mirando a la derecha, "espalda" de frente...):
los arreglos por skin (espejos, cuadros rotos, caminatas de 4 pasos) NO van acá sino en CHAMP_PACK_FIX
(js/assets/champion-sprites.js), así sobreviven a regenerar este meta. Auditoría: tools/art/skin_audit.js.
usage: python3 extract.py <frames_dir>
"""
import json, os, re, sys
import numpy as np
from PIL import Image
from scipy import ndimage
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'hielo_jefes'))
import extract as X
from build import pack, REPO
X.ROOT = os.path.join(REPO, 'art-source', 'skins_sets')

VIEWS = ['frente', 'frente_diag', 'perfil_der', 'espalda_diag', 'espalda', 'perfil_izq']
# hoja -> (set, campeón, clave del pack base, líneas de columnas (7), filas {estado: (y0, y1)}, rect del concepto, nombre)
SKINS = {
    'sylva_flecha_de_fuego': ('manada', 'cazadora', 'cazadora', [381, 444, 516, 589, 671, 748, 822],
        {'idle': (117, 187), 'walk': (187, 249), 'run': (249, 311), 'atk': (311, 373), 'cast': (373, 438), 'hit': (438, 502), 'death': (502, 581)},
        (14, 56, 312, 520), 'Sylva, Flecha de Fuego'),
    'musashi_samurai_legendario': ('errante', 'musashi', 'musashi', [381, 444, 514, 588, 669, 745, 820],
        {'idle': (119, 187), 'walk': (187, 247), 'run': (247, 307), 'atk': (307, 370), 'cast': (370, 432), 'hit': (432, 494), 'death': (494, 574)},
        (14, 60, 312, 500), 'Musashi, Samurái Legendario'),
    'axiom_skin_z': ('sistema', 'axiom', 'axiom', [431, 506, 581, 654, 727, 799, 872],
        {'idle': (119, 191), 'walk': (191, 256), 'run': (256, 321), 'atk': (321, 382), 'hit': (382, 447), 'death': (447, 529)},
        (14, 58, 358, 470), 'Axiom, Realidad Corrupta'),
    # --- segunda tanda (Mago, Profeta, Segador/berserk, Asesino, Sanadora) ---
    'profeta_angel_caido': ('profecia', 'profeta', 'profeta', [418, 487, 557, 626, 696, 766, 836],
        {'idle': (127, 191), 'walk': (191, 254), 'run': (254, 317), 'atk': (317, 381), 'cast': (381, 446), 'hit': (446, 510), 'death': (510, 574)},
        (14, 60, 340, 530), 'La Profeta, Ángel Caído (Doncella Oscura)'),
    'mago_angel_arcano': ('convergencia', 'mago', 'mago', [84, 174, 269, 363, 462, 567, 672],
        {'idle': (130, 207), 'walk': (207, 277), 'run': (277, 345), 'cast': (345, 414), 'hit': (414, 484), 'death': (484, 555)},
        (1140, 95, 1265, 268), 'Mago, Ángel Arcano (Arcángel Luminar)'),
    'segador_leonidas': ('marea', 'segador', 'segador', [393, 452, 515, 581, 645, 708, 771],
        {'idle': (117, 179), 'walk': (179, 240), 'run': (240, 301), 'atk': (301, 363), 'cast': (363, 424), 'hit': (424, 488), 'death': (488, 555)},
        (10, 58, 322, 495), 'Segador, Leónidas (Rey de Esparta)'),
    'guerrero_jack_destripador': ('nocturno', 'guerrero', 'guerrero', [388, 447, 505, 563, 621, 680, 736],
        {'idle': (120, 179), 'walk': (179, 238), 'run': (238, 298), 'atk': (298, 357), 'cast': (357, 418), 'hit': (418, 479), 'death': (479, 537)},
        (10, 58, 325, 500), 'Asesino, Jack el Destripador (Caballero Carmesí)'),
    'soporte_angel_del_alba': ('custodio', 'soporte', 'soporte', [75, 172, 268, 367, 468, 569, 670],
        {'idle': (128, 200), 'walk': (200, 276), 'run': (276, 350), 'cast': (350, 420), 'hit': (420, 490), 'death': (490, 560)},
        (1105, 95, 1235, 270), 'Sanadora, Ángel del Alba (Forma Celestial)'),
}
def cell(rgb, glow, box, glow_add=False, inset=3):
    x0, y0, x1, y1 = box; cx0, cy0, cx1, cy1 = x0 + inset, y0 + inset, x1 - inset, y1 - inset
    mk, (X0, Y0, X1, Y1) = X.u2net_mask(rgb, (cx0, cy0, cx1, cy1), pad=0)
    full = np.zeros(rgb.shape[:2], bool); full[Y0:Y1, X0:X1] = mk
    alpha = full.astype(float)
    if glow_add:   # partículas / filo que brillan: con su alfa suave
        g = np.zeros(rgb.shape[:2]); g[cy0:cy1, cx0:cx1] = glow[cy0:cy1, cx0:cx1]
        alpha = np.maximum(alpha, (g > 0.35) * g); full = full | (g > 0.35)
    lim = np.zeros_like(full); lim[cy0:cy1, cx0:cx1] = True; full &= lim
    lb, k = ndimage.label(full, X.N8)   # fuera las motas sueltas (restos del fondo de la celda)
    if k > 1:
        sizes = ndimage.sum(full, lb, range(1, k + 1)); big = sizes.max()
        full = np.isin(lb, [i + 1 for i in range(k) if sizes[i] >= max(12, big * 0.02)])
    return X.crop(rgb, alpha, full)

_pc = None
def row_split(name, rect, n, typ):
    """Fila sin grilla: separación por figuras (run_split de tools/art/pack_canon/extract.py)."""
    global _pc
    if _pc is None:
        from importlib import util
        spec = util.spec_from_file_location('pc_extract', os.path.join(HERE, '..', 'pack_canon', 'extract.py'))
        _pc = util.module_from_spec(spec); spec.loader.exec_module(_pc)
        X.ROOT = os.path.join(REPO, 'art-source', 'skins_sets')
    return [im for im, _ in _pc.run_split(name, 'x', 'y', rect, n, typ, None)]

if __name__ == '__main__':
    X.BG_PCT, X.BG_SIZE = 50, 41   # solo hace falta para el brillo (muertes/golpes); las celdas usan u2net
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    REUSE = '--reuse' in sys.argv   # reusa los recortes ya hechos en <frames_dir> (solo rearma atlas + meta)
    js = ['"use strict";', '/* GENERADO por tools/art/skins_sets/extract.py (no editar a mano).',
          '   Skins de set completo: atlas con el mismo formato que el del campeón base (CHAMP_PACK).',
          '   SET_SKINS[set].packs remapea la clave del atlas base a la de la skin (ver set-effects.js). */']
    reg, manifest = {}, []
    for name, (setId, champ, baseKey, cols, rows, concept, title) in SKINS.items():
        rgb = np.array(Image.open(os.path.join(X.ROOT, name + '.png')).convert('RGB'))   # el fondo/brillo se calcula solo si hace falta recortar
        glow = lambda: (X.sheet(name), X._cache[name + ':glow'])[1]
        frames, sets, idx = [], {}, {}
        def add(im):
            frames.append(im); return len(frames) - 1
        cellims = {}
        for st, (y0, y1) in rows.items():
            for ci, view in enumerate(VIEWS):
                fp = os.path.join(out, f'{setId}_{st}_{view}.png')
                if REUSE and os.path.exists(fp): cellims[(st, view)] = Image.open(fp).convert('RGBA'); continue
                res = cell(rgb, glow(), (cols[ci], y0, cols[ci + 1], y1), glow_add=st in ('death', 'atk', 'cast'))
                if not res: continue
                res[0].save(fp); cellims[(st, view)] = res[0]
        # recortes fallidos (u2net se quedó con un pedazo): afuera; el set usa la vista vecina
        ref = float(np.median([im.height for (st, v), im in cellims.items() if st == 'idle']))
        for key, im in cellims.items():
            if key[0] != 'death' and (im.height < ref * 0.62 or im.width < ref * 0.3):
                print('  descartado', setId, key, im.size); continue
            idx[key] = add(im)
        g = lambda st, v: [idx[(st, v)]] if (st, v) in idx else []
        for d, v in (('down', 'frente'), ('side', 'perfil_der'), ('left', 'perfil_izq'), ('up', 'espalda')):
            sets['idle_' + d] = g('idle', v)
            sets['walk_' + d] = g('walk', v) + g('run', v)          # paso corto -> paso largo
            ar = 'atk' if 'atk' in rows else 'cast'   # hojas sin fila de ataque (Mago, Sanadora): atacan con la pose de casteo
            sets['attack_' + d] = g('idle', v) + g(ar, v) + g(ar, v)   # preparación -> golpe
            if ('cast', v) in idx: sets['cast_' + d] = g('idle', v) + g('cast', v) + g('cast', v)
            sets['hit_' + d] = g('hit', v)
        sets['death_down'] = [idx[('death', v)] for v in VIEWS if ('death', v) in idx]
        sets['run'] = g('walk', 'perfil_der') + g('run', 'perfil_der')
        # estados propios del kit base que la hoja de la skin no dibuja: pose más cercana
        cast_or_atk = sets.get('cast_side') or sets['attack_side']
        if champ == 'cazadora': sets['aim'] = cast_or_atk[1:2]
        sets = {k: v for k, v in sets.items() if v}
        atlas, w, h = pack(frames, 8)
        dest = f'assets/sprites/champions/{champ}/skins/{setId}'
        os.makedirs(os.path.join(REPO, dest), exist_ok=True)
        atlas.save(os.path.join(REPO, dest, 'atlas.png'), optimize=True); manifest.append(f'{dest}/atlas.png')
        hs = sorted(frames[j].height for j in sets['walk_down'] + sets['walk_side']); refH = hs[len(hs) // 2]
        meta = {"w": w, "h": h, "cols": 8, "refH": refH, "anchor": round((h - 2) / h, 4), "sets": sets}
        key = f'skin_{setId}'
        js.append(f'champPackLoadAtlas("{key}", "{dest}/atlas.png", {json.dumps(meta, separators=(",", ":"))});')
        packs = {baseKey: key}
        # retrato (panel de concepto) para la tienda / el inventario
        prev = Image.fromarray(rgb[concept[1]:concept[3], concept[0]:concept[2]])
        prev.thumbnail((220, 320), Image.LANCZOS); prev.save(os.path.join(REPO, dest, 'preview.png'), optimize=True)
        manifest.append(f'{dest}/preview.png')
        print(setId, atlas.size, 'cell', w, h, 'refH', refH, {k: len(v) for k, v in sets.items()})
        reg[setId] = {'champ': champ, 'name': title, 'src': f'{dest}/preview.png', 'preview': f'{dest}/preview.png', 'packs': packs}
    # conserva la skin procedural de Ilkan (no sale de ninguna hoja)
    old = open(os.path.join(REPO, 'js', 'assets', 'set-skins-meta.js'), encoding='utf-8').read()
    keep = [l for l in old.split('\n') if l.startswith('champPackLoadAtlas("skin_legion') or l.startswith('// Ilkan (skin')]
    js.extend(keep)
    mreg = re.search(r'Object\.assign\(SET_SKINS, (\{.*\})\);', old, re.S)
    if mreg:
        prev = json.loads(mreg.group(1))
        if 'legion' in prev: reg['legion'] = prev['legion']
    js.append(f'Object.assign(SET_SKINS, {json.dumps(reg, ensure_ascii=False, indent=1)});')
    open(os.path.join(REPO, 'js', 'assets', 'set-skins-meta.js'), 'w').write('\n'.join(js) + '\n')
    mp = os.path.join(REPO, 'js', 'assets', 'asset-manifest.js'); m = open(mp).read()
    A, B = '  // >>> skins de set (tools/art/skins_sets/extract.py)\n', '  // <<< skins de set\n'
    block = A + ''.join(f'  "{q}",\n' for q in manifest) + B
    m = (m[:m.index(A)] + block + m[m.index(B) + len(B):]) if A in m else m.replace('const ASSET_MANIFEST = [\n', 'const ASSET_MANIFEST = [\n' + block, 1)
    open(mp, 'w').write(m)
