# ASSETS (v2.0)

Listado resumido de assets usados por Zombie Rescue Runner.  
La fuente canonica para trazabilidad exacta es [`/public/assets/manifest.json`](/Users/cesareyeserrano/Documents/PROJECTS/Drafts/Zombite3/public/assets/manifest.json).

## Personajes

| Familia | Archivos |
| --- | --- |
| Zombies base | `/public/assets/sprites/zombie-pixel.svg`, `/public/assets/sprites/zombie-pixel-step.svg`, `/public/assets/sprites/zombie-dead.svg` |
| Zombies variantes | `/public/assets/sprites/zombie-office.svg`, `/public/assets/sprites/zombie-office-step.svg`, `/public/assets/sprites/zombie-urban.svg`, `/public/assets/sprites/zombie-urban-step.svg`, `/public/assets/sprites/zombie-rager.svg`, `/public/assets/sprites/zombie-rager-step.svg` |
| Zombies especiales | `/public/assets/sprites/zombie-alpha.svg`, `/public/assets/sprites/zombie-alpha-step.svg`, `/public/assets/sprites/zombie-brute.svg`, `/public/assets/sprites/zombie-brute-step.svg` |
| Civiles base | `/public/assets/sprites/civilian-pixel.svg`, `/public/assets/sprites/civilian-pixel-step.svg`, `/public/assets/sprites/civilian-dead.svg`, `/public/assets/sprites/civilian-infected.svg` |
| Civiles variantes | `/public/assets/sprites/civilian-office.svg`, `/public/assets/sprites/civilian-office-step.svg`, `/public/assets/sprites/civilian-casual.svg`, `/public/assets/sprites/civilian-casual-step.svg`, `/public/assets/sprites/civilian-urban.svg`, `/public/assets/sprites/civilian-urban-step.svg` |

## UI y FX

| Tipo | Archivos |
| --- | --- |
| Mira y disparo | `/public/assets/sprites/crosshair-pixel.svg`, `/public/assets/sprites/muzzle-flash.svg`, `/public/assets/sprites/hit-marker.svg` |
| Powerups | `/public/assets/sprites/powerup-health.svg`, `/public/assets/sprites/powerup-rescue.svg` |

## Escenario

| Tipo | Archivos |
| --- | --- |
| Fondo principal | `/public/assets/sprites/background-city.svg` |
| Objetivo seguro | `/public/assets/sprites/safe-checkpoint.svg`, `/public/assets/sprites/safe-bunker.svg` |
| Props de corredor | `/public/assets/sprites/prop-car-wreck.svg`, `/public/assets/sprites/prop-barricade.svg`, `/public/assets/sprites/prop-evac-sign.svg` |

## Audio

| Tipo | Archivo |
| --- | --- |
| Perfil procedural | `/public/assets/audio/procedural-sfx.json` |

## Notas

- Todo el inventario visual actual usa assets locales trazados en `manifest.json`.
- El audio runtime se genera por Web Audio con apoyo del perfil procedural.
- La documentacion y el runtime deben mantenerse sincronizados cada vez que se agreguen nuevas variantes o props.

## Convencion `local://` en manifest.json

El campo `sourceUrl` en `/public/assets/manifest.json` usa el esquema `local://zombite3/original-art/...`.
Este es un esquema inventado por el proyecto — no es una URL resolvible por ningun navegador o herramienta estandar.

**Significado:** indica que el asset es arte original del proyecto (no descargado de una fuente externa).
El path despues de `local://zombite3/` es una referencia de archivo interna relativa al directorio `idea/` del proyecto.

**Validacion:** la funcion `isLocalAssetPath` en `securityPolicy.js` valida el campo `path` (que comienza con `/assets/...`),
no el campo `sourceUrl`. La proveniencia de assets externos debe documentarse en `sourceUrl` con una URL real (HTTP/S)
o con un SHA de commit. Para arte original, `local://` es aceptable pero debe estar documentado aqui.
