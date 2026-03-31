# UX Spec: Zombite3

## User Flows

### Screen: Embedded / Local Start State
Persona:
- Office-break player
- Host-site integrator

Entry point:
- Game loads inside an iframe or local browser window and reaches first render.

Steps:
1. Player sees game title, one-sentence objective, and primary `Start` action.
2. Player sees visible control hint: mouse aim, left click shoot, restart/pause help if enabled.
3. Player presses `Start`.
4. Overlay dismisses and active gameplay begins immediately.

Exit point:
- Active gameplay HUD is visible and the player can aim/fire without another modal step.

Error path:
- If the game container is too small to show core HUD and playfield, the player sees a blocking resize/orientation guidance state with a clear instruction to enlarge or rotate the container.
- If audio is blocked by browser autoplay policy, the game still starts visually and the player sees no blocking error; audio unlocks on first interaction.

375px behavior:
- Overlay content stacks vertically with one primary button.
- Instruction text compresses to two short lines max before wrapping.
- HUD prioritizes score, level, civilians saved/lost, and life in compact rows.

768px behavior:
- Overlay content remains centered with full instruction copy and one clear primary action.
- HUD can occupy a single top information band without covering the crosshair field.

### Screen: Active Gameplay
Persona:
- Office-break player

Entry point:
- Player has started a run or continued after a level transition.

Steps:
1. Player moves mouse and tracks crosshair position.
2. Player identifies civilians, zombies, and bunker destination.
3. Player fires at zombies and avoids civilians.
4. HUD updates score, life, level, civilians saved, civilians lost, best score, and accuracy.
5. Immediate feedback is shown for every important event: hit, kill, friendly fire, civilian loss, bunker save.

Exit point:
- Player reaches pause, level complete, or game over state.

Error path:
- If the player performs friendly fire, the game shows immediate negative visual/audio feedback and a visible score/life penalty.
- If the player is overwhelmed, the HUD and feedback still remain legible rather than collapsing into unreadable overlays.

375px behavior:
- Crosshair remains centered and unobstructed.
- HUD shifts into two compact rows with short labels.
- Toast feedback uses shorter copy and fades quickly to avoid covering the lane.

768px behavior:
- HUD can use a more spacious top-left/top-right layout while keeping center screen clear.
- Level and score context remain visible without reducing target readability.

### Screen: Pause State
Persona:
- Office-break player

Entry point:
- Player presses pause control during active gameplay.

Steps:
1. Pause overlay appears over frozen gameplay.
2. Player sees clear options: `Resume`, `Restart`.
3. Player chooses one action.

Exit point:
- `Resume` returns to active gameplay.
- `Restart` resets the run and returns to active gameplay start conditions.

Error path:
- If pause is requested during non-playable states, no duplicate modal appears.
- If input focus is lost in embedded mode, returning focus should still allow resume through primary visible action.

375px behavior:
- Buttons remain full-width and vertically stacked.

768px behavior:
- Buttons stay centered with primary action visually dominant.

### Screen: Level Complete
Persona:
- Office-break player

Entry point:
- Player satisfies the level objective.

Steps:
1. Level complete overlay appears with level number, civilians saved, civilians lost, accuracy, and bonus summary.
2. Player chooses `Next Level` or `Restart`.

Exit point:
- `Next Level` starts the next level.
- `Restart` resets current run.

Error path:
- If the player delays input, the level complete state remains stable and readable.
- If the next level cannot begin for any runtime reason, the player must still have `Restart` available.

375px behavior:
- Stats appear as stacked lines.
- `Next Level` remains the first visible action.

768px behavior:
- Summary can occupy a centered card with both actions visible without scrolling.

### Screen: Game Over
Persona:
- Office-break player

Entry point:
- Player reaches defeat condition.

Steps:
1. Game over overlay appears with reason, score, level reached, civilians saved/lost, and accuracy.
2. If the score exceeds the previous record, best-score context is visible in HUD or summary.
3. Player selects `Restart`.

Exit point:
- Restart begins a new run from the first level.

