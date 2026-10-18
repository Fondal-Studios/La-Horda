'use strict';
/* ============================================================
   js/champions/vfx-b/pixfx.js — MOTOR DE EFECTOS PIXEL PROPIOS (segunda mitad del roster)
   Sprites y animaciones de efecto generados por código (canvas fuera de pantalla, sin recursos de terceros):
     · decales de suelo / sectores / rayos con anticipación → impacto → disipación (kvbDefDecal / kvbDefBeam),
     · motivos pequeños de cada campeón (aguja, abeja, pluma, máscara, gota de vino…) que salen en ráfagas (kvbDefMotif),
     · un pool propio de entradas dibujadas en dos capas (suelo: bajo las entidades; arriba: sobre ellas).
   Todo es COSMÉTICO: no toca daño, recargas, alcance, duración ni hitboxes, y NO usa Math.random (generador propio),
   así que la partida simulada es idéntica con o sin estos efectos. kvbFx(id, x, y, r, ang, a, b) se graba en el
   anfitrión y se repite en los invitados (NET_EVENT_FNS). Respeta "Reducir efectos" (JUICE.reduceFx), la carga
   adaptable (vfxLoad) y "Reducir movimiento". Los sprites se arman al primer uso (lazy) y quedan en caché.
   Contrato visual: alfa 0/255 (umbral), contorno oscuro de 1 px, 2–3 tonos por color, translucidez por tramado
   ordenado (Bayer 4x4) en vez de alfa suave: lenguaje pixel art de docs/ART_BIBLE.md; el glow/destello va aparte.
   ============================================================ */
// ?kvb=0 en la URL apaga los efectos propios (comparaciones antes/después y pruebas diferenciales)
const KVB = {off: (function(){ try{ return /[?&]kvb=0\b/.test(location.search); }catch(e){ return false; } })(), pool:[], MAX:128, seed:0x2545F491, hooks:[], overlays:[], stats:{added:0, dropped:0}};
// RNG cosmético propio: jamás se usa Math.random (no debe consumir el azar de la simulación).
function kvbR(){ let x = KVB.seed; x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; KVB.seed = x; return x / 4294967296; }
function kvbRR(a, b){ return a + (b - a) * kvbR(); }
function kvbBudget(n){
  let m = 1;
  if(typeof JUICE !== 'undefined' && JUICE.reduceFx) m *= 0.4;
  if(typeof vfxLoad !== 'undefined' && vfxLoad < 0.6) m *= 0.6;
  return Math.max(1, Math.round(n * m));
}
const kvbCalm = () => typeof JUICE !== 'undefined' && !!JUICE.reduceMotion;

/* ---------------- color y píxeles ---------------- */
const KVB_RGB = {};
function kvbRGB(hex){ let v = KVB_RGB[hex]; if(v) return v; const h = hex.replace('#', ''); v = KVB_RGB[hex] = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; return v; }
function kvbCanvas(w, h){ const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; }
// alfa 0/255: los bordes suavizados del canvas pasan a píxel pleno o nada (pixel art nítido)
function kvbCrisp(c, th){
  const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height), a = d.data, t = th || 112;
  for(let i = 3; i < a.length; i += 4) a[i] = a[i] >= t ? 255 : 0;
  g.putImageData(d, 0, 0); return c;
}
function kvbOutline(c, col){
  const w = c.width, h = c.height, g = c.getContext('2d'), d = g.getImageData(0, 0, w, h), a = d.data, o = new Uint8ClampedArray(a), rgb = kvbRGB(col);
  for(let y = 0; y < h; y++) for(let x = 0; x < w; x++){
    const i = (y * w + x) * 4; if(a[i + 3]) continue;
    if((x > 0 && a[i - 1]) || (x < w - 1 && a[i + 7]) || (y > 0 && a[i - w * 4 + 3]) || (y < h - 1 && a[i + w * 4 + 3])){ o[i] = rgb[0]; o[i + 1] = rgb[1]; o[i + 2] = rgb[2]; o[i + 3] = 255; }
  }
  d.data.set(o); g.putImageData(d, 0, 0); return c;
}
/* ---------------- tinte por arena ----------------
   Los decales se hornean con la paleta de la arena en curso (AID_INLAY_PALETTES, js/rendering/arena-props.js): el mismo rosa de la
   Enóloga o de la Sangre ya no es idéntico en el bosque, el hielo o el infierno. El borde exterior (el radio real) conserva el contorno
   oscuro del campeón para leerse sobre cualquier suelo; se tiñen relleno, marcas y filo. Sin paleta de arena (menús, arena nueva) no hay tinte. */
