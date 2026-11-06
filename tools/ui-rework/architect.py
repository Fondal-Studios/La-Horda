#!/usr/bin/env python3
"""LA HORDA — ARQUITECTO DE INTERFAZ (tools/ui-rework/architect.py)

Lee spec/ui-spec.json y GENERA el rework retro de la interfaz (título → hub → sala):
  css/ui-rework.css   estilos bajo `body.ui-rework` (rejilla de 8 px, esquinas rectas, sombra escalonada, blancos ≥ 44 px, un solo botón dominante)
  js/ui/ui-rework.js  paneles («sheets») que ALOJAN los nodos existentes (no los clona: conservan IDs y eventos), tabs compactas, relabel del título
  index.html          <link> y <script> (idempotente)
Activación: `?ui=new` fuerza el rework, `?ui=old` lo apaga; por defecto está activo salvo en navegadores automatizados (navigator.webdriver),
igual que el resto del juego mantiene el camino viejo para las pruebas heredadas. Nada del juego se reescribe: todo es capa de presentación.
Uso: python3 tools/ui-rework/architect.py [--no-index]
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
SPEC = json.loads((HERE / 'spec' / 'ui-spec.json').read_text(encoding='utf-8'))
T = SPEC['tokens']


def css():
    h, t = SPEC['home'], SPEC['title']
    mv = T['minTarget']
    return f"""/* css/ui-rework.css — GENERADO por tools/ui-rework/architect.py desde spec/ui-spec.json ({SPEC['name']}). No editar a mano. */
body.ui-rework{{ --ur-g:{T['grid']}px; --ur-line:{T['line']}; --ur-accent:{T['accent']}; --ur-gold:{T['gold']}; --ur-panel:{T['panel']}; --ur-deep:{T['panelDeep']}; --ur-ink:{T['ink']}; --ur-dim:{T['dim']}; --ur-shadow:{T['shadow']}; }}

/* ---------- componente base: botón de píxel (esquinas rectas, sombra escalonada, ≥ {mv} px) ---------- */
body.ui-rework .ur-btn, body.ui-rework #ur-modes-btn, body.ui-rework #ur-more-btn, body.ui-rework #ur-info-btn{{
  min-height:{mv}px; min-width:{mv}px; border:2px solid var(--ur-line); border-radius:{T['radius']}px; background:linear-gradient(180deg,#3a1b0d,#1d0e07);
  color:var(--ur-ink); box-shadow:var(--ur-shadow), inset 2px 2px 0 rgba(255,180,120,.25); font-family:var(--font-pixel,'Press Start 2P',monospace); cursor:pointer; }}
body.ui-rework .ur-btn:active, body.ui-rework #ur-modes-btn:active, body.ui-rework #ur-more-btn:active, body.ui-rework #ur-info-btn:active{{ transform:translate(2px,2px); box-shadow:2px 2px 0 #000; }}

/* ---------- TÍTULO: una acción dominante + MENÚ + «i» ---------- */
body.ui-rework #title-screen .legal-foot, body.ui-rework #title-screen .build-tag, body.ui-rework #title-screen a[href='instalar.html']{{ display:none !important; }}
body.ui-rework #title-screen #title-continue-btn{{ position:absolute; right:42px; bottom:22px; width:128px; height:{mv}px; font-size:0; padding:0; }}
body.ui-rework #title-screen #title-continue-btn::after{{ content:'{t['secondary']['label']}'; font:12px/1 var(--font-pixel,'Press Start 2P',monospace); letter-spacing:.12em; color:var(--ur-gold); }}
body.ui-rework #title-screen #title-continue-btn:disabled::after{{ content:'{t['secondary']['loadingLabel']}'; opacity:.7; }}
body.ui-rework #title-screen #bt-play{{ min-height:72px; font-size:1.25em; }}
body.ui-rework #ur-info-btn{{ position:absolute; left:14px; bottom:18px; z-index:6; width:{mv}px; height:{mv}px; padding:0; font-size:16px; }}
body.ui-rework #title-screen #title-join-name, body.ui-rework #title-screen #title-join-btn{{ position:relative; z-index:6; }}

