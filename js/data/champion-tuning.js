"use strict";
/* ============================================================
   js/data/champion-tuning.js
   BALANCE CENTRALIZADO de El Libertador (José de San Martín, clave "libertador") y de Ilkan
   (Coloso de Arena, clave "ilkan"). Todo número que define cómo se sienten sus habilidades está acá:
   daño, cooldowns (los de los botones están en CLASSES, js/data/champions.js), alcances,
   duraciones, velocidades, buffs, Tormenta, transformación, regeneración, áreas, aturdimientos,
   empujes, sangrado y daño de las definitivas. La lógica está en js/champions/libertador.js y
   js/champions/ilkan.js y nunca repite estos valores.
   Convenciones: *Ms = milisegundos, *Pct/*Mult = proporción (0.2 = +20%), dmgMult = veces el
   daño base del guardián (ya escalado por nivel, objetos, talentos y maestría de la habilidad).
   ============================================================ */
const SM_CFG = {
  // Fusil de Granadero (básico): pocos disparos, cada uno importa
  musket:   {reloadMs:1450, projSpeed:1000, range:380, projLife:520, dmgMult:1.0, recoilPx:5, aimMs:120},
  // Disparo de Oficial: cada N disparos que impactan, el siguiente es especial
  officer:  {every:4, dmgMult:2.2, pierce:1},
  // Bayoneta (hab. 1): embestida corta que se detiene al conectar
  bayonet:  {dashDist:190, dashSpeed:950, dmgMult:2.5, bleedMs:3000, staggerMs:350, finishHpPct:0.15, finishMs:260},
  // ¡Granaderos, a la carga! (hab. 2): buff de equipo
  granaderos: {durationMs:8000, radius:430, speedPct:0.20, atkSpeedPct:0.15, dmgPct:0.15, ccResist:0.40, commandMs:520},
  // Carga de San Lorenzo (hab. 3): montar -> cargar -> impacto -> desmontar
  sanLorenzo: {mountMs:260, chargeDist:430, chargeSpeed:880, width:64, dmgMult:1.9, knockPx:80, eliteStunMs:650,
               bossDefDownPct:0.20, bossDefDownMs:4000, dismountMs:280, ccResist:0.85},
  // Soldado Cabral (pasiva, una vez por partida)
  cabral:   {invulnMs:2000, speedPct:0.30, speedMs:3000},
  // Cruce de los Andes (definitiva) + forma montada
  andes:    {castMs:950, chargeMs:1250, chargeDist:640, width:240, dmgMult:4.2, knockPx:110, eliteStunMs:900,
             bossDefDownPct:0.25, bossDefDownMs:6000, frostMs:7000, frostPatches:10, riders:12, snow:70},
  mounted:  {durationMs:10000, speedPct:0.40, dmgPct:0.25, dmgReduce:0.20, ccResist:0.5,
             sabreRange:98, sabreCdMs:560, sabreDmgMult:1.15, sabreArc:0.2}
};
const ILKAN_CFG = {
  // FURIA = la barra de la definitiva (ultCharge 0..ultMax). Además de lo que carga pegando
  // (igual que cualquier guardián), sube al recibir daño y con el 3er golpe del combo.
  fury:     {perHpPctTaken:0.9, comboThird:5, lowHpBonus:1.0, colossusGainMult:0.55},
  // Hoces gemelas (básico): combo de 3
  blades:   {combo:[1.0, 1.0, 1.45], windowMs:900},
  // Lanza-Pendón (hab. 1): lanza -> vuelo -> segunda lanza (cambio de dirección)
  hook:     {dashDist:360, dashSpeed:1150, redirects:1, redirectDist:300, slashRadius:74, slashDmgMult:1.4, landMs:200, prepMs:90},
  // Piel de Duna (hab. 2): se expone para cargar Tormenta
  instinct: {durationMs:3500, dmgReduce:0.35, furyMult:3.0},
  // Grito de Caravana (hab. 3): grito ofensivo, más fuerte con poca vida
  advance:  {durationMs:7000, speedPct:0.18, dmgPct:0.18, furyMult:1.5, lowHpScale:0.8, allyRadius:300, allyShare:0.35},
  // Sed de Horizonte (pasiva)
  passive:  {threshold:0.25, speedPct:0.15, dmgPct:0.15, furyMult:1.5},
  // Coloso de Arena (definitiva 1) y su forma
  colossus: {tfMs:1600, invokeMs:420, durationMs:22000, hpMult:2.6, dmgMult:1.9, radiusMult:2.2, visualScale:2.7,
             speedMult:0.82, def:0.25, regenPct:0.30, regenPerSecPct:0.02,
             atkRange:112, atkAoe:72, atkCdMs:950, thirdAoe:150, thirdMult:1.8, knockPx:55, eliteStaggerMs:350},
  sismo:    {radius:230, dmgMult:3.2, falloff:0.45, knockPx:95, eliteStunMs:500},
  terremoto:{pulses:4, intervalMs:500, radius:250, dmgMult:1.25, vulnMult:1.25},
  march:    {steps:6, stepMs:520, radius:160, dmgMult:1.35, speed:95, knockPx:60, eliteStaggerMs:260},
  // Los Tres Pasos (definitiva 2, secreta): tres pasos con aviso, control cedido
  finale:   {roarMs:1300, telegraphMs:1350, gapMs:650, dist:320, radii:[250, 250, 420], dmgMult:[8, 8, 13],
             knockPx:140, silhouettes:9,
             // EXCEPCIONAL (BUGFIX 01): como mucho 2 por partida y, además de la Tormenta llena transformado,
             // una condición especial que no depende de enfriamientos (ver ilkanFinaleCondition):
             //  1ª: pelea contra un JEFE, o Ilkan al borde (<35% vida) / un aliado caído.
             //  2ª: el JEFE ya debajo del 50% y al menos 90 s desde la primera.
             maxPerRun:2, gapMs2:90000, lowHpPct:0.35, bossHpPct2:0.5},
  exhausted:{durationMs:6000, speedPct:-0.30, noTransformMs:20000}
};
// La Cazadora (clave "cazadora"): escalado de sus pasivas Rastreo (por marca sobre la Presa, máx. 5) e Impulso (por punto, máx. 10).
// Balance de limpieza de horda (2026-10, tools/balance/clear-potential.js; ver BALANCE_CAMPEONES.md): antes: Rastreo cadencia 0,05 y crítico acorralada 0,25; Impulso cadencia 0,02 (velocidades sin cambio).
const SYLVA_CFG = {
  basicDmgMult: 0.88, // solo la flecha básica (antes 1,0); las habilidades no cambian
  track:    {atkSpeedPerStack:0.035, speedPerStack:0.04, corneredCrit:0.18},
  momentum: {atkSpeedPerPoint:0.014, speedPerPoint:0.01}
};
// PASIVAS DE LOS CAMPEONES CLÁSICOS (2026-10, Champion Bible §4): Aldric, Kael, Thalen, Elyra y Axiom no
// tenían rasgo permanente. Son de IDENTIDAD (refuerzan su verbo), condicionales y chicas: no son DPS plano.
// Medidas con tools/balance/known-champion-sim.js contra la referencia por rol (docs/bible/AUDIT_LOG.md A15).
const CLASSIC_PASSIVES = {
  tanque:   {name:"Bastión",          ico:"🛡", allyRadius:200, allyDmgTakenMult:0.92},          // aliados cerca de Aldric: -8% daño
  guerrero: {name:"Depredador",       ico:"🩸", basicVsDotMult:1.15},                            // básicos contra sangrantes/envenenados: +15%
  mago:     {name:"Maestro Elemental",ico:"✶", reactionBonusMult:1.5},                           // bonus de sus reacciones x1,5 (Vapor +50% -> +75%)
  soporte:  {name:"Gracia del Alba",  ico:"✚", lowHpPct:0.35, lowHpHealMult:1.25},              // curar a un aliado bajo 35%: +25%
  axiom:    {name:"Recompilar",       ico:"↻", energyPerKill:3, maxPerSec:15}                    // bajas con habilidades devuelven energía
};
