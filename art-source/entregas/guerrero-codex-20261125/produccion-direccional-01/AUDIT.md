# Auditoría Guerrero direccional — 2026-11-25

Base auditada: `50589154cea02f255633aa1b88088b1c1f827332` (`main`).

Referencia obligatoria exacta: `assets/ui/codex/champions/guerrero.png`.
Referencia de píxel y cuerpo aprobado: `assets/sprites/champions/guerrero/codex-v1/atlas.png`.

## Estado real observado

- El cuerpo base del Códice ya está instalado y consumido por `drawCodexChampion`.
- El atlas aprobado contiene 36 cuadros: locomoción y ataque en frente/lado/espalda; lanzamiento sólo frontal; golpe frontal/lateral/trasero; caída sólo frontal.
- `assets/sprites/champions/guerrero/v3/death.png` conserva la caída histórica frontal. No se reemplazó.
- La skin autoral Nocturno conserva su atlas y su fallback. No se modificó.
- El PR abierto 309 afecta enemigos y jefes; no toca Guerrero.

## Faltante candidato

Lanzamiento y caída propios para lado/espalda del cuerpo base. Esta entrega sólo preserva fuentes nuevas; no instala atlas ni cambia consumidores.
