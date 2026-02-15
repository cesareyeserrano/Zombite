# Zombite Playtest Log

Date: 2026-02-13
Tester: Codex (pre-playtest tecnico automatizado)
Environment: Node test runner / macOS sandbox

## Round A (easy)
- Start time: N/A (simulado)
- End time: N/A (simulado)
- Duration: 04:14
- Final level reached: 10 (estimado por simulacion)
- Perceived difficulty (1-5): N/A (requiere humano)
- Notes: Dentro de ventana 3-8 min.

## Round B (normal)
- Start time: N/A (simulado)
- End time: N/A (simulado)
- Duration: 05:46
- Final level reached: 10 (estimado por simulacion)
- Perceived difficulty (1-5): N/A (requiere humano)
- Notes: Ritmo central esperado.

## Round C (hard)
- Start time: N/A (simulado)
- End time: N/A (simulado)
- Duration: 08:03
- Final level reached: 10 (estimado por simulacion)
- Perceived difficulty (1-5): N/A (requiere humano)
- Notes: Ligeramente por encima del limite estricto de 8:00 (3 segundos).

## Embed/widget checks
- Boot with `dificultadInicial`: pass (validado por smoke estatico)
- Runtime `zombite.configure`: pass (validado por smoke estatico)
- Invalid payload ignored safely: pendiente (requiere browser manual)
- Notes: contrato de config cubierto por `tests/web/zombite-smoke.test.mjs`.

## Issues found
1. Falta verificacion de percepcion humana de dificultad.
2. Falta confirmacion manual de manejo de payload invalido en runtime real.
3. Hard simulado en 08:03; revisar tolerancia en playtest humano.

## Go/No-Go
- Decision: conditional-go (pendiente playtest humano breve)
- Rationale: validacion automatizada en verde (`aitri validate ok`, smoke 6/6), pero experiencia real de dificultad requiere confirmacion manual.

---

Date: 2026-02-15
Tester: Codex (auditoria tecnica E2E)
Environment: macOS sandbox + local HTTP smoke + Aitri flow

## Round A (easy)
- Start time: N/A (simulado)
- End time: N/A (simulado)
- Duration: 04:10
- Final level reached: 10 (estimado por simulacion)
- Perceived difficulty (1-5): N/A (requiere humano)
- Notes: Dentro de ventana objetivo.

## Round B (normal)
- Start time: N/A (simulado)
- End time: N/A (simulado)
- Duration: 05:40
- Final level reached: 10 (estimado por simulacion)
- Perceived difficulty (1-5): N/A (requiere humano)
- Notes: Centro de pacing esperado.

## Round C (hard)
- Start time: N/A (simulado)
- End time: N/A (simulado)
- Duration: 07:53
- Final level reached: 10 (estimado por simulacion)
- Perceived difficulty (1-5): N/A (requiere humano)
- Notes: Dentro de ventana 3-8 min.

## Embed/widget checks
- HTTP smoke local (8081): `/web/index.html`, `/web/app.js`, `/web/styles.css`, `/web/embed-example.html` => 200/200/200/200.
- Embed contract presente en demo: `dificultadInicial`, `allowedOrigin`, `postMessage`.
- Suite automatizada: `npm run test:aitri` => 13/13 en verde.
- Verificacion de endurecimiento: cobertura para `invalid_values`, `burst_guard_armed`, `burst_blocked`, `invalidRecent`, `cooldownRemainingMs`.
- Pasos pendientes manuales en navegador real:
  1. Confirmar visualmente estado `Config rate limited` durante rafaga invalida.
  2. Confirmar percepcion humana de dificultad por ronda.
  3. Confirmar UX del embed al usar botones del host en tiempo real.

## Issues found
1. Sin fallas tecnicas bloqueantes en validacion automatizada actual.
2. Pendiente confirmacion UX/percepcion humana (no reproducible completamente desde esta sesion CLI).

## Go/No-Go
- Decision: go (tecnico) + pending-human-ux
- Rationale: `aitri policy` sin gaps, `aitri verify` en verde, `aitri go` = GO, smoke HTTP en verde; resta cierre manual UX/percepcion para auditoria final humana.
