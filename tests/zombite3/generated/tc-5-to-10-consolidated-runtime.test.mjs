import test from "node:test";
import assert from "node:assert/strict";

import {
  GAME_CONSTANTS,
  createInitialState,
  getDifficultyProfile,
  resolveShotTarget,
  applyShotOutcome,
  applyCivilianLostPenalty,
  applyCivilianSaved,
  buildWaveComposition,
  calculateAccuracy
} from "../../../src/modules/module-zombite3-service/index.js";

import { UI } from "../../../src/locale/ui.js";
import { AudioManager } from "../../../src/audio/AudioManager.js";

// ---------------------------------------------------------------------------
// TC-5: AudioManager can be constructed without throwing
// ---------------------------------------------------------------------------
test("tc_5_audio_manager_construction_does_not_throw", () => {
  // Provide a minimal Phaser time stub — no live AudioContext needed
  const timeStub = {
    addEvent: () => {}
  };
  const manager = new AudioManager(timeStub);
  assert.ok(manager instanceof AudioManager);
  assert.equal(manager.muted, false);
  assert.equal(manager.audioContext, null);
});

// TC-5b: AudioManager.setMuted does not throw before ensure() is called
test("tc_5b_audio_manager_set_muted_before_context_is_safe", () => {
  const manager = new AudioManager({ addEvent: () => {} });
  // setMuted before ensure() — no AudioContext — must not throw
  assert.doesNotThrow(() => manager.setMuted(true));
  assert.equal(manager.muted, true);
  assert.doesNotThrow(() => manager.setMuted(false));
  assert.equal(manager.muted, false);
});

// TC-5c: AudioManager.playSfx does not throw when no AudioContext is available
test("tc_5c_audio_manager_play_sfx_without_context_is_safe", () => {
  const manager = new AudioManager({ addEvent: () => {} });
  // No context — playSfx must return silently without throwing
  const sfxKinds = [
    "shot", "zombie-hit", "zombie-kill", "civilian-error",
    "crosshair-warning", "ui-click", "wave-alert", "danger-alert",
    "critical-alert", "civilian-scream", "powerup-positive",
    "rescue-bonus", "level-clear", "game-over"
  ];
  for (const kind of sfxKinds) {
    assert.doesNotThrow(() => manager.playSfx(kind));
  }
});

// TC-5d: AudioManager.stopAll does not throw when no nodes are active
test("tc_5d_audio_manager_stop_all_without_nodes_is_safe", () => {
  const manager = new AudioManager({ addEvent: () => {} });
  assert.doesNotThrow(() => manager.stopAll());
  assert.equal(manager.ambientNodes, null);
});

// ---------------------------------------------------------------------------
// TC-6: src/locale/ui.js exports an object with string keys
// ---------------------------------------------------------------------------
test("tc_6_ui_locale_exports_object_with_string_keys", () => {
  assert.equal(typeof UI, "object");
  assert.ok(UI !== null);
  const keys = Object.keys(UI);
  assert.ok(keys.length >= 1, "UI must export at least one key");
  for (const key of keys) {
    assert.equal(typeof UI[key], "string", `UI.${key} must be a string`);
  }
});

// TC-6b: UI exports required overlay keys
test("tc_6b_ui_locale_exports_required_overlay_keys", () => {
  const required = [
    "startTitle", "startBody", "startButton",
    "pauseTitle", "pauseContinueButton", "pauseRestartButton",
    "gameOverTitle", "gameOverRestartButton",
    "levelCompleteNextButton"
  ];
  for (const key of required) {
    assert.ok(Object.prototype.hasOwnProperty.call(UI, key), `UI must have key: ${key}`);
    assert.ok(UI[key].length > 0, `UI.${key} must be non-empty`);
  }
});

// ---------------------------------------------------------------------------
// TC-7: getDifficultyProfile returns correct shape for level 1
// ---------------------------------------------------------------------------
test("tc_7_get_difficulty_profile_level_1_returns_correct_shape", () => {
  const profile = getDifficultyProfile(1);
  assert.equal(typeof profile, "object");
  assert.ok(profile !== null);

  // Required numeric fields
  const numericFields = [
    "civilianBaseSpeed",
    "zombieChaseMultiplierMin", "zombieChaseMultiplierMax",
    "maxZombiesSimultaneous", "maxCiviliansSimultaneous",
    "spawnIntervalMinMs", "spawnIntervalMaxMs",
    "captureDistanceMultiplier",
    "friendlyFireScorePenalty", "friendlyFireLifePenalty",
    "civilianLostLifePenalty",
    "fastZombieChance"
  ];
  for (const field of numericFields) {
    assert.equal(typeof profile[field], "number", `profile.${field} must be a number at level 1`);
  }
  assert.equal(typeof profile.routeVariation, "boolean");
});

