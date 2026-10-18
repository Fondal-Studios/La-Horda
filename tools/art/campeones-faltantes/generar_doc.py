#!/usr/bin/env python3
"""Genera docs/art-brief/ASSETS_FALTANTES_CAMPEONES.md a partir de campeones_faltantes.json (lo escribe auditar.py).
Uso: python3 tools/art/campeones-faltantes/auditar.py && python3 tools/art/campeones-faltantes/generar_doc.py"""
import json, re, glob, os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
M = json.loads((ROOT / 'docs/art-brief/manifiestos/campeones_faltantes.json').read_text(encoding='utf8'))
CAT = json.loads((ROOT / 'docs/art-brief/manifiestos/atlas_catalogo.json').read_text(encoding='utf8'))
A, C = M['assets'], M['campeones']
ENT = M['entrega_dir']
EJ = 'docs/art-brief/ejemplos'


def esc(s):
    return str(s).replace('|', '\\|').replace('\n', ' ')


def refs_literales():
    pat = re.compile(r'assets/sprites/champions/[A-Za-z0-9_\-./]+?\.(?:png|webp|jpg)')
    refs = set()
    for f in glob.glob(str(ROOT / 'js/**/*.js'), recursive=True) + [str(ROOT / 'index.html')]:
        try:
            refs.update(pat.findall(open(f, encoding='utf8').read()))
        except Exception:
            pass
    rotas = [r for r in sorted(refs) if not (ROOT / r).exists() and not (r.endswith('.webp') and (ROOT / (r[:-5] + '.png')).exists())]
    return len(refs), rotas


def ref_celda(a):
    r = a.get('referencia')
    if not r:
        return '—'
    arch = r.get('archivo')
    txt = f'`{arch}`'
    if r.get('filas'):
        fs = r['filas']
        cu = ', '.join(f'{(f - 1) * 4}-{(f - 1) * 4 + 3}' for f in fs)
        txt += f' filas {",".join(map(str, fs))} (cuadros {cu})'
    elif r.get('grilla'):
        txt += ' filas 1-3 (cuadros 0-11)'
    if r.get('campeon'):
        txt += f' · de **{r["campeon"]}**'
    hoja = f'{EJ}/{a["campeon"]}/{a["id"]}__ref.webp'
    if (r.get('pack') or r.get('grilla')):
        txt += f'<br>hoja con rejilla: `{hoja}`'
    if r.get('motivo'):
        txt += f'<br><sub>{esc(r["motivo"])}</sub>'
    return txt


def tabla(lista):
    out = ['| Asset exacto | Para qué se usa | Prio · estado | Celda y formato | Archivo y carpeta destino | Ejemplo de referencia (asset existente de otro campeón) |', '|---|---|---|---|---|---|']
    for a in lista:
        dest = f'`{a["archivo_destino"]}`'
        if a.get('fila'):
            dest += f'<br>fila {a["fila"]}, cuadros {a["cuadros"][0]}-{a["cuadros"][-1]}'
        out.append(f'| {esc(a["asset"])} | {esc(a["uso"])} | **{a["prioridad"]}** · {a["estado"]} | {esc(a["celda"])}<br><sub>{esc(a["formato"])}</sub> | {dest} | {ref_celda(a)} |')
    return '\n'.join(out)