function kvbArenaKey(){ try{ return (typeof currentArena === 'string' && typeof AID_INLAY_PALETTES !== 'undefined' && AID_INLAY_PALETTES[currentArena]) ? currentArena : ''; }catch(e){ return ''; } }
function kvbMix(a, b, t){ const A = kvbRGB(a), B = kvbRGB(b), h = v => Math.round(v).toString(16).padStart(2, '0'); return '#' + h(A[0] + (B[0] - A[0]) * t) + h(A[1] + (B[1] - A[1]) * t) + h(A[2] + (B[2] - A[2]) * t); }
const KVB_TINT = {key: '', pal: null};
// tinte activo (solo durante el horneado de un sprite): kvbTintCol(hex, fuerza) / kvbTintPal(paleta de 5 tonos)
function kvbTintCol(hex, t){ const A = KVB_TINT.pal; return !A || !hex ? hex : kvbMix(hex, A[2], t === undefined ? .55 : t); }
function kvbTintPal(pal){
  const A = KVB_TINT.pal; if(!A) return pal;
  const lit = (c, k) => kvbMix(c, '#ffffff', k);
  return [kvbMix(pal[0], A[0], .35), kvbMix(pal[1], A[1], .55), kvbMix(pal[2], A[2], .5), kvbMix(pal[3], lit(A[2], .25), .55), kvbMix(pal[4], lit(A[2], .55), .5)];
}
// Techo de relleno trameado (fracción de píxeles del disco): 20–25 % deja ver al enemigo señalado y el anillo exterior manda
const KVB_FILL_CAP = .24;
const KVB_BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
// translucidez "de pixel art": conserva solo una fracción (level 0..1) de los píxeles, con tramado ordenado
function kvbDither(c, level){
  const w = c.width, h = c.height, g = c.getContext('2d'), d = g.getImageData(0, 0, w, h), a = d.data, lim = Math.max(0, Math.min(1, level)) * 16;
  for(let y = 0; y < h; y++) for(let x = 0; x < w; x++){ const i = (y * w + x) * 4 + 3; if(a[i] && KVB_BAYER[(y & 3) * 4 + (x & 3)] >= lim) a[i] = 0; }
  g.putImageData(d, 0, 0); return c;
}
// capa temporal: dibuja fn en un canvas nuevo, lo vuelve nítido, lo tramea (level) y lo compone sobre g
function kvbLayer(g, S, level, fn){
  const [c, lg] = kvbCanvas(S, S); fn(lg); kvbCrisp(c); if(level < 1) kvbDither(c, level); g.drawImage(c, 0, 0); return c;
}
const kvbEase = q => 1 - (1 - q) * (1 - q);
const kvbSmooth = q => q * q * (3 - 2 * q);
// Fases de una animación de golpe: anticipación (0–.22), impacto (.22–.42), disipación (.42–1)
function kvbPhase(q){ return {ant: Math.min(1, q / .22), hit: q >= .22 && q < .42, post: q < .42 ? 0 : (q - .42) / .58, q}; }

/* ---------------- primitivas de dibujo (canvas 2D, se nitidiza después) ---------------- */
function kvbCircle(g, cx, cy, r, col, th){ g.beginPath(); g.arc(cx, cy, Math.max(.5, r), 0, 6.2832); g.strokeStyle = col; g.lineWidth = th || 1; g.stroke(); }
function kvbDisc(g, cx, cy, r, col){ g.beginPath(); g.arc(cx, cy, Math.max(.5, r), 0, 6.2832); g.fillStyle = col; g.fill(); }
function kvbLine(g, x0, y0, x1, y1, col, th){ g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.strokeStyle = col; g.lineWidth = th || 1; g.lineCap = 'butt'; g.stroke(); }
function kvbPoly(g, pts, col, strokeCol, th){ g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for(let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); if(col){ g.fillStyle = col; g.fill(); } if(strokeCol){ g.strokeStyle = strokeCol; g.lineWidth = th || 1; g.stroke(); } }
function kvbArcLine(g, cx, cy, r, a0, a1, col, th){ g.beginPath(); g.arc(cx, cy, Math.max(.5, r), a0, a1); g.strokeStyle = col; g.lineWidth = th || 1; g.lineCap = 'butt'; g.stroke(); }
// borde con sombra oscura debajo y filo claro encima (se lee sobre cualquier suelo)
function kvbRim(g, cx, cy, r, pal, th, dash){
  if(dash){ g.setLineDash(dash); }
  kvbCircle(g, cx, cy, r, pal[0], th + 2); kvbCircle(g, cx, cy, r, pal[2], th);
  if(th >= 2) kvbCircle(g, cx, cy, r - th * .5, pal[4], 1);
  if(dash) g.setLineDash([]);
}
function kvbPx(g, x, y, col, s){ g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), s || 1, s || 1); }
// Mapa de píxeles a mano: filas de texto + tabla letra→color ('.' = vacío)
function kvbBmp(rows, map){
  return function(g, pad){ for(let y = 0; y < rows.length; y++) for(let x = 0; x < rows[y].length; x++){ const k = rows[y][x]; if(k !== '.' && map[k]){ g.fillStyle = map[k]; g.fillRect(x + pad, y + pad, 1, 1); } } };
}

