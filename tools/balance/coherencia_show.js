// Imprime el JSON de tools/balance/coherencia_loot.js como tablas de texto.   node tools/balance/coherencia_show.js loot.json
const j = require(require('path').resolve(process.argv[2]));
for (const t in j.tiers) {
  console.log(t);
  for (const a in j.tiers[t]) {
    const x = j.tiers[t][a];
    console.log(a.padEnd(10), x.n, 'obj', x.objetos, 'MR+', x.muyRaroOMas, 'leg+', x.legendarioOMas, 'set', x.setPorPartida, 'ilvl', x.ilvl, 'gem', x.nivelGemas, 'stat', x.statMedio, 'best1', x.mejorPorRanura1, 'best2', x.mejorPorRanura2);
  }
}
console.log('CARRERA (' + j.careers + ' carreras, ' + j.plays + ' partidas por arena)');
for (const c of j.carrera) console.log(c.tier.padEnd(9), c.arena.padEnd(10), 'entra', c.poderAlEntrar, 'tras1', c.tras1, 'tras2', c.tras2, 'mejoras 1ra', c.mejorasEn1ra, '2da', c.mejorasEn2da, 'leg1ra', c.mejorasLegendarias1ra);

console.log('loot=N (solo cofre) contra N victorias reales: mejor stat por ranura (1,00 = Muy Raro ilvl 1)');
for (const k in j.lootN) console.log(k.padEnd(14), JSON.stringify(j.lootN[k]));
