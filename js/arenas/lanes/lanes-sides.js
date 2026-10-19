"use strict";
/* ============================================================
   js/arenas/lanes/lanes-sides.js
   AMIGO / ENEMIGO / NEUTRAL en Guerra de Cristales y Coliseo (comparten el motor de carriles).
   Convención ÚNICA (ver docs/modes/CRYSTAL_WARS.md, "Equipos claros"):
     ALIADO  = verde  (--ally)    · marco liso, ícono de ESCUDO
     ENEMIGO = rojo   (--enemy)   · marco grueso con muescas / anillo discontinuo, ícono de ESPADA
     NEUTRAL = ámbar  (--neutral) · selva y objetivos épicos, ícono de ROMBO
     YO      = verde brillante con borde BLANCO (--self / --self-edge)
   La lectura es SIEMPRE desde el punto de vista de quien mira: el equipo del jugador y, si es espectador, el del luchador al que
   sigue la cámara (CAM_SUBJECT). Los colores de EQUIPO (zafiro/ámbar/…) siguen marcando bases, torres y nombres de equipo.
   Los colores salen de variables CSS (ui-kit.css) y se vuelven a leer cuando cambia el <html>/<body> (paleta para daltónicos).
   ============================================================ */
const SIDES_FALLBACK = {
  ally:["#3fe06a", "#0b3a1a", "#a6ffbc"], enemy:["#ff4a4a", "#4a0c0c", "#ffa59a"], neutral:["#ffc233", "#4a3300", "#ffe49a"], self:["#8dffa8", "#0b3a1a", "#ffffff"]
};
const SIDES_VARS = {ally:["--ally", "--ally-dark", "--ally-hi"], enemy:["--enemy", "--enemy-dark", "--enemy-hi"], neutral:["--neutral", "--neutral-dark", "--neutral-hi"], self:["--self", "--ally-dark", "--self-edge"]};
let _sidesPal = null;
function sidesPalette(){
  if(_sidesPal) return _sidesPal;
  const pal = {};
  let cs = null; try{ cs = getComputedStyle(document.documentElement); }catch(e){}
  for(const k of Object.keys(SIDES_VARS)){
    const v = SIDES_VARS[k].map((name, i)=>{ const raw = cs ? cs.getPropertyValue(name).trim() : ""; return raw || SIDES_FALLBACK[k][i]; });
    pal[k] = {fill:v[0], dark:v[1], hi:v[2]};
  }
  return _sidesPal = pal;
}
function sidesRefresh(){ _sidesPal = null; }
(function(){
  if(typeof MutationObserver !== "function" || typeof document === "undefined") return;
  try{
    const mo = new MutationObserver(sidesRefresh);
    mo.observe(document.documentElement, {attributes:true, attributeFilter:["class", "style", "data-cvd", "data-theme", "data-palette"]});
    const hook = ()=>{ if(document.body) mo.observe(document.body, {attributes:true, attributeFilter:["class", "style", "data-cvd", "data-theme", "data-palette"]}); };
    if(document.body) hook(); else document.addEventListener("DOMContentLoaded", hook);
  }catch(e){}
})();
function sidesCol(rel){ return sidesPalette()[rel] || sidesPalette().enemy; }

/* ---------------- a quién se mira ---------------- */
// Equipo desde cuyo punto de vista se lee el mapa: el del jugador o, si espectás, el del luchador que sigue la cámara.
function sidesViewTeam(){
  const s = (typeof CAM_SUBJECT !== "undefined" && CAM_SUBJECT && CAM_SUBJECT.team != null) ? CAM_SUBJECT : (typeof player !== "undefined" ? player : null);
  return s && s.team != null ? s.team : 0;
}
function sidesIsNeutralTeam(team){ return team === 2 && typeof LN !== "undefined" && LN && LN.mode !== "coliseo"; }
// 'self' | 'ally' | 'enemy' | 'neutral' | null (sin equipo)
function sidesOf(ent){
  if(!ent) return null;
  if(typeof player !== "undefined" && ent === player && ent.team != null) return "self";
  const t = ent.team;
  if(t == null) return null;
  if(sidesIsNeutralTeam(t)) return "neutral";
  return t === sidesViewTeam() ? "ally" : "enemy";
}
function sidesOfTeam(t){ if(t == null) return null; if(sidesIsNeutralTeam(t)) return "neutral"; return t === sidesViewTeam() ? "ally" : "enemy"; }
const SIDES_NAME = {self:"TÚ", ally:"ALIADO", enemy:"ENEMIGO", neutral:"NEUTRAL"};