/* ---------------- registro y caché de sprites ---------------- */
const KVB_DEC = {}, KVB_MOT = {}, KVB_BEAM = {}, KVB_CACHE = {};
// Decal cuadrado centrado: el borde de la imagen = radio real. paint(g, q, S, f, N) con q = 0..1 a lo largo de la tira.
function kvbDefDecal(name, N, paint){ KVB_DEC[name] = {N, paint}; }
// 1 píxel de arte ≈ 4,4 unidades de mundo (≈2,5 px de pantalla a 844x390): se lee a distancia y el tramado no es ruido
function kvbS(R){ return Math.max(24, Math.min(128, Math.round(2 * R / 4.4 / 4) * 4)); }
function kvbDecalFrames(name, S){
  const ak = kvbArenaKey(), k = name + '@' + S + '@' + ak; let fr = KVB_CACHE[k]; if(fr) return fr;
  const d = KVB_DEC[name]; if(!d) return null; fr = [];
  KVB_TINT.key = ak; KVB_TINT.pal = ak ? AID_INLAY_PALETTES[ak] : null;
  try{ for(let f = 0; f < d.N; f++){ const [c, g] = kvbCanvas(S, S); d.paint(g, f / (d.N - 1), S, f, d.N); fr.push(kvbCrisp(c)); } }
  finally{ KVB_TINT.key = ''; KVB_TINT.pal = null; }
  return KVB_CACHE[k] = fr;
}
// Motivo pequeño (sprite suelto con contorno); frames = lista de funciones paint(g, pad) o una sola
function kvbDefMotif(name, w, h, paints, ol){ KVB_MOT[name] = {w, h, paints: Array.isArray(paints) ? paints : [paints], ol: ol || '#10131f'}; }
function kvbMotif(name){
  let fr = KVB_CACHE['m:' + name]; if(fr) return fr;
  const m = KVB_MOT[name]; if(!m) return null;
  fr = m.paints.map(p => { const [c, g] = kvbCanvas(m.w + 2, m.h + 2); p(g, 1); kvbCrisp(c); return kvbOutline(c, m.ol); });
  return KVB_CACHE['m:' + name] = fr;
}
// Cuerpo de rayo: baldosa horizontal repetible (tileW x H por cuadro)
function kvbDefBeam(name, N, tileW, H, paint, head){ KVB_BEAM[name] = {N, tileW, H, paint, head}; }
function kvbBeamFrames(name){
  let fr = KVB_CACHE['b:' + name]; if(fr) return fr;
  const b = KVB_BEAM[name]; if(!b) return null; fr = [];
  for(let f = 0; f < b.N; f++){ const [c, g] = kvbCanvas(b.tileW, b.H); b.paint(g, f / (b.N - 1), b.tileW, b.H, f); fr.push(kvbCrisp(c)); }
  return KVB_CACHE['b:' + name] = fr;
}

