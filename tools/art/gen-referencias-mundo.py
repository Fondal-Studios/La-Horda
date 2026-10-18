#!/usr/bin/env python3
"""Hojas de contacto de REFERENCIA para el pintor (todo lo que NO es campeón).

Arma 8 hojas con rejilla y rótulos en docs/art-brief/ejemplos/mundo/ (WebP sin pérdida o PNG, chicos).
Cada celda dice la ruta del asset real del repo, para que el pintor vea "así está hoy" y "así se hace".
No toca el juego. Solo lee assets/ y js/ del repo (y, si faltan, ramas de PR vía `git show`).

Uso (desde la raíz del repo):
    python3 tools/art/gen-referencias-mundo.py              # genera las 8 hojas
    python3 tools/art/gen-referencias-mundo.py --solo 01,04  # solo algunas
    python3 tools/art/gen-referencias-mundo.py --salida /tmp/hojas --formato png

Dependencias: Pillow. Sin red. Tope de tamaño total: 30 MB (el script lo comprueba y avisa).
Las hojas son material de CONSULTA: no se cargan en el juego ni se entregan como arte.
"""
import argparse
import json
import os
import re
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
TOPE_MB = 30
FONDO = (34, 32, 42)
CELDA_FONDO = (52, 50, 62)
TEXTO = (235, 230, 215)
TEXTO_SUAVE = (160, 155, 150)
AVISO = (255, 170, 90)


def fuente(tam=11):
    for ruta in ("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
                 "/usr/share/fonts/dejavu/DejaVuSansMono.ttf"):
        if os.path.exists(ruta):
            return ImageFont.truetype(ruta, tam)
    return ImageFont.load_default()


F = fuente(11)
FB = fuente(14)


def abrir(ruta_rel):
    """Abre un asset del repo (ruta relativa a la raíz). Devuelve RGBA o None si no existe."""
    p = os.path.join(RAIZ, ruta_rel)
    if not os.path.exists(p):
        print("  (falta) " + ruta_rel, file=sys.stderr)
        return None
    try:
        return Image.open(p).convert("RGBA")
    except Exception as e:  # archivo corrupto
        print("  (ilegible) %s: %s" % (ruta_rel, e), file=sys.stderr)
        return None


def ajustar(im, ancho, alto, entero=True):
    """Escala con vecino más cercano para caber en ancho x alto (múltiplo entero al agrandar si se puede)."""
    w, h = im.size
    k = min(ancho / w, alto / h)
    if k >= 1 and entero:
        k = int(k)
    nw, nh = max(1, int(round(w * k))), max(1, int(round(h * k)))
    return im.resize((nw, nh), Image.NEAREST)


def corta(txt, n):
    return txt if len(txt) <= n else txt[:n - 1] + "…"


