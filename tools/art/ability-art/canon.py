"""LA HORDA — CANON DE ARTE DE HABILIDADES (compartido por Pintor, Evaluador y Arquitecto).

Un solo lugar define el lenguaje visual unificado de las habilidades de los guardianes:
  · rampa de 5 tonos por guardián [contorno, sombra, base, luz, brillo] (la misma que usa js/champions/vfx-b),
  · índices de paleta 1..5 (0 = transparente), alfa 0/255, translucidez por tramado Bayer 4x4,
  · luz SIEMPRE desde arriba-izquierda (brillo en el arco superior-izquierdo, sombra abajo-derecha),
  · tres fases por golpe: anticipación (0–.22) → impacto (.22–.42) → disipación (.42–1),
  · el borde exterior del sprite ES el radio real de la habilidad (docs/ART_BIBLE.md §7, pixfx.js).
Todo es determinista: sin azar, sin Math.random; la misma ficha produce los mismos píxeles.
"""
import json
import math
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
OUT_DOCS = ROOT / 'docs' / 'art-gate' / 'ability-art'

# Mismos valores que js/champions/vfx-b/pixfx.js (KVB_BAYER, KVB_FILL_CAP) y js/rendering/arena-props.js
BAYER = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], dtype=np.int32)
FILL_CAP = 0.24
ARENA_FLOORS = {
    'ciudad': ['#302b30', '#65534b', '#92745b'], 'fortaleza': ['#302c29', '#655343', '#a7824f'],
    'bosque': ['#24302b', '#455b3c', '#829365'], 'micelial': ['#302635', '#604365', '#a078a2'],
    'hielo': ['#293b4b', '#496577', '#91b7c5'], 'acuatica': ['#233b40', '#42636a', '#7baca7'],
    'laberinto': ['#342e25', '#685b43', '#aa9363'], 'abismo': ['#29253c', '#52496a', '#9381ac'],
    'minas': ['#2c2c31', '#615b56', '#b39767'], 'infernal': ['#342424', '#674137', '#a96b4b'],
    'divina': ['#343139', '#726a61', '#c2b28b'], 'coliseo': ['#322b2c', '#6e5046', '#b58a60'],
    'convergencia': ['#292e39', '#4d6271', '#91b4bc'],
}
TONES = 5  # 1 contorno, 2 sombra, 3 base, 4 luz, 5 brillo

# Umbrales del Evaluador (un solo lugar para que Pintor, Evaluador y docs coincidan)
PASS_SCORE = 85          # puntaje mínimo (0–100)
MIN_IMPROVEMENT = 6      # puntos sobre el arte actual del juego (si existe línea base)
MIN_CRITERION = 0.5      # cada criterio debe alcanzar al menos la mitad de su peso
MAX_ROUNDS = 6


def hex_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def lum(rgb):
    """Luminancia relativa WCAG de un color RGB 0–255."""
    def ch(v):
        v /= 255.0
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = rgb[:3]
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)


def contrast(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def kvb_s(R):
    """Tamaño de sprite del motor para un radio R (pixfx.js kvbS): 1 píxel de arte ≈ 4,4 u de mundo."""
    return int(max(24, min(128, round(2 * R / 4.4 / 4) * 4)))


def ramp_rgb(spec_or_pal):
    pal = spec_or_pal['palette'] if isinstance(spec_or_pal, dict) else spec_or_pal
    return [hex_rgb(c) for c in pal]


def index_to_rgba(idx, ramp):
    """idx (H,W) con 0..5 → RGBA uint8 (alfa 0/255)."""
    h, w = idx.shape
    out = np.zeros((h, w, 4), np.uint8)
    for t in range(1, TONES + 1):
        m = idx == t
        out[m, :3] = ramp[t - 1]
        out[m, 3] = 255
    return out


def load_json(p):
    return json.loads(Path(p).read_text(encoding='utf-8'))


def save_json(p, data):
    Path(p).parent.mkdir(parents=True, exist_ok=True)
    Path(p).write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