Error path:
- If local storage fails, the run still ends normally and score summary still displays even if high score cannot be persisted.

375px behavior:
- Reason and score are shown before secondary stats.

768px behavior:
- Full summary visible at once in a centered modal.

### Screen: Orientation / Container Guard
Persona:
- Office-break player
- Host-site integrator

Entry point:
- Embedded or local viewport becomes too narrow/tall for readable gameplay.

Steps:
1. Game displays blocking orientation/resize guidance.
2. User rotates device or host resizes container.
3. Gameplay becomes visible again when minimum readable layout is restored.

Exit point:
- The guard disappears automatically when the viewport becomes valid.

Error path:
- If the container remains invalid, the guard remains visible with one clear instruction and no hidden state.

375px behavior:
- Guard becomes mandatory in portrait.

768px behavior:
- Guard appears only if the playfield becomes unreadable due to unusual container constraints.

## Component Inventory

### Screen: Embedded / Local Start State
| Component | States (default/loading/error/empty/disabled) | Behavior | Nielsen heuristics applied |
| --- | --- | --- | --- |
| Start overlay container | Default: visible intro card. Loading: hidden, gameplay boot in progress. Error: shows resize/orientation or blocked-start copy. Empty: never empty; must always show objective text. Disabled: input blocked until primary button is interactive. | Presents title, objective, short instructions, and primary action without requiring outside documentation. | H1, H2, H6, H8, H10 |
| Primary `Start` button | Default: enabled. Loading: shows busy/pressed transition for ≤1s. Error: remains available after recoverable issues. Empty: not applicable. Disabled: inactive until startup state is ready. | Starts the run and dismisses the overlay. | H1, H3, H6, H7 |
| Intro instruction text | Default: concise objective and controls. Loading: unchanged. Error: replaced with corrective copy when needed. Empty: fallback line describing goal. Disabled: not applicable. | Explains the game in plain language with no technical jargon. | H2, H6, H10 |

### Screen: Active Gameplay
| Component | States (default/loading/error/empty/disabled) | Behavior | Nielsen heuristics applied |
| --- | --- | --- | --- |
| Crosshair | Default: visible and stable. Loading: hidden only before gameplay starts. Error: never replaced by browser cursor during active play. Empty: not applicable. Disabled: visual remains but shots blocked in non-active states. | Replaces cursor, remains readable over background, and signals target risk by state change or tint. | H1, H4, H6 |
| Top HUD | Default: shows score, level, life, civilians saved/lost, best score, accuracy. Loading: placeholder values before state arrives. Error: falls back to last safe values if one update fails. Empty: zeroed values at run start. Disabled: still visible in pause/game over context. | Maintains constant situational awareness without obscuring gameplay. | H1, H6, H8 |
| Toast / event feedback | Default: short event copy. Loading: not shown. Error: no generic “error”; uses action-specific negative feedback. Empty: absent when no event. Disabled: suppressed only when another modal must dominate attention. | Confirms hit, penalty, save, level state, and danger with short-lived overlays. | H1, H5, H9 |
| Civilian sprites | Default: readable protected units. Loading: hidden until spawn. Error: never use placeholder geometry in shipped state. Empty: no civilians currently on field. Disabled: no direct disabled state. | Must remain instantly distinguishable from zombies and visually vulnerable. | H2, H4, H8 |
| Zombie sprites | Default: visible threats by category. Loading: hidden until spawn. Error: never use placeholder geometry in shipped state. Empty: no current active threats. Disabled: no direct disabled state. | Must remain readable as threats and visually distinct from civilians. | H2, H4, H8 |
| Bunker / safe zone | Default: visible destination marker. Loading: hidden until scene ready. Error: if hidden, level readability is broken and build fails UX acceptance. Empty: not allowed. Disabled: not applicable. | Clearly communicates where civilians are trying to reach. | H2, H6 |

