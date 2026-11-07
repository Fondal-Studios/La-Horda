#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const assetsPath = path.join(root, "js/assets/champion-sprites.js");
const rendererPath = path.join(root, "js/rendering/champion-sprites.js");
const technicalPath = path.join(root, "assets/sprites/champions/mago/codex-v1/technical.json");
const assets = fs.readFileSync(assetsPath, "utf8");
const renderer = fs.readFileSync(rendererPath, "utf8");
const technical = JSON.parse(fs.readFileSync(technicalPath, "utf8"));

function assert(ok, message) {
  if (!ok) throw new Error(message);
}

const marker = 'champPackLoadAtlas("mago", ';
const start = assets.indexOf(marker);
assert(start >= 0, "mago registration missing");
const line = assets.slice(start, assets.indexOf("\n", start));
const match = line.match(/^champPackLoadAtlas\("mago",\s*"([^"]+)",\s*(\{.*\})\);$/);
assert(match, "mago registration is not a single reproducible JSON metadata call");
const src = match[1];
const meta = JSON.parse(match[2]);

assert(src === technical.atlas, "runtime atlas path differs from technical record");
assert(meta.w === 112 && meta.h === 112 && meta.cols === 4, "unexpected grid metadata");
assert(meta.refH === 94, "refH must match the roster-gate scale correction");
assert(meta.fix && meta.fix.left === "mirror", "left-facing profile mirror missing");

const expected = {
  walk_down:[0,1,2,3], walk_side:[4,5,6,7], walk_up:[8,9,10,11],
  attack_down:[12,13,14,15], attack_side:[16,17,18,19], attack_up:[20,21,22,23],
  cast_down:[24,25,26,27], ultimate_down:[28,29,30,31], death_down:[32,33,34,35],
  idle_down:[0,36,0,37], idle_side:[4,38,4,39], idle_up:[8,40,8,41]
};
for (const [name, frames] of Object.entries(expected)) {
  assert(JSON.stringify(meta.sets[name]) === JSON.stringify(frames), `${name} mapping differs`);
}
for (const [name, frames] of Object.entries(meta.sets)) {
  assert(Array.isArray(frames) && frames.length > 0, `${name} is empty`);
  for (const frame of frames) assert(Number.isInteger(frame) && frame >= 0 && frame < technical.frames, `${name} frame ${frame} out of range`);
}
assert(technical.frames === 42 && technical.nonEmpty === 42 && technical.size[0] === 448 && technical.size[1] === 1232, "technical frame coverage is not complete (4x11 grid, 36 states + 6 idle frames)");
assert(technical.sha256 === require("crypto").createHash("sha256").update(fs.readFileSync(path.join(root, technical.atlas))).digest("hex"), "technical.json describes a different atlas.png (stale sha256)");
assert(technical.binaryAlpha === true && technical.edgeAlphaPixels === 0, "technical alpha gate failed");

const drawStart = renderer.indexOf("function drawMagoAtlas");
const drawEnd = renderer.indexOf("\n}", drawStart);
const drawBody = renderer.slice(drawStart, drawEnd);
assert(drawBody.indexOf('drawChampPack("mago"') >= 0, "new pack is not consulted by drawMagoAtlas");
assert(drawBody.indexOf('drawChampPack("mago"') < drawBody.indexOf("drawAnimAtlas(MAGO_ANIM_ATLAS"), "legacy atlas is not a load/error fallback");

const fallenStart = renderer.indexOf("function drawMagoFallen");
const fallenEnd = renderer.indexOf("\n}", fallenStart);
const fallenBody = renderer.slice(fallenStart, fallenEnd);
// La muerte del atlas Códice la dibuja drawFallenHero por drawChampPackDeath (clip death_down de 4 cuadros ANIMADO);
// drawMagoFallen es solo el respaldo legado y no puede volver a congelar el último cuadro.
assert(!fallenBody.includes("_codexT:420"), "Mago death is frozen on the last frame again");
assert(fallenBody.includes("if(!MAGO_IMG_READY) return false"), "legacy fallen fallback missing");
assert(renderer.includes("CHAMP_PACK[h.classKey] || skinPack") && meta.sets.death_down.length >= 4, "drawFallenHero does not animate the authored death_down clip");

const result = {
  status: "PASS",
  atlas: src,
  sha256: technical.sha256,
  frames: technical.frames,
  nonEmpty: technical.nonEmpty,
  mappingsChecked: Object.keys(meta.sets).length,
  fallback: "mago ready -> authored pack; loading/error -> legacy MAGO_ANIM_ATLAS",
  scope: "static consumer contract; not gameplay, multiplayer, visual Art Gate, or CI approval"
};
process.stdout.write(JSON.stringify(result, null, 2) + "\n");
