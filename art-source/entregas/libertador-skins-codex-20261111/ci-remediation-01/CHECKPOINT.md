# Libertador skins Códice — remediación CI 01

Estado: `EN_CORRECCION / PENDING_CI / NO_INTEGRAR`.

- Producción reconciliada: `82e8d23323a5e045195bd9031b39b5d53bd4721c`.
- Padres: cierre anterior `089063056c0287001c6d516dd668b9f9da43da3d` y `main` fresco `a55f421365fdfa722ca165c98e4ba51bd0220b16`.
- Se regeneró el registro reproducible de arte para los atlas y previews instalados.
- `libertador_escarcha` y `libertador_ancestral` dejaron de figurar como recolores viejos en `ATLAS_VIGENTE`.
- Los idles frontal, perfil y espalda consumen dos cuadros distintos; los ciclos principales conservan cuatro cuadros.
- `ATLAS_ARTE --check`: PASS.
- Contrato estático: PASS, 36 cuadros y 35 sets por skin, alfa binaria, borde 0 y caballos preservados por SHA-256.
- El fallo independiente de lanes del padre se conserva sin cambiar red, compras, balance ni umbrales.

Pendiente: todos los workflows del SHA exacto de cierre deben terminar en verde antes de quitar `FIX/NO_INTEGRAR`, marcar listo o mergear.