### Screen: Pause State
| Component | States (default/loading/error/empty/disabled) | Behavior | Nielsen heuristics applied |
| --- | --- | --- | --- |
| Pause modal | Default: visible with actions. Loading: not applicable. Error: fallback copy if modal content fails. Empty: not allowed. Disabled: gameplay interaction disabled behind modal. | Freezes play and offers resume/restart without ambiguity. | H1, H3, H8 |
| `Resume` button | Default: enabled. Loading: pressed transition. Error: still available after recoverable modal issues. Empty: not applicable. Disabled: only if pause cannot be exited yet. | Returns to the run immediately. | H3, H7 |
| `Restart` button | Default: enabled secondary action. Loading: pressed transition. Error: still available. Empty: not applicable. Disabled: only if restart is temporarily blocked. | Resets the run from a safe decision state. | H3, H7, H9 |

### Screen: Level Complete
| Component | States (default/loading/error/empty/disabled) | Behavior | Nielsen heuristics applied |
| --- | --- | --- | --- |
| Level complete summary card | Default: visible with stats and next actions. Loading: if transition delay exists, use brief celebratory hold. Error: fallback copy still shows level result. Empty: not allowed. Disabled: gameplay disabled behind summary. | Reports outcome clearly and prompts continuation. | H1, H2, H8 |
| `Next Level` button | Default: primary. Loading: pressed transition. Error: if next level fails, restart remains available. Empty: not applicable. Disabled: while level transition is preparing. | Starts the next level. | H3, H7, H9 |
| `Restart` button | Default: secondary. Loading: pressed transition. Error: still available. Empty: not applicable. Disabled: temporary during transition if required. | Gives control freedom without forcing continuation. | H3, H7 |

### Screen: Game Over
| Component | States (default/loading/error/empty/disabled) | Behavior | Nielsen heuristics applied |
| --- | --- | --- | --- |
| Game over summary | Default: visible with reason and score. Loading: not applicable. Error: fallback text still shows score and restart path. Empty: not allowed. Disabled: gameplay disabled behind modal. | Communicates loss cleanly and preserves record of the run. | H1, H2, H9 |
| `Restart` button | Default: enabled. Loading: pressed transition. Error: still available. Empty: not applicable. Disabled: only if reset is temporarily blocked. | Starts a new run without requiring page refresh. | H3, H7 |

### Screen: Orientation / Container Guard
| Component | States (default/loading/error/empty/disabled) | Behavior | Nielsen heuristics applied |
| --- | --- | --- | --- |
| Orientation/resize guard | Default: hidden when layout valid. Loading: not applicable. Error: visible when viewport invalid. Empty: not applicable. Disabled: not applicable. | Blocks unreadable play and explains how to recover. | H1, H5, H9 |
| Guidance text | Default: one corrective instruction. Loading: not applicable. Error: specific recovery message. Empty: not allowed when guard visible. Disabled: not applicable. | Tells user to rotate or resize instead of showing vague failure language. | H2, H9, H10 |

## Nielsen Compliance

### Embedded / Local Start State
- `H1 Visibility of system status`: the player sees a visible intro state immediately rather than a blank container.
- `H2 Match system to real world`: language focuses on protect civilians, shoot zombies, reach bunker.
- `H3 User control and freedom`: the player chooses when the session starts.
- `H6 Recognition over recall`: controls are visible before the run begins.
- `H8 Aesthetic and minimalist design`: only title, objective, and start action appear.
- `H10 Help and documentation`: onboarding is built into the first screen instead of external docs.
- Trade-off: dense embed contexts may limit copy length, so instructions must stay concise.

### Active Gameplay
- `H1 Visibility of system status`: HUD and event feedback update continuously.
- `H4 Consistency and standards`: the same action classes always produce the same feedback channels.
- `H5 Error prevention`: crosshair state and readable silhouettes reduce accidental civilian hits.
- `H6 Recognition over recall`: the player does not need to remember hidden controls or target rules.
- `H8 Aesthetic and minimalist design`: the HUD is limited to essential run information.
- Trade-off: strong feedback must remain visible without overpowering the playfield.

