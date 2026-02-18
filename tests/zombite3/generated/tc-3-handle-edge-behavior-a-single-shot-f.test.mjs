// TC-3: Handle edge behavior - A single shot frame may overlap multiple entities near the crosshair (for example a civilian crossing in front of a zombie), so hit resolution priority and penalties must be deterministic and consistent
// Acceptance Criteria: none
// No AC mapped to this TC.
import test from "node:test";
import assert from "node:assert/strict";

import {
  resolveShotTarget,
  applyShotOutcome,
  createInitialState
} from "../../../src/modules/module-zombite3-service/index.js";

test("tc_3_handle_edge_behavior_a_single_shot_frame_may_overlap_multiple_entities_near_the_crosshair_for_example_a_civilian_crossing_in_front_of_a_zombie_so_hit_resolution_priority_and_penalties_must_be_deterministic_and_consistent", () => {
  const crosshair = { x: 100, y: 100 };
  const zombie = { id: "z-1", type: "zombie", x: 100, y: 100, hitRadius: 20, spawnIndex: 2 };
  const civilian = { id: "c-1", type: "civilian", x: 100, y: 100, hitRadius: 20, spawnIndex: 1 };

  for (let i = 0; i < 20; i += 1) {
    const ordered = i % 2 === 0 ? [zombie, civilian] : [civilian, zombie];
    const target = resolveShotTarget({ crosshair, entities: ordered });
    assert.equal(target?.type, "civilian");

    const state = applyShotOutcome(createInitialState(), { type: target.type });
    assert.equal(state.score, -50);
    assert.equal(state.life, 85);
    assert.equal(state.civiliansHit, 1);
  }
});
