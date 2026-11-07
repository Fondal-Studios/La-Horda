# RIESGOS Y BLOQUEOS
## Críticos
| ID | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| K1 | Ranking acepta puntaje del cliente y usa ronda de grupo | Fraude y requisito incumplido | Diseñar ronda personal + atestación del anfitrión + validación servidor; tests |
| K2 | Sin pase de batalla ni compras nativas | Alcance de la beta | Diseñar `server/battlepass.js` idempotente; adaptadores de tienda tras credenciales |
| K3 | Selector muestra modos fuera de alcance | UX/alcance | Ocultar Cristales/Coliseo con flag, sin borrar código |
| K4 | `beta/integracion` divergente (67 adelante/16 atrás) y 3 pilas de PR apiladas | Merge ciego peligroso | Extraer cambios mínimos a ramas desde main |
| K5 | Roster/arte sin verificar al runtime | Calidad | Gates + evaluador independiente |
| K6 | Brasas por piezas de set (`PIECES_FOR_BRASAS`) puede rozar pay-to-win | Política F2P | Auditar y apagar por defecto |
## Bloqueos externos (documentados, no resuelven con código)
- Runway: saldo observado 15; sin autorización para recargar. BFL/OpenAI: sin credenciales (#256).
- Steam/Google Play/App Store: cuentas, firma, SDK de pagos: del socio. iOS: sin macOS/Xcode/certificados → no compilable aquí.
- Hardware real móvil/gamepad y playtests humanos: no disponibles.
- Servidor de producción Fondal `persistent:false` (#172): verificar con el socio; no se despliega.
- Protección de rama `main`: no consultada (MCP no la expone); merges requieren permisos y CI verde.
## Dependencias
Subsistema Fondal TV/mando de celular: asignado a otro desarrollador; no se toca.

## Hallazgos de QA de red (2026-11-06)
- **K7 (reducido):** `campaign-gate.js` estaba desactualizado (flujo de primer minuto) y ahora PASA. `e2e.js 1` (solitario con bots) sigue fallando idéntico en `main`: probable mismo motivo; falta adaptarlo. Hasta entonces la Campaña en solitario completa no está verificada de punta a punta.
- **K8 (medio):** `e2e.js 4` intermitente (`xp.client1_gained`): posible carrera en la sincronización de XP del 4º jugador.