### Pause State
- `H1 Visibility of system status`: pause is obvious and gameplay is visibly halted.
- `H3 User control and freedom`: player can resume or restart.
- `H8 Aesthetic and minimalist design`: only the two relevant actions are shown.
- `H9 Help recover from errors`: restarting is available if the run feels unrecoverable.
- Trade-off: no tertiary options are shown to avoid slowing a short-session player.

### Level Complete
- `H1 Visibility of system status`: completion is explicit and stat-backed.
- `H3 User control and freedom`: continue or restart are both available.
- `H7 Flexibility and efficiency`: next level is primary, restart remains accessible.
- `H8 Aesthetic and minimalist design`: summary only includes level-relevant outcome data.
- `H9 Help recover from errors`: restart exists as a fallback if continuation is not desired.
- Trade-off: the summary must be concise enough to preserve session pace.

### Game Over
- `H1 Visibility of system status`: loss reason and result are explicit.
- `H2 Match system to real world`: copy describes what happened in gameplay terms rather than engine terms.
- `H3 User control and freedom`: restart is immediate.
- `H9 Help recover from errors`: the user always has a clear next action after failure.
- Trade-off: best-score celebration should not dilute clarity of defeat reason.

### Orientation / Container Guard
- `H1 Visibility of system status`: the game explicitly says why play is blocked.
- `H5 Error prevention`: invalid layout is blocked before unreadable gameplay continues.
- `H9 Help recover from errors`: message explains the exact corrective action.
- `H10 Help and documentation`: recovery guidance is contextual and immediate.
- Trade-off: blocking the game is justified because unreadable play would be a worse UX outcome.

## Character Visual Direction

### Civilians
- Role: protected units that must read as vulnerable, non-hostile, and immediately distinguishable from zombies.
- Silhouette: upright torso, cleaner posture, readable head/shoulder separation, no exaggerated claws or attack stance.
- Costume direction: office/casual urban clothing with cleaner shapes than enemies.
- Minimum variants:
  - office male
  - casual female
  - generic urban civilian
- Sprite height target:
  - gameplay render height between `48px` and `56px`
- Palette direction:
  - light blue
  - beige
  - light gray
  - soft green
  - restrained warm accents
- Visual rules:
  - civilians must look vulnerable and non-aggressive
  - silhouettes must remain readable against the corridor background
  - clothing must suggest office or urban civilian identity rather than combat roles
- Readability rule:
  - a first-time player must distinguish civilian vs zombie in under `1 second`
  - civilians must never share the same posture language as zombies

### Zombies
- Role: active threat units that must read instantly as dangerous.
- Silhouette: forward lean, broken posture, more angular limbs, more aggressive head/arm pose than civilians.
- Costume direction: damaged office/urban clothing, stronger distress and decay cues than civilians.
- Minimum variants:
  - office zombie
  - urban zombie
  - aggressive torn zombie
- Special categories:
  - normal zombie
  - elite/alpha zombie
  - brute zombie
- Sprite height target:
  - normal/elite between `48px` and `60px`
  - brute may exceed this range if needed for threat readability
- Palette direction:
  - gray-green
  - pale or sickly flesh
  - dark purple
  - dirty brown
  - desaturated gray
  - limited red details only
- Visual rules:
  - zombies must read as threatening immediately, even in peripheral vision
  - posture should be more inclined, unstable, or predatory than civilians
  - wardrobe damage and distress should be visible but remain stylistically coherent
- Readability rule:
  - enemy categories must still look like one coherent family while remaining distinguishable from civilians

### Bunker / Safe Zone
- Role: destination and visual protection anchor.
- Shape language: reinforced doorway, shelter entrance, or bunker facade that reads as safe and intentional.
- Color direction:
  - dark gray
  - industrial yellow
  - muted blue or green accents
- Readability rule:
  - the bunker must be visually identifiable as the civilian goal within `30 seconds` of the first run
  - it must not read as background decoration

### Crosshair
- Role: constant primary interaction affordance.
- Shape language: compact circular sight with visible center point and thin outer guides.
- Size target:
  - between `28px` and `36px`
