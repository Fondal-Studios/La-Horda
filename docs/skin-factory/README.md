# Premium Skin Factory (Agente I · Beta)

Rama: `feature/beta-premium-skins` · Estado: **auditoría + catálogo + diseño completos; assets artísticos NO producidos**. Nada se fusionó a `main`.

## Resultado honesto
| Entregable pedido | Estado | Evidencia |
|---|---|---|
| Inventario verificable de faltantes y defectos | **Hecho** | `tools/skin-factory/inventory.js` → `docs/skin-factory/inventory.json` |
| Catálogo cosmético desacoplado (Estándar/Épica/Legendaria/Packs, previsualización, comparación, equipamiento de prueba, compras simuladas) | **Hecho** | `js/systems/cosmetic-catalog.js`, `tools/skin-factory/t_catalog.js` (PASS, 56 comprobaciones) |
| 3 skins premium: ficha de identidad, historia, especificación de FX | **Hecho (texto)** | `docs/skin-factory/dossiers.md`, `manifests/*.json` |
| 3 skins premium: concept art, sprite/atlas, animaciones, FX pintados, ícono, tarjeta comercial, captura en juego | **NO producidos** | `node tools/skin-factory/score.js` → `NOT_PRODUCED`, nota `null` |
| Evaluación artística 90/100 | **No aplicable** | Sin assets no hay nada que puntuar; la herramienta se niega a inventar notas |

**Bloqueo:** la sesión autónoma no genera ni pinta imágenes. Las skins del Códice son arte pintado (atlas de 8 columnas + paneles de FX en `skin-fx-meta.js`); fabricar recolores procedurales sería precisamente lo que `docs/skins-audit/README.md` ya reemplazó por ser "recolor puro". No se declara ninguna skin terminada.

## Inventario (sobre `main` @ e194910b)
- 43 campeones, 48 apariencias: 33 skins con atlas propio, 15 crómas (**sin atlas propio**, recolor/paleta sobre el cuerpo base). Rarezas: 33 Épica, 15 Rara. **Cero Legendarias.**
- Defectos críticos: **0** (todas las vistas previas y atlas existen en disco; ancho de atlas = columnas × ancho de cuadro).
- 15 apariencias sin atlas propio (defecto de calidad frente al Códice): `*_croma` de solciju, brakk, veyra, morveth, aelith, vesper, nahir, baltra, maura, dariel, orsa, tibor, zahra, renko, sira.
- 21 skins con atlas pero sin cuadros propios de correr (observación; el motor usa perfil/caminar).
- Campeones **sin ninguna apariencia**: guerrero, mago, soporte, ilkan, iria, nano_gm, facu_gm, aurelia, khepri, velmira, vhal, bront, oriel, saelis. (`guerrero`/`mago`/`soporte` pueden tener skins de set por otro canal que `CROMA_SKINS`: no se auditó ese canal.)
- No hay datos de popularidad en el repositorio (`grep` de pick-rate/popularidad: nada). **La priorización por "popular" no tiene evidencia**; se usó la disponible: cero apariencias + silueta distintiva (Ilkan), apariencia única con arma icónica (Segador, Musashi).

## Skins elegidas (DISEÑO)
Ilkan, Ceniza de Oasis (Legendaria) · Segador, Cosecha Hueca (Legendaria) · Musashi, Dos Lunas (Épica). Detalle en `dossiers.md`. Restricciones cosméticas fijadas en cada manifiesto (sin estadísticas, daño, alcance, hitbox ni cooldown).

## Catálogo y monetización simulada
- Solo lee `CROMA_SKINS`/`CLASSES`. No lee ni escribe `save`, oro, brasas, relay ni cuentas (la prueba compara el guardado antes/después).
- Compras: moneda de prueba `TEST`, recibo `simulated:true`, estado en `sessionStorage["cosmetic_sandbox_v1"]`. Adaptador de pago real reservado (`setCheckoutAdapter`), sin invocar.
- Comparación incluye sello de estadísticas por campeón: idéntico para toda skin del mismo campeón (anti pay-to-win verificado).
- **No integrado en la tienda real** (`index.html` y `js/ui/shop-*.js` no se tocaron). Línea requerida para el integrador: `<script src="js/systems/cosmetic-catalog.js"></script>`.
- Precios del catálogo: los de `CROMA_SKINS`; los packs (−15 %) son **precios simulados**, no una decisión de Economía V2.

## Flujo de calidad
Auditoría (inventory.js) → Diseño (dossiers) → Producción (**bloqueada**) → QA (`score.js`) → Aprobación/Reconstrucción → Arquitectura. Ningún productor aprueba su trabajo: `score.js` deja `approved:false` y exige evaluador independiente. Tras 3 intentos fallidos se escala al arquitecto (S0C); hoy hay 0 intentos de producción.

## Siguiente paso necesario (decisión del dueño)
Pintar los assets de las 3 skins con el flujo de `docs/production/PAINTER.md` / `tools/factory`, llenar `manifests/*.json` y pasar a `READY_FOR_QA`. Hasta entonces el catálogo no ofrece ninguna Legendaria.

## Coordinación con S0C (verificado al cierre)
- Existe `claude/s0c-arquitectura-beta` y la rama de integración `beta/integracion` (con S0A ya dentro). Este PR apunta a **`beta/integracion`**, nunca a `main`.
- `ownership.json` de S0C define agentes A (economía), B (persistencia), C (telemetría/QA) y D (UI/arte); **no existe un paquete "I"**: los archivos de este PR (`js/systems/cosmetic-catalog.js`, `tools/skin-factory/**`, `docs/skin-factory/**`) son nuevos y no pisan a nadie, pero el arquitecto debe asignarles dueño. Afinidad natural: agente D; el contrato `ArtAsset`/`ChampionSelection` de S0C no se usó todavía (el catálogo lee `CROMA_SKINS` directamente) → alinear cuando S0C se integre.
- No se corrió `tools/agents/check-diff.js` (no está en esta base). Pendiente de correr al integrar.
