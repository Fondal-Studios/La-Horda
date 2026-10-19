# La Horda: bloques chequeables de arte

**Bloque activo: B002 (tanque). B001 (Elyra): técnico verificado, visual pendiente.**

[Control de producción](../control_produccion.json) · [Plan completo](plan_bloques.json) · [Auditoría de guardados](B000_auditoria/auditoria.json) · [Revisar B001](B001_soporte/ESTADO.md)

Cobertura: las 1.244 entradas originales aparecen exactamente una vez. Hay 645 bloques de producción y 86 seguimientos agregados de kits; estos últimos evitan redibujar pedidos superpuestos.

| Prioridad | Bloques de producción | Detalle |
|---|---:|---|
| P0 | 96 | [Pedidos y checklist](P0.md) |
| P1 | 309 | [Pedidos y checklist](P1.md) |
| P2 | 240 | [Pedidos y checklist](P2.md) |

## Próximos bloques

| Bloque | Trabajo | Estado |
|---|---|---|
| [B001](P0.md#b001) | Campeón soporte: un atlas para todos sus faltantes de cuerpo | TECNICO_VERIFICADO |
| [B002](P0.md#b002) | Campeón tanque: un atlas para todos sus faltantes de cuerpo | EN_CORRECCION |
| [B003](P0.md#b003) | Campeón guerrero: un atlas para todos sus faltantes de cuerpo | EN_CORRECCION |
| [B004](P0.md#b004) | Campeón libertador: un atlas para todos sus faltantes de cuerpo | EN_CORRECCION |
| [B005](P0.md#b005) | Campeón myla: un atlas para todos sus faltantes de cuerpo | PENDIENTE |
| [B006](P0.md#b006) | Campeón ynara: un atlas para todos sus faltantes de cuerpo | BLOQUEADO_DECISION |
| [B007](P0.md#b007) | aelith · Definitiva · La hora imposible | PENDIENTE |
| [B008](P0.md#b008) | aurelia · Definitiva · Catedral del Sol | PENDIENTE |
| [B009](P0.md#b009) | axiom · Definitiva · Force Quit | PENDIENTE |
| [B010](P0.md#b010) | baltra · Definitiva · Que todos la escuchen | PENDIENTE |
| [B011](P0.md#b011) | brakk · Definitiva · Demolición final | PENDIENTE |
| [B012](P0.md#b012) | brasa · Definitiva · Turno de Emergencia | PENDIENTE |

## Qué significa cada cierre

- **TECNICO_VERIFICADO:** pasó los chequeos disponibles; no equivale a aprobación visual.
- **APROBADO_DUENO:** revisión artística aprobada por el dueño.
- **INTEGRADO_CLAUDE:** Claude lo instaló y verificó en el juego.
- **EN_CORRECCION:** conserva los archivos y registra el defecto siguiente.
- **BLOQUEADO_DECISION:** requiere un dato o decisión concreta; los bloques independientes continúan.

## Para retomar después de una interrupción

1. Leer `../control_produccion.json` y su último checkpoint.
2. Abrir el bloque activo en P0.md/P1.md/P2.md.
3. Verificar los hashes de la fuente guardada y retomar el siguiente paso anotado.
4. No generar nuevamente un personaje por haber perdido contexto de chat.
5. Guardar arte, manifiesto, contacto, fuente y resultados antes de pasar al siguiente bloque.

Los estados de aprobación visual e integración permanecen separados. Ninguno de los 1.244 ítems se considera resuelto automáticamente por un merge de fuentes.
