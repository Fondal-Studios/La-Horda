#!/usr/bin/env python3
"""Núcleo Micelial (4 etapas) y Raíz de Absorción, pintados con el pintor determinista (0 créditos).
Referencia: lámina de jefes del Códice (art-source/micelial/bosses.png: Madre Espora / Micelio): sombreros magenta con
branquias naranjas, esporas cian, raíces violeta. Escala nativa, contorno 1 px, alfa binario, <=48 colores.
Uso: python3 tools/art/painter/micelial/core_root.py [--install]"""
import sys, math
from pathlib import Path
import numpy as np
from PIL import Image
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
sys.path.insert(0, str(HERE.parent))
from enemy_paint import Canvas, ramp, limit_palette

CAP = ramp('#c8309a'); CAP2 = ramp('#8a3ad0'); STEM = ramp('#e8a0b8'); ROOTM = ramp('#6a3a7a'); ROOTD = ramp('#3e2250')
GILL = ramp('#ff9a40'); CYAN = [(20, 90, 120), (40, 170, 210), (110, 235, 255), (230, 255, 255)]
GLOW = [(120, 20, 110), (230, 70, 200), (255, 150, 235), (255, 235, 250)]
OUT = '#1a0a22'


def mushroom(c, x, by, ht, capw, cap=CAP, tilt=0.0):
    tx = x + tilt * ht
    c.part(c.m_capsule((x, by), (tx, by - ht), capw * 0.17, capw * 0.12), STEM)
    cy = by - ht
    c.part(c.m_ellipse(tx, cy + capw * 0.10, capw * 0.55, capw * 0.16), GILL, bias=-0.1)
    c.part(c.m_ellipse(tx, cy, capw * 0.5, capw * 0.30), cap)
    c.part(c.m_ellipse(tx - capw * 0.18, cy - capw * 0.10, capw * 0.14, capw * 0.07), cap, bias=0.25, edge=False, dither=False)
    for dx, dy in ((-0.22, -0.02), (0.14, -0.12), (0.26, 0.03)):
        c.px(tx + dx * capw, cy + dy * capw, CYAN[2], 1, 1)
    for dx in (-0.28, -0.1, 0.12, 0.3):
        c.part(c.m_capsule((tx + dx * capw, cy + capw * 0.14), (tx + dx * capw, cy + capw * 0.14 + 2 + abs(dx) * 8), 0.7), GLOW, edge=False, dither=False)


def roots(c, cx, gy, span, n, hmax):
    for i in range(n):
        k = (i / (n - 1) - 0.5) * 2
        ex = cx + k * span; ey = gy - 1 - (1 - abs(k)) * 3
        mid = (cx + k * span * 0.5, gy - hmax * (1 - abs(k) * 0.6))
        c.part(c.m_line([(cx + k * span * 0.1, gy - hmax * 0.55), mid, (ex, ey)], 2.2 - abs(k) * 0.8), ROOTM if i % 2 else ROOTD, bias=-0.05)
    c.part(c.m_ellipse(cx, gy - 3, span * 0.45, 4.5), ROOTD)


def core(stage):
    sizes = {1: (40, 64), 2: (60, 72), 3: (108, 78), 4: (68, 96)}
    W, H = sizes[stage]; c = Canvas(W, H, OUT); cx = W // 2; gy = H - 3
    roots(c, cx, gy, W * 0.42, 5 if stage < 3 else 7, 14 + stage * 3)
    if stage == 3:
        for x, hh, cw, t in ((cx - 40, 24, 24, -0.12), (cx + 40, 22, 22, 0.12), (cx - 24, 34, 18, -0.1), (cx + 25, 32, 18, 0.1)):
            mushroom(c, x, gy - 3, hh, cw, CAP2 if hh < 30 else CAP, t)
    if stage == 2:
        for x, hh, cw in ((cx - 15, 20, 15), (cx + 16, 17, 13)): mushroom(c, x, gy - 3, hh, cw, CAP2)
    main = {1: (36, 22), 2: (44, 28), 3: (50, 34), 4: (70, 44)}[stage]
    mushroom(c, cx, gy - 3, main[0], main[1])
    if stage == 4:
        c.part(c.m_ellipse(cx, gy - 30, 7, 11), GLOW)
        c.part(c.m_ellipse(cx, gy - 30, 3, 6), CYAN, edge=False, dither=False)
    for i in range(stage * 3):
        a = i * 2.4; c.px(cx + math.cos(a) * (W * 0.38), 8 + (i * 13) % (H // 2), CYAN[2 if i % 2 else 1])
    return c.finish()


def root_curl():
    W, H = 64, 96; c = Canvas(W, H, OUT); gy = H - 3
    for k, (dx, ln) in enumerate(((-14, 18), (12, 16), (-5, 22), (6, 20))):
        c.part(c.m_line([(W // 2 + dx * 0.3, gy - 4), (W // 2 + dx, gy - ln * 0.6), (W // 2 + dx * 1.3, gy - ln - 4)], 2.0), ROOTD if k % 2 else ROOTM)
    pts = [(30, gy - 4), (27, gy - 26), (34, gy - 50), (44, gy - 66)]
    for a, b, r0, r1 in zip(pts[:-1], pts[1:], (7, 5.5, 4.5), (5.5, 4.5, 3.5)):
        c.part(c.m_capsule(a, b, r0, r1), ROOTM)
    c.part(c.m_line([(31, gy - 8), (29, gy - 28), (36, gy - 50)], 1.0), CAP, edge=False, dither=False)
    c.part(c.m_ellipse(48, gy - 68, 9, 7, 0.5), GILL)
    c.part(c.m_ellipse(49, gy - 68, 5, 3.5, 0.5), GLOW, edge=False)
    c.px(48, gy - 69, CYAN[3], 2, 1)
    c.part(c.m_ellipse(30, gy - 3, 15, 4), ROOTD)
    for dx in (-12, -4, 6, 14): c.part(c.m_capsule((30 + dx, gy - 2), (30 + dx * 1.7, gy), 1.1), ROOTM, edge=False, dither=False)
    return c.finish()


def variants(a, mode):
    a = a.copy(); op = a[..., 3] > 0; rgb = a[..., :3].astype(float)
    g = (rgb * [.3, .59, .11]).sum(-1, keepdims=True)
    if mode == 'wither': rgb = rgb * .45 + g * .55 * np.array([1.0, .95, .8]) * 0.85
    else: rgb = g * np.array([.8, .75, .8]) * 0.55
    a[..., :3] = np.where(op[..., None], np.clip(rgb, 0, 255), 0).astype(np.uint8); return a


def main():
    s = {i: core(i) for i in (1, 2, 3, 4)}
    # nombres del renderer: etapa1->nucleo_3 (chico), etapa2->nucleo_2, etapa3->nucleo_1 (ancho), etapa4->nucleo_4
    m = {'nucleo_3': s[1], 'nucleo_2': s[2], 'nucleo_1': s[3], 'nucleo_4': s[4]}
    for k in list(m):
        m[k + '_wither'] = variants(m[k], 'wither'); m[k + '_dead'] = variants(m[k], 'dead')
    m['root_curl'] = root_curl()
    dst = ROOT / ('assets/sprites/arenas/micelial/fx' if '--install' in sys.argv else 'tools/art/painter/out/micelial')
    dst.mkdir(parents=True, exist_ok=True)
    for k, a in m.items():
        limit_palette(Image.fromarray(a), 48).save(dst / (k + '.png'), optimize=True)
    print('escrito en', dst, len(m))


if __name__ == '__main__': main()
