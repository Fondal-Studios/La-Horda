# B004: diagnóstico de clusters nativos, sin instalar

Nueva fuente del taller, no reemplazo de producción. El componente de caída se valida por separado en PR170; no convierte esta hoja en PASS.

- Base: preflight-v2 del taller anterior. Se conservan31 cuadros RGBA exactos, incluidos9/11/13 y los28 originales que aquel diagnóstico preservó.
- Se redibujaron8/10/20/21/23 con mosquete y bayoneta. Caminata8/10 pasa el detector canónico; ataque20/21/23 sigue marcando ILUSTRACION. Fallos nativos: de5 a3; no hay excepciones ni cambios de umbral.
- Se calibró explícitamente8 a82px de altura total para mantener masa corporal: con81px medía68 frente a71 (4,23%, FIX); con82px mide70 (1,41%). Los demás mantienen81/66/66/66. Geometría de fuente final: PASS, máximo2,90%, pies106. No sustituye escala real del motor.
- Style Gate de familia: PASS. El contrato rechaza correctamente reemplazar los61 cuadros por esta plantilla36. El caballo permanece aparte y sin cambios.
- Segundo intento de ataque: attacks-source.png, binarización de alfa y eliminación de un fragmento diminuto mediante el normalizador existente. Sin filtros de paleta ni estilo. Vuelve a fallar20/21/23; conservar como diagnóstico, no aprobado.
- Revisión de la hoja final/animación completa y runtime: pendiente. La diferencia de postura entre apuntar y el cuadro22 merece revisión en secuencia. No atribuir aprobación al owner.

Reproducir el primer candidato: python3 art-source/entregas/bloques/B004_libertador/revision-native-v2/diagnose.py. La carpeta temporal de salida debe ser nueva. Fuentes generadas con la herramienta integrada, prompts guardados; no se consumió una API de pago configurada por el usuario.

Próximo paso: redibujar únicamente los tres ataques20/21/23 con clusters nativos manteniendo mosquete, masa y apoyo; preservar8/9/10/11/13 y los demás cuadros. Completar contratos especializados y gates del renderer antes de cualquier instalación de esos cuadros.
