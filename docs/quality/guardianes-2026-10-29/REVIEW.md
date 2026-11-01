# Auditoría de campeones y guardianes — 29/10/2026

Base exacta: `c0a025016e0315b93870f2f4c86abb846619d30e`.

**Clasificación de prioridad, no certificado de arte terminado.** LISTO_CONTROL_TECNICO significa que los controles ejecutados no detectaron fallos; no demuestra calidad Códice, balance, multiplayer integral ni publicación. CON_PENDIENTES incluye limitaciones de evidencia y trabajo ajeno; no implica que todo esté roto. CRITICO identifica fallos reproducidos de ataques que alteran el escenario después de invalidarse su dueño.

43 campeones: 41 PASS y 2 PASS con advertencias. 28 fichas de jefes: 2 alertas de interacción (Tramoyista/Leviatán), ninguna excepción de página. Cobertura del renderer: 141 apariencias, 104 tipos enemigos; no sustituye revisión visual. Los tres fallos de ciclo de vida no eran detectados por el validador general.

Correcciones iniciadas: Mago Gélido (PR236); Guardián Ancestral y Morador (este candidato). 12 fallos/15 casos antes, 15/15 después; incluye `killEnemy`, además de fixtures de eliminación y fin. 29/29 regresiones de ganchos de jefes después. No se modifican daños, tiempos, assets ni motor compartido. No nuevo relay real. No merge ni publicación confirmados para este candidato.

PR236 no se integra: CI `lanes` falló en `compra.objeto_del_invitado_en_la_base` ([0,0]); causa no demostrada. Se conserva el bloqueo, sin rebajar controles.

Conteos: {'CON_PENDIENTES': 30, 'LISTO_CONTROL_TECNICO': 41, 'CRITICO': 3}

