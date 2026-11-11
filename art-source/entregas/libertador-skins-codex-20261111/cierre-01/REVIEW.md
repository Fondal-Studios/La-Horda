# REVIEW — Libertador skins Códice, cierre 01

**Resultado local: PASS_COMPONENT / PENDING_CI**

Referencia obligatoria: `assets/ui/codex/champions/libertador.png`.

- Casaca de los Andes mantiene el rostro y proporciones de San Martín, bicorne con piel, poncho claro con guarda roja, azul de la bufanda y arma larga. Frente, perfil, espalda, ataque, habilidades y caída no comparten la misma pose.
- Guardia del Monte mantiene sombrero y pluma, verde de campaña, capa/morral y arma larga. La silueta es distinta de Casaca y de la apariencia base.
- Las reacciones sueltas de los cuadros 15, 19, 31 y 32 se retiraron desde la fuente conservando el componente corporal mayor; los dos intentos descartados están preservados.
- Los atlas finales son 448×1008, 4 columnas × 9 filas, 36 cuadros únicos, alfa binaria y bordes limpios.
- La captura pareada cambia únicamente el atlas de la skin dentro del mismo renderer y estado. Las ocho comparaciones cubren las dos skins, Bosque/Ruinas, Hielo/Gélida, escritorio y móvil.
- Los 6.638 controles del catálogo confirman carga, estados, equipamiento, loadout remoto, estadísticas inmutables y dibujo real. Los 261 controles de movimiento confirman el cuerpo especializado y la montura preservados.

No se cambió balance, mecánicas, cuentas, pagos, infraestructura, caballo, Granadero ni otros campeones. El componente no se declara integrado hasta CI y merge del SHA exacto.
