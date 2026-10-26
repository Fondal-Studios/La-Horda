"use strict";
/* ============================================================
   js/audio/music-files.js
   Reproductor de MÚSICA POR ARCHIVOS (biblioteca en assets/audio/music/, catálogo CATALOGO.json,
   elección por arena en js/data/music-map.js). Es una capa OPCIONAL sobre la música procedural:
   - Carga PEREZOSA: no pide nada al arrancar. El catálogo y los .ogg se bajan recién cuando el
     contexto de audio ya está corriendo (después del primer toque) y la partida pide un clima.
   - Si el catálogo está vacío, la pista no existe, el archivo falla o el navegador no lo puede
     reproducir, NO pasa nada: sigue sonando la música procedural de audio.js (sin errores).
   - Mientras suena un archivo, audio.js no programa notas nuevas (AU.fileActive).
   - Calma <-> intensa de la misma arena con HISTÉRESIS: sube a la intensa cuando la intensidad del
     director (M.int), un élite o el jefe se mantienen un rato; vuelve a la calma recién cuando bajó
     bastante y pasó un mínimo desde el último cambio (sin parpadeo).
   - Volumen y mute: la salida entra a musicDuck -> musicGain -> masterGain, o sea que respeta el
     slider de Música, el botón de mute y el duck de la pausa. En segundo plano se pausa.
   La lógica es pura (create(deps)) para probarla en Node sin navegador: tools/audio/t_music_player.js
   ============================================================ */
