"use strict";
/* ============================================================
   js/data/arena-brief.js
   FICHA DE CADA ARENA — datos neutros (sin voz del Hechicero). Se muestra sola a los novatos (js/ui/run-intro.js, después de la
   página del Libro, nunca junto) y a pedido a todos: Códice › Arenas (js/ui/codex/codex.js) y pausa › Ayuda (js/ui/tactical-panel.js).
   goal = objetivo corto · dangers = peligros (ítems cortos) · aids = ayudas (ítems cortos). Texto de interfaz: sin primera persona ni consejos del narrador.
   Compatibilidad: `kill` y `help` son los mismos ítems unidos con " · " (los leen run-intro, la pausa y el Códice).
   ============================================================ */
const ARENA_BRIEF = {
  ciudad: {
    goal:"Aguantá 10 niveles y derrotá a El Presentador.",
    dangers:["Si caen las estructuras críticas, perdés","La horda las derriba","Subjefes en el nivel 9"],
    aids:["Rescatá civiles (mantené RESCATAR) y llevalos al refugio: dan oro y XP"]},
  fortaleza: {
    goal:"Cruzá la Fábrica Sin Fin y derrotá al Caballero de la Armadura Oxidada.",
    dangers:["Trampas de vapor, rejillas, prensas y cadenas","Puentes móviles","Dragón de la Forja y Caballero"],
    aids:["Las marcas del piso avisan cada trampa","Contraatacá al Caballero cuando brilla azul"]},
  bosque: {
    goal:"Aguantá 10 niveles, vencé al Guardián de la Niebla y recuperá el primer cristal.",
    dangers:["Enemigos que se regeneran","Emboscadas en la maleza","El Guardián se transforma en la Bestia del Bosque"],
    aids:["Quedate junto a una runa que brilla y mantené la acción: las raíces atrapan a la horda"]},
  micelial: {
    goal:"Frená la colonia y derrotá a la Madre Espora.",
    dangers:["Esporas y zonas infectadas que te debilitan","Micelio Primigenio y Madre Espora"],
    aids:["Rompé los núcleos: cada uno limpia la infección de su zona"]},
  hielo: {
    goal:"Derrotá al Mago Gélido en sus dos formas y recuperá el segundo cristal.",
    dangers:["El frío sube si te quedás quieto","Novas de hielo","Forma demoníaca del Mago"],
    aids:["Los braseros encendidos bajan el frío (prendé uno apagado con fuego)","Moverte también ayuda"]},
  acuatica: {
    goal:"Llegá al nivel 10 y vencé al Leviatán.",
    dangers:["Charcos que brillan antes de descargar","Kraken Joven en el nivel 6","El Leviatán ataca desde el borde"],
    aids:["Las corrientes te mueven rápido o arrastran a la horda lejos"]},
  laberinto: {
    goal:"Activá los sellos, derrotá al Minotauro y recuperá el tercer cristal.",
    dangers:["Muros que se cierran","Sismos","Guardián del Laberinto en el nivel 6"],
    aids:["Sellos I, II, III en orden: aturden a la horda y curan","Hacé chocar al Minotauro contra un muro"]},
  abismo: {
    goal:"Sobreviví en las ruinas, vencé al Carcelero del Vacío y enfrentá a El Que Mora Debajo.",
    dangers:["Si caés del borde, quedás colgado hasta que un compañero te suba","El Jinete carga en línea","Cadenas del Carcelero"],
    aids:["Una plataforma que tiembla está por caer: empujá a la horda al vacío","Usá la carga del Jinete en su contra"]},
  minas: {
    goal:"Derrotá a Cerbero y cruzá el Portal Infernal. Recién ahí termina la arena.",
    dangers:["En la oscuridad recibís más daño y te emboscan","El Devoraluz apaga las lámparas","Titán de Piedra en el nivel 8"],
    aids:["Encendé las luces apagadas (mantené la acción)","Cerbero se expone a la luz y se enfurece a oscuras"]},
  infernal: {
    goal:"Llegá al corazón del Infierno.",
    dangers:["Fisuras que sueltan horda sin parar","Fuego en el suelo","Algo te espera en el nivel 9"],
    aids:["Cerrá las fisuras (mantené la acción cerca): queman un poco, pero cortan la horda"]}
};
// Compatibilidad con los lectores existentes: texto único con los ítems separados por " · ".
Object.keys(ARENA_BRIEF).forEach(function(k){
  const B = ARENA_BRIEF[k];
  B.kill = B.dangers.join(" · ");
  B.help = B.aids.join(" · ");
});
