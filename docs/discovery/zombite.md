# Discovery: zombite

STATUS: DRAFT

## 1. Problem Statement
Derived from approved spec retrieval snapshot:
- Retrieval mode: section-level
- Retrieved sections: 1. Context, 2. Actors, 3. Functional Rules, 7. Security Considerations, 8. Out of Scope, 9. Acceptance Criteria

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

### Security snapshot
- Validar origen (`origin`) y esquema de mensajes `postMessage` cuando se use como iframe/widget, y sanitizar cualquier dato de configuración recibido para evitar inyección o manipulación del estado del juego.

### Out-of-scope snapshot
- Modo multijugador en tiempo real.
- Economia in-game, tienda o microtransacciones.
- Registro de usuarios o ranking global persistente.

Refined problem framing:
- What problem are we solving? Problem stated in approved spec context
- Why now? Baseline and target to be confirmed in product review

## 2. Discovery Interview Summary (Discovery Persona)
- Primary users:
- Users defined in approved spec

- Jobs to be done:
- Deliver capability described in approved spec

- Current pain:
- Problem stated in approved spec context

- Constraints (business/technical/compliance):
- Constraints to be refined during planning

- Dependencies:
- Dependencies to be refined during planning

- Success metrics:
- Baseline and target to be confirmed in product review

- Assumptions:
- Assumptions pending explicit validation

- Interview mode:
- deep

## 3. Scope
### In scope
- Approved spec functional scope

### Out of scope
- Anything not explicitly stated in approved spec

## 4. Actors & User Journeys
Actors:
- Users defined in approved spec

Primary journey:
- Primary journey derived from approved spec context

## 5. Architecture (Architect Persona)
- Components:
-
- Data flow:
-
- Key decisions:
-
- Risks:
-

## 6. Security (Security Persona)
- Threats:
-
- Controls required:
-
- Validation rules:
-

## 7. Backlog Outline
Epic:
-

User stories:
1.
2.
3.

## 8. Test Strategy
- Smoke tests:
-
- Functional tests:
-
- Security tests:
-
- Edge cases:
-

## 9. Discovery Confidence
- Confidence:
-

- Reason:
-

- Evidence gaps:
-

- Handoff decision:
-
