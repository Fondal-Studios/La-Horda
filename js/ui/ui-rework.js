'use strict';
/* js/ui/ui-rework.js — GENERADO por tools/ui-rework/architect.py desde spec/ui-spec.json. No editar a mano.
   Capa de presentación: aloja los nodos EXISTENTES (no los clona: mantienen IDs y eventos) en paneles para que cada pantalla tenga una acción
   dominante y lo secundario quede dentro. ?ui=old lo apaga; ?ui=new lo fuerza; los navegadores automatizados siguen viendo la UI vieja. */
(function(){
  const q = new URLSearchParams(location.search), mode = q.get('ui');
  const on = mode === 'new' || (mode !== 'old' && !navigator.webdriver);
  window.UI_REWORK = {on};
  if(!on) return;
  const CFG = {"title": {"primary": "#bt-play", "secondary": {"id": "title-continue-btn", "label": "MENÚ", "loadingLabel": "CARGANDO…"}, "infoSheet": {"button": "ur-info-btn", "icon": "i", "title": "INFORMACIÓN", "move": ["a[href='instalar.html']", "#legal-title", ".build-tag"]}}, "home": {"keepVisible": ["hub-profile-btn", "hub-options-btn", "hub-play-btn", "mainmenu-codex-btn", "mainmenu-tienda-btn", "mainmenu-guardianes-btn", "mainmenu-quests-btn"], "modesSheet": {"button": "ur-modes-btn", "label": "MODOS", "sub": "Cristales · Coliseo · Online", "title": "MODOS DE JUEGO", "move": ["hub-crystal-btn", "hub-coliseum-btn", "mainmenu-jugar-btn", "hub-endless-btn", "hub-endless-rank-btn"], "sweepUnknownButtons": true}, "moreSheet": {"button": "ur-more-btn", "label": "⋯", "aria": "Más opciones", "title": "MÁS", "move": ["hub-premium-btn", "hub-tele-btn", "hub-howto-btn", "mainmenu-back-btn"]}, "anchorFns": ["campaignMailboxButton"]}, "labels": {"hub-premium-btn": "BRASAS", "hub-tele-btn": "JUGAR EN LA TELE", "hub-howto-btn": "CÓMO SE JUEGA", "mainmenu-back-btn": "VOLVER AL TÍTULO"}};
  const $ = id => document.getElementById(id);
  const host = () => $('stage') || document.body;
  document.body.classList.add('ui-rework');

  // ---- paneles
  const sheets = {};
  function makeSheet(id, title){
    const el = document.createElement('div'); el.className = 'ur-sheet hidden'; el.id = 'ur-sheet-' + id; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', title);
    el.innerHTML = '<div class="ur-sheet-box"><div class="ur-sheet-head"><button type="button" class="ur-btn ur-close" aria-label="Volver">‹ Volver</button><h2></h2></div><div class="ur-sheet-grid"></div></div>';
    el.querySelector('h2').textContent = title;
    el.addEventListener('click', e => { if(e.target === el || e.target.closest('.ur-close')) closeSheets(); });
    host().appendChild(el); sheets[id] = el; return el;
  }
  function openSheet(id){ closeSheets(); sheets[id].classList.remove('hidden'); }
  function closeSheets(){ for(const k in sheets) sheets[k].classList.add('hidden'); }
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeSheets(); });
  // al cambiar de pantalla, los paneles se cierran
  if(typeof setState === 'function'){ const o = setState; window.setState = setState = function(){ closeSheets(); return o.apply(this, arguments); }; }
  const grid = id => sheets[id].querySelector('.ur-sheet-grid');
  const LABELS = CFG.labels || {};
  const adopt = (id, node) => { if(node && node.parentNode !== grid(id)){ grid(id).appendChild(node); if(LABELS[node.id]) node.setAttribute('data-ur-label', LABELS[node.id]); } };

  // ---- TÍTULO: información, instalación y legales dentro de un panel «i»
  {
    const S = CFG.title.infoSheet; makeSheet('info', S.title);
    const g = grid('info'); g.classList.add('ur-sheet-info'); g.style.display = 'flex';
    const b = document.createElement('button'); b.type = 'button'; b.id = S.button; b.className = 'ur-btn'; b.textContent = S.icon; b.setAttribute('aria-label', 'Información');
    b.addEventListener('click', () => openSheet('info')); $('title-screen').appendChild(b);
    const moveInfo = () => { for(const sel of S.move){ const n = document.querySelector('#title-screen ' + sel); if(n) { n.style.removeProperty('display'); g.appendChild(n); } } };
    moveInfo(); new MutationObserver(moveInfo).observe($('title-screen'), {childList: true, subtree: true});
  }

  // ---- HUB: MODOS y MÁS
  {
    const H = CFG.home, M = H.modesSheet, O = H.moreSheet;
    makeSheet('modes', M.title); makeSheet('more', O.title);
    const modesBtn = document.createElement('button'); modesBtn.type = 'button'; modesBtn.id = M.button; modesBtn.className = 'ur-btn';
    modesBtn.innerHTML = '<span class="ur-modes-ico" aria-hidden="true">◆</span><span class="ur-modes-txt"><b></b><small></small></span>';
    modesBtn.querySelector('b').textContent = M.label; modesBtn.querySelector('small').textContent = M.sub;
    modesBtn.addEventListener('click', () => { sweep(); openSheet('modes'); });
    const moreBtn = document.createElement('button'); moreBtn.type = 'button'; moreBtn.id = O.button; moreBtn.className = 'ur-btn'; moreBtn.textContent = O.label; moreBtn.setAttribute('aria-label', O.aria);
    moreBtn.addEventListener('click', () => openSheet('more'));
    const keep = new Set(H.keepVisible.concat([M.button, O.button]));
    // el juego inserta «Botín» antes de #hub-howto-btn (reward-mailbox.js): el nodo ancla vuelve a su barra un instante y luego se aloja de nuevo
    for(const fn of (H.anchorFns || [])){ const o = window[fn]; if(typeof o !== 'function') continue;
      window[fn] = function(){ const how = $('hub-howto-btn'), top = document.querySelector('#mainmenu-screen .hub-top'); if(how && top && how.parentNode !== top) top.appendChild(how); const r = o.apply(this, arguments); sweep(); return r; }; }
    function sweep(){
      for(const id of M.move) adopt('modes', $(id));
      for(const id of O.move) adopt('more', $(id));
      // widgets desconocidos del juego (p. ej. la guía «Arena de entrenamiento»): se adopta el contenedor ENTERO, nunca sus botones sueltos
      if(M.sweepUnknownButtons){
        for(const n of document.querySelectorAll('#mainmenu-screen .hub-modes > :not(#hub-play-btn):not(.hub-endless-row)')) adopt('modes', n);
        for(const n of document.querySelectorAll('#mainmenu-screen .hub-top > button')) if(!keep.has(n.id) && !n.classList.contains('hub-profile')) adopt('more', n);
      }
    }
    function mount(){
      const mm = $('mainmenu-screen'); if(!mm) return;
      const top = mm.querySelector('.hub-top'), sec = mm.querySelector('.hub-sections');
      if(top && !$(O.button)) top.appendChild(moreBtn);
      if(sec && !$(M.button)) sec.appendChild(modesBtn);
      sweep();
      const tiles = [...mm.querySelectorAll('.hub-sections .hub-tile')].filter(t => !t.classList.contains('hidden'));
      tiles.forEach(t => t.classList.remove('ur-span2')); if(tiles.length % 2) tiles[tiles.length - 1].classList.add('ur-span2');
    }
    mount(); const mm = $('mainmenu-screen');
    if(mm) new MutationObserver(() => { clearTimeout(mount._t); mount._t = setTimeout(mount, 30); }).observe(mm, {childList: true, subtree: true});
  }
})();
