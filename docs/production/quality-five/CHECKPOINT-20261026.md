# Continuidad de producción — 26/10/2026

Base auditada: `20afebd4ccefaf6fa11ce30ab096c2535d341640` en
`Fondal-Studios/La-Horda` (mismo repositorio GitHub 1379488490, transferido desde
la cuenta personal). No regenerar el lote original ni reabrir el taller #78.

El PR #187 de caída del Guerrero está mergeado desde el 22/10 como
`80683b03de58286398ef47de828c39196542c14d`. No sigue bloqueado por su primer CI.
Los cinco contratos originales pasan STRUCTURAL_PASS en esta base. Esto no
revalida arte, balance dinámico ni publicación. Los cinco campeones ya están
integrados según README y registros actuales; cinco skins adicionales del roster
existente requieren conciliar las entregas posteriores antes de contar o fabricar.
PR abiertos al auditar: #227 Musashi (FIX / NO_INTEGRAR), #92 Cristales y #90
Ilsa/Vorn/Kora (TESTING). Preservar esos trabajos; no integrarlos por antigüedad.

## Corrección implementada

La CLI de fábrica devolvía 0 cuando duplicity o element terminaban por señal sin
exit status. Reproducido con SIGTERM sobre el código anterior: ambos devolvían 0.
Ahora una señal o error devuelve 1 y un diagnóstico; se conservan los códigos
de rechazo normales. No cambian métricas, umbrales ni aprobaciones artísticas.
Diez canarios de éxito/rechazo/señal/timeout/ejecutable ausente añadidos al CI.

Validación local: 44 pruebas de fábrica y quality-five aprobadas; referencia de
balance sincronizada; Talent Gate PASS (1/39/40/60/90/99, migración, nube y maestría);
cinco contratos STRUCTURAL_PASS. Ability Gate inicialmente bloqueado por ausencia
de Chromium; descarga estándar devuelve ZIP truncado. No contarlo como PASS.

## Próximo paso

Validar este cambio en CI antes del merge. Reanudar el inventario de skins y assets
desde main actualizado, preservando los recientes kits de Solciju, Brakk, Veyra,
Morveth y Aelith. No contar dibujos de taller como recursos instalados.
No se produce arte nuevo ni se verifica despliegue público en este checkpoint.
No se modifican infraestructura, cuentas, billeteras, permisos o cobros.
