# B005 Myla — cierre completo 08

Estado del componente: **VALIDADO / PENDIENTE_CI_FINAL**. La corrección visual aprobada en cierre 07 conserva la burbuja normal fuera del cast y, durante el lanzamiento Códice, la mueve detrás del cuerpo y abre su aro para recuperar cabeza, torso y cuchara. No cambia escudo, TTL, daño, duración, balance, protocolo de red, skins ni Berrinche.

Referencia exacta: `assets/ui/codex/champions/myla.png`. Fuente preservada: `art-source/entregas/bloques/B005_myla/revision-cast-back-03/cast.png`, SHA-256 `1069b0085e3bae9854357869aaae4ebd875074623ccd6d0af4bd061a15d41110`.

Gates nuevos del head `bcc408976518220db8b0c9dbea2cf8fd12cfed0f`: run `44437125511`, job `135268690217`, artifact `14489349009`, digest `sha256:716b303d410bd77e9a840bcf0749cff9cf8986bd28dd94e7ec21780ac873cabd`, SUCCESS. Relay real Tanque anfitrión/Myla invitada táctil: cuatro estados PASS; ambos pares muestran `.64/g/88/-8` durante cast y `.8/t/68/-12` después, con escudo vivo y cero errores. Rendimiento: cuatro corridas independientes de 360 frames, 340 muestras útiles, 361 clears por corrida; p95 2.2–2.6 ms, máximos 4.6–10.7 ms, cero errores. Es JS local, no GPU/GC aislado ni móvil físico y no crea umbral nuevo.

La matriz visual anterior sigue vigente: A/B exacto 194/194 PASS, seis arenas, escritorio/móvil, base/Merienda/Arándanos, sparse/dense y Berrinche. El diff completo se auditó: sólo B005 Myla, sus fuentes/evidencia, el atlas instalado, consumidores Myla y registros generados; el PR309 concurrente trata enemigos/jefes y no se importó.

El workflow temporal se elimina. Próximo paso: comprobar todos los workflows aplicables del head final limpio. Sólo con ese SHA verde se puede quitar FIX/NO_INTEGRAR, marcar listo y mergear normalmente con `expected_head_sha`; después verificar PR/ref/main y publicación por separado.
