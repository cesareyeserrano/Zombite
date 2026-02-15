# Test Cases: zombite

> Traceable QA suite from backlog user stories and approved spec.

## Functional

### TC-1
- Title: Quick playable loop starts and resolves cleanly
- Trace: US-1, FR-1, AC-1
- Steps:
  1) Given a fresh game load
  2) When Start is pressed and player performs shoot/reload/pause/continue flow
  3) Then gameplay loop is immediately usable and level outcome actions stay consistent

### TC-2
- Title: Difficulty progression remains gradual up to level 10
- Trace: US-2, FR-2, AC-2
- Steps:
  1) Given baseline progression simulation and runtime level tables
  2) When level pace and HP scaling are evaluated from level 1 to 10
  3) Then pressure ramps progressively and level 10 remains reachable for medium skill

### TC-3
- Title: Alpha encounters are differentiated and progression-safe
- Trace: US-3, FR-3, AC-3
- Steps:
  1) Given levels that allow alpha spawns
  2) When alpha spawn, hp, and defeat flow are exercised
  3) Then alpha is tougher than normal zombies and run progression remains valid

### TC-4
- Title: Embed configuration accepted only when valid and allowed
- Trace: US-4, FR-4, AC-4
- Steps:
  1) Given iframe/widget host integration
  2) When host sends valid config payload from allowed origin
  3) Then config is applied safely and reflected in runtime state

## Negative / Abuse

### TC-5
- Title: Invalid schema and value payloads are rejected safely
- Trace: US-4, FR-4, AC-4
- Steps:
  1) Given embed message channel
  2) When malformed/unknown/invalid payloads are sent
  3) Then payloads are rejected and game state remains stable

### TC-6
- Title: Burst message abuse is rate-limited
- Trace: US-4, FR-4
- Steps:
  1) Given repeated invalid config messages in a short window
  2) When burst threshold is exceeded
  3) Then cooldown and telemetry controls activate without breaking gameplay

## Security

### TC-7
- Title: Origin validation blocks unauthorized postMessage senders
- Trace: US-4, FR-4
- Steps:
  1) Given host allowlist configuration
  2) When a disallowed origin sends config message
  3) Then request is blocked and no unsafe state mutation occurs

## Edge Cases

### TC-8
- Title: Session timeout and alpha level interaction resolve deterministically
- Trace: US-1, US-3, FR-1, FR-3
- Steps:
  1) Given an alpha level near session time limit
  2) When timeout occurs during active threat pressure
  3) Then outcome panel and restart/continue paths remain consistent
