# Release Notes - Zombie Rescue Runner V2

Fecha: 2026-02-18

## Resumen
Esta entrega consolida el estado V2 jugable en localhost con foco en claridad visual, protección de civiles y estabilidad técnica.

## Cambios funcionales principales
- Flujo de evacuación izquierda -> derecha hacia búnker militar visible.
- Parallax de 3 capas (cielo/nubes, ciudad, calle) con escena diurna.
- Prioridad de impacto zombie sobre civil en solapamientos.
- Cooldown de disparo de 0.25s.
- Daño por contacto según tipo:
  - Zombie normal: -10 HP
  - Zombie alfa: -20 HP
  - Bruto: -40 HP y -2 civiles salvados
- Alerta de peligro `!` a menos de 100px del civil.
- Power-ups aéreos (salud y bonus/rescate).
- High score persistente en `localStorage`.
- Guardia de orientación para solicitar landscape cuando el dispositivo está en vertical.

## Optimización
- Object pooling implementado para:
  - Visuales de zombies (sprite, sombra, barras de vida)
  - Visuales de civiles (sprite, sombra, icono de peligro)
  - Trazadores de disparo
  - Partículas de impacto y recompensa

## QA
- Suite local: `node --test` (10/10 passing).
- Verificación Aitri: `aitri verify --feature zombite3` -> `VERIFICATION PASSED`.

## Documentación vinculada
- Requerimientos técnicos consolidados: `/docs/TECH_REQUIREMENTS_ZRR.md`
- Plan de migración a Canvas API puro: `/docs/CANVAS_PURE_MIGRATION_PLAN.md`
- Inventario de assets/licencias: `/ASSETS.md`
