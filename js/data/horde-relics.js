"use strict";
/* ============================================================
   js/data/horde-relics.js
   DATOS de las RELIQUIAS DE LA HORDA (lógica: js/systems/horde-relics.js; diseño y tabla: docs/beta-release/HORDA_MEJORAS.md).
   Mejoras roguelite SOLO de la Horda Infinita: se eligen 1 de 3 tras el jefe de cada tramo (y una primera, temprana, en la ronda 3);
   viven en `h.hrel` ({id:nivel}) y en la capa de runStats de ESA partida; se pierden al terminar. No dan oro, Brasas, XP ni botín.
   Texto: TODAS las descripciones son fijas (sin números armados en el código) para que EN/PT las traduzcan por entrada
   (tools/i18n/tr/t370.py). El nivel actual (2/3) va aparte, en su propio nodo.
   >>> El balance de las reliquias se toca SOLO acá (y se verifica con tools/balance/relics_budget.js).
   ============================================================ */
const HRELIC_CFG = {
  firstRound: 3,            // primera oferta temprana (engancha rápido); después, tras cada ronda de jefe/subjefe (5, 10, 15...)
  offerSize: 3,
  rarity: ["comun", "rara", "epica"],
  // peso de cada rareza según la ronda (determinista; sube la chance de épicas al avanzar)
  weights: [[0, [62, 33, 5]], [10, [50, 36, 14]], [20, [40, 38, 22]]],
  stackCap: {comun: 3, rara: 2, epica: 1},
  powerCost: {comun: 1, rara: 2, epica: 3},   // puntos de poder por nivel
  budget: 20,                                  // tope de puntos de poder por jugador (una build llena de épicas no pasa de acá)
  maxTotalStacks: 12,
  // Tope de la capa de estadísticas (multiplicadores y sumas) que pueden aportar TODAS las reliquias juntas.
  // Referencia: un refuerzo común de la Horda da +20% de daño (BUFF_POOL); la mejor build de reliquias posible vale menos que DOS refuerzos (índice < 1,44; tools/balance/relics_budget.js).
  layerCap: {dmgMult:[1, 1.28], critChance:[0, 0.14], critMult:[0, 0.40], cdMult:[0.84, 1], speedMult:[1, 1.15], atkSpeedMult:[1, 1.20],
             hpMult:[1, 1.25], regenPct:[0, 0.010], eliteDmgMult:[1, 1.15], executeBonus:[0, 0.20], ultChargeMult:[1, 1.15]},
  // Daño extra por segundo que pueden sumar los efectos con disparo (golpes extra, explosiones, espíritus) por héroe,
  // como múltiplo del daño base del héroe: nunca pasa de este techo, sin importar cuántas reliquias tenga.
  extraDmgPerSec: 1.1,
  summonCap: 1.5                               // tope del multiplicador de "invocaciones" (bonos de etiqueta)
};

// Etiquetas: cada una tiene su ícono pixel (js/ui/pixel-icons.js) y dos bonos de sinergia (2 y 4 niveles de la misma etiqueta).
const HRELIC_TAGS = {
  fuego:   {name:"Fuego",         icon:"fuego",    color:"#ff7a2e", t2:"+4% de daño",                    t4:"+6% de daño más",
            L2:{dmgMult:1.04}, L4:{dmgMult:1.06}},
  hielo:   {name:"Hielo",         icon:"copo",     color:"#8fd0ff", t2:"-4% de enfriamientos",           t4:"-4% de enfriamientos más",
            L2:{cdMult:0.96}, L4:{cdMult:0.96}},
  veneno:  {name:"Veneno",        icon:"veneno",   color:"#7ad65a", t2:"+6% de daño a enemigos debilitados", t4:"+6% más a enemigos debilitados",
            L2:{executeBonus:0.06}, L4:{executeBonus:0.06}},
  vida:    {name:"Vida",          icon:"corazon",  color:"#ff6a78", t2:"+4% de vida máxima",             t4:"+0,3% de vida por segundo",
            L2:{hpMult:1.04}, L4:{regenPct:0.003}},
  velocidad:{name:"Velocidad",    icon:"torbellino", color:"#cfe8ff", t2:"+3% de velocidad",            t4:"+4% de velocidad de ataque",
            L2:{speedMult:1.03}, L4:{atkSpeedMult:1.04}},
  area:    {name:"Área",          icon:"explosion", color:"#ffb04a", t2:"+3% de daño",                  t4:"+10% de carga de la definitiva",
            L2:{dmgMult:1.03}, L4:{ultChargeMult:1.10}},
  critico: {name:"Crítico",       icon:"diana",    color:"#ffd34d", t2:"+2% de crítico",                 t4:"+10% de daño crítico",
            L2:{critChance:0.02}, L4:{critMult:0.10}},
  invocaciones:{name:"Invocaciones", icon:"fantasma", color:"#c8a8ff", t2:"+15% de daño de los espíritus", t4:"+20% más de daño de los espíritus",
            S2:1.15, S4:1.20}
};
const HRELIC_TAG_IDS = Object.keys(HRELIC_TAGS);