/* ---------------- pool de entradas ---------------- */
function kvbAdd(e){
  if(KVB.off) return null;
  // adaptativo: si el frame va lento (vfxLoad < .6, móviles) o con «Reducir efectos», el tope baja a la mitad y se descartan antes los efectos secundarios
  const cap = (typeof JUICE !== 'undefined' && JUICE.reduceFx) || (typeof vfxLoad !== 'undefined' && vfxLoad < .6) ? KVB.MAX >> 1 : KVB.MAX;
  if(KVB.pool.length >= cap){ if(!e.prio){ KVB.stats.dropped++; return null; } KVB.pool.shift(); }
  e.t = e.t || 0; e.alpha = e.alpha === undefined ? 1 : e.alpha; e.fadeAt = e.fadeAt === undefined ? .62 : e.fadeAt;
  e.layer = e.layer || 't'; KVB.pool.push(e); KVB.stats.added++; return e;
}
// Decal animado de un solo pase (o en bucle). R = radio en unidades de mundo (el borde del sprite ES el radio).
function kvbDecal(name, x, y, R, dur, o){
  if(!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(R) || !(dur > 0)) return null; R = Math.max(4, Math.min(520, R));
  o = o || {}; const S = kvbS(R), fr = kvbDecalFrames(name, S); if(!fr) return null;
  return kvbAdd({frames: fr, x, y, w: 2 * R, h: 2 * R, rot: o.rot || 0, dur, layer: o.layer || 'g', ax: o.ax === undefined ? .5 : o.ax, ay: o.ay === undefined ? .5 : o.ay,
    follow: o.follow || null, ofx: o.ofx || 0, ofy: o.ofy || 0, loop: !!o.loop, fps: o.fps || 0, alpha: o.alpha, fadeAt: o.fadeAt, add: !!o.add, prio: o.prio, flip: !!o.flip, vx: o.vx || 0, vy: o.vy || 0});
}
// Sprite de motivo (una pluma, una abeja…) en un punto, con velocidad / gravedad / giro
function kvbPart(mot, x, y, o){
  if(!Number.isFinite(x) || !Number.isFinite(y)) return null;
  o = o || {}; const fr = kvbMotif(mot); if(!fr) return null; const sc = (o.scale || 1.6) * 1.35; // los motivos se agrandan un 35 % para leerse a 844x390
  return kvbAdd({frames: fr, x, y, w: fr[0].width * sc, h: fr[0].height * sc, rot: o.rot || 0, spin: o.spin || 0, vx: o.vx || 0, vy: o.vy || 0, grav: o.grav || 0, drag: o.drag || 0,
    dur: o.dur || 600, layer: o.layer || 't', ax: .5, ay: o.ay === undefined ? .5 : o.ay, follow: o.follow || null, ofx: o.ofx || 0, ofy: o.ofy || 0, loop: o.fps ? true : false, fps: o.fps || 0,
    alpha: o.alpha, fadeAt: o.fadeAt, add: !!o.add, shrink: !!o.shrink, prio: o.prio, flip: !!o.flip});
}
// Ráfaga de motivos: ang+spread = abanico (spread omitido = en todas direcciones); v0..v1 velocidad; up = empuje hacia arriba
function kvbEmit(mot, n, x, y, o){
  o = o || {}; n = kvbBudget(Math.min(60, n));
  if(!Number.isFinite(x) || !Number.isFinite(y)) return;
  for(let i = 0; i < n; i++){
    const a = o.spread === undefined ? kvbRR(0, 6.2832) : (o.ang || 0) + kvbRR(-o.spread / 2, o.spread / 2), v = kvbRR(o.v0 === undefined ? 30 : o.v0, o.v1 === undefined ? 90 : o.v1), rr = o.ring ? o.ring * kvbRR(.6, 1) : 0;
    kvbPart(mot, x + Math.cos(a) * rr + (o.jx ? kvbRR(-o.jx, o.jx) : 0), y + Math.sin(a) * rr * (o.flat === undefined ? 1 : o.flat) + (o.jy ? kvbRR(-o.jy, o.jy) : 0), {
      vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.up || 0), grav: o.grav || 0, drag: o.drag || 0, spin: o.spin ? kvbRR(-o.spin, o.spin) : 0, rot: o.faceVel ? a : (o.rot || 0),
      dur: kvbRR(o.l0 || 380, o.l1 || 620), scale: o.scale || 1.5, layer: o.layer, fps: o.fps, add: o.add, shrink: o.shrink, ay: o.ay, fadeAt: o.fadeAt});
  }
}
// Rayo tileado de A a B con ancho w (unidades de mundo). Las puntas (cabeza y cola) son decales opcionales.
function kvbBeam(name, ax, ay, bx, by, w, dur, o){
  if(!Number.isFinite(ax) || !Number.isFinite(ay) || !Number.isFinite(bx) || !Number.isFinite(by) || !Number.isFinite(w) || !(dur > 0)) return null;
  o = o || {}; const fr = kvbBeamFrames(name); if(!fr) return null;
  const L = Math.min(900, Math.hypot(bx - ax, by - ay)); if(L < 4) return null; w = Math.max(2, Math.min(400, w));
  return kvbAdd({beam: true, frames: fr, spec: KVB_BEAM[name], x: ax, y: ay, rot: Math.atan2(by - ay, bx - ax), len: L, w, dur, layer: o.layer || 't', alpha: o.alpha, fadeAt: o.fadeAt, prio: o.prio, add: !!o.add});
}
function kvbReset(){ KVB.pool.length = 0; }