- Allowed color treatments:
  - white with dark outline
  - red with lighter center
- Behavior:
  - always visible during active play
  - must remain legible over all gameplay backgrounds
  - reacts subtly on shot and can warn when hovering over civilians

## Animation Specification

### Civilian Animation Set
- Run: `6 frames`
- Death by player shot: `4 frames`
- Conversion start / infection reaction: `3 to 4 frames`
- Timing targets:
  - run loop reads cleanly at normal movement speed with no foot sliding
  - conversion feedback completes in `200ms` to `400ms`
- Visual animation notes:
  - run must communicate urgency, not combat
  - death reaction must be short and readable, not graphic
  - conversion start must clearly signal that the civilian has been lost

### Zombie Animation Set
- Walk / chase: `6 frames`
- Attack / contact: `4 frames`
- Death: `5 frames`
- Timing targets:
  - walk loop must preserve forward pressure and not feel weightless
  - death animation must resolve clearly enough that the player can confirm a kill without guessing
- Visual animation notes:
  - walk cycle should reinforce asymmetry or corrupted movement
  - attack/contact animation must clearly communicate threat escalation
  - death should not look like a simple sprite hide or fade without impact

### Brute / Elite Distinction
- Elite/alpha:
  - movement should feel sharper or more threatening than the normal zombie
  - death/hit feedback should be more pronounced than the base enemy
  - silhouette should read as a more dangerous special threat before the player shoots
- Brute:
  - movement should read heavier and slower in pose language even if pressure stays high
  - hit reaction should communicate durability and mass
  - silhouette should read as the largest and most oppressive threat class

### Conversion Animation
- Must include:
  - brief interruption of civilian normal motion
  - visible infection/change cue
  - swap into zombie state with clear readability
- Suggested effects:
  - green flash
  - infection overlay
  - posture collapse or corruption pose
  - rapid transition into zombie sprite state
- Forbidden:
  - silent instantaneous state swap with no visual explanation
- Duration:
  - `200ms` to `400ms`

### Crosshair / Shot Feedback
- Shot expansion or recoil pulse: visible within `1 frame` of the click event
- Hit confirmation: must visibly differ for zombie hit vs civilian hit
- Friendly-fire feedback must be more negative and harsher than zombie-hit feedback

### Impact / FX Timing
- Zombie hit particles / flashes: `80ms` to `180ms`
- Civilian hit negative flash: `80ms` to `180ms`
- Feedback must be readable but not obscure the target lane

## Environment Art Direction

### Background
- Style: simplified collapsed city / urban crisis backdrop
- Suggested elements:
  - background buildings
  - abandoned vehicles
  - barricades
  - subtle smoke
  - urban signage
- Composition rule:
  - the background supports gameplay readability and must not compete with sprites or HUD

### Corridor / Ground Plane
- Function: clearly define the path civilians and zombies traverse
- Suggested elements:
  - horizontal street or corridor
  - light urban texture
  - cracks, lane marks, or subtle street wear
  - soft contact shadows under characters
- Readability rule:
  - the ground must contrast enough with both civilian and zombie silhouettes to keep movement legible

## Visual Production Constraints

### Sprite Sizing
- Civilian target height: `48px` to `56px`
- Zombie target height: `48px` to `60px`
- Crosshair target size: `28px` to `36px`
- Sizes may scale in-engine for lane depth, but source sprite readability must be preserved at these base targets

### Palette Direction
- Civilians:
  - lighter, cleaner, softer palettes
- Zombies:
  - darker, dirtier, more distressed palettes
- Bunker:
  - industrial safe-zone language with stronger structural contrast than the background
- Background:
  - must support readability and never compete with target silhouettes
- Consistency rule:
  - all gameplay-critical art must read as one 2D cartoon zombie shooter product and not as a mixture of unrelated asset packs

