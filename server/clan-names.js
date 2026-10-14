"use strict";
/* ============================================================
   LA HORDA — FILTRO BÁSICO DE NOMBRES DE CLAN (nombre, etiqueta y descripción)

   Qué es: una barrera mínima y determinista, no moderación. Sirve para frenar lo evidente (insultos
   típicos, nombres de staff, enlaces, imitaciones por cambio de letras) sin humanos de por medio.
   Qué NO es: no detecta jerga nueva, otros idiomas, indirectas ni ofensas por contexto. A escala hace
   falta reporte de jugadores + revisión humana (ver docs/modes/CLANES.md, sección "Qué falta").

   Cómo compara: pasa el texto a un "esqueleto" (minúsculas, sin tildes, 0->o 1->i 3->e 4->a 5->s 7->t @->a $->s,
   sin espacios ni signos, letras repetidas colapsadas). Con el esqueleto:
     - la UNICIDAD del nombre/etiqueta se decide por esqueleto ("H0rda", "horda" y "Ho rda" son el mismo nombre);
     - las palabras cortas de la lista negra se buscan como PALABRA entera (para no censurar "vehículo");
     - las largas e inequívocas se buscan también dentro del texto pegado ("hitlerfans").
   Solo se admiten letras latinas, números, espacio y _ . ' - : así no entran letras cirílicas o griegas que
   imitan a las latinas.
   ============================================================ */

