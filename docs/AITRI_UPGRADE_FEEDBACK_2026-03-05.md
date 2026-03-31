# Feedback para creadores de Aitri (v1.3.1)

Fecha: 2026-03-05  
Proyecto afectado: `Zombite3`  
CLI usada: `aitri v1.3.1`

## Resumen
En un proyecto inicializado con una versión anterior, `aitri upgrade` actualizó contenido (spec/docs stamp), pero no dejó el proyecto operativo bajo el esquema actual porque no creó `aitri.config.json` ni resolvió conflictos de estructura brownfield.  
Resultado práctico: después de `upgrade`, `aitri resume` seguía bloqueando pre-planning por falta de sección `ai`.

## Pasos de reproducción
1. En proyecto legado con estructura previa (`specs/`, `docs/`, etc.), ejecutar:
   - `aitri --version` -> `1.3.1`
   - `aitri upgrade`
2. Confirmar plan con `y`.
3. Ejecutar `aitri resume`.

## Resultado esperado
Que `upgrade` deje el proyecto “ready-to-run” para el flujo actual, o que al menos ofrezca una migración guiada explícita para:
- `aitri.config.json` (incluyendo sección `ai`)
- aislamiento de rutas Aitri en brownfield (si hay conflicto)

## Resultado actual
`upgrade` aplica solo 3 migraciones de contenido:
- `ADD-REQ-SOURCE-STATEMENT`
- `CREATE-PROJECT-PROFILE`
- `NOTIFY-NEW-COMMANDS-0.5.0`

Luego, `aitri resume` muestra:
- `AI not configured — add an "ai" section to aitri.config.json before running pre-planning commands.`

Además, en este caso no se creó `.aitri/audit-findings.md` tras `aitri audit`, aunque el output indicó que debía escribirse.

## Evidencia técnica (código)
- En `cli/commands/upgrade.js`, el arreglo `MIGRATIONS` no incluye migración para:
  - crear `aitri.config.json`
  - validar/configurar `ai`
  - mover o mapear rutas brownfield
- `cli/commands/runtime-flow.js` sí bloquea pre-planning cuando falta `config.ai.provider`.
- `cli/commands/init.js` detecta conflictos brownfield y recomienda crear `aitri.config.json`, pero ese paso no está conectado con `upgrade`.

## Impacto
- Fricción en onboarding/migración de proyectos legacy.
- Percepción de “upgrade incompleto”.
- Necesidad de intervención manual posterior (como crear `aitri.config.json` y re-inicializar paths).

## Recomendaciones
1. Extender `aitri upgrade` con una migración `CREATE-OR-PATCH-AITRI-CONFIG`:
   - Si no existe `aitri.config.json`, proponer creación interactiva.
   - Si existe, validar llaves mínimas y sugerir patch.
2. Agregar en `upgrade` una fase “brownfield path strategy”:
   - Detectar conflictos y ofrecer mapear paths a `.aitri/*` automáticamente.
3. Unificar mensajes de “fix” en `doctor`/`resume` con “one-command remediation”:
   - Ejemplo: `Run: aitri upgrade --setup-config` o `aitri configure`.
4. Alinear `audit` con comportamiento real:
   - Si anuncia escritura de `.aitri/audit-findings.md`, garantizar creación del directorio/archivo o degradar a warning explícito.
5. Añadir test de regresión E2E:
   - Escenario: proyecto legacy + `upgrade` + `resume` -> no bloqueado por `ai` faltante.

## Nota final
La CLI funciona bien para migraciones de contenido, pero actualmente la experiencia de migración de esquema completo en brownfield queda partida entre `upgrade` e `init`/config manual. Centralizar eso en `upgrade` mejoraría mucho la DX.