/* ---------- HUB: JUGAR grande + 4 mosaicos + MODOS; el resto, dentro de paneles ---------- */
body.ui-rework #mainmenu-screen:not(.hidden){{ display:flex; flex-direction:column; height:100%; gap:var(--ur-g); padding:var(--ur-g) calc(var(--ur-g)*1.5); box-sizing:border-box; }}
body.ui-rework #mainmenu-screen .hub-top{{ display:flex; align-items:center; gap:var(--ur-g); flex:none; position:static; }}
body.ui-rework #mainmenu-screen .hub-top .hub-brand{{ flex:1; text-align:center; font-size:clamp(12px,2.4vw,20px); }}
body.ui-rework #mainmenu-screen .hub-profile{{ order:0; min-height:{mv + 8}px; }}
body.ui-rework #mainmenu-screen .hub-brand{{ order:1; }}
body.ui-rework #mainmenu-screen #hub-options-btn{{ order:2; width:{mv}px; height:{mv}px; }}
body.ui-rework #ur-more-btn{{ order:3; width:{mv}px; height:{mv}px; padding:0; font-size:18px; }}
body.ui-rework #mainmenu-screen .hub-main{{ flex:1; min-height:0; display:grid; grid-template-columns:minmax(0,1.2fr) minmax(0,1fr); gap:calc(var(--ur-g)*1.5); grid-template-rows:minmax(0,1fr); }}
body.ui-rework #mainmenu-screen .hub-modes{{ display:flex; flex-direction:column; min-height:0; height:100%; }}
body.ui-rework #mainmenu-screen #hub-play-btn{{ flex:1 1 auto; min-height:0; height:100%; }}
body.ui-rework #mainmenu-screen .hub-endless-row{{ display:none; }}
body.ui-rework #mainmenu-screen .hub-sections{{ display:grid; grid-template-columns:1fr 1fr; grid-auto-rows:minmax({mv + 20}px,1fr); gap:var(--ur-g); min-height:0; align-content:stretch; overflow:visible; }}
body.ui-rework #mainmenu-screen .hub-sections > .hub-row{{ display:contents; }}
body.ui-rework #mainmenu-screen .hub-section-title{{ display:none; }}
body.ui-rework #mainmenu-screen .hub-tile, body.ui-rework #mainmenu-screen #ur-modes-btn{{ position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; min-height:{mv + 20}px; padding:6px; text-align:center; border-radius:{T['radius']}px; }}
body.ui-rework #mainmenu-screen .hub-tile-ico{{ margin:0; width:auto; height:auto; font-size:26px; }}
body.ui-rework #mainmenu-screen .hub-tile-title{{ font-size:13px; letter-spacing:.06em; white-space:normal; }}
body.ui-rework #mainmenu-screen .hub-tile-sub{{ display:none; }}
body.ui-rework #mainmenu-screen #ur-modes-btn{{ grid-column:1 / -1; flex-direction:row; justify-content:flex-start; gap:12px; padding:6px 14px; }}
body.ui-rework #ur-modes-btn .ur-modes-ico{{ font-size:24px; color:var(--ur-gold); }}
body.ui-rework #ur-modes-btn .ur-modes-txt{{ display:flex; flex-direction:column; gap:4px; text-align:left; }}
body.ui-rework #ur-modes-btn b{{ font:13px/1.1 var(--font-pixel,'Press Start 2P',monospace); color:var(--ur-gold); }}
body.ui-rework #ur-modes-btn small{{ font:15px/1.1 var(--font-body,VT323,monospace); color:var(--ur-dim); }}
body.ui-rework #mainmenu-screen .hub-tile.ur-span2{{ grid-column:1 / -1; }}
body.ui-rework #mainmenu-screen .hub-tile-badge, body.ui-rework #mainmenu-screen .hub-tile-offer{{ position:absolute; top:4px; right:4px; }}

