'use strict';
// Validador mínimo de JSON Schema (subconjunto) sin dependencias. Corre en Node; no se carga en el navegador.
// Soporta: type (object|array|string|integer|number|boolean|null), properties, required, additionalProperties:false,
// enum, const, minimum, maximum, pattern, minLength, maxLength, items, minItems, maxItems.
const { CODES } = require('./errors');
const err = (path, code, detail) => ({ path, code, ...(detail !== undefined ? { detail: String(detail) } : {}) });
function typeOf(v){ return v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v; }
function okType(t, v){
  if(t === 'integer') return Number.isSafeInteger(v);
  if(t === 'number') return typeof v === 'number' && Number.isFinite(v);
  return typeOf(v) === t;
}
function walk(schema, v, path, out){
  if(schema.const !== undefined && v !== schema.const){ out.push(err(path, 'BAD_ENUM', 'const ' + schema.const)); return; }
  if(schema.type){
    const ts = Array.isArray(schema.type) ? schema.type : [schema.type];
    if(!ts.some(t => okType(t, v))){ out.push(err(path, 'BAD_TYPE', 'se esperaba ' + ts.join('|') + ', llegó ' + typeOf(v))); return; }
  }
  if(schema.enum && !schema.enum.includes(v)) out.push(err(path, 'BAD_ENUM', String(v).slice(0, 40)));
  if(typeof v === 'number'){
    if(schema.minimum !== undefined && v < schema.minimum) out.push(err(path, 'OUT_OF_RANGE', v + ' < ' + schema.minimum));
    if(schema.maximum !== undefined && v > schema.maximum) out.push(err(path, 'OUT_OF_RANGE', v + ' > ' + schema.maximum));
  }
  if(typeof v === 'string'){
    if(schema.maxLength !== undefined && v.length > schema.maxLength) out.push(err(path, 'TOO_LONG'));
    if(schema.minLength !== undefined && v.length < schema.minLength) out.push(err(path, 'OUT_OF_RANGE', 'vacío'));
    if(schema.pattern && !new RegExp(schema.pattern).test(v)) out.push(err(path, 'BAD_FORMAT', schema.pattern));
  }
  if(Array.isArray(v)){
    if(schema.maxItems !== undefined && v.length > schema.maxItems) out.push(err(path, 'TOO_LONG', v.length + ' elementos'));
    if(schema.minItems !== undefined && v.length < schema.minItems) out.push(err(path, 'OUT_OF_RANGE', 'lista corta'));
    if(schema.items) v.forEach((x, i) => walk(schema.items, x, path + '[' + i + ']', out));
  }
  if(v && typeof v === 'object' && !Array.isArray(v)){
    const props = schema.properties || {};
    for(const k of schema.required || []) if(!Object.prototype.hasOwnProperty.call(v, k) || v[k] === undefined) out.push(err(path + '.' + k, 'MISSING_FIELD'));
    for(const k of Object.keys(v)){
      if(v[k] === undefined) continue; // JSON.stringify lo omite: equivale a ausente
      if(k === '__proto__' || k === 'constructor' || k === 'prototype'){ out.push(err(path + '.' + k, 'UNKNOWN_FIELD')); continue; }
      if(props[k]) walk(props[k], v[k], path + '.' + k, out);
      else if(schema.additionalProperties === false) out.push(err(path + '.' + k, 'UNKNOWN_FIELD'));
      else if(schema.additionalProperties && typeof schema.additionalProperties === 'object') walk(schema.additionalProperties, v[k], path + '.' + k, out);
    }
  }
}
function validateSchema(schema, value){ const errors = []; walk(schema, value, '$', errors); return { ok: errors.length === 0, errors }; }
module.exports = { validateSchema, CODES };
