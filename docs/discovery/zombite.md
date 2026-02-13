# Discovery: zombite

STATUS: DRAFT

## 1. Problem Statement
Derived from approved spec:

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

Now refine: what problem are we solving and why now?

## 2. Scope
### In scope
-

### Out of scope
-

## 3. Actors & User Journeys
Actors:
-

Primary journey:
-

## 4. Architecture (Architect Persona)
- Components:
-
- Data flow:
-
- Key decisions:
-
- Risks:
-

## 5. Security (Security Persona)
- Threats:
-
- Controls required:
-
- Validation rules:
-

## 6. Backlog Outline
Epic:
-

User stories:
1.
2.
3.

## 7. Test Strategy
- Smoke tests:
-
- Functional tests:
-
- Security tests:
-
- Edge cases:
-