/* ---------- PANELES (sheets): lo secundario, dentro ---------- */
body.ui-rework .ur-sheet{{ position:fixed; inset:0; z-index:60; display:flex; align-items:center; justify-content:center; background:rgba(8,4,2,.82); }}
body.ui-rework .ur-sheet.hidden{{ display:none; }}
body.ui-rework .ur-sheet-box{{ width:min(92vw,720px); max-height:92vh; display:flex; flex-direction:column; gap:var(--ur-g); padding:calc(var(--ur-g)*1.5); background:var(--ur-panel); border:2px solid var(--ur-line); box-shadow:var(--ur-shadow); }}
body.ui-rework .ur-sheet-head{{ display:flex; align-items:center; gap:12px; }}
body.ui-rework .ur-sheet-head h2{{ margin:0; font:14px/1.2 var(--font-pixel,'Press Start 2P',monospace); color:var(--ur-gold); letter-spacing:.08em; }}
body.ui-rework .ur-sheet-grid{{ display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:var(--ur-g); overflow:auto; min-height:0; }}
body.ui-rework .ur-sheet-grid > *{{ min-height:{mv + 8}px; }}
body.ui-rework .ur-sheet-grid button{{ min-height:{mv}px; }}
body.ui-rework .ur-sheet-grid .hub-tile, body.ui-rework .ur-sheet-grid .hub-endless, body.ui-rework .ur-sheet-grid .hub-endless-rank{{ display:flex; flex-direction:row; align-items:center; gap:12px; text-align:left; padding:8px 12px; }}
body.ui-rework .ur-sheet-grid .hub-tile-sub{{ display:block; }}
body.ui-rework .ur-sheet-grid .hub-tile-title{{ white-space:normal; overflow:visible; text-overflow:clip; font-size:13px; }}
body.ui-rework .ur-sheet-grid [data-ur-label]{{ display:flex; align-items:center; justify-content:flex-start; gap:12px; width:auto; height:auto; min-height:{mv + 8}px; padding:6px 14px; text-align:left; }}
body.ui-rework .ur-sheet-grid [data-ur-label]::after{{ content:attr(data-ur-label); font:12px/1.2 var(--font-pixel,'Press Start 2P',monospace); letter-spacing:.06em; color:var(--ur-ink); }}
body.ui-rework .ur-sheet-grid [data-ur-label] .hub-premium-plus{{ display:none; }}
body.ui-rework .ur-sheet-grid .hidden{{ display:none !important; }}
body.ui-rework .ur-sheet-info{{ display:flex; flex-direction:column; gap:12px; }}
body.ui-rework .ur-sheet-info .legal-foot{{ display:flex !important; flex-wrap:wrap; gap:12px; position:static; }}
body.ui-rework .ur-sheet-info a{{ color:var(--ur-gold); font-size:16px; min-height:{mv}px; display:inline-flex; align-items:center; }}
body.ui-rework .ur-sheet-info .build-tag{{ display:block !important; position:static; color:var(--ur-dim); }}

/* ---------- MODOS / CRISTALES: los botones nunca desbordan su marco ---------- */
body.ui-rework #crystalwars-screen button, body.ui-rework #modeselect-screen button{{ white-space:normal; overflow-wrap:anywhere; min-height:{mv}px; padding:6px 10px; }}

/* ---------- SALA: pestañas compactas + «Comenzar» siempre a la vista ---------- */
body.ui-rework #prep-screen .prep-secs{{ display:flex; gap:var(--ur-g); }}
body.ui-rework #prep-screen .prep-sec{{ flex:1; min-height:{mv}px; border-radius:{T['radius']}px; font-size:13px; }}
body.ui-rework #prep-screen .prep-sec .prep-sec-ico{{ display:none; }}
body.ui-rework #prep-screen #prep-start-btn{{ min-height:{mv + 8}px; font-family:var(--font-pixel,'Press Start 2P',monospace); letter-spacing:.1em; box-shadow:var(--ur-shadow); border-radius:{T['radius']}px; }}
"""


def js():
    h, t = SPEC['home'], SPEC['title']
    cfg = {'title': t, 'home': h, 'labels': SPEC.get('labels', {})}
    return f"""'use strict';
