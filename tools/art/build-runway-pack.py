#!/usr/bin/env python3
"""Genera el PAQUETE DE INSTRUCCIONES DE RUNWAY (docs/art-brief/runway-pack/) a partir de los datos reales del repo:
  - docs/art-brief/runway-pack/data/game-data.json   (node tools/art/dump-game-data.js: campeones, enemigos, kit, lore, arte actual)
  - docs/production/asset-blocks.json                (731 bloques de dibujo y sus items)
  - docs/art-brief/manifiestos/mundo_faltantes.json  (1061 filas: uso, formato, ruta de entrega, estado)
  - docs/art-brief/manifiestos/campeones_faltantes.json, docs/art-brief/campeones/<id>.md (identidad visual por campeón)
Salida: campeones/<id>.md, enemigos/<arena>.md, bloques/<grupo>.md y bloques.json. Los textos de método general (README, RECETA, POSES, ENEMIGOS_GUIA)
son a mano. Uso:  python3 tools/art/build-runway-pack.py   (desde la raíz del repo; se puede volver a correr)
No inventa arte ni aprueba nada: solo ordena instrucciones. Cobertura verificada por tools/art/test-runway-pack.py."""
import json, os, re, sys, collections
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PK = os.path.join(ROOT, 'docs/art-brief/runway-pack')
J = lambda p: json.load(open(os.path.join(ROOT, p), encoding='utf-8'))
game = J('docs/art-brief/runway-pack/data/game-data.json')
blocks = J('docs/production/asset-blocks.json')
mundo = {r['id']: r for r in J('docs/art-brief/manifiestos/mundo_faltantes.json')['filas']}
camp_m = J('docs/art-brief/manifiestos/campeones_faltantes.json')['campeones']
CH, EN = game['champions'], game['enemies']

# ---------------------------------------------------------------- poses de campeón (atlas 4 columnas x 9 filas, 112x112)
DIRS = {'abajo': ('frente (de cara a la cámara)', 'down'), 'perfil': ('perfil mirando a la DERECHA', 'side'), 'arriba': ('de espaldas a la cámara', 'up')}
BEATS = {
  'caminar': ['contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas', 'paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba',
              'contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados)', 'paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1'],
  'ataque': ['anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás', 'golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado',
             'impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia', 'recuperación: vuelve a postura de guardia, arma recogida'],
  'lanzar': ['reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto)', 'alzar: brazos o arma suben, el cuerpo se estira hacia arriba',
             'liberar: empuje al frente con la pose más abierta y dinámica', 'recuperar: baja los brazos y vuelve a guardia'],
  'definitiva': ['carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan', 'estallido: se levanta de golpe, brazos abiertos o arma en alto',
                 'pico: pose heroica de máxima apertura, la más grande de todo el atlas', 'liberación: la energía sale, el cuerpo cae a guardia'],
  'muerte': ['impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan', 'tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma',
             'caída: el cuerpo cae de costado, pies despegados del suelo', 'tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda'],
}
BEATS_EN = {
  'caminar': ['walk contact: front foot planted, body at its lowest, arms opposite to the legs', 'walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted',
              'walk contact on the other foot (mirror of the first with arms and legs swapped)', 'walk passing on the other side: body high, closing the loop back to the first frame'],
  'ataque': ['attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot', 'attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward',
             'attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia', 'attack recovery: back to guard stance, weapon drawn in'],
  'lanzar': ['casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)', 'casting raise: arms or weapon rise, the body stretches upward',
             'casting release: thrust forward, the widest and most dynamic pose', 'casting recover: arms lower, back to guard'],
  'definitiva': ['ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting', 'ultimate burst: rises abruptly, arms spread or weapon raised',
                 'ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet', 'ultimate release: energy leaves, the body drops to guard'],
  'muerte': ['death impact: struck, head thrown back, weapon or shield loosening', 'death stagger: knees buckling, body leaning, one hand lets go of the weapon',
             'death fall: body falling sideways, feet off the ground', 'death lying: body on the ground, motionless, lowest edge resting on the foot line'],
}
ROLE_EN = {'mago': 'mage', 'asesino': 'assassin', 'tanque': 'tank', 'soporte': 'support'}
POSES = []
for r, (state, d) in enumerate([('caminar', 'abajo'), ('caminar', 'perfil'), ('caminar', 'arriba'), ('ataque', 'abajo'), ('ataque', 'perfil'), ('ataque', 'arriba'), ('lanzar', 'abajo'), ('definitiva', 'abajo'), ('muerte', 'abajo')]):
    for k in range(4):
        POSES.append({'idx': r * 4 + k, 'fila': r + 1, 'col': k + 1, 'estado': state, 'dir': d, 'dir_txt': DIRS[d][0], 'beat': BEATS[state][k], 'beat_en': BEATS_EN[state][k]})
