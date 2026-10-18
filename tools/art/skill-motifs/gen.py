#!/usr/bin/env python3
"""Genera js/ui/skill-icon-motifs.js a partir de los motivos de 12x12 dibujados en motifs_*.py.

Cada motivo es una grilla de 12 filas x 12 letras: # cuerpo, a acento, k detalle oscuro, l/d tono a mano, . vacío.
El generador valida el tamaño y le pone al cuerpo (#) luz arriba/izquierda (l) y sombra abajo/derecha (d), así
todos los motivos comparten la misma regla de iluminación (no la elige cada dibujo). El contrato de 16x16, los 6
colores, el contorno de 1 px y el marco los aplica js/ui/pixel-icons.js al renderizar, no este script.
Uso: python3 tools/art/skill-motifs/gen.py
"""
import os, sys, importlib

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, HERE)
W = 12
ALLOWED = set('#akld.')


def shade(rows):
    g = [list(r) for r in rows]

    def empty(x, y):
        return not (0 <= x < W and 0 <= y < W) or rows[y][x] == '.'
    for y in range(W):
        for x in range(W):
            if rows[y][x] != '#':
                continue
            if empty(x, y - 1) or empty(x - 1, y):
                g[y][x] = 'l'
            elif empty(x + 1, y) or empty(x, y + 1):
                g[y][x] = 'd'
    return [''.join(r) for r in g]


def main():
    motifs, errors = {}, []
    for mod in sorted(f[:-3] for f in os.listdir(HERE) if f.startswith('motifs_') and f.endswith('.py')):
        m = importlib.import_module(mod)
        for part in ('A', 'B', 'C', 'D'):
            for name, rows in getattr(m, part, {}).items():
                if name in motifs:
                    errors.append(f'{name}: definido dos veces')
                if len(rows) != W:
                    errors.append(f'{name}: {len(rows)} filas (deben ser {W})')
                    continue
                for i, r in enumerate(rows):
                    if len(r) != W:
                        errors.append(f'{name} fila {i}: {len(r)} columnas (deben ser {W}): "{r}"')
                    elif set(r) - ALLOWED:
                        errors.append(f'{name} fila {i}: letras no permitidas {set(r) - ALLOWED}')
                motifs[name] = rows
    if errors:
        print('\n'.join(errors))
        sys.exit(1)
    out = ['"use strict";',
           '/* ============================================================',
           '   js/ui/skill-icon-motifs.js',
           '   GENERADO por tools/art/skill-motifs/gen.py (los dibujos están en motifs_*.py). No editar a mano.',
           '   Motivos de 12x12 de los íconos de habilidad bajo el contrato de js/ui/pixel-icons.js. Se suman a (y pisan a)',
           '   PIX_MOTIFS de skill-pixel-glyphs.js; ese archivo debe cargarse antes.',
           '   Letras: # cuerpo, l luz, d sombra, a acento, k detalle oscuro, . vacío.',
           '   ============================================================ */',
           'const PIX_MOTIFS_V2 = {']
    for name in sorted(motifs):
        out.append("  %s:[%s]," % (name, ','.join("'%s'" % r for r in shade(motifs[name]))))
    out[-1] = out[-1].rstrip(',')
    out.append('};')
    out.append('Object.assign(PIX_MOTIFS, PIX_MOTIFS_V2);')
    path = os.path.join(ROOT, 'js', 'ui', 'skill-icon-motifs.js')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(out) + '\n')
    print(f'{len(motifs)} motivos -> js/ui/skill-icon-motifs.js')


if __name__ == '__main__':
    main()
