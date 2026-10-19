# B004: REDRAW REQUIRED, no instalar

Se conservaron fuentes y resultados. Run39308710546 demuestra36/36 nativos y StyleGatePASS del ensamblado f3a6628465569591fdc6df7a855d768b83c0a481, con28 cuadros originales intactos. Scan: alfa0/255,36islas,0fragmentos,10píxeles marcados como halo (requieren inspección). Ese resultado es técnico y NO aprueba el diseño.

La revisión asistida posterior detectó un error de lectura del kit: las fuentes nuevas de espalda y frontal13 usan sable donde las poses a pie deben conservar el MOSQUETE Y SU BAYONETA. La orientación frontal se corrigió, pero el arma y la continuidad entre fases no. Fuentes revision-back-v1, revision-back-v2 y revision-front13-v1: REDRAW_REQUIRED_WEAPON_CONTINUITY. No son versiones preferidas de producción. No se modificó assets/ del juego.

Además, el renderer real consume fire/reload/bayo_emb/bayo_imp/bayo_rem/cabral/command/ult_cast y el pack montado usa mount/dismount/charge/m_atk/m_run/m_idle. Una plantilla36 sola no puede reemplazar el atlas especial de61cuadros ni la caballería. El diagnóstico incluye un canario estático que rechaza esa pérdida; la fábrica agrega el guard de compatibilidad en PR165.

Próximo paso: recuperar la apariencia actual con mosquete desde assets/sprites/champions/libertador/v2/atlas.png; revisar contrato de js/champions/libertador.js ANTES de generar. Redibujar las poses necesarias con arma correcta o ampliar el atlas existente con las poses faltantes; conservar todos los clips especiales, caballo, skins y cromas. Después repetir nativo/Style/scan, revisión visual a escala de juego, roster, animaciones y snapshots de red. No filtrar la paleta ni agrandar poses solo para satisfacer una heurística.