assert len(POSES) == 36
POSE_GROUPS = {  # nombre de item de bloque -> (estado, dir|None, cuadros)
  'caminar_abajo': ('caminar', 'abajo', range(0, 4)), 'caminar_lado': ('caminar', 'perfil', range(4, 8)), 'caminar_perfil': ('caminar', 'perfil', range(4, 8)), 'caminar_arriba': ('caminar', 'arriba', range(8, 12)),
  'ataque_abajo': ('ataque', 'abajo', range(12, 16)), 'ataque_perfil': ('ataque', 'perfil', range(16, 20)), 'ataque_lado': ('ataque', 'perfil', range(16, 20)), 'ataque_arriba': ('ataque', 'arriba', range(20, 24)),
  'lanzar': ('lanzar', 'abajo', range(24, 28)), 'definitiva': ('definitiva', 'abajo', range(28, 32)), 'muerte': ('muerte', 'abajo', range(32, 36)), 'golpe': ('golpe', 'abajo', range(12, 13))}

STYLE = ('Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, '
         'no gradients, no glow, no text, no effects overlapping the body, plain dark background.')

def champ_sum(c):
    return f"{c['name']}, {ROLE_EN.get(c['roleCategory'], c['roleCategory'])}, class color {c['color']}"

def pose_prompt(c, p):
    face = {'abajo': 'facing the camera', 'perfil': 'facing right in side profile', 'arriba': 'seen from behind (back to the camera)'}[p['dir']]
    return (f"Pixel art game sprite of the character in @codex ({champ_sum(c)}), redrawn in exactly the pose of @pose "
            f"({p['beat_en']}): same body pose, same framing, same facing ({face}). Keep the @codex design, outfit and palette exactly; "
            f"do not copy the face style or colors of the pose reference. {STYLE}")

def golpe_prompt(c):
    return (f"Pixel art game sprite of the character in @codex ({champ_sum(c)}), redrawn in exactly the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), "
            f"same framing, facing the camera. Keep the @codex design and palette exactly. {STYLE}")

# ---------------------------------------------------------------- identidad visual (extracto del brief del campeón)
def brief_identity(cid):
    p = os.path.join(ROOT, 'docs/art-brief/campeones', cid + '.md')
    if not os.path.exists(p):
        return None
    t = open(p, encoding='utf-8').read()
    m = re.search(r'^## A\. Identidad\n(.*?)(?=^## )', t, re.S | re.M)
    return m.group(1).strip() if m else None

