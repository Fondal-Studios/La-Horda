"use strict";
/* ============================================================
   js/audio/sample-bank.js
   Capa de MUESTRAS (archivos CC0 en assets/audio/, ver assets/audio/CREDITS.md) que se suma al motor
   sintetizado de audio.js. Tres piezas:

   1) MÚSICA lo-fi retro. Menús y título: lo-fi lento (8-bit / Rhodes). Partida: lo-fi de más BPM (3 temas
      que rotan por arena y cada 3 niveles). Jefe: lo-fi chiptune "glitch" rápido. Victoria / derrota siguen
      siendo los golpes sintetizados. Si el archivo no cargó (sin red, formato no soportado) o el jugador elige
      "Original", sigue la música compuesta de music-score.js: nunca queda en silencio por esto.
        - audio.js avisa cada cambio de modo (LofiMusic.onMode) y pregunta SampleBank.holds() antes de
          programar notas sintetizadas.
        - Pasa por musicDuck: la pausa, los golpes grandes y el combate denso la bajan igual que antes.
   2) EFECTOS: playSfx() pide SampleBank.layer(tipo, fuente, destino). El golpe sintético (transiente + cuerpo)
      se conserva y se le suma una muestra según el MATERIAL del enemigo y el arma del héroe. Las habilidades
      pasan por abilityAudio() (abilities.js → castAbility): sonido según elemento / tipo de habilidad.
   3) VOCES de campeón: gritos de ataque, habilidad (con el nombre del elemento en las voces femeninas), ultimate,
      daño, muerte y victoria. Hay 1 voz masculina y 3 femeninas; cada campeón usa una con SU tono (playbackRate),
      con tope de frecuencia por campeón y 2 voces simultáneas como máximo, para no tapar el combate.

   Costos: ~6 MB en disco (música 5 MB se baja SOLO cuando hace falta; efectos ~0,5 MB se precargan en reposo, de a un
   archivo; cada banco de voz ~0,1 MB se baja cuando un héroe de la partida lo usa). En memoria (decodificado): ~30 MB por
   tema (solo 2 a la vez), ~10 MB de efectos y ~2-4 MB por banco de voz. Cada disparo es 1 BufferSource + 1 Gain (se cuentan en el tope de nodos por cuadro).
   Entropía cosmética: usa su propio generador (nunca el RNG de combate ni de botín).
   ============================================================ */
