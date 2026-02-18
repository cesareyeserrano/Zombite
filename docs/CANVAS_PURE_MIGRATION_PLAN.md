# Plan de Migracion a Canvas API Puro (Futuras Fases)

Fecha: 2026-02-18

## Objetivo
Migrar el runtime de Phaser 3 a Canvas 2D puro sin perder mecánicas, balance ni legibilidad de Zombie Rescue Runner.

## Alcance funcional a preservar
- Camera fija, crosshair libre y cooldown de 0.25s.
- Evacuacion izquierda -> derecha con bunker visible.
- Prioridad de impacto zombie sobre civil.
- Tipos de enemigos (normal/alfa/bruto) y sus daños.
- Power-ups en zona aerea.
- HUD y estados (`MENU`, `PLAYING`, `PAUSE`, `GAMEOVER`).
- Persistencia de high score en `localStorage`.

## Fases

### Fase 1: Runtime base Canvas
- Crear `web/index-canvas.html` con loop `requestAnimationFrame`.
- Implementar scheduler fijo de 60 FPS y acumulador de delta.
- Adaptar input mouse/touch + normalizacion de coordenadas.

### Fase 2: Render pipeline
- Implementar renderer por capas:
  1. cielo/nubes
  2. edificios
  3. calle/acera + bunker
  4. entidades
  5. HUD/crosshair/overlays
- Integrar atlas/spritesheets para reducir draw calls y fetches.

### Fase 3: ECS ligera y pooling
- Reemplazar entidades Phaser por estructuras planas (`Float32Array` o arrays de objetos compactos).
- Mantener pooling para civiles, zombies, proyectiles/trails y particulas.
- Evitar allocs por frame y recolector agresivo.

### Fase 4: Colisiones y gameplay
- Portar hit detection, prioridad de targets y daño por tipo.
- Portar alertas de peligro y feedback visual/sonoro.

### Fase 5: UI y estado
- Portar overlays de menu, pausa, game over y orientacion.
- Mantener telemetria minima: FPS promedio, p95 frame time.

### Fase 6: QA y parity
- Suite de regresion funcional contra comportamiento Phaser.
- Validar 60 FPS en dispositivos objetivo.
- Criterio de cierre: paridad funcional >= 95% sin regresiones de controles.

## Riesgos
- Incremento de complejidad de audio/input cross-platform.
- Coste de reescritura alto frente a valor incremental inmediato.
- Necesidad de pipeline de assets mas estricto (atlas + packing).

## Recomendacion
Ejecutar migracion en rama paralela y mantener Phaser como baseline estable hasta pasar parity y performance gates.
