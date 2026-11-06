#!/usr/bin/env python3
"""Marcos pixel-art de los botones de combate del HUD (UI Factory · UF-ART v1).
Disciplina de la fábrica de arte (docs/ART_BIBLE.md §15, tools/art/painter): UNA grilla de píxel (bloque de 2 px CSS),
paleta acotada (5 tonos + contorno por botón), contorno de 1 px, luz fija arriba-izquierda, tramado ordenado en las transiciones,
sin suavizado. Las formas siguen al botón real (círculo o rectángulo redondeado) y el marco queda FUERA del botón: no tapa los colores
de estado (listo/cooldown/sin energía) que pone css/hud.css.
Estado de revisión: IMPORTED_NOT_APPROVED — es un primer pase generado por código; requiere revisión de arte humana antes de darlo por canon.
Salida: css/ui-factory/fx/frame-<botón>.png (+ contact-sheet en docs/ui-factory/evidence/art/).
Reproducible: python3 tools/ui-factory/make-hud-frames.py"""
import math, os
from PIL import Image
ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
OUT = os.path.join(ROOT, 'css', 'ui-factory', 'fx')
BLOCK = 2                      # px CSS por píxel lógico (el icono del botón usa ~1.6)
INK = (10, 6, 4, 255)
def hexc(h): h = h.lstrip('#'); return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)
PAL = {                         # oscuro → claro (5 tonos), gema (2 tonos)
  'basic': (['#2a1608', '#6a3a18', '#b46f30', '#ffb86a', '#ffe6b8'], ['#7a1d12', '#ff6a3c']),
  's1':    (['#0d1b2a', '#1c4a66', '#3f87b8', '#7fdcff', '#dff8ff'], ['#0c5a7a', '#7fffff']),
  's2':    (['#161230', '#3a2f6b', '#6b5bb0', '#c7b8ff', '#f0eaff'], ['#4a1a7a', '#e6a8ff']),
  's3':    (['#0f2420', '#1f5a48', '#3fa383', '#8ff0c8', '#e4fff4'], ['#0f6a3a', '#9fffb8']),
  'ult':   (['#2a1a05', '#8a5a12', '#d49a2a', '#ffe28e', '#fff8d8'], ['#8a2a0a', '#ffd04a']),
  'sec':   (['#10241c', '#235c3c', '#3f9a63', '#97f3b4', '#e6fff0'], ['#0f6a3a', '#b8ffcf']),
}
BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]
def make(name, key, size, shape, rad, margin, gems):
    L = size / BLOCK / 2.0                     # semilado lógico del botón
    M = margin                                  # grosor lógico del marco
    W = int(round(2 * (L + M)))
    cx = cy = W / 2.0
    ramp = [hexc(c) for c in PAL[key][0]]; gem = [hexc(c) for c in PAL[key][1]]
    img = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    def dist(x, y):                             # distancia al borde del botón (negativa = dentro)
        dx, dy = x - cx, y - cy
        if shape == 'circle': return math.hypot(dx, dy) - L
        r = rad / BLOCK; qx, qy = abs(dx) - (L - r), abs(dy) - (L - r)
        return math.hypot(max(qx, 0), max(qy, 0)) + min(max(qx, qy), 0) - r
    for y in range(W):
        for x in range(W):
            d = dist(x + .5, y + .5)
            if d <= 0 or d >= M: continue
            if d < 1: img.putpixel((x, y), INK); continue          # contorno interior
            if d >= M - 1: img.putpixel((x, y), INK); continue     # contorno exterior
            dx, dy = x + .5 - cx, y + .5 - cy; n = math.hypot(dx, dy) or 1
            lit = (-dx - dy) / (n * 1.414)                         # 1 = luz arriba-izquierda
            tone = (lit + 1) / 2 * 3.0 + (0.6 if d < 2 else 0)     # banda interior un tono más claro
            thr = BAYER[y % 4][x % 4] / 16.0
            idx = int(tone + (thr - .5) * .9)
            img.putpixel((x, y), ramp[max(1, min(4, idx + 1))])
    # gemas: 4 cardinales (círculo) o 4 esquinas (rectángulo), 3×3 en rombo con brillo
    pts = []
    if gems == 'cardinal': pts = [(cx, cy - L - M / 2), (cx + L + M / 2, cy), (cx, cy + L + M / 2), (cx - L - M / 2, cy)]
    elif gems == 'corner':
        k = (L - rad / BLOCK * (1 - math.sqrt(.5))) * 0.98
        pts = [(cx + sx * k, cy + sy * k) for sx in (-1, 1) for sy in (-1, 1)]
        pts = [(px + sx * M * .55, py + sy * M * .55) for (px, py), (sx, sy) in zip(pts, [(-1, -1), (-1, 1), (1, -1), (1, 1)])]
    for (px, py) in pts:
        px, py = int(round(px)), int(round(py))
        for ox, oy in ((0, -2), (-1, -1), (0, -1), (1, -1), (-2, 0), (-1, 0), (0, 0), (1, 0), (2, 0), (-1, 1), (0, 1), (1, 1), (0, 2)):
            if 0 <= px + ox < W and 0 <= py + oy < W:
                edge = abs(ox) + abs(oy) >= 2
                img.putpixel((px + ox, py + oy), INK if edge and (abs(ox) == 2 or abs(oy) == 2) else (gem[0] if edge else gem[1]))
        if 0 <= px - 1 < W and 0 <= py - 1 < W: img.putpixel((px - 1, py - 1), (255, 255, 255, 255))
    img = img.resize((W * BLOCK, W * BLOCK), Image.NEAREST)
    os.makedirs(OUT, exist_ok=True); img.save(os.path.join(OUT, 'frame-%s.png' % name), optimize=True)
    return img, W * BLOCK
SPEC = [  # nombre, paleta, tamaño CSS del botón, forma, radio CSS, grosor lógico, gemas
  ('basic', 'basic', 92, 'circle', 0, 4, 'cardinal'),
  ('s1', 's1', 54, 'rect', 20, 3, 'corner'), ('s2', 's2', 54, 'rect', 20, 3, 'corner'), ('s3', 's3', 54, 'rect', 20, 3, 'corner'),
  ('ult', 'ult', 60, 'circle', 0, 4, 'cardinal'),
  ('sec', 'sec', 46, 'rect', 14, 3, 'corner'),
]
if __name__ == '__main__':
    sheet = Image.new('RGBA', (900, 200), (22, 36, 22, 255)); x = 10; info = []
    for s in SPEC:
        im, w = make(*s); big = im.resize((w * 2, w * 2), Image.NEAREST); sheet.paste(big, (x, 10), big); x += w * 2 + 12; info.append((s[0], w))
    d = os.path.join(ROOT, 'docs', 'ui-factory', 'evidence', 'art'); os.makedirs(d, exist_ok=True); sheet.save(os.path.join(d, 'frames-contact-sheet.png'))
    print(info)