const SampleBank = (()=>{
  const BASE = "assets/audio/";
  // Nivel de la música de archivos respecto del motor sintético (los temas están normalizados a ~-18 LUFS).
  const LOFI_LEVEL = 1.15;
  // Voces de campeón: v = voz base ("m" masculina, "f1".."f3" femeninas), p = tono (1 = original).
  // Es una ASIGNACIÓN DE DISEÑO editable: campeón nuevo sin entrada → voz y tono derivados de su clave.
  const VOICES = {
    tanque:{v:"m",p:0.80}, guerrero:{v:"m",p:0.93}, mago:{v:"m",p:1.06}, soporte:{v:"f1",p:1.0}, segador:{v:"m",p:0.72},
    axiom:{v:"m",p:0.66}, profeta:{v:"f2",p:0.97}, musashi:{v:"m",p:1.0}, cazadora:{v:"f3",p:1.04}, nigromante:{v:"m",p:0.84},
    libertador:{v:"m",p:0.9}, ilkan:{v:"m",p:0.76}, asesino:{v:"m",p:1.12}, myla:{v:"f3",p:1.12}, ynara:{v:"f1",p:0.94}, brasa:{v:"f2",p:1.0},
    eslabon:{v:"m",p:0.88}, morwen:{v:"f2",p:0.88}, farolero:{v:"m",p:0.98}, iria:{v:"f1",p:1.1}
  };
  const VOICE_COUNT = { m:{attack:9, big:6, hurt:6}, f:{attack:3, hurt:3} };
  // gap: ms mínimos entre voces del MISMO campeón; chance: probabilidad (el combate no habla todo el tiempo)
  const VOICE_RULES = { skill:{gap:2600, chance:0.55}, ult:{gap:900, chance:1}, hurt:{gap:3800, chance:0.7}, death:{gap:0, chance:1}, victory:{gap:0, chance:1} };
  const MAX_VOICES = 2;

  // RNG privado (mismo Mulberry32 que audio.js pero con otra semilla): no toca el azar del juego.
  let seed = 0x5a3c1f27;
  const rnd = ()=>{ let x = seed = (seed + 0x6D2B79F5) | 0; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };

  let manifest = null, manifestP = null;
  const bufs = new Map(), loading = new Map(), failed = new Set();
  const lastPick = {}, voiceLast = {}; let voiceEnds = [];

  function ctxOk(){ return typeof audioCtx!=="undefined" && !!audioCtx; }
  function loadManifest(){
    if(!manifestP) manifestP = fetch(BASE+"manifest.json").then(r=>r.ok ? r.json() : null).then(j=>{ manifest = j; return j; }).catch(()=>null);
    return manifestP;
  }
  // Baja y decodifica un archivo (una sola vez; si falla, no se reintenta en la sesión).
  function load(rel){
    if(bufs.has(rel)) return Promise.resolve(bufs.get(rel));
    if(failed.has(rel) || !ctxOk()) return Promise.resolve(null);
    if(loading.has(rel)) return loading.get(rel);
    const p = fetch(BASE+rel).then(r=>{ if(!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(ab=>new Promise((ok,no)=>{ const d = audioCtx.decodeAudioData(ab, ok, no); if(d && d.then) d.then(ok, no); }))
      .then(b=>{ bufs.set(rel, b); loading.delete(rel); return b; })
      .catch(()=>{ failed.add(rel); loading.delete(rel); return null; });
    loading.set(rel, p); return p;
  }
  // Precarga en reposo, de a un archivo (no compite con el arranque ni con el combate).
  let warmed = false;
  function warm(){
    if(warmed || !ctxOk()) return; warmed = true;
    loadManifest().then(m=>{
      if(!m) return;
      const q = [];
      for(const s of Object.values(m.sfx)) for(const f of s.files) q.push(f.file);
      let i = 0;
      const step = ()=>{ if(i >= q.length) return; load(q[i++]).then(()=>setTimeout(step, 30)); };
      setTimeout(step, 2500);
    });
  }

  // Voces: se decodifican por BANCO (m, f1, f2, f3) solo cuando un héroe de la partida las usa (cada banco ~3-6 MB ya
  // decodificado): el resto de la memoria de audio queda libre en celulares modestos.
  const banks = new Set();
  function ensureBank(v){
    if(banks.has(v) || !ctxOk()) return; banks.add(v);
    loadManifest().then(m=>{ if(!m) return; const q = Object.entries(m.voice).filter(([k])=>k.startsWith(v+"_")).map(([, r])=>r.file);
      let i = 0; const step = ()=>{ if(i < q.length) load(q[i++]).then(()=>setTimeout(step, 10)); }; step(); });
  }
  function prepareParty(){
    try{ const hs = (typeof heroes!=="undefined" && heroes) ? heroes : []; for(const h of hs) if(h && h.classKey) ensureBank(profile(h.classKey).v);
      if(typeof player!=="undefined" && player && player.classKey) ensureBank(profile(player.classKey).v); }catch(e){}
  }

  /* ---------------- efectos ---------------- */
  function _play(buf, D, vol, rate, delay){
    const t = audioCtx.currentTime + (delay||0);
    const s = audioCtx.createBufferSource(); s.buffer = buf; s.playbackRate.value = rate;
    const g = audioCtx.createGain(); g.gain.value = vol; s.connect(g); g.connect(D);
    s.onended = ()=>{ try{ g.disconnect(); }catch(e){} };
    s.start(t); try{ AU.frN += 2; }catch(e){}
    return buf.duration / rate;
  }
  // Una muestra al azar del conjunto (sin repetir la anterior), con tono ±8 % y volumen ±1,5 dB.
  function sfx(set, D, vol, rate, delay){
    if(!manifest || !ctxOk() || typeof audioEnabled!=="undefined" && !audioEnabled) return 0;
    const S = manifest.sfx[set]; if(!S) return 0;
    const n = S.files.length; let k = (rnd()*n)|0; if(n>1 && k===lastPick[set]) k = (k+1) % n; lastPick[set] = k;
    const buf = bufs.get(S.files[k].file); if(!buf) return 0;
    return _play(buf, D, vol*(1-rnd()*0.16), (rate||1)*(1+(rnd()*2-1)*0.08), delay);
  }
  // Material del enemigo (audio.js: _sfxMat) → conjunto de muestras
  const MAT_SET = { flesh:"hitFlesh", bone:"hitFlesh", wet:"slime", stone:"rock", ice:"glass", magic:"arcane", fire:"fire", metal:"metal" };
  function layer(type, src, D){
    if(!manifest) return;
    const mat = (typeof _sfxMat==="function" && src && typeof src==="object") ? _sfxMat(src) : null;
    const set = MAT_SET[mat] || "hitFlesh";
    const hero = (typeof player!=="undefined" && player) || null;
    switch(type){
      case "hit": sfx(set, D, 0.34); if(hero && typeof SFX_WEAPON!=="undefined"){ const w = SFX_WEAPON[hero.classKey]; if(w==="blade") sfx("blade", D, 0.26); else if(w==="blunt") sfx("hitHeavy", D, 0.3); } break;
      case "crit": sfx("hitHeavy", D, 0.5); sfx(set, D, 0.3); break;
      case "heavy": sfx("hitHeavy", D, 0.62, 0.9); break;
      case "kill": sfx(set==="slime" ? "slime" : "creatureDie", D, 0.28); break;
      case "eliteKill": sfx("creatureHurt", D, 0.4, 0.85); sfx("hitHeavy", D, 0.35); break;
      case "bigKill": sfx("monster", D, 0.5, 0.8); sfx("rock", D, 0.4); break;
      case "bossRoar": case "roar": sfx("roar", D, 0.8, 0.85); sfx("monster", D, 0.45, 0.7, 0.05); break;
      case "bossDeath": sfx("roar", D, 0.8, 0.7); sfx("rock", D, 0.55, 0.8, 0.25); sfx("monster", D, 0.5, 0.6, 0.12); break;
      case "cast": sfx("arcane", D, 0.3); break;
      case "ult": sfx("arcane", D, 0.5, 0.85); sfx("hitHeavy", D, 0.3, 0.8, 0.04); break;
      case "skillHit": sfx("hitHeavy", D, 0.3); sfx("arcane", D, 0.22, 1.25); break;
      case "hurt": sfx("hitFlesh", D, 0.36, 0.9); voice(hero, "hurt"); break;
      case "hurtHeavy": sfx("hitHeavy", D, 0.5, 0.85); voice(hero, "hurt"); break;
      case "playerDeath": voice(hero, "death"); break;
      case "victory": voice(hero, "victory"); break;
      case "blade": sfx("blade", D, 0.5); break;
      case "punch": sfx("hitFlesh", D, 0.45, 0.9); sfx("hitHeavy", D, 0.3, 1.1); break;
      case "stomp": sfx("rock", D, 0.5, 0.85); sfx("hitHeavy", D, 0.4, 0.8); break;
      case "boom": sfx("hitHeavy", D, 0.6, 0.7); sfx("rock", D, 0.35, 0.9, 0.04); break;
      case "thunder": sfx("arcane", D, 0.55, 0.6); sfx("hitHeavy", D, 0.45, 0.7, 0.05); break;
      case "zap": sfx("arcane", D, 0.34, 1.4); break;
      case "freeze": sfx("glass", D, 0.3, 1.25); break;
      case "shatter": sfx("glass", D, 0.6); break;
      case "splat": case "gib": sfx("slime", D, 0.42); break;
      case "burnDeath": sfx("fire", D, 0.3, 1.2); break;
      case "hook": sfx("swing", D, 0.5, 1.1); break;
      case "gallop": break;
    }
  }

  /* ---------------- habilidades ---------------- */
  // Familia de sonido por elemento y tipo de habilidad (sk.element, sk.kind).
  const KIND_RULES = [
    [/heal|shield|buff|team_|retro_|immun|vigil|bubble/, "support"],
    [/slash|blade|cut|ronin|ghost|thousand|bayonet|triple|cone|bleed|lance|hook/, "blade"],
    [/slam|stomp|colossus|golem|quake|taunt|tantrum|march|sinkhole|stun|provoke/, "slam"],
    [/summon|soul|plague|condemned|skel|minion|raise|curse/, "dark"],
    [/shot|rain|arrow|pierc|musket|volley|bolt/, "shot"],
    [/blink|teleport|step|dash|charge|stealth|drag|slide|gallop/, "move"],
  ];
  // Los campeones de Expedición / Ascensión traen kind "expedition"/"ascension": se leen nombre y descripción.
  // Orden = prioridad (la primera regla que coincide manda). Es cosmético: ajustar acá no toca el balance.
  const TEXT_RULES = [
    [/^(escudo|obtiene|gana |aliados|repara|cura |sacrifica|brindis)/, "support", true], // solo la descripción: empieza dando un beneficio
    [/fuego|calor|ardiente|horno|llama|ceniza|vapor/, "fire"],
    [/hielo|escarcha|congel|helad/, "ice"],
    [/rayo|relámpago|perno|circuito|conductor|descarga/, "zap"],
    [/muro|torre|torreta|barrica|construye|levanta|placa|ciudadela|fortific|nube|hongo|ancla|farol/, "build"],
    [/peste|infect|maldi|sombra|espora|alma|enjambre|escarabaj|vino|máscara|invoca/, "dark"],
    [/portal|cicatriz|avanza|se desplaza|se traslada|salto|cabalga|paso |reflejo fugitivo|ruta|recorre/, "move"],
    [/sangr|herida|corte|aguja|puntada|costura|astilla|pluma|deshilachar|trazo|tinta/, "blade"],
    [/gravit|pozo|campana|bronce|sonoro|vibraci|tañido|sacudida|colapso|implosi|ola|océano|corriente|raíces|surco|estrella|onda|empuja/, "slam"],
    [/curaci|bendic|restaura/, "support"],
  ];
  function skillFamily(sk){
    const el = sk && sk.element || "", kind = (sk && sk.kind || "") + " " + (sk && sk.id || "");
    if(el==="fire") return "fire"; if(el==="ice") return "ice"; if(el==="heal" || el==="shield") return "support";
    if(el==="lightning") return "zap"; if(el==="rot") return "dark";
    for(const [re, fam] of KIND_RULES) if(re.test(kind)) return fam;
    if(/^(expedition|ascension)/.test(kind)){ const tx = ((sk.name||"")+" | "+(sk.desc||"")).toLowerCase(), d = (sk.desc||"").toLowerCase(); for(const [re, fam, onlyDesc] of TEXT_RULES) if(re.test(onlyDesc ? d : tx)) return fam; }
    if(el==="holy" || el==="arcane") return "magic";
    if(el==="bleed") return "blade";
    return el==="physical" ? "slam" : "magic";
  }
  function abilityAudio(caster, sk, isUlt){
    if(!manifest || !ctxOk() || !caster || !sk) return;
    const D = AU.sfxIn; if(!D) return;
    // héroes ajenos (cooperativo, bots): solo los que se ven, y más bajo
    const mine = caster===(typeof player!=="undefined" ? player : null);
    if(!mine && typeof inView==="function" && !inView(caster.x, caster.y, 60)) return;
    const k = mine ? 1 : 0.6, u = isUlt ? 1.45 : 1, fam = skillFamily(sk);
    switch(fam){
      case "fire": sfx("fire", D, 0.5*k*u, isUlt ? 0.85 : 1); break;
      case "ice": sfx("glass", D, 0.42*k*u, 1.15); sfx("arcane", D, 0.2*k, 1.3, 0.03); break;
      case "zap": sfx("arcane", D, 0.45*k*u, 1.45); break;
      case "support": sfx("arcane", D, 0.3*k*u, 1.7); break;
      case "blade": sfx("swing", D, 0.55*k*u); sfx("blade", D, 0.3*k*u, 1, 0.05); break;
      case "slam": sfx("hitHeavy", D, 0.5*k*u, 0.85); sfx("rock", D, 0.3*k*u, 1, 0.06); break;
      case "dark": sfx("slime", D, 0.4*k*u, 0.8); sfx("arcane", D, 0.28*k, 0.7, 0.04); break;
      case "shot": sfx("swing", D, 0.5*k*u, 1.5); break;
      case "move": sfx("swing", D, 0.45*k*u, 1.2); break;
      case "build": sfx("rock", D, 0.5*k*u, 0.9); sfx("metal", D, 0.28*k*u, 0.9, 0.05); break;
      default: sfx("arcane", D, 0.4*k*u, isUlt ? 0.8 : 1);
    }
    if(isUlt) sfx("hitHeavy", D, 0.35*k, 0.7, 0.08);
    voice(caster, isUlt ? "ult" : "skill", sk);
  }

  /* ---------------- voces ---------------- */
  // Campeón sin entrada propia: el género sale de su título ("Vesper, la Costurera…" → femenina; "el" → masculina), la voz
  // y el tono de su clave (estables entre sesiones) y los tanques bajan un poco el tono. Se guarda en caché.
  const _derived = {};
  function profile(key){
    if(VOICES[key]) return VOICES[key];
    if(_derived[key]) return _derived[key];
    let h = 0; for(const c of String(key||"")) h = (h*31 + c.charCodeAt(0)) >>> 0;
    const C = (typeof CLASSES!=="undefined" && CLASSES[key]) || {}, fem = /,\s*la\s/i.test(C.name||""), tank = /^tanque|tanque/i.test(C.role||"");
    const v = fem ? ["f1","f2","f3"][h % 3] : "m", base = fem ? 0.9 + ((h >>> 3) % 24)/100 : 0.8 + ((h >>> 3) % 30)/100;
    return (_derived[key] = { v, p:Math.round(base*(tank ? 0.9 : 1)*100)/100 });
  }
  const FEM_CALL = { fire:"fire", ice:"ice", support:"heal", dark:"curse", zap:"hex" };
  function voice(h, ev, sk){
    if(!manifest || !ctxOk() || !h || !h.classKey || (typeof audioEnabled!=="undefined" && !audioEnabled)) return;
    const R = VOICE_RULES[ev]; if(!R) return;
    const now = performance.now(), key = h.classKey+":"+ev;
    if(R.gap && voiceLast[key] && now - voiceLast[key] < R.gap) return;
    if(R.chance < 1 && rnd() > R.chance) return;
    const t0 = audioCtx.currentTime; voiceEnds = voiceEnds.filter(e=>e > t0);
    if(voiceEnds.length >= MAX_VOICES && ev!=="death" && ev!=="victory") return;
    const P = profile(h.classKey), male = P.v==="m", pick = n=>(rnd()*n)|0;
    if(!banks.has(P.v)){ ensureBank(P.v); return; } // primera vez: se baja el banco y esta voz se omite
    let id;
    if(male){
      id = ev==="ult" ? "m_big"+pick(6) : ev==="skill" ? "m_attack"+pick(9) : ev==="hurt" ? "m_hurt"+pick(6) : ev==="death" ? "m_death"+pick(2) : "m_victory"+pick(2);
    } else {
      const f = P.v+"_", fam = sk ? skillFamily(sk) : "";
      if(ev==="ult") id = f + (fam==="fire" ? "hellstorm" : fam==="ice" ? "blizzard" : "attack3");
      else if(ev==="skill") id = f + (FEM_CALL[fam] && rnd() < 0.6 ? FEM_CALL[fam] : "attack"+(1+pick(3)));
      else if(ev==="hurt") id = f + "damaged"+(1+pick(3));
      else id = f + "damaged3"; // sin muerte/victoria propias en el pack: gemido grave y largo
    }
    const rec = manifest.voice[id]; const buf = rec && bufs.get(rec.file); if(!buf) return;
    let rate = P.p * (1 + (rnd()*2-1)*0.04);
    if(!male && (ev==="death")) rate *= 0.82;
    if(!male && ev==="victory") rate *= 1.08;
    voiceLast[key] = now;
    let D = AU.sfxIn;
    if(typeof _sfxPan==="function" && typeof h.x==="number"){ const pan = _sfxPan(h.x); if(pan && Math.abs(pan) > 0.04){ const sp = audioCtx.createStereoPanner(); sp.pan.value = pan; sp.connect(AU.sfxIn); D = sp; } }
    const len = _play(buf, D, h===(typeof player!=="undefined"?player:null) ? 0.7 : 0.42, rate);
    voiceEnds.push(t0 + len);
  }

  /* ---------------- música ---------------- */
  const STYLE_KEY = "horda_music_style";
  let style = (()=>{ try{ return localStorage.getItem(STYLE_KEY)==="synth" ? "synth" : "lofi"; }catch(e){ return "lofi"; } })();
  const L = { out:null, ctx:null, cur:null, want:null, curId:null };
  const WAVES = ["wave-a", "wave-b", "wave-c"];
  function _hash(s){ let h = 7; for(const c of String(s||"_")) h = (h*33 + c.charCodeAt(0)) >>> 0; return h; }
  // Modo de juego → tema (null = sigue la música sintetizada: victoria y derrota son golpes cortos)
  function trackFor(mode, arena, level){
    if(mode==="title" || mode==="intro" || mode==="prelude") return "title";
    if(mode==="menu") return "hub";
    if(mode==="wave") return WAVES[(_hash(arena) + Math.floor(((level||1)-1)/3)) % WAVES.length];
    if(mode==="boss") return "boss";
    return null;
  }
  function _out(){
    if(!L.out || L.ctx!==audioCtx){ L.out = audioCtx.createGain(); L.out.gain.value = LOFI_LEVEL; L.out.connect(musicDuck); L.ctx = audioCtx; L.cur = null; L.curId = null; }
    return L.out;
  }
  function _fadeOutCur(secs){
    const c = L.cur; if(!c) return; L.cur = null; L.curId = null;
    const t = audioCtx.currentTime;
    try{ c.g.gain.cancelScheduledValues(t); c.g.gain.setValueAtTime(c.g.gain.value, t); c.g.gain.linearRampToValueAtTime(0, t+secs); c.s.stop(t+secs+0.05); }catch(e){}
    c.s.onended = ()=>{ try{ c.g.disconnect(); }catch(e){} };
  }
  function _startTrack(id, buf, rec){
    const out = _out(), t = audioCtx.currentTime, fade = 1.8;
    _fadeOutCur(1.4);
    const s = audioCtx.createBufferSource(); s.buffer = buf; s.loop = true;
    // el archivo trae 1 s de relleno a cada lado (extremos del MP3 con artefactos): el bucle cubre solo el interior
    const ls = rec && rec.loopStart || 0; if(rec && rec.loopEnd){ s.loopStart = ls; s.loopEnd = rec.loopEnd; }
    const g = audioCtx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1, t+fade);
    s.connect(g); g.connect(out); s.start(t, ls);
    L.cur = { s, g }; L.curId = id; _evictMusic(id);
  }
  // Un tema decodificado pesa ~30 MB (44-48 kHz estéreo en float): solo quedan el que suena y el anterior (para volver sin esperar).
  const musicOrder = [];
  function _evictMusic(id){
    const i = musicOrder.indexOf(id); if(i >= 0) musicOrder.splice(i, 1); musicOrder.unshift(id);
    while(musicOrder.length > 2){ const old = musicOrder.pop(); if(manifest && manifest.music[old]) bufs.delete(manifest.music[old].file); }
  }
  function onMode(mode, arena, level){
    if(!ctxOk()) return;
    const id = style==="lofi" ? trackFor(mode, arena, level) : null;
    L.want = id; if(mode==="wave" || mode==="boss") prepareParty();
    if(!id){ _fadeOutCur(1.2); return; }
    if(L.curId===id) return;
    loadManifest().then(m=>{
      if(!m || !m.music[id]) return null;
      return load(m.music[id].file);
    }).then(buf=>{ if(buf && L.want===id && L.curId!==id && ctxOk()) _startTrack(id, buf, manifest.music[id]); });
  }
  // ¿Suena un tema de archivo? Entonces el secuenciador sintético no programa notas.
  function holds(){ return !!(L.cur && L.ctx===(typeof audioCtx!=="undefined" ? audioCtx : null) && L.want && L.curId===L.want && style==="lofi"); }
  function getStyle(){ return style; }
  function setStyle(s){
    style = s==="synth" ? "synth" : "lofi";
    try{ localStorage.setItem(STYLE_KEY, style); }catch(e){}
    if(!ctxOk()) return;
    if(style==="synth"){ L.want = null; _fadeOutCur(1.0); }
    else if(typeof M!=="undefined" && M && M.mode && M.mode!=="off") onMode(M.mode, M.arena, M.level);
  }
  // Estado para pruebas y auditoría
  function status(){
    let bytes = 0; for(const b of bufs.values()) bytes += b.length*b.numberOfChannels*4;
    return { style, manifest:!!manifest, music:L.curId, want:L.want, loaded:bufs.size, failed:[...failed], holds:holds(), decodedMB:+(bytes/1048576).toFixed(1), banks:[...banks] };
  }

  return { onMode, holds, layer, abilityAudio, voice, sfx, warm, ensureBank, prepareParty, load, loadManifest, getStyle, setStyle, status, skillFamily, trackFor, profile, VOICES };
})();
