# Recuperación de arte ya generado — 29/30 de octubre de 2026

## Cierre del bloque de campeones

Se recuperan los cuerpos de **Aldric/tanque, Kael/guerrero, Aelith y Morveth**, 36 cuadros por campeón (144 en total), de la rama `feature/fondal-art-engine` en `e00ba6b0854ae6ca8871da24c84c7206d7c3f23a`. El bloque de administración y generación de PR232 queda fuera de esta integración. Las hojas existentes se compararon visualmente con los sprites pequeños de `assets/ui/codex/champions/` y con el motor real.

Las cuatro apariencias base se registran en `CODEX_GAMEPLAY_ART`, se precargan y se dibujan en `drawHeroBody` y `drawChampPackDeath`. No hay cambios de estadísticas, colisiones o habilidades. Las skins conservan sus atlas. El arte anterior sigue como respaldo. Se corrige además la invisibilidad transitoria cuando el atlas nuevo ya está listo pero el antiguo sigue descargándose.

| Campeón | Referencia conservada | Estados |
|---|---|---|
| Aldric | Cabello castaño, armadura y capa azul, espada y escudo | caminar/ataque frente-perfil-espalda, cast, impactos, muerte |
| Kael | Capucha y bufanda carmesí, dagas | mismos 36 cuadros, celdas de 144 px para no cortar armas |
| Aelith | Cabello marfil, piel oscura, vestimenta turquesa, reloj/escudo dorado | mismos 36 cuadros |
| Morveth | Sombrero de hongos naranja, máscara de hueso, hoz, follaje | mismos 36 cuadros; extracción reproducible de fuente existente |

Veyra se integró por separado mediante **PR240**, 112 cuadros, merge `6edcd9bce3d2d3cc77578e6d13a394d05b9c5eb6`. Ilkan (PR235), Musashi/Sylva/Ilvar (PR238) y NanoGM ya estaban en main: no se reemplazan por variantes viejas de la colección.

## Evidencia

- `calibration.json`: masa corporal y pies conservados frente a la apariencia anterior; sin ajuste manual de hitbox.
- `native.json`: los 144 cuadros pasan el detector canónico sin modificar, en las cuatro direcciones y a la escala efectiva del renderer.
- `codex-runtime/runtime.json`: estados, muerte, apariencias equipadas, respaldo y snapshots decodificados; sin mutaciones de gameplay por dibujo.
- `roster.json`: 141 apariencias, cero fallos de escala, presentación o JavaScript.
- `online/online.json`: cuatro partidas con relay real local; anfitrión de escritorio e invitado móvil. Los tres inputs de habilidad llegan al anfitrión y ambos clientes dibujan el atlas recuperado.
- Regresiones de respaldo: tanque muerte 135, tanque impacto 234, guerrero muerte 133 comprobaciones; siete pruebas del importador aprobadas. Se mantiene la cobertura del arte anterior explícitamente, mientras el nuevo tiene su workflow propio.
- Revisión visual: hojas completas, contacto de estados y capturas de partida. Siluetas, paleta, pies, recortes y continuidad aceptados para este bloque. Es una revisión de componente; no una aprobación genérica de toda la fábrica.

## Recuperación y pendientes explícitos

`recovered-files.json` inventaría 109 archivos recuperados (86 imágenes y 23 ZIP con 2544 entradas de imagen). 46 hojas coinciden por SHA-256 con fuentes del repositorio. Coincidencia de fuente **no equivale a integración**; tampoco un SHA diferente demuestra un asset faltante. Se revisaron contactos de fuentes y muestras de los ZIP. Los originales no se duplican en el repo.

- **Brakk, hoja nueva de PR232:** FIX. Se detectan 35 siluetas separadas para un contrato de 36; dos poses están unidas. Se conserva el cuerpo actual. Fuente recuperable en `art-source/fondal/brakk-codex/` de esa rama.
- **Axiom, 12 poses de PR239:** FIX_NOT_APPROVED en su entrega original. Locomoción parcial, sin cierre de componente. No sobrescribe el cuerpo vigente.
- **NanoGM H1/H3, PR231:** continúa FIX por grosor/cobertura del haz; cuerpo NanoGM ya integrado.
- **Variantes antiguas, recortes y VFX:** hay recortes con texto/fondo, vecinos truncados y diseños anteriores al Códice. Los 2544 archivos internos no se presentan como 2544 assets nuevos aprobados. Las hojas con invocaciones o VFX necesitan revisión por componente; esta recuperación no aprueba paquetes completos por asociación.
- `docs/production/CORRECTION_BATCH.json` mantiene su historia de VFX pendientes; el presente registro evita confundir aquellas entregas de taller con cuerpos ya instalados.

## Publicación canónica

`publication.json` es una comprobación HTTP/SHA-256 de `https://fondalstudios.com/la-horda/jugar/`. En esta revisión el sitio sigue sin servir los atlas nuevos (404), incluso los ya mergeados de Ilkan y PR238. La integración en main no acredita publicación. La infraestructura oficial es Fondal/Fly.io; los servicios Render consultados pertenecen a otra rama/instalación y no se han usado para sustituir el sitio canónico. Falta acceso operativo al despliegue de Fondal. No se reinició el relay ni se tocaron cuentas.
