# Plan: zombite

STATUS: DRAFT

## 1. Intent (from approved spec)

---

# AF-SPEC: <Feature Name>

STATUS: APPROVED
## 1. Context
Quiero construir un mini juego web instalable como iframe o widget en otras páginas.

Primary actor: jugador casual
Expected outcome: Que el jugador disfrute sesiones cortas de 3 a 8 minutos, complete niveles con dificultad progresiva y pueda incrustar el juego fácilmente en cualquier sitio mediante iframe/widget.

---

(Assumptions and details will be refined during review.)

## 2. Actors
List system actors.

## 3. Functional Rules (traceable)
Use stable IDs so stories/tests can reference them.

- FR-1: <verifiable rule>
- FR-2: <verifiable rule>

## 4. Edge Cases
- <edge case>

## 5. Failure Conditions
- <failure condition>

## 6. Non-Functional Requirements
- <nfr>

## 7. Security Considerations
- Validar origen (`origin`) y esquema de mensajes `postMessage` cuando se use como iframe/widget, y sanitizar cualquier dato de configuración recibido para evitar inyección o manipulación del estado del juego.

## 8. Out of Scope
- <explicitly excluded>

## 9. Acceptance Criteria (Given/When/Then)
- AC-1: Given <context>, when <action>, then <expected>.
- AC-2: Given <context>, when <action>, then <expected>.


---

- Summary:
-
- Success looks like:
-

## 2. Scope
### In scope
-

### Out of scope
-

## 3. Product Review (Product Persona)
### Business value
-

### Success metric
-

### Assumptions to validate
-

## 4. Architecture (Architect Persona)
### Components
-

### Data flow
-

### Key decisions
-

### Risks & mitigations
-

### Observability (logs/metrics/tracing)
-

## 5. Security (Security Persona)
### Threats
-

### Required controls
-

### Validation rules
-

### Abuse prevention / rate limiting (if applicable)
-

## 6. UX/UI Review (UX/UI Persona, if user-facing)
### Primary user flow
-

### Key states (empty/loading/error/success)
-

### Accessibility baseline
-

## 7. Backlog
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

## 8. Test Cases (QA Persona)
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

## 9. Implementation Notes (Developer Persona)
- Suggested sequence:
-
- Dependencies:
-
- Rollout / fallback:
-
