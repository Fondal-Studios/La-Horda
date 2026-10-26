"use strict";
/* ============================================================
   js/data/arena-brief.js
   FICHA DE CADA ARENA — datos neutros (sin voz del Hechicero). Se muestra sola a los novatos (js/ui/run-intro.js, después de la
   página del Libro, nunca junto) y a pedido a todos: Códice › Arenas (js/ui/codex/codex.js) y pausa › Ayuda (js/ui/tactical-panel.js).
   goal = objetivo corto · kill = qué amenaza · help = qué ayuda. Texto de interfaz: sin primera persona ni consejos del narrador.
   ============================================================ */
const ARENA_BRIEF = {
  ciudad: {
    goal:"Aguantá 10 niveles y derrotá a El Presentador. Si caen las estructuras críticas, perdés.",
    kill:"La horda derriba las estructuras. En el nivel 9 llegan los subjefes; en el 10, El Presentador.",
    help:"Rescatá civiles: acercate y mantené RESCATAR. Llevalos al refugio (escudo verde). Cada uno da oro y XP."},
  fortaleza: {
    goal:"Cruzá la Fábrica Sin Fin y derrotá al Caballero de la Armadura Oxidada.",
    kill:"Trampas de vapor, rejillas al rojo, prensas y cadenas. Puentes que se mueven. El Dragón de la Forja y el Caballero.",
    help:"Las marcas del piso avisan cada trampa. No golpees al Caballero mientras brilla azul: contraataca."},
  bosque: {
    goal:"Aguantá 10 niveles, vencé al Guardián de la Niebla y recuperá el primer cristal.",
    kill:"Enemigos que se regeneran. Emboscadas en la maleza que se sacude. El Guardián, que se transforma en la Bestia del Bosque.",
    help:"Cuando una runa de piedra brilla, quedate al lado y mantené la acción: las raíces atrapan a la horda."},
  micelial: {
    goal:"Frená la colonia y derrotá a la Madre Espora.",
    kill:"Esporas y zonas infectadas que te debilitan. El Micelio Primigenio y la Madre Espora, en el centro.",
    help:"Rompé los núcleos miceliales. Cada uno que cae limpia la infección de su zona."},
  hielo: {
    goal:"Derrotá al Mago Gélido en sus dos formas y recuperá el segundo cristal.",
    kill:"El frío sube si te quedás quieto. Novas de hielo. El Mago Gélido y su forma demoníaca.",
    help:"Un brasero encendido baja el frío. Mantené la acción junto a uno apagado, o prendelo con fuego. Moverte también ayuda."},
  acuatica: {
    goal:"Llegá al nivel 10 y vencé al Leviatán.",
    kill:"Los charcos brillan antes de descargar. El Kraken Joven aparece en el nivel 6. El Leviatán ataca desde el borde.",
    help:"Las corrientes te mueven rápido o arrastran a la horda lejos de vos. Seguilas con intención."},
  laberinto: {
    goal:"Activá los sellos, derrotá al Minotauro y recuperá el tercer cristal.",
    kill:"Los muros se cierran y hay sismos. En el nivel 6 está el Guardián del Laberinto. Después, el Minotauro.",
    help:"Activá los sellos del piso en orden, I, II, III: aturden a la horda y curan. Hacé que el Minotauro choque contra un muro."},
  abismo: {
    goal:"Sobreviví en las ruinas, vencé al Carcelero del Vacío y enfrentá a El Que Mora Debajo.",
    kill:"El borde: si caés, quedás colgado hasta que un compañero te suba. El Jinete carga en línea. El Carcelero usa cadenas.",
    help:"Una plataforma que tiembla está por caer. Empujá a la horda al vacío y usá la carga del Jinete en su contra."},
  minas: {
    goal:"Derrotá a Cerbero y cruzá el Portal Infernal. Recién ahí termina la arena.",
    kill:"La oscuridad: recibís más daño y te emboscan. El Devoraluz apaga las lámparas. El Titán de Piedra aparece en el nivel 8.",
    help:"Si una luz se apaga, acercate y mantené la acción para encenderla. Cerbero se expone a la luz y se enfurece a oscuras."},
  infernal: {
    goal:"Llegá al corazón del Infierno.",
    kill:"Las fisuras sueltan horda sin parar. El fuego del suelo. Algo te espera en el nivel 9.",
    help:"Cerrá las fisuras: mantené la acción junto a una. Quema un poco, pero corta la horda."}
};
