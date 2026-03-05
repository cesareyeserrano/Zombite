# Implementation Brief: US-4

Feature: zombite3
Story: As a Player, I want civilians to turn into zombies upon contact and have a faster game pace, so that the game is challenging and follows zombie genre tropes.
Trace: FR-INF-1

## 1. Feature Context
- Transition from a simple "despawn" on contact to a "conversion" mechanic.
- Increase spawn density and speed to reach "Commercial Fun" standards.

## 2. Acceptance Criteria
- Given a zombie touches a civilian, then the civilian must be removed and replaced by a new zombie at the same coordinates after a short delay.
- Given the wave starts, then the spawn interval must be between 1.2s and 1.8s (Level 1) to ensure constant action.
- Given a rescue, then the bunker must show a physical reaction (shake) and a centered entrance animation.

## 3. Test Cases to Satisfy
- TC-15: Validate civilian-to-zombie conversion logic.
- TC-16: Validate spawn pacing and off-screen death protection.

## 4. Quality Constraints
- Infection transformation must have visual feedback (particles/shake).
- Civilians must be protected from infection until they reach X > 30.