// `L` = aporte a la capa de estadísticas por nivel (multiplicadores: se elevan al nivel; sumas: se multiplican por el nivel).
// `fx` = efecto con disparo (lo ejecuta js/systems/horde-relics.js; números en HRELIC_FX).
const HRELICS = [
  // ---- Fuego
  {id:"brasa_viva",     tag:"fuego",  r:0, name:"Brasa viva",          desc:"Tus ataques básicos tienen 12% de prender fuego al enemigo.",             fx:"burn"},
  {id:"chispa_ardiente",tag:"fuego",  r:1, name:"Chispa ardiente",     desc:"+10% de daño a los enemigos que están en llamas.",                       fx:"vsBurn"},
  {id:"corazon_magma",  tag:"fuego",  r:2, name:"Corazón de magma",    desc:"Los enemigos en llamas explotan al morir y dañan a los cercanos.",       fx:"magma"},
  // ---- Hielo
  {id:"aliento_gelido", tag:"hielo",  r:0, name:"Aliento gélido",      desc:"Tus ataques básicos tienen 12% de ralentizar al enemigo.",               fx:"chill"},
  {id:"escarcha_quebr", tag:"hielo",  r:1, name:"Escarcha quebradiza", desc:"+10% de daño a los enemigos ralentizados.",                              fx:"vsSlow"},
  {id:"invierno_eterno",tag:"hielo",  r:2, name:"Invierno eterno",     desc:"Cada 9 segundos una onda helada ralentiza a los enemigos cercanos.",     fx:"winter"},
  // ---- Veneno
  {id:"colmillo_toxico",tag:"veneno", r:0, name:"Colmillo tóxico",     desc:"Tus ataques básicos tienen 14% de envenenar al enemigo.",                fx:"poison"},
  {id:"toxina_persist", tag:"veneno", r:1, name:"Toxina persistente",  desc:"+10% de daño a los enemigos envenenados.",                               fx:"vsPoison"},
  {id:"plaga",          tag:"veneno", r:2, name:"Plaga",               desc:"Al morir, un enemigo envenenado contagia a tres enemigos cercanos.",     fx:"plague"},
  // ---- Vida
  {id:"savia_vital",    tag:"vida",   r:0, name:"Savia vital",         desc:"+5% de vida máxima.",                                                    L:{hpMult:1.05}},
  {id:"pulso_vital",    tag:"vida",   r:1, name:"Pulso vital",         desc:"Recuperás 0,4% de tu vida máxima por segundo.",                          L:{regenPct:0.004}},
  {id:"bendicion_horda",tag:"vida",   r:2, name:"Bendición de la Horda", desc:"Al vencer a un élite o jefe, curás un poco a todo el equipo.",         fx:"bless"},
  // ---- Velocidad
  {id:"paso_viento",    tag:"velocidad", r:0, name:"Paso del viento",  desc:"+4% de velocidad de movimiento.",                                        L:{speedMult:1.04}},
  {id:"ritmo_guerra",   tag:"velocidad", r:1, name:"Ritmo de guerra",  desc:"+6% de velocidad de ataque.",                                            L:{atkSpeedMult:1.06}},
  {id:"relampago",      tag:"velocidad", r:2, name:"Relámpago",        desc:"-8% de enfriamientos, y al lanzar la definitiva corrés más rápido un rato.", L:{cdMult:0.92}, fx:"rush"},
  // ---- Área
  {id:"golpe_amplio",   tag:"area",   r:0, name:"Golpe amplio",        desc:"Tus ataques básicos dañan también a dos enemigos cercanos.",             fx:"cleave"},
  {id:"eco_sismico",    tag:"area",   r:1, name:"Eco sísmico",         desc:"Tus habilidades levantan una onda que daña a los enemigos cercanos.",    fx:"echo"},
  {id:"cataclismo",     tag:"area",   r:2, name:"Cataclismo",          desc:"Cada 12 segundos una gran explosión sacude el área a tu alrededor.",     fx:"cataclysm"},
  // ---- Crítico
  {id:"ojo_afilado",    tag:"critico", r:0, name:"Ojo afilado",        desc:"+4% de probabilidad de golpe crítico.",                                  L:{critChance:0.04}},
  {id:"golpe_certero",  tag:"critico", r:1, name:"Golpe certero",      desc:"+20% de daño de los golpes críticos.",                                   L:{critMult:0.20}},
  {id:"sentencia",      tag:"critico", r:2, name:"Sentencia",          desc:"+12% de daño a élites y jefes, y +12% a enemigos casi vencidos.",        L:{eliteDmgMult:1.12, executeBonus:0.12}},
  // ---- Invocaciones (espíritus: golpes instantáneos con efecto visual, sin entidades nuevas)
  {id:"espiritu_cazador",tag:"invocaciones", r:0, name:"Espíritu cazador", desc:"Cada 7 segundos un espíritu golpea a un enemigo cercano.",         fx:"spirit"},
  {id:"pacto_sombras",  tag:"invocaciones", r:1, name:"Pacto de sombras", desc:"Al vencer a un élite, tres espíritus golpean a los enemigos cercanos.", fx:"pact"},
  {id:"legion_espectral",tag:"invocaciones", r:2, name:"Legión espectral", desc:"Cada 15 segundos cinco espíritus golpean a enemigos al azar.",     fx:"legion"}
];
const HRELIC_BY_ID = {}; HRELICS.forEach(r=>{ HRELIC_BY_ID[r.id] = r; });

