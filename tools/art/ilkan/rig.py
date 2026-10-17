#!/usr/bin/env python3
"""Primitivas de pixel art procedural para Ilkan (campeón ORIGINAL, docs/ILKAN_REWORK.md).

Todo se dibuja por código (sin imágenes de terceros, sin generador de imágenes): máscaras a 4x que se bajan
a 1x con umbral (curvas limpias, alfa 0/255), relleno plano en tres tonos (base / luz arriba-izquierda / sombra
abajo-derecha) y un contorno oscuro de 1 px sobre la silueta, como pide docs/ART_BIBLE.md §2 y §6.
"""
import math
import numpy as np
from PIL import Image, ImageDraw

SS = 4
OUTLINE = (26, 16, 32)


def hexc(s):
    s = s.lstrip('#')
    return tuple(int(s[i:i + 2], 16) for i in (0, 2, 4))


class Mask:
    """Máscara de una pieza, dibujada a 4x."""

    def __init__(self, w, h):
        self.w, self.h = w, h
        self.im = Image.new('L', (w * SS, h * SS), 0)
        self.d = ImageDraw.Draw(self.im)

    def ellipse(self, cx, cy, rx, ry):
        self.d.ellipse([(cx - rx) * SS, (cy - ry) * SS, (cx + rx) * SS, (cy + ry) * SS], fill=255)
        return self

    def poly(self, pts):
        self.d.polygon([(x * SS, y * SS) for x, y in pts], fill=255)
        return self

    def rect(self, x0, y0, x1, y1):
        self.d.rectangle([x0 * SS, y0 * SS, x1 * SS - 1, y1 * SS - 1], fill=255)
        return self

    def cap(self, a, b, wa, wb=None):
        """Cápsula (miembro) de a a b con anchos wa -> wb."""
        wb = wa if wb is None else wb
        (x0, y0), (x1, y1) = a, b
        dx, dy = x1 - x0, y1 - y0
        l = math.hypot(dx, dy) or 1.0
        nx, ny = -dy / l, dx / l
        self.poly([(x0 + nx * wa / 2, y0 + ny * wa / 2), (x1 + nx * wb / 2, y1 + ny * wb / 2),
                   (x1 - nx * wb / 2, y1 - ny * wb / 2), (x0 - nx * wa / 2, y0 - ny * wa / 2)])
        self.ellipse(x0, y0, wa / 2, wa / 2)
        self.ellipse(x1, y1, wb / 2, wb / 2)
        return self

    def arc(self, cx, cy, r, a0, a1, w, n=24):
        """Trazo curvo (hoja de hoz): arco de centro (cx,cy) radio r entre los ángulos a0..a1 (grados), grosor w."""
        pts_o, pts_i = [], []
        for i in range(n + 1):
            t = i / n
            a = math.radians(a0 + (a1 - a0) * t)
            wt = w * math.sin(math.pi * min(1, max(0, 0.15 + 0.85 * t))) if False else w * (1 - 0.75 * t)
            pts_o.append((cx + math.cos(a) * (r + wt / 2), cy + math.sin(a) * (r + wt / 2)))
            pts_i.append((cx + math.cos(a) * (r - wt / 2), cy + math.sin(a) * (r - wt / 2)))
        self.poly(pts_o + pts_i[::-1])
        return self

    def get(self):
        sm = self.im.resize((self.w, self.h), Image.BOX)
        return np.array(sm) >= 128


def shift(m, dx, dy):
    out = np.zeros_like(m)
    h, w = m.shape
    xs0, xs1 = max(0, dx), min(w, w + dx)
    ys0, ys1 = max(0, dy), min(h, h + dy)
    out[ys0:ys1, xs0:xs1] = m[ys0 - dy:ys1 - dy, xs0 - dx:xs1 - dx]
    return out


class Sprite:
    """Lienzo RGBA con piezas sombreadas. Las piezas se apilan en el orden en que se pintan."""

    def __init__(self, w, h):
        self.w, self.h = w, h
        self.rgba = np.zeros((h, w, 4), np.uint8)

    def mask(self):
        return Mask(self.w, self.h)

    def fill(self, m, base, shade=None, light=None, line=None, band=0.62, rim=True):
        """Pinta la pieza `m` (bool HxW). base/shade/light son (r,g,b); line = contorno interior de la pieza."""
        if isinstance(m, Mask):
            m = m.get()
        if not m.any():
            return
        ys, xs = np.nonzero(m)
        y0, y1 = ys.min(), ys.max()
        col = np.zeros((self.h, self.w, 3), np.uint8)
        col[m] = base
        if shade is not None:
            low = np.zeros_like(m)
            yy = np.arange(self.h)[:, None] * np.ones((1, self.w))
            low = m & (yy > y0 + band * (y1 - y0 + 1))
            col[low] = shade
            if rim:
                col[m & ~shift(m, -1, -1)] = shade        # borde abajo-derecha
        if light is not None and rim:
            col[m & ~shift(m, 1, 1)] = light               # borde arriba-izquierda
        if line is not None:
            edge = m & ~(shift(m, 1, 0) & shift(m, -1, 0) & shift(m, 0, 1) & shift(m, 0, -1))
            col[edge] = line
        self.rgba[m, :3] = col[m]
        self.rgba[m, 3] = 255

    def px(self, x, y, c, a=255):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < self.w and 0 <= y < self.h:
            self.rgba[y, x, :3] = c
            self.rgba[y, x, 3] = a

    def dots(self, pts, c):
        for x, y in pts:
            self.px(x, y, c)

    def outline(self, color=OUTLINE):
        a = self.rgba[:, :, 3] > 0
        ring = (shift(a, 1, 0) | shift(a, -1, 0) | shift(a, 0, 1) | shift(a, 0, -1)) & ~a
        self.rgba[ring, :3] = color
        self.rgba[ring, 3] = 255

    def image(self):
        return Image.fromarray(self.rgba, 'RGBA')


def rotate_about(img, deg, center, bg=(0, 0, 0, 0)):
    """Rota una imagen RGBA con vecino más cercano alrededor de `center` (se mantiene el tamaño)."""
    return img.rotate(deg, resample=Image.NEAREST, center=center, fillcolor=bg)


def clean_alpha(img):
    """Alfa 0/255 (Art Bible §6)."""
    a = np.array(img)
    a[:, :, 3] = np.where(a[:, :, 3] >= 128, 255, 0)
    a[a[:, :, 3] == 0, :3] = 0
    return Image.fromarray(a, 'RGBA')