# ---------------------------------------------------------------- campeones
def champion_md(cid, c, pend):
    L = []
    L.append(f"# {c['name']} (`{cid}`) — instrucciones de Runway\n")
    L.append('> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.\n')
    L.append('## 1. Quién es (lo que el dibujo tiene que respetar)\n')
    L.append(f"- **Rol:** {c['role'] or '—'} (categoría `{c['roleCategory']}`) · ataque básico {'a distancia' if c['ranged'] else 'cuerpo a cuerpo'} (alcance {c['basicRange']} u{', en arco' if c['basicArc'] else ''}).")
    L.append(f"- **Color de clase:** `{c['color']}` · brillo `{c['glow']}`.")
    if c.get('origin') or c.get('history'):
        L.append(f"- **Origen:** {c.get('origin') or '—'}. {c.get('history') or ''}")
    elif c.get('catalogLore'):
        L.append(f"- **Lore:** {c['catalogLore']}")
    L.append(f"- **Lámina del Códice (referencia `@codex`):** `assets/ui/codex/champions/{cid}.png` (original) — es la fuente de verdad del diseño: ropa, pelo, colores y proporciones.")
    L.append(f"- **Atlas actual en el juego:** {('`' + c['atlasActual'] + '`') if c['atlasActual'] else '**no tiene atlas propio** (se arma desde cero o desde un donante: ver `../RECETA.md` §7)'}.\n")
    ident = brief_identity(cid)
    if ident:
        L.append('### Identidad visual (extracto de `docs/art-brief/campeones/%s.md`, sección A)\n' % cid)
        L.append(ident + '\n')
    L.append('## 2. Kit (qué hace, para que el cuerpo lo exprese)\n')
    L.append('| Habilidad | Qué hace | Tipo | Alcance / radio |\n|---|---|---|---|')
    for s in c['skills']:
        L.append(f"| {s['name']} | {s['desc']} | `{s['kind']}` | {s['radius'] or s['range'] or '—'} u |")
    if c['ultimate']:
        L.append(f"| **{c['ultimate']['name']}** (definitiva) | {c['ultimate']['desc']} | `{c['ultimate']['kind']}` | — |")
    L.append('\nEl atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.\n')
    L.append('## 3. Qué falta hoy\n')
    cm = camp_m.get(cid)
    if pend:
        L.append('Bloques de cuerpo abiertos para este campeón (de `docs/production/asset-blocks.json`):\n')
        for b, its in pend:
            L.append(f"- **{b['id']}** ({b['priority']}, {b['state']}): {', '.join(i.split('.')[-1] for i in its)}")
    else:
        L.append('No hay bloques de cuerpo abiertos para este campeón en la cola (puede tener calidad, skins o FX pendientes: ver `../bloques/`).')
    if cm:
        L.append(f"\n- Habilidades registradas: {', '.join(cm.get('habilidades', []))}; definitiva: {cm.get('definitiva')}.")
        if cm.get('skins_registradas'):
            L.append('- Skins/sets registrados: ' + ', '.join(f"{s['nombre']} (`{s['id']}`, {s['tipo']})" for s in cm['skins_registradas']) + '.')
        if cm.get('skins_pendientes_ascension'):
            L.append('- Skins de ascensión pendientes: ' + ', '.join(str(x) for x in cm['skins_pendientes_ascension']) + '.')
    L.append('\n## 4. Las 36 poses con su instrucción de Runway\n')
    L.append('Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón '
             '(recorte de 112×112; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.\n')
    for p in POSES:
        L.append(f"### Cuadro {p['idx']} — fila {p['fila']}, columna {p['col']}: {p['estado']} · {p['dir_txt']}\n")
        L.append(f"- **Qué es:** {p['beat']}.")
        L.append(f"- **Prompt Runway:** `{pose_prompt(c, p)}`")
        L.append(f"- **Comando:** `node tools/art-world/runway-guardian.js {cid} f{p['idx']:02d}_a1 \"<prompt>\" assets/ui/codex/champions/{cid}.png art-source/runway-pose-refs/{cid}/f{p['idx']:02d}.png`\n")
    L.append('### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)\n')
    L.append(f"- **Prompt Runway:** `{golpe_prompt(c)}`\n")
    L.append('## 5. Aceptación (antes de dar un cuadro por bueno)\n')
    L.append('Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. '
             'Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.')
    return '\n'.join(L) + '\n'

# ---------------------------------------------------------------- enemigos
RANK_TXT = {'normal': 'normal (chusma que llega en masa)', 'subelite': 'sub-élite', 'elite': 'élite (con rol)', 'subjefe': 'sub-jefe', 'jefe': 'jefe'}
ENEMY_EN = {'idle': 'standing idle, guard stance', 'walk_side': 'walk cycle, side profile, mid-stride', 'walk_down': 'walk cycle facing the camera, mid-stride', 'walk_up': 'walk cycle seen from behind, mid-stride',
  'atk_side': 'attack strike in side profile, the creature\'s signature attack at full extension', 'atk_down': 'attack strike facing the camera at full extension', 'atk_up': 'attack strike seen from behind at full extension',
  'hit': 'hurt reaction, recoiling backward', 'death': 'death, collapsing and falling to the ground'}