const MusicFilesLib = (()=>{
  const DEFAULTS = {
    baseUrl: "assets/audio/music/",
    tickMs: 500,
    hi: 0.6,          // intensidad (0..1) que dispara la pista intensa
    lo: 0.3,          // intensidad por debajo de la cual se puede volver a la calma
    upHoldMs: 2500,   // cuánto tiene que sostenerse la intensidad alta para subir
    downHoldMs: 8000, // cuánto tiene que sostenerse la baja para bajar
    minStayMs: 20000, // permanencia mínima en una pista de combate antes de cambiar
    fadeMs: 1800,     // crossfade
    maxFails: 3       // fallos seguidos antes de rendirse hasta recargar
  };
  const ROLE_OF_MODE = { title:"menu", menu:"menu", intro:"menu", prelude:"menu", wave:"calma", boss:"jefe", victory:"victoria", defeat:"derrota" };
  const ONE_SHOT = { victoria:1, derrota:1 };

  function create(deps){
    const cfg = Object.assign({}, DEFAULTS, deps.config || {});
    const S = {
      catalog: null, catalogState: "idle", map: deps.map || null,
      mode: null, arena: "_", level: 1,
      role: null, trackId: null, intense: false,
      cur: null, fails: 0, dead: false, paused: false,
      since: -Infinity, upSince: 0, downSince: 0, timer: null, log: []
    };
    const note = m => { if(S.log.length < 60) S.log.push(m); };
    const trackById = id => (S.catalog && S.catalog.tracks || []).find(t => t.id === id && t.verificada !== false) || null;

    // elige la pista del mapa para un rol; devuelve el track del catálogo o null
    function pick(role, arena){
      const m = S.map; if(!m) return null;
      let id = null;
      if(role === "calma" || role === "intensa" || role === "jefe"){
        const a = (m.arenas && m.arenas[arena]) || null;
        id = a ? (a[role] || (role === "intensa" ? a.calma : null) || (role === "jefe" ? a.intensa : null)) : null;
      } else id = m[role === "menu" ? "menu" : role] || null;
      const t = id ? trackById(id) : null;
      return t && t.archivo ? t : null;
    }

    async function ensureCatalog(){
      if(S.catalog) return true;
      if(S.catalogState === "loading" || S.catalogState === "failed") return false;
      S.catalogState = "loading";
      try{
        const c = await deps.fetchCatalog(cfg.baseUrl + "CATALOGO.json");
        if(!c || !Array.isArray(c.tracks)) throw new Error("catálogo inválido");
        S.catalog = c; S.catalogState = "ready"; return true;
      }catch(e){ S.catalogState = "failed"; note("catálogo: " + (e && e.message || e)); return false; }
    }

    function fadeOutAndDrop(h, ms){
      if(!h) return;
      try{ h.fadeTo(0, ms); }catch(e){}
      deps.later(() => { try{ h.dispose(); }catch(e){} }, ms + 150);
    }

    async function startTrack(role, t){
      if(S.cur && S.cur.id === t.id && S.cur.role === role) return;
      const old = S.cur;
      let h = null;
      try{
        h = await deps.open(cfg.baseUrl + t.archivo, { loop: !ONE_SHOT[role] && t.loopable !== false });
        if(!h) throw new Error("sin handle");
        S.cur = { id: t.id, role, h }; // antes de await play: una segunda llamada ve la pista nueva
        await h.play();
        h.fadeTo(1, ONE_SHOT[role] ? 150 : cfg.fadeMs, true);
        S.fails = 0; S.trackId = t.id; S.role = role; if(deps.onActive) deps.onActive(true);
        fadeOutAndDrop(old && old.h, cfg.fadeMs);
      }catch(e){
        note("falla " + t.id + ": " + (e && e.message || e));
        try{ h && h.dispose(); }catch(_){}
        if(S.cur && S.cur.h === h) S.cur = old || null;
        if(++S.fails >= cfg.maxFails){ S.dead = true; note("rendido: vuelve la música procedural"); }
        // si no queda ninguna pista sonando, audio.js retoma la procedural
        if(!S.cur){ S.trackId = null; S.role = null; if(deps.onActive) deps.onActive(false); }
      }
    }

    function stopAll(){
      if(S.cur){ fadeOutAndDrop(S.cur.h, cfg.fadeMs); S.cur = null; }
      S.trackId = null; S.role = null; S.intense = false;
      if(deps.onActive) deps.onActive(false);
    }

    // rol deseado según el modo y la intensidad (con histéresis)
    function wantedRole(now, intensity, hot){
      const mode = S.mode;
      if(!mode) return null;
      const base = ROLE_OF_MODE[mode] || "menu";
      if(base === "jefe") return "jefe";
      if(base !== "calma") return base;
      const stay = now - S.since >= cfg.minStayMs;
      const high = hot || intensity >= cfg.hi, low = !hot && intensity <= cfg.lo;
      if(high){ S.downSince = 0; if(!S.upSince) S.upSince = now; }
      else if(low){ S.upSince = 0; if(!S.downSince) S.downSince = now; }
      else { S.upSince = 0; S.downSince = 0; }
      if(!S.intense && S.upSince && now - S.upSince >= cfg.upHoldMs ) { S.intense = true; S.since = now; S.upSince = 0; }
      else if(S.intense && S.downSince && now - S.downSince >= cfg.downHoldMs && stay) { S.intense = false; S.since = now; S.downSince = 0; }
      return S.intense ? "intensa" : "calma";
    }

    async function tick(){
      if(S.dead || S.paused || !deps.canPlay()) return;
      if(S.cur && S.cur.h && S.cur.h.pausedByUs) return;
      const now = deps.now();
      const intensity = deps.intensity ? deps.intensity() : 0, hot = deps.hot ? !!deps.hot() : false;
      const role = wantedRole(now, intensity, hot);
      if(!role){ return; }
      if(!(await ensureCatalog())) { if(S.cur) stopAll(); return; }
      const t = pick(role, S.arena);
      if(!t){ if(S.cur) stopAll(); return; } // sin pista en el mapa: procedural
      await startTrack(role, t);
    }

    const api = {
      state: () => ({ mode:S.mode, arena:S.arena, role:S.role, trackId:S.trackId, intense:S.intense, active:!!S.cur, dead:S.dead, fails:S.fails, catalog:S.catalogState, paused:S.paused, log:S.log.slice() }),
      setMode(mode, level, arena){
        const same = S.mode === mode && S.arena === (arena || "_");
        S.mode = mode; S.level = level || 1; S.arena = arena || "_";
        if(!same){ S.intense = false; S.upSince = S.downSince = 0; S.since = -Infinity; }
        if(deps.canPlay()) return tick();
      },
      tick,
      setMap(m){ S.map = m; },
      setCatalog(c){ S.catalog = c; S.catalogState = "ready"; },
      pause(on){
        S.paused = !!on;
        if(S.cur && S.cur.h){ try{ on ? S.cur.h.pause() : S.cur.h.resume(); }catch(e){} }
      },
      start(){ if(!S.timer) S.timer = deps.every(() => { tick().catch(()=>{}); }, cfg.tickMs); },
      stop(){ if(S.timer){ deps.clear(S.timer); S.timer = null; } stopAll(); },
      pick, config: cfg
    };
    return api;
  }
  return { create, DEFAULTS, ROLE_OF_MODE };
})();
if(typeof module !== "undefined" && module.exports) module.exports = MusicFilesLib;