### Asset Consistency Rules
- No placeholder circles, squares, rectangles, or temporary debug art in shipped gameplay-critical assets
- Character families must share one coherent art direction
- UI, bunker, crosshair, FX, and character sprites must feel like the same product, not mixed packs

## Audio / FX Interaction Direction

### Mandatory feedback classes
- shot fired
- zombie hit
- zombie death
- civilian hit by player
- civilian converted
- level complete
- game over
- UI confirmation

### Feedback rules
- Audio trigger begins within `100ms` of the gameplay event
- Zombie hit, zombie death, and civilian punishment must all sound distinct
- Friendly-fire sound must communicate a more negative outcome than standard shot confirmation
- Audio must remain office-safe: readable, not excessively harsh, and compatible with mute/volume control

### Ambient Audio Guidance
- Optional but recommended:
  - subtle city-chaos ambience
  - distant siren
  - restrained urban background texture
- Constraint:
  - ambience must never mask action feedback or make office playback uncomfortable

## Product Quality Gates

### Visual quality gate
- The game is not acceptable if shipped gameplay-critical art still looks like prototype geometry, rushed paint-over work, or inconsistent mixed-style assets.
- Civilian vs zombie recognition must happen in under `1 second`.
- The bunker must read as a safe goal, not decoration.
- The crosshair must remain readable on all approved gameplay backgrounds.

### Product quality gate
- The game must load quickly enough for short-break usage.
- The rules must be understandable within seconds.
- Feedback must be both visual and audio, not visual-only.
- Difficulty must escalate progressively rather than spike unpredictably.
- The overall presentation must read as a finished minigame, not a technical demo.

## Art Bible Tables

### Character Specification Table
| Entity | Role | Visual read | Base height | Variants | Core silhouette rules | Palette direction |
| --- | --- | --- | --- | --- | --- | --- |
| Civilian | Protected unit | Vulnerable, non-hostile, readable at a glance | `48px` to `56px` | Office male, Casual female, Urban generic | Upright posture, clean torso shape, readable head/shoulders, no attack pose | Light blue, beige, light gray, soft green, restrained warm accents |
| Normal zombie | Standard threat | Immediate danger, baseline infected threat | `48px` to `60px` | Office zombie, Urban zombie, Torn aggressive zombie | Forward lean, corrupted gait, darker silhouette than civilians | Gray-green, pale flesh, dirty brown, desaturated gray |
| Elite / alpha zombie | Advanced threat | Sharper, more dangerous special target | `52px` to `60px` | Alpha variant derived from zombie family | More aggressive posture, stronger contrast, visually distinct head/torso treatment | Darker green-gray base with stronger accent contrast than normal zombie |
| Brute zombie | Heavy threat | Largest, most oppressive enemy | `56px` to `68px` | Brute variant derived from zombie family | Wider frame, heavier mass, broad shoulder profile, strong threat read before motion | Muddy dark gray-green with limited red accents |
| Bunker / safe zone | Civilian destination | Obvious protection target | Dominant right-side landmark | One primary final asset | Reinforced doorway/readable shelter shape, never decorative-only | Dark gray, industrial yellow, muted blue/green accents |
| Crosshair | Primary aiming affordance | Precise, always readable | `28px` to `36px` | One final asset plus fire state | Circular sight with visible center point and thin guides | White with dark outline or red with lighter center |

### Animation Table
| Entity | Animation | Frames | Purpose | Timing / feel rule |
| --- | --- | --- | --- | --- |
| Civilian | Run | `6` | Escape toward bunker | Must read as urgent movement, not combat motion |
| Civilian | Shot death | `4` | Negative outcome from player error | Short, readable, non-graphic |
| Civilian | Conversion start | `3` to `4` | Signal infection / loss | Must complete inside `200ms` to `400ms` |
| Normal zombie | Walk / chase | `6` | Main pursuit loop | Must feel asymmetrical or corrupted, not clean athletic motion |
| Normal zombie | Attack / contact | `4` | Threat escalation on civilian contact | Must clearly communicate conversion threat |
| Normal zombie | Death | `5` | Confirm successful kill | Must not look like a silent hide/fade |
| Elite / alpha zombie | Walk / chase | `6` | Advanced pursuit loop | Must feel sharper and more threatening than normal zombie |
| Elite / alpha zombie | Attack / contact | `4` | Higher-risk threat contact | Must feel more dangerous than normal zombie contact |
| Elite / alpha zombie | Death | `5` | Confirm special enemy kill | Must feel more pronounced than normal zombie death |
| Brute zombie | Walk / chase | `6` | Heavy pursuit loop | Must read as weighty and oppressive |
| Brute zombie | Attack / contact | `4` | Heavy-impact threat contact | Must feel heavier and more punishing than elite |
| Brute zombie | Death | `5` | Confirm heavy enemy kill | Must retain sense of mass and durability |