/* ---------------- dibujo (canvas) ---------------- */
// Ícono de 'rel' centrado en (x, y), tamaño s: escudo (aliado/yo), espada (enemigo), rombo (neutral).
function sidesIcon(g, rel, x, y, s){
  const c = sidesCol(rel);
  g.save(); g.translate(x, y); g.lineJoin = "miter"; g.lineWidth = Math.max(1.5, s * 0.2); g.strokeStyle = "rgba(0,0,0,.9)"; g.fillStyle = c.fill;
  const h = s / 2;
  g.beginPath();
  if(rel === "enemy"){            // espada: hoja en diagonal + guarda
    g.moveTo(h, -h); g.lineTo(h * 0.55, -h); g.lineTo(-h * 0.7, h * 0.55); g.lineTo(-h * 0.55, h * 0.7); g.lineTo(h * 0.7, -h * 0.55); g.closePath();
    g.stroke(); g.fill();
    g.beginPath(); g.moveTo(-h, h * 0.2); g.lineTo(-h * 0.2, h); g.lineWidth = Math.max(2, s * 0.26); g.strokeStyle = "rgba(0,0,0,.9)"; g.stroke();
    g.lineWidth = Math.max(1, s * 0.14); g.strokeStyle = c.fill; g.stroke();
  } else if(rel === "neutral"){   // rombo
    g.moveTo(0, -h); g.lineTo(h, 0); g.lineTo(0, h); g.lineTo(-h, 0); g.closePath(); g.stroke(); g.fill();
  } else {                        // escudo
    g.moveTo(-h, -h * 0.8); g.lineTo(h, -h * 0.8); g.lineTo(h, h * 0.1); g.quadraticCurveTo(h * 0.8, h * 0.75, 0, h); g.quadraticCurveTo(-h * 0.8, h * 0.75, -h, h * 0.1); g.closePath(); g.stroke(); g.fill();
    if(rel === "self"){ g.lineWidth = Math.max(1, s * 0.16); g.strokeStyle = c.hi; g.stroke(); }
  }
  g.restore();
}
// Barra de vida (x, y = esquina superior izquierda). f = fracción 0..1. Ecos de forma: aliado = marco liso;
// enemigo = marco grueso oscuro y muescas cada 25 %; neutral = marco punteado; yo = marco blanco.
// o.dim: relleno atenuado (estructura protegida).
function sidesBar(g, rel, x, y, w, h, f, o){
  o = o || {};
  const c = sidesCol(rel), fr = Math.max(0, Math.min(1, f));
  const edge = rel === "enemy" ? 2 : 1.5;
  g.save();
  g.fillStyle = "rgba(0,0,0,.82)"; g.fillRect(x - edge - 1, y - edge - 1, w + (edge + 1) * 2, h + (edge + 1) * 2);
  if(rel === "neutral"){ g.setLineDash([3, 2]); g.strokeStyle = c.fill; g.lineWidth = 1.5; g.strokeRect(x - 1.5, y - 1.5, w + 3, h + 3); g.setLineDash([]); }
  else { g.strokeStyle = rel === "self" ? c.hi : (rel === "enemy" ? c.fill : c.dark); g.lineWidth = edge; g.strokeRect(x - edge / 2, y - edge / 2, w + edge, h + edge); }
  g.fillStyle = "rgba(0,0,0,.55)"; g.fillRect(x, y, w, h);
  if(fr > 0){
    if(o.dim) g.globalAlpha = 0.55;
    g.fillStyle = c.fill; g.fillRect(x, y, w * fr, h);
    g.fillStyle = "rgba(255,255,255,.28)"; g.fillRect(x, y, w * fr, Math.max(1, Math.round(h / 3)));
  }
  g.globalAlpha = 1;
  if(rel === "enemy"){ g.fillStyle = c.dark; const n = w >= 70 ? 7 : 3; for(let i = 1; i <= n; i++) g.fillRect(Math.round(x + w * i / (n + 1) - 0.75), y, 1.5, h); }
  g.restore();
}
// Anillo bajo los pies. aliado = trazo liso; enemigo = discontinuo + relleno rojo tenue; neutral = punteado; yo = doble (blanco + verde).
function sidesRing(g, rel, x, y, rx, ry, o){
  o = o || {};
  const c = sidesCol(rel), lw = o.lw || 3, a = o.alpha == null ? 0.85 : o.alpha;
  g.save();
  g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if(rel === "enemy"){ g.fillStyle = c.fill; g.globalAlpha = 0.14 * a; g.fill(); g.globalAlpha = a; g.setLineDash([lw * 2.4, lw * 1.6]); }
  else if(rel === "neutral"){ g.globalAlpha = a; g.setLineDash([lw * 0.6, lw * 1.8]); }
  else g.globalAlpha = a;
  if(rel === "self"){ g.globalAlpha = 0.95; g.strokeStyle = "#fff"; g.lineWidth = lw + 3; g.stroke(); g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.strokeStyle = c.fill; g.lineWidth = lw; g.stroke(); }
  else { g.strokeStyle = c.fill; g.lineWidth = lw; g.stroke(); }
  g.restore();
}

/* ---------------- nombres sobre los luchadores (Cristales y Coliseo) ---------------- */
// Reemplaza a los rótulos "P# Nombre" de color por casilla: el color del rótulo es el del bando (verde / rojo) y lleva su ícono.
function sidesDrawNameTags(){
  if(typeof heroes === "undefined" || !heroes || state !== "playing") return;
  ctx.save(); ctx.font = pxFont(14); ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  heroes.forEach((h, i)=>{
    if(!h.alive || h === player || h.team == null || !inView(h.x, h.y, 140)) return;
    const slot = (typeof netMatch !== "undefined" && netMatch && netMatch.slots) ? netMatch.slots[i] : null;
    const name = (slot && slot.name) || h.netName; if(!name) return;
    const rel = sidesOf(h), c = sidesCol(rel), label = "P" + (i + 1) + " " + name, tw = ctx.measureText(label).width, ico = 14, w = tw + ico + 14, y = h.y - 74, x0 = h.x - w / 2;
    ctx.fillStyle = "rgba(0,0,0,.72)"; ctx.fillRect(x0, y - 13, w, 18);
    ctx.strokeStyle = c.fill; ctx.lineWidth = rel === "enemy" ? 2 : 1; if(rel === "enemy") ctx.setLineDash([5, 3]); ctx.strokeRect(x0 + 0.5, y - 12.5, w - 1, 17); ctx.setLineDash([]);
    sidesIcon(ctx, rel, x0 + 6 + ico / 2, y - 4, ico - 3);
    ctx.fillStyle = c.hi; ctx.fillText(label, x0 + ico + 9, y);
  });
  ctx.restore();
}