RANK_EN = {'normal': 'common enemy', 'subelite': 'sub-elite enemy', 'elite': 'elite enemy', 'subjefe': 'mini-boss', 'jefe': 'boss'}
ENEMY_STATES = [
  ('idle', 'reposo: de pie, 1 cuadro (el motor repite 4)', 'hold'), ('walk_side', 'caminar de perfil a la DERECHA, 4–6 cuadros (contacto / paso alto / contacto / paso alto)', 'walk'),
  ('walk_down', 'caminar de frente, 4–6 cuadros', 'walk'), ('walk_up', 'caminar de espaldas, 4–6 cuadros', 'walk'),
  ('atk_side', 'ataque de perfil, 3–4 cuadros (anticipación / golpe / seguimiento / recuperación) — con el ataque propio de la criatura', 'attack'),
  ('atk_down', 'ataque de frente, 3–4 cuadros', 'attack'), ('atk_up', 'ataque de espaldas, 3–4 cuadros', 'attack'),
  ('hit', 'golpe recibido, 2 cuadros (perfil y frente): se echa hacia atrás', 'hit'), ('death', 'muerte, 4–6 cuadros: sacudida, caída, queda tendido (o se deshace según la criatura)', 'death')]

def enemy_prompt(e, st, desc):
    d = 'in side profile facing right' if st.endswith('side') or st in ('idle', 'hit', 'death') else 'facing the camera' if st.endswith('down') else 'seen from behind (back to the camera)'
    return (f"Pixel art game enemy sprite of the creature in @codex ({e['name']}, {RANK_EN[e['rank']]}), redrawn in the pose of @pose ({ENEMY_EN[st]}), {d}. "
            f"Keep the @codex design and palette exactly. Dominant color {e['color']}. Crisp pixel art, 1px dark outline, flat shading, ONE connected silhouette, feet on the bottom line, "
            f"no text, no effects, plain dark background.")

def enemy_md(arena, items):
    L = [f"# Enemigos y jefes de la arena `{arena}` — instrucciones de Runway\n",
         '> Generado por `tools/art/build-runway-pack.py`. Método: `../RECETA.md`. Cómo es una hoja de enemigo: `../ENEMIGOS_GUIA.md`.\n']
    for e in sorted(items, key=lambda x: (['normal', 'subelite', 'elite', 'subjefe', 'jefe'].index(x['rank']), x['id'])):
        L.append(f"## {e['name']} (`{e['id']}`) — {RANK_TXT[e['rank']]}\n")
        L.append(f"- **Qué es:** {e['lore'] or '—'} · familia {e['family'] or '—'} · origen {e['origin'] or '—'}.")
        L.append(f"- **Cómo se comporta:** {e['behavior'] or '—'} Ataques: {', '.join(e['attacks']) or '—'}." + (f" Mecánica: {e['mech']}" if e['mech'] else ''))
        L.append(f"- **Tamaño en el mundo:** radio {e['radius']} u, escala {e['scale']}; color dominante `{e['color']}`; {'ataca a distancia' if e['ranged'] else 'ataca cuerpo a cuerpo'}; velocidad {e['speed']}.")
        alias = f" (usa el de `{e['visualAlias']}`)" if e['visualAlias'] else ' (se hereda de otro tipo o se dibuja por código)'
        L.append(f"- **Arte actual:** {('`' + e['atlasActual'] + '`') if e['atlasActual'] else 'sin atlas propio' + alias}.")
        row = mundo.get('C-ENEMY-' + e['id'])
        if row:
            L.append(f"- **Estado en la cola:** {row['estado']} · prioridad {row['prioridad']} · entrega en `{row['ruta_entrega']}`.")
        L.append('- **Los 9 estados con su prompt** (un cuadro-clave por estado se pide a Runway; el pintor determinista arma los demás cuadros: `../RECETA.md` §4):')
        for st, desc, _ in ENEMY_STATES:
            L.append(f"  - `{st}` — {desc}. Prompt: `{enemy_prompt(e, st, desc)}`")
        L.append('')
    return '\n'.join(L) + '\n'

