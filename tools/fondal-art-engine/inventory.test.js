'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {rowsFrom,safePath,pathsFrom,reconcile}=require('./inventory');
test('manifest array and named wrapper',()=>{
 assert.equal(rowsFrom([{id:'a'}]).length,1);
 assert.equal(rowsFrom({filas:[{id:'a'}]}).length,1);
 assert.throws(()=>rowsFrom({a:[],b:[]}),/Unknown manifest/);
});
test('reject traversal and remote paths',()=>{
 for(const p of ['../secrets.png','/etc/secret.png','https://example.com/a.png','C:/temp/a.png'])assert.equal(safePath(p),null);
 assert.equal(safePath('./assets/sprites/a.png'),'assets/sprites/a.png');
});
test('path statuses are not art approvals',()=>{
 const rows=[{id:'ok',ruta:'assets/a.png'},{id:'bad',ruta:'assets/b.png'},{id:'unknown',descripcion:'draw dragon'}];
 const r=reconcile(rows,new Set(['assets/a.png']));
 assert.deepEqual(r.counts,{PATH_EXISTS:1,PATH_MISSING:1,UNVERIFIED:1});
 assert.deepEqual(pathsFrom(rows[0]),['assets/a.png']);
});
test('historical runtime targets are parsed; templates and reference images are not targets',()=>{
 assert.deepEqual(pathsFrom({ruta_juego:'[REEMPLAZA] assets/sprites/a/atlas.png',referencia:['assets/reference.png']}),['assets/sprites/a/atlas.png']);
 assert.deepEqual(pathsFrom({ruta_juego:'[PROPUESTA] assets/sprites/<id>/atlas.png'}),[]);
 assert.deepEqual(pathsFrom({ruta_juego:'assets/a.png + entrada en REGISTRY'}),['assets/a.png']);
});
