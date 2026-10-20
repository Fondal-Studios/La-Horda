"use strict";
/* ============================================================
   js/data/mage-kit.js
   KIT DE MAGOS: legendarios, míticos y únicos que CAMBIAN LA PASIVA de los guardianes con
   roleCategory === "mago" (se enumeran en runtime desde CLASSES; nunca a mano).
   La lógica vive en js/systems/mage-passives.js (adaptadores por guardián + pasiva genérica de
   respaldo). Documento: docs/items/KIT_DE_MAGOS.md. Pruebas: tools/items/t_mage_kit.js.

   REGLAS
   - Solo se EQUIPAN en magos (roleOnly:"mago", ver canEquipItem en js/systems/items.js). El resto de los
     guardianes los ve en el inventario ("Solo magos") pero no los puede ponerse: así ningún poder queda
     colgado de una pasiva que el guardián no tiene.
   - Nunca se venden en la tienda (js/systems/shop.js) ni se fabrican los Únicos. Los Míticos se fabrican
     con 3 Legendarios del kit (MYTHIC_RECIPES, js/systems/recipes.js); dos recetas comparten una pieza
     a propósito: hace falta un segundo ejemplar para fabricar los dos.
   - Caída por arena: MAGE_KIT_MIN_ARENA (primera arena de la campaña desde la que caen; en Horda
     Infinita y Pesadilla/Infierno, siempre) y `arenas` de cada pieza (peso relativo, igual que
     NAMED_LEGENDARIES). Cuando juega un mago pesan más (MAGE_KIT_DROP).
   - El multijugador no se toca: los poderes corren en la simulación del anfitrión, con los mismos
     ganchos que build-powers.js / mythic-powers.js.
   ============================================================ */
const MAGE_ROLE = "mago";
const ROLE_ONLY_LABEL = {mago:"magos"}; // cómo se muestra roleOnly en la UI ("Solo magos")
// Primera arena de la campaña (CAMPAIGN_ORDER, 1-10) desde la que cae cada categoría.
const MAGE_KIT_MIN_ARENA = {legendario:2, mitico:4, unico:6};
// Cuánto pesa el kit en el botín: parte de los Legendarios / Míticos / Únicos cuando juega un mago, y cuando no
// (el inventario es de la cuenta y los magos de la cuenta lo usan, pero a un guerrero casi no le cae).
const MAGE_KIT_DROP = {legendario:{mago:0.20, otro:0.05}, mitico:{mago:0.45, otro:0.08}, unico:{mago:0.55, otro:0.10}};