### Conversion Table
| Step | Requirement | Timing |
| --- | --- | --- |
| Civilian motion interrupt | Civilian visibly breaks normal run pattern | Immediate |
| Infection cue | Green flash, infection overlay, or equivalent corruption signal | Begins within `1 frame` of contact resolution |
| State swap | Civilian transitions into zombie-readable state | Completes in `200ms` to `400ms` |
| Player feedback | Lost-civilian message or equivalent negative cue is visible | Same interaction or next rendered frame |

### FX / Feedback Table
| Event | Visual feedback | Audio feedback | Timing rule |
| --- | --- | --- | --- |
| Shot fired | Crosshair expansion or recoil pulse, muzzle/flash cue | Shot sound | Begins within `1 frame` / `100ms` audio |
| Zombie hit | Short hit flash or particles | Distinct zombie-hit sound | `80ms` to `180ms` visual |
| Zombie death | Stronger death burst / collapse confirmation | Zombie death sound | Immediate confirmation of kill |
| Civilian hit by player | Negative flash, distinct error cue, harsher text/state feedback | Distinct civilian damage/error sound | `80ms` to `180ms` visual, `≤100ms` audio |
| Civilian converted | Infection effect and state transition | Civilian reaction + threat cue | Conversion completes in `200ms` to `400ms` |
| Level complete | Positive celebratory cue and readable summary | Level-complete sound | Summary remains readable until user acts |
| Game over | Strong defeat state with clear reason | Game-over sound | Must not obscure final score visibility |

### Environment Table
| Element | Visual intent | Required read | Forbidden outcome |
| --- | --- | --- | --- |
| Background city | Collapsed urban atmosphere | Supports tension without reducing target clarity | Busy backdrop that hides civilians/zombies |
| Corridor / street | Main traversal lane | Clearly marks movement route and supports shadows | Flat unreadable strip with no path clarity |
| Bunker zone | Safe destination | Recognizable objective, right-edge anchor | Decorative prop mistaken for scenery |
| HUD frame | Clean readable overlay | Supports score/level/civilian counts without covering action | Oversized panels or cluttered chrome |

### Audio Table
| Audio class | Required | Office-safe rule | Control rule |
| --- | --- | --- | --- |
| Shot | Yes | Must be punchy but not harsh | Affected by master volume / mute |
| Zombie hit | Yes | Distinct from death and civilian damage | Affected by master volume / mute |
| Zombie death | Yes | Clear but not excessive | Affected by master volume / mute |
| Civilian hit | Yes | Must sound more negative than zombie hit | Affected by master volume / mute |
| Civilian reaction / conversion | Yes | Must signal loss clearly without being disturbing | Affected by master volume / mute |
| Level complete | Yes | Positive but brief | Affected by master volume / mute |
| Game over | Yes | Defeat signal without excessive harshness | Affected by master volume / mute |
| UI confirm | Yes | Short and unobtrusive | Affected by master volume / mute |
| Ambient city loop | Recommended | Must remain subtle and non-fatiguing | Must be independently reducible by master volume or mute |

## Open Visual Deliverables For Later Phases
- Exact palette hex values
- Final typography tokens
- Exact sprite sheet layout and export specs
- Final FX atlas structure
- Final mix targets and mastering constraints
