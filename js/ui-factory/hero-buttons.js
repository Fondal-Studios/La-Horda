/* js/ui-factory/hero-buttons.js — UI Factory · botones de combate propios de cada héroe (contrato UF-HERO v1).
   SOLO PRESENTACIÓN: lee CLASSES[clave].color y player.classKey; no modifica estado ni reglas.
   1) Color de la CARA y del borde de Ataque y Habilidades 1-3 a partir del color del héroe (variables CSS --uf-* en #controls).
   2) Íconos de Habilidades/Definitiva: se desplaza el tono hacia el héroe con CSS (hue-rotate), sin tocar los glifos del juego.
   3) Ícono de ATAQUE propio: un disparo (orbe, haz de luz, flecha, bala) o un golpe (tajo, impacto) según cómo ataca el héroe, dibujado con el
      contrato de pixel-icons.js (16×16, contorno de 1 px, 3 tonos + acento) y coloreado con el color del héroe.
   Interruptor: ?uf=0 (el módulo no se instala sin UIFactory). */
(function(){
  "use strict";
  if(!window.UIFactory) return;
  var S = 12;
  function grid(){ var g = []; for(var y=0;y<S;y++){ g.push(new Array(S+1).join(".").split("")); } return g; }
  function put(g,x,y,c){ x = Math.round(x); y = Math.round(y); if(x>=0&&y>=0&&x<S&&y<S) g[y][x] = c; }
  function disc(g,cx,cy,r,c){ for(var y=0;y<S;y++) for(var x=0;x<S;x++) if(Math.hypot(x-cx,y-cy)<=r) g[y][x] = c; }
  function line(g,x0,y0,x1,y1,c){ var n = Math.max(Math.abs(x1-x0),Math.abs(y1-y0)); for(var i=0;i<=n;i++){ var t = n?i/n:0; put(g,x0+(x1-x0)*t,y0+(y1-y0)*t,c); } }
  function out(g){ return g.map(function(r){ return r.join(""); }); }
  /* Motivos de ataque básico (12×12; . vacío · # cuerpo · l luz · d sombra · a acento) */
  var MOTIF = {
    orb: function(){ var g = grid(); disc(g,8,4,3.3,"#");
      for(var y=0;y<S;y++) for(var x=0;x<S;x++) if(g[y][x]==="#"){ var d = Math.hypot(x-8,y-4); if(d>2.4 && x+y>12) g[y][x] = "d"; else if(Math.hypot(x-7,y-3)<1.5) g[y][x] = "l"; }
      line(g,0,3,3,3,"a"); line(g,1,5,4,5,"d"); line(g,0,7,5,7,"a"); line(g,2,9,5,9,"d"); put(g,10,9,"a"); put(g,11,7,"a"); put(g,5,0,"a"); put(g,8,0,"a"); return out(g); },
    beam: function(){ var g = grid(); for(var x=0;x<8;x++){ put(g,x,5,"l"); put(g,x,6,"#"); put(g,x,7,"d"); } for(var x2=1;x2<6;x2++) put(g,x2,4,"a");
      disc(g,9,6,2.4,"#"); put(g,9,3,"a"); put(g,9,9,"a"); put(g,11,6,"a"); put(g,7,4,"l"); put(g,8,5,"l"); put(g,9,5,"l"); return out(g); },
    bullet: function(){ var g = grid();
      for(var x=3;x<=8;x++){ put(g,x,4,"l"); put(g,x,5,"#"); put(g,x,6,"#"); put(g,x,7,"d"); }
      put(g,9,5,"#"); put(g,9,6,"#"); put(g,9,4,"l"); put(g,9,7,"d"); put(g,10,5,"d"); put(g,10,6,"d"); put(g,2,5,"a"); put(g,2,6,"a"); put(g,3,3,"a"); put(g,3,8,"a");
      line(g,0,4,1,4,"a"); line(g,0,7,1,7,"a"); line(g,0,10,3,10,"d"); put(g,5,10,"a"); put(g,10,1,"a"); put(g,11,2,"a"); put(g,11,9,"a"); put(g,9,0,"a"); return out(g); },
    slash: function(){ var g = grid();
      for(var y=0;y<S;y++) for(var x=0;x<S;x++){ var A = Math.hypot(x-6,y-6), B = Math.hypot(x-8.4,y-3.6);
        if(A<=5.9 && B>5.4) g[y][x] = A>4.8 ? "l" : B<6.5 ? "d" : "#"; }
      put(g,10,1,"a"); put(g,11,3,"a"); put(g,8,0,"a"); put(g,0,11,"a"); put(g,11,11,"a"); return out(g); },
    smash: function(){ var g = grid(); disc(g,6,4,2.8,"#"); for(var x=3;x<=9;x++){ put(g,x,2,"l"); put(g,x,7,"d"); }
      for(var y=5;y<=10;y++){ put(g,5,y,"#"); put(g,6,y,"d"); } put(g,1,3,"a"); put(g,0,5,"a"); put(g,11,3,"a"); put(g,11,5,"a"); put(g,3,0,"a"); put(g,8,0,"a"); return out(g); }
  };
  var MOTIF_OF = {};
  ("orb:mago axiom nigromante myla tibor sira nano_gm vhal aurelia velmira iria oriel aelith solciju morveth morwen zahra;" +
   "beam:soporte ynara saelis dariel;arrow:cazadora orsa;bullet:libertador brasa;" +
   "slash:guerrero segador profeta musashi ilkan veyra vesper nahir khepri;smash:tanque eslabon baltra maura renko bront brakk facu_gm farolero").split(";")
    .forEach(function(p){ var a = p.split(":"); a[1].split(" ").forEach(function(h){ MOTIF_OF[h] = a[0]; }); });

  function hex2rgb(h){ var n = parseInt(h.slice(1),16); return [n>>16&255,n>>8&255,n&255]; }
  function rgb2hex(c){ return "#" + c.map(function(v){ return Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,"0"); }).join(""); }
  function mix(a,b,t){ return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t]; }
  function hsl(c){ var r=c[0]/255,g=c[1]/255,b=c[2]/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,h=0,s=0,d=mx-mn;
    if(d){ s = l>.5 ? d/(2-mx-mn) : d/(mx+mn); h = mx===r ? (g-b)/d+(g<b?6:0) : mx===g ? (b-r)/d+2 : (r-g)/d+4; h *= 60; } return [h,s,l]; }
  function fromHsl(h,s,l){ h = ((h%360)+360)%360; var c = (1-Math.abs(2*l-1))*s, x = c*(1-Math.abs((h/60)%2-1)), m = l-c/2, r=0,g=0,b=0;
    if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;} return [(r+m)*255,(g+m)*255,(b+m)*255]; }
  var BLACK = [0,0,0], WHITE = [255,255,255];

  var cache = {};
  function basicIcon(key, color){
    var id = key + color; if(cache[id]) return cache[id];
    if(typeof pxiIconCompose!=="function" || typeof pxiIconColors!=="function" || typeof pxiIconDataURL!=="function") return null;
    var motif = MOTIF_OF[key] || (CLASSES[key] && CLASSES[key].ranged ? "orb" : "slash"), rows12 = null;
    if(motif==="arrow" && typeof PIX_MOTIFS!=="undefined" && PIX_MOTIFS.arrow) rows12 = PIX_MOTIFS.arrow;
    else rows12 = (MOTIF[motif] || MOTIF.orb)();
    // 14×14 con 1 px de margen (como skillPixelGrid) y 'a' como único acento
    var g14 = []; for(var y=0;y<14;y++) g14.push(new Array(15).join(".").split(""));
    rows12.forEach(function(r,y){ for(var x=0;x<12;x++) g14[y+1][x+1] = (r[x]||".").replace(/[rgcw]/,"a"); });
    var rows = pxiIconCompose(g14.map(function(r){ return r.join(""); }), "basic"), c = hex2rgb(color);
    var colors = pxiIconColors("basic", {m:rgb2hex(c), l:rgb2hex(mix(c,WHITE,.55)), d:rgb2hex(mix(c,BLACK,.45))}, rgb2hex(mix(c,WHITE,.82)));
    return cache[id] = pxiIconDataURL(rows, colors);
  }
  function swapBasic(uri){
    var ico = document.querySelector("#btn-basic .ico"); if(!ico || !uri) return;
    var im = ico.querySelector("img.ico-img");
    if(im && im.getAttribute("src")!==uri){ im.setAttribute("src", uri); im.setAttribute("data-uf-hero-icon", "1"); }
  }
  var cur = null, mo = null;
  function apply(key){
    var c = document.getElementById("controls"); if(!c) return;
    if(!key || typeof CLASSES==="undefined" || !CLASSES[key] || !/^#[0-9a-f]{6}$/i.test(CLASSES[key].color||"")){
      ["--uf-b-p1","--uf-b-p2","--uf-b-rim","--uf-b-act","--uf-s1-p1","--uf-s1-p2","--uf-s1-rim","--uf-s1-act","--uf-s2-p1","--uf-s2-p2","--uf-s2-rim","--uf-s2-act","--uf-s3-p1","--uf-s3-p2","--uf-s3-rim","--uf-s3-act","--uf-ico-1","--uf-ico-2","--uf-ico-3"].forEach(function(v){ c.style.removeProperty(v); });
      c.removeAttribute("data-uf-face"); cur = null; return;
    }
    var color = CLASSES[key].color, base = hex2rgb(color), H = hsl(base);
    function set(slot, off){ var col = fromHsl(H[0]+off, Math.min(.85,Math.max(.35,H[1])), Math.min(.62,Math.max(.42,H[2])));
      c.style.setProperty("--uf-"+slot+"-p1", rgb2hex(mix(BLACK,col,.46))); c.style.setProperty("--uf-"+slot+"-p2", rgb2hex(mix(BLACK,col,.18)));
      c.style.setProperty("--uf-"+slot+"-rim", rgb2hex(mix(BLACK,col,.62))); c.style.setProperty("--uf-"+slot+"-act", rgb2hex(mix(col,WHITE,.35))); return col; }
    set("b",0); set("s1",-26); set("s2",0); set("s3",26);
    // desplazamiento de tono de los íconos de habilidad (tono base de cada ranura del juego → tono del héroe ± ranura)
    var slotHue = {1:199, 2:255, 3:154};
    c.style.setProperty("--uf-ico-1", Math.round(H[0]-26-slotHue[1])+"deg"); c.style.setProperty("--uf-ico-2", Math.round(H[0]-slotHue[2])+"deg"); c.style.setProperty("--uf-ico-3", Math.round(H[0]+26-slotHue[3])+"deg");
    c.setAttribute("data-uf-face", "hero");
    cur = {key:key, color:color};
    var ico = document.querySelector("#btn-basic .ico");
    if(ico){ if(mo) mo.disconnect(); mo = new MutationObserver(function(){ if(cur) swapBasic(basicIcon(cur.key, cur.color)); }); mo.observe(ico, {childList:true, subtree:true}); }
    swapBasic(basicIcon(key, color));
  }
  UIFactory.hero = {apply:apply, motifOf:function(k){ return MOTIF_OF[k] || null; }, basicIcon:basicIcon, version:1, contract:"UF-HERO-1"};
})();