const NAME_MIN = 3, NAME_MAX = 20, TAG_MIN = 2, TAG_MAX = 4, DESC_MAX = 120;
const NAME_RE = /^[\p{Script=Latin}\p{N}][\p{Script=Latin}\p{N} _.'-]*[\p{Script=Latin}\p{N}]$/u;
const TAG_RE = /^[A-Za-z0-9]{2,4}$/;

// Palabras sueltas (se comparan contra cada palabra del esqueleto, nunca como trozo de otra palabra).
// Se toleran alargues ("puuuta") pero no letras de menos: "niger" (el país) no es "nigger".
const BAD_WORDS = ["puta", "puto", "putas", "putos", "mierda", "verga", "pija", "pijas", "conchudo", "pene", "culo", "culos", "sexo", "porno",
  "nazi", "nazis", "chupala", "chupapijas", "forro", "forra", "retrasado", "maricon", "marica",
  "fuck", "fucker", "shit", "bitch", "cunt", "cock", "pussy", "slut", "whore", "rape", "rapist", "nigga", "nigger", "fag", "faggot", "porn"];
// Trozos inequívocos: se buscan también dentro del texto pegado ("hitlerfans").
const BAD_STEMS = ["hitler", "nigger", "faggot", "pedofil", "pedophil", "violador", "violacion", "holocaust", "genocid", "terrorist", "suicid", "motherfuck"];
function elong(w, whole){
  const body = w.replace(/(.)\1*/g, (run, c) => run.length > 1 ? c + "{" + run.length + ",}" : c + "+");
  return new RegExp(whole ? "^" + body + "$" : body);
}
const BAD_WORD_RES = BAD_WORDS.map(w => elong(w, true)), BAD_STEM_RES = BAD_STEMS.map(w => elong(w, false));
// Nombres que sugieren que el clan es del equipo del juego (se compara el esqueleto pegado).
const RESERVED_EXACT = new Set(["admin", "gm", "mod", "staff", "lahorda", "horda", "fondal", "anthropic", "claude", "owner", "dueno", "system", "sistema"]);
const RESERVED_STEMS = ["admin", "moderad", "fondal", "oficial", "official", "soporte", "support", "gamemaster", "lahordastaff"];
const TAG_BAD = new Set(["ass", "sex", "xxx", "nsfw", "fck", "fuk", "fuck", "kkk", "ss", "nzi", "pta", "pto", "ptm", "hdp", "ctm", "wtf", "tit", "tits", "cum", "cock"]);
const LINK_RE = /(https?:|www\.|\.com\b|\.net\b|\.org\b|\.gg\b|\.ar\b|discord|t\.me|wa\.me|@[a-z0-9_]{3,})/i;

const MAP = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s", "!": "i", "|": "i" };
function stripMarks(s){ return String(s).normalize("NFD").replace(/\p{M}+/gu, ""); }
// Esqueleto con espacios (para separar palabras) y pegado.
function skeletonWords(s, collapse){
  let t = stripMarks(String(s == null ? "" : s).normalize("NFKC")).toLowerCase();
  t = t.replace(/[0134578@$!|]/g, c => MAP[c] || c);
  t = t.replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
  return t.split(" ").filter(Boolean).map(w => collapse ? w.replace(/(.)\1+/g, "$1") : w);
}
function skeleton(s){ return skeletonWords(s, true).join(""); }
// Dos o más palabras sueltas que pegadas forman una mala palabra ("p u t a") también cuentan.
function hasBad(s){
  const words = skeletonWords(s, false), glued = words.join("");
  if(words.some(w => BAD_WORD_RES.some(re => re.test(w)))) return true;
  if(words.length > 1 && words.length <= 6 && BAD_WORD_RES.some(re => re.test(glued))) return true;
  return BAD_STEM_RES.some(re => re.test(glued));
}
function isReserved(s){
  const g = skeleton(s);
  if(RESERVED_EXACT.has(g)) return true;
  return RESERVED_STEMS.some(st => g.includes(st));
}
// Limpieza común: NFC, sin <>, sin caracteres de control ni invisibles, espacios colapsados.
function clean(s, max){
  return String(s == null ? "" : s).normalize("NFC")
    .replace(/[<>\u0000-\u001f\u007f-\u009f​-‏‪-‮⁠-⁤﻿]/g, "")
    .replace(/\s+/g, " ").trim().slice(0, max);
}

// Devuelve {ok:true, name, key} o {ok:false, error, msg}.
function checkName(raw){
  if(typeof raw !== "string") return { ok: false, error: "BAD_NAME", msg: "Poné un nombre para el clan." };
  const name = clean(raw, NAME_MAX + 8);
  if(name.length < NAME_MIN || name.length > NAME_MAX) return { ok: false, error: "BAD_NAME", msg: `El nombre del clan tiene que tener de ${NAME_MIN} a ${NAME_MAX} caracteres.` };
  if(!NAME_RE.test(name)) return { ok: false, error: "BAD_NAME", msg: "Solo letras latinas, números, espacios y _ . ' - (sin símbolos raros ni letras de otros alfabetos)." };
  if(/ {2,}|[_.'-]{2,}/.test(name)) return { ok: false, error: "BAD_NAME", msg: "Sin espacios o signos repetidos." };
  if((name.match(/\p{L}/gu) || []).length < 2) return { ok: false, error: "BAD_NAME", msg: "El nombre necesita al menos dos letras." };
  const key = skeleton(name);
  if(key.length < 3) return { ok: false, error: "BAD_NAME", msg: "El nombre necesita al menos tres letras distintas." };
  if(isReserved(name)) return { ok: false, error: "RESERVED_NAME", msg: "Ese nombre parece del equipo del juego y está reservado." };
  if(hasBad(name)) return { ok: false, error: "NAME_NOT_ALLOWED", msg: "Ese nombre no está permitido. Elegí otro." };
  return { ok: true, name, key };
}
function checkTag(raw){
  if(typeof raw !== "string") return { ok: false, error: "BAD_TAG", msg: "Poné una etiqueta de 2 a 4 letras o números." };
  const tag = raw.normalize("NFC").trim().toUpperCase();
  if(!TAG_RE.test(tag)) return { ok: false, error: "BAD_TAG", msg: `La etiqueta tiene que tener de ${TAG_MIN} a ${TAG_MAX} letras o números (A-Z, 0-9).` };
  const key = skeleton(tag);
  if(isReserved(tag) || key === "gm") return { ok: false, error: "RESERVED_NAME", msg: "Esa etiqueta está reservada." };
  if(hasBad(tag) || TAG_BAD.has(skeletonWords(tag, false).join(""))) return { ok: false, error: "NAME_NOT_ALLOWED", msg: "Esa etiqueta no está permitida." };
  // la etiqueta compite por esqueleto con 0/O, 1/I...: "L0L" y "LOL" son la misma
  return { ok: true, tag, key: key || tag.toLowerCase() };
}
function checkDesc(raw){
  if(raw === undefined || raw === null) return { ok: true, desc: "" };
  if(typeof raw !== "string") return { ok: false, error: "BAD_DESC", msg: "La descripción tiene que ser texto." };
  const desc = clean(raw, DESC_MAX + 40);
  if(desc.length > DESC_MAX) return { ok: false, error: "BAD_DESC", msg: `La descripción tiene como máximo ${DESC_MAX} caracteres.` };
  if(LINK_RE.test(desc) || LINK_RE.test(desc.replace(/\s+/g, ""))) return { ok: false, error: "LINKS_NOT_ALLOWED", msg: "Sin enlaces, usuarios ni invitaciones en la descripción." };
  if(hasBad(desc)) return { ok: false, error: "NAME_NOT_ALLOWED", msg: "La descripción tiene palabras que no están permitidas." };
  return { ok: true, desc };
}
// Para buscar: minúsculas y sin tildes (la búsqueda no distingue "Cuervos" de "cuérvos").
function searchKey(s){ return stripMarks(String(s == null ? "" : s).normalize("NFKC")).toLowerCase().replace(/[^a-z0-9]+/g, ""); }

module.exports = { NAME_MIN, NAME_MAX, TAG_MIN, TAG_MAX, DESC_MAX, skeleton, skeletonWords, hasBad, isReserved, clean, checkName, checkTag, checkDesc, searchKey };