// Poderes. `tag` es el tema; `ico` el glifo de la ficha; `fx` el tema visual de kit-shared.js (KIT_FX).
const MAGE_POWERS = {
  // — Legendarios
  mp_cauce:   {name:"Cauce Desbordado",       tag:"resonancia",   fx:"rune",   rgb:"190,150,255",
    desc:"Cada lanzamiento llena un 20% tu pasiva (la definitiva, un 40%). Funciona con la pasiva propia de cada mago; si no tiene medidor, carga Resonancia."},
  mp_sobrante:{name:"Alquimia del Sobrante",  tag:"energía",      fx:"light",  rgb:"255,230,140",
    desc:"Con más del 80% de energía, cada 1,2 s se convierte un 12% de tu energía máxima en un 25% de carga de tu pasiva."},
  mp_tercer:  {name:"Tercer Sello",           tag:"ciclo",        fx:"bolt",   rgb:"255,240,140",
    desc:"Cada 3.er lanzamiento RESUENA: una onda arcana (30% de tu daño, hasta 50% más con la pasiva llena) daña y ralentiza a los enemigos cerca y suma 10% de carga."},
  mp_memoria: {name:"Memoria de Hechizo",     tag:"memoria",      fx:"ice",    rgb:"170,230,255",
    desc:"Cuando un lanzamiento te gasta la pasiva (35% o más), recuperás la mitad de lo gastado 0,6 s después. Una vez cada 6 s."},
  mp_velo:    {name:"Velo de Resonancia",     tag:"protección",   fx:"shield", rgb:"180,220,255",
    desc:"Cuando tu pasiva cruza el 50% ganás un escudo del 8% de tu vida y 10% de armadura por 3 s. Una vez cada 7 s."},
  mp_marca:   {name:"Marca Contagiosa",       tag:"marcas",       fx:"fire",   rgb:"255,150,70",
    desc:"Lanzar tu 3.ª habilidad propaga una MARCA a hasta 4 enemigos (4 s): reciben 8% más de tus habilidades y cada golpe de habilidad sobre uno marcado carga 4% tu pasiva."},
  mp_canal:   {name:"Pausa del Canalizador",  tag:"canalización", fx:"vortex", rgb:"150,160,255",
    desc:"Quieto, la pasiva se llena sola: tras 0,7 s sin moverte ganás un 7% de carga cada 0,5 s (hasta el 60%)."},
  // — Míticos
  mp_coro:    {name:"Coro Sin Fin",           tag:"eco",          fx:"rune",   rgb:"210,170,255",
    desc:"Cada 9 s en combate tu pasiva se dispara DOS VECES seguidas (0,45 s entre una y otra): cada disparo es su efecto propio más una onda de resonancia del 20% de tu daño."},
  mp_ciclo:   {name:"Ciclo Eterno",           tag:"ciclo",        fx:"light",  rgb:"255,225,150",
    desc:"Tu definitiva REVIVE la pasiva: 0,5 s después queda con carga máxima y tus habilidades pegan 12% más durante 6 s. Una vez cada 25 s."},
  mp_archivo: {name:"Archivo Arcano",         tag:"memoria",      fx:"spark",  rgb:"255,210,120",
    desc:"Si lanzás las tres habilidades distintas en 9 s, el Archivo se completa: te devuelve la energía del lanzamiento, suma 40% de carga, acorta 1 s los enfriamientos y tus habilidades pegan 10% más por 3,5 s. Cada 10 s."},
  // — Únicos
  mpu_voz:    {name:"La Voz Antigua",         tag:"resonancia",   fx:"rune",   rgb:"176,140,255",
    desc:"Cada lanzamiento hace sonar tu pasiva (una vez cada 1,5 s) con su efecto y una onda. Con la pasiva casi llena (90%+), tus habilidades 1-3 se recargan 20% más rápido. Cuatro runas orbitan alrededor tuyo según tu carga."},
  mpu_fase:   {name:"Fase del Último Ciclo",  tag:"ciclo",        fx:"wind",   rgb:"120,230,255",
    desc:"Con la pasiva llena entrás en FASE 5 s: +25% de velocidad, +10% de daño y cada lanzamiento libera una onda. Al terminar queda en 35%. Una vez cada 22 s."}
};

// Tuning de los poderes (un solo lugar; lo lee js/systems/mage-passives.js y la prueba).
const MAGE_CFG = {
  // pasiva genérica de respaldo ("Resonancia"): para magos sin adaptador (o sin medidor propio)
  resMax: 4, resPerCast: 1, resPerUlt: 2, resDecayMs: 7000, resNovaR: 120, resNovaPct: 0.40, resNovaMax: 8,
  cauceCast: 0.20, cauceUlt: 0.40, cauceCd: 400,
  sobranteAbove: 0.80, sobranteEvery: 1200, sobranteTake: 0.12, sobranteGain: 0.25,
  tercerEvery: 3, tercerR: 110, tercerPct: 0.30, tercerFrac: 0.5, tercerGain: 0.10, tercerSlow: 0.2, tercerSlowMs: 1200,
  memoriaDrop: 0.35, memoriaBack: 0.5, memoriaDelay: 600, memoriaCd: 6000,
  veloAt: 0.5, veloShield: 0.08, veloArmor: 0.10, veloMs: 3000, veloCd: 7000,
  marcaMax: 4, marcaR: 280, marcaMs: 4000, marcaDmg: 0.08, marcaGain: 0.04, marcaGainCd: 250,
  canalStillMs: 700, canalEvery: 500, canalGain: 0.07, canalCap: 0.60,
  coroEvery: 9000, coroGap: 450, coroNear: 420, coroPct: 0.20, coroR: 110, coroMax: 10,
  cicloDelay: 500, cicloMs: 6000, cicloDmg: 0.12, cicloCd: 25000,
  archivoWindow: 9000, archivoGain: 0.40, archivoCut: 1000, archivoMs: 3500, archivoDmg: 0.10, archivoCd: 10000,
  vozEvery: 1500, vozFull: 0.90, vozCdBoost: 0.20, vozPct: 0.2,
  faseMs: 5000, faseSpeed: 0.25, faseDmg: 0.10, faseCd: 22000, faseAfter: 0.35, fasePct: 0.15, faseNovaCd: 600, faseR: 100
};

