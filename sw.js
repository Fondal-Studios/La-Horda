"use strict";
/* ============================================================
   sw.js — caché sin conexión / de visitas repetidas (OPCIONAL: solo actúa si se publicó con tools/perf/stamp-sw.js).
   - Sin estampar (BUILD = null, el repo tal cual): no intercepta nada y se borra su caché. El juego "sin build" no cambia.
   - Estampado: guarda cada archivo del sitio con su hash (sw-manifest.json: ruta -> hash). Un archivo en caché se
     sirve SOLO si su hash coincide con el del manifiesto vigente; si cambió, se pide a la red. Al activarse una
     versión nueva se borran las entradas que ya no existen o cambiaron (las demás se conservan: las imágenes de
     arte no se vuelven a bajar por cada actualización de código).
   - Nunca toca: pedidos a otros orígenes (relay multijugador, cuentas, fuentes remotas), no-GET, Range, ni nada que no
     esté en el manifiesto. localStorage / partidas guardadas no pasan por acá.
   - ?sw=0 en la URL apaga el uso de la caché en esa carga.
   ============================================================ */
const BUILD = null;          // lo reemplaza tools/perf/stamp-sw.js
const CRITICAL = [];         // idem: index.html y lo que referencia (se baja al instalar, el resto al usarse)
const CACHE = "lahorda-files";
const META = "lahorda-meta";
const MANIFEST_URL = "sw-manifest.json";
const scopePath = new URL(self.registration.scope).pathname;
let manifestP = null;

function rel(url){
  const u = new URL(url);
  if(u.origin !== self.location.origin || !u.pathname.startsWith(scopePath)) return null;
  const p = u.pathname.slice(scopePath.length) || "index.html";
  return p;
}
function key(path){ return new Request(new URL(path, self.registration.scope).href); }
async function loadManifest(){
  if(!manifestP) manifestP = (async()=>{
    try{
      const c = await caches.open(META), r = await c.match(MANIFEST_URL);
      if(r){ const j = await r.json(); if(j && j.build === BUILD) return j.files; }
    }catch(e){}
    return null;
  })();
  return manifestP;
}
async function fetchManifest(){
  const r = await fetch(new Request(new URL(MANIFEST_URL, self.registration.scope).href, {cache:"reload"}));
  if(!r.ok) throw new Error("manifest " + r.status);
  const j = await r.json();
  if(j.build !== BUILD) throw new Error("manifest de otra versión");
  return {j, raw: r};
}
async function store(path, hash, resp){
  // se guarda con el hash vigente en un encabezado propio; los errores de cuota se ignoran
  const h = new Headers(resp.headers); h.set("x-lh-hash", hash);
  ["content-encoding", "content-length", "vary"].forEach(k=>h.delete(k)); // el cuerpo ya viene decodificado
  try{ await (await caches.open(CACHE)).put(key(path), new Response(resp.body, {status:200, statusText:"OK", headers:h})); }catch(e){}
}

self.addEventListener("install", ev=>{
  ev.waitUntil((async()=>{
    if(BUILD === null) return self.skipWaiting();
    const {j} = await fetchManifest();
    const meta = await caches.open(META);
    const files = j.files, cache = await caches.open(CACHE);
    // lo crítico se baja ya (revalidando con la red, no desde la caché HTTP vieja); lo demás, al usarse
    for(const path of CRITICAL){
      const hash = files[path]; if(!hash) continue;
      const have = await cache.match(key(path));
      if(have && have.headers.get("x-lh-hash") === hash) continue;
      const r = await fetch(new Request(new URL(path, self.registration.scope).href, {cache:"no-cache"}));
      if(r.ok) await store(path, hash, r);
    }
    await meta.put(MANIFEST_URL, new Response(JSON.stringify(j), {headers:{"content-type":"application/json"}}));
    manifestP = null;
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", ev=>{
  ev.waitUntil((async()=>{
    if(BUILD === null){ await caches.delete(CACHE); await caches.delete(META); return; }
    manifestP = null;
    const files = await loadManifest(); if(!files) return;
    const cache = await caches.open(CACHE);
    for(const req of await cache.keys()){
      const p = rel(req.url), r = await cache.match(req);
      if(!p || !files[p] || !r || r.headers.get("x-lh-hash") !== files[p]) await cache.delete(req);
    }
    await self.clients.claim(); // la primera visita ya guarda en caché lo que baja después (arte de arenas, etc.)
  })());
});

self.addEventListener("fetch", ev=>{
  const req = ev.request;
  if(BUILD === null || req.method !== "GET" || req.headers.has("range")) return;
  const path = rel(req.url);
  if(!path) return;
  if(/[?&]sw=0(&|$)/.test(new URL(req.url).search) && req.mode === "navigate") return;
  ev.respondWith((async()=>{
    const files = await loadManifest(), hash = files && files[path];
    if(!hash) return fetch(req);
    const cache = await caches.open(CACHE), hit = await cache.match(key(path));
    if(hit && hit.headers.get("x-lh-hash") === hash) return hit;
    let r;
    try{ r = await fetch(req); }
    catch(e){ if(hit) return hit; throw e; } // sin conexión: mejor el archivo viejo que nada
    if(r.ok && r.status === 200 && r.type === "basic") ev.waitUntil(store(path, hash, r.clone()));
    return r;
  })());
});
