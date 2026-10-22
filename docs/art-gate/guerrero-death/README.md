# Guerrero: componente de caída

Cuatro poses originales suplementan la muerte de la apariencia base. El maestro y las skins se preservan. La caída se comparte entre orientaciones, termina tendida y se reinicia al reanimar. Si el suplemento no está listo, sigue funcionando la caída anterior. No modifica combate, hitboxes, progresión ni datos de red.

Revisión visual asistida realizada sobre runtime-comparison.png: capucha, máscara, correas, capa verde y ambas dagas conservadas; se ajustó refH71→79 para evitar crecimiento al entrar en la caída. No se atribuye aprobación al owner. Nativo4/4 y scanner sin halos, semialfa ni fragmentos. El atlas completo de taller sigue rechazado por una métrica de sus caminatas antiguas y no se instala: ver README de la fuente.

133 comprobaciones del renderer real: cuatro orientaciones y cuatro tiempos a niveles1/39/40/60/90/99, reposo final, reanimación, segunda muerte, carga diferida, píxeles vivos idénticos, skins y seis snapshots codificados/decodificados en una segunda página. No equivale a partida en el servidor oficial. Fuente, receta y build reproducible en art-source/entregas/bloques/B003_guerrero/revision-death-v3.

Integración en main y despliegue público: pendientes. El resto de B003 sigue abierto.
