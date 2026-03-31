# Zombite3 - Zombie Rescue Runner

Juego web 2D pixel art (Phaser 3 + Vite) donde civiles corren huyendo y debes protegerlos disparando a zombies.

## Requisitos

- Node.js 18+
- npm 10+

## Ejecutar en localhost

```bash
npm install
npm run dev
```

Servidor local esperado: `http://127.0.0.1:5173/`.

## Controles

| Acción | Control |
| --- | --- |
| Apuntar | Movimiento libre del mouse |
| Disparar | Click izquierdo (cooldown 0.25s) |
| Pausa/Reanudar | `ESC` |
| Reiniciar run | `R` o botón en UI |
| Siguiente nivel | Botón `NEXT LEVEL` al completar |
| Audio | Botón `Sound On/Off` |

## Loop Actual

- Crosshair libre con hit detection por posición real.
- Evacuación izquierda -> derecha hacia búnker militar visible.
- Fondo diurno en capas con parallax lateral.
- Civiles corren a zona segura y zombies aparecen después persiguiéndolos.
- Alerta de peligro `!` pulsante cuando zombie está a <100px.
- Si zombie toca civil:
  - Zombie normal: `-10 HP`
  - Zombie alfa: `-15 HP`
  - Bruto: `-20 HP`
  - Además se registra civil perdido.
- Friendly fire a civil: `-15` score, `-10 HP`, mensaje grande `FRIENDLY FIRE`.
- Power-ups voladores cada 20-40s:
  - Salud: `+20 HP` (máximo 100)
  - Rescate: `+50` score y reduce civiles perdidos en 1
- High score persistente en `localStorage` (`zrr.highScore`).
- Preferencia de audio persistente en `localStorage` (`zrr.audioMuted`).
- Game Over por `HP <= 0` o por superar límite de civiles perdidos.
- Progresión por niveles con resumen y botón `NEXT LEVEL`.
- El juego corre embebible en un contenedor `16:9` y también localmente para QA.

## Curva de dificultad implementada

- Niveles 1-2: objetivo 10 civiles, spawn ~1.2-1.8s, solo normales.
- Niveles 3-4: objetivo 10 civiles, spawn ~3.0s, aparece Zombie Alfa.
- Nivel 5+: objetivo 15+ civiles, spawn ~2.5s, aparece Bruto.
- Nivel 10+: spawn ~1.1-1.3s, hordas mixtas.

## HUD obligatorio

- Vida
- Score
- Nivel
- Civiles salvados / objetivo
- Civiles perdidos / límite
- Accuracy

## Estructura

```text
src/
  main.js
  scenes/
    BootScene.js
    GameScene.js
    UIScene.js
  modules/module-zombite3-service/
public/assets/
  sprites/
  audio/
  fonts/
README.md
ASSETS.md
```

## Scripts

- `npm run dev`: dev server localhost
- `npm run build`: build producción
- `npm run preview`: preview local
- `npm run test:aitri`: suite automatizada alineada con Aitri

## Nota técnica

El proyecto corre sobre Phaser 3 + Vite, manteniendo el producto embebible y localhost-first para desarrollo/QA.
Se implementó object pooling de visuales, trazadores de disparo y partículas para reducir churn de objetos en runtime.
