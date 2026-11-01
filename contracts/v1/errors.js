'use strict';
// Códigos de error de los contratos. Estables: cambiar o quitar uno es un cambio MAJOR (ver docs/arquitectura-compartida/CONTRATOS.md).
const CODES = Object.freeze({
  BAD_TYPE: 'tipo incorrecto',
  MISSING_FIELD: 'falta un campo obligatorio',
  UNKNOWN_FIELD: 'campo no declarado en el contrato',
  OUT_OF_RANGE: 'valor fuera de rango',
  BAD_FORMAT: 'formato inválido',
  BAD_ENUM: 'valor fuera de la lista cerrada',
  TOO_LONG: 'texto o lista demasiado largo',
  BAD_VERSION: 'versión de contrato ausente o mal formada',
  UNSUPPORTED_VERSION: 'versión mayor no soportada',
  UNKNOWN_CONTRACT: 'contrato desconocido',
  PII_FIELD: 'campo con datos personales no permitido',
  NOT_CREDITABLE: 'el resultado no tiene evidencia verificada por el servidor',
  EVIDENCE_REQUIRED: 'la acreditación exige una referencia de evidencia',
  IDEMPOTENCY_MISMATCH: 'misma clave de idempotencia con contenido distinto',
  SIGN_MISMATCH: 'el signo del monto no corresponde al tipo de asiento'
});
class ContractError extends Error {
  constructor(errors){ super(errors.map(e => `${e.path || '$'}: ${e.code}${e.detail ? ' (' + e.detail + ')' : ''}`).join('; ')); this.name = 'ContractError'; this.errors = errors; }
}
module.exports = { CODES, ContractError };
