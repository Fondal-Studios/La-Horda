'use strict';
// Registro DECLARATIVO de las migraciones de guardado que ya existen. No migra nada: apunta a quien lo hace hoy.
// Propietario único del registro: Agente B (Persistencia). Una migración nueva se agrega aquí y en su prueba.
const MIGRATIONS = Object.freeze([
  { id: 'itemSchemaV2', applied: d => d.itemSchemaV === 2, implementedIn: 'js/storage/save.js', note: 'rareza de objetos v1 -> v2 (ITEM_SCHEMA_VERSION)' },
  { id: 'stashV1', applied: d => !!d.stashV1, implementedIn: 'js/storage/save.js', note: 'inventario a alijo de cuenta' },
  { id: 'affixV1', applied: d => !!d.affixV1, implementedIn: 'js/storage/save.js', note: 'afijos v1' },
  { id: 'campaignV2', applied: d => !!d.campaignV2, implementedIn: 'js/storage/save.js', note: 'campaña v2' },
  { id: 'talentTreeV2', applied: d => !!d.talentTreeV2, implementedIn: 'js/storage/save.js', note: 'árbol de talentos v2' },
  { id: 'legacyChampionIds', applied: d => !Object.keys(d.champions || {}).some(k => k === 'eren'), implementedIn: 'js/storage/legacy-champion-ids.js', note: 'eren -> ilkan (compartido cliente/servidor)' },
  { id: 'economyV2', applied: d => d.economyV2 === true, implementedIn: 'server/item-economy-live.js', note: 'proyección del inventario desde el libro del servidor' }
]);
function appliedMigrations(data){ return MIGRATIONS.filter(m => { try{ return m.applied(data); }catch{ return false; } }).map(m => m.id); }
module.exports = { MIGRATIONS, appliedMigrations };
