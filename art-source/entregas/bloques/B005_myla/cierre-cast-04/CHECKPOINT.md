# B005 Myla — cierre cast 04

Estado: **EN_CORRECCION / FIX / NO_INTEGRAR**.

Se ejecutó el consumidor real en Chromium de GitHub Actions sobre el head 555f922f4a8e7e5b35ad42812f9dd6a21d576ccc. El gate terminó con **122/122 controles PASS**, cero errores de página y cuatro hojas de gameplay: antes/después y seis arenas, en escritorio y móvil, con Base, Merienda Mágica y Yogur de Arándanos.

La corrección del arnés fue reproducible: myla_arandanos usa la clave runtime croma_myla_arandanos; el fixture vigente limpia player.cls.skills[2].cd y no una tabla player.skillCd inexistente. Los dos intentos fallidos quedan en TEST_ATTEMPTS.json.

Revisión visual: el enrutado y la preservación de skins pasan. El VFX circular real y sus tres puntas cubren cabeza/torso en el instante de espalda capturado, por lo que la animación corporal todavía no recibe Art Gate final. No se integra ni publica. Próximo paso: hoja aislada+compuesta de varias fases, después relay/performance aplicables y todos los checks del SHA exacto.