/* ---------------- LEGENDARIOS (7) ---------------- */
const MAGE_KIT_LEGENDARIES = {
  mk_diadema_voz:{name:"Diadema de la Voz Repetida", epithet:"que no deja terminar el eco", type:"casco", element:"arcane", power:"mp_cauce",
    props:[{effect:"skilldmg_mult",value:0.07},{effect:"energy_mult",value:0.06}], arenas:{laberinto:4, micelial:2},
    lore:"Una maga dijo un hechizo en voz alta y la sala lo siguió repitiendo tres días. La diadema todavía no se calla."},
  mk_tunica_sobrante:{name:"Túnica del Sobrante Sagrado", epithet:"que no tira nada", type:"pechera", element:"holy", power:"mp_sobrante",
    props:[{effect:"hp_mult",value:0.06},{effect:"energy_mult",value:0.10}], arenas:{micelial:4, bosque:1},
    lore:"La cosió una monja avara con los hilos que sobraban de las otras. Aprovecha todo, hasta lo que vos desperdiciás."},
  mk_guantes_sello:{name:"Guantes del Tercer Sello", epithet:"que cuentan hasta tres", type:"guantes", element:"lightning", power:"mp_tercer",
    props:[{effect:"skilldmg_mult",value:0.08},{effect:"cd_mult",value:0.05}], arenas:{acuatica:4, laberinto:2},
    lore:"Los dos primeros sellos se rompen sin ruido. El tercero, no."},
  mk_sandalias_memoria:{name:"Sandalias del Hechizo Recordado", epithet:"que no olvidan un paso", type:"botas", element:"ice", power:"mp_memoria",
    props:[{effect:"speed_mult",value:0.06},{effect:"cd_mult",value:0.05}], arenas:{hielo:4, abismo:2},
    lore:"Las encontraron congeladas en el último paso de un baile. Cada vez que las usás, el baile sigue."},
  mk_egida_velo:{name:"Égida del Velo Resonante", epithet:"que vibra antes del golpe", type:"escudo", element:"holy", power:"mp_velo",
    props:[{effect:"hp_mult",value:0.08},{effect:"def_add",value:0.05}], arenas:{fortaleza:3, abismo:3},
    lore:"No frena los golpes: los hace sonar. Y un golpe que suena ya no pega igual."},
  mk_cetro_marca:{name:"Cetro de la Marca Contagiosa", epithet:"que señala y se acuerda", type:"arma", element:"fire", power:"mp_marca",
    props:[{effect:"dmg_mult",value:0.06},{effect:"skilldmg_mult",value:0.06}], arenas:{infernal:3, fortaleza:2, bosque:2},
    lore:"Toca a uno y los demás se enteran. Nadie sabe cómo; nadie quiere averiguarlo."},
  mk_capucha_canal:{name:"Capucha del Canalizador Quieto", epithet:"que escucha sin moverse", type:"casco", element:"physical", power:"mp_canal",
    props:[{effect:"hp_mult",value:0.06},{effect:"heal_mult",value:0.06}], arenas:{bosque:3, minas:3},
    lore:"Un canalizador se sentó a esperar que la magia volviera. Esperó cuarenta años. Volvió."}
};

