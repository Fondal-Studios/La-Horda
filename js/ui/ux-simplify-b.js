"use strict";
/* ============================================================
   js/ui/ux-simplify-b.js  (UX simplify B: título, hub, nombres, Modos)
   Solo presentación y agrupación: NO quita ninguna opción ni cambia ids.
   - Título: JUGAR AHORA es lo principal; "Tocá para continuar" (mismo nodo/id) queda secundario con un rótulo que dice qué abre.
   - Hub: la cabecera deja a la vista cuenta, Brasas, Ayuda, idioma y Opciones; Botín, tele, Pase de batalla y "Volver al título"
     viven en un menú "⋯ Más" (los mismos botones, con rótulo de texto). Ayuda reúne "Cómo se juega", la Guía y "Repetir tutorial".
   - Botón atrás: un solo rótulo "‹ Volver" (el destino queda en title/aria-label).
   - Modos: lo que ya está en el hub se agrupa bajo "OTROS MODOS".
   css/ux-simplify-b.css
   ============================================================ */
(function(){
  const $ = id => document.getElementById(id);

  /* ---------- 1. TÍTULO ---------- */
  function titleSub(){
    const sub = document.querySelector("#title-screen .bt-cta-menu-sub"), btn = $("title-continue-btn");
    if(!sub || sub.dataset.uxB) return;
    sub.dataset.uxB = "1"; sub.setAttribute("data-ux-b", "1"); sub.id = sub.id || "ux-title-cont-sub";
    sub.textContent = "Tu aventura: campaña, guardianes y tienda";
    if(btn) btn.setAttribute("aria-describedby", sub.id);
  }

  /* ---------- 2. HUB: menú "⋯ Más" ---------- */
  const MORE = [   // [id del botón existente, rótulo de texto]
    ["reward-mailbox-btn", "Botín pendiente"],
    ["hub-tele-btn", "Jugar en la tele"],
    ["hub-pass-btn", "Pase de batalla"],
    ["mainmenu-back-btn", "Volver al título"]
  ];
  let menu = null, moreBtn = null;
  function closeMore(){ if(!menu) return; menu.classList.add("hidden"); if(moreBtn) moreBtn.setAttribute("aria-expanded", "false"); }
  function openMore(){ if(!menu) return; sweepMore(); menu.classList.remove("hidden"); moreBtn.setAttribute("aria-expanded", "true"); const f = menu.querySelector("button:not(.hidden)"); if(f) try{ f.focus({preventScroll:true}); }catch(e){} }
  function sweepMore(){
    if(!menu) return;
    for(const [id, label] of MORE){
      const b = $(id); if(!b) continue;
      if(b.parentNode !== menu){ id === "reward-mailbox-btn" ? menu.insertBefore(b, menu.firstChild) : menu.appendChild(b); }
      b.classList.add("ux-more-item");
      if(id !== "reward-mailbox-btn"){
        if(!b.querySelector(".ux-more-lbl")){ const s = document.createElement("span"); s.className = "ux-more-lbl"; s.textContent = label; b.appendChild(s); }
      }
    }
    // punto de aviso en "⋯" si hay botín por revisar
    const m = $("reward-mailbox-btn"), n = m ? Number((/\((\d+)\)/.exec(m.title || "") || [])[1] || 0) : 0;
    if(moreBtn) moreBtn.classList.toggle("ux-dot", n > 0);
  }
  function mountHub(){
    const top = document.querySelector("#mainmenu-screen .hub-top"); if(!top) return;
    if(!$("hub-more-btn")){
      moreBtn = document.createElement("button"); moreBtn.type = "button"; moreBtn.id = "hub-more-btn"; moreBtn.className = "ui-icon-btn ux-more-btn";
      moreBtn.setAttribute("aria-haspopup", "true"); moreBtn.setAttribute("aria-expanded", "false"); moreBtn.setAttribute("aria-controls", "hub-more-menu");
      moreBtn.setAttribute("aria-label", "Más: botín, pase de batalla, tele y volver al título"); moreBtn.title = "Más";
      moreBtn.innerHTML = '<span aria-hidden="true">⋯</span>';
      moreBtn.addEventListener("click", e => { e.stopPropagation(); menu.classList.contains("hidden") ? openMore() : closeMore(); });
      menu = document.createElement("div"); menu.id = "hub-more-menu"; menu.className = "ux-more-menu hidden"; menu.setAttribute("role", "group"); menu.setAttribute("aria-label", "Más");
      menu.addEventListener("click", e => { if(e.target.closest("button")) setTimeout(closeMore, 0); });
      top.appendChild(moreBtn); top.appendChild(menu);
      document.addEventListener("click", e => { if(menu && !menu.classList.contains("hidden") && !e.target.closest("#hub-more-menu,#hub-more-btn")) closeMore(); });
      document.addEventListener("keydown", e => { if(e.key === "Escape" && menu && !menu.classList.contains("hidden")){ closeMore(); try{ moreBtn.focus(); }catch(_){} } });
      new MutationObserver(() => { clearTimeout(mountHub._t); mountHub._t = setTimeout(sweepMore, 30); }).observe(top, {childList:true});
    }
    // Ayuda: el "?" lleva rótulo de texto
    const h = $("hub-howto-btn");
    if(h && !h.querySelector(".ux-help-lbl")){
      h.classList.add("ux-help-btn"); h.innerHTML = '<span aria-hidden="true">?</span><span class="ux-help-lbl">Ayuda</span>';
      h.title = "Ayuda: cómo se juega, guía y tutorial"; h.setAttribute("aria-label", "Ayuda: cómo se juega, guía y tutorial");
    }
    // orden: Ayuda, idioma, Opciones, Más
    const order = ["hub-howto-btn", "hub-lang-btn", "hub-options-btn", "hub-more-btn"];
    for(const id of order){ const n = $(id); if(n && n.parentNode === top) top.appendChild(n); }
    if(menu) top.appendChild(menu);
    sweepMore();
  }

  /* ---------- 3. AYUDA: Cómo se juega + Guía + Repetir tutorial en un solo lugar ---------- */
  function decorateHelp(){
    const el = $("howto"), card = el && el.querySelector(".howto-card");
    if(!card || card.querySelector(".ux-help-more")) return;
    if(typeof state !== "undefined" && state !== "mainmenu") return;
    const row = document.createElement("div"); row.className = "ux-help-more";
    const mk = (txt, fn, id) => { const b = document.createElement("button"); b.type = "button"; b.className = "btn secondary"; b.id = id; b.textContent = txt;
      b.addEventListener("click", () => { if(typeof howtoClose === "function") howtoClose(); try{ fn(); }catch(e){ console.error(e); } }); return b; };
    if(typeof window.alphaGuideOpen === "function") row.appendChild(mk("Guía de tu nivel", () => alphaGuideOpen(), "ux-help-guide"));
    if(typeof window.alphaTrainingStart === "function") row.appendChild(mk("Repetir tutorial · 3 min", () => alphaTrainingStart(), "ux-help-train"));
    if(row.childNodes.length) card.insertBefore(row, card.querySelector("[data-howto-close]"));
  }
  // el botón Ayuda del hub abre el cuadro (how-to-play.js, su propio listener corre antes que este, delegado en document)
  document.addEventListener("click", e => { if(e.target.closest && e.target.closest("#hub-howto-btn")){ try{ decorateHelp(); }catch(_){} } });

  /* ---------- 4. BOTÓN ATRÁS único: "‹ Volver" ---------- */
  const BACKS = {"codex-back-btn":"al menú","shop-back-btn":"al menú","modeselect-back-btn":"al menú","prep-back-btn":"al menú","arenaselect-back-btn":"a Modos",
    "divina-back-btn":"a Arenas","menu-back-btn":"atrás","myinv-back-btn":"atrás","champdetail-back-btn":"atrás","quests-back-btn":"al menú","back":"al menú"};
  const OLD = /^‹\s*(Menú|Atrás|Sala|Arenas|Modos|Guardián|LA HORDA)$/;
  function fixBack(b){
    if(!b) return; const t = (b.textContent || "").trim(), m = OLD.exec(t); if(!m) return;
    const dest = {"Menú":"al menú", "Atrás":"atrás", "Sala":"a la Sala", "Arenas":"a Arenas", "Modos":"a Modos", "Guardián":"a Guardianes", "LA HORDA":"al menú"}[m[1]];
    b.textContent = "‹ Volver"; const lbl = "Volver " + dest; b.title = lbl; b.setAttribute("aria-label", lbl);
  }
  function wireBacks(){
    for(const id of Object.keys(BACKS)){
      const b = $(id); if(!b || b._uxB) continue; b._uxB = 1; fixBack(b);
      new MutationObserver(() => fixBack(b)).observe(b, {childList:true, characterData:true, subtree:true});
    }
  }

  /* ---------- 5. MODOS: "OTROS MODOS" (lo que ya está en el menú principal) ---------- */
  function modes(){
    const side = document.querySelector("#modeselect-screen .mode-side"), first = $("mode-arena-btn");
    if(!side || !first || $("ux-more-modes")) return;
    const h = document.createElement("div"); h.id = "ux-more-modes"; h.className = "ux-more-modes";
    h.innerHTML = '<b>OTROS MODOS</b><span>También están en el menú principal</span>';
    side.insertBefore(h, first);
  }

  function init(){
    titleSub(); mountHub(); wireBacks(); modes();
    const ts = $("title-screen");
    if(ts && !document.querySelector("#title-screen .bt-cta-menu-sub[data-ux-b]")){   // el CTA del título lo arma beta-ui.js más tarde
      const mo = new MutationObserver(() => { titleSub(); if(document.querySelector("#title-screen .bt-cta-menu-sub[data-ux-b]")) mo.disconnect(); });
      mo.observe(ts, {childList:true, subtree:true});
    }
    setTimeout(() => { titleSub(); mountHub(); }, 600);
  }
  init();   // el script va al final del <body>: los nodos del hub ya existen
  if(document.readyState !== "complete") window.addEventListener("load", () => { titleSub(); mountHub(); });
})();