def main():
    n_ref, rotas = refs_literales()
    acc = [a for a in A if a['estado'] != 'BLOQUEADO_SIN_HOOK']
    blo = [a for a in A if a['estado'] == 'BLOQUEADO_SIN_HOOK']
    cnt = lambda L, p: sum(1 for a in L if a['prioridad'] == p)
    por_c = {}
    for a in A:
        por_c.setdefault(a['campeon'], []).append(a)
    ids = list(C)
    def score(c):
        L = [a for a in por_c.get(c, []) if a['estado'] != 'BLOQUEADO_SIN_HOOK']
        return (-sum(1 for a in L if a['prioridad'] == 'P0'), -sum(1 for a in L if a['prioridad'] == 'P1'), -len(L), c)
    orden = sorted(ids, key=score)
    tipos = {}
    for a in acc:
        tipos.setdefault(a['tipo'], {}).setdefault(a['prioridad'], 0)
        tipos[a['tipo']][a['prioridad']] += 1
    n_p0 = [c for c in ids if any(a['prioridad'] == 'P0' for a in por_c.get(c, []))]
    n_sin = [c for c in ids if not [a for a in por_c.get(c, []) if a['estado'] != 'BLOQUEADO_SIN_HOOK']]
    recol = [a for a in acc if a['estado'] == 'RECOLOR']

    L = []
    w = L.append
    w('# La Horda — Assets faltantes de campeones (auditoría + ejemplos de referencia)')
    w('')
    w('> Para el pintor/dibujante. Este documento dice **qué falta dibujar**, **para qué lo usa el juego**, **con qué prioridad**, **en qué formato exacto**, **dónde dejar el archivo** y **qué asset ya existente mirar como ejemplo**.')
    w('> No duplica la especificación técnica: léela completa primero (`docs/art-brief/00_ESPECIFICACION_TECNICA.md`, PR #124). Todo lo medido aquí se corrió el 2026-10-18 sobre la rama `claude/spec-arte-tecnica` (commit `4973682`, encima de `main` `d57cf5e`). Lo que no se pudo medir está en la sección 8.')
    w('> Este PR **depende del PR #124** (contiene su especificación y plantillas). No modifica código del juego: solo documentación, manifiestos y herramientas de lectura.')
    w('')
    w('**Archivos de esta entrega**')
    w('')
    w('| Archivo | Qué es |')
    w('|---|---|')
    w('| `docs/art-brief/ASSETS_FALTANTES_CAMPEONES.md` | este documento (generado por `tools/art/campeones-faltantes/generar_doc.py`) |')
    w('| `docs/art-brief/manifiestos/campeones_faltantes.json` | lo mismo, legible por máquina: campeón, asset, ruta destino, prioridad, referencia, estado |')
    w('| `docs/art-brief/manifiestos/atlas_catalogo.json` | volcado del juego real: atlas registrados, celdas, sets de animación, skins (lo usa el generador de ejemplos) |')
    w('| `docs/art-brief/ejemplos/<campeón>/` | hojas de contacto con rejilla: `00_actual_*.webp` (lo que ya existe) y `<asset>__ref.webp` (la referencia) |')
    w('| `tools/art/gen-referencias.py` | genera/regenera esas hojas para un campeón, un asset o los N con más faltantes |')
    w('| `tools/art/campeones-faltantes/` | `volcar.js` (lee el juego), `auditar.py` (mide y arma el manifiesto), `generar_doc.py` (escribe este documento) |')
    w('')
    # ---------------------------------------------------------------- 1
    w('## 1. Resumen')
    w('')
    w(f'Roster auditado: **{len(ids)} campeones** (`CLASSES`; `node tools/factory/audit-roster.js` confirma 43), **143 atlas registrados** (`CHAMP_PACK`: 43 cuerpos base, formas e invocaciones, 34 skins de set, 43 cromas/skins; 0 fallidos, 0 errores de página), **34 skins de set**, **43 cromas/skins de catálogo** y **16 skins de Ascensión pendientes de revisión**. Formas: Coloso de Arena de Ilkan, Coloso del Nigromante, caballo del Libertador, Berrinche de Myla, gólems, esqueletos, lobo.')
    w('')
    w(f'**Se encontraron {len(A)} entradas**, de las cuales **{len(acc)} se pueden dibujar y entregar hoy** y **{len(blo)} están bloqueadas** porque el juego todavía no puede cargar ese arte (FX de habilidad e íconos 16×16: ver `00_ESPECIFICACION_TECNICA.md` secciones 2.2.7 y 8).')
    w('')
    w('| Prioridad | Significado | Dibujables hoy | Bloqueadas (FX/íconos) |')
    w('|---|---|---|---|')
    for p, s in (('P0', 'bloquea jugar bien: un estado que se ve en toda partida hoy cae a un sprite procedural o a la pose de otro estado'), ('P1', 'se nota: hay sustituto pero se ve mal (ataque de frente con la pose de perfil, lanzar = ataque, skin que es un recolor, forma sin golpe/muerte)'), ('P2', 'pulido: cuadros repetidos, siluetas partidas, skins extra para llegar a 2 por campeón, formas secundarias')):
        w(f'| **{p}** | {s} | **{cnt(acc, p)}** | {cnt(blo, p)} |')
    w('')
    w('Dibujables hoy, por tipo y prioridad:')
    w('')
    w('| Tipo | P0 | P1 | P2 | Qué es |')
    w('|---|---|---|---|---|')
    desc = {'cuerpo': 'filas faltantes o repetidas del atlas del cuerpo base', 'skin': 'skins rediseñadas (hoy recolor) o nuevas, y filas que faltan en una skin', 'forma': 'formas e invocaciones (Coloso, Berrinche, caballo, gólems, lobo)', 'calidad': 'defectos medidos en hojas existentes (cuadros repetidos, siluetas partidas, repintado)'}
    for t in ('cuerpo', 'skin', 'forma', 'calidad'):
        d = tipos.get(t, {})
        w(f'| {t} | {d.get("P0", 0)} | {d.get("P1", 0)} | {d.get("P2", 0)} | {desc[t]} |')
    w('')
    w(f'* **{len(n_p0)} campeones tienen algún P0**: {", ".join("`%s`" % c for c in n_p0)}. Cinco carecen de pose de muerte (`tanque`, `guerrero`, `soporte`, `libertador`, `myla`) y Ynara la tiene como un cuadro del ataque.')
    w(f'* **{len(recol)} skins de Ascensión son recolores** de su cuerpo base (misma silueta, IoU ≥ 0,90) aunque se presentan como skins: {", ".join("`%s`" % a["id"].split(".")[-1] for a in recol)}.')
    w(f'* **{len(n_sin)} campeones no tienen ningún faltante dibujable** (solo FX/íconos bloqueados): {", ".join("`%s`" % c for c in n_sin)}.')
    w('* Los **retratos** y las **miniaturas de campeón** no son faltantes: el Códice dibuja el sprite real animado y ningún `.js` carga `assets/sprites/champions/<id>/preview.png` de un campeón base (búsqueda en `js/`); todas las miniaturas de skins que el juego sí carga existen (verificado: 77 de 77 rutas `preview` de `SET_SKINS`/`CROMA_SKINS`).')
    w('')
    w('### 1.1 Por campeón (solo lo dibujable hoy)')
    w('')
    w('| Campeón | Rol · ataque | Atlas actual (familia) | P0 | P1 | P2 | Skins de diseño propio | Sección |')
    w('|---|---|---|---|---|---|---|---|')
    for c in orden:
        Lc = [a for a in por_c.get(c, []) if a['estado'] != 'BLOQUEADO_SIN_HOOK']
        k = C[c]
        sk = sum(1 for s in k['skins_registradas'] if s['tipo'] in ('set', 'skin'))
        pend = len(k['skins_pendientes_ascension'])
        w(f'| `{c}` | {k["rol"]} · {k["ataque"]} | `{k["atlas_actual"]}` ({k["familia_atlas"]}) | {sum(1 for a in Lc if a["prioridad"] == "P0")} | {sum(1 for a in Lc if a["prioridad"] == "P1")} | {sum(1 for a in Lc if a["prioridad"] == "P2")} | {sk}{f" + {pend} pend." if pend else ""} | [{c}](#{c}) |')
    w('')
    # ---------------------------------------------------------------- 2
    w('## 2. Cómo leer las tablas y qué entregar')
    w('')
    w('1. **Una hoja por campeón.** Aunque una fila falte sola (p. ej. "muerte"), entrega la **hoja completa de 36 poses** `hoja_36poses.png` (448×1008, 4 columnas × 9 filas de 112×112; orden de filas en `00_ESPECIFICACION_TECNICA.md` 2.1.2). Motivo: el repo manda pedir la hoja completa y nunca mezclar cuadros de dos hojas (`LA_HORDA_ASSETS_FALTANTES.md`, regla NO FRANKENSTEIN). Las filas que **ya existen** pueden trasladarse del atlas actual (ruta en la tabla de cada campeón y hoja `00_actual_*.webp`) si el estilo coincide; el importador reescala con vecino más cercano.')
    w('2. **Archivo destino** = dónde dejas el archivo (carpeta de entrega, convención de la especificación 6.1). **Ruta final** = dónde lo instala Claude; no copies nada a `assets/` ni toques `js/`.')
    w('3. **Ejemplo de referencia** = un asset ya existente de **otro campeón** del mismo rol y escala, elegido porque la fila pedida está completa en él (4 cuadros distintos, una sola silueta, 62–72 px de alto). Sirve para ver pose, ritmo, escala y apoyo de pies; **no se copia el diseño**.')
    w('4. **Estados**: `FALTA` (no existe; el motor usa otra pose) · `PLACEHOLDER` (existe pero reutiliza el dibujo de otro estado) · `RECOLOR` (skin que solo cambia la paleta) · `REVISAR` (defecto medido, decide una persona) · `BLOQUEADO_SIN_HOOK` (el juego aún no puede cargar ese arte).')
    w('5. **Paleta** (decisión del dueño): la Art Bible pide 4–6 colores **base** por personaje y el Style Gate mide 1.484–2.535 colores por cuadro; son compatibles: las variaciones tonales de los colores base llenan ese rango. Verificado: `style_gate.py` da **PASS en los 68 atlas canónicos del repo** (bases y skins de 448×1008).')
    w('6. **Formato fijo** (de la especificación): PNG RGBA, alfa solo 0 o 255, contorno oscuro de 1 px, perfil mirando a la **derecha** (la izquierda se espeja), pies en la fila 106 de la celda (muerte: borde inferior en 106), una sola silueta conectada por pose, sin texto, rejilla ni fondo. Nada de efectos pintados dentro del cuerpo.')
    w('7. **Originalidad**: todo debe ser obra original (sección 5 de la especificación; caso Eren → Ilkan). Declara cualquier paso asistido por IA en el manifiesto de entrega.')
    w('8. **Skins**: son cosméticas (no alteran estadísticas). Skin = ropa/armadura/accesorios/silueta; croma = solo paleta (`AGENTS.md` punto 6, `docs/skins-audit/README.md`). El objetivo del repo es **2 skins por campeón** (`docs/production/roster-repair/README.md`: "pedido de 50 con dos skins cada uno"; hoy hay 43 campeones: **faltan 7 campeones que no existen en el repo y no están en este documento**).')
    w('')
    # ---------------------------------------------------------------- 3
    w('## 3. Problemas hallados (medidos, con ruta)')
    w('')
    P = []
    P.append(('Pose de muerte ausente o sustituida', 'Tanque y Asesino (`guerrero`) solo tienen reposo/caminar/ataque en 4 direcciones (`js/rendering/champion-sprites.js:107-114`; clips medidos con `volcar.js`); Elyra (`soporte`), Libertador y Myla no tienen `death_*`; **Ynara usa el cuadro 12 (un cuadro del ataque) como muerte y definitiva** (`js/assets/champion-sprites.js`, sets de `assets/sprites/champions/ynara/atlas.png`, 384×576).', 'P0'))
    P.append(('Lanzar = ataque (misma pose)', 'Elyra, Ynara y Myla: `cast_*` apunta exactamente a los mismos cuadros que `attack_*` (medido por hash de silueta+color). Tanque y Asesino no tienen `cast`.', 'P1'))
    P.append(('Definitiva sin pose propia en un kit que la usa', 'Ynara (`ultimate_*`=cuadros 12-15 del ataque), Myla (`ultimate_down=[3]`, un cuadro del ataque) y la skin `vesper_skin` (atlas de 448×896: `ultimate_*` repite los cuadros 24-27 de lanzar). Brasa, Eslabón, Morwen, Farolero e Iria tienen definitiva de solo 2 cuadros (16-17) en vez de 4 (P2).', 'P1'))
    P.append(('Ataque solo de perfil', 'Segador, Axiom, Profeta, Musashi, Cazadora, Nigromante, Libertador e Ilkan no tienen `attack_down` ni `attack_up`: el motor cae a la pose de perfil (`js/assets/champion-sprites.js` `champPackNormalize`).', 'P1'))
    P.append(('Mago: una sola vista', '`assets/sprites/champions/mago/atlas.png` (1254×1254) trae una vista 3/4 para todo: sin caminar de frente/espalda ni ataque propio (clips `idle, walk, cast, hurt, death`).', 'P1'))
    P.append(('Skins de Ascensión que son recolores', f'{len(recol)} de las 16 skins `*_alt*` (estado `GENERATED_PENDING_REVIEW`, `js/champions/ascension/register.js:30`) tienen IoU de silueta ≥ 0,90 contra el cuerpo base; `nano_gm_alt1` además casi no cambia de color (diferencia media 11,1 sobre 765). Los 9 campeones de Ascensión no tienen skins registradas en el Códice (`docs/bible/generated/CHAMPION_AUDIT.md`: "0 skins, 0 cromas").', 'P1'))
    P.append(('Ilkan: arte procedural sin revisión humana', '`docs/ILKAN_REWORK.md` ("Arte" y "Pendientes"): cuerpo y Coloso generados por código (`tools/art/ilkan/build.py`), atlas fuera de formato canónico; el Coloso (`ilkan/v2/colossus.webp`) no tiene golpe ni muerte.', 'P1'))
    P.append(('Cuadros repetidos dentro de un ciclo', 'Caminar con 3 dibujos distintos en 4 cuadros: Nahir, Facu GM, Khepri (abajo y perfil); Ataque de perfil: Baltra y Bront; ataque arriba: Brakk. Ver `[0,1,0,3]` en `sets_crudos` del catálogo.', 'P2'))
    sp = [(a['campeon'], int(re.search(r'Revisar (\d+)', a['asset']).group(1))) for a in A if a['id'].endswith('siluetas_partidas')]
    sp.sort(key=lambda x: -x[1])
    P.append(('Siluetas partidas en hojas canónicas', f'La especificación exige una sola silueta conectada por pose; hay cuadros con más de una pieza de ≥ 12 px en {len(sp)} campeones (los peores: ' + ', '.join(f'{c} {n} cuadros' for c, n in sp[:3]) + '). Puede ser intencional (chispas, halos).', 'P2'))
    P.append(('Alfa semitransparente en las hojas heredadas', '`tools/art/scan_sprites.py --dir champions`: `tanque/atlas.png` 43,2 % de píxeles con alfa parcial, `guerrero/atlas.png` 50,8 %, `mago/atlas.png` 51,0 % (contra el canon 0/255). El Caballero es la Master Reference: **[DECIDE EL DUEÑO]** si se re-exporta (`00_ESPECIFICACION_TECNICA.md` C2).', 'P2'))
    P.append(('Documentos desactualizados', '`LA_HORDA_ASSETS_FALTANTES.md` dice que Tanque·Asesino·Mago·Soporte carecen de "cast · hurt · muerte": medido, el Mago sí tiene cast, hurt y muerte; Tanque y Asesino carecen de los tres; Elyra solo de muerte (y su cast es el ataque). `docs/production/roster-audit.json` lista 19 de 43 campeones. `docs/ART_REPLACEMENT_QUEUE.md` pide la forma demoníaca del Nigromante, que hoy es el coloso de carne cosida (`docs/production/nigromante-coloso/README.md`).', '—'))
    w('| Hallazgo | Evidencia | Prio |')
    w('|---|---|---|')
    for t, e, p in P:
        w(f'| **{t}** | {e} | {p} |')
    w('')
    w('**Lo que sí está bien (medido)**')
    w('')
    w(f'* `node tools/art/roster_gate.js`: `{{"appearances":136,"scaleFailures":0,"presentationFailures":0,"errors":0}}`.')
    w('* `node tools/art/skin_audit.js` (138 packs): 0 fallas, 0 errores de página; **62 packs con avisos WARN** de "cuadro que parece mirar al otro lado" (el peor: Maura, 13 avisos; también `croma_maura_croma`).')
    w('* `python3 tools/art/painter/style_gate.py <atlas>` sobre los 68 atlas de 448×1008 (bases y skins): 68 PASS.')
    w('* `python3 tools/art/scan_sprites.py --dir champions`: 205 de 541 archivos con avisos (mayormente `halo`); no son faltantes pero conviene limpiar los atlas nuevos con `--dir champions/<id>`.')
    w(f'* Barrido de rutas literales `assets/sprites/champions/*` en `js/` e `index.html`: {n_ref} rutas, **{len(rotas)} rotas**.')
    w('* `node tools/factory/audit-roster.js`: 43 campeones; solo `nano_gm` y `facu_gm` marcan "missing champion set" (no es arte).')
    w('')
    # ---------------------------------------------------------------- 4
    w('## 4. Orden de trabajo sugerido')
    w('')
    w('| Lote | Qué | Por qué primero |')
    w('|---|---|---|')
    w(f'| **0 · Muestra** | 1 campeón completo: `tanque` (muerte + lanzar + golpe) | La especificación pide "muestra primero" (6.4). Es el campeón de referencia del estilo; valida formato, importador y gates antes del lote grande. |')
    w(f'| **1 · P0** | {", ".join("`%s`" % c for c in n_p0)}: fila 9 (muerte) y lo demás de su tabla | Sin muerte propia hoy cae un sprite procedural/rotado en cada derrota. |')
    w('| **2 · P1 de cuerpo** | `soporte`, `ynara`, `myla`, `libertador`, `mago`, luego los 6 clásicos con ataque solo de perfil, luego las definitivas placeholder | Cada fila falta o repite otra pose. |')
    w('| **3 · P1 de skins y formas** | skins `RECOLOR` (Ascensión), `vesper_skin` fila 8, `axiom`/`ilkan` skins, Coloso de Ilkan, Berrinche de Myla | Hoy se venden/muestran como skin algo que es un recolor. |')
    w('| **4 · P2** | cuadros repetidos, siluetas partidas, skins extra (hasta 2 por campeón), formas secundarias | Pulido. |')
    w('| **Bloqueado** | FX e íconos (86 entradas) | No entregar en masa hasta que Claude construya H1/H2/H5 (especificación sección 8); se puede entregar 1 muestra. |')
    w('')
    w('### 4.1 Dónde dejar los archivos')
    w('')
    w('```')
    w(f'{ENT}/')
    w('  entrega.json                      # manifiesto (especificación 6.2): autor, proveniencia, lista de assets')
    w('  campeones/<id>/hoja_36poses.png    # 448x1008, una por campeón (+ <id>.aseprite en fuentes/)')
    w('  skins/<id_skin>/hoja_36poses.png   # una por skin')
    w('  formas/<forma>/atlas.png           # misma celda y grilla que el atlas actual de la forma')
    w('  fx/<id>/  iconos/  fuentes/        # solo cuando se desbloquee el hook')
    w('```')
    w('')
    w('El campo `archivo_destino` de cada asset en `campeones_faltantes.json` es la ruta exacta. Deja el lote en una rama `art/<lote>`; no toques `js/` ni `assets/`.')
    w('')
    w('### 4.2 Cómo auditar este documento antes de empezar')
    w('')
    w('```bash')
    w('python3 -m http.server 8933 --bind 127.0.0.1 &     # puerto libre (verifica con ps antes)')
    w('ART_BASE_URL=http://127.0.0.1:8933 PLAYWRIGHT_MODULE=<ruta a playwright> node tools/art/campeones-faltantes/volcar.js')
    w('python3 tools/art/campeones-faltantes/auditar.py          # regenera el manifiesto: debe dar los mismos conteos')
    w('python3 tools/art/campeones-faltantes/generar_doc.py      # regenera este documento')
    w('python3 tools/art/gen-referencias.py --campeon tanque    # abre docs/art-brief/ejemplos/tanque/*.webp')
    w('```')
    w('')
    w('### 4.3 Cómo validar una entrega (comandos exactos, desde la raíz del repo)')
    w('')
    w('```bash')
    w('# 1) importar la hoja (rechaza: grilla mal armada, silueta pegada al borde, < o > 36 siluetas, recorte al escalar)')
    w('sha256sum art-source/entregas/2026-10_campeones-faltantes/campeones/tanque/hoja_36poses.png')
    w('echo \'{"source":"art-source/entregas/2026-10_campeones-faltantes/campeones/tanque/hoja_36poses.png","sourceSha256":"<sha256>"}\' > /tmp/tanque.json')
    w('python3 tools/factory/import-authored-sheet.py /tmp/tanque.json /tmp/tanque_out        # -> atlas.png, preview.png, import-report.json (IMPORTED_NOT_APPROVED)')
    w('# 2) limpieza técnica del atlas ya en su sitio (halo, semialfa, fragmentos; solo informa)')
    w('python3 tools/art/scan_sprites.py --dir champions/tanque')
    w('# 3) estilo (cuadros de caminar: colores, contorno, sombreado, detalle)')
    w('python3 tools/art/painter/style_gate.py /tmp/tanque_out/atlas.png')
    w('# 4) con el atlas integrado por Claude: escala/pies contra el Caballero y vistas izquierda/derecha')
    w('ROSTER_BASE_URL=http://127.0.0.1:8933 node tools/art/roster_gate.js')
    w('SE_BASE_URL=http://127.0.0.1:8933 PACKS=tanque node tools/art/skin_audit.js /tmp/audit_tanque')
    w('# 5) revisión humana contra el Caballero (docs/ART_BIBLE.md §8): PASS / FIX / REDRAW / REJECT')
    w('```')
    w('')
    w('El importador pide que **cada pose sea una silueta separada y conectada** y que ninguna toque el borde del lienzo; entrega las 36 poses ya en su celda de 112×112 con huecos transparentes. `STRUCTURAL_PASS`/`IMPORTED_NOT_APPROVED` **no** equivalen a aprobación (`AGENTS.md` punto 7).')
    w('')
    # ---------------------------------------------------------------- 5
    w('## 5. Tablas por campeón')
    w('')
    w('Cada tabla trae primero lo dibujable hoy; al final, en la misma tabla, las dos entradas bloqueadas (FX e íconos). La hoja `00_actual_*.webp` muestra el atlas **actual** con rejilla y numeración; `<asset>__ref.webp` muestra la referencia.')
    w('')
    for c in orden:
        k = C[c]
        Lc = por_c.get(c, [])
        acc_c = [a for a in Lc if a['estado'] != 'BLOQUEADO_SIN_HOOK']
        blo_c = [a for a in Lc if a['estado'] == 'BLOQUEADO_SIN_HOOK']
        w(f'<a id="{c}"></a>')
        w(f'### {c} — {esc(k["nombre"])}')
        w('')
        w(f'* Rol **{k["rol"]}**, ataque {k["ataque"]}, categoría {k["categoria"]}, motor de FX {k["motor_fx"]}; {"usa" if k["usa_pose_definitiva"] else "no usa"} la fila de definitiva.')
        w(f'* Atlas actual: `{k["atlas_actual"]}` — {k["familia_atlas"]}' + (f', celda {k["celda_actual"][0]}×{k["celda_actual"][1]}' if k['celda_actual'] else '') + f'. Hoja de lo existente: `{EJ}/{c}/00_actual_{k["pack_base"] or c}.webp`.')
        sk = ', '.join(f'`{s["id"]}` ({s["tipo"]})' for s in k['skins_registradas']) or 'ninguna'
        pe = ', '.join(f'`{s["id"]}` (IoU {s["iou_vs_base"]})' for s in k['skins_pendientes_ascension'])
        w(f'* Skins/cromas registrados: {sk}.' + (f' Skins de Ascensión pendientes: {pe}.' if pe else ''))
        w('')
        if not acc_c:
            w('Sin faltantes dibujables hoy.')
            w('')
        w(tabla(acc_c + blo_c))
        w('')
    # ---------------------------------------------------------------- 6
    w('## 6. Contrato mínimo de cada asset (resumen; el detalle está en la especificación)')
    w('')
    w('| Asset | Celda / tamaño | Nombre y carpeta | Referencia en la especificación |')
    w('|---|---|---|---|')
    w(f'| Hoja de campeón o skin | 448×1008, 36 poses de 112×112 | `{ENT}/campeones/<id>/hoja_36poses.png` o `.../skins/<id_skin>/hoja_36poses.png` | 2.1 |')
    w(f'| Forma / invocación | la celda y columnas de su atlas actual (en cada tabla) | `{ENT}/formas/<forma>/atlas.png` | 2.1 (criterio) y tablas de este documento |')
    w(f'| Tira de FX (bloqueado) | por tamaño de radio: 32/48/64/80/96/128/160/192 px × 8–12 cuadros | `{ENT}/fx/<id>/<habilidad>_<arte>_<S>x<n>f.png` | 2.2 y 7 |')
    w(f'| Íconos de habilidad (bloqueado) | 16×16, glifo en [1,14], 4–6 colores | `{ENT}/iconos/<id>_{{basic,0,1,2,u}}.png` | 2.6 |')
    w('')
    # ---------------------------------------------------------------- 7/8
    w('## 7. Cómo regenerar los ejemplos')
    w('')
    w('```bash')
    w('python3 tools/art/gen-referencias.py --campeon segador              # su hoja actual + la referencia de cada faltante')
    w('python3 tools/art/gen-referencias.py --asset tanque.cuerpo.muerte    # solo una referencia')
    w('python3 tools/art/gen-referencias.py --top 10                        # los 10 campeones con más faltantes')
    w('python3 tools/art/gen-referencias.py --campeon segador --copiar-crudo  # además copia el atlas de referencia (solo lectura)')
    w('python3 tools/art/gen-referencias.py --pack veyra --filas 4,7,8,9    # hoja suelta de cualquier pack del catálogo')
    w('```')
    w('')
    w('## 8. Límites: lo que no se pudo verificar o no está decidido')
    w('')
    w('* **Dos campeones sin pack en el catálogo** (`tanque`, `guerrero`) y el `mago` se dibujan con su propio sistema (`DIR_ATLASES`, `drawMagoAtlas`); su "hoja actual" es la imagen completa reducida, sin numeración de cuadros del motor.')
    w('* El **catálogo de skins** cuenta como skin de diseño propio toda skin de set y todo croma con `appearanceType: "skin"`; los cromas de paleta no cuentan. La regla "2 por campeón" sale de `docs/production/roster-repair/README.md`; el dueño puede cambiarla (cambia el número de entradas `skin.nueva_*`).')
    w('* **Los conceptos de las skins nuevas están sin definir**: no se inventaron; cada entrada `skin.nueva_*` dice "A DEFINIR POR EL DUEÑO". Las skins `RECOLOR` de Ascensión sí traen el concepto escrito en el repo (`visualTheme`).')
    w('* La clasificación P0/P1/P2 es mía, con el criterio de la tabla de la sección 1; no es una decisión de diseño del dueño.')
    w('* El umbral de "recolor" (IoU de silueta ≥ 0,90 contra el cuerpo base en celdas idénticas) es heurístico; `khepri_alt2` (0,939) y `nano_gm_alt1` (0,915) están cerca del límite; revisar a ojo con las hojas.')
    w('* "Silueta partida" cuenta piezas conexas de ≥ 12 px con alfa > 127; no distingue chispas intencionales de piezas mal cortadas.')
    w('* No se midió: rendimiento en dispositivo real, multijugador real, ni la calidad artística (revisión humana con el Visual Gate, `docs/ART_BIBLE.md` §8). Ninguna entrada de este documento aprueba arte.')
    w('* FX, íconos, proyectiles y props de habilidad dependen de los contratos H1–H9 de la especificación; hasta que existan, esas entradas quedan `BLOQUEADO_SIN_HOOK`.')
    w('* `nano_gm` y `facu_gm` son categoría FOUNDER/TESTING y sin set propio (no es de arte): se incluyen porque su cuerpo y skins sí cuentan.')
    w('')
    (ROOT / 'docs/art-brief/ASSETS_FALTANTES_CAMPEONES.md').write_text('\n'.join(L), encoding='utf8')
    print('md lineas', len(L), 'rotas', rotas)


if __name__ == '__main__':
    main()
