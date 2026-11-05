"use strict";
/* ============================================================
   js/net/fondal-tv.js
   JUGAR EN LA TELE (Fondal TV): «transformá tu celular en una consola».

   La partida se sigue dibujando en el celular y, además, va como VIDEO (con el sonido) a la tele,
   directo por el WiFi de la casa (WebRTC). La tele (la app Fondal TV en Android TV, que abre
   fondalstudios.com/tv/) la muestra y encima dibuja EL HUD DE LA TELE con sus propias piezas,
   livianas: tus barras (vida, escudo, energía), los aliados, el jefe, el nivel, los vencidos y el
   tiempo, la Definitiva y los carteles. Son unos pocos datos, 20 veces por segundo como mucho, que
   se leen de lo que el juego ya puso en pantalla (armarHud). (Antes iba el ESPEJO, la copia de toda
   la pantalla 10 veces por segundo: le agregaba retraso a la partida —medido en Padelazo y en
   FreeBird el 4/11/2026— y se sacó en los tres juegos.) Mientras se juega
   (state "playing") el celular hace de MANDO: tapa el dibujo (que sigue andando atrás, para la tele)
   y deja a la vista solo el joystick, los botones de habilidad, la pausa y el sonido. En los menús,
   la Sala, los refuerzos y la pausa se ve el juego, igual que siempre.

   Todo lo de la conexión vive en la PIEZA COMÚN de Fondal TV (fondalstudios.com/tv/fondal-tv.js,
   repositorio FreeBird), la misma para todos los juegos del estudio, igual que en Padelazo y FreeBird.
   Se baja en segundo plano unos segundos después de arrancar (así, al tocar el ícono, el panel abre
   en el acto: en el iPhone el sonido solo se puede preparar dentro del toque). Acá solo se le dice
   qué canvas, qué sonido y qué es el mando. Enganches con el resto del juego:
     · index.html: el ícono de la tele (#hub-tele-btn) en la esquina del menú principal; este
       archivo lo muestra solo si el navegador puede mandar el canvas como video.
     · js/core/canvas.js: mientras se manda a la tele, el buffer del canvas se dibuja a la medida
       del video (teleMedidaLienzo(): la forma de la pantalla del celular, 720 de alto); el tamaño
       en la pantalla del celular, la cámara y los controles no cambian.
     · js/audio/audio.js: audioPistaParaTele() / audioSonidoAlCelular() (el sonido sale por la tele).
     · js/ui/screens.js: setState() llama a fondalTvOnState(nuevo) en cada cambio de pantalla.

   ?teleSdk=URL cambia de dónde se baja la pieza común (pruebas contra un servidor local).
   Sin datos personales: a la tele solo viaja el nombre que el jugador usa en la sala.
   ============================================================ */
