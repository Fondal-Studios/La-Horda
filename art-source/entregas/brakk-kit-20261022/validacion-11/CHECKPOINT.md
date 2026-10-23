# Brakk — perfil de primer cuadro11 (23/10/2026)

PR197 borrador, rama art/brakk-kit-first-pass-20261022. Parent1329b312d3e1e90bcc99e8109a233ab02f8740da. Recuperaciónad348819f133a7a5c0fbde78e960c8d607f5c4bf. Producción pendiente. Main758aa2ffacaae6542d31776e4a66ea7847a73b1b intacto. Cierre10 recuperado,60entradas de manifiesto verificadas;18checks exactos del head10 SUCCESS. Sin cierre perdido. EN_CORRECCION/NO_INTEGRAR, no merge/publicación.

450JS runtime y5atlas53cuadros sin cambios,0cuadros nuevos. Este bloque añade un perfil reproducible, no una corrección de renderer. Fuentes/atlas/preview anteriores referidos por commit en SOURCE_REFERENCES.json. Mantener estados y cola23.

## Hallazgo

Perfil nativo con espera de assets del equipo real antes de startRun: Bosque,2viewports,120pasos. Frame0 móvil165.3ms=37.6update+127.7render; horizontal190.6ms=39.6update+151render. drawArena38.6/41.4ms; _mipLevel38.9/51.2ms con10/11fallos de caché; champPackFeet Brakk10.7/17.2ms; sfaBake3.7/3.4ms. Tiempos inclusivos anidados, NO sumarlos. Frame1 13.1/16ms yframe2 7.8/8.7ms. La carga inicial se reparte entre escenario, mipmaps, anclajes y actualización; no demuestra una única causa ni el detalle exacto de picos históricos10. No se justifica regenerar53cuadros para resolver este costo.

8controles cobertura/pool/reset PASS; no es gate de rendimiento. No nuevas pruebas de combate/RNG/relay/arte, ni móvil físico/GC. Sin cambio de umbrales.

Primer perfil210.1/207.6ms preservado: esperaba assets de selección inicial antes de cambiar equipo. Final espera grupos Brakk/Tanque/Soporte/Mago como ruta de entrada real; sin esta corrección no atribuir preparación completa. Tanque/Mago usan rutas de sprites base y no requieren CHAMP_PACK[key].ready. Traces incluyen fuentes de imágenes y fallos de caché; wrappers restituidos al finalizar.

## Continuación

Conservar B118/B119 en cola de corrección por legibilidad de cuadrilla. El rendimiento requiere evaluar precálculo acotado durante carga real, aislado desde main y con igualdad de cuadro/estado/RNG y entrada multijugador antes de tocar renderer compartido. Comando exacto en recipe.json; no repetir perfiles sin candidato/pregunta nueva.

Antes de otro bloque se guarda este cierre. Encargo nuevo Bront: conservar concepto imagegen ya mostrado y referencias Bront/Baltra/Brakk en rama separada desde main, sin importar este taller FIX. Concepto aún requiere adaptación de proporciones/detalle y atlas completo antes de gates; preservar Baltra, skins/IDs/mecánicas y originales. Inventario global incompleto.
