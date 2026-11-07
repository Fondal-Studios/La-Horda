"use strict";
/* ============================================================
   js/i18n/i18n.js — IDIOMAS: español (base), inglés y portugués.
   El español del juego es la CLAVE: no hace falta tocar cada texto. El traductor:
     · reemplaza el texto de la interfaz (nodos de texto y title / aria-label / placeholder / alt) y lo mantiene al día con un MutationObserver;
     · traduce lo que se dibuja en el canvas (fillText / strokeText / measureText);
     · entiende textos con números ("Nivel 12" → "Level 12") normalizando los números a {n}.
   Diccionarios: js/i18n/en.js y js/i18n/pt.js (I18N.add("en", {...})). Un texto sin traducción se muestra en español (nunca vacío).
   Elección: ?lang=xx > guardado (localStorage horda_lang) > idioma del navegador (pt*, en*) > español.
   Estado para pruebas: window.I18N.
   ============================================================ */
(function(){
  const SELF = document.currentScript && document.currentScript.src, loaded = {};
  const LANGS = ["es", "en", "pt"], KEY = "horda_lang";
  const NAMES = { es: "Español", en: "English", pt: "Português" };
  const dict = { en: Object.create(null), pt: Object.create(null) }, pats = { en: [], pt: [] };
  const norm = s => { const nums = []; const t = s.replace(/\d+(?:[.,]\d+)*/g, m => { nums.push(m); return "{n}"; }); return { t, nums }; };
  let lang = "es";
  function detect(){
    try{ const q = (location.search.match(/[?&]lang=([a-z]{2})/i) || [])[1]; if(q && LANGS.includes(q.toLowerCase())) return q.toLowerCase(); }catch(e){}
    try{ const v = localStorage.getItem(KEY); if(v && LANGS.includes(v)) return v; }catch(e){}
    // en automatización (Playwright/CI: navigator.webdriver) no se adivina el idioma: las pruebas del juego esperan español
    try{ if(navigator.webdriver) return "es"; }catch(e){}
    try{ for(const l of (navigator.languages || [navigator.language || "es"])){ const p = String(l).slice(0, 2).toLowerCase(); if(LANGS.includes(p)) return p; } }catch(e){}
    return "es";
  }
  // traduce un texto SUELTO (sin recortar): conserva espacios de los extremos
  const cache = { en: new Map(), pt: new Map() };
  function tr(s){
    if(lang === "es" || !s) return s;
    const c = cache[lang], hit = c.get(s); if(hit !== undefined) return hit;
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s), core = m[2]; let out = s;
    if(core){
      const d = dict[lang];
      if(d[core] !== undefined) out = m[1] + d[core] + m[3];
      else {
        const n = norm(core);
        if(n.nums.length && d[n.t] !== undefined){ let i = 0; out = m[1] + d[n.t].replace(/\{n\}/g, () => n.nums[i++] || "") + m[3]; }
        else for(const [re, to] of pats[lang]){ const mm = re.exec(core); if(mm){ out = m[1] + to.replace(/\$(\d)/g, (_, i) => tr(mm[+i] || "")) + m[3]; break; } }
      }
    }
    if(c.size > 6000) c.clear(); c.set(s, out); return out;
  }
  // ---------- DOM ----------
  const ATTRS = ["title", "aria-label", "placeholder", "alt"], SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1, CODE: 1 };
  const plain = x => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const textRec = new WeakMap(), attrRec = new WeakMap(); let busy = false;
  // texto de un nodo: guardamos siempre el original en español (es) y lo recalculamos para el idioma activo.
  // Si el valor actual es el original o la traducción (en cualquier idioma) del original, es "nuestro";
  // si no, el juego escribió algo nuevo y ese pasa a ser el nuevo original.
  function trIn(l, es){ const keep = lang; if(l === "es") return es; lang = l; try{ return tr(es); }finally{ lang = keep; } }
  function ours(rec, cur){ return cur === rec.es || LANGS.some(l => { const o = trIn(l, rec.es); return cur === o || plain(cur) === plain(o); }); }
  // si un script del juego vuelve a escribir un texto que ya estaba traducido (lo lee del DOM y lo reinserta), recuperamos su original
  const rev = { en: null, pt: null };
  function unTr(cur){
    const t = cur.trim(); if(!t) return cur;
    if(dict.en[t] !== undefined || dict.pt[t] !== undefined) return cur;   // ya es un original en español
    for(const l of LANGS){ if(l === "es") continue; if(!rev[l]){ rev[l] = new Map(); for(const k in dict[l]){ const v = dict[l][k]; if(v !== k && !rev[l].has(v)) rev[l].set(v, k); } }
      const k = rev[l].get(t); if(k !== undefined) return cur.replace(t, k); }
    return cur;
  }
  function doText(n){
    const cur = n.nodeValue; let rec = textRec.get(n);
    if(rec && !ours(rec, cur)) rec = null;
    const es = rec ? rec.es : unTr(cur), out = trIn(lang, es);
    if(out === es){ if(rec) textRec.delete(n); if(cur !== es){ n.nodeValue = es; } return; }
    // el pixel-font-fix quita tildes de mayúsculas: no es texto nuevo ni hay que reescribirlo (evita el bucle)
    if(cur !== out && plain(cur) !== plain(out)) n.nodeValue = out;
    textRec.set(n, { es });
  }
  function doAttrs(el){
    for(const a of ATTRS){
      if(!el.hasAttribute(a)) continue;
      const cur = el.getAttribute(a); let rec = attrRec.get(el); let r = rec && rec[a];
      if(r && !ours(r, cur)) r = null;
      const es = r ? r.es : unTr(cur), out = trIn(lang, es);
      if(out === es){ if(rec && rec[a]) delete rec[a]; if(cur !== es) el.setAttribute(a, es); continue; }
      if(cur !== out) el.setAttribute(a, out);
      if(!rec) attrRec.set(el, rec = {}); rec[a] = { es };
    }
  }
  function walk(root){
    if(!root) return;
    if(root.nodeType === 3){ doText(root); return; }
    if(root.nodeType !== 1 || SKIP[root.tagName]) return;
    doAttrs(root);
    for(let c = root.firstChild; c; c = c.nextSibling) walk(c);
  }
  function revert(root){
    const w = document.createTreeWalker(root, NodeFilter.SHOW_ALL); let n;
    while((n = w.nextNode())){
      if(n.nodeType === 3){ const r = textRec.get(n); if(r && ours(r, n.nodeValue)) n.nodeValue = r.es; textRec.delete(n); }
      else if(n.nodeType === 1){ const rec = attrRec.get(n); if(rec){ for(const a in rec){ if(ours(rec[a], n.getAttribute(a))) n.setAttribute(a, rec[a].es); } attrRec.delete(n); } }
    }
  }
  let obs = null;
  function startObserver(){
    if(obs || typeof MutationObserver === "undefined") return;
    obs = new MutationObserver(muts => {
      if(busy || lang === "es") return; busy = true;
      try{ for(const m of muts){
        if(m.type === "characterData") doText(m.target);
        else if(m.type === "attributes") doAttrs(m.target);
        else for(const n of m.addedNodes) walk(n);
      } }finally{ busy = false; }
    });
    obs.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  function apply(){
    if(typeof document === "undefined" || !document.documentElement) return;
    busy = true;
    try{
      if(lang === "es") revert(document.documentElement); else walk(document.documentElement);
      document.documentElement.setAttribute("lang", lang);
      const t = document.querySelector("title"); if(t){ if(!t.__es) t.__es = t.textContent; t.textContent = lang === "es" ? t.__es : tr(t.__es); }
    }finally{ busy = false; }
    for(const b of document.querySelectorAll("[data-lang-btn]")){ b.setAttribute("aria-pressed", b.dataset.langBtn === lang ? "true" : "false"); b.classList.toggle("on", b.dataset.langBtn === lang); }
    const sel = document.getElementById("opt-lang"); if(sel && sel.value !== lang) sel.value = lang;
  }
  // ---------- canvas ----------
  (function wrapCanvas(){
    if(typeof CanvasRenderingContext2D === "undefined") return;
    const P = CanvasRenderingContext2D.prototype;
    for(const f of ["fillText", "strokeText", "measureText"]){
      const o = P[f]; if(!o || o.__i18n) continue;
      const w = function(t){ if(lang !== "es" && typeof t === "string"){ arguments[0] = tr(t); } return o.apply(this, arguments); }; w.__i18n = true; P[f] = w;
    }
  })();
  function load(l, cb){
    if(!SELF || loaded[l] === "pending") return; loaded[l] = "pending";
    const sc = document.createElement("script"); sc.src = SELF.replace(/i18n\.js(\?.*)?$/, l + ".js");
    sc.onload = cb; sc.onerror = () => { loaded[l] = false; }; document.head.appendChild(sc);
  }
  // ---------- API ----------
  const listeners = [];
  const I18N = {
    LANGS, NAMES,
    get lang(){ return lang; },
    get on(){ return lang !== "es"; },
    add(l, d, patterns){ if(!dict[l]) return; loaded[l] = true; Object.assign(dict[l], d || {}); if(patterns) for(const [re, to] of patterns) pats[l].push([typeof re === "string" ? new RegExp(re) : re, to]); cache[l].clear(); rev[l] = null; if(l === lang) apply(); },
    t: tr,
    // texto con variables: I18N.tf("Hola {nombre}", {nombre: "Ana"}) (la clave traducida conserva los {…})
    tf(s, vars){ let o = tr(s); if(vars) o = o.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)); return o; },
    has(l){ return !!dict[l]; },
    hasKey(l, k){ return !!dict[l] && dict[l][k] !== undefined; },
    size(l){ return dict[l] ? Object.keys(dict[l]).length : 0; },
    setLang(l){
      if(!LANGS.includes(l) || l === lang) return;
      if(l !== "es" && !loaded[l]){ load(l, () => I18N.setLang(l)); return; }   // el diccionario (~900 KB) se baja solo cuando se necesita
      lang = l; try{ localStorage.setItem(KEY, l); }catch(e){}
      apply(); for(const f of listeners){ try{ f(l); }catch(e){} }
    },
    onChange(f){ listeners.push(f); },
    // selector de idioma: tres botones (ES · EN · PT) dentro de `host`
    mountSelector(host){
      if(!host || host.querySelector("[data-lang-btn]")) return;
      const box = document.createElement("div"); box.className = "lang-select"; box.setAttribute("role", "group"); box.setAttribute("aria-label", "Idioma");
      for(const l of LANGS){
        const b = document.createElement("button"); b.type = "button"; b.className = "lang-btn"; b.dataset.langBtn = l; b.textContent = l.toUpperCase(); b.title = NAMES[l]; b.setAttribute("lang", l);
        b.addEventListener("click", ev => { ev.stopPropagation(); I18N.setLang(l); });
        box.appendChild(b);
      }
      host.appendChild(box); apply();
    },
    apply,
    _rec(n){ return textRec.get(n); }
  };
  lang = detect();
  window.I18N = I18N;
  // idioma distinto de español al arrancar: carga bloqueante del diccionario durante el parseo (sin parpadeo en español)
  if(lang !== "es" && SELF && document.readyState === "loading") document.write('<script src="' + SELF.replace(/i18n\.js(\?.*)?$/, lang + '.js') + '"><\/script>');
  else if(lang !== "es" && !loaded[lang]) load(lang, () => apply());
  const boot = () => {
    startObserver(); for(const h of document.querySelectorAll("[data-lang-host]")) I18N.mountSelector(h);
    // hub: un botón que rota el idioma (ES → EN → PT); opciones: lista desplegable
    const sync = () => { const hb = document.getElementById("hub-lang-btn"); if(hb){ hb.textContent = lang.toUpperCase(); hb.title = NAMES[lang]; } };
    sync(); I18N.onChange(sync);
    // delegado en el documento: sigue andando aunque el juego rehaga esos nodos
    document.addEventListener("click", ev => {
      const t = ev.target && ev.target.closest ? ev.target.closest("#hub-lang-btn") : null;
      if(t){ ev.stopPropagation(); I18N.setLang(LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length]); }
    }, true);
    document.addEventListener("change", ev => { if(ev.target && ev.target.id === "opt-lang") I18N.setLang(ev.target.value); }, true);
    const sel = document.getElementById("opt-lang"); if(sel) sel.value = lang;
    apply();
  };
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
