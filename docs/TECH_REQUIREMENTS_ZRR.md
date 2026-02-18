# Documento Técnico Consolidado - Zombie Rescue Runner

Fecha: 2026-02-18

## Estado de implementación

- `Implementado`: Landscape-first con aviso de rotación en vertical.
- `Implementado`: Escena diurna con nubes móviles, edificios desaturados y calle/acera con línea de contacto de pies.
- `Implementado`: Búnker militar visible a la derecha como zona segura.
- `Implementado`: Sombras ovaladas bajo entidades de suelo.
- `Implementado`: Alerta roja `!` cuando zombie está a menos de 100px del civil.
- `Implementado`: Prioridad de impacto zombie sobre civil en superposición.
- `Implementado`: Cooldown de disparo de 0.25s.
- `Implementado`: Zombie normal (1 HP), Alfa (3 HP), Bruto (6 HP).
- `Implementado`: Penalización por contacto:
  - Normal: -10 HP
  - Alfa: -20 HP
  - Bruto: -40 HP y -2 civiles salvados
- `Implementado`: Power-ups aéreos (botiquín y bonus/rescate).
- `Implementado`: Persistencia de high score en `localStorage`.
- `Implementado`: Object pooling de visuales de zombies, civiles, trazadores de disparo y partículas.

## Curva de dificultad aplicada

- Niveles 1-2: objetivo 5-8 civiles, spawn ~4.0s, solo normales.
- Niveles 3-4: objetivo 10 civiles, spawn ~3.0s, incluye Alfa.
- Nivel 5+: objetivo 15+ civiles, spawn ~2.5s (nivel 10+ ~1.2s), incluye Bruto y hordas mixtas.

## Notas de arquitectura

- El juego está implementado con Phaser 3 + Vite en esta versión.
- Se mantiene Phaser 3 como motor principal; no se migró a Canvas API puro en esta fase.
- Se aplicó optimización por pooling en runtime para reducir churn de objetos en escenas activas.
- La parte de HUD/estados visibles (`MENU`, `PLAYING`, `PAUSE`, `GAMEOVER`) está implementada por escenas/eventos de Phaser.
- Requerimiento de Canvas API puro: queda como alternativa arquitectónica futura y no fue migrado en esta iteración para evitar regresión del producto actual.
- Plan de migración documentado en `/docs/CANVAS_PURE_MIGRATION_PLAN.md`.