# ---------------------------------------------------------------- bloques: item -> descripción, método y prompt
GENERIC = {  # subcategoría del manifiesto -> (método, plantilla de prompt o None, qué es)
 'fx_habilidad': ('código procedural + pintor (Runway solo para el motivo)', "Pixel art visual effect motif, {asset}, single hero frame, {color}, 1px dark outline, flat tones, no glow, transparent-looking plain dark background, no text.", 'Efecto de habilidad: tira horizontal con 3 tiempos (anticipación, impacto, disipación) más bucle; el borde exterior es el radio real.'),
 'icono_habilidad': ('pintor de íconos 16×16 (Runway no sirve a ese tamaño)', None, 'Ícono de habilidad 16×16 nativos, ≤ 6 colores, 1 px de contorno. Se dibuja por código/pintor; la descripción del glifo está en la ficha.'),
 'proyectil': ('código procedural + pintor', "Pixel art projectile sprite, {asset}, side view, small, {color}, 1px dark outline, plain dark background.", 'Proyectil: tira corta de vuelo + impacto.'),
 'prop_persistente': ('runway + pintor', "Pixel art game prop, {asset}, oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.", 'Prop que queda en el mapa (muro, torreta, trampa, zona).'),
 'prop_decorado': ('runway + pintor', "Pixel art environment prop, {asset}, oblique 3/4 top-down view, light from top-left, 1px dark outline, flat shading, plain dark background, no text.", 'Prop decorativo de la arena.'),
 'suelo': ('runway + pintor (textura repetible)', "Seamless tileable top-down ground texture, {asset}, pixel art, muted dark-fantasy palette, no objects, no text.", 'Textura de suelo repetible, vista cenital.'),
 'portada_arena': ('runway (ilustración, sin reducir a pixel)', "Dark fantasy illustration cover of the arena, {asset}, wide composition, painterly, strong silhouette, no text.", 'Portada de arena (ilustración).'),
 'retrato_codice': ('runway o ChatGPT (ilustración, sin reducir a pixel)', "Dark fantasy character portrait illustration, {asset}, half body, painterly, consistent with the Códice style, no text, no frame.", 'Retrato del Códice (ilustración).'),
 'ilustracion_codice': ('runway o ChatGPT (ilustración)', "Dark fantasy codex illustration, {asset}, painterly, no text, no frame.", 'Ilustración del Códice.'),
 'ilustracion_libro': ('runway o ChatGPT (ilustración)', "Dark fantasy book illustration, {asset}, ink and watercolor look, no text.", 'Ilustración del Libro de lore.'),
 'monstruo_campo_de_batalla': ('runway + pintor', "Pixel art monster sprite, {asset}, side view facing right, 1px dark outline, flat shading, plain dark background, no text.", 'Monstruo de campo de batalla (Guerra de Cristales).'),
 'forma_de_jefe': ('runway + pintor', "Pixel art boss form sprite, {asset}, large, facing the camera, 1px dark outline, flat shading, plain dark background, no text.", 'Forma/transformación de jefe.'),
 'ciudad_forma_de_jefe': ('runway + pintor', "Pixel art boss form sprite, {asset}, large, facing the camera, 1px dark outline, flat shading, plain dark background, no text.", 'Forma de jefe de Ciudad Maldita.'),
 'set_skin': ('runway + pintor (sobre el atlas del campeón)', "Pixel art game sprite of the character in @codex wearing the set {asset}, same pose as @pose, keep the character design, new outfit colors and pieces only. Crisp pixel art, 1px dark outline, flat shading, one connected silhouette, plain dark background, no text.", 'Skin de set: mismo atlas, otra ropa. Cosmética (no cambia estadísticas).'),
 'set_aura': ('código procedural + pintor', "Pixel art aura effect, {asset}, ring around a standing character, {color}, plain dark background, no text.", 'Aura de set (efecto cosmético).'),
}
ITEM_GENERIC = ('runway + pintor', "Pixel art game item icon, {asset}, centered, 32x32 look, 1px dark outline, flat shading, plain dark background, no text.", 'Objeto de equipo (ícono y/o sprite).')