| Grupo | Personaje | Prioridad | Evidencia / pendiente |
|---|---|---|---|
| Campeón | Aldric, el Último Bastión (`tanque`) | CON_PENDIENTES | PR232: trabajo ajeno, no duplicar. |
| Campeón | Kael, la Daga Carmesí (`guerrero`) | CON_PENDIENTES | PR232: trabajo ajeno, no duplicar. |
| Campeón | Thalen, el Tejedor Elemental (`mago`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Elyra, la Guardiana del Alba (`soporte`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Segador, el Olvidado (`segador`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Axiom, el Reescritor (`axiom`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Ismara, la Profeta Ciega (`profeta`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Musashi, el Rōnin del Bokken (`musashi`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Sylva, la Cazadora del Bosque (`cazadora`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Ilvar, el Señor de las Criptas (`nigromante`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | San Martín, el Libertador (`libertador`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Ilkan, el Caminante de Dunas (`ilkan`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Ynara, la Médica de los Refugios (`ynara`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Myla, la Niña de la Cuchara (`myla`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Brasa, la Mecánica Fugitiva (`brasa`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Garren, el Eslabón (`eslabon`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Morwen, la Destiladora de Ecos (`morwen`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Tobías, el Farolero (`farolero`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Iria, la Tejedora de Límites (`iria`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Vesper, la Costurera de Sombras (`vesper`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Nahir, el Restaurador de Espejos (`nahir`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Baltra, la Campana Sumergida (`baltra`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Maura, la Pastora de Espinas (`maura`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Dáriel, el Último Compás (`dariel`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Orsa, la Guardacables (`orsa`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Tibor, el Rey sin Corona (`tibor`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Zahra, la Mano de la Válvula (`zahra`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Renko, el Jardinero de Nombres (`renko`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Sira, la Cartógrafa del Regreso (`sira`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Nano GM, el Regente del Umbral (`nano_gm`) | CON_PENDIENTES | PR231 VFX EN_CORRECCION; advertencia de set propio. Preservar taller. |
| Campeón | Facu GM, el Soberano de las Mareas (`facu_gm`) | CON_PENDIENTES | Advertencia de set propio; tooltip largo con versión corta (no fallo crítico). |
| Campeón | Aurelia, la Arquitecta Solar (`aurelia`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Khepri, el Portador del Enjambre (`khepri`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Velmira, la Reina de las Máscaras (`velmira`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Vhal, el Astrónomo Caído (`vhal`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Bront, la Fortaleza Viviente (`bront`) | CON_PENDIENTES | Identidad y conjunto de cuerpo/skins pendientes de reconciliar con Códice; fuentes históricas FIX no equivalen a cuerpo aprobado. |
| Campeón | Oriel, la Portera de las Cicatrices (`oriel`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Saelis, la Heraldo del Plumaje (`saelis`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Solciju, la Enóloga (`solciju`) | LISTO_CONTROL_TECNICO | Sin fallos en validador de habilidades/registro y muestras del cuerpo. Calidad integral Códice pendiente de revisión individual. |
| Campeón | Veyra, la Última Herida (`veyra`) | CON_PENDIENTES | PR233: cuerpo del Códice EN_CORRECCION, no instalado. |
| Campeón | Brakk, el Arquitecto del Fin (`brakk`) | CON_PENDIENTES | PR232: fuentes ajenas, no duplicar. |
| Campeón | Morveth, el Jardinero de la Peste (`morveth`) | CON_PENDIENTES | PR232: fuentes ajenas, no duplicar. |
| Campeón | Aelith, la Ladrona de Segundos (`aelith`) | CON_PENDIENTES | PR232: trabajo ajeno, no duplicar. |
| Jefe/subjefe | El Presentador (`cm_presentador`) | CON_PENDIENTES | Validador PASS*; arte declarado FIX. Faltan revisión visual/fases o interacción específica según ficha. |
| Jefe/subjefe | Maestro de Ceremonias (`cm_maestro`) | CON_PENDIENTES | Validador PASS; arte declarado FIX. Faltan revisión visual/fases o interacción específica según ficha. |
| Jefe/subjefe | El Tramoyista (`cm_tramoyista`) | CON_PENDIENTES | Validador FIX; arte declarado FIX. Interacción automática no observada: investigar reproducción, no se confirma bug de combate. |
| Jefe/subjefe | La Dama del Telón (`cm_dama`) | CON_PENDIENTES | Validador PASS*; arte declarado FIX. Faltan revisión visual/fases o interacción específica según ficha. |
| Jefe/subjefe | Dragón de la Forja (`dragon_forja`) | CON_PENDIENTES | Validador PASS; arte declarado FIX. Faltan revisión visual/fases o interacción específica según ficha. |
| Jefe/subjefe | El Caballero de la Armadura Oxidada (`caballero`) | LISTO_CONTROL_TECNICO | Sin fallos en pelea automatizada y ficha. No aprobación visual nueva ni certificación completa. |
| Jefe/subjefe | Doppelgängers (`doblador_guerrero`) | LISTO_CONTROL_TECNICO | Sin fallos en pelea automatizada y ficha. No aprobación visual nueva ni certificación completa. |
| Jefe/subjefe | Guardián Ancestral Corrompido (`guardian_ancestral`) | CRITICO | Muros y zonas nacen después de morir o retirar al jefe. Corregido en candidato; 10 casos pasan. |
| Jefe/subjefe | Micelio Primigenio (`micelio`) | CON_PENDIENTES | Validador PASS; arte declarado FIX. Faltan revisión visual/fases o interacción específica según ficha. |
| Jefe/subjefe | La Madre Espora (`madre_espora`) | CON_PENDIENTES | Validador PASS*; arte declarado PASS. Faltan revisión visual/fases o interacción específica según ficha. |
| Jefe/subjefe | Mago de Hielo y Cristal (`mago_hielo_cristal`) | CRITICO | Congelación pendiente sobrevive a interrupción/muerte. Corrección PR236, CI lanes falla; sin merge. |
| Jefe/subjefe | Demonio Gélido — Ángel Caído (`angel_caido_hielo`) | CON_PENDIENTES | Validador PASS*; arte declarado PASS. Faltan revisión visual/fases o interacción específica según ficha. |
| Jefe/subjefe | Tundraverx, Soberano de Hielo (`dragon_hielo`) | LISTO_CONTROL_TECNICO | Sin fallos en pelea automatizada y ficha. No aprobación visual nueva ni certificación completa. |
| Jefe/subjefe | Kraken Joven (`kraken_joven`) | CON_PENDIENTES | Validador PASS; arte declarado FIX. Faltan revisión visual/fases o interacción específica según ficha. |
| Jefe/subjefe | Leviatán (`leviatan`) | CON_PENDIENTES | Validador FIX; arte declarado FIX. Interacción automática no observada: investigar reproducción, no se confirma bug de combate. |
| Jefe/subjefe | Guardián del Laberinto (`guardian_laberinto`) | LISTO_CONTROL_TECNICO | Sin fallos en pelea automatizada y ficha. No aprobación visual nueva ni certificación completa. |
| Jefe/subjefe | Minotauro (`minotauro`) | CON_PENDIENTES | Validador PASS*; arte declarado FIX. Faltan revisión visual/fases o interacción específica según ficha. |
| Jefe/subjefe | El Carcelero del Vacío (`ab_carcelero`) | CON_PENDIENTES | Validador PASS; arte declarado FIX. Faltan revisión visual/fases o interacción específica según ficha. |
| Jefe/subjefe | El Que Mora Debajo (`ab_morador`) | CRITICO | Fragmentos dañan plataformas tras morir/finalizar encuentro. Corregido en candidato; 5 casos pasan. |
| Jefe/subjefe | Titán de Piedra (`mn_titan`) | CON_PENDIENTES | Validador PASS; arte declarado FIX. Faltan revisión visual/fases o interacción específica según ficha. |
| Jefe/subjefe | Cerbero, Guardián del Umbral (`mn_cerbero`) | CON_PENDIENTES | Validador PASS; arte declarado FIX. Faltan revisión visual/fases o interacción específica según ficha. |
| Jefe/subjefe | Esqueleto Cornudo (Guardián de la Horda) (`esqueleto_h`) | LISTO_CONTROL_TECNICO | Sin fallos en pelea automatizada y ficha. No aprobación visual nueva ni certificación completa. |
| Jefe/subjefe | Demonio Menor (Guardián de la Horda) (`demonio_menor`) | LISTO_CONTROL_TECNICO | Sin fallos en pelea automatizada y ficha. No aprobación visual nueva ni certificación completa. |
| Jefe/subjefe | El Hechicero Supremo (`hechicero_supremo`) | LISTO_CONTROL_TECNICO | Sin fallos en pelea automatizada y ficha. No aprobación visual nueva ni certificación completa. |
| Jefe/subjefe | El Ángel Corrompido (forma 1) (`angel_corrompido`) | CON_PENDIENTES | Validador PASS; arte declarado FIX. Faltan revisión visual/fases o interacción específica según ficha. |
| Jefe/subjefe | Gólem de Cuerpos (forma 2) (`golem_cuerpos`) | CON_PENDIENTES | Validador PASS*; arte declarado FIX. Faltan revisión visual/fases o interacción específica según ficha. |
| Jefe/subjefe | Rey de la Horda (forma final) (`demonio_mayor`) | CON_PENDIENTES | Validador PASS*; arte declarado FIX. Faltan revisión visual/fases o interacción específica según ficha. |
| Jefe/subjefe | Jinete Sin Cabeza (`jinete_sin_cabeza`) | CON_PENDIENTES | Validador PASS*; arte declarado PASS. Faltan revisión visual/fases o interacción específica según ficha. |

## Reproducción

`NODE_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules CHROMIUM_PATH=/tmp/chromium node tools/regression/t_guardian_delayed_lifecycle.js`

Con `BASELINE=c0a025016e0315b93870f2f4c86abb846619d30e` sirve los dos scripts originales antes de cargar el juego y reproduce los fallos. `REPORT=/ruta/salida.json` conserva resultados.

Siguiente: comprobar CI exacto, investigar fallo de compra de PR236 sin alterar economía por suposición; completar validación visual Códice en orden inverso respetando PR232/233. PR231 intacta.

## Variantes adicionales del registro

| Variante | Prioridad | Pendiente |
|---|---|---|
| Doppelgänger — Arquera (`doblador_arquera`) | CON_PENDIENTES | Cuerpo incluido en cobertura; falta ficha y validación individual del encuentro. No se confirma fallo. |
| Doppelgänger — Pícaro (`doblador_picaro`) | CON_PENDIENTES | Cuerpo incluido en cobertura; falta ficha y validación individual del encuentro. No se confirma fallo. |
| Doppelgänger — Clérigo (`doblador_clerigo`) | CON_PENDIENTES | Cuerpo incluido en cobertura; falta ficha y validación individual del encuentro. No se confirma fallo. |
