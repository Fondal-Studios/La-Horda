'use strict';
// Reads the real data/registration modules. No browser, art download or game save.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ROOT = path.resolve(__dirname, '../..');
function loadRoster() {
  const c = require('../../server/item-economy-loot').ctx();
  if (c.__collectionRoster) return c.__collectionRoster;
  vm.runInContext(`
    var PAL = {}, GRIDS = {}, ANIM_PROFILES = {}, CHAMP_IDENTITY = {}, CODEX_SKILL_FX = {};
    var CODEX_CHAMP_LORE = {}, HERO_VOICES = {}, SET_SKINS = {}, CROMA_SKINS = {}, CROMA_CRYSTALS = {};
    for (const id of Object.keys(CLASSES)) PAL[id] = {};
    function hexToRgb(h) { return {r:parseInt(h.slice(1,3),16),g:parseInt(h.slice(3,5),16),b:parseInt(h.slice(5,7),16)}; }
    function mkChampion() { return {unlocked:false}; }
    function champPackLoadAtlas() {}
    function cromaEnsureLoaded() { return null; }
    function expeditionCast() {} function updatePortadorHero() {} function drawPortadorGround() {}
    function triggerBasic() {} function damageEnemy() {} function aimProfileOf() {}
    function ynaraUpdateObject() {} function divinaDealDamage() {}
    function aidCollideEnemy() {} function resolveWallCollision() {} function portadorTakenMult() {}
    var NET_SKIP_KEYS = new Set(), ACTION_AIM_PROFILES = {};
  `, c);
  const files = [
    'js/champions/expedition/catalog.js', 'js/champions/expedition/register.js',
    'js/champions/ascension/catalog.js', 'js/champions/ascension/register.js',
    ...['solciju','veyra','brakk','morveth','aelith'].map(k=>'js/champions/quality-five/'+k+'.js'),
    'js/champions/quality-five/register.js', 'js/assets/quality-five-collection-meta.js',
    'js/champions/quality-five/collection.js',
    'js/assets/set-skins-meta.js', 'js/assets/croma-skins-meta.js',
    'js/assets/complete-set-skins-meta.js', 'js/assets/alpha-set-skins-meta.js',
    'js/assets/unique-skins-meta.js', 'js/assets/quality-five-skins-meta.js',
    'js/champions/expedition/art.js', 'js/champions/expedition/cosmetics.js',
    'js/champions/ascension/art.js'
  ];
  const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  for (const f of files) {
    if (!index.includes('src="'+f+'"')) throw Error('Roster source not loaded in index.html: '+f);
    vm.runInContext(fs.readFileSync(path.join(ROOT, f),'utf8'),c,{filename:f,timeout:5000});
  }
  c.__collectionRoster = JSON.parse(vm.runInContext(`JSON.stringify({
    heroes: CHAMPION_CATALOG.map(row=>({id:row.id, name:CLASSES[row.id].hudName||CLASSES[row.id].name,
      role:CLASSES[row.id].roleCategory, category:championMeta(row.id).category,
      releaseState:championMeta(row.id).releaseState})),
    arenas: CAMPAIGN_ORDER,
    sets: Object.entries(CHAMPION_SETS).map(([id,s])=>({id,champion:s.champion,name:s.name})),
    skinConcepts: Object.values(ASCENSION_SKINS).flat().map(s=>({id:s.id,champion:s.champ,name:s.name,registry:'ASCENSION_SKINS',status:s.status})),
    skins: Object.entries(SET_SKINS).map(([id,s])=>({id,champion:s.champ,name:s.name,registry:'SET_SKINS'}))
      .concat(Object.entries(CROMA_SKINS).map(([id,s])=>({id,champion:s.champ,name:s.name,registry:'CROMA_SKINS',kind:s.appearanceType||'croma'})))
  })`, c));
  return c.__collectionRoster;
}
module.exports = {loadRoster, ROOT};
if (require.main === module) console.log(JSON.stringify(loadRoster(),null,2));