/* ---------------- MÍTICOS DE RECETA (3, con 3 Legendarios del kit) ---------------- */
const MAGE_KIT_MYTHICS = {
  mkm_baculo_coro:{name:"Báculo del Coro Sin Fin", type:"arma", element:"arcane", power:"mp_coro",
    recipe:["mk_diadema_voz","mk_guantes_sello","mk_cetro_marca"], props:[{effect:"skilldmg_mult",value:0.12},{effect:"cd_mult",value:0.08},{effect:"dmg_mult",value:0.06}],
    arenas:{laberinto:4, micelial:2}, lore:"Una voz, un sello, una marca: tres hechizos que se repiten hasta volverse un coro. El báculo los dirige."},
  mkm_manto_ciclo:{name:"Manto de los Ciclos Eternos", type:"pechera", element:"holy", power:"mp_ciclo",
    recipe:["mk_tunica_sobrante","mk_sandalias_memoria","mk_egida_velo"], props:[{effect:"hp_mult",value:0.12},{effect:"energy_mult",value:0.12},{effect:"heal_mult",value:0.06}],
    arenas:{micelial:3, abismo:3}, lore:"Nada se pierde: lo que sobra vuelve, lo que se olvida se recuerda, lo que golpea suena. El manto cierra el círculo."},
  mkm_corona_archivo:{name:"Corona del Archivo Arcano", type:"casco", element:"arcane", power:"mp_archivo",
    recipe:["mk_capucha_canal","mk_sandalias_memoria","mk_guantes_sello"], props:[{effect:"skilldmg_mult",value:0.10},{effect:"energy_mult",value:0.12},{effect:"cd_mult",value:0.06}],
    arenas:{laberinto:4, hielo:2}, lore:"Quietud para escuchar, memoria para guardar, tres sellos para ordenar. La corona es la biblioteca; el mago, el único libro."}
};

/* ---------------- ÚNICOS (2): jackpot, nunca en la tienda ni por receta ---------------- */
const MAGE_KIT_UNIQUES = {
  mku_corona_voz:{name:"Corona de la Voz Antigua", type:"casco", element:"arcane", power:"mpu_voz", aura:"176,140,255",
    props:[{effect:"skilldmg_mult",value:0.16},{effect:"cd_mult",value:0.09},{effect:"energy_mult",value:0.10}],
    lore:"Antes de las palabras, hubo una sola Voz. Los magos la llevan dentro; esta corona la hace sonar."},
  mku_toga_fase:{name:"Toga de la Fase Final", type:"pechera", element:"ice", power:"mpu_fase", aura:"120,230,255",
    props:[{effect:"hp_mult",value:0.16},{effect:"energy_mult",value:0.10},{effect:"skilldmg_mult",value:0.08}],
    lore:"Quien la viste no muere: cambia de fase. Después de la última, hay otra."}
};

// Registro. Los Míticos de receta entran en MYTHIC_RECIPES (recipes.js, inventario, "falta una pieza").
(function registerMageKit(){
  const base = (id, d, rarity, extra)=>({id, champion:null, type:d.type, rarity, named:true, element:d.element, magePower:d.power, roleOnly:MAGE_ROLE,
    name:d.name, lore:d.lore, arenas:d.arenas||null, effectMods:d.props, passiveNames:d.props.map(p=>PASSIVE_EFFECT_LABEL[p.effect]||"Propiedad"), ...extra});
  for(const id in MAGE_KIT_LEGENDARIES){ const d = MAGE_KIT_LEGENDARIES[id]; DESIGNED_ITEMS[id] = base(id, d, "legendario", {epithet:d.epithet, legendProc:null}); }
  for(const id in MAGE_KIT_MYTHICS){ const d = MAGE_KIT_MYTHICS[id]; DESIGNED_ITEMS[id] = base(id, d, "mitico", {recipe:d.recipe.slice()}); MYTHIC_RECIPES[id] = d.recipe.slice(); }
  for(const id in MAGE_KIT_UNIQUES){ const d = MAGE_KIT_UNIQUES[id]; DESIGNED_ITEMS[id] = base(id, d, "unico", {aura:d.aura}); }
})();
// Todos los ids del kit, por categoría (para la UI, la caída y las pruebas).
const MAGE_KIT_IDS = {legendario:Object.keys(MAGE_KIT_LEGENDARIES), mitico:Object.keys(MAGE_KIT_MYTHICS), unico:Object.keys(MAGE_KIT_UNIQUES)};
function mageKitDesign(id){ return MAGE_KIT_LEGENDARIES[id] || MAGE_KIT_MYTHICS[id] || MAGE_KIT_UNIQUES[id] || null; }
