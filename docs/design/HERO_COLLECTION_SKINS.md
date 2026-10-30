# La Horda — clasificación de apariencias

Propuesta asociada a [Héroes coleccionables](HERO_COLLECTION.md). Los IDs se obtuvieron ejecutando los módulos de registro del repositorio; no se realizó una auditoría visual. **82 skins/cromas registrados vinculados a héroes y 16 conceptos pendientes**, listados por separado. Un registro no certifica calidad ni disponibilidad del arte. El JSON contiene los requisitos exactos.

Las 15 manifestaciones universales de Lucifer, Glaciar, Coloso, Tempestad y Alba (base, astral y consagrada), definidas en `js/assets/mythic-collection-meta.js` con `champ:null`, quedan en su colección de equipamiento existente. No se asignan a un héroe ni se cuentan en estas 82 referencias. Se preservan sus requisitos de set y adquisición actuales.

## Registros existentes

Todas las rutas exigen poseer el héroe. `coleccion`: cuatro piezas de su set. `maestria`: victorias del héroe según la condición de la fila. `hazana`: nivel 30 + ganar la Infernal con ese héroe. Las compras de cosméticos existentes se preservan como vía alternativa; no se modifica el equipo.

| Héroe | Apariencia | ID / registro | Ruta | Condición |
|---|---|---|---|---|
| Aelith | Aelith, Relojera del Vacío | `CROMA_SKINS:aelith_alt1` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Aelith | Segundo Carmesí | `CROMA_SKINS:aelith_croma` | maestria | Ganá 3 arenas de campaña con este héroe. Tienda como vía alternativa. |
| Aelith | Custodia del Mediodía | `SET_SKINS:quality_aelith` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Axiom | Axiom, Código Ámbar | `CROMA_SKINS:axiom_piedra` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Axiom | Axiom, Realidad Corrupta | `SET_SKINS:sistema` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Baltra | Baltra — Ceniza del Alba | `CROMA_SKINS:baltra_croma` | maestria | Ganá 3 arenas de campaña con este héroe. Tienda como vía alternativa. |
| Baltra | Campanero de la Catedral | `CROMA_SKINS:baltra_skin` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Baltra | Festival de los Ausentes | `SET_SKINS:exp_baltra` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Brakk | Brakk, Arquitecto Glacial | `CROMA_SKINS:brakk_alt1` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Brakk | Acero de Tormenta | `CROMA_SKINS:brakk_croma` | maestria | Ganá 3 arenas de campaña con este héroe. Tienda como vía alternativa. |
| Brakk | Ingeniero del Abismo | `SET_SKINS:quality_brakk` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Brasa | Brasa, Calderera de las Profundidades | `CROMA_SKINS:brasa_abisal` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Brasa | Maquinista de la Caldera | `SET_SKINS:ultimo_turno` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Sylva (Cazadora) | Sylva, Manto de Escarcha | `CROMA_SKINS:cazadora_escarcha` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Sylva (Cazadora) | Sylva, Flecha de Fuego | `SET_SKINS:manada` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Dáriel | Dáriel — Ceniza del Alba | `CROMA_SKINS:dariel_croma` | maestria | Ganá 3 arenas de campaña con este héroe. Tienda como vía alternativa. |
| Dáriel | Dáriel, Luthier de los Autómatas | `CROMA_SKINS:dariel_luthier` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Dáriel | Director del Réquiem | `CROMA_SKINS:dariel_skin` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Dáriel | Carnaval de Medianoche | `SET_SKINS:exp_dariel` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Eslabón | Garren, Campanero de Porcelana | `CROMA_SKINS:eslabon_porcelana` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Eslabón | Carcelero de Puertas Abiertas | `SET_SKINS:juramento_roto` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Farolero | Farolero, Guardavía de Medianoche | `CROMA_SKINS:farolero_guardavia` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Farolero | Vigía de la Última Expedición | `SET_SKINS:lumbre_persistente` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Kael | Asesino, Jack el Destripador (Caballero Carmesí) | `SET_SKINS:nocturno` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Ilkan | Ilkan, Caravana de Medianoche | `SET_SKINS:legion` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Iria | Tejedora de los Tres Caminos | `SET_SKINS:hilo_umbral` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Libertador | El Libertador, Guardia del Monte | `CROMA_SKINS:libertador_ancestral` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Libertador | El Libertador, Casaca de los Andes | `CROMA_SKINS:libertador_escarcha` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Libertador | Granadero del Alba | `SET_SKINS:granadero` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Thalen | Mago, Ángel Arcano (Arcángel Luminar) | `SET_SKINS:convergencia` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Maura | Maura — Ceniza del Alba | `CROMA_SKINS:maura_croma` | maestria | Ganá 3 arenas de campaña con este héroe. Tienda como vía alternativa. |
| Maura | Rosa del Luto | `CROMA_SKINS:maura_skin` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Maura | Pastora Invernal | `SET_SKINS:exp_maura` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Morveth | Morveth, Micelio Abisal | `CROMA_SKINS:morveth_alt1` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Morveth | Musgo del Retorno | `CROMA_SKINS:morveth_croma` | maestria | Ganá 3 arenas de campaña con este héroe. Tienda como vía alternativa. |
| Morveth | Huerto de Sal | `SET_SKINS:quality_morveth` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Morwen | Morwen, Herbolaria de Escarcha | `CROMA_SKINS:morwen_escarcha` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Morwen | Destiladora del Silencio | `SET_SKINS:vidrio_negro` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Musashi | Musashi, Hoja de Jade | `CROMA_SKINS:musashi_ancestral` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Musashi | Musashi, Samurái Legendario | `SET_SKINS:errante` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Myla | Myla — Yogur de Arándanos | `CROMA_SKINS:myla_arandanos` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Myla | Myla — Pastelera de Medianoche | `SET_SKINS:merienda_magica` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Nahir | Nahir — Ceniza del Alba | `CROMA_SKINS:nahir_croma` | maestria | Ganá 3 arenas de campaña con este héroe. Tienda como vía alternativa. |
| Nahir | Obsidiana Real | `CROMA_SKINS:nahir_skin` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Nahir | Vitral del Réquiem | `SET_SKINS:exp_nahir` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Nigromante | Nigromante, Sudario de Escarcha | `CROMA_SKINS:nigromante_escarcha` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Nigromante | Nigromante, Sepulturero de Ámbar | `CROMA_SKINS:nigromante_piedra` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Nigromante | Rey Sin Tumba | `SET_SKINS:requiem` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Orsa | Orsa — Ceniza del Alba | `CROMA_SKINS:orsa_croma` | maestria | Ganá 3 arenas de campaña con este héroe. Tienda como vía alternativa. |
| Orsa | Cazadora de Leviatanes | `CROMA_SKINS:orsa_skin` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Orsa | Trueno Carmesí | `SET_SKINS:exp_orsa` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Profeta | La Profeta, Velo del Bosque | `CROMA_SKINS:profeta_ancestral` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Profeta | La Profeta, Ángel Caído (Doncella Oscura) | `SET_SKINS:profecia` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Renko | Renko — Ceniza del Alba | `CROMA_SKINS:renko_croma` | maestria | Ganá 3 arenas de campaña con este héroe. Tienda como vía alternativa. |
| Renko | Marmolista Real | `CROMA_SKINS:renko_skin` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Renko | Enterrador del Desierto | `SET_SKINS:exp_renko` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Segador | Segador, Filo de Escarcha | `CROMA_SKINS:segador_escarcha` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Segador | Segador, Leónidas (Rey de Esparta) | `SET_SKINS:marea` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Sira | Sira — Ceniza del Alba | `CROMA_SKINS:sira_croma` | maestria | Ganá 3 arenas de campaña con este héroe. Tienda como vía alternativa. |
| Sira | Atlas Astral | `CROMA_SKINS:sira_skin` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Sira | Cartógrafa Corsaria | `SET_SKINS:exp_sira` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Solciju | Solciju, Viuda de Medianoche | `CROMA_SKINS:solciju_alt1` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Solciju | Añada Esmeralda | `CROMA_SKINS:solciju_croma` | maestria | Ganá 3 arenas de campaña con este héroe. Tienda como vía alternativa. |
| Solciju | Vendimiadora del Asedio | `SET_SKINS:quality_solciju` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Elyra | Sanadora, Ángel del Alba (Forma Celestial) | `SET_SKINS:custodio` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Aldric | Tanque, Bastión Ancestral | `CROMA_SKINS:tanque_ancestral` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Aldric | Tanque, Paladín del Juicio | `CROMA_SKINS:tanque_juicio` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Aldric | El Último Juramento | `SET_SKINS:baluarte` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Tibor | Tibor — Ceniza del Alba | `CROMA_SKINS:tibor_croma` | maestria | Ganá 3 arenas de campaña con este héroe. Tienda como vía alternativa. |
| Tibor | Señor de las Polillas | `CROMA_SKINS:tibor_skin` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Tibor | Colmena de Ámbar | `SET_SKINS:exp_tibor` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Vesper | Vesper — Ceniza del Alba | `CROMA_SKINS:vesper_croma` | maestria | Ganá 3 arenas de campaña con este héroe. Tienda como vía alternativa. |
| Vesper | Sastre de la Corte Muerta | `CROMA_SKINS:vesper_skin` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Vesper | Costurera de Espantapájaros | `SET_SKINS:exp_vesper` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Veyra | Veyra, Verdugo Celestial | `CROMA_SKINS:veyra_alt1` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Veyra | Herida Amatista | `CROMA_SKINS:veyra_croma` | maestria | Ganá 3 arenas de campaña con este héroe. Tienda como vía alternativa. |
| Veyra | Cicatriz de Obsidiana | `SET_SKINS:quality_veyra` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Ynara | Ynara — Guardia Celeste | `CROMA_SKINS:ynara_celeste` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Ynara | Ynara — Guardiana del Santuario | `SET_SKINS:santa_paciencia` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |
| Zahra | Zahra — Ceniza del Alba | `CROMA_SKINS:zahra_croma` | maestria | Ganá 3 arenas de campaña con este héroe. Tienda como vía alternativa. |
| Zahra | Horno de Porcelana | `CROMA_SKINS:zahra_skin` | hazana | Nivel 30 del héroe y una victoria en la Infernal con ese mismo héroe. Tienda como vía alternativa. |
| Zahra | Corazón Volcánico | `SET_SKINS:exp_zahra` | coleccion | Desbloqueá al héroe y reuní las cuatro piezas distintas de su set; la apariencia queda permanente. |