// TC-7b: getDifficultyProfile level 1 produces expected spawn interval
test("tc_7b_get_difficulty_profile_level_1_spawn_interval_is_1200_ms_minimum", () => {
  const profile = getDifficultyProfile(1);
  assert.equal(profile.spawnIntervalMinMs, 1200);
});

// ---------------------------------------------------------------------------
// TC-8: getDifficultyProfile escalates threat from level 1 to level 5
// ---------------------------------------------------------------------------
test("tc_8_get_difficulty_profile_escalates_threat_level_1_to_5", () => {
  const p1 = getDifficultyProfile(1);
  const p5 = getDifficultyProfile(5);

  // Max zombies at level 5 must be >= level 1
  assert.ok(
    p5.maxZombiesSimultaneous >= p1.maxZombiesSimultaneous,
    "Level 5 must allow at least as many simultaneous zombies as level 1"
  );
  // Fast zombie chance increases with level
  assert.ok(
    p5.fastZombieChance > p1.fastZombieChance,
    "Level 5 must have higher fast zombie chance than level 1"
  );
});

// TC-8b: getDifficultyProfile level 3 has route variation enabled
test("tc_8b_get_difficulty_profile_level_3_has_route_variation", () => {
  const profile = getDifficultyProfile(3);
  assert.equal(profile.routeVariation, true);
});

// ---------------------------------------------------------------------------
// TC-9: GAME_CONSTANTS has correct damage and scoring values
// ---------------------------------------------------------------------------
test("tc_9_game_constants_damage_and_scoring_values", () => {
  assert.equal(GAME_CONSTANTS.civilianPenaltyScore, 15);
  assert.equal(GAME_CONSTANTS.civilianPenaltyLife, 10);
  assert.equal(GAME_CONSTANTS.civilianLossLife, 10);
  assert.equal(GAME_CONSTANTS.healthPowerupValue, 20);
  assert.equal(GAME_CONSTANTS.rescuePowerupScore, 50);
  assert.equal(GAME_CONSTANTS.zombieKillScore, 10);
  assert.equal(GAME_CONSTANTS.initialLife, 100);
  assert.equal(GAME_CONSTANTS.maxLife, 100);
});

// TC-9b: GAME_CONSTANTS shot mechanics values
test("tc_9b_game_constants_shot_mechanics_values", () => {
  assert.equal(GAME_CONSTANTS.shotCooldownMs, 250);
  assert.ok(GAME_CONSTANTS.shotHitRadius > 0);
});

// ---------------------------------------------------------------------------
// TC-10: applyCivilianLostPenalty applies correct life damage
// ---------------------------------------------------------------------------
test("tc_10_apply_civilian_lost_penalty_applies_life_damage", () => {
  const initial = createInitialState();
  const next = applyCivilianLostPenalty(initial);
  assert.equal(next.life, initial.life - GAME_CONSTANTS.civilianLossLife);
  assert.equal(next.civiliansLost, initial.civiliansLost + 1);
  assert.equal(next.lastFeedback.kind, "civilian-lost");
});

// TC-10b: applyCivilianSaved increments civiliansSaved
test("tc_10b_apply_civilian_saved_increments_count", () => {
  const initial = createInitialState();
  const next = applyCivilianSaved(initial, 1);
  assert.equal(next.civiliansSaved, 1);
  // Score and life unchanged
  assert.equal(next.score, initial.score);
  assert.equal(next.life, initial.life);
});

// ---------------------------------------------------------------------------
// TC-11: buildWaveComposition returns valid composition
// ---------------------------------------------------------------------------
test("tc_11_build_wave_composition_returns_valid_structure", () => {
  const comp = buildWaveComposition(10);
  assert.equal(typeof comp, "object");
  assert.ok(comp.civilians >= 1);
  assert.ok(comp.zombies >= 1);
  assert.ok(Array.isArray(comp.queue));
  assert.equal(comp.queue.length, comp.zombies + comp.civilians);
});

