// TC-1: Validate us-1 primary behavior
// Acceptance Criteria: AC-1
// AC-1: Given a running wave with at least one civilian visible, when the player left-clicks and hits that civilian, then score decreases by 50, player life decreases by 15 (or one equivalent strike as specified), and the game shows visual and audio penalty feedback immediately.
import test from "node:test";
import assert from "node:assert/strict";

import {
  fr_1_the_system_must_run_locally_with_npm_install_npm_run_dev_and_provide_a_fully_playable_fixed_camera_gallery_shooter_loop_where_each_wave_spawns_zombies_and_civilians_together_and_left_click_shots_are_resolved_from_the_crosshair_so_zombies_are_rewarded_and_civilians_are_penalized_immediately
} from "../../../src/contracts/fr-1-the-system-must-run-locally-with.js";

test("tc_1_validate_us_1_primary_behavior", async () => {
  const result = await fr_1_the_system_must_run_locally_with_npm_install_npm_run_dev_and_provide_a_fully_playable_fixed_camera_gallery_shooter_loop_where_each_wave_spawns_zombies_and_civilians_together_and_left_click_shots_are_resolved_from_the_crosshair_so_zombies_are_rewarded_and_civilians_are_penalized_immediately();

  assert.equal(result.ac1Satisfied, true);
  assert.equal(result.selectedTarget.type, "civilian");
  assert.equal(result.state.score, -50);
  assert.equal(result.state.life, 85);
  assert.equal(result.state.lastFeedback.kind, "civilian-penalty");
  assert.equal(result.state.lastFeedback.audio, "civilian-error");
});