/* ---------------- enganche real con audio.js (solo en el navegador) ---------------- */
const MusicFiles = (()=>{
  if(typeof window === "undefined" || typeof document === "undefined") return null;
  let inst = null;
  const safe = fn => { try{ return fn(); }catch(e){ return undefined; } };
  function open(url, opt){
    return new Promise((resolve, reject) => {
      if(typeof audioCtx === "undefined" || !audioCtx || typeof musicDuck === "undefined" || !musicDuck) return reject(new Error("sin contexto"));
      const el = new Audio(); el.preload = "auto"; el.loop = !!opt.loop; el.crossOrigin = "anonymous";
      let src = null, g = null, dead = false;
      const fail = e => { if(!dead){ dead = true; try{ el.removeAttribute("src"); el.load(); }catch(_){} reject(e instanceof Error ? e : new Error("no se pudo cargar " + url)); } };
      el.addEventListener("error", () => fail(new Error("error de red/formato")), { once:true });
      el.addEventListener("canplay", () => {
        if(dead) return;
        try{
          src = audioCtx.createMediaElementSource(el); g = audioCtx.createGain(); g.gain.value = 0;
          src.connect(g); g.connect(musicDuck);
        }catch(e){ return fail(e); }
        resolve({
          play: () => el.play(),
          pause: () => { el.pause(); },
          resume: () => { el.play().catch(()=>{}); },
          fadeTo: (v, ms) => { const t = audioCtx.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(v, t + ms/1000); },
          dispose: () => { dead = true; try{ el.pause(); el.removeAttribute("src"); el.load(); src.disconnect(); g.disconnect(); }catch(_){} }
        });
      }, { once:true });
      el.src = url;
    });
  }
  function init(){
    if(inst) return inst;
    inst = MusicFilesLib.create({
      map: typeof MUSIC_MAP !== "undefined" ? MUSIC_MAP : null,
      now: () => performance.now(),
      canPlay: () => safe(() => typeof audioCtx !== "undefined" && audioCtx && audioCtx.state === "running" && audioEnabled !== false && !document.hidden) === true,
      fetchCatalog: url => fetch(url, { cache: "no-cache" }).then(r => { if(!r.ok) throw new Error("HTTP " + r.status); return r.json(); }),
      open,
      later: (fn, ms) => setTimeout(fn, ms),
      every: (fn, ms) => setInterval(fn, ms),
      clear: id => clearInterval(id),
      intensity: () => safe(() => (typeof M !== "undefined" && M && M.mode !== "off") ? M.int : 0) || 0,
      hot: () => safe(() => {
        if(typeof boss !== "undefined" && boss && boss.alive) return true;
        if(typeof enemies !== "undefined" && enemies) for(const e of enemies) if(e && e.alive && (e.elite || e.isElite || e.affix)) return true;
        return false;
      }),
      onActive: on => safe(() => { if(typeof AU !== "undefined") AU.fileActive = !!on; })
    });
    document.addEventListener("visibilitychange", () => inst.pause(document.hidden));
    inst.start();
    return inst;
  }
  return {
    // lo llama audio.js en setMusicMode; no hace nada hasta que el contexto corre (primer toque)
    onMode(mode, level, arena){ try{ return init().setMode(mode, level, arena); }catch(e){} },
    pause(on){ try{ if(inst) inst.pause(on); }catch(e){} },
    state(){ return inst ? inst.state() : null },
    // créditos para Opciones: lee el catálogo recién cuando se abre la sección
    async credits(){
      try{ const c = await fetch(MusicFilesLib.DEFAULTS.baseUrl + "CATALOGO.json").then(r => r.json()); return (c.tracks || []).filter(t => t.enUso && t.atribucion); }
      catch(e){ return []; }
    }
  };
})();

// Opciones › Créditos › Música: se llena al abrir la sección (no pide nada antes).
(()=>{
  if(typeof document === "undefined") return;
  const box = document.getElementById("music-credits-box"); if(!box || !MusicFiles) return;
  box.addEventListener("toggle", async () => {
    if(!box.open || box.dataset.done) return; box.dataset.done = "1";
    const list = await MusicFiles.credits(), out = document.getElementById("music-credits"); if(!out || !list.length) return;
    out.textContent = "";
    for(const t of list){ const p = document.createElement("div"); p.textContent = t.atribucion; out.appendChild(p); }
  });
})();