## Conceptos pendientes: no entregar aún

El registro actual de estas variantes indica `GENERATED_PENDING_REVIEW`. La clasificación no cambia ese estado ni los incluye como premios disponibles.

| Héroe | Concepto | ID | Ruta prevista |
|---|---|---|---|
| Nano GM | Regente del Eclipse Dorado | `nano_gm_alt1` | fundador |
| Facu GM | Soberano de la Fosa | `facu_gm_alt1` | fundador |
| Aurelia | Vitral del Mediodía | `aurelia_alt1` | coleccion |
| Aurelia | Catedral Corrupta | `aurelia_alt2` | hazana |
| Khepri | Escarabajo de Lapislázuli | `khepri_alt1` | coleccion |
| Khepri | Plaga de Ceniza | `khepri_alt2` | hazana |
| Velmira | Mascarada Veneciana | `velmira_alt1` | coleccion |
| Velmira | Reina del Réquiem Blanco | `velmira_alt2` | hazana |
| Vhal | Eclipse Anular | `vhal_alt1` | coleccion |
| Vhal | Nebulosa Carmesí | `vhal_alt2` | hazana |
| Bront | Bastión de Bronce Ritual | `bront_alt1` | coleccion |
| Bront | Coloso de Hielo Negro | `bront_alt2` | hazana |
| Oriel | Llavera del Alba | `oriel_alt1` | coleccion |
| Oriel | Guardiana del Ojo Rojo | `oriel_alt2` | hazana |
| Saelis | Heraldo del Ocaso | `saelis_alt1` | coleccion |
| Saelis | Heraldo de la Aurora Boreal | `saelis_alt2` | hazana |
