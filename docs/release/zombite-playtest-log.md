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