/* js/ui/ui-rework.js — GENERADO por tools/ui-rework/architect.py desde spec/ui-spec.json. No editar a mano.
   Capa de presentación: aloja los nodos EXISTENTES (no los clona: mantienen IDs y eventos) en paneles para que cada pantalla tenga una acción
   dominante y lo secundario quede dentro. ?ui=old lo apaga; ?ui=new lo fuerza; los navegadores automatizados siguen viendo la UI vieja. */
(function(){{
  const q = new URLSearchParams(location.search), mode = q.get('ui');
  const on = mode === 'new' || (mode !== 'old' && !navigator.webdriver);
  window.UI_REWORK = {{on}};
  if(!on) return;
  const CFG = {json.dumps(cfg, ensure_ascii=False)};
  const $ = id => document.getElementById(id);
  const host = () => $('stage') || document.body;
  document.body.classList.add('ui-rework');

  // ---- paneles
  const sheets = {{}};
  function makeSheet(id, title){{
    const el = document.createElement('div'); el.className = 'ur-sheet hidden'; el.id = 'ur-sheet-' + id; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', title);
    el.innerHTML = '<div class="ur-sheet-box"><div class="ur-sheet-head"><button type="button" class="ur-btn ur-close" aria-label="Volver">‹ Volver</button><h2></h2></div><div class="ur-sheet-grid"></div></div>';
    el.querySelector('h2').textContent = title;
    el.addEventListener('click', e => {{ if(e.target === el || e.target.closest('.ur-close')) closeSheets(); }});
    host().appendChild(el); sheets[id] = el; return el;
  }}
  function openSheet(id){{ closeSheets(); sheets[id].classList.remove('hidden'); }}
  function closeSheets(){{ for(const k in sheets) sheets[k].classList.add('hidden'); }}
  document.addEventListener('keydown', e => {{ if(e.key === 'Escape') closeSheets(); }});
  // al cambiar de pantalla, los paneles se cierran
  if(typeof setState === 'function'){{ const o = setState; window.setState = setState = function(){{ closeSheets(); return o.apply(this, arguments); }}; }}
  const grid = id => sheets[id].querySelector('.ur-sheet-grid');
  const LABELS = CFG.labels || {{}};
  const adopt = (id, node) => {{ if(node && node.parentNode !== grid(id)){{ grid(id).appendChild(node); if(LABELS[node.id]) node.setAttribute('data-ur-label', LABELS[node.id]); }} }};

  // ---- TÍTULO: información, instalación y legales dentro de un panel «i»
  {{
    const S = CFG.title.infoSheet; makeSheet('info', S.title);
    const g = grid('info'); g.classList.add('ur-sheet-info'); g.style.display = 'flex';
    const b = document.createElement('button'); b.type = 'button'; b.id = S.button; b.className = 'ur-btn'; b.textContent = S.icon; b.setAttribute('aria-label', 'Información');
    b.addEventListener('click', () => openSheet('info')); $('title-screen').appendChild(b);
    const moveInfo = () => {{ for(const sel of S.move){{ const n = document.querySelector('#title-screen ' + sel); if(n) {{ n.style.removeProperty('display'); g.appendChild(n); }} }} }};
    moveInfo(); new MutationObserver(moveInfo).observe($('title-screen'), {{childList: true, subtree: true}});
  }}

  // ---- HUB: MODOS y MÁS
  {{
    const H = CFG.home, M = H.modesSheet, O = H.moreSheet;
    makeSheet('modes', M.title); makeSheet('more', O.title);
    const modesBtn = document.createElement('button'); modesBtn.type = 'button'; modesBtn.id = M.button; modesBtn.className = 'ur-btn';
    modesBtn.innerHTML = '<span class="ur-modes-ico" aria-hidden="true">◆</span><span class="ur-modes-txt"><b></b><small></small></span>';
    modesBtn.querySelector('b').textContent = M.label; modesBtn.querySelector('small').textContent = M.sub;
    modesBtn.addEventListener('click', () => {{ sweep(); openSheet('modes'); }});
    const moreBtn = document.createElement('button'); moreBtn.type = 'button'; moreBtn.id = O.button; moreBtn.className = 'ur-btn'; moreBtn.textContent = O.label; moreBtn.setAttribute('aria-label', O.aria);
    moreBtn.addEventListener('click', () => openSheet('more'));
    const keep = new Set(H.keepVisible.concat([M.button, O.button]));
    // el juego inserta «Botín» antes de #hub-howto-btn (reward-mailbox.js): el nodo ancla vuelve a su barra un instante y luego se aloja de nuevo
    for(const fn of (H.anchorFns || [])){{ const o = window[fn]; if(typeof o !== 'function') continue;
      window[fn] = function(){{ const how = $('hub-howto-btn'), top = document.querySelector('#mainmenu-screen .hub-top'); if(how && top && how.parentNode !== top) top.appendChild(how); const r = o.apply(this, arguments); sweep(); return r; }}; }}
    function sweep(){{
      for(const id of M.move) adopt('modes', $(id));
      for(const id of O.move) adopt('more', $(id));
      // widgets desconocidos del juego (p. ej. la guía «Arena de entrenamiento»): se adopta el contenedor ENTERO, nunca sus botones sueltos
      if(M.sweepUnknownButtons){{
        for(const n of document.querySelectorAll('#mainmenu-screen .hub-modes > :not(#hub-play-btn):not(.hub-endless-row)')) adopt('modes', n);
        for(const n of document.querySelectorAll('#mainmenu-screen .hub-top > button')) if(!keep.has(n.id) && !n.classList.contains('hub-profile')) adopt('more', n);
      }}
    }}
    function mount(){{
      const mm = $('mainmenu-screen'); if(!mm) return;
      const top = mm.querySelector('.hub-top'), sec = mm.querySelector('.hub-sections');
      if(top && !$(O.button)) top.appendChild(moreBtn);
      if(sec && !$(M.button)) sec.appendChild(modesBtn);
      sweep();
      const tiles = [...mm.querySelectorAll('.hub-sections .hub-tile')].filter(t => !t.classList.contains('hidden'));
      tiles.forEach(t => t.classList.remove('ur-span2')); if(tiles.length % 2) tiles[tiles.length - 1].classList.add('ur-span2');
    }}
    mount(); const mm = $('mainmenu-screen');
    if(mm) new MutationObserver(() => {{ clearTimeout(mount._t); mount._t = setTimeout(mount, 30); }}).observe(mm, {{childList: true, subtree: true}});
  }}
}})();
"""


def patch_index():
    p = ROOT / 'index.html'
    h = p.read_text(encoding='utf-8')
    link, script = '<link rel="stylesheet" href="css/ui-rework.css">', '<script src="js/ui/ui-rework.js"></script>'
    if link not in h:
        last = list(re.finditer(r'<link rel="stylesheet" href="css/[^"]+">', h))[-1]
        h = h[:last.end()] + '\n' + link + h[last.end():]
    if script not in h:
        last = list(re.finditer(r'<script src="js/[^"]+"></script>', h))[-1]
        h = h[:last.end()] + '\n' + script + h[last.end():]
    p.write_text(h, encoding='utf-8')


def main():
    (ROOT / 'css' / 'ui-rework.css').write_text(css(), encoding='utf-8')
    (ROOT / 'js' / 'ui' / 'ui-rework.js').write_text(js(), encoding='utf-8')
    if '--no-index' not in sys.argv:
        patch_index()
    print('generado: css/ui-rework.css, js/ui/ui-rework.js')


if __name__ == '__main__':
    main()
