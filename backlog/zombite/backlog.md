# Backlog: zombite

> Generated and refined from approved spec and discovery.
> Every story references Functional Rules (FR-*) and Acceptance Criteria (AC-*).

## Epics
- EP-1: Gameplay session loop and progression for short runs.
  - Trace: FR-1, FR-2, FR-3
- EP-2: Safe embed/widget integration with validated configuration.
  - Trace: FR-4

## User Stories

### US-1
- As a jugador casual, I want to start and complete a short run quickly, so that I can enjoy a full play session in 3 to 8 minutes.
- Trace: FR-1, AC-1
- Acceptance Criteria:
  - Given a fresh load, when I press Start, then gameplay starts in a few seconds with active controls.
  - Given an active run, when I reach level end or lose, then I can continue or restart without broken state.

### US-2
- As a jugador casual, I want progressive level difficulty from 1 to 10, so that challenge increases without abrupt unfair spikes.
- Trace: FR-2, AC-2
- Acceptance Criteria:
  - Given level progression, when I advance levels, then enemy pace/pressure increases gradually.
  - Given normal skill play, when I continue to high levels, then level 10 remains reachable.

### US-3
- As a jugador casual, I want alfa zombies to be visibly tougher and behaviorally distinct, so that elite encounters feel meaningful.
- Trace: FR-3, AC-3
- Acceptance Criteria:
  - Given an alpha level, when an alfa appears, then it has higher resistance than normal zombies.
  - Given alfa encounter, when I defeat it, then progression continues correctly.

### US-4
- As a sitio anfitrion integrator, I want iframe/widget config messages to be validated and safely applied, so that embedding does not break sessions or security.
- Trace: FR-4, AC-4
- Acceptance Criteria:
  - Given valid embed config, when host sends allowed payload, then game applies values (language/volume/difficulty/start level).
  - Given invalid or abusive payloads, when host sends messages, then game rejects unsafe data and keeps session stable.