def champ_pose_item(cid, name):
    c = CH.get(cid)
    if not c or name not in POSE_GROUPS:
        return None
    state, d, frames = POSE_GROUPS[name]
    if state == 'golpe':
        return {'descripcion': f"Golpe recibido de {c['name']}: un cuadro (el motor reproduce 160 ms). Se toma del cuadro 12, 16 y 20 del atlas.", 'metodo': 'runway + pintor', 'prompt_runway': golpe_prompt(c),
                'entrega': f"assets/sprites/champions/{cid}/atlas.png (cuadros {list(frames)})", 'ref': [f'assets/ui/codex/champions/{cid}.png']}
    ps = [p for p in POSES if p['idx'] in frames]
    return {'descripcion': f"{c['name']} — {state} {DIRS[d][0]}: cuadros {list(frames)} del atlas (4 cuadros con movimiento: " + ' → '.join(p['beat'].split(':')[0] for p in ps) + '). Cada cuadro con su prompt en campeones/%s.md.' % cid,
            'metodo': 'runway + pintor', 'prompt_runway': [pose_prompt(c, p) for p in ps], 'entrega': f"assets/sprites/champions/{cid}/atlas.png (cuadros {list(frames)})", 'ref': [f'assets/ui/codex/champions/{cid}.png']}

def describe_item(item):
    row = mundo.get(item)
    parts = item.split('.')
    if row:
        sub = row['subcategoria']
        out = {'descripcion': f"{row['asset']}. {row['uso']}", 'tamano': row['tamano_formato'], 'entrega': row['ruta_entrega'], 'ref': row.get('referencia', []), 'estado': row['estado'], 'notas': row.get('notas', '')}
        m = re.match(r'^C-ENEMY-(.+)$', item)
        if m and m.group(1) in EN:
            e = EN[m.group(1)]
            out['metodo'] = 'runway + pintor'
            out['prompt_runway'] = [f"{st}: " + enemy_prompt(e, st, d) for st, d, _ in ENEMY_STATES]
            out['descripcion'] += f" Criatura: {e['lore'] or '—'} Comportamiento: {e['behavior'] or '—'} Ataques: {', '.join(e['attacks']) or '—'}. Detalle y prompts por estado en enemigos/{e['arena'] or 'otras'}.md."
        elif sub in GENERIC:
            meto, tpl, que = GENERIC[sub]
            out['metodo'] = meto
            col = re.search(r'#[0-9a-fA-F]{6}', row['tamano_formato'] or '')
            out['prompt_runway'] = tpl.format(asset=row['asset'], color=(f"dominant color {col.group(0)}" if col else 'palette from the champion')) if tpl else None
            out['descripcion'] = f"{que} " + out['descripcion']
        else:
            meto, tpl, que = ITEM_GENERIC
            out['metodo'] = meto
            out['prompt_runway'] = tpl.format(asset=row['asset'])
            out['descripcion'] = f"{que} " + out['descripcion']
        return out
    if len(parts) == 3:
        cid, kind, name = parts
        c = CH.get(cid)
        if kind == 'cuerpo':
            r = champ_pose_item(cid, name)
            if r: return r
        if kind == 'calidad':
            txt = {'siluetas_partidas': 'Arreglar cuadros con siluetas partidas (una espada o pieza flotante separada del cuerpo): rehacer esos cuadros con UNA silueta conectada.',
                   'cuadros_repetidos': 'El atlas repite cuadros: rehacer los cuadros duplicados para que el ciclo tenga movimiento real (4 cuadros distintos).',
                   'repintado_manual': 'Repintado manual completo asistido por Runway: rehacer el atlas fiel a la lámina del Códice.'}.get(name, 'Mejora de calidad del atlas.')
            return {'descripcion': f"Calidad de {c['name'] if c else cid}: {txt}", 'metodo': 'runway + pintor (cuadros concretos)', 'prompt_runway': pose_prompt(c, POSES[0]) if c else None,
                    'entrega': f"assets/sprites/champions/{cid}/atlas.png", 'ref': [f'assets/ui/codex/champions/{cid}.png']}
        if kind == 'skin':
            return {'descripcion': f"Skin `{name}` de {c['name'] if c else cid}: misma silueta y atlas, otra paleta/ropa (cosmética: no cambia estadísticas).", 'metodo': 'runway + pintor (sobre el atlas del campeón)',
                    'prompt_runway': (f"Pixel art game sprite of the character in @codex ({champ_sum(c)}) wearing a new outfit variant '{name}', same pose as @pose, keep body shape and design language, change only colors and clothing pieces. " + STYLE) if c else None,
                    'entrega': f"assets/sprites/champions/{cid}/skins/{name}/atlas.png", 'ref': [f'assets/ui/codex/champions/{cid}.png']}
        if kind == 'forma':
            return {'descripcion': f"Forma/invocación `{name}` de {c['name'] if c else cid}: estados que faltan del cuerpo invocado o transformado (ver docs/ILKAN_REWORK.md y la ficha del bloque).", 'metodo': 'runway + pintor',
                    'prompt_runway': f"Pixel art game sprite of the summoned form '{name.replace('_', ' ')}' of {c['name'] if c else cid}, same style as the champion atlas, pose as @pose. " + STYLE, 'entrega': f"assets/sprites/champions/{cid}/", 'ref': []}
        if kind in ('fx', 'iconos'):
            sk = [s['name'] for s in c['skills']] + ([c['ultimate']['name']] if c and c['ultimate'] else []) if c else []
            return {'descripcion': f"Seguimiento agregado: {'efectos' if kind == 'fx' else 'íconos 16×16'} de las habilidades de {c['name'] if c else cid} ({', '.join(sk)}). No es otro dibujo: cierra cuando cierran los items A-FX-/B-ICON- de ese campeón.",
                    'metodo': 'seguimiento (sin Runway propio)', 'prompt_runway': None, 'entrega': '—', 'ref': []}
    if len(parts) == 1 or not row:
        return {'descripcion': f"Item `{item}`: sin ficha en el manifiesto del mundo; ver el título del bloque y docs/art-brief/.", 'metodo': 'a definir con el dueño', 'prompt_runway': None, 'entrega': '—', 'ref': []}
    return {'descripcion': f"Item `{item}`.", 'metodo': 'a definir', 'prompt_runway': None, 'entrega': '—', 'ref': []}


