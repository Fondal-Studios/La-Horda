#!/usr/bin/env python3
"""San Martín (key 'libertador'): sheet -> clean frames -> atlases + standalone FX PNGs. (Ilkan, el campeón original que
reemplazó al anterior, ya no sale de una hoja: se genera por código con tools/art/ilkan/build.py.)

  python3 tools/art/redraw/build_se.py          # rebuild and print the JS metadata

Same pipeline as build_all.py (extract.py + build_atlas.py). Frames that face LEFT on the sheet are
mirrored so every *_side set faces right (the engine mirrors side sets for the left). Frames missing on
the sheets are NOT invented (see docs/SANMARTIN_LIBERTADOR.md): San Martín has no hit/death rows.
"""
import json, os, sys, tempfile, shutil
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, HERE)
from extract import extract
from build_atlas import build, seq
from sheets_se import LIB

SRC = os.path.join(ROOT, 'art-source', 'redraw')
OUT = lambda *p: os.path.join(ROOT, 'assets', 'sprites', 'champions', *p)

def mirror(d, names):
    for n in names:
        p = os.path.join(d, n + '.png'); Image.open(p).transpose(Image.FLIP_LEFT_RIGHT).save(p)

LIB_BODY = {
  'idle_down': seq('idle', 4), 'idle_side': ['walk_right_01'], 'idle_left': ['walk_left_01'], 'idle_up': ['walk_up_01'],
  'walk_down': seq('walk_down', 4), 'walk_side': seq('walk_right', 4), 'walk_left': seq('walk_left', 4), 'walk_up': seq('walk_up', 4),
  'attack_side': seq('fire', 4), 'cast_side': seq('command', 3),
  'aim': seq('aim', 4), 'fire': seq('fire', 4), 'reload': seq('reload', 6),
  'bayo_pre': seq('bayo_pre', 4), 'bayo_emb': seq('bayo_emb', 4), 'bayo_imp': seq('bayo_imp', 4), 'bayo_rem': seq('bayo_rem', 4),
  'command': seq('command', 5), 'cabral': seq('cabral', 5), 'ult_cast': ['ult_01'],
}
LIB_HORSE = {'mount': seq('mount', 4), 'charge': seq('charge', 5), 'dismount': seq('dismount', 4),
             'm_idle': ['mounted_01'], 'm_atk': ['mounted_02', 'mounted_03', 'mounted_04'], 'm_run': ['mounted_05', 'charge_02', 'charge_03']}
LIB_FX = ['spectral_01','spectral_02','spectral_03','spectral_04','spectral_05','buff_icon_01','buff_icon_02','buff_icon_03','buff_icon_04',
          'shot_01','blood_01','blood_02','dust_01','dust_02','dust_03','frost_01','frost_02','smoke_04']

def ghost_clean(im):
    """FX 'espectrales' (granaderos fantasma, escarcha): en la hoja están pintados semitransparentes
    sobre el damero, así que la niebla quedó mezclada con su gris. Se baja el alfa de lo gris (poca
    saturación, tono medio) y se conserva la figura azul/blanca. No agrega píxeles: solo quita."""
    import numpy as np
    a = np.array(im.convert('RGBA')).astype(np.float32)
    rgb = a[:, :, :3]; mx = rgb.max(2); chroma = mx - rgb.min(2)
    blue = rgb[:, :, 2] - (rgb[:, :, 0] + rgb[:, :, 1]) / 2
    keep = np.clip((chroma - 14) / 26, 0, 1)
    keep = np.maximum(keep, np.clip((blue - 10) / 20, 0, 1))
    keep = np.maximum(keep, np.clip((mx - 205) / 30, 0, 1))
    a[:, :, 3] = a[:, :, 3] * keep
    a[:, :, 3][a[:, :, 3] < 40] = 0
    return Image.fromarray(a.astype(np.uint8))

def fx_out(d, names, dest):
    os.makedirs(dest, exist_ok=True)
    for n in names:
        im = Image.open(os.path.join(d, n + '.png'))
        if n.startswith('spectral_') or n.startswith('frost_'): im = ghost_clean(im)
        bb = im.getbbox()
        if bb: im = im.crop(bb)
        im.save(os.path.join(dest, n + '.png'), optimize=True)

def main():
    tmp = tempfile.mkdtemp(prefix='se_')
    L = os.path.join(tmp, 'lib')
    extract(os.path.join(SRC, 'libertador.png'), LIB, L, {'light_smear': True})
    meta = {}
    for key, d, sets, ref, out in [
        ('libertador', L, LIB_BODY, 'walk_right_01', OUT('libertador', 'v2', 'atlas.png')),
        ('libertador_horse', L, LIB_HORSE, 'mounted_01', OUT('libertador', 'v2', 'horse.png'))]:
        os.makedirs(os.path.dirname(out), exist_ok=True)
        meta[key] = build(d, sets, out, ref)
    fx_out(L, LIB_FX, OUT('libertador', 'v2', 'fx'))
    shutil.rmtree(tmp)
    for k, m in meta.items(): print(k, json.dumps(m, separators=(',', ':')))

if __name__ == '__main__':
    main()