// Números de los efectos con disparo. dmg = múltiplo del daño base del héroe (baseDmg * runStats.dmgMult), por nivel de la reliquia.
const HRELIC_FX = {
  burn:    {chance:0.12, ms:2600, dps:0.20},
  chill:   {chance:0.12, ms:1600, slow:0.30},
  poison:  {chance:0.14, ms:3200, dps:0.24},
  vsBurn:  {pct:0.10}, vsSlow:{pct:0.10}, vsPoison:{pct:0.10},
  magma:   {radius:100, dmg:0.55, icd:600},
  winter:  {every:9000, radius:190, slow:0.40, ms:2200, dmg:0.30},
  plague:  {n:3, range:150, ms:3200, dps:0.24},
  bless:   {heal:0.06, icd:3500},
  rush:    {speed:0.15, ms:4000},
  cleave:  {n:2, range:80, dmg:0.14},
  echo:    {radius:110, dmg:0.35, icd:1500},
  cataclysm:{every:12000, radius:190, dmg:1.6},
  spirit:  {every:7000, range:420, dmg:0.60},
  pact:    {n:3, range:300, dmg:0.70, icd:2500},
  legion:  {every:15000, n:5, range:420, dmg:0.90}
};
const HRELIC_RARITY_META = [
  {id:"comun", name:"Común", color:"#c9c9c9"},
  {id:"rara",  name:"Rara",  color:"#5ab0ff"},
  {id:"epica", name:"Épica", color:"#c47bff"}
];
