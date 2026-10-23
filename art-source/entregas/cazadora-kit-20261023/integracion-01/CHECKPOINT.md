# Cazadora · integración de carga · 23/10/2026

Componente de carga VALIDADO localmente / pendiente CI e integración. Cero atlas nuevos; siete PNG de raíces/lluvia ya existen y están conectados. B126/B127/B128/B014 NO se cierran completos.
Base817610a78595e894995cec8032dd64149dbfe925. Rama fix/cazadora-vfx-loading-20261023. Recuperaciónbc360d07cdd32027125a84e06b8b45f33655de96. Brasa PR203 cierre íntegro; no trabajo Cazadora concurrente en15PR abiertos.

El renderer antes comprobaba sólo f1. Con f2 fallido intenta dibujar una imagen rota (cuatro InvalidStateError en dos viewports); si f1 falla, omite imágenes posteriores disponibles. Selección nueva: fase pedida o anterior cargada, nunca futura. Sin imagen conserva el fallback mecánico original. Tres fuentes runtime, sin mecánicas, protocolo, balance, cuerpo, skins o fuentes de arte modificados.

56 controles PASS tras14FAIL del parent;14PNG completos idénticos.36escenas6arenas×3apariencias×2viewports,144comparaciones A/B/A de los consumidores sobre mismo fondo y fase:144PASS.24sceneHash precast idénticos;69/72PNG entre sesiones idénticos, tres Manada/trampa horizontal difieren sin raíz demostrada (conservados); no se declara esa matriz perfecta.360frames,28982RNG y estado resumido igual, no snapshot completo/aislamiento global.

Relay real hostSolciju/invitadoCazadora táctil con setManada:7PASS, lluviafase2 usa f2 enhost/f1 eninvitado con petición fallida; recuperación restaura f2. Primerintento6/7 consultó stats antes del keyframe, conservado; espera de estado añadida manteniendo assert, sin runtime adicional.

REVIEW PASS sólo para carga/fallback con originales. El kit conserva composición legacy pendiente (haz superpuesto y sello genérico en lluvia); no se importa ningún taller FIX. Cola común31 histórica se referencia en Brasa5f0c1e38453756deb4cd6ca4b17723355f44d3c1 sin alterar estados de arte. Publicación NO verificada.

Reanudar: consultar head/CI/PR frescos, comprobar diff y merge normal con expected_head_sha si todos checks/workflows aplicables pasan. Si no, conservar este checkpoint. Después auditar Dariel B129/B130/B131; B015/UF/cuerpo/básico/B436/ex_concertB484 no son faltantes por conteo. No repetir primeras pasadas Brasa/Baltra/Bront/Brakk; correcciones agrupadas posteriores. Comandos en recipe.json. Inventario global incompleto.
