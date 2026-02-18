import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const GAME_SCENE_PATH = new URL("../../../src/scenes/GameScene.js", import.meta.url);
const GAME_RULES_PATH = new URL("../../../src/modules/module-zombite3-service/gameRules.js", import.meta.url);

async function loadSources() {
  const [scene, rules] = await Promise.all([
    readFile(GAME_SCENE_PATH, "utf8"),
    readFile(GAME_RULES_PATH, "utf8")
  ]);
  return { scene, rules };
}

// TC-5: Enforce fixed-camera gallery shooter view (no cursor-linked world movement)
test("tc_5_enforce_fixed_camera_gallery_shooter_view", async () => {
  const { scene } = await loadSources();
  assert.match(scene, /this\.background\.setPosition\(this\.center\.x, this\.center\.y\)/);
  assert.doesNotMatch(scene, /this\.center\.x - offsetX/);
  assert.doesNotMatch(scene, /this\.center\.y - offsetY/);
});

// TC-6: Validate lane-based depth, grounded characters, and contact shadows
test("tc_6_validate_lane_depth_grounding_and_shadows", async () => {
  const { scene } = await loadSources();
  assert.match(scene, /const LANES = \[/);
  assert.match(scene, /scale: 0\.7/);
  assert.match(scene, /scale: 0\.85/);
  assert.match(scene, /scale: 1/);
  assert.match(scene, /createGroundShadow\(/);
  assert.match(scene, /if \(entity\.shadow\)/);
  assert.match(scene, /if \(entity\.type === "powerup-health" \|\| entity\.type === "powerup-rescue"\)/);
});

// TC-7: Validate zombie target selection behavior and non-mouse pursuit
test("tc_7_validate_zombie_targets_civilians_not_mouse", async () => {
  const { scene } = await loadSources();
  assert.match(scene, /targetCivilianId: options\.targetCivilianId \?\? this\.chooseCivilianTargetId\(lane\.id\)/);
  assert.match(scene, /spawnAt: this\.time\.now \+ Phaser\.Math\.Between\(1000, 2000\)/);
  assert.match(scene, /if \(!target \|\| target\.type !== "civilian"\)/);
  assert.doesNotMatch(scene, /targetCivilian \?\? this\.crosshair/);
});

// TC-8: Validate consolidated damage rules and overlap priority
test("tc_8_validate_damage_rules_and_target_priority", async () => {
  const { scene, rules } = await loadSources();
  assert.match(rules, /civilianPenaltyScore: 50/);
  assert.match(rules, /civilianPenaltyLife: 15/);
  assert.match(rules, /civilianLossLife: 15/);
  assert.match(scene, /"zombie-brute": 4/);
  assert.match(scene, /"zombie-elite": 3/);
  assert.match(scene, /zombie: 2/);
  assert.match(scene, /civilian: 1/);
});

// TC-9: Validate level-specific enemy variants and brute impact
test("tc_9_validate_alpha_brute_by_level_and_brute_loss", async () => {
  const { scene } = await loadSources();
  assert.match(scene, /if \(this\.state\.level >= 3\)/);
  assert.match(scene, /zombie-elite/);
  assert.match(scene, /if \(this\.state\.level >= 5\)/);
  assert.match(scene, /zombie-brute/);
  assert.match(scene, /const maxHp = isBrute \? 6 : isElite \? 3 : 1/);
  assert.match(scene, /const lifeDamage = isBrute \? 40 : isElite \? 20 : 10/);
  assert.match(scene, /const savedPenalty = isBrute \? 2 : 0/);
});

// TC-10: Validate airborne power-up readability and effect contract
test("tc_10_validate_airborne_powerups_and_effects", async () => {
  const { scene, rules } = await loadSources();
  assert.match(scene, /const y = Phaser\.Math\.Between\(70, 170\)/);
  assert.match(scene, /type === "powerup-health" \|\| target\.type === "powerup-rescue"/);
  assert.match(rules, /healthPowerupValue: 20/);
  assert.match(rules, /rescuePowerupScore: 50/);
  assert.match(scene, /if \(entity\.shadow\) \{\n\s*entity\.shadow\.destroy\(\);\n\s*\}/);
});