# ---------------------------------------------------------------- costos (imágenes de Runway por bloque; 1 imagen gen4_image 1024:1024 = 8 créditos medidos)
CRED = 8
def n_images(it):
    pr = it.get('prompt_runway')
    if 'runway' not in it.get('metodo', ''): return 0
    if isinstance(pr, list): return 3 if it['id'].startswith('C-ENEMY-') else len(pr)   # enemigo: 3 cuadros clave (idle, caminar, ataque); el resto lo deriva el pintor
    return 1 if pr else 0
def costs_md(out_blocks):
    rows = collections.defaultdict(lambda: [0, 0, 0]); tot = [0, 0]
    for b in out_blocks:
        if b['estado'] in ('INTEGRADO_MAIN', 'SEGUIMIENTO'): continue
        n = sum(n_images(i) for i in b['items'])
        pr = b['prioridad']; rows[(b['grupo'], pr)][0] += 1; rows[(b['grupo'], pr)][1] += n
    L = ['# Costos de Runway del paquete (créditos)\n', '> Generado por `tools/art/build-runway-pack.py`. **Supuestos explícitos:** 1 imagen `gen4_image` 1024:1024 con referencias = **8 créditos** (medido en `docs/beta-release/ART_CREDITS.md`); '
         'un enemigo pide **3 imágenes clave** (reposo, caminar, ataque) y el pintor determinista deriva el resto; FX, íconos 16×16, proyectiles y auras NO usan Runway. '
         'Se cuentan solo bloques abiertos (no `INTEGRADO_MAIN` ni seguimientos). El factor de reintento es una SUPOSICIÓN (×1,0 = todo sale a la primera; ×2,5 = lo razonable según los descartes registrados): '
         'el repo no mide la tasa real de aceptación.\n',
         '| Grupo | Prioridad | Bloques abiertos | Imágenes Runway | Créditos ×1,0 | Créditos ×2,5 |', '|---|---|---:|---:|---:|---:|']
    g1 = g2 = 0
    for (g, pr), (nb, ni, _) in sorted(rows.items()):
        L.append(f"| {g} | {pr} | {nb} | {ni} | {ni * CRED:,} | {int(ni * CRED * 2.5):,} |".replace(',', '.')); g1 += ni
    L.append(f"| **Total** | | | **{g1}** | **{g1 * CRED:,}** | **{int(g1 * CRED * 2.5):,}** |".replace(',', '.'))
    L.append('\nSaldo conocido al escribir esto: **2 créditos** (consulta `GET /v1/organization` → `creditBalance`; `node tools/art-world/runway-world.js status`). Por eso la regla es: **no empezar nada nuevo sin saldo**, y gastar siempre en el orden P0 → P1 → P2 de la cola, un bloque completo por vez.')
    return '\n'.join(L) + '\n'

