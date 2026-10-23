#!/usr/bin/env python3
"""Genera las plantillas GUIA del brief de arte (docs/art-brief/00_ESPECIFICACION_TECNICA.md).

No son assets del juego: son hojas con rejilla para que el artista dibuje encima (capa de guia) y luego las
borre/oculte. Las medidas salen del codigo real citado en el documento:
  - atlas de campeon: 4 columnas x 9 filas de 112x112 (tools/expedition/build-art.py:57-59, tools/factory/import-authored-sheet.py)
  - pies en la fila 106 de cada celda (anchor 106/112 = 0,9464)
  - tira de nova de 80 px x 12 cuadros (js/champions/skill-fx-a/engine.js: SFA_NOVA_N, sfaBucket)
  - icono 16x16 (contrato del PR #119, aun no esta en main)
Uso:  python3 docs/art-brief/plantillas/generar_plantillas.py     (desde la raiz del repo; necesita Pillow)
"""
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent
BG, GRID, FEET, BODY, MARGIN, TXT = (28, 30, 40, 255), (70, 74, 96, 255), (255, 80, 80, 255), (80, 200, 120, 255), (255, 200, 60, 255), (220, 220, 230, 255)

ROWS = ['CAMINAR ABAJO', 'CAMINAR PERFIL', 'CAMINAR ARRIBA', 'ATAQUE ABAJO', 'ATAQUE PERFIL', 'ATAQUE ARRIBA', 'LANZAR', 'DEFINITIVA', 'MUERTE']


def champion_atlas():
    W, H, C = 448, 1008, 112
    im = Image.new('RGBA', (W, H), BG)
    d = ImageDraw.Draw(im)
    for r in range(9):
        for c in range(4):
            x0, y0 = c * C, r * C
            d.rectangle([x0, y0, x0 + C - 1, y0 + C - 1], outline=GRID)
            d.rectangle([x0 + 1, y0 + 1, x0 + C - 2, y0 + C - 2], outline=MARGIN)           # limite: pose dentro de x 1..110, y 1..111
            d.line([x0 + 2, y0 + 106, x0 + C - 3, y0 + 106], fill=FEET)                       # linea de pies (fila 106)
            d.line([x0 + C // 2, y0 + 100, x0 + C // 2, y0 + 111], fill=FEET)                  # centro horizontal
            d.line([x0 + 2, y0 + 106 - 64, x0 + 10, y0 + 106 - 64], fill=BODY)                 # altura 64 px (minimo recomendado)
            d.line([x0 + 2, y0 + 106 - 70, x0 + 10, y0 + 106 - 70], fill=BODY)                 # altura 70 px (maximo recomendado)
            d.text((x0 + 4, y0 + 3), f'{r * 4 + c:02d}', fill=TXT)
        d.text((4, r * C + 14), ROWS[r], fill=TXT)
        d.text((4, r * C + 26), 'col 1 = IDLE' if r < 3 else ('col 1 = GOLPE' if r < 6 else ''), fill=TXT)
    im.save(OUT / 'champion_atlas_448x1008_PLANTILLA.png')


def fx_nova():
    size, n = 80, 12
    im = Image.new('RGBA', (size * n, size), BG)
    d = ImageDraw.Draw(im)
    phases = [(0, 2, (255, 200, 60, 255), 'ANTICIPACION'), (2, 7, (255, 90, 90, 255), 'IMPACTO'), (7, 12, (110, 160, 255, 255), 'DISIPACION')]
    for a, b, col, name in phases:
        d.rectangle([a * size, 0, b * size - 1, 3], fill=col)
        d.text((a * size + 3, 6), name, fill=col)
    for f in range(n):
        x0 = f * size
        d.rectangle([x0, 0, x0 + size - 1, size - 1], outline=GRID)
        c = size / 2
        R = c - 1.5                                                                           # el borde exterior del arte = radio real
        d.ellipse([x0 + c - R, c - R, x0 + c + R, c + R], outline=FEET)
        d.line([x0 + c - 3, c, x0 + c + 3, c], fill=GRID)
        d.line([x0 + c, c - 3, x0 + c, c + 3], fill=GRID)
        d.text((x0 + 3, size - 12), f'f{f}', fill=TXT)
    im.save(OUT / 'fx_nova_80x12f_960x80_PLANTILLA.png')


def icon16():
    S, K = 16, 16
    im = Image.new('RGBA', (S * K * 3 + 40, S * K + 20), BG)
    d = ImageDraw.Draw(im)
    for i, (name, col, corners) in enumerate([('basico', (224, 146, 79, 255), True), ('habilidad', (159, 180, 204, 255), False), ('definitiva', (255, 211, 90, 255), True)]):
        ox = 10 + i * (S * K + 10)
        for y in range(S):
            for x in range(S):
                edge = x in (0, S - 1) or y in (0, S - 1)
                cut = name == 'habilidad' and (x, y) in ((0, 0), (S - 1, 0), (0, S - 1), (S - 1, S - 1))
                if edge and not cut:
                    d.rectangle([ox + x * K, 10 + y * K, ox + x * K + K - 1, 10 + y * K + K - 1], fill=col)
                elif not edge:
                    d.rectangle([ox + x * K, 10 + y * K, ox + x * K + K - 1, 10 + y * K + K - 1], outline=(50, 54, 72, 255))
        d.text((ox + 4, S * K + 12 - 10), name, fill=TXT)
    im.save(OUT / 'icono_16x16_ampliado_x16_PLANTILLA.png')


if __name__ == '__main__':
    champion_atlas()
    fx_nova()
    icon16()
    print('plantillas en', OUT)
