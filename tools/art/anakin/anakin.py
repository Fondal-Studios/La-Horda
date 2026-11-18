#!/usr/bin/env python3
"""CLI de Anakin para La Horda: dibuja cuadros nuevos de un personaje a partir de UN cuadro suyo, en su misma grilla y paleta.

  python tools/art/anakin/anakin.py <clave> --fuente <atlas.png> --celda W H --indice N [--bloque 2]
         --estado death|attack --tema "descripcion en ingles del personaje" [--semilla 7] [--fidelidad 1.0]

  --fuente   atlas/hoja del juego; --celda tamano de celda en pixeles de imagen; --indice celda a usar (mirando a la derecha)
  --bloque   pixeles de imagen por pixel nativo (2 en las hojas battlefield, 1 en el resto)
  --fidelidad <1 repinta menos (mas fiel al original), >1 repinta mas (poses mas libres)
Salida: art-source/anakin/<clave>/_cand/<estado>/ con los cuadros nativos *_nat.png y las imagenes crudas.
Elegir a ojo, copiar como art-source/anakin/<clave>/<estado>_<i>.png y correr install.py (destinos en targets.json).
Necesita el motor local (variable ANAKIN_IMG, ver README.md). Costo: 0 creditos; ~40-90 s por cuadro en una GTX 1660 Ti.
"""
import argparse, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
from anakin_lib import gen_frames

ap = argparse.ArgumentParser()
ap.add_argument('clave'); ap.add_argument('--fuente', required=True); ap.add_argument('--celda', nargs=2, type=int, required=True)
ap.add_argument('--indice', type=int, default=0); ap.add_argument('--cols', type=int, default=0); ap.add_argument('--bloque', type=int, default=1)
ap.add_argument('--estado', choices=['death', 'attack'], required=True); ap.add_argument('--tema', required=True)
ap.add_argument('--semilla', type=int, default=7); ap.add_argument('--fidelidad', type=float, default=1.0)
a = ap.parse_args()
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
im = Image.open(a.fuente).convert('RGBA'); w, h = a.celda; cols = a.cols or im.width // w
x, y = (a.indice % cols) * w, (a.indice // cols) * h
cell = im.crop((x, y, x + w, y + h))
if a.bloque > 1: cell = cell.resize((w // a.bloque, h // a.bloque), Image.NEAREST)
out = os.path.join(ROOT, 'art-source', 'anakin', a.clave, '_cand', a.estado)
fr = gen_frames(cell, a.estado, a.tema, out.replace('\\', '/'), seed=a.semilla, sscale=a.fidelidad)
print(f'{len(fr)} cuadros en {out}')
