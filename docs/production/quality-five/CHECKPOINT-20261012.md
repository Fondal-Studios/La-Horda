# Avance comprobado — 12/10/2026

## Revisión posterior de CI

Los workflows Quality five y Expedition champions finalizaron correctamente sobre
`8ad30df`. Champion entry balance falló en `test-projectile-identity.js`: Solciju,
Morveth y Aelith compartían `exglyph`. Se implementaron formas propias de sacacorchos,
espora y reloj fracturado, más sable y mampostería para Veyra/Brakk. La prueba existente,
sin modificar sus exigencias, pasó localmente: 25 tiradores con identidad única y
28 dibujos distintos píxel a píxel. Es un arreglo visual sin cambios a daño o colisión.
La nueva CI debe comprobar la integración; los bloqueos de arte y contratos siguen vigentes.

Base auditada: main `31efa3e49b40e84d8c740b7c7f3218a887532a35`.
PR #78 sigue en `dccb23b`; PR #87, `claude/five-champions`, incorpora sus kits.
Este avance continúa #87; no abre otra tanda ni duplica registros.
Los antiguos commits locales 7068907/625a1c1 y sus diez atlas no estaban en este entorno
ni en las ramas remotas auditadas. Se recuperó la lámina conceptual original, no esos atlas.

## Implementado en esta rama

- Registro preserva el objeto de progreso existente: propiedad, nivel, XP, inventario,
  cosmético y maestría. Prueba ejecuta el módulo real con perfiles previos y nuevos.
- Cinco identidades de sonido: diez cues de activas/definitivas, sintetizados por el mixer
  existente, sin consumo del RNG de combate. Reserva por contexto evita voces superpuestas
  ilimitadas; mute y prioridades del motor permanecen vigentes.
- Presupuesto de 64 partículas decorativas simultáneas por dueño. Las zonas de peligro
  permanecen legibles; no modifica daño, radios, invocaciones ni cooldowns.
- Relay QA usa el servidor y taxonomía reales, cuentas temporales autenticadas y grants
  explícitos en un directorio descartable. Se eliminó la copia del servidor que sustituía
  TESTING por RELEASED. Cinco controles negativos rechazan selecciones sin concesión.
- Solciju y Viuda de Medianoche: dos nuevas fuentes, 72 poses en total, atlas originales
  importados con la fábrica y alineados en el motor. Sustituyen a Maura sólo en esta rama.
  Fuentes, prompts, hashes, previews y revisión están versionados. Sus dos recetas Maura
  se archivan; la producción reproducible ya no las usa como dibujos nuevos.
- Fábrica para sheets originales: rechaza hash incorrecto, poses ausentes, falta de alfa
  y clipping; separa componentes para evitar armas de frames vecinos. No aprueba arte sola.
- Workflow específico repite pruebas de guardado, presupuesto, kits, relay, audio y fuentes.

## Evidencia de esta ejecución

| Control | Resultado y alcance |
|---|---|
| Kits | 132 + 81 + 131 comprobaciones PASS, niveles 1/39/40/60/90/99 |
| Talent Gate | PASS: migración, backups de nube, requisitos y maestría irreversible |
| Ability Gate estricto | 43 campeones, cero candidatos fallidos y cero errores de página |
| Balance Gate | 75 simulaciones, 25 candidatos, PASS; referencia y techos intactos |
| Red | 21 controles PASS: cinco rechazos sin grant y 16 comprobaciones entre dos clientes autenticados |
| Audio | Suite completa PASS, diez cues nuevos audibles medidos, cero clipping/NaN/fuentes sin terminar |
| Fábrica | 27 pruebas existentes PASS; cuatro regresiones del importador PASS |
| Guardado/presupuesto | Cuatro regresiones Node PASS |
| Estilo Solciju + skin | Dos atlas PASS numérico, sin bajar tolerancias |
| Roster Art Gate | 126 apariencias, cero errores de escala, presentación o página |

Archivos: `validation-20261012.json`, `online-results.json`, `audio-20261012.txt`,
`originals/style-results.txt`, `../../art-gate/roster-gate.json` y los reportes nativos de gates.
El primer arranque de Chromium falló por sockets no disponibles; se ejecutaron las pruebas
con headless-shell y dos procesos separados para los clientes de red. No se presentó ese
intento fallido como PASS. Medición offline de audio no reemplaza escucha humana.

## Bloqueos reales de publicación

1. Brakk, Veyra, Morveth y Aelith siguen con arte de donantes/estudios en #87. Redibujar
   sus ocho atlas según `original-identities.json`; no repetir Maura/Renko/Vesper/Tibor/Sira.
2. Contratos de fábrica aún INCOMPLETE: Sets, cromas, evidencias finales de performance y
   paquete cosmético. La mejora de audio no convierte los contratos en aprobación de release.
3. Resolver revisiones mecánicas de duplicidad sin alterar detector ni umbrales; conservar
   los diagnósticos DUPLICATE/REVIEW mientras no exista revisión documentada suficiente.
4. Completar pruebas de los modos competitivos actuales, teléfonos físicos y servidor
   oficial. Estas pruebas locales no verifican NanoGM ni certifican balance PvP.
5. Las cinco skins adicionales para campeones existentes todavía no se produjeron:
   terminar primero este lote. No contar cromas ni conceptos como skins terminadas.

Los cinco kits permanecen TESTING en rama; este checkpoint no los publica en main
ni despliega el sitio. Ninguna cuenta, billetera, permiso o infraestructura real se modificó.
No se activaron cobros. Mantener la tarea recurrente para terminar el lote pendiente.

## Continuación reproducible

`python tools/factory/produce-quality-five.py` reconstruye las fuentes disponibles y
compara con los atlas instalados. `--require-complete` falla hasta tener los diez sheets.
`node tools/factory/cli.js validate docs/production/quality-five/solciju.contract.json`
debe seguir reportando INCOMPLETE; no cambiar esa etiqueta manualmente.
Repetir gates sobre la integración final antes de cualquier merge a main.