const FondalTV = (() => {
  // Textos propios de este archivo (los del panel y del mando los trae la pieza común, en los tres idiomas).
  const TEXTOS = {
    es: { boton: "Jugar en la tele" },
    en: { boton: "Play on TV" },
    "pt-BR": { boton: "Jogar na TV" }
  };
  // Lo que el celular sigue mostrando mientras hace de mando (lo demás se esconde: va a la tele por el HUD).
  const EN_CELULAR = ["#controls", "#pause-btn", "#mute-btn"];
  // Cuánto se espera al arrancar antes de bajar la pieza común (sin apuro: después de que cargue todo lo demás).
  const PRECARGA_MS = 8000;

  /** El idioma del juego (el lang de index.html), en la forma que usa la pieza común. */
  function idioma(){
    const l = String(document.documentElement.lang || "es").toLowerCase();
    return l.indexOf("pt") === 0 ? "pt-BR" : l.indexOf("en") === 0 ? "en" : "es";
  }
  const tx = clave => (TEXTOS[idioma()] || TEXTOS.es)[clave] || TEXTOS.es[clave];

  /** De dónde se baja la pieza común: del mismo sitio si el juego corre en fondalstudios.com
   * (/la-horda/jugar/); si no (GitHub Pages, la app, un servidor local), de fondalstudios.com. */
  function urlPiezaComun(){
    try{
      const pedida = new URLSearchParams(location.search).get("teleSdk");
      if(pedida) return pedida;
    }catch(e){}
    return /(^|\.)fondalstudios\.com$/.test(location.hostname) ? "/tv/fondal-tv.js" : "https://fondalstudios.com/tv/fondal-tv.js";
  }

  /** ¿Puede este navegador mandar el canvas como video? (sin esto, el ícono no aparece) */
  function disponible(){
    return typeof RTCPeerConnection === "function" && typeof HTMLCanvasElement !== "undefined" &&
      typeof HTMLCanvasElement.prototype.captureStream === "function";
  }

  let tele = null, cargando = null, enPartidoAntes = null;

  function cargar(){
    if(tele) return Promise.resolve(tele);
    if(!cargando){
      const url = urlPiezaComun();
      cargando = import(url)
        .then(m => {
          const lienzo = document.getElementById("game");
          tele = m.iniciarTele({
            lienzo,
            juego: "la-horda",
            idioma: idioma(),
            nombre: () => { try{ return typeof netPlayerName === "function" ? String(netPlayerName() || "") : ""; }catch(e){ return ""; } },
            // 30 cuadros: el celular dibuja a 60 cuando puede, pero a la tele le alcanza y llega con menos retraso
            cuadros: 30,
            // 720 de alto (el ancho sale de la forma de la pantalla del celular): pixel art nítido y rápido;
            // la tele lo agranda a su pantalla
            altura: 720,
            alCambiar: activa => {
              marcarBoton(activa);
              // el buffer del canvas pasa a la medida del video (o vuelve a caja × DPR): js/core/canvas.js
              if(typeof resize === "function") resize(true);
              enPartidoAntes = null;
              sincronizar();
            },
            sonido: {
              // (dentro del toque del ícono: en el iPhone el audio solo arranca así)
              preparar: () => { if(typeof initAudio === "function") initAudio(); },
              pista: () => typeof audioPistaParaTele === "function" ? audioPistaParaTele() : null,
              soltar: () => { if(typeof audioSonidoAlCelular === "function") audioSonidoAlCelular(); }
            },
            // EL HUD DE LA TELE (armarHud) y el mando: en el celular quedan solo los controles
            hud: armarHud,
            hudCadaMs: 50,
            // (la estética del mando: .lh-mando en css/ui-kit.css; los controles, los mismos y en su lugar)
            mando: { enCelular: EN_CELULAR, clase: "lh-mando", sinTexto: true }
          });
          if(tele) sincronizar();
          return tele;
        })
        .catch(err => { console.warn("Fondal TV: no se pudo cargar", url, err); cargando = null; return null; });
    }
    return cargando;
  }

  /** Jugando (state "playing") el celular hace de mando; en los menús, la Sala, los refuerzos y la pausa, false. */
  function sincronizar(){
    if(!tele || !tele.activa){ enPartidoAntes = null; return; }
    const enPartido = typeof state !== "undefined" && state === "playing";
    if(enPartido !== enPartidoAntes){ enPartidoAntes = enPartido; tele.enPartido(enPartido); }
  }

  /** Abre el panel "Jugar en la tele" (elegir la tele, o dejar de transmitir). */
  function abrir(){
    if(tele){ tele.abrirPanel(); return; }
    cargar().then(t => { if(t) t.abrirPanel(); });
  }

  /** Medida del buffer del canvas mientras se manda a la tele ({ancho, alto} en píxeles reales); si no, null. */
  function medida(){
    try{ return tele && tele.activa ? tele.tamano() : null; }catch(e){ return null; }
  }

  // ÍCONO de la tele: pixel art 16×16 con la paleta del juego (contorno, piedra, pantalla azul con brillo), como
  // los íconos de js/ui/pixel-icons.js. Va como SVG de cuadraditos: nítido a cualquier tamaño.
  const ICONO = [
    "................",
    "....k......k....",
    ".....k....k.....",
    "......k..k......",
    ".kkkkkkkkkkkkkk.",
    ".klllllllllllsk.",
    ".klUUUUUUUUUUsk.",
    ".klUuuuuuuiiUsk.",
    ".klUuuuuuuuiUsk.",
    ".klUuuuuuuuuUsk.",
    ".klUuuuuuuuuUsk.",
    ".klUUUUUUUUUUsk.",
    ".kssssssssssssk.",
    ".kkkkkkkkkkkkkk.",
    "...ksk....ksk...",
    "...kkk....kkk..."];
  const COLORES = { k:"#120806", l:"#c8c2cc", s:"#8a8494", U:"#173a52", u:"#2f8fd6", i:"#8fd0ff" };
  function iconoSVG(){
    let r = "";
    ICONO.forEach((fila, y) => { for(let x = 0; x < 16; x++){ const c = COLORES[fila[x]]; if(c) r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"/>`; } });
    return `<svg viewBox="0 0 16 16" width="28" height="28" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${r}</svg>`;
  }

  function marcarBoton(activa){
    const b = document.getElementById("hub-tele-btn");
    if(!b) return;
    b.classList.toggle("tele-on", !!activa);
    b.setAttribute("aria-pressed", String(!!activa));
  }

  function prepararBoton(){
    const b = document.getElementById("hub-tele-btn");
    if(!b) return;
    if(!disponible()){ b.classList.add("hidden"); return; }
    b.innerHTML = iconoSVG();
    b.title = tx("boton");
    b.setAttribute("aria-label", tx("boton"));
    b.setAttribute("aria-pressed", "false");
    b.classList.remove("hidden");
    b.addEventListener("click", ev => { ev.preventDefault(); abrir(); });
  }

  /* ---------- EL HUD DE LA TELE ----------
     Se lee lo que el juego ya puso en pantalla (textos, clases y anchos escritos por js/ui/hud.js,
     js/ui/boss-hud.js, js/ui/hud-text.js): leer eso no le cuesta nada al celular. El formato lo
     define la pieza común (FORMATO DEL HUD en fondalstudios.com/tv/fondal-tv.js). */
  const $id = id => document.getElementById(id);
  const visible = el => !!el && !el.classList.contains("hidden") && el.style.display !== "none";
  const texto = el => el ? String(el.textContent || "").replace(/\s+/g, " ").trim() : "";
  const ancho = el => { const v = el ? parseFloat(el.style.width) : NaN; return Number.isFinite(v) ? Math.round(v * 10) / 1000 : 0; };
  /** El rótulo que el juego escribe justo antes de un número ("Nivel", "Oleada", "Ronda", "Vencidos"). */
  function rotuloAntes(el){
    const n = el && el.previousSibling;
    return n ? String(n.textContent || "").replace(/[·\s]+/g, " ").trim() : "";
  }
  let bannerAntes = "", bannerDesde = 0, cartelAntes = "", cartelN = 0;
  function armarHud(){
    if(typeof state === "undefined" || state !== "playing" || !visible($id("hud"))) return {};
    const hud = {};
    // tus barras: vida, escudo (si hay) y energía, con la clase y el nivel arriba
    const lista = [{ icono: "♥", valor: ancho($id("hp-fill")), color: "#e0463a" }];
    if(visible($id("hp-shield-row"))) lista.push({ icono: "🛡", valor: ancho($id("hp-shield-fill")), color: "#7fd0ff" });
    lista.push({ icono: "✦", valor: ancho($id("en-fill")), color: "#ffcf3f" });
    hud.barras = { titulo: texto($id("plevel")), lista };
    // nivel (u oleada, o ronda), vencidos y tiempo
    const lv = $id("hud-level"), ki = $id("hud-kills"), ti = $id("hud-timer");
    hud.fichas = [
      { valor: texto(lv), rotulo: rotuloAntes(lv) },
      { valor: texto(ki), rotulo: rotuloAntes(ki) },
      { valor: texto(ti), rotulo: rotuloAntes(ti) }
    ].filter(x => x.valor);
    // los aliados (en la Guerra de Cristales, solo los de tu equipo: el juego esconde las filas de los otros)
    const filas = [...document.querySelectorAll("#party .ally-row")].filter(r => r.style.display !== "none");
    hud.equipo = filas.map(r => {
      const b = r.querySelector(".ally-badge");
      return { icono: texto(b), nombre: texto(r.querySelector(".ally-name")), valor: ancho(r.querySelector(".ally-hp-fill:not(.shield-seg)")),
        color: b ? b.style.color : "", caido: r.classList.contains("down") };
    });
    // el jefe
    if(visible($id("boss-hud"))) hud.jefe = { nombre: texto($id("boss-name")), sub: texto($id("boss-epithet")), valor: ancho($id("boss-fill")), estado: texto($id("boss-status")) };
    // la Definitiva (el aro: conic-gradient(... Ndeg ...))
    const aro = $id("ult-ring"), g = aro ? /([\d.]+)deg/.exec(aro.style.background || "") : null;
    if(aro) hud.acciones = [{ tecla: "★", nombre: texto($id("ult-label")) || "Definitiva", listo: g ? Math.round(parseFloat(g[1]) / 3.6) / 100 : 0 }];
    // el cartel grande: «CAÍSTE» si caíste; si no, el de la arena; si no, el central (dura lo que su animación, 2,1 s)
    const banner = $id("center-banner"), bt = banner && banner.classList.contains("show") ? texto(banner) : "";
    if(bt !== bannerAntes){ bannerAntes = bt; bannerDesde = performance.now(); }
    let c = null;
    if(visible($id("downed-overlay"))) c = { titulo: texto(document.querySelector("#downed-overlay .dw-title")), sub: texto($id("downed-sub")), color: "#ff5a4a" };
    else if(visible($id("arena-title-card"))) c = { titulo: texto(document.querySelector("#arena-title-card .atc-title")), sub: texto(document.querySelector("#arena-title-card .atc-sub")), color: "#ffd23f" };
    else if(bt && performance.now() - bannerDesde < 2100) c = { titulo: bt, sub: "", color: "#ffffff" };
    const clave = c ? c.titulo + "|" + c.sub : "";
    if(clave !== cartelAntes){ cartelAntes = clave; cartelN++; }
    if(c && c.titulo){ c.n = cartelN; hud.cartel = c; }
    return hud;
  }

  function arrancar(){
    prepararBoton();
    if(disponible()) setTimeout(cargar, PRECARGA_MS);
    // el HUD sale a la tele mientras se manda (la pieza común no manda lo que no cambió)
    setInterval(() => { if(tele && tele.activa) tele.publicarHud(armarHud()); }, 50);
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", arrancar);
  else arrancar();

  return { disponible, abrir, medida, sincronizar, get activa(){ return !!(tele && tele.activa); }, get tele(){ return tele; } };
})();

/** js/core/canvas.js: medida del buffer mientras se juega en la tele (null si no). */
function teleMedidaLienzo(){ return FondalTV.medida(); }
/** js/ui/screens.js: en cada cambio de pantalla (el celular pasa a mando solo en "playing"). */
function fondalTvOnState(){ FondalTV.sincronizar(); }
