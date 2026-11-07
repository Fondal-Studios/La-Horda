"use strict";
/* ============================================================
   js/net/lan-qr.js
   Generador de códigos QR mínimo y SIN dependencias (modo byte, corrección M, versiones 1-9: hasta 167 bytes, de
   sobra para un enlace http://192.168.x.x:8080/?room=ABC123). Lo usan:
     · el navegador (global `LanQR`) para mostrar el QR de la sala local en la Sala (js/net/net-lan.js);
     · Node (`require("./js/net/lan-qr.js")`) para dibujarlo en la terminal (tools/lan/host.js).
   LanQR.matrix(texto) -> {size, get(x, y)}      LanQR.svg(texto, {scale, margin}) -> string SVG
   LanQR.ascii(texto)  -> string (medios bloques unicode, para la terminal)
   ============================================================ */
(function(root){
  // [bytes de datos totales, bytes de corrección por bloque, bloques del grupo 1, datos por bloque g1, bloques g2, datos por bloque g2]
  const VERSIONS = [null,
    [16, 10, 1, 16, 0, 0], [28, 16, 1, 28, 0, 0], [44, 26, 1, 44, 0, 0], [64, 18, 2, 32, 0, 0], [86, 24, 2, 43, 0, 0],
    [108, 16, 4, 27, 0, 0], [124, 18, 4, 31, 0, 0], [154, 22, 2, 38, 2, 39], [182, 22, 3, 36, 2, 37], [216, 26, 4, 43, 1, 44]];
  const ALIGN = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];
  // Galois GF(256), polinomio 0x11D
  const EXP = new Array(512), LOG = new Array(256);
  (function(){ let x = 1; for(let i = 0; i < 255; i++){ EXP[i] = x; LOG[x] = i; x <<= 1; if(x & 0x100) x ^= 0x11D; } for(let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; })();
  const gmul = (a, b) => (a && b) ? EXP[LOG[a] + LOG[b]] : 0;
  function rsGenerator(n){
    let g = [1];
    for(let i = 0; i < n; i++){
      const next = new Array(g.length + 1).fill(0);
      for(let j = 0; j < g.length; j++){ next[j] ^= g[j]; next[j + 1] ^= gmul(g[j], EXP[i]); }
      g = next;
    }
    return g;
  }
  function rsRemainder(data, n){
    const g = rsGenerator(n), res = new Array(n).fill(0);
    for(const d of data){
      const f = d ^ res.shift(); res.push(0);
      if(f) for(let i = 0; i < n; i++) res[i] ^= gmul(g[i + 1], f);
    }
    return res;
  }
  function utf8(str){
    if(typeof TextEncoder !== "undefined") return Array.from(new TextEncoder().encode(str));
    return Array.from(Buffer.from(str, "utf8"));
  }
  function encodeData(bytes){
    let ver = 0;
    for(let v = 1; v <= 9; v++){ const cap = VERSIONS[v][0]; if(bytes.length + 2 <= cap){ ver = v; break; } } // 4+8 bits de cabecera + terminador: <= cap-1; se afina abajo
    if(!ver) throw new Error("QR: texto demasiado largo (" + bytes.length + " bytes)");
    const total = VERSIONS[ver][0];
    const bits = [];
    const put = (val, len) => { for(let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
    put(4, 4); put(bytes.length, 8); for(const b of bytes) put(b, 8);
    if(bits.length > total * 8) throw new Error("QR: texto demasiado largo");
    put(0, Math.min(4, total * 8 - bits.length));
    while(bits.length % 8) bits.push(0);
    const cw = [];
    for(let i = 0; i < bits.length; i += 8){ let v = 0; for(let j = 0; j < 8; j++) v = (v << 1) | bits[i + j]; cw.push(v); }
    for(let pad = 0xEC; cw.length < total; pad ^= 0xEC ^ 0x11) cw.push(pad);
    return {ver, cw};
  }
  function interleave(ver, cw){
    const [, ecLen, n1, d1, n2, d2] = VERSIONS[ver];
    const blocks = [], ecs = []; let pos = 0;
    for(let i = 0; i < n1 + n2; i++){ const len = i < n1 ? d1 : d2; const b = cw.slice(pos, pos + len); pos += len; blocks.push(b); ecs.push(rsRemainder(b, ecLen)); }
    const out = [], maxD = Math.max(d1, d2 || 0);
    for(let i = 0; i < maxD; i++) for(const b of blocks) if(i < b.length) out.push(b[i]);
    for(let i = 0; i < ecLen; i++) for(const e of ecs) out.push(e[i]);
    return out;
  }
  function bch(value, poly, bitsLen){
    let v = value << bitsLen;
    const top = (n) => { let c = 0; while(n){ c++; n >>>= 1; } return c; };
    const pl = top(poly);
    while(top(v) >= pl) v ^= poly << (top(v) - pl);
    return v;
  }
  function build(text){
    const {ver, cw} = encodeData(utf8(String(text)));
    const data = interleave(ver, cw);
    const size = 17 + 4 * ver;
    const mod = [], fn = [];
    for(let i = 0; i < size; i++){ mod.push(new Array(size).fill(false)); fn.push(new Array(size).fill(false)); }
    const setF = (x, y, v) => { if(x < 0 || y < 0 || x >= size || y >= size) return; mod[y][x] = v; fn[y][x] = true; };
    // buscadores
    for(const [cx, cy] of [[0, 0], [size - 7, 0], [0, size - 7]]){
      for(let dy = -1; dy <= 7; dy++) for(let dx = -1; dx <= 7; dx++){
        const x = cx + dx, y = cy + dy; const inB = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6;
        const dark = inB && (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
        setF(x, y, dark);
      }
    }
    // temporización
    for(let i = 8; i < size - 8; i++){ setF(i, 6, i % 2 === 0); setF(6, i, i % 2 === 0); }
    // alineación
    const al = ALIGN[ver];
    for(const ay of al) for(const ax of al){
      if((ax === 6 && ay === 6) || (ax === 6 && ay === al[al.length - 1]) || (ax === al[al.length - 1] && ay === 6)) continue;
      for(let dy = -2; dy <= 2; dy++) for(let dx = -2; dx <= 2; dx++) setF(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
    setF(8, size - 8, true); // módulo oscuro
    // reservar formato
    for(let i = 0; i < 9; i++){ if(!fn[8][i]) setF(i, 8, false); if(!fn[i][8]) setF(8, i, false); }
    for(let i = 0; i < 8; i++){ setF(size - 1 - i, 8, false); setF(8, size - 1 - i, false); }
    setF(8, size - 8, true);
    // versión (v >= 7)
    if(ver >= 7){
      const vi = (ver << 12) | bch(ver, 0x1F25, 12);
      for(let i = 0; i < 18; i++){ const b = ((vi >> i) & 1) === 1, a = size - 11 + (i % 3), c = Math.floor(i / 3); setF(a, c, b); setF(c, a, b); }
    }
    // datos en zigzag
    const bitsOut = []; for(const b of data) for(let i = 7; i >= 0; i--) bitsOut.push((b >> i) & 1);
    const place = (maskId) => {
      const m = mod.map(r => r.slice());
      let k = 0, up = true;
      for(let x = size - 1; x > 0; x -= 2){
        if(x === 6) x--;
        for(let n = 0; n < size; n++){
          const y = up ? size - 1 - n : n;
          for(let dx = 0; dx < 2; dx++){
            const xx = x - dx; if(fn[y][xx]) continue;
            let bit = k < bitsOut.length ? bitsOut[k] === 1 : false; k++;
            if(maskFn(maskId, xx, y)) bit = !bit;
            m[y][xx] = bit;
          }
        }
        up = !up;
      }
      return m;
    };
    const maskFn = (id, x, y) => [(x + y) % 2 === 0, y % 2 === 0, x % 3 === 0, (x + y) % 3 === 0, (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0,
      (x * y) % 2 + (x * y) % 3 === 0, ((x * y) % 2 + (x * y) % 3) % 2 === 0, ((x + y) % 2 + (x * y) % 3) % 2 === 0][id];
    const drawFormat = (m, maskId) => {
      const f = (((0 << 3) | maskId) << 10 | bch((0 << 3) | maskId, 0x537, 10)) ^ 0x5412; // nivel M = 00
      const bit = i => ((f >> i) & 1) === 1;
      for(let i = 0; i <= 5; i++) m[i][8] = bit(i);
      m[7][8] = bit(6); m[8][8] = bit(7); m[8][7] = bit(8);
      for(let i = 9; i < 15; i++) m[8][14 - i] = bit(i);
      for(let i = 0; i < 8; i++) m[8][size - 1 - i] = bit(i);
      for(let i = 8; i < 15; i++) m[size - 15 + i][8] = bit(i);
      m[size - 8][8] = true;
    };
    const penalty = (m) => {
      let p = 0;
      for(let pass = 0; pass < 2; pass++){
        for(let a = 0; a < size; a++){
          let run = 1;
          for(let b = 1; b < size; b++){
            const cur = pass ? m[b][a] : m[a][b], prev = pass ? m[b - 1][a] : m[a][b - 1];
            if(cur === prev){ run++; if(run === 5) p += 3; else if(run > 5) p++; } else run = 1;
          }
        }
      }
      for(let y = 0; y < size - 1; y++) for(let x = 0; x < size - 1; x++){ const c = m[y][x]; if(c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) p += 3; }
      const pat = [true, false, true, true, true, false, true, false, false, false, false], pat2 = pat.slice().reverse();
      for(let y = 0; y < size; y++) for(let x = 0; x <= size - 11; x++){
        let h1 = true, h2 = true, v1 = true, v2 = true;
        for(let i = 0; i < 11; i++){ if(m[y][x + i] !== pat[i]) h1 = false; if(m[y][x + i] !== pat2[i]) h2 = false; if(m[x + i][y] !== pat[i]) v1 = false; if(m[x + i][y] !== pat2[i]) v2 = false; }
        p += 40 * ((h1 ? 1 : 0) + (h2 ? 1 : 0) + (v1 ? 1 : 0) + (v2 ? 1 : 0));
      }
      let dark = 0; for(const r of m) for(const c of r) if(c) dark++;
      p += Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
      return p;
    };
    let best = null, bestP = Infinity;
    for(let id = 0; id < 8; id++){ const m = place(id); drawFormat(m, id); const p = penalty(m); if(p < bestP){ bestP = p; best = m; } }
    return {size, ver, get: (x, y) => !!(best[y] && best[y][x])};
  }
  function svg(text, opt){
    opt = opt || {}; const q = build(text), margin = opt.margin == null ? 4 : opt.margin, sc = opt.scale || 4;
    const n = q.size + margin * 2; let path = "";
    for(let y = 0; y < q.size; y++){ let x = 0; while(x < q.size){ if(!q.get(x, y)){ x++; continue; } let w = 1; while(x + w < q.size && q.get(x + w, y)) w++; path += `M${x + margin} ${y + margin}h${w}v1h-${w}z`; x += w; } }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" width="${n * sc}" height="${n * sc}" shape-rendering="crispEdges" role="img" aria-label="QR"><rect width="${n}" height="${n}" fill="#fff"/><path d="${path}" fill="#000"/></svg>`;
  }
  // Terminal: dos filas por línea con medios bloques. Fondo claro (módulo claro = bloque lleno) para que lo lean las cámaras en terminal oscura.
  function ascii(text, opt){
    opt = opt || {}; const q = build(text), margin = opt.margin == null ? 2 : opt.margin;
    const dark = (x, y) => x >= margin && y >= margin && x < q.size + margin && y < q.size + margin && q.get(x - margin, y - margin);
    const n = q.size + margin * 2, lines = [];
    for(let y = 0; y < n; y += 2){
      let l = "";
      for(let x = 0; x < n; x++){ const t = dark(x, y), b = dark(x, y + 1); l += (!t && !b) ? "█" : (t && b) ? " " : (!t && b) ? "▀" : "▄"; }
      lines.push(l);
    }
    return lines.join("\n");
  }
  const api = {matrix: build, svg, ascii};
  if(typeof module !== "undefined" && module.exports) module.exports = api; else root.LanQR = api;
})(typeof window !== "undefined" ? window : globalThis);
