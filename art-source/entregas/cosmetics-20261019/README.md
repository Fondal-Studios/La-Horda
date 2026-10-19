# Cuatro skins adicionales — 2026-10-19

Continúan el ciclo Q5 y la skin de Brasa (#148); no son campeones nuevos. Fuentes originales creadas con imagegen a partir de la identidad propia de cada campeón, sin donantes ajenos. Prompts exactos y fuentes RGBA editables preservados. No se inventan capas de pintura.

- Garren, Campanero de Porcelana (eslabon_porcelana, B636).
- Farolero, Guardavía de Medianoche (farolero_guardavia, B638).
- Morwen, Herbolaria de Escarcha (morwen_escarcha, B643).
- Dáriel, Luthier de los Autómatas (dariel_luthier, adicional).

Fuente → tools/factory/import-authored-sheet.py → atlas 448×1008 y preview. Las cuatro importaciones tienen 36 poses y Style Gate PASS. Cuatro direcciones: down/right/up e izquierda por espejo. Filas de ataque direccionales; cast/ultimate/muerte frontales compartidos según contrato existente. Importación no equivale a aprobación visual ni publicación.

Ajustes de encuadre respaldados por las fuentes: Farolero escala uniforme a 64px de referencia para conservar el arma extendida dentro de la celda; Dáriel mantiene 70px y usa el apoyo inferior explícito del frame 29, porque el detector automático confundía la bota con una fila superior. No se cambian tolerancias ni se recortan armas.

Checkpoint de fuentes. Próximo paso: registro cosmético, Roster Gate a escala de juego, densidad nativa, guardado, tienda, multijugador, CI y revisión visual asistida documentada. Sin aprobación humana atribuida; sin cambios de estadísticas, cuentas, infraestructura o cobros.

Escaneo técnico: alfa binaria en los cuatro atlas y cero fragmentos según el escáner. Eslabón/Farolero/Morwen/Dáriel tienen respectivamente4/2/3/3 píxeles brillantes de borde señalados por la métrica de posible halo; estos datos no se ocultan ni se sustituyen por cero. La revisión visual a escala real sigue pendiente.
