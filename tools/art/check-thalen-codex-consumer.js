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
assert(drawStart >= 0, "drawMagoAtlas missing");
const drawEnd = renderer.indexOf("\n}", drawStart);
const drawBody = renderer.slice(drawStart, drawEnd);
assert(drawBody.includes('drawChampPack("mago"'), "new pack is not consulted by drawMagoAtlas");
// Equivalent-or-stricter replacement of the old "legacy atlas is a load/error fallback" checks: the legacy 16-crop atlas
// is gone from the main game, so a failed pack must behave like any other champion with a failed pack (draw returns the
// pack result, drawHero falls to the procedural body) and nothing may still reference the legacy symbols.
assert(!/drawAnimAtlas|MAGO_ANIM|MAGO_IMG|MAGO_ATLAS/.test(drawBody), "drawMagoAtlas still touches the legacy atlas");
assert(/return drawChampPack\("mago", h, drawScale, alpha\);/.test(drawBody), "drawMagoAtlas must return the pack result so a failed pack falls through like other champions");
for (const [label, text] of [["js/assets/champion-sprites.js", assets], ["js/rendering/champion-sprites.js", renderer]]) {
  assert(!/MAGO_IMG|MAGO_ANIM|MAGO_ATLAS|MAGO_TARGET_HEIGHT|drawMagoFallen|magoResolveClip|magoCastReleaseFx/.test(text.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "")), `${label} still has orphan legacy Mago symbols`);
  assert(!text.includes("champions/mago/atlas.png"), `${label} still loads the legacy Mago atlas`);
}
// Legacy atlas must not be preloaded or listed for WebP swap (the Codex atlas loads through champPackLoadAtlas, checked above).
const manifest = fs.readFileSync(path.join(root, "js/assets/asset-manifest.js"), "utf8");
const webpList = fs.readFileSync(path.join(root, "js/assets/asset-webp.js"), "utf8");
assert(!manifest.includes('"assets/sprites/champions/mago/atlas.png"'), "legacy Mago atlas still in asset-manifest.js");
assert(!webpList.includes('"assets/sprites/champions/mago/atlas.png"'), "legacy Mago atlas still in asset-webp.js");
assert(!fs.existsSync(path.join(root, "assets/sprites/champions/mago/atlas.webp")), "legacy Mago atlas.webp still exists");
// Nothing in the renderer may call the removed legacy fallen path; the death must be the animated authored clip.
assert(!renderer.includes("drawMagoFallen"), "drawFallenHero still calls the removed legacy Mago fallen path");
assert(renderer.includes("CHAMP_PACK[h.classKey] || skinPack") && meta.sets.death_down.length >= 4, "drawFallenHero does not animate the authored death_down clip");
assert(!/_codexT:420/.test(renderer.slice(renderer.indexOf("function drawFallenHero"), renderer.indexOf("function drawFallenHero") + 1500)), "Mago death is frozen on the last frame again");
// Main-game scripts must not reference the legacy file (Crystal Wars' own atlas table is a separate mode).
function walk(d, out = []) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) { if (!f.includes(path.join("js", "modes", "crystal-wars"))) walk(f, out); } else if (/\.js$/.test(e.name)) out.push(f); } return out; }
for (const f of [...walk(path.join(root, "js")), path.join(root, "index.html"), path.join(root, "sw.js")]) {
  if (!fs.existsSync(f)) continue;
  assert(!fs.readFileSync(f, "utf8").includes("champions/mago/atlas.png"), `${path.relative(root, f)} references the legacy Mago atlas`);
}

const result = {
  status: "PASS",
  atlas: src,
  sha256: technical.sha256,
  frames: technical.frames,
  nonEmpty: technical.nonEmpty,
  mappingsChecked: Object.keys(meta.sets).length,
  fallback: "mago ready -> authored pack; loading/error -> drawChampPack false -> procedural body (same as every other champion); legacy atlas removed",
  scope: "static consumer contract; not gameplay, multiplayer, visual Art Gate, or CI approval"
};
process.stdout.write(JSON.stringify(result, null, 2) + "\n");
