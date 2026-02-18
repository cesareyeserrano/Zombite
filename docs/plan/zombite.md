# Plan: zombite

STATUS: DRAFT

## 1. Intent (from approved spec)
- Retrieval mode: section-level

### Context snapshot
- Quiero construir un mini juego web instalable como iframe o widget en otras páginas.
- Primary actor: jugador casual
- Expected outcome: Que el jugador disfrute sesiones cortas de 3 a 8 minutos, complete niveles con dificultad progresiva y pueda incrustar el juego fácilmente en cualquier sitio mediante iframe/widget.

### Actors snapshot
- Jugador casual (actor primario): juega sesiones cortas y busca entretenimiento ligero.
- Sitio anfitrion: integra el juego como iframe/widget y envia configuracion controlada.

### Functional rules snapshot
- El juego debe permitir completar una partida en sesiones cortas de 3 a 8 minutos con bucle jugable inmediato (iniciar, apuntar, disparar, pasar de nivel o reiniciar).
- El juego debe incluir 10 niveles con dificultad progresiva (velocidad/cantidad de zombies y precision requerida) sin saltos bruscos imposibles.
- En niveles definidos deben aparecer zombies alfa con mayor resistencia y patron de movimiento diferenciado respecto a zombies normales.
- El juego debe poder incrustarse como iframe/widget y aceptar configuracion basica validada (por ejemplo idioma, volumen, dificultad inicial).

### Acceptance criteria snapshot
- Given un jugador casual, when inicia una partida, then entra en gameplay en pocos segundos y puede jugar una sesion corta completa.
- Given una partida en progreso, when avanza del nivel 1 al 10, then la dificultad aumenta gradualmente y se percibe retadora pero razonable.
- Given un nivel con zombie alfa, when el jugador lo enfrenta, then el alfa requiere mayor esfuerzo que un zombie normal y su derrota permite continuar.
- Given un sitio externo integra el juego via iframe/widget, when envia configuracion valida, then el juego aplica la configuracion y rechaza entradas invalidas sin romper la sesion.

### Security snapshot
- Validar origen (`origin`) y esquema de mensajes `postMessage` cuando se use como iframe/widget, y sanitizar cualquier dato de configuración recibido para evitar inyección o manipulación del estado del juego.

### Out-of-scope snapshot
- Modo multijugador en tiempo real.
- Economia in-game, tienda o microtransacciones.
- Registro de usuarios o ranking global persistente.

### Retrieval metadata
- Retrieval mode: section-level
- Retrieved sections: 1. Context, 2. Actors, 3. Functional Rules, 7. Security Considerations, 8. Out of Scope, 9. Acceptance Criteria
- Summary:
-
- Success looks like:
-

## 2. Discovery Review (Discovery Persona)
### Problem framing
- Problem stated in approved spec context
- Core rule to preserve: El juego debe permitir completar una partida en sesiones cortas de 3 a 8 minutos con bucle jugable inmediato (iniciar, apuntar, disparar, pasar de nivel o reiniciar).

### Constraints and dependencies
- Constraints: Constraints to be refined during planning
- Dependencies: Dependencies to be refined during planning

### Success metrics
- Baseline and target to be confirmed in product review

### Key assumptions
- Assumptions pending explicit validation

### Discovery rigor profile
- Discovery interview mode: deep
- Planning policy: Plan for full decomposition (explicit risks, constraints, and dependency handling).
- Follow-up gate: No extra discovery depth required before implementation unless scope changes.

## 3. Scope
### In scope
-

### Out of scope
-

## 4. Product Review (Product Persona)
### Business value
- Address user pain by enforcing: El juego debe permitir completar una partida en sesiones cortas de 3 a 8 minutos con bucle jugable inmediato (iniciar, apuntar, disparar, pasar de nivel o reiniciar).
- Secondary value from supporting rule: El juego debe incluir 10 niveles con dificultad progresiva (velocidad/cantidad de zombies y precision requerida) sin saltos bruscos imposibles.

### Success metric
- Primary KPI: Baseline and target to be confirmed in product review
- Ship only if metric has baseline and target.

### Assumptions to validate
- Assumptions pending explicit validation
- Validate dependency and constraint impact before implementation start.
- Discovery rigor policy: No extra discovery depth required before implementation unless scope changes.

## 5. Architecture (Architect Persona)
### Components
- Client or entry interface for zombite.
- Application service implementing FR traceability.
- Persistence/integration boundary for state and external dependencies.

### Data flow
- Request enters through interface layer.
- Application service validates input, enforces rules, and coordinates dependencies.
- Results are persisted and returned with deterministic error handling.

### Key decisions
- Preserve spec traceability from FR/AC to backlog/tests.
- Keep interfaces explicit to reduce hidden coupling.
- Prefer observable failure modes over silent degradation.

### Risks & mitigations
- Dependency instability risk: add timeouts/retries and fallback behavior.
- Constraint mismatch risk: validate assumptions before rollout.
- Scope drift risk: block changes outside approved spec.

### Observability (logs/metrics/tracing)
- Logs: authentication and error events with correlation IDs.
- Metrics: success rate, latency, and failure-rate by endpoint/use case.
- Tracing: end-to-end request trace across internal and external calls.

## 6. Security (Security Persona)
### Threats
-

### Required controls
-

### Validation rules
-

### Abuse prevention / rate limiting (if applicable)
-

## 7. UX/UI Review (UX/UI Persona, if user-facing)
### Primary user flow
-

### Key states (empty/loading/error/success)
-

### Accessibility baseline
-

## 8. Backlog
> Create as many epics/stories as needed. Do not impose artificial limits.

### Epics
- Epic 1:
  - Outcome:
  - Notes:
- Epic 2:
  - Outcome:
  - Notes:

### User Stories
For each story include clear Acceptance Criteria (Given/When/Then).

#### Story:
- As a <actor>, I want <capability>, so that <benefit>.
- Acceptance Criteria:
  - Given ..., when ..., then ...
  - Given ..., when ..., then ...

(repeat as needed)

## 9. Test Cases (QA Persona)
> Create as many test cases as needed. Include negative and edge cases.

### Functional
1.
2.

### Negative / Abuse
1.
2.

### Security
1.
2.

### Edge cases
1.
2.

## 10. Implementation Notes (Developer Persona)
- Suggested sequence:
-
- Dependencies:
-
- Rollout / fallback:
-