def hoja(titulo, subtitulo, celdas, cols, cw, ch, pie_lineas=2):
    """celdas = [(imagen RGBA o None, rótulo, aviso o '')]. Devuelve la hoja RGB."""
    filas = (len(celdas) + cols - 1) // cols
    cab = 54
    alto_rot = 14 * pie_lineas + 6
    W = cols * cw + 8
    H = cab + filas * (ch + alto_rot) + 8
    out = Image.new("RGB", (W, H), FONDO)
    d = ImageDraw.Draw(out)
    d.text((8, 6), titulo, font=FB, fill=TEXTO)
    d.text((8, 28), subtitulo, font=F, fill=TEXTO_SUAVE)
    for i, (im, rot, aviso) in enumerate(celdas):
        x0 = 4 + (i % cols) * cw
        y0 = cab + (i // cols) * (ch + alto_rot)
        d.rectangle([x0 + 2, y0, x0 + cw - 4, y0 + ch], fill=CELDA_FONDO)
        if im is not None:
            t = ajustar(im, cw - 10, ch - 6)
            out.paste(t, (x0 + 2 + (cw - 6 - t.size[0]) // 2, y0 + 2 + (ch - 4 - t.size[1]) // 2), t)
            dim = "%dx%d" % im.size
        else:
            dim = "FALTA"
            d.text((x0 + 8, y0 + ch // 2 - 6), "(no existe)", font=F, fill=AVISO)
        ancho_car = max(8, (cw - 8) // 7)
        lineas = [corta(rot, ancho_car), corta(dim + (" · " + aviso if aviso else ""), ancho_car)]
        for j, ln in enumerate(lineas[:pie_lineas]):
            d.text((x0 + 3, y0 + ch + 2 + 13 * j), ln, font=F, fill=(AVISO if j == 1 and aviso else TEXTO_SUAVE if j else TEXTO))
    return out


def celdas_de_rutas(items):
    """items = [(ruta_rel, rótulo corto, aviso)]"""
    out = []
    for ruta, rot, aviso in items:
        out.append((abrir(ruta), rot or ruta, aviso))
    return out


# ---------------------------------------------------------------------------------------------
# Lectura de motivos de íconos (PR #119 / #118). Local si existe, si no `git show` de la rama.
# ---------------------------------------------------------------------------------------------
def leer_js(ruta_rel, rama):
    """Prefiere la versión de la rama del PR (que es la que trae el contrato nuevo); si la rama ya no existe
    (PR mergeado y rama borrada) lee el archivo local, que entonces ya es el nuevo."""
    try:
        return subprocess.check_output(["git", "-C", RAIZ, "show", "%s:%s" % (rama, ruta_rel)], text=True,
                                       stderr=subprocess.DEVNULL)
    except Exception:
        pass
    p = os.path.join(RAIZ, ruta_rel)
    if os.path.exists(p):
        return open(p, encoding="utf-8").read()
    return None


def motivos(src):
    """Extrae {nombre: [12 filas]} de un literal JS tipo  nombre:['....',...12 filas...]"""
    out = {}
    if not src:
        return out
    for m in re.finditer(r"^\s*(\w+):\[((?:'[^']*',?\s*){12})\]", src, re.M):
        out[m.group(1)] = re.findall(r"'([^']*)'", m.group(2))
    return out


COLOR_RANURA = {"0": (143, 224, 255), "1": (207, 194, 255), "2": (151, 240, 204), "u": (255, 233, 168)}


def pintar_icono(filas, color, z):
    """Dibuja el motivo de 12x12 en una grilla de 16x16 (marco no incluido) con contorno automático."""
    claro = tuple(min(255, c + 60) for c in color)
    sombra = tuple(int(c * .55) for c in color)
    pal = {"#": color, "l": claro, "d": sombra, "a": (255, 240, 176), "k": (20, 20, 30),
           "r": (255, 106, 88), "g": (125, 255, 154), "c": (127, 227, 255), "w": (244, 241, 230)}
    g = [["."] * 16 for _ in range(16)]
    for y, r in enumerate(filas):
        for x, c in enumerate(r[:12]):
            g[y + 2][x + 2] = c
    im = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    px = im.load()
    for y in range(16):
        for x in range(16):
            c = g[y][x]
            if c != "." and c in pal:
                px[x, y] = pal[c] + (255,)
            elif c == ".":
                if any(0 <= y + dy < 16 and 0 <= x + dx < 16 and g[y + dy][x + dx] != "."
                       for dy in (-1, 0, 1) for dx in (-1, 0, 1)):
                    px[x, y] = (11, 15, 24, 255)
    return im.resize((16 * z, 16 * z), Image.NEAREST)


# ---------------------------------------------------------------------------------------------
# Las 8 hojas
# ---------------------------------------------------------------------------------------------
def h01_enemigos():
    items = [
        ("assets/sprites/arenas/ciudad/cm_verdugo/atlas.png", "REF humanoide nativo (pixrig)", "0,99 u/px · modelo a seguir"),
        ("assets/sprites/bosses/bosque/doblador_guerrero/v2/atlas.png", "REF humanoide pintado", "1,28 u/px"),
        ("assets/sprites/enemies/hielo/dragoncito_hielo/v2/atlas.png", "REF bestia alada", "0,91 u/px"),
        ("assets/sprites/arenas/abismo/ab_errante/atlas.png", "REF criatura", "1,28 u/px"),
        ("assets/sprites/enemies/bosque/enjambre_hadas/v3/atlas.png", "REF enjambre chico", "1,04 u/px"),
        ("assets/sprites/enemies/laberinto/escorpion_gigante/walk-strip.png", "REF artrópodo (tira)", "1,18 u/px"),
        ("assets/sprites/arenas/ciudad/cm_perro/atlas.png", "REHACER cm_perro", "PIXEL_GRUESO 2,59 u/px"),
        ("assets/sprites/arenas/ciudad/cm_acechante/atlas.png", "REHACER cm_acechante", "PIXEL_GRUESO 2,67 u/px"),
        ("assets/sprites/arenas/ciudad/cm_campanero/atlas.png", "REHACER cm_campanero", "PIXEL_GRUESO 2,95 u/px"),
        ("assets/sprites/arenas/minas/mn_devoraluz/atlas.png", "REHACER mn_devoraluz", "PIXEL_GRUESO 2,63 u/px"),
        ("assets/sprites/arenas/fortaleza/dragon_forja/atlas.png", "REHACER dragon_forja", "PIXEL_GRUESO 2,66 u/px"),
        ("assets/sprites/enemies/bosque/dama_bosque/v2/atlas.png", "REHACER dama_bosque", "ILUSTRACION"),
        ("assets/sprites/enemies/infernal/demonio_menor/atlas.png", "REHACER demonio_menor", "ILUSTRACION"),
        ("assets/sprites/enemies/infernal/demonio_mago/atlas.png", "REHACER demonio_mago", "ILUSTRACION"),
        ("assets/sprites/enemies/infernal/golem/v2/atlas.png", "REHACER golem (infernal)", "ILUSTRACION"),
        ("assets/sprites/enemies/infernal/esqueleto_h/walk1.png", "DONANTE de tiburon_joven", "cuerpo prestado"),
        ("assets/sprites/enemies/hielo/demonio_hielo_fuego/walk1.png", "DONANTE de tiburon_blanco", "cuerpo prestado"),
        ("assets/sprites/arenas/fortaleza/arana/atlas.png", "DONANTE de cangrejo_acorazado", "cuerpo prestado"),
        ("assets/sprites/arenas/micelial/acechador/atlas.png", "DONANTE de medusa_electrica", "cuerpo prestado"),
        ("assets/sprites/enemies/laberinto/medusa/walk-strip.png", "DONANTE de sirena_abisal", "cuerpo prestado"),
        ("assets/sprites/bosses/bosque/jinete_sin_cabeza/v2/atlas.png", "DONANTE de ab_jinete", "cuerpo prestado"),
        ("assets/sprites/enemies/bosque/cu_sith/v3/atlas.png", "DONANTE de esfinge", "cuerpo prestado"),
    ]
    return hoja("01 · Enemigos: modelo a seguir, a rehacer y donantes de cuerpo prestado",
                "Atlas completos reducidos a caber en la celda (vecino más cercano). Fuente: tools/art/pixel-density.js y js/data/body-swaps.js",
                celdas_de_rutas(items), 4, 300, 230)


def h02_battlefield():
    claves = ["golem_cuerpos", "mn_titan", "mn_cerbero", "ab_carcelero", "cm_maestro", "cm_dama", "cm_tramoyista",
              "cm_presentador", "minotauro", "leviatan", "dragon_forja", "micelio", "stone-dragon", "king-colossus",
              "thornbeast", "scavenger"]
    excep = {"scavenger", "thornbeast", "ab_carcelero", "cm_dama", "cm_maestro", "cm_presentador", "cm_tramoyista",
             "golem_cuerpos", "king-colossus", "micelio", "minotauro", "mn_cerbero", "mn_titan", "stone-dragon"}
    items = [("assets/sprites/battlefield/%s.png" % k, k, "ILUSTRACION (excepción)" if k in excep else "sin excepción") for k in claves]
    return hoja("02 · Los 16 monstruos de campo de batalla (tira de 4 cuadros de 448x384: reposo, caminar x2, ataque)",
                "Se dibujan con battlefieldDrawMonster() (js/rendering/battlefield-art.js) y ganan sobre los atlas propios del mismo tipo",
                celdas_de_rutas(items), 2, 620, 150)


def h03_fx():
    items = [
        ("assets/vfx/skills/ventisca.png", "tira ancha (zona/aura en bucle)", "2172x160"),
        ("assets/vfx/skills/armadura_hielo.png", "tira ancha (armadura)", ""),
        ("assets/vfx/skills/nova_escarcha.png", "nova (hoja)", ""),
        ("assets/vfx/abilities/scytheSlash_01.png", "tajo cuadro 1", "un cuadro por archivo"),
        ("assets/vfx/abilities/scytheSlash_03.png", "tajo cuadro 3", ""),
        ("assets/vfx/abilities/soulReapBurst_01.png", "estallido cuadro 1", ""),
        ("assets/vfx/abilities/soulReapBurst_04.png", "estallido cuadro 4", ""),
        ("assets/vfx/abilities/holyShieldBubble_02.png", "burbuja/escudo", ""),
        ("assets/vfx/abilities/holyHealBurst_02.png", "estallido de cura", ""),
        ("assets/vfx/abilities/waterSplash_02.png", "salpicadura", ""),
        ("assets/vfx/skins/manada/arrow_0.png", "proyectil flecha (skin)", "punta a +x"),
        ("assets/vfx/skins/manada/rain_0.png", "lluvia de flechas (skin)", ""),
        ("assets/vfx/skins/manada/phoenix_0.png", "fénix (skin, definitiva)", ""),
        ("assets/vfx/skins/manada/sigil_0.png", "sello en suelo (skin)", ""),
        ("assets/vfx/minas/cadena_tension_2.png", "cadena (cuadro)", ""),
        ("assets/vfx/minas/cadena_rotura_3.png", "rotura de cadena", ""),
        ("assets/vfx/axiom/teleport_in.png", "teletransporte (Axiom)", ""),
        ("assets/vfx/axiom/overwrite.png", "overwrite (Axiom)", ""),
        ("assets/vfx/guerrero/triple_golpe.png", "triple golpe (Guerrero)", ""),
        ("assets/vfx/nigromante/plague-ground1.png", "plaga en suelo", ""),
        ("assets/vfx/cazadora/rain-f2.png", "lluvia (Cazadora) cuadro 2", ""),
        ("assets/vfx/bosses/hielo/bsAngelPillar_1.png", "pilar/columna", ""),
    ]
    return hoja("03 · FX pintados que YA existen (referencia de cómo se hace un efecto pintado)",
                "Hoy NINGÚN efecto de habilidad de campeón es PNG: estos son los precedentes (skins, jefes, Axiom...). Ver docs/art-brief/00_ESPECIFICACION_TECNICA.md §2.2.5",
                celdas_de_rutas(items), 5, 250, 150)


def h04_iconos_habilidad():
    spg = leer_js("js/ui/skill-pixel-glyphs.js", "origin/claude/iconos-contrato")
    sim = leer_js("js/ui/skill-icon-motifs.js", "origin/claude/iconos-contrato")
    mot = {}
    mot.update(motivos(spg))
    mot.update(motivos(sim))
    mapa = dict(re.findall(r'"([a-z_]+:[012u])":"([a-z0-9_+]+)"', spg or ""))
    if not mapa:
        print("  (no se pudo leer SKILL_PIXEL_MAP; hoja 04 vacía)", file=sys.stderr)
    debiles = {"musashi:1", "musashi:2", "cazadora:1", "cazadora:2", "ilkan_colossus:0", "ilkan_colossus:2",
               "ilkan_colossus:u", "orsa:1", "mago:u", "vhal:u"}
    celdas = []
    for k, v in mapa.items():
        nombre = v.split("+")[0]
        filas = mot.get(nombre)
        im = pintar_icono(filas, COLOR_RANURA[k.split(":")[1]], 1) if filas else None
        celdas.append((im, "%s (%s)" % (k, nombre), "REDIBUJAR" if k in debiles else ""))
    return hoja("04 · Íconos de habilidad ACTUALES (16x16 procedurales, PR #119): hay que repintar los %d" % len(celdas),
                "Motivo ASCII de 12x12 dibujado con el color de ranura (celeste h1, lila h2, verde h3, oro definitiva). 'REDIBUJAR' = los pedidos por el PR #119 y el dueño",
                celdas, 12, 112, 100)


def h05_iconos_ui():
    src = leer_js("js/ui/pixel-icons.js", "origin/claude/emojis-a-pixel")
    if not src or "PXI_ART" not in src:
        src = leer_js("js/ui/pixel-icons.js", "origin/claude/emojis-a-pixel")
    celdas = []
    if src and "const PXI_ART" in src:
        pal_src = re.search(r"const PXI_PAL = \{(.*?)\};", src, re.S)
        pal = {}
        if pal_src:
            for m in re.finditer(r'(\w):"(#[0-9a-fA-F]{6})"', pal_src.group(1)):
                h = m.group(2)
                pal[m.group(1)] = tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
        cuerpo = src[src.index("const PXI_ART"):]
        cuerpo = cuerpo[:cuerpo.index("const PXI_EMOJI")] if "const PXI_EMOJI" in cuerpo else cuerpo
        ambiguos = {"idolo", "figura", "antena", "cuerno", "caballo", "huellas", "silencio", "enlace", "cadena",
                    "chispa", "estrella", "murcielago", "orbe", "ticket", "agujero", "carrito", "pechera", "vapor"}
        grillas = []
        for m in re.finditer(r"^\s{2}(\w+):\[((?:\s*\"[^\"]{16}\",?)+)\s*\]", cuerpo, re.M):
            filas = re.findall(r'"([^"]{16})"', m.group(2))
            if len(filas) == 16:
                grillas.append((m.group(1), filas))
        dic = dict(grillas)
        # íconos que el juego deriva por código de otros (PXI_ART.sinsenal / veneno / agua en pixel-icons.js)
        if "movil" in dic and "sinsenal" not in dic:
            f = []
            for y, r in enumerate(dic["movil"]):
                if 2 <= y <= 12:
                    a = list(r)
                    x = 3 + int(round((y - 2) * 0.9 + 1e-9))
                    a[x] = "r"
                    a[x + 1] = "r"
                    r = "".join(a)
                f.append(r)
            grillas.append(("sinsenal", f))
        if "gota" in dic:
            if "veneno" not in dic:
                grillas.append(("veneno", [r.replace("r", "n").replace("R", "N").replace("y", "m") for r in dic["gota"]]))
            if "agua" not in dic:
                grillas.append(("agua", [r.replace("r", "u").replace("R", "U").replace("y", "i") for r in dic["gota"]]))
        for nombre, filas in grillas:
            im = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
            px = im.load()
            for y, r in enumerate(filas):
                for x, c in enumerate(r):
                    if c in pal:
                        px[x, y] = pal[c] + (255,)
            # contorno automático
            base = im.copy()
            bp = base.load()
            for y in range(16):
                for x in range(16):
                    if bp[x, y][3] == 0 and any(0 <= y + dy < 16 and 0 <= x + dx < 16 and bp[x + dx, y + dy][3]
                                                for dy in (-1, 0, 1) for dx in (-1, 0, 1)):
                        px[x, y] = (18, 8, 6, 255)
            celdas.append((im, nombre, "AMBIGUO" if nombre in ambiguos else ""))
    if not celdas:
        print("  (no se pudo leer PXI_ART; hoja 05 vacía)", file=sys.stderr)
    return hoja("05 · Íconos de UI 16x16 de primera pasada (PR #118, emojis a píxel): %d" % len(celdas),
                "'AMBIGUO' = criterio visual de quien armó esta hoja (no lo mide ningún gate): no se entiende solo o repite otro ícono",
                celdas, 12, 112, 100, pie_lineas=2)


def h06_suelos():
    items = []
    for a, lst in (("abismo", ["tex_piso", "tex_borde", "tex_puente", "tex_runa", "tex_lava", "tex_carne", "tex_tentaculo"]),
                   ("ciudad", ["tex_adoquin", "tex_calle", "tex_tierra", "tex_techo", "tex_muralla", "tex_pared_ext", "tex_pared_int", "tex_ventana", "tex_puerta", "tex_puente", "tex_escombros"]),
                   ("minas", ["tex_suelo", "tex_roca", "tex_roca_mina", "tex_piso_superior", "tex_piso_galerias", "tex_piso_vetas", "tex_piso_corrompida", "tex_piso_profundidades", "tex_piso_umbral", "tex_tierra_superior"])):
        for t in lst:
            aviso = "PALETA_EXCESIVA" if t in ("tex_carne", "tex_tentaculo") and a == "abismo" else ""
            items.append(("assets/vfx/%s/%s.png" % (a, t), "%s/%s" % (a, t), aviso))
    return hoja("06 · Suelos y texturas de arena que YA son PNG (solo abismo, ciudad y minas)",
                "Las otras 6 arenas (bosque, hielo, laberinto, infernal, divina, acuática) dibujan el suelo por código (js/rendering/arena.js:buildFloorTile)",
                celdas_de_rutas(items), 6, 200, 120)


def h07_props():
    claves = ["altar", "arch", "bones", "brazier", "cart", "column", "dead-tree", "fallen", "fern", "moss-rock",
              "mushrooms", "oak", "pine", "slate", "tower-amber", "tower-blue"]
    items = [("assets/sprites/battlefield/%s.png" % k, k, "") for k in claves]
    items += [("assets/sprites/arenas/divina/castle_cel.png", "divina/castle_cel", ""),
              ("assets/sprites/arenas/divina/tower_inf_1.png", "divina/tower_inf_1", ""),
              ("assets/vfx/minas/lampara_0.png", "minas/lampara_0", ""),
              ("assets/vfx/minas/estalactita_0.png", "minas/estalactita_0", ""),
              ("assets/vfx/minas/cristal_azul_0.png", "minas/cristal_azul_0", ""),
              ("assets/vfx/minas/andamio_0.png", "minas/andamio_0", "")]
    return hoja("07 · Props de decorado de arena que YA son PNG (modelo para los 34 props procedurales)",
                "battlefieldProp(clave,x,y,alto,radio) en js/rendering/battlefield-art.js. Los 34 aidArt* de js/rendering/arena-props.js se dibujan por código",
                celdas_de_rutas(items), 6, 200, 190)


def h08_portadas():
    arenas = ["abismo", "acuatica", "bosque", "ciudad", "divina", "fortaleza", "hielo", "infernal", "laberinto", "micelial", "minas"]
    items = [("assets/ui/codex/arenas/%s.jpg" % a, "portada " + a, "960x420 JPG ILUSTRACION") for a in arenas]
    for n in ["titan", "titan_full", "cerbero", "devoraluz", "devoraluz_full", "esclavo", "insecto", "acechador", "minero", "escupidor", "consumidor"]:
        items.append(("assets/ui/codex/minas/%s.jpg" % n, "minas/" + n, "retrato JPG ILUSTRACION"))
    return hoja("08 · Portadas de arena (11) y retratos del Códice de Minas (11): todos JPG ilustración -> repintar en píxel nativo",
                "Portadas: se ven en el Códice, la ficha de arena, el campamento, las pantallas de historia y el Libro. Retratos de Minas: se precargan (js/arenas/minas/mn-render.js:20)",
                celdas_de_rutas(items), 4, 300, 150)


HOJAS = [("01_enemigos", h01_enemigos), ("02_monstruos_campo_de_batalla", h02_battlefield), ("03_fx_pintados_existentes", h03_fx),
         ("04_iconos_habilidad_actuales", h04_iconos_habilidad), ("05_iconos_ui_primera_pasada", h05_iconos_ui),
         ("06_suelos_texturas", h06_suelos), ("07_props_decorado", h07_props), ("08_portadas_y_retratos_codice", h08_portadas)]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--salida", default=os.path.join(RAIZ, "docs", "art-brief", "ejemplos", "mundo"))
    ap.add_argument("--solo", default="", help="números de hoja separados por coma, p. ej. 01,04")
    ap.add_argument("--formato", choices=["webp", "png"], default="webp")
    a = ap.parse_args()
    os.makedirs(a.salida, exist_ok=True)
    solo = {s.strip() for s in a.solo.split(",") if s.strip()}
    total = 0
    for nombre, fn in HOJAS:
        if solo and nombre[:2] not in solo:
            continue
        print("→ " + nombre)
        im = fn()
        ruta = os.path.join(a.salida, nombre + "." + a.formato)
        if a.formato == "webp":
            im.save(ruta, "WEBP", lossless=True, quality=100, method=6)
        else:
            im.save(ruta, "PNG", optimize=True)
        kb = os.path.getsize(ruta) / 1024
        total += kb
        print("   %s  %dx%d  %.0f KB" % (os.path.relpath(ruta, RAIZ), im.size[0], im.size[1], kb))
    print("TOTAL %.1f MB (tope %d MB)" % (total / 1024, TOPE_MB))
    if total / 1024 > TOPE_MB:
        print("ERROR: se pasó del tope", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