# ---------------------------------------------------------------- main
def main():
    os.makedirs(os.path.join(PK, 'campeones'), exist_ok=True); os.makedirs(os.path.join(PK, 'enemigos'), exist_ok=True); os.makedirs(os.path.join(PK, 'bloques'), exist_ok=True)
    out_blocks, by_champ = [], collections.defaultdict(list)
    for b in blocks['blocks']:
        items = []
        for it in b['items']:
            d = describe_item(it); d['id'] = it; items.append(d)
            m = it.split('.')
            if len(m) == 3 and m[1] == 'cuerpo':
                by_champ[m[0]].append((b, [it]))
        out_blocks.append({'id': b['id'], 'grupo': b['group'], 'titulo': b['title'], 'prioridad': b['priority'], 'estado': b['state'], 'items': items})
    json.dump({'generado': 'tools/art/build-runway-pack.py', 'bloques': out_blocks}, open(os.path.join(PK, 'bloques.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    # bloques por grupo (md)
    groups = collections.defaultdict(list)
    for b in out_blocks: groups[b['grupo']].append(b)
    for g, bl in groups.items():
        L = [f"# Bloques `{g}` — descripción y prompt de cada dibujo ({len(bl)} bloques)\n", '> Generado por `tools/art/build-runway-pack.py` desde `docs/production/asset-blocks.json`. Método: `../RECETA.md`. Estado del bloque = estado en la cola, no aprobación de arte.\n']
        for b in bl:
            L.append(f"## {b['id']} — {b['titulo']}  \n*Prioridad {b['prioridad']} · {b['estado']}*\n")
            for it in b['items']:
                L.append(f"- **`{it['id']}`** — {it['descripcion']}")
                L.append(f"  - Método: {it['metodo']}." + (f" Entrega: `{it['entrega']}`." if it.get('entrega') and it['entrega'] != '—' else ''))
                if it.get('tamano'): L.append(f"  - Formato: {it['tamano']}")
                pr = it.get('prompt_runway')
                if isinstance(pr, list):
                    for x in pr: L.append(f"  - Prompt: `{x}`")
                elif pr: L.append(f"  - Prompt: `{pr}`")
                if it.get('ref'): L.append('  - Referencias: ' + ', '.join('`%s`' % r for r in it['ref']))
            L.append('')
        open(os.path.join(PK, 'bloques', g + '.md'), 'w', encoding='utf-8').write('\n'.join(L) + '\n')
    open(os.path.join(PK, 'COSTOS.md'), 'w', encoding='utf-8').write(costs_md(out_blocks))
    for cid, c in CH.items():
        open(os.path.join(PK, 'campeones', cid + '.md'), 'w', encoding='utf-8').write(champion_md(cid, c, by_champ.get(cid, [])))
    arenas = collections.defaultdict(list)
    for e in EN.values(): arenas[e['arena'] or 'otras'].append(e)
    for a, its in arenas.items():
        open(os.path.join(PK, 'enemigos', a + '.md'), 'w', encoding='utf-8').write(enemy_md(a, its))
    print('bloques', len(out_blocks), '| items', sum(len(b['items']) for b in out_blocks), '| campeones', len(CH), '| enemigos', len(EN), 'en', len(arenas), 'arenas')

if __name__ == '__main__':
    main()
