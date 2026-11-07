'use strict';
// Sube ASSET_VER (js/core/asset-version.js): usar cada vez que se instala/cambia arte (PNG/WebP de assets/). Uso: node tools/perf/bump-asset-version.js [valor]
const fs=require('node:fs'),cp=require('node:child_process'),p='js/core/asset-version.js';
let v=process.argv[2];if(!v){try{v=cp.execSync('git rev-parse --short HEAD').toString().trim();}catch(e){v=String(Date.now());}}
const s=fs.readFileSync(p,'utf8').replace(/window\.ASSET_VER = "[^"]*"/,`window.ASSET_VER = "${v}"`);fs.writeFileSync(p,s);console.log('ASSET_VER =',v);
