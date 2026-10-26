"use strict";
/* Mapa musical: arena -> { calma, intensa, jefe } con ids de assets/audio/music/CATALOGO.json.
   Un id null (o que no esté en el catálogo con verificada:true y archivo) significa "usar la música
   procedural de audio.js". HOY LA BIBLIOTECA ESTÁ VACÍA (ver docs/audio/INVESTIGACION_MUSICA.md:
   el entorno bloqueó todos los hosts de descarga), así que todo es null. Al sumar pistas
   verificadas, se completan acá; el GÉNERO objetivo de cada arena está en docs/audio/MAPA_MUSICAL.md.
   calma e intensa de una arena deben tener BPM compatible (igual o doble). */
const MUSIC_MAP = {
  menu: null, hub: null, tienda: null, victoria: null, derrota: null,
  arenas: {
    ciudad:    { calma: null, intensa: null, jefe: null },
    fortaleza: { calma: null, intensa: null, jefe: null },
    bosque:    { calma: null, intensa: null, jefe: null },
    micelial:  { calma: null, intensa: null, jefe: null },
    hielo:     { calma: null, intensa: null, jefe: null },
    acuatica:  { calma: null, intensa: null, jefe: null },
    laberinto: { calma: null, intensa: null, jefe: null },
    abismo:    { calma: null, intensa: null, jefe: null },
    minas:     { calma: null, intensa: null, jefe: null },
    infernal:  { calma: null, intensa: null, jefe: null },
    divina:    { calma: null, intensa: null, jefe: null },
    coliseo:   { calma: null, intensa: null, jefe: null }
  }
};
if(typeof module !== "undefined" && module.exports) module.exports = MUSIC_MAP;