/* ---------------- actualización y dibujo ---------------- */
function kvbUpdate(dt){
  const P = KVB.pool; let w = 0;
  for(let i = 0; i < P.length; i++){
    const e = P[i]; e.t += dt;
    if(e.t >= e.dur){ continue; }
    const s = dt / 1000;
    if(e.follow){ if(e.follow.alive === false){ continue; } e.x = e.follow.x + e.ofx; e.y = e.follow.y + e.ofy; }
    else if(e.vx || e.vy || e.grav){ e.x += e.vx * s; e.y += e.vy * s; if(e.grav) e.vy += e.grav * s; if(e.drag){ const k = Math.max(0, 1 - e.drag * s); e.vx *= k; e.vy *= k; } }
    if(e.spin) e.rot += e.spin * s;
    P[w++] = e;
  }
  P.length = w;
}
function kvbDrawLayer(layer){
  const P = KVB.pool; if(!P.length) return;
  ctx.save(); ctx.imageSmoothingEnabled = false;
  for(let i = 0; i < P.length; i++){
    const e = P[i]; if(e.layer !== layer) continue;
    const q = e.t / e.dur, ex = e.beam ? e.len : (e.w || 0) * 1.5;
    if(!inView(e.x, e.y, Math.max(ex, 60))) continue;
    const a = (q < e.fadeAt ? 1 : Math.max(0, (1 - q) / (1 - e.fadeAt))) * e.alpha;
    if(a <= 0.02) continue;
    ctx.globalAlpha = a; ctx.globalCompositeOperation = e.add ? 'lighter' : 'source-over';
    if(e.beam){
      const sp = e.spec, fi = Math.min(sp.N - 1, Math.floor(q * sp.N)), img = e.frames[fi], sc = e.w / sp.H, tw = sp.tileW * sc;
      ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.rot);
      for(let x = 0; x < e.len; x += tw){ const rem = Math.min(tw, e.len - x); ctx.drawImage(img, 0, 0, Math.max(1, Math.round(img.width * rem / tw)), img.height, x, -e.w / 2, rem, e.w); }
      ctx.restore(); continue;
    }
    const n = e.frames.length, idx = e.loop ? (Math.floor(e.t / 1000 * (e.fps || n / (e.dur / 1000))) % n) : Math.min(n - 1, Math.floor(q * n));
    const img = e.frames[idx], sh = e.shrink ? (1 - q * .55) : 1, w = e.w * sh, h = e.h * sh;
    if(e.rot || e.flip){ ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.rot); if(e.flip) ctx.scale(-1, 1); ctx.drawImage(img, -w * e.ax, -h * e.ay, w, h); ctx.restore(); }
    else ctx.drawImage(img, e.x - w * e.ax, e.y - h * e.ay, w, h);
  }
  ctx.restore();
}
// Dibujo inmediato de un decal en bucle (auras y zonas persistentes ligadas a un estado real). t en ms.
function kvbLoopDecal(name, x, y, R, t, period, o){
  o = o || {}; const fr = kvbDecalFrames(name, kvbS(R)); if(!fr) return;
  const idx = kvbCalm() ? 0 : Math.floor(((t % period) / period) * fr.length) % fr.length, img = fr[idx];
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
  if(o.rot){ ctx.translate(x, y); ctx.rotate(o.rot); ctx.drawImage(img, -R, -R, 2 * R, 2 * R); } else ctx.drawImage(img, x - R, y - R, 2 * R, 2 * R);
  ctx.restore();
}

/* ---------------- punto de entrada (se repite en los invitados) y enganches al motor ---------------- */
const KVB_FX = {};
function kvbFx(id, x, y, r, ang, a, b){
  if(KVB.off) return; const f = KVB_FX[id];
  if(!f || !Number.isFinite(x) || !Number.isFinite(y)) return;
  if(typeof inView === 'function' && !inView(x, y, (r || 80) + 160)) return;
  try{ f(x, y, r || 60, Number.isFinite(ang) ? ang : 0, a, b); }catch(e){ if(!KVB.err){ KVB.err = String(e && e.message || e); } }
}
(function(){
  const oUpd = vfxUpdate; vfxUpdate = function(dt){ oUpd.apply(this, arguments); kvbUpdate(dt); };
  const oRes = vfxResetRun; vfxResetRun = function(){ oRes.apply(this, arguments); kvbReset(); };
  const oGround = vfxDrawGround; vfxDrawGround = function(){ oGround.apply(this, arguments); kvbDrawLayer('g'); };
  const oSig = drawChampionSignatures; drawChampionSignatures = function(){ kvbDrawLayer('t'); oSig.apply(this, arguments); };
  if(typeof NET_EVENT_FNS !== 'undefined' && !NET_EVENT_FNS.includes('kvbFx')) NET_EVENT_FNS.push('kvbFx');
})();
