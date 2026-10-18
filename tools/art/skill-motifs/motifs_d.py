# Parte D: definitivas rehechas con silueta propia (más aire, nada de bloques cuadrados): el chequeo de definitivas
# (tools/art/check-skill-icons.js) mide el parecido de silueta y los bloques llenos de 12x12 se parecían todos.
import math
D = {
'reaper': [
 '.....##.....',
 '....####aaa.',
 '...###kkaaaa',
 '...##kkk##aa',
 '..###kkkk#.a',
 '..####kk###.',
 '.#####.#####',
 '.####..####.',
 '.###...###..',
 '..#....#.#..',
 '..#....#..#.',
 '.......#....'],
'stele': [
 '....####....',
 '...######...',
 '..########..',
 '..#a.a.a.#..',
 '..########..',
 '..#.a.a..#..',
 '..########..',
 '..#a.a.a.#..',
 '..########..',
 '.##########.',
 '############',
 '............'],
'compassrose': [
 '.....##.....',
 '.....##.....',
 '....####....',
 '.a..####..a.',
 '..a.####.a..',
 '############',
 '############',
 '..a.####.a..',
 '.a..####..a.',
 '....####....',
 '.....##.....',
 '.....##.....'],
'citadel': [
 '#.#..##..#.#',
 '###..##..###',
 '###.####.###',
 '###.####.###',
 '###.#kk#.###',
 '###.#kk#.###',
 '############',
 '#kk######kk#',
 '############',
 '############',
 '............',
 '............'],
'sandgiant': [
 '#....##....#',
 '##..####..##',
 '###.####.###',
 '.###.##.###.',
 '..#######...',
 '...#####....',
 '....###.....',
 '...#####....',
 '..##...##...',
 '.##.....##..',
 '.#.......#..',
 '............'],
'pray': [
 '...aaaaaa...',
 '..a......a..',
 '...aaaaaa...',
 '.....##.....',
 '....####....',
 '....####....',
 '...######...',
 '...######...',
 '..########..',
 '..###..###..',
 '.###....###.',
 '............'],
}


def _rosewindow():
    g = [['.'] * 12 for _ in range(12)]
    for y in range(12):
        for x in range(12):
            d = math.hypot(x - 5.5, y - 5.5)
            if 4.2 <= d <= 5.6:
                g[y][x] = '#'
            elif d < 1.6:
                g[y][x] = 'a'
    for i in range(12):
        for (x, y) in ((i, 5), (i, 6), (5, i), (6, i), (i, i), (i, 11 - i)):
            if 1.6 <= math.hypot(x - 5.5, y - 5.5) < 4.2:
                g[y][x] = 'a' if (x in (5, 6) or y in (5, 6)) else '#'
    return [''.join(r) for r in g]


D['rosewindow'] = _rosewindow()

# Motivos antiguos de un solo color (todo acento): el contrato pide cuerpo en 3 tonos + acento, así que el cuerpo pasa a #
# (con luz y sombra automáticas) y el acento queda solo para detalles. Se leen del archivo de motivos original.
import os, re
_legacy = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'js', 'ui', 'skill-pixel-glyphs.js'), encoding='utf-8').read()
for _n in ('power', 'compass', 'barrier', 'circuit'):
    _m = re.search(r"^  %s:\[(.*?)\],?$" % _n, _legacy, re.M)
    _rows = re.findall(r"'([^']*)'", _m.group(1))
    D[_n] = [r.replace('a', '#').replace('r', '#').replace('y', '#').replace('c', '#').replace('g', '#').replace('w', '#') for r in _rows]
