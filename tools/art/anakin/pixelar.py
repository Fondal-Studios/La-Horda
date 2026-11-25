# pixelar.py - del dibujo crudo de Anakin (512 px, fondo gris plano) a sprite del canon de La Horda:
# fondo fuera (relleno desde los bordes), recorte, bajada a la altura nativa, paleta limitada,
# alfa binario y contorno oscuro de 1 px. Uso: pixelar(crudo, alto_px, colores=24) -> Image RGBA
import numpy as np
from PIL import Image
from scipy import ndimage

def quitar_fondo(im, tol=38):
    a = np.asarray(im.convert('RGB')).astype(int)
    h, w, _ = a.shape
    borde = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    ref = np.median(borde, axis=0)
    cerca = np.sqrt(((a - ref) ** 2).sum(-1)) < tol
    lab, n = ndimage.label(cerca)
    tocan = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fondo = np.isin(lab, list(tocan))
    # sombra proyectada: gris neutro algo mas oscuro que el fondo, pegada al fondo (no come basalto, que es mas oscuro)
    v = a.mean(-1); neutro = (a.max(-1) - a.min(-1)) < 34
    somb = neutro & (v > ref.mean() * 0.55) & (v < ref.mean() * 1.05)
    lab2, _ = ndimage.label(somb | fondo)
    fondo = fondo | np.isin(lab2, list(set(np.unique(lab2[fondo])) - {0}))
    obj = ~fondo
    obj = ndimage.binary_opening(obj, iterations=2)
    lab, n = ndimage.label(obj)
    if n:
        tam = ndimage.sum(obj, lab, range(1, n + 1))
        grande = tam.max()
        obj = np.isin(lab, [i + 1 for i, t in enumerate(tam) if t >= grande * 0.04])
    obj = ndimage.binary_fill_holes(obj)
    rgba = np.dstack([a.astype('uint8'), (obj * 255).astype('uint8')])
    return Image.fromarray(rgba, 'RGBA')

def pixelar(crudo, alto, colores=24):
    im = quitar_fondo(Image.open(crudo))
    im = im.crop(im.getbbox())
    k = alto / im.height
    w = max(1, round(im.width * k))
    rgb = im.convert('RGB').resize((w, alto), Image.BOX)
    al = np.asarray(im.split()[3].resize((w, alto), Image.BOX)) >= 128
    q = rgb.quantize(colors=colores, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
    px = np.asarray(q).copy()
    # contorno: pixeles transparentes vecinos del objeto -> tono oscuro del propio sprite
    oscuro = np.percentile(px[al].reshape(-1, 3).sum(1), 3)
    tono = px[al][px[al].sum(1) <= oscuro].mean(0) * 0.55 if al.any() else np.array([20, 15, 20])
    borde = ndimage.binary_dilation(al, structure=np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]])) & ~al
    pad = np.pad(px, ((1, 1), (1, 1), (0, 0)))
    al2 = np.pad(al, 1); borde2 = np.pad(borde, 1)
    pad[borde2] = tono.astype('uint8')
    alfa = ((al2 | borde2) * 255).astype('uint8')
    out = Image.fromarray(np.dstack([pad, alfa]), 'RGBA')
    return out.crop(out.getbbox())

if __name__ == '__main__':
    import sys
    pixelar(sys.argv[1], int(sys.argv[2])).save(sys.argv[3])