// TC-11b: buildWaveComposition handles edge case of 1 spawn
test("tc_11b_build_wave_composition_min_spawns", () => {
  const comp = buildWaveComposition(1);
  assert.ok(comp.civilians >= 1);
  assert.ok(comp.zombies >= 1);
});

// ---------------------------------------------------------------------------
// TC-12: calculateAccuracy returns correct values
// ---------------------------------------------------------------------------
test("tc_12_calculate_accuracy_returns_correct_values", () => {
  assert.equal(calculateAccuracy(0, 0), 0);
  assert.equal(calculateAccuracy(10, 5), 50);
  assert.equal(calculateAccuracy(10, 10), 100);
  assert.equal(calculateAccuracy(3, 1), 33.3);
});

// ---------------------------------------------------------------------------
// TC-13: resolveShotTarget returns highest-priority entity
// ---------------------------------------------------------------------------
test("tc_13_resolve_shot_target_priority_zombie_brute_wins", () => {
  const crosshair = { x: 100, y: 100 };
  const zombie = { id: "z1", type: "zombie", x: 100, y: 100, hitRadius: 20 };
  const brute = { id: "b1", type: "zombie-brute", x: 100, y: 100, hitRadius: 20 };
  const civilian = { id: "c1", type: "civilian", x: 100, y: 100, hitRadius: 20 };
  const target = resolveShotTarget({ crosshair, entities: [civilian, zombie, brute] });
  assert.equal(target?.type, "zombie-brute");
});

// TC-13b: resolveShotTarget returns null when no entities in range
test("tc_13b_resolve_shot_target_returns_null_when_no_entities_in_range", () => {
  const crosshair = { x: 0, y: 0 };
  const far = { id: "z1", type: "zombie", x: 500, y: 500, hitRadius: 20 };
  const target = resolveShotTarget({ crosshair, entities: [far] });
  assert.equal(target, null);
});

// ---------------------------------------------------------------------------
// TC-14: applyShotOutcome zombie kill increments score and kills
// ---------------------------------------------------------------------------
test("tc_14_apply_shot_outcome_zombie_kill_increments_score", () => {
  const initial = createInitialState();
  const state = applyShotOutcome(initial, { type: "zombie" });
  assert.equal(state.score, GAME_CONSTANTS.zombieKillScore);
  assert.equal(state.kills, 1);
  assert.equal(state.life, 100);
  assert.equal(state.lastFeedback.kind, "zombie-kill");
  assert.equal(state.lastFeedback.audio, "zombie-kill");
});

// ---------------------------------------------------------------------------
// TC-15: getDifficultyProfile level 10+ produces horde parameters
// ---------------------------------------------------------------------------
test("tc_15_get_difficulty_profile_level_10_horde_parameters", () => {
  const profile = getDifficultyProfile(10);
  assert.equal(profile.maxZombiesSimultaneous, 7);
  assert.equal(profile.maxCiviliansSimultaneous, 5);
  assert.equal(profile.spawnIntervalMinMs, 1100);
  assert.equal(profile.spawnIntervalMaxMs, 1300);
});

// ---------------------------------------------------------------------------
// TC-16: createInitialState returns correct defaults
// ---------------------------------------------------------------------------
test("tc_16_create_initial_state_returns_correct_defaults", () => {
  const state = createInitialState();
  assert.equal(state.score, 0);
  assert.equal(state.life, GAME_CONSTANTS.initialLife);
  assert.equal(state.level, 1);
  assert.equal(state.kills, 0);
  assert.equal(state.civiliansSaved, 0);
  assert.equal(state.civiliansLost, 0);
  assert.equal(state.gameOver, false);
  assert.equal(state.gameOverReason, "");
  // accuracy is computed via withAccuracy on mutation functions, not in createInitialState
  assert.equal(state.shots, 0);
  assert.equal(state.hits, 0);
});

// TC-16b: createInitialState accepts overrides
test("tc_16b_create_initial_state_accepts_overrides", () => {
  const state = createInitialState({ level: 5, score: 100 });
  assert.equal(state.level, 5);
  assert.equal(state.score, 100);
  assert.equal(state.life, GAME_CONSTANTS.initialLife);
});
