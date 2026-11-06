#!/usr/bin/env python3
"""Tarjeta del Códice con título dibujado -> arte limpio a píxel nativo (sin título).
1) detecta el texto (pixeles claros de baja extension en el tercio superior: blanco, cian, naranja, dorado) y lo borra por inpainting (OpenCV Telea);
2) lo pasa por tools/art/native_pixelize.py (paleta corta, vecino mas cercano). El nombre y el rol los pone la interfaz del Códice.
Uso: python3 tools/art/codex_card_clean.py <entrada.jpg> <salida.png> [F=2] [K=48] [--top 0.34]"""
import sys, subprocess, os
import numpy as np, cv2
a = [x for i, x in enumerate(sys.argv[1:], 1) if not x.startswith('--') and sys.argv[i - 1] != '--top']
src, dst = a[0], a[1]; F = a[2] if len(a) > 2 else '2'; K = a[3] if len(a) > 3 else '48'
top = float(sys.argv[sys.argv.index('--top') + 1]) if '--top' in sys.argv else 0.34
im = cv2.imread(src); h, w = im.shape[:2]; band = int(h * top)
hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV); gray = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
bright = (gray > 150).astype(np.uint8)
mask = np.zeros((h, w), np.uint8)
sub = bright[:band]
# el texto son trazos finos: se queda con lo claro que tiene mucho oscuro alrededor (apertura morfologica quita las masas grandes)
big = cv2.morphologyEx(sub, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
mask[:band] = np.where((sub > 0) & (big == 0), 255, 0)
# solo las lineas de texto del borde superior: tramos de filas con mucho trazo claro, el primero empezando en el 14 % de arriba y con huecos de hasta 16 filas
rows = (mask > 0).sum(1); thr = max(10, int(w * 0.04)); end = -1; gap = 0; started = False
for y in range(band):
    if rows[y] >= thr: started = True; end = y; gap = 0
    elif started:
        gap += 1
        if gap > 16: break
    elif y > int(h * 0.14): break
mask[end + 4:] = 0 if end >= 0 else 0
if end < 0: mask[:] = 0
mask = cv2.dilate(mask, np.ones((5, 5), np.uint8), iterations=1)
clean = cv2.inpaint(im, mask, 4, cv2.INPAINT_TELEA)
tmp = dst + '.tmp.png'; cv2.imwrite(tmp, clean)
subprocess.check_call([sys.executable, os.path.join(os.path.dirname(__file__), 'native_pixelize.py'), tmp, dst, F, K]); os.remove(tmp)
print('texto borrado px:', int((mask > 0).sum()))
