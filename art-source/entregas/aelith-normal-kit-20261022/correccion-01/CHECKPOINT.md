# Aelith — corrección de ciclo de vida01 (22/10/2026)

PR199 / rama art/aelith-normal-kit-first-pass-20261022. Continúa head6ead42f01d0bc272d87d01e373e83d951b7a1de5 y el lote común PR196/197. Main6334ff40b6514808ef0fe00b50bec15e19f10c25. No otro trabajo concurrente encontrado; checkpoint previo completo.

Checkpoint inicial de recuperación: EN_CORRECCION / NO_INTEGRAR. No merge, no publicación. Fuentes originales y PR191 conservados. 41 controles de ciclo de vida y27 del kit PASS local; red/capturas finales/skins/contraste/CI todavía pendientes en este checkpoint inicial.

B105: retirar end genérico del eco; emitir nova desde la llamada de impacto real de aelithUpdateObject conservando el draw genérico y su RNG. Cancelación por muerte/fusión/vacío/dueño ausente/reemplazo/reset/snapshot perdido no supone impacto. Evento escalar SFA existente para anfitrión/invitado.
B107: auraEventPhase y auraFamily optativos siguen t/dur, una sola secuencia por receptor. Transición real de updatePortadorHero a deuda emite aura gris800ms; estelas existentes se recolorean y colapsan hacia el cuerpo en220ms, sin modificar el héroe ni los buffs. Nuevo atlas candidato debt-sand40x56x12, receta nativa aelithFxStrip reutilizada. No imagegen: se modifica el renderer SFA de código, sin arte raster externo.

Cambios comunes reconciliados: beamEventPhase del engine de PR197 y registro netHookEvents tardío de pixfx de PR196. No se importaron sus dibujos ni FIX. Sin cambios de mecánica, cuentas, cobros, infraestructura o permisos.

Continuar: node tools/vfx/verify-aelith-lifecycle.js; pruebas reales de relay (incluyendo muerte, límite2, reprise/aftershock y compartir); paridad SFA y132 funcionales; comparar antes/después horizontal/móvil a250,750,1600,3050,3300,3800ms. Completar manifiesto y cierre remoto antes de otro componente. B106 y contraste/skins siguen pendientes; no cerrar bloque completo por corregir temporizadores.
