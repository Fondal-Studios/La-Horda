# Cinco campeones originales — candidato Alpha del 12/10/2026

Solciju, Brakk, Veyra, Morveth y Aelith tienen kits reales, talentos, maestría, Códice y arte original instalado. Cada uno incorpora la skin del concepto aprobado, una apariencia de Set y un croma selectivo. Las cinco skins adicionales para campeones antiguos son una entrega pendiente distinta: no se cuentan aquí las apariencias de Set como ese pedido.

## Evidencia

- Fábrica: quince fuentes reconstruibles con SHA, quince atlas con estilo numérico PASS, siete pruebas de importación. Contratos: cinco STRUCTURAL_PASS (no equivalen por sí solos a release).
- Arte: revisión visual documentada en originals/ART-REVIEW.md, roster de 136 apariencias sin fallos. Preview del motor: visual-roster.png.
- Cosméticos: 50 controles de compra, equipamiento, no alterar combate y persistencia; regresión general 5786 controles sin fallos.
- Kits: Solciju/Veyra 132, Brakk 81, Morveth/Aelith 131. Niveles 1,39,40,60,90,99, límites, expiración y transformaciones.
- Talent Gate PASS; Ability Gate estricto 43 campeones sin fallos; Balance Gate 75 simulaciones/25 candidatos PASS, referencia intacta.
- Relay real local: 23 controles, cinco campeones estándar admitidos, dos fundadores rechazados sin permiso, ejecución del invitado por host, replicación y limpieza. No se cambió el relay para el test.
- Guerra de Cristales: cinco campeones, 55 segundos simulados cada uno, sin fuego amigo, NaN ni salida del mapa. Tres partidas de 150 s: bots compran objetos al salir de base.
- Coliseo: cinco torneos completos, uno por campeón; sin fuego amigo, NaN, daño fuera de combate ni salidas del foso; ganador, puntos y guardado coherentes. Ver coliseum-results.jsonl.
- Server: billetera 65/65; Game Master 127 controles de integración y seguridad. Audio: gate completo PASS.
- Rendimiento: cinco mediciones en Ciudad, CPU x4, pantalla 844x390, canvas 422x195 sin GPU. Mediana de script 20–25 ms y p95 34–48 ms; mediana RAF ~30 FPS. No cumple una promesa de 60 FPS sostenidos ni certifica teléfonos reales. Logs performance-*.json.
- Duplicidad: detector intacto, dos diagnósticos DUPLICATE revisados en DESIGN-REVIEW.md. No se falsifica su salida automática.

## Integraciones finales

- Refuerzos de incursión: cuatro elecciones por rareza y un dúo por campeón (25 efectos reales). Suite completa de los 43 campeones sin fallos; evidencia en boon-results.json.
- Catálogo regenerado desde el cliente: 267 objetos, 43 campeones y 77 apariencias; sincronización cliente/servidor 482 controles PASS.
- Tutorial: Elyra espera en la lección de XP y regresa al objetivo cooperativo; evita quedarse con el único remate. Recorrido por controles reales y dos tamaños de pantalla PASS.
- Cristales: cada nuevo nivel máximo del equipo concede una sola carta; límite de 12 y sincronización de hitos comprobados. Tres partidas de 150 s PASS.
- Protocolo B1-7-quality-five-originals; clientes anteriores rechazados para impedir salas con catálogos incompatibles.

## Publicación

El candidato habilita los cinco como STANDARD/RELEASED en el catálogo Alpha y conserva sus identificadores y progreso. knownChampions no cambia: continúan sometidos al Balance Gate de entrada. La aprobación de merge requiere CI verde sobre el commit final.

Main no equivale a despliegue. El 12/10/2026 el sitio oficial Fondal respondió HTTP 200; /la-horda/red/api/health informó store:file y persistent:false. No reiniciar ni redesplegar ese servidor sin verificar respaldo y persistencia. No se modificaron cuentas, permisos, billeteras, cobros ni infraestructura. Render es el servidor anterior; el canónico está documentado como Fly.io.

Pendientes: CI del candidato; acceso seguro al despliegue canónico; teléfono físico y sesiones públicas; optimizar p95 móvil; cinco skins adicionales del roster existente. No se afirma calidad comercial 10/10.
