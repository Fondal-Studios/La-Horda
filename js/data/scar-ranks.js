/* RANGOS DE CICATRIZ — ascensiones de la Horda Infinita (datos y balance).
   Rango 0 = la Horda de siempre. Cada rango opcional suma mutadores fijos (los mismos de ENDLESS_MUTATORS, ya balanceados)
   y un bono de puntaje. Se desbloquea el siguiente rango alcanzando la ronda "clear" en el rango actual.
   Recompensa: solo identidad (título y, en el V, marco). No dan oro, Brasas ni poder: más riesgo = más puntaje y prestigio. */
const SCAR_CFG = {
  maxRank: 5,
  clearRound: [10, 15, 20, 25, 30, 35],   // ronda a alcanzar JUGANDO en el rango i para "completarlo" (i = 0..5)
  scoreBonusPerRank: 0.15                  // puntaje ×(1 + 0.15·rango), además de lo que paguen los mutadores
};
const SCAR_RANKS = [
  {rank:0, name:"Sin Cicatriz",  short:"0",   mutators:[],                                                            desc:"La Horda de siempre."},
  {rank:1, name:"Cicatriz I",    short:"I",   mutators:["elites_x2"],                                                 desc:"El doble de élites con rol.",                         title:"marcado_1"},
  {rank:2, name:"Cicatriz II",   short:"II",  mutators:["elites_x2","fast_horde"],                                    desc:"Élites dobles y enemigos más rápidos.",               title:"marcado_2"},
  {rank:3, name:"Cicatriz III",  short:"III", mutators:["elites_x2","fast_horde","furious"],                          desc:"Suma jefes furiosos (+30% vida, +20% daño).",          title:"marcado_3"},
  {rank:4, name:"Cicatriz IV",   short:"IV",  mutators:["elites_x2","fast_horde","furious","dense"],                  desc:"Suma rondas cortas y densas: no hay respiro.",         title:"marcado_4"},
  {rank:5, name:"Cicatriz V",    short:"V",   mutators:["elites_x2","fast_horde","furious","dense","no_potions"],     desc:"Sin pociones de vida. La curación es tuya.",          title:"marcado_5", frame:"cicatriz"}
];

/* ---- funciones puras (las usa el motor y las pruebas) ---- */
function scarClamp(r){ r = r|0; return r < 0 ? 0 : r > SCAR_CFG.maxRank ? SCAR_CFG.maxRank : r; }
// Reserva: si la temporada YA trae un mutador del rango, se sustituye por el siguiente de esta lista que todavía no esté activo.
// Así cada rango agrega siempre tantos mutadores NUEVOS como dice su tabla (sin esto, un rango "no hacía nada" el mes en que
// la temporada coincidía con él). En el rango V quedan activos los 7 mutadores.
const SCAR_RESERVE = ["swarm", "rifts", "elites_x2", "fast_horde", "furious", "dense", "no_potions"];
// Mutadores efectivos de una partida: los de la temporada + los del rango; los repetidos se sustituyen desde la reserva. Orden estable.
function scarMergeMutators(weekly, rank){
  const out = (weekly||[]).filter((m, i, a) => a.indexOf(m) === i);
  for(const m of (SCAR_RANKS[scarClamp(rank)]||SCAR_RANKS[0]).mutators){
    if(out.indexOf(m) < 0){ out.push(m); continue; }
    const alt = SCAR_RESERVE.find(r => out.indexOf(r) < 0);
    if(alt) out.push(alt);
  }
  return out;
}
function scarScoreBonus(rank){ return 1 + SCAR_CFG.scoreBonusPerRank * scarClamp(rank); }
// Qué pasa al terminar una partida jugada en `rank` y llegando a `round`, dado el máximo desbloqueado `max`.
// Devuelve {cleared, eligible, unlock (nuevo máximo o null), title, frame}. No muta nada.
function scarOutcome(rank, round, max){
  rank = scarClamp(rank); max = scarClamp(max);
  // Solo cuenta el rango que ya tenías abierto: un invitado en la sala de un anfitrión de rango más alto juega ese rango,
  // pero no se salta la progresión (ni desbloqueo, ni título, ni marco).
  const eligible = rank <= max;
  const cleared = eligible && (round|0) >= SCAR_CFG.clearRound[rank];
  const out = {cleared, eligible, unlock:null, title:null, frame:null};
  if(!cleared) return out;
  if(rank < SCAR_CFG.maxRank && max < rank + 1) out.unlock = rank + 1;
  const R = SCAR_RANKS[rank];
  if(R && R.title) out.title = R.title;
  if(R && R.frame) out.frame = R.frame;
  return out;
}
// Un rango se puede elegir si es 0 o ya está desbloqueado.
function scarCanPick(rank, max){ return scarClamp(rank) <= scarClamp(max); }
// Compatibilidad con Node para las pruebas puras.
if(typeof module !== "undefined" && module.exports) module.exports = {SCAR_CFG, SCAR_RANKS, SCAR_RESERVE, scarClamp, scarMergeMutators, scarScoreBonus, scarOutcome, scarCanPick};